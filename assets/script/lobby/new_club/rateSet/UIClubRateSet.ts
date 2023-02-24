/*
 * @Author: xfj
 * @Date: 2022-12-28 16:52:38
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 16:51:04
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/rateSet/UIClubRateSet.ts
 */
import ComFormTitle from "../../../common/ComFormTitle";
import TabNode from "../../../common/tabNode";
import { rateTabConfig } from "../../../frame/config/tabConfig";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { i18nMgr } from "../../../i18n/i18nMgr";
import ToastManager from "../../../manager/ToastManager";
import BaseForm from "../../../ui/form/BaseForm";
import Toast from "../../../ui/toast/Toast";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubRateSet')
export default class UIClubRateSet extends BaseForm {

    private comFormTitle: ComFormTitle = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    upNode: cc.Node = null;
    downNode: cc.Node = null;
    tabNode: TabNode = null;
    selectIndex = 0;
    lbl_tip: cc.Label = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.tabNode = this.getChildNodeOrComponent("tabNode", TabNode);
        this.upNode = this.getChildNodeOrComponent("upNode");
        this.downNode = this.getChildNodeOrComponent("downNode");
        this.lbl_tip = this.getChildNodeOrComponent("lbl_tip", cc.Label);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.tabNode.initData(rateTabConfig, this.titleNodeClick.bind(this), this)
        let title = "UIGuild_ExchangeRateSettings"
        this.comFormTitle.initData(title, this);
        // this.titleNodeClick(0);

    }
    titleNodeClick(customData) {
        this.selectIndex = customData
        this.upNode.getChildByName('coin01').active = customData == 0
        this.upNode.getChildByName('coin02').active = customData == 1

        this.downNode.getChildByName('coin01').active = customData == 1
        this.downNode.getChildByName('coin02').active = customData == 0
        this.editBox.string = this.selectIndex == 0 ? ClubCache.gold_to_usdt_rate : ClubCache.usdt_to_gold_rate
        this.lbl_tip.string = customData == 0 ? `1 Global coin  ≈  ${ClubCache.gold_to_usdt_rate} Union coin` : `1 Union coin  ≈  ${ClubCache.usdt_to_gold_rate} Global coin`
    }


    editBoxChangeCb() {
        this.lbl_tip.string = this.selectIndex == 0 ? `1 Global coin  ≈  ${Number(this.editBox.string)} Union coin` : `1 Union coin  ≈  ${Number(this.editBox.string)} Global coin`

    }
    getString(string: String) {

        let idnex = string.indexOf('.')
        if (~idnex) {
            return string.length - idnex <= 2
        }
        return true
    }
    async saveRate() {
        if (this.editBox.string == '') {
            this.editBox.string = 0 + ""
        }
        if (this.selectIndex == 0) {
            ClubCache._msg.gold_to_usdt_rate = Number(this.editBox.string)

        } else {
            ClubCache._msg.usdt_to_gold_rate = Number(this.editBox.string)

        }
        await UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, usdt_to_gold_rate: ClubCache.usdt_to_gold_rate, gold_to_usdt_rate: ClubCache.gold_to_usdt_rate })
        ToastManager.Instance.createToast(i18nMgr.Get("error0"));
    }

}
