import { TClubGoldChangeLogs, TUserGoldChangeLogs } from '../../../../config/TTypeConfig';
import TimeHelper from '../../../../helper/TimeHelper';
import GC from '../../../GameControl';
import ClubGoldChangeLogItem from './ClubGoldChangeLogItem';
import GoldChangeLogItem from './GoldChangeLogItem';
import UserGoldChangeLogItem from './UserGoldChangeUserLogItem';

export default class GoldChangeLogModel {
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _offset: number = 0;
    private _list: Array<UserGoldChangeLogItem> = [];
    private _list_club: Array<ClubGoldChangeLogItem> = [];

    getList(isClub: boolean = false) {
        return isClub ? this._list_club : this._list;
    }

    get canReq() {
        return !this._reqEnd && !this._reqing;
    }

    resetData() {
        this._list.length = 0;
        this._list_club.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this._offset = 0;
    }

    dropDownReq(isClub: boolean = false) {
        if (!this._reqing && !this._reqEnd) {
            this.reqLog(isClub, this._offset);
        }
    }

    reqLog(isClub: boolean = false, offset: number = 0) {
        this._reqing = true;
        if (offset == 0) {
            this.resetData();
            GC.data.languageTemp.reqLanguageTemp(() => {
                if (isClub) {
                    GC.data.wallet.reqClubGoldChangeLog(offset);
                } else {
                    GC.data.wallet.reqUserGoldChangeLog(offset);
                }
            });
        } else {
            if (isClub) {
                GC.data.wallet.reqClubGoldChangeLog(offset);
            } else {
                GC.data.wallet.reqUserGoldChangeLog(offset);
            }
        }
    }

    updateData(msg: TUserGoldChangeLogs | TClubGoldChangeLogs, isClub: boolean) {
        this._reqing = false;
        let list = isClub ? this._list_club : this._list;
        msg.list.forEach(log => {
            let item: GoldChangeLogItem = isClub ? new ClubGoldChangeLogItem(log) : new UserGoldChangeLogItem(log);
            if (list.length == 0) {
                item.displayTime = true;
            } else {
                let lastItem = list[list.length - 1];
                if (!TimeHelper.isSameDay(lastItem.create_time, item.create_time)) {
                    item.displayTime = true;
                }
            }
            list.push(<any>item);
        });
        this._offset = list.length;
        this._reqEnd = list.length >= msg.total;
    }
}
