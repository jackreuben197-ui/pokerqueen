/**
 * 声网视频渲染组件
 * 挂载到 cc.Sprite 节点上，点击后开始渲染视频，显示默认图片
 *
 * 渲染链路: video → canvas → cc.Texture2D → cc.SpriteFrame → cc.Sprite
 * 性能优化:
 *   - 首帧用核弹模式（新建纹理）启动渲染并捕获 GL 纹理 ID
 *   - 后续帧直接通过 gl.texImage2D 上传，零分配
 *   - 帧率控制，默认 30fps
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
    private _ownsStream: boolean = false;  // true = 本地流，需要 stop track; false = 远端流，不 stop
    private _defaultFrame: cc.SpriteFrame = null;
    private _originalScaleX: number = 1;
    private _gl: WebGLRenderingContext = null;

    // 性能优化相关
    private _glTextureID: WebGLTexture = null;  // 捕获到的 GL 纹理 ID
    private _useFastPath: boolean = false;       // 是否已切换到快速路径
    private _frameInterval: number = 0;          // 帧间隔（秒）
    private _frameAccum: number = 0;             // 帧累计时间
    private _lastLogTime: number = 0;
    private _glCaptureLogged: boolean = false;
    private _glSearchAttempts: number = 0;
    private static readonly MAX_GL_SEARCH = 5;

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

    /** 用已有的 MediaStreamTrack 渲染（通用方法） */
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
     * 初始化: video + canvas + 首帧纹理
     */
    private async _startWithStream(stream: MediaStream): Promise<boolean> {
        console.log('[AgoraVideoRender] _startWithStream 开始, stream tracks:', stream.getTracks().length);
        this.stopRender();
        this._isCancelled = false;
        this._stream = stream;
        this._useFastPath = false;
        this._glTextureID = null;
        this._frameAccum = 0;

        // 1. 创建 video（1px 可见，防止浏览器停止解码）
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

        if (this._isCancelled) { console.log('[AgoraVideoRender] play后已取消'); this._releaseResources(); return false; }

        await new Promise<void>((resolve) => {
            if (this._video.readyState >= 1) {
                resolve();
            } else {
                const onMeta = () => { resolve(); };
                this._video.addEventListener('loadedmetadata', onMeta, { once: true });
                setTimeout(() => { this._video.removeEventListener('loadedmetadata', onMeta); resolve(); }, 3000);
            }
        });
        console.log('[AgoraVideoRender] metadata 就绪, readyState:', this._video.readyState, 'videoSize:', this._video.videoWidth, 'x', this._video.videoHeight);

        if (this._isCancelled) { console.log('[AgoraVideoRender] metadata后已取消'); this._releaseResources(); return false; }

        await new Promise<void>(resolve => setTimeout(resolve, 100));

        if (this._isCancelled) { console.log('[AgoraVideoRender] 100ms后已取消'); this._releaseResources(); return false; }

        const vw = this._video.videoWidth;
        const vh = this._video.videoHeight;

        // 2. Canvas 对齐 Sprite 大小
        const nodeSize = this.node.getContentSize();
        const cw = nodeSize.width || vw;
        const ch = nodeSize.height || vh;

        this._canvas = document.createElement('canvas');
        this._canvas.width = cw;
        this._canvas.height = ch;
        this._ctx = this._canvas.getContext('2d');
        this._ctx.drawImage(this._video, 80, 0, 480, 480, 0, 0, cw, ch);

        // 3. 首帧纹理
        this._texture = new cc.Texture2D();
        this._texture.initWithElement(this._canvas as any);
        this._texture.packable = false;

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

        // 首帧立即触发 GL 纹理创建，并尝试捕获 ID 切换到快速模式
        if (typeof this._texture.handleLoadedTexture === 'function') {
            this._texture.handleLoadedTexture();
        }
        this._tryCaptureGLID();
        return true;
    }

    /**
     * 尝试从 CC 纹理对象中捕获 GL 纹理 ID
     * CC 2.4.8 不同版本的内部结构不同，尝试多个路径 + 暴力搜索兜底
     */
    private _tryCaptureGLID(): void {
        if (!this._texture || !this._gl) return;

        const t = this._texture as any;
        let id: any = null;

        // CC 2.4.8 已知路径
        if (t._glID != null) id = t._glID;
        else if (t._texture && t._texture._glID != null) id = t._texture._glID;
        else if (t.getImpl && t.getImpl()) {
            const impl = t.getImpl();
            if (impl._glID != null) id = impl._glID;
            else if (impl._texture && impl._texture._glID != null) id = impl._texture._glID;
        }
        else if (t._gpuTexture && t._gpuTexture._glID != null) id = t._gpuTexture._glID;

        // 兜底: 暴力搜索 WebGLTexture 对象（最多尝试 N 次，避免持续拖性能）
        if (id == null && this._glSearchAttempts < AgoraVideoRender.MAX_GL_SEARCH) {
            this._glSearchAttempts++;
            id = this._findWebGLTexture(t, 3);
        }

        if (id != null) {
            this._glTextureID = id;
            this._useFastPath = true;
            console.log('[AgoraVideoRender] ✅ 捕获到 GL 纹理 ID，切换到快速模式（零分配）');
        } else if (!this._glCaptureLogged) {
            this._glCaptureLogged = true;
            console.warn('[AgoraVideoRender] 未找到 GL 纹理 ID，使用普通模式（复用 Texture2D，不会闪退）');
            console.warn('[AgoraVideoRender] Texture 属性:', Object.keys(t).join(', '));
            if (t._texture) console.warn('[AgoraVideoRender] _texture 属性:', Object.keys(t._texture).join(', '));
        }
    }

    /** 递归搜索对象中的 WebGLTexture（最多 depth 层） */
    private _findWebGLTexture(obj: any, depth: number): any {
        if (!obj || depth <= 0) return null;
        try {
            for (const key of Object.keys(obj)) {
                const val = obj[key];
                if (val instanceof WebGLTexture) return val;
                if (typeof val === 'object' && val !== null && !(val instanceof cc.Node) && !(val instanceof HTMLElement)) {
                    const found = this._findWebGLTexture(val, depth - 1);
                    if (found) return found;
                }
            }
        } catch (_) { }
        return null;
    }

    /** 停止渲染，释放所有资源，恢复默认头像 */
    public stopRender(): void {
        this._isCancelled = true;
        this._isRendering = false;
        this._releaseResources();
    }

    /**
     * 安全释放所有视频资源
     * - 本地流（_ownsStream=true）：stop track 关闭摄像头
     * - 远端流（_ownsStream=false）：仅 detach，不动 Agora 管理的 track
     * - 始终释放 canvas/texture/GL 纹理，恢复默认头像
     */
    private _releaseResources(): void {
        // 1. 释放 video 元素
        if (this._video) {
            try {
                this._video.pause();
            } catch (_) { /* ignore */ }
            if (this._video.parentNode) {
                this._video.parentNode.removeChild(this._video);
            }
            this._video.srcObject = null;
            this._video = null;
        }

        // 2. 释放 stream（仅本地流才 stop track）
        if (this._stream) {
            if (this._ownsStream) {
                try {
                    this._stream.getTracks().forEach(t => t.stop());
                } catch (_) { /* ignore */ }
            }
            // 远端流只断开引用，不 stop track（Agora 管生命周期）
            this._stream = null;
        }
        this._ownsStream = false;

        // 3. 释放 GL 纹理（快速模式）
        if (this._glTextureID && this._gl) {
            try {
                this._gl.deleteTexture(this._glTextureID);
            } catch (_) { /* ignore */ }
            this._glTextureID = null;
        }

        // 4. 释放 Cocos 资源
        this._canvas = null;
        this._ctx = null;
        this._texture = null;
        this._spriteFrame = null;
        this._useFastPath = false;
        this._frameAccum = 0;
        this._glCaptureLogged = false;
        this._glSearchAttempts = 0;

        // 5. 恢复默认头像
        this._restoreDefaultFrame();
    }

    /** 恢复默认头像（防御性） */
    private _restoreDefaultFrame(): void {
        try {
            if (this._sprite && this._defaultFrame) {
                this._sprite.spriteFrame = this._defaultFrame;
            }
            if (this.node && this.node.isValid) {
                this.node.scaleX = this._originalScaleX;
            }
        } catch (_) { /* ignore - node may be destroyed */ }
    }

    /**
     * 每帧更新（带防御性 try-catch，防止清理时崩溃）
     */
    update(dt: number) {
        if (!this._isRendering || !this._ctx || !this._video) return;
        if (this._isCancelled) {
            this._isRendering = false;
            return;
        }
        if (this._video.readyState < 2) return;

        // 帧率控制
        this._frameAccum += dt;
        if (this._frameAccum < this._frameInterval) return;
        this._frameAccum = 0;

        try {
            this._renderFrame();
        } catch (e) {
            // 视频元素可能在渲染中被清理，静默处理避免卡死
            console.warn('[AgoraVideoRender] 渲染帧异常，停止渲染:', (e as Error).message);
            this.stopRender();
        }
    }

    /** 单帧渲染 */
    private _renderFrame(): void {
        const cw = this._canvas.width;
        const ch = this._canvas.height;

        // 画视频帧到 Canvas
        this._ctx.drawImage(this._video, 80, 0, 480, 480, 0, 0, cw, ch);

        // ============ 快速模式: 直接 GL 上传，零分配 ============
        if (this._useFastPath && this._glTextureID && this._gl) {
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTextureID);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._canvas);
            return;
        }

        // ============ 普通模式: 复用现有 Texture2D，仅更新像素数据 ============
        // 关键：不创建新的 Texture2D / SpriteFrame，避免内存泄漏导致闪退
        if (this._texture) {
            this._texture.initWithElement(this._canvas as any);
            if (typeof this._texture.handleLoadedTexture === 'function') {
                this._texture.handleLoadedTexture();
            }
        }

        // 尝试捕获 GL 纹理 ID，切换到快速模式
        if (!this._useFastPath) {
            this._tryCaptureGLID();
        }

        // 状态日志（节流）
        const now = Date.now();
        if (now - this._lastLogTime > 10000) {
            this._lastLogTime = now;
            console.log('[AgoraVideoRender]', this._useFastPath ? '快速模式' : '普通模式',
                'time:', this._video.currentTime.toFixed(2));
        }
    }

    onDestroy() {
        this.stopRender();
    }
}
