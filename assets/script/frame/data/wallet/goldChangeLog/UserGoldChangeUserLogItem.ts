import { TUserGoldChangeLogItem } from '../../../../config/TTypeConfig';
import GoldChangeLogItem from './GoldChangeLogItem';

export default class UserGoldChangeLogItem extends GoldChangeLogItem {
    private _msg: TUserGoldChangeLogItem = null;

    constructor(msg: TUserGoldChangeLogItem) {
        super(msg);
        this._msg = msg;
    }
}
