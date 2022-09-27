/*
 * @Author: xfj
 * @Date: 2022-09-21 13:56:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-26 17:48:26
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborMerberManager.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get, APIOrgClubGetJoinlList, } from "../../net/https/WebRequest";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlaborMerberManager extends BaseForm {
    @property(cc.Node)
    topLabel: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.initTop()
    }

    examination() {
        UIComponent.open(UIDefine.UIlaborExaminatMerber);
    }
    async initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let current = this.topLabel.getChildByName('current').getComponent(cc.Label)
        let total = this.topLabel.getChildByName('total').getComponent(cc.Label)
        current.string = '(' + data.club_members
        total.string = data.upper_limit + ')';
    }
}
