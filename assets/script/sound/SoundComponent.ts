import GC from '../frame/GameControl';
import StorageKey from '../session/StorageKey';
import AssetContext, { AssetFold } from '../ui/component/AssetContext';

//声音
export default class SoundComponent {

    static get Instance(): SoundComponent {
        return ((this as any).instance ??= new SoundComponent());
    }
    soundOn: boolean = false;
    // BGM 相关
    private _musicId: number = -1;
    private _musicClip: cc.AudioClip = null;
    private _musicVolume: number = 1;
    private _cache: Map<string, cc.AudioClip> = new Map();

    initSound() {
        let soundIsOpen = GC.localStore.getItem(StorageKey.soundIsOpen);
        if (soundIsOpen == null || +soundIsOpen == 1) {
            this.soundOn = true;
        } else {
            this.soundOn = false;
        }
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
        this._playAudio(path, true);
    }

    /** 停止背景音乐 */
    stopMusic() {
        if (this._musicId !== -1) {
            cc.audioEngine.stop(this._musicId);
            this._musicId = -1;
        }
    }

    private _playAudio(path: string, loop: boolean) {
        const clip = this._cache.get(path);
        if (clip) {
            this._play(clip, loop);
        } else {
            cc.resources.load(path, cc.AudioClip, (err: Error, clip: cc.AudioClip) => {
                if (err) {
                    cc.log('[SoundComponent] load audio failed:', path, err);
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
