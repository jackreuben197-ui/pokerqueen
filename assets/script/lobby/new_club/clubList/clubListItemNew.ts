/*
 * @Author: osoker
 * @Date: 2026-04-09
 * @description: 新版俱乐部列表项
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/clubList/clubListItemNew.ts
 */

import { ClubCache } from "../../../frame/data/club/ClubCache";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBasePlus from "../../../ui/UIBasePlus";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/clubListItemNew')
export default class clubListItemNew extends UIBasePlus {

    private _data: any = null;

    protected cc_Label$clubName: cc.Label = null;
    protected cc_Sprite$clubIcon: cc.Sprite = null;
    protected cc_Button$enterClub: cc.Button = null;
    protected cc_Label$clubIdTxt: cc.Label = null;
    protected cc_Label$admin: cc.Label = null;
    protected cc_Label$tblnum: cc.Label = null;
    protected cc_Label$usernum: cc.Label = null;

    protected cc_Label$gold : cc.Label = null;
    protected cc_Label$credit : cc.Label = null;

    initData(data: any) {
        this._data = data;
        if (!this._data) return;

        this.cc_Label$clubName.string = this._data.club_name || '';
        this.cc_Label$clubIdTxt.string = this._data.random_id || '';
        this.cc_Label$tblnum.string = (this._data.tables != null ? String(this._data.tables) : '0') + "桌";
        this.cc_Label$usernum.string = (this._data.players || '0') + "人";
        this.cc_Label$admin.string = this.getMemberTypeText(this._data.member_type);

        this.cc_Label$gold = this._data.user_gold || "0";
        this.cc_Label$credit = this._data.user_credit || "0";

        // 头像
        if (this.cc_Sprite$clubIcon) {
            WebImageHelper.SetHeadImage(this.cc_Sprite$clubIcon, this._data.logo);
        }

        // 点击进入俱乐部
        this.bindClick(this.cc_Button$enterClub.node, this.onClickItem, this);
    }

    private async onClickItem() {
        // TODO: 进入俱乐部详情，后续对接
        console.log( "你点击了俱乐部:" + this._data.club_name );
    }

    private getMemberTypeText(type: number): string {
        const types = { 1: '创建者', 2: '代理', 3: '普通会员', 4: '工会管理员' };
        return types[type] || '';
    }
}
