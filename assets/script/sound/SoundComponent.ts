import GC from '../frame/GameControl';
import StorageKey from '../session/StorageKey';
import AssetContext, { AssetFold } from '../ui/component/AssetContext';

//声音
export default class SoundComponent {

    static get Instance(): SoundComponent {
        return ((this as any).instance ??= new SoundComponent());
    }
    soundOn: boolean = false;

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
}
