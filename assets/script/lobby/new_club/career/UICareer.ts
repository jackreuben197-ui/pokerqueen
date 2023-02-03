/*
 * @Author: xfj
 * @Date: 2023-02-02 11:32:22
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-03 17:14:15
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/career/UICareer.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import { careerConfig } from "../../../frame/data/rate/RateConfig";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UICareer')

export default class UICareer extends UIBase {
    @property(cc.Node)
    contentNode: cc.Node = null;
    // @property(cc.Prefab)
    // dropDownBoxNew: cc.Prefab = null;

    comFormTitle: cc.Label = null;
    lbl_number_1: cc.Label = null;
    lbl_number_2: cc.Label = null;
    lbl_number_3: cc.Label = null;
    lbl_number_4: cc.Label = null;
    lbl_profit_1: cc.Label = null;
    lbl_profit_2: cc.Label = null;
    lbl_profit_3: cc.Label = null;
    lbl_profit_4: cc.Label = null;
    _selectIndex = 0;
    dropNode_lbl: cc.Label = null;
    // _dropDownBox = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", cc.Label);
        this.lbl_number_1 = this.getChildNodeOrComponent("lbl_number_1", cc.Label);
        this.lbl_number_2 = this.getChildNodeOrComponent("lbl_number_2", cc.Label);
        this.lbl_number_3 = this.getChildNodeOrComponent("lbl_number_3", cc.Label);
        this.lbl_number_4 = this.getChildNodeOrComponent("lbl_number_4", cc.Label);
        this.lbl_profit_1 = this.getChildNodeOrComponent("lbl_profit_1", cc.Label);
        this.lbl_profit_2 = this.getChildNodeOrComponent("lbl_profit_2", cc.Label);
        this.lbl_profit_3 = this.getChildNodeOrComponent("lbl_profit_3", cc.Label);
        this.lbl_profit_4 = this.getChildNodeOrComponent("lbl_profit_4", cc.Label);
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);
    }
    openDropDownBox() {
        UIComponent.open(UIDefine.dropDownBoxNew, { data: careerConfig, index: this._selectIndex, cb: this.selectSort.bind(this) })
    }
    selectSort(data, index) {
        this._selectIndex = index;
        this.setText(this.dropNode_lbl, data.desc);
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIMine_VIP_dataAll"
        this.setText(this.comFormTitle, title)
        this.setText(this.dropNode_lbl, careerConfig[this._selectIndex].desc);
    }
    initMiddleData() {
        this.lbl_number_1.string = ''
        this.lbl_number_2.string = ''
        this.lbl_number_3.string = ''
        this.lbl_number_4.string = ''
        this.lbl_profit_1.string = ''
        this.lbl_profit_2.string = ''
        this.lbl_profit_3.string = ''
        this.lbl_profit_4.string = ''
    }
    initScrow() {
        for (let index = 0; index < this.contentNode.childrenCount; index++) {
            const element = this.contentNode.children[index];
            let lbl_1 = element.getChildByName('lbl_1').getComponent(cc.Label)
            lbl_1.string = ''
        }

    }
    recordClick() {
        UIComponent.open(UIDefine.UICareerRecord)
    }
    cardScoreClick() {
        UIComponent.open(UIDefine.UIRecordHands, { type: 1 })
    }

    // update (dt) {}
}
