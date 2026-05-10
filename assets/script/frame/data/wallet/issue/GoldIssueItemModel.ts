/*
 * @Author: xfj
 * @Date: 2022-10-21 16:44:29
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-08 18:46:13
 * @FilePath: /pokerqueen/assets/script/frame/data/wallet/issue/GoldIssueItemModel.ts
 */
import { TIssueUserItem } from '../../../../config/TTypeConfig';

export default class GoldIssueItemModel {
    private _msg: TIssueUserItem = null;

    constructor(msg: TIssueUserItem) {
        this._msg = msg;
    }

    get random_id() {
        return this._msg.random_id;
    }

    get user_id() {
        return this._msg.user_id;
    }

    get nick_name() {
        return this._msg.nick_name;
    }

    get avatar() {
        return this._msg.avatar;
    }

    get updated_time() {
        return this._msg.updated_time;
    }
}
