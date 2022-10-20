import { TIssueUserItem } from "../../../../config/TTypeConfig";

export default class GoldIssueItemModel {
    private _msg: TIssueUserItem = null;
    constructor(msg: TIssueUserItem) {
        this._msg = msg;
    }
    get user_id() {
        return this._msg.user_id
    }
    get nick_name() {
        return this._msg.nick_name
    }
    get avatar() {
        return this._msg.avatar
    }
    get updated_time() {
        return this._msg.updated_time
    }


}