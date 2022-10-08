import { TRoomBlinds } from "../../../config/TTypeConfig";

export default class LobbyRoomBlindsModel {
    private _sbs: Array<number> = [0];
    updateData(msgs: Array<TRoomBlinds>) {
        this._sbs.length = 1;
        msgs.forEach(msg => {
            if (this._sbs.every(sb => sb != msg.sb)) {
                this._sbs.push(msg.sb)
            }
        })
        this._sbs.sort((a, b) => a - b);
    }

    get sbs() {
        return this._sbs;
    }
}