/*
 * @Author: xfj
 * @Date: 2022-12-28 16:52:38
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-28 17:33:59
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubRateSet.ts
 */
import ComFormTitle from "../../common/ComFormTitle";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubRateSet')
export default class UIClubRateSet extends BaseForm {

    private comFormTitle: ComFormTitle = null;

    @property(cc.EditBox)
    goldEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    usdtEditBox: cc.EditBox = null;
    @property(cc.Label)
    lbl_usdt: cc.Label = null;
    @property(cc.Label)
    lbl_gold: cc.Label = null;

    memberListT: cc.Node
    applyListT: cc.Node
    changeGold: cc.Node
    changeUsdt: cc.Node
    saveBtn: cc.Button

    _selectTitle

    protected lateLoad(): void {
        super.lateLoad();
        this.memberListT = this.getChildNodeOrComponent("memberListT");
        this.applyListT = this.getChildNodeOrComponent("applyListT");
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.changeGold = this.getChildNodeOrComponent("changeGold");
        this.changeUsdt = this.getChildNodeOrComponent("changeUsdt");
        this.saveBtn = this.getChildNodeOrComponent('saveBtn', cc.Button)
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UITitle_RateSet"
        this.comFormTitle.initData(title, this);
        this.titleNodeClick(null, 0)

    }
    titleNodeClick(event, customData) {
        // if (this._selectTitle == customData) return
        this._selectTitle = customData
        this.memberListT.getChildByName('block').active = this._selectTitle == 0
        this.applyListT.getChildByName('block').active = this._selectTitle == 1

        this.memberListT.getChildByName('title').color = this._selectTitle == 0 ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.applyListT.getChildByName('title').color = this._selectTitle == 1 ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.changeGold.active = this._selectTitle == 0
        this.changeUsdt.active = this._selectTitle == 1
    }
    editBoxChangeCb() {
        if (this._selectTitle == 0) {
            if (this.getString(this.goldEditBox.string)) {
                this.lbl_gold.string = this.goldEditBox.string + ' 金豆'
            } else {
                UIComponent.Instance.Toast('最多保留两位小数')
            }
            this.saveBtn.interactable = this.goldEditBox.string != ''


        } else {
            if (this.getString(this.usdtEditBox.string)) {
                this.lbl_usdt.string = this.usdtEditBox.string + ' USDT'
            } else {
                UIComponent.Instance.Toast('最多保留两位小数')
            }
            this.saveBtn.interactable = this.usdtEditBox.string != ''

        }
    }
    getString(string: String) {
        let idnex = string.indexOf('.')
        if (~idnex) {
            return string.length - idnex <= 2
        }
        return true
    }
    saveRate() {
        if (this._selectTitle == 0) {
        } else {
        }
    }

}
