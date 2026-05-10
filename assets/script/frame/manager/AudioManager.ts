import { AudioPath } from '../../config/PathConfig';
import { ResManager } from '../../manager/ResManager';
import CCTools from '../../tools/CCTools';
import LocalStoreManager from './LocalStoreManager';

export default class AudioManager {
    private static _instance: AudioManager = null;

    public static get instance() {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }
    private _cache: Map<string, cc.AudioClip> = new Map();
    private _soundIds: Array<number> = [];
    private _musicId: number = -1;
    private _musicClip: cc.AudioClip = null;
    // 音量
    private _volumeKey = 'VolumeKey'; // 用于 音量设置 本地存储的key
    private _volume = 1;
    private _soundKey = 'SoundSettingKey';
    private _musicKey = 'MusicSettingKey';
    private _sound = true;
    private _music = true;
    private _pasume = false;
    private _playingMap: Map<string, number> = new Map();

    constructor() {
        this.init();
    }

    init() {
        let v = LocalStoreManager.instance.getItem(this._volumeKey);
        this.volume = CCTools.isNull(v) ? 1 : v;
        let sound = LocalStoreManager.instance.getItem(this._soundKey);
        this.sound = CCTools.isNull(sound) ? true : sound;
        let music = LocalStoreManager.instance.getItem(this._musicKey);
        this.music = CCTools.isNull(music) ? true : music;
        this.addBtnSound();
        // this.playMusic(AudioPath.bg_login);
    }

    addBtnSound() {
        cc.Button.prototype['_onTouchEnded'] = function (event) {
            if (this.interactable && this.enabledInHierarchy) {
                // AudioManager.instance.playSound(AudioPath.btnClick);//播放按钮Button音频
                if (this._pressed) {
                    cc.Component.EventHandler.emitEvents(this.clickEvents, event);
                    this.node.emit('click', this);
                }
                this._pressed = false;
                this._updateState();
                event.stopPropagation();
            }
        };
    }

    get volume() {
        return this._volume;
    }

    //vol: 0.0 ~ 1.0
    set volume(v) {
        this._volume = v;
        cc.audioEngine.setMusicVolume(v);
        cc.audioEngine.setEffectsVolume(v);
        LocalStoreManager.instance.setItem(this._volumeKey, v);
    }

    get pause() {
        return this._pasume;
    }

    set pause(p) {
        this._pasume = p;
        this._pasume ? this.pauseAll() : this.resumeAll();
    }

    get sound() {
        return Boolean(this._sound);
    }

    get music() {
        return Boolean(this._music);
    }

    set sound(v) {
        this._sound = Boolean(v);
        LocalStoreManager.instance.setItem(this._soundKey, v);
        if (!this._sound) {
            this.stopAllSound();
        }
    }

    set music(v) {
        this._music = Boolean(v);
        LocalStoreManager.instance.setItem(this._musicKey, v);
        if (this._music) {
            this._musicClip && this.play(this._musicClip, true);
        } else {
            this.stopMusic();
        }
    }

    stopMusic() {
        this._musicId != -1 && cc.audioEngine.stop(this._musicId);
        this._musicId = -1;
    }

    pauseMusic() {
        this._musicId != -1 && cc.audioEngine.pause(this._musicId);
    }

    resumeMusic() {
        this._musicId != -1 && cc.audioEngine.resume(this._musicId);
    }

    stopAll() {
        this._musicId = -1;
        this._soundIds.length = 0;
        cc.audioEngine.stopAll();
    }

    stopAllSound() {
        for (let id of this._soundIds) {
            cc.audioEngine.stop(id);
        }
        this._soundIds.length = 0;
    }

    stopOneSound(id: number) {
        let index = this._soundIds.indexOf(id);
        if (index != -1) {
            cc.audioEngine.stop(id);
            this._soundIds.splice(index, 1);
        }
    }

    pauseAll() {
        cc.audioEngine.pauseAll();
    }

    pauseAllSound() {
        for (let id of this._soundIds) {
            cc.audioEngine.pause(id);
        }
    }

    pauseOneSound(id: number) {
        let index = this._soundIds.indexOf(id);
        if (index != -1) {
            cc.audioEngine.pause(id);
        }
    }

    resumeAll() {
        cc.audioEngine.resumeAll();
    }

    resumeAllSound() {
        for (let id of this._soundIds) {
            cc.audioEngine.resume(id);
        }
    }

    resumeOneSound(id: number) {
        let index = this._soundIds.indexOf(id);
        if (index != -1) {
            cc.audioEngine.resume(id);
        }
    }

    playMonsterSound(path: string, callBack?: Function) {
        if (this._sound) {
            let isPlayingNum = this._playingMap.get(path);
            if (!isPlayingNum) {
                this._playingMap.set(path, 1);
            } else {
                let maxNum = 1;
                if (isPlayingNum > maxNum) {
                    //有相同音效正在不放不播放
                    return;
                }
                this._playingMap.set(path, isPlayingNum + 1);
            }
            this.playSound(path, callBack);
        }
    }

    playSound(path: string, callBack?: Function) {
        if (this._sound) {
            this.playAudio(path, false, () => {
                let num = this._playingMap.get(path);
                if (num) {
                    this._playingMap.set(path, num - 1);
                }
                callBack && callBack();
            });
        }
    }

    playMusic(path: string) {
        this.playAudio(path, true);
    }

    private playAudio(path: string, loop: boolean, callBack?: Function) {
        let clip = this._cache.get(path);
        if (clip) {
            this.play(clip, loop, callBack);
        } else {
            this.loadAudioRes(path, loop, callBack);
        }
    }

    private loadAudioRes(path: string, loop: boolean, callBack?: Function) {
        // GC.res.loadResFromBundleName("audios", path, cc.AudioClip, (clip: cc.AudioClip) => {
        //     this._cache.set(path, clip);
        //     this.play(clip, loop, callBack)
        // });
        ResManager.instance.loadRes(
            AudioPath.rootPath + path,
            (clip: cc.AudioClip) => {
                this._cache.set(path, clip);
                this.play(clip, loop, callBack);
            },
            cc.AudioClip
        );
    }

    private play(clip: cc.AudioClip, loop: boolean, callBack?: Function) {
        if (loop) {
            if (this._musicId != -1) {
                cc.audioEngine.stop(this._musicId);
            }
            this._musicClip = clip;
            if (this.music) {
                let id = cc.audioEngine.play(clip, loop, this._volume);
                this._musicId = id;
            }
            //第一次加载，先播放，但是加载慢，导致music设为false后才播放
            // (!this.music || this.pause) && this.pauseMusic();
            // (!this.music || this.pause) && this.pauseAll();
        } else if (!this.pause) {
            let id = cc.audioEngine.play(clip, loop, this._volume);
            this._soundIds.push(id);
            cc.audioEngine.setFinishCallback(id, () => {
                let index = this._soundIds.indexOf(id);
                if (index != -1) {
                    this._soundIds.splice(index, 1);
                }
                callBack && callBack();
            });
        }
    }
}
