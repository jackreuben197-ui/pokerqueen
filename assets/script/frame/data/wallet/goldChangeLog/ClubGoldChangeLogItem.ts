import { TClubGoldChangeLogItem } from '../../../../config/TTypeConfig';
import GoldChangeLogItem from './GoldChangeLogItem';

export default class ClubGoldChangeLogItem extends GoldChangeLogItem {
    private _msg: TClubGoldChangeLogItem = null;

    constructor(msg: TClubGoldChangeLogItem) {
        super(msg);
        this._msg = msg;
    }
}
