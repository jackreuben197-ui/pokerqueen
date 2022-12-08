/*
 * @Author: xfj
 * @Date: 2022-10-21 16:44:29
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-08 15:36:48
 * @FilePath: /pokerqueen/assets/script/wallet/issue/GoldIssueListItem.ts
 */
import ListItem from "../../common/ListItem";
import { UIDefine } from "../../define/UIDefine";
import GoldIssueItemModel from "../../frame/data/wallet/issue/GoldIssueItemModel";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import UIComponent from "../../ui/UIComponent";
import { EWalletGoldOpration } from "../WalletConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/issue/GoldIssueListItem')
export default class GoldIssueListItem extends ListItem {
    private icon: cc.Sprite = null;
    private userName: cc.Label = null;
    private userId: cc.Label = null;
    private time: cc.Label = null;
    private issueBtn: cc.Node = null;

    private _data: GoldIssueItemModel = null;
    lateLoad() {
        super.lateLoad();

        this.icon = this.getChildNodeOrComponent("icon", cc.Sprite);
        this.userName = this.getChildNodeOrComponent("userName", cc.Label);
        this.userId = this.getChildNodeOrComponent("userId", cc.Label);
        this.time = this.getChildNodeOrComponent("time", cc.Label);
        this.issueBtn = this.getChildNodeOrComponent("issueBtn");
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.issueBtn, this.clickIssue);
    }

    initData(data: GoldIssueItemModel) {
        this._data = data;
        if (this._data.avatar) {
            WebImageHelper.SetHeadImage(this.icon, this._data.avatar)
        }
        this.setText(this.userName, this._data.nick_name);
        this.setText(this.userId, `ID:${this._data.user_id}`);
        this.setText(this.time, TimeHelper.getTimeBefore(this._data.updated_time));
    }


    clickIssue() {
        UIComponent.open(UIDefine.GoldOprationForm, { type: EWalletGoldOpration.issue, isClub: false, userId: this._data.user_id, userName: this._data.nick_name });
    }
}