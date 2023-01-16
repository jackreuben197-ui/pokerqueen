import GC from "../frame/GameControl";
import StorageKey from "../session/StorageKey";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";

//声音
export default class SoundComponent {
    static get Instance(): SoundComponent {
        return (this as any).instance ??= new SoundComponent;
    }
    Play(name: string, loop: boolean = false) {

        if (+GC.localStore.getItem(StorageKey.soundIsOpen) == 1) {

            let sounc_clip: cc.AudioClip = AssetContext.getAsset<cc.AudioClip>(name, AssetFold.sound_all);

            sounc_clip && cc.audioEngine.playEffect(sounc_clip, loop);
        }
    }
}
