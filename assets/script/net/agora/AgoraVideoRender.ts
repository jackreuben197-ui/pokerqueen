/**
 * 声网视频渲染组件
 * 挂载到 cc.Sprite 节点上，将视频流渲染到头像位置
 *
 * 渲染链路: video → canvas → cc.Texture2D → cc.SpriteFrame → cc.Sprite
 *
 * CC 2.4.8 的 handleLoadedTexture 会跳过已加载纹理的重新上传，
 * 因此每帧需重置纹理的 GL 状态（_glID / _loaded），强制 CC 完整上传新帧。
 * Texture2D / SpriteFrame 只创建一次，永远复用。
 *
 * 编辑器配置:
 *   renderTarget: local = 本地摄像头, remote = 远端用户
 *   remoteUid:    renderTarget 为 remote 时，指定远端用户 UID
 *   mirror:       镜像显示（本地摄像头建议开启）
 *   targetFps:    目标帧率
 */
import AgoraManager from "./AgoraManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AgoraVideoRender extends cc.Component {

    @property({
        tooltip: '点击时渲染的目标: local=本地摄像头, remote=远端用户'
    })
    renderTarget: string = 'local';

    @property({
        tooltip: '远端用户 UID（仅 renderTarget=remote 时生效）',
        visible: function (this: any) { return this.renderTarget === 'remote'; }
    })
    remoteUid: number = 0;

    @property({ tooltip: '镜像显示（本地摄像头建议开启）' })
    mirror: boolean = false;

    @property({ tooltip: '目标帧率（视频聊天 15-30 够用）' })
    targetFps: number = 30;

    private _video: HTMLVideoElement = null;
    private _canvas: HTMLCanvasElement = null;
    private _ctx: CanvasRenderingContext2D = null;
    private _texture: cc.Texture2D = null;
    private _spriteFrame: cc.SpriteFrame = null;
    private _sprite: cc.Sprite = null;
    private _stream: MediaStream = null;
    private _isRendering: boolean = false;
    private _isCancelled: boolean = false;
    private _ownsStream: boolean = false;
    private _defaultFrame: cc.SpriteFrame = null;
    private _originalScaleX: number = 1;
    private _gl: WebGLRenderingContext = null;
    private _frameInterval: number = 0;
    private _frameAccum: number = 0;
    private _lastLogTime: number = 0;
    /** 渲染异常或被停止时的回调，上层借此同步 UI 状态 */
    public onRenderStopped: (() => void) | null = null;

    /** 是否正在渲染 */
    public get isRendering(): boolean {
        return this._isRendering;
    }

    onLoad() {
        this._sprite = this.getComponent(cc.Sprite);
        if (!this._sprite) {
            this._sprite = this.addComponent(cc.Sprite);
        }
        this._defaultFrame = this._sprite.spriteFrame;
        this._originalScaleX = this.node.scaleX;
        this._gl = (cc.game as any)._renderContext;
        this._frameInterval = 1 / this.targetFps;
    }

    /** 渲染本地摄像头（通过 Agora 已创建的 track，不重复开摄像头） */
    public async renderLocalCamera(): Promise<boolean> {
        try {
            const track = await AgoraManager.Instance.getLocalVideoTrack();
            if (!track) {
                console.error('[AgoraVideoRender] 获取 Agora 本地视频Track失败');
                return false;
            }
            this._ownsStream = true;
            return this._startWithStream(new MediaStream([track]));
        } catch (e) {
            console.error('[AgoraVideoRender] 渲染本地摄像头失败:', e);
            return false;
        }
    }

    /** 用已有的 MediaStreamTrack 渲染 */
    public async renderFromTrack(track: MediaStreamTrack): Promise<boolean> {
        if (!track) {
            console.error('[AgoraVideoRender] track 为空');
            return false;
        }
        return this._startWithStream(new MediaStream([track]));
    }

    /** 渲染远端用户视频 */
    public async renderRemoteUser(uid: number): Promise<boolean> {
        console.log('[AgoraVideoRender] renderRemoteUser, uid:', uid);
        const track = AgoraManager.Instance.getRemoteVideoTrack(uid);
        if (!track) {
            console.warn('[AgoraVideoRender] 远端视频Track为空, uid:', uid);
            return false;
        }
        return this._startWithStream(new MediaStream([track]));
    }

    /**
     * 初始化: video + canvas + 纹理（只创建一次）
     */
    private async _startWithStream(stream: MediaStream): Promise<boolean> {
        console.log('[AgoraVideoRender] _startWithStream 开始, stream tracks:', stream.getTracks().length);
        this.stopRender();
        this._isCancelled = false;
        this._stream = stream;
        this._frameAccum = 0;

        // 1. 创建 video 元素
        this._video = document.createElement('video');
        this._video.setAttribute('playsinline', '');
        this._video.setAttribute('autoplay', '');
        this._video.muted = true;
        this._video.style.position = 'fixed';
        this._video.style.bottom = '0';
        this._video.style.right = '0';
        this._video.style.width = '1px';
        this._video.style.height = '1px';
        this._video.style.zIndex = '-9999';
        this._video.style.pointerEvents = 'none';
        document.body.appendChild(this._video);
        this._video.srcObject = stream;

        try {
            await Promise.race([
                this._video.play(),
                new Promise<void>((_, reject) => setTimeout(() => reject(new Error('play timeout')), 5000)),
            ]);
            console.log('[AgoraVideoRender] play() 成功');
        } catch (e: any) {
            if (this._isCancelled) { console.log('[AgoraVideoRender] play后已取消'); return false; }
            console.warn('[AgoraVideoRender] play失败或超时:', e?.message || e);
            this.stopRender();
            return false;
        }

        if (this._isCancelled) { this._releaseResources(); return false; }

        await new Promise<void>((resolve) => {
            if (this._video.readyState >= 1) { resolve(); }
            else {
                const onMeta = () => { resolve(); };
                this._video.addEventListener('loadedmetadata', onMeta, { once: true });
                setTimeout(() => { this._video.removeEventListener('loadedmetadata', onMeta); resolve(); }, 3000);
            }
        });
        console.log('[AgoraVideoRender] metadata 就绪, readyState:', this._video.readyState,
            'videoSize:', this._video.videoWidth, 'x', this._video.videoHeight);

        if (this._isCancelled) { this._releaseResources(); return false; }

        await new Promise<void>(resolve => setTimeout(resolve, 100));
        if (this._isCancelled) { this._releaseResources(); return false; }

        const vw = this._video.videoWidth || 240;
        const vh = this._video.videoHeight || 240;

        // 2. Canvas 对齐 Sprite 节点大小
        const nodeSize = this.node.getContentSize();
        const cw = nodeSize.width || vw;
        const ch = nodeSize.height || vh;

        this._canvas = document.createElement('canvas');
        this._canvas.width = cw;
        this._canvas.height = ch;
        this._ctx = this._canvas.getContext('2d');

        // 首帧绘制
        const cropSize = Math.min(vw, vh);
        const cropX = (vw - cropSize) / 2;
        const cropY = (vh - cropSize) / 2;
        this._ctx.drawImage(this._video, cropX, cropY, cropSize, cropSize, 0, 0, cw, ch);

        // 3. 创建 Texture2D + SpriteFrame（整个生命周期只创建这一次）
        this._texture = new cc.Texture2D();
        this._texture.initWithElement(this._canvas as any);
        this._texture.packable = false;
        this._texture.handleLoadedTexture();

        this._spriteFrame = new cc.SpriteFrame();
        (this._spriteFrame as any).initWithTexture(
            this._texture,
            cc.rect(0, 0, cw, ch),
            false,
            cc.v2(0, 0),
            cc.size(cw, ch)
        );
        this._sprite.spriteFrame = this._spriteFrame;

        if (this.mirror) {
            this.node.scaleX = -Math.abs(this._originalScaleX);
        }

        this._isRendering = true;
        console.log('[AgoraVideoRender] 开始渲染, canvas:', cw, 'x', ch, 'fps:', this.targetFps);
        return true;
    }

    /** 停止渲染，释放所有资源，恢复默认头像 */
    public stopRender(): void {
        const wasRendering = this._isRendering;
        this._isCancelled = true;
        this._isRendering = false;
        this._releaseResources();
        // 通知上层渲染已停止（仅在实际渲染中停止时通知）
        if (wasRendering && this.onRenderStopped) {
            try { this.onRenderStopped(); } catch (_) { }
        }
    }

    private _releaseResources(): void {
        // 1. video
        if (this._video) {
            try { this._video.pause(); } catch (_) { }
            if (this._video.parentNode) this._video.parentNode.removeChild(this._video);
            this._video.srcObject = null;
            this._video = null;
        }

        // 2. stream
        if (this._stream) {
            if (this._ownsStream) {
                try { this._stream.getTracks().forEach(t => t.stop()); } catch (_) { }
            }
            this._stream = null;
        }
        this._ownsStream = false;

        // 3. Texture2D + SpriteFrame
        if (this._texture) {
            this._deleteGLTextures(this._texture);
            this._texture.destroy();
            this._texture = null;
        }
        if (this._spriteFrame) {
            this._spriteFrame.destroy();
            this._spriteFrame = null;
        }

        // 4. Canvas
        this._canvas = null;
        this._ctx = null;
        this._frameAccum = 0;

        // 5. 恢复默认头像
        this._restoreDefaultFrame();
    }

    /** 删除 Texture2D 内部所有 GL 纹理 */
    private _deleteGLTextures(tex: cc.Texture2D): void {
        if (!tex || !this._gl) return;
        try {
            const t = tex as any;
            if (t._glID) this._gl.deleteTexture(t._glID);
            if (t._texture?._glID) this._gl.deleteTexture(t._texture._glID);
            if (t.getImpl) {
                const impl = t.getImpl();
                if (impl?._glID) this._gl.deleteTexture(impl._glID);
                if (impl?._texture?._glID) this._gl.deleteTexture(impl._texture._glID);
            }
            if (t._gpuTexture?._glID) this._gl.deleteTexture(t._gpuTexture._glID);
        } catch (_) { }
    }

    private _restoreDefaultFrame(): void {
        try {
            if (this._sprite && this._defaultFrame) {
                this._sprite.spriteFrame = this._defaultFrame;
            }
            if (this.node && this.node.isValid) {
                this.node.scaleX = this._originalScaleX;
            }
        } catch (_) { }
    }

    update(dt: number) {
        if (!this._isRendering || !this._ctx || !this._video) return;
        if (this._isCancelled) { this._isRendering = false; return; }

        if (this._video.paused && this._video.srcObject) {
            this._video.play().catch(() => {});
        }

        if (this._video.readyState < 2) return;

        this._frameAccum += dt;
        if (this._frameAccum < this._frameInterval) return;
        this._frameAccum = 0;

        try {
            this._renderFrame();
        } catch (e) {
            console.warn('[AgoraVideoRender] 渲染帧异常:', (e as Error).message);
            this.stopRender();
        }
    }

    /** 单帧渲染 */
    private _renderFrame(): void {
        const cw = this._canvas.width;
        const ch = this._canvas.height;

        // 动态居中裁剪
        const vw = this._video.videoWidth || 240;
        const vh = this._video.videoHeight || 240;
        const cropSize = Math.min(vw, vh);
        const cropX = (vw - cropSize) / 2;
        const cropY = (vh - cropSize) / 2;
        this._ctx.drawImage(this._video, cropX, cropY, cropSize, cropSize, 0, 0, cw, ch);

        // CC 2.4.8 renderer 层缓存了纹理映射，reset _glID/_loaded 不够。
        // 唯一可靠方案：每帧 new Texture2D + SpriteFrame，强制走完整上传。
        const oldTex = this._texture;
        const oldFrame = this._spriteFrame;

        this._texture = new cc.Texture2D();
        this._texture.initWithElement(this._canvas as any);
        this._texture.packable = false;
        this._texture.handleLoadedTexture();

        this._spriteFrame = new cc.SpriteFrame();
        (this._spriteFrame as any).initWithTexture(
            this._texture,
            cc.rect(0, 0, cw, ch),
            false,
            cc.v2(0, 0),
            cc.size(cw, ch)
        );
        this._sprite.spriteFrame = this._spriteFrame;

        // 延迟清理旧资源：确保新帧已提交到 GPU 后再销毁旧纹理，
        // 避免 CC 2.4.8 异步 GL 资源回收误伤刚创建的新帧
        if (oldTex || oldFrame) {
            setTimeout(() => {
                try {
                    if (oldTex) {
                        this._deleteGLTextures(oldTex);
                        oldTex.destroy();
                    }
                    if (oldFrame) { oldFrame.destroy(); }
                } catch (_) { }
            }, 0);
        }

        const now = Date.now();
        if (now - this._lastLogTime > 10000) {
            this._lastLogTime = now;
            console.log('[AgoraVideoRender] time:', this._video.currentTime.toFixed(2));
        }
    }

    onDestroy() {
        this.stopRender();
    }
}
