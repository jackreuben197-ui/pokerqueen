import { TRoomBlinds } from '../../../config/TTypeConfig';

export default class LobbyRoomBlindsModel {
    private _sbs: Array<number> = [0];
    private _sbs_club: Array<number> = [0];

    updateData(msgs: Array<TRoomBlinds>, isClub) {
        let sbs = isClub ? this._sbs_club : this._sbs;
        sbs.length = 1;
        msgs.forEach(msg => {
            if (sbs.every(sb => sb != msg.sb)) {
                sbs.push(msg.sb);
            }
        });
        sbs.sort((a, b) => a - b);
    }

    getSbs(isClub) {
        return isClub ? this._sbs_club : this._sbs;
    }
}
