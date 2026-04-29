/**
 * 声网 Agora RTC 管理器
 * 封装 Agora Web SDK，提供音视频通话能力
 */
import { WebMiscAgoraToken } from "../https/web_request/WebRequestMisc";
import { WWW } from "../https/WebRequestBase";

export default class AgoraManager {

    private static _instance: AgoraManager = null;
    public static get Instance(): AgoraManager {
        if (!this._instance) {
            this._instance = new AgoraManager();
        }
        return this._instance;
    }

    // ==================== 配置项 ====================
    /** 声网 App ID */
    public appId: string = 'da91afd18fa84618bee90c5468b06a5f';
    // =========================================================

    private _client: any = null;
    private _localAudioTrack: any = null;
    private _localVideoTrack: any = null;
    private _joined: boolean = false;
    private _channelName: string = '';
    private _uid: number = 0;

    /** 远端用户加入回调 */
    public onUserJoined: (uid: number) => void = null;
    /** 远端用户离开回调 */
    public onUserLeft: (uid: number) => void = null;
    /** 远端音频轨道回调 */
    public onRemoteAudio: (uid: number, track: any) => void = null;
    /** 远端视频轨道回调 */
    public onRemoteVideo: (uid: number, track: any) => void = null;
    /** 错误回调 */
    public onError: (err: any) => void = null;

    private constructor() {}

    /** Agora SDK 是否已加载 */
    public get isSDKReady(): boolean {
        return !!(window as any).AgoraRTC;
    }

    /** 是否已加入频道 */
    public get isJoined(): boolean {
        return this._joined;
    }

    /** 当前频道名 */
    public get channelName(): string {
        return this._channelName;
    }

    /** 当前 UID */
    public get uid(): number {
        return this._uid;
    }

    /** 获取原生 Agora Client（高级用法） */
    public get client(): any {
        return this._client;
    }

    /**
     * 初始化 Agora Client
     * 必须在 SDK 加载完成后调用
     */
    public init(): void {
        if (!this.isSDKReady) {
            console.error('[AgoraManager] SDK 未加载，无法初始化');
            return;
        }
        if (this._client) {
            console.log('[AgoraManager] 已初始化，跳过');
            return;
        }
        const AgoraRTC = (window as any).AgoraRTC;
        this._client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
        this._registerEvents();
        console.log('[AgoraManager] Client 初始化完成');
        this.checkAppId();
    }

    /**
     * 从服务器 API 获取 Agora Token
     * @param channel 频道名
     * @param uid 用户 ID
     */
    public async fetchToken(channel: string, uid: number = 0): Promise<string | null> {
        try {
            const response = await WWW.Instance.CommonAPI({
                web_class: WebMiscAgoraToken,
                body: {
                    channel_name: channel,
                    role: 1, // 1=发布者
                    uid: uid,
                },
            });
            const token = response?.data;
            if (!token) {
                console.error('[AgoraManager] Token 响应数据为空:', response);
                return null;
            }
            console.log('[AgoraManager] Token 获取成功, channel:', channel, 'uid:', uid);
            return token;
        } catch (e: any) {
            console.error('[AgoraManager] Token 获取失败:', e?.message || e);
            return null;
        }
    }

    /**
     * 检测 appId + Token 服务是否正常
     * 流程: 请求Token → 加入测试频道 → 离开
     */
    public async checkAppId(): Promise<boolean> {
        console.log('========== [AgoraManager] 开始检测 AppId 有效性 ==========');
        console.log('[AgoraManager] AppId:', this.appId);
        console.log('[AgoraManager] SDK 版本:', (window as any).AgoraRTC.VERSION);

        if (!this._client) {
            console.error('[AgoraManager] Client 未初始化，无法检测');
            return false;
        }

        const testChannel = '__appid_test_' + Date.now();
        const testClient = (window as any).AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });

        // 第1步：从本地服务获取 Token
        console.log('[AgoraManager] 第1步: 请求本地Token服务...');
        const token = await this.fetchToken(testChannel, 0);
        if (!token) {
            console.log('========== [AgoraManager] AppId 检测失败 ❌ (Token服务不可用) ==========');
            return false;
        }
        console.log('[AgoraManager] 第1步完成 ✅ Token服务正常');

        // 第2步：用 Token 加入测试频道
        console.log('[AgoraManager] 第2步: 用Token加入测试频道...');
        try {
            const uid = await testClient.join(this.appId, testChannel, token, 0);
            console.log('[AgoraManager] 第2步完成 ✅ AppId + Token 均有效！');
            console.log('[AgoraManager] 测试频道加入成功，分配 uid:', uid);
            await testClient.leave();
            console.log('[AgoraManager] 测试频道已离开，资源已释放');
            console.log('========== [AgoraManager] AppId 检测通过 ✅✅✅ ==========');
            return true;
        } catch (e: any) {
            const code = e?.code || 'UNKNOWN';
            const msg = e?.message || String(e);
            console.error('[AgoraManager] ❌ 加入频道失败');
            console.error('[AgoraManager] 错误码:', code);
            console.error('[AgoraManager] 错误信息:', msg);

            if (code === 'CAN_NOT_GET_GATEWAY_SERVER' || msg.includes('static key')) {
                console.error('[AgoraManager] 原因: 项目开启了App Certificate，需要动态Token');
            } else if (code === 'INVALID_PARAMS' || msg.includes('invalid vendor key')) {
                console.error('[AgoraManager] 原因: AppId 无效或格式错误');
            } else if (code === 'TOKEN_EXPIRED') {
                console.error('[AgoraManager] 原因: Token 已过期');
            } else if (code === 'NETWORK_ERROR' || msg.includes('network')) {
                console.warn('[AgoraManager] 原因: 网络连接失败');
            }
            console.log('========== [AgoraManager] AppId 检测失败 ❌ ==========');
            return false;
        }
    }

    /** 注册客户端事件 */
    private _registerEvents(): void {
        this._client.on('user-joined', (user: any) => {
            console.log('[AgoraManager] 远端用户加入:', user.uid);
            this.onUserJoined?.(user.uid);
        });

        this._client.on('user-left', (user: any, reason: string) => {
            console.log('[AgoraManager] 远端用户离开:', user.uid, reason);
            this.onUserLeft?.(user.uid);
        });

        this._client.on('user-published', async (user: any, mediaType: string) => {
            console.log('[AgoraManager] 远端用户发布:', user.uid, mediaType);
            try {
                await this._client.subscribe(user, mediaType);
                if (mediaType === 'audio') {
                    const audioTrack = user.audioTrack;
                    audioTrack?.play();
                    this.onRemoteAudio?.(user.uid, audioTrack);
                }
                if (mediaType === 'video') {
                    const videoTrack = user.videoTrack;
                    this.onRemoteVideo?.(user.uid, videoTrack);
                }
            } catch (e) {
                console.error('[AgoraManager] 订阅远端流失败:', e);
            }
        });

        this._client.on('user-unpublished', (user: any, mediaType: string) => {
            console.log('[AgoraManager] 远端用户取消发布:', user.uid, mediaType);
        });

        this._client.on('connection-state-change', (curState: string, revState: string) => {
            console.log('[AgoraManager] 连接状态变化:', revState, '->', curState);
        });

        this._client.on('exception', (e: any) => {
            console.warn('[AgoraManager] 异常事件:', e.code, e.msg);
        });
    }

    /**
     * 加入频道
     * @param channel 频道名
     * @param token token（不传则自动从 tokenServerUrl 获取）
     * @param uid 用户 ID，传 0 则自动分配
     */
    public async join(channel: string, token?: string, uid?: number): Promise<boolean> {
        if (!this._client) {
            console.error('[AgoraManager] 未初始化，请先调用 init()');
            return false;
        }
        if (this._joined) {
            console.warn('[AgoraManager] 已在频道中，请先 leave()');
            return false;
        }
        if (!this.appId) {
            console.error('[AgoraManager] appId 未配置');
            return false;
        }

        // 如果没传 token，自动从 Token 服务获取
        let actualToken = token;
        if (!actualToken) {
            actualToken = await this.fetchToken(channel, uid || 0);
            if (!actualToken) return false;
        }

        console.log('[AgoraManager] 准备加入频道, appId:', this.appId, 'channel:', channel, 'uid:', uid, 'token长度:', actualToken?.length, 'token前20字符:', actualToken?.substring(0, 20));

        try {
            this._uid = await this._client.join(this.appId, channel, actualToken, uid || 0);
            this._channelName = channel;
            this._joined = true;
            console.log('[AgoraManager] 加入频道成功:', channel, 'uid:', this._uid);
            return true;
        } catch (e) {
            console.error('[AgoraManager] 加入频道失败:', e);
            this.onError?.(e);
            return false;
        }
    }

    /**
     * 离开频道
     */
    public async leave(): Promise<void> {
        if (!this._joined) return;

        // 停止本地轨道
        this._localAudioTrack?.close();
        this._localVideoTrack?.close();
        this._localAudioTrack = null;
        this._localVideoTrack = null;

        try {
            await this._client?.leave();
        } catch (e) {
            console.error('[AgoraManager] 离开频道失败:', e);
        }

        this._joined = false;
        this._channelName = '';
        this._uid = 0;
        console.log('[AgoraManager] 已离开频道');
    }

    /**
     * 开启麦克风并发布音频
     */
    public async enableMic(): Promise<boolean> {
        if (!this._joined) return false;
        try {
            if (!this._localAudioTrack) {
                this._localAudioTrack = await (window as any).AgoraRTC.createMicrophoneAudioTrack();
            }
            await this._client.publish([this._localAudioTrack]);
            console.log('[AgoraManager] 麦克风已开启');
            return true;
        } catch (e) {
            console.error('[AgoraManager] 开启麦克风失败:', e);
            return false;
        }
    }

    /**
     * 关闭麦克风
     */
    public disableMic(): void {
        this._localAudioTrack?.close();
        this._localAudioTrack = null;
        console.log('[AgoraManager] 麦克风已关闭');
    }

    /**
     * 静音/取消静音
     */
    public setMicMuted(muted: boolean): void {
        this._localAudioTrack?.setMuted(muted);
    }

    /**
     * 开启摄像头并发布视频
     * @param container 视频渲染的 DOM 容器
     */
    public async enableCamera(container?: HTMLElement): Promise<boolean> {
        if (!this._joined) return false;
        try {
            if (!this._localVideoTrack) {
                this._localVideoTrack = await (window as any).AgoraRTC.createCameraVideoTrack();
            }
            if (container) {
                this._localVideoTrack.play(container);
            }
            await this._client.publish([this._localVideoTrack]);
            console.log('[AgoraManager] 摄像头已开启');
            return true;
        } catch (e) {
            console.error('[AgoraManager] 开启摄像头失败:', e);
            return false;
        }
    }

    /**
     * 关闭摄像头
     */
    public disableCamera(): void {
        this._localVideoTrack?.close();
        this._localVideoTrack = null;
        console.log('[AgoraManager] 摄像头已关闭');
    }

    /**
     * 同时开启麦克风和摄像头
     */
    public async enableAudioAndVideo(cameraContainer?: HTMLElement): Promise<boolean> {
        if (!this._joined) return false;
        try {
            if (!this._localAudioTrack) {
                this._localAudioTrack = await (window as any).AgoraRTC.createMicrophoneAudioTrack();
            }
            if (!this._localVideoTrack) {
                this._localVideoTrack = await (window as any).AgoraRTC.createCameraVideoTrack();
            }
            if (cameraContainer) {
                this._localVideoTrack.play(cameraContainer);
            }
            await this._client.publish([this._localAudioTrack, this._localVideoTrack]);
            console.log('[AgoraManager] 音视频已开启并发布');
            return true;
        } catch (e) {
            console.error('[AgoraManager] 开启音视频失败:', e);
            return false;
        }
    }

    /**
     * 播放远端用户的视频到指定 DOM 容器
     */
    public playRemoteVideo(uid: number, container: HTMLElement): void {
        const remoteUser = this._client?.remoteUsers?.find((u: any) => u.uid === uid);
        if (remoteUser?.videoTrack) {
            remoteUser.videoTrack.play(container);
        }
    }

    // ==================== 视频 Track 暴露（供 AgoraVideoRender 使用） ====================

    /**
     * 获取本地摄像头的 MediaStreamTrack
     * 如果 Track 不存在会自动创建（不需要加入频道）
     */
    public async getLocalVideoTrack(): Promise<MediaStreamTrack | null> {
        if (!this.isSDKReady) {
            console.error('[AgoraManager] SDK 未加载');
            return null;
        }
        if (!this._localVideoTrack) {
            try {
                this._localVideoTrack = await (window as any).AgoraRTC.createCameraVideoTrack();
                console.log('[AgoraManager] 自动创建本地视频Track');
            } catch (e) {
                console.error('[AgoraManager] 创建摄像头Track失败:', e);
                return null;
            }
        }
        return this._localVideoTrack.getMediaStreamTrack() || null;
    }

    /**
     * 获取远端用户的视频 MediaStreamTrack
     * 需在远端用户发布视频后调用（onRemoteVideo 回调之后）
     */
    public getRemoteVideoTrack(uid: number): MediaStreamTrack | null {
        const user = this._client?.remoteUsers?.find((u: any) => u.uid === uid);
        if (!user?.videoTrack) {
            console.warn('[AgoraManager] 远端用户视频Track不存在, uid:', uid);
            return null;
        }
        return user.videoTrack.getMediaStreamTrack() || null;
    }

    /**
     * 获取所有远端用户信息列表
     */
    public getRemoteUsers(): Array<{ uid: number; hasVideo: boolean; hasAudio: boolean }> {
        if (!this._client?.remoteUsers) return [];
        return this._client.remoteUsers.map((u: any) => ({
            uid: u.uid,
            hasVideo: !!u.videoTrack,
            hasAudio: !!u.audioTrack,
        }));
    }

    /**
     * 销毁，释放所有资源
     */
    public async destroy(): Promise<void> {
        await this.leave();
        this._client = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onRemoteAudio = null;
        this.onRemoteVideo = null;
        this.onError = null;
        console.log('[AgoraManager] 已销毁');
    }
}
