import { traceClass } from '../crazyPoker/gameplay/common/core/LogTrace';
import GC from '../frame/GameControl';
import StorageKey from '../session/StorageKey';
import AssetContext, { AssetFold } from '../ui/component/AssetContext';

//声音
@traceClass()
export default class SoundComponent {

    static get Instance(): SoundComponent {
        return ((this as any).instance ??= new SoundComponent());
    }
    soundOn: boolean = false;
    // BGM 相关
    private _musicId: number = -1;
    private _musicClip: cc.AudioClip = null;
    private _musicVolume: number = 1;
    private _musicPath: string = '';
    private _cache: Map<string, cc.AudioClip> = new Map();
    // 手势恢复监听器
    private _gestureHandler: ((e: Event) => void) | null = null;
    // 标记是否需要恢复
    private _needRecover: boolean = false;

    initSound() {
        let soundIsOpen = GC.localStore.getItem(StorageKey.soundIsOpen);
        if (soundIsOpen == null || +soundIsOpen == 1) {
            this.soundOn = true;
        } else {
            this.soundOn = false;
        }
        this.listenVisibility();
    }

    /** 获取 Cocos 2.4.8 引擎底层的 AudioContext */
    private _getAudioContext(): AudioContext | null {
        try {
            const support = (cc.sys as any).__audioSupport;
            if (support && support.context) {
                return support.context as AudioContext;
            }
        } catch (e) {}
        return null;
    }

    /**
     * 页面从后台恢复时的处理
     *
     * 不做任何状态判断，直接标记需要恢复 + 注册手势监听
     * 因为 iOS Safari 的 AudioContext 状态不可信（WebKit Bug #263627）:
     *   - state 可能是 'running' 但 currentTime 冻结
     *   - currentTime 不是 0 而是挂起前的正数
     * 所以我们不再信任 state，而是始终执行恢复
     */
    private _onPageVisible(): void {
        // 标记需要恢复
        this._needRecover = true;

        // 立刻尝试一次（在非手势上下文中，iOS 上大概率失败，但不影响）
        this._syncResumeContext();

        // 注册手势监听，确保下次用户触摸时同步恢复
        this._hookGesture();
    }

    /**
     * 同步恢复 AudioContext（不使用 Promise）
     *
     * 关键：iOS Safari 要求 resume() 必须在用户手势的同步调用栈中执行，
     * 任何 Promise.then() / async await 都会脱离手势上下文导致静默失败。
     */
    private _syncResumeContext(): void {
        const ctx = this._getAudioContext();
        if (!ctx) return;

        try {
            // 先尝试 suspend 再 resume（WebKit Bug #263627 workaround）
            // 注意：suspend() 是同步调用的，resume() 也必须同步调用
            if (ctx.state === 'running') {
                // 可能是假 running，尝试 suspend
                try { ctx.suspend(); } catch (e) {}
            }
            // 无论之前什么状态，直接同步 resume
            try { ctx.resume(); } catch (e) {}
        } catch (e) {}
    }

    /** 恢复 BGM 播放 */
    private _doRecoverBGM(): void {
        if (!this._needRecover) return;
        this._needRecover = false;

        // 先彻底停止所有旧音频（引擎 _break/_restore 后状态可能不一致）
        try { cc.audioEngine.stopAll(); } catch (e) {}
        this._musicId = -1;

        // 重新播放 BGM
        if (this.soundOn && this._musicPath) {
            this._playAudio(this._musicPath, true);
        }
    }

    /** 注册手势监听（可重复调用，不会重复注册） */
    private _hookGesture(): void {
        if (this._gestureHandler) return;
        this._gestureHandler = (evt: Event) => {
            if (!this._needRecover) {
                this._unhookGesture();
                return;
            }

            // 关键：必须在同步调用栈中直接调 resume()
            // 不能用 Promise / async，否则 iOS 认为不是用户手势
            this._syncResumeContext();

            // 延迟一帧再恢复 BGM，让 AudioContext 有时间完成状态切换
            requestAnimationFrame(() => {
                this._doRecoverBGM();
                this._unhookGesture();
            });
        };
        document.addEventListener('touchstart', this._gestureHandler, true);
        document.addEventListener('touchend', this._gestureHandler, true);
        document.addEventListener('click', this._gestureHandler, true);
    }

    private _unhookGesture(): void {
        if (this._gestureHandler) {
            document.removeEventListener('touchstart', this._gestureHandler, true);
            document.removeEventListener('touchend', this._gestureHandler, true);
            document.removeEventListener('click', this._gestureHandler, true);
            this._gestureHandler = null;
        }
    }

    /** 监听页面可见性变化 */
    listenVisibility() {
        // 主力：visibilitychange 事件
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            // 延迟到下一帧，等引擎自己的 _restore() 先执行完
            requestAnimationFrame(() => {
                this._onPageVisible();
            });
        });

        // 双保险：cc.game.EVENT_SHOW（Telegram WebApp 等 visibilitychange 不触发的场景）
        cc.game.on(cc.game.EVENT_SHOW, () => {
            setTimeout(() => {
                this._onPageVisible();
            }, 300);
        });
    }

    Play(name: string, loop: boolean = false) {
        if (this.soundOn) {
            let soundClip: cc.AudioClip = AssetContext.getAsset<cc.AudioClip>(name, AssetFold.sound_all);
            soundClip && cc.audioEngine.playEffect(soundClip, loop);
        }
    }

    /** 播放背景音乐，支持指定音量 (0.0 ~ 1.0) */
    playMusicWithVolume(path: string, volume: number = 1) {
        this._musicVolume = volume;
        this._musicPath = path;
        if (!this.soundOn) return;
        this._playAudio(path, true);
    }

    /** 停止背景音乐 */
    stopMusic() {
        if (this._musicId !== -1) {
            cc.audioEngine.stop(this._musicId);
            this._musicId = -1;
        }
    }

    /** 设置音效开关，同时控制 BGM */
    setSoundOn(on: boolean) {
        this.soundOn = on;
        if (on) {
            if (this._musicPath && this._musicId === -1) {
                this._playAudio(this._musicPath, true);
            }
        } else {
            this.stopMusic();
        }
    }

    private _playAudio(path: string, loop: boolean) {
        const clip = this._cache.get(path);
        if (clip) {
            this._play(clip, loop);
        } else {
            cc.resources.load(path, cc.AudioClip, (err: Error, clip: cc.AudioClip) => {
                if (err) {
                    this.tracelog.error('load audio failed:', path, err);
                    return;
                }
                this._cache.set(path, clip);
                this._play(clip, loop);
            });
        }
    }

    private _play(clip: cc.AudioClip, loop: boolean) {
        if (this._musicId !== -1) {
            cc.audioEngine.stop(this._musicId);
        }
        this._musicClip = clip;
        const id = cc.audioEngine.play(clip, loop, this._musicVolume);
        this._musicId = id;
    }
}
