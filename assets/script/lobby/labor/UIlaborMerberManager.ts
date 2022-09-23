/*
 * @Author: xfj
 * @Date: 2022-09-21 13:56:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-23 15:32:11
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborMerberManager.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlaborMerberManager extends BaseForm {

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
    }

    examination() {
        UIComponent.open(UIDefine.UIlaborExaminatMerber);
    }
}
