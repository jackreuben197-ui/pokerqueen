import GC from "../frame/GameControl";
import StorageKey from "../session/StorageKey";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";

//声音
export default class SoundComponent {

    static get Instance(): SoundComponent {
        return (this as any).instance ??= new SoundComponent;
    }

    sound_switch_on: boolean = false;

    initSound() {
        let sound_is_open = GC.localStore.getItem(StorageKey.soundIsOpen);
        if (sound_is_open == null || (+sound_is_open) == 1) {
            this.sound_switch_on = true;
        }
        else {
            this.sound_switch_on = false;
        }
    }

    Play(name: string, loop: boolean = false) {

        if (this.sound_switch_on) {

            let sounc_clip: cc.AudioClip = AssetContext.getAsset<cc.AudioClip>(name, AssetFold.sound_all);

            sounc_clip && cc.audioEngine.playEffect(sounc_clip, loop);
        }
    }
}