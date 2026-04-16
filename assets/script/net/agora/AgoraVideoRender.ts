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
    private _defaultFrame: cc.SpriteFrame = null;
    private _originalScaleX: number = 1;
    private _gl: WebGLRenderingContext = null;

    // 性能优化相关
    private _glTextureID: WebGLTexture = null;  // 捕获到的 GL 纹理 ID
    private _useFastPath: boolean = false;       // 是否已切换到快速路径
    private _frameInterval: number = 0;          // 帧间隔（秒）
    private _frameAccum: number = 0;             // 帧累计时间
    private _lastLogTime: number = 0;

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

        this.node.on(cc.Node.EventType.TOUCH_END, this._onTap, this);
    }

    /** 点击触发 */
    private _onTap(): void {
        if (this._isRendering) {
            this.stopRender();
            return;
        }
        if (this.renderTarget === 'local') {
            this.renderLocalCamera();
        } else if (this.renderTarget === 'remote') {
            this.renderRemoteUser(this.remoteUid);
        }
    }

    /** 渲染本地摄像头 */
    public async renderLocalCamera(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            return this._startWithStream(stream);
        } catch (e) {
            console.error('[AgoraVideoRender] getUserMedia 失败:', e);
            return false;
        }
    }

    /** 渲染远端用户视频 */
    public async renderRemoteUser(uid: number): Promise<boolean> {
        const track = AgoraManager.Instance.getRemoteVideoTrack(uid);
        if (!track) return false;
        const stream = new MediaStream([track]);
        return this._startWithStream(stream);
    }

    /**
     * 初始化: video + canvas + 首帧纹理
     */
    private async _startWithStream(stream: MediaStream): Promise<boolean> {
        this.stopRender();
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
            await this._video.play();
        } catch (e) {
            console.error('[AgoraVideoRender] 播放失败:', e);
            this.stopRender();
            return false;
        }

        await new Promise<void>(resolve => {
            if (this._video.readyState >= 1) {
                resolve();
            } else {
                this._video.addEventListener('loadedmetadata', () => resolve(), { once: true });
            }
        });

        await new Promise<void>(resolve => setTimeout(resolve, 100));

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

        // 延迟捕获 GL 纹理 ID（需要等 CC 渲染完第一帧）
        this.scheduleOnce(() => this._tryCaptureGLID(), 0.2);
        return true;
    }

    /**
     * 尝试从 CC 纹理对象中捕获 GL 纹理 ID
     * CC 2.4.8 不同版本的内部结构不同，尝试多个路径
     */
    private _tryCaptureGLID(): void {
        if (!this._texture) return;

        const t = this._texture as any;
        // 尝试多种可能的路径
        const id = t._glID
            || (t._texture && t._texture._glID)
            || (t.getImpl && t.getImpl() && t.getImpl()._glID)
            || (t._gpuTexture && t._gpuTexture._glID)
            || null;

        if (id && this._gl) {
            this._glTextureID = id;
            this._useFastPath = true;
            console.log('[AgoraVideoRender] ✅ 捕获到 GL 纹理 ID，切换到快速模式（零分配）');
        } else {
            console.warn('[AgoraVideoRender] 未找到 GL 纹理 ID，保持核弹模式（路径:', {
                '_glID': !!t._glID,
                '_texture._glID': !!(t._texture && t._texture._glID),
                'getImpl': !!(t.getImpl && t.getImpl()),
                '_gpuTexture': !!t._gpuTexture,
            }, ')');
        }
    }

    /** 停止渲染 */
    public stopRender(): void {
        if (this._video) {
            this._video.pause();
            if (this._video.parentNode) {
                this._video.parentNode.removeChild(this._video);
            }
            this._video.srcObject = null;
            this._video = null;
        }
        if (this._stream) {
            this._stream.getTracks().forEach(t => t.stop());
            this._stream = null;
        }
        this._canvas = null;
        this._ctx = null;
        this._texture = null;
        this._spriteFrame = null;
        this._isRendering = false;
        this._useFastPath = false;
        this._glTextureID = null;

        if (this._sprite && this._defaultFrame) {
            this._sprite.spriteFrame = this._defaultFrame;
        }
        this.node.scaleX = this._originalScaleX;
        console.log('[AgoraVideoRender] 已停止渲染');
    }

    /**
     * 每帧更新:
     * - 快速模式: drawImage + gl.texImage2D（零 JS 分配，零 GL 纹理创建）
     * - 核弹模式: 新建 Texture2D + SpriteFrame（有分配，但保证可用）
     * - 帧率控制: 按 targetFps 间隔更新
     */
    update(dt: number) {
        if (!this._isRendering || !this._ctx || !this._video) return;
        if (this._video.readyState < 2) return;

        // 帧率控制
        this._frameAccum += dt;
        if (this._frameAccum < this._frameInterval) return;
        this._frameAccum = 0;

        const cw = this._canvas.width;
        const ch = this._canvas.height;

        // 画视频帧到 Canvas（裁剪中心 480x480 区域，保持正方形比例）
        this._ctx.drawImage(this._video, 80, 0, 480, 480, 0, 0, cw, ch);

        // ============ 快速模式: 直接 GL 上传，零分配 ============
        if (this._useFastPath && this._glTextureID && this._gl) {
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._glTextureID);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._canvas);
            return;
        }

        // ============ 核弹模式: 新建纹理 + 帧画面 ============
        // 清理旧 GL 纹理
        if (this._texture) {
            const oldID = (this._texture as any)._glID;
            if (oldID && this._gl) {
                this._gl.deleteTexture(oldID);
            }
        }

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

        // 核弹模式下持续尝试捕获 GL ID
        if (!this._useFastPath) {
            this._tryCaptureGLID();
        }

        // 状态日志
        const now = Date.now();
        if (now - this._lastLogTime > 5000) {
            this._lastLogTime = now;
            console.log('[AgoraVideoRender]', this._useFastPath ? '快速模式' : '核弹模式',
                'time:', this._video.currentTime.toFixed(2));
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTap, this);
        this.stopRender();
    }
}
