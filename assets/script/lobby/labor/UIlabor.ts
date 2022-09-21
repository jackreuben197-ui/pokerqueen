/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:06
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-21 14:37:47
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlabor.ts
 */

import { UIDefine } from "../..//define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlabor extends UIBase {
    protected lateLoad() {
        super.lateLoad();

    }
    onShow(param?: any): void {

    }
    joinBtnClick() {
        UIComponent.open(UIDefine.UIlaborJoin);

    }
    createrBtnClick() {

        UIComponent.open(UIDefine.UICreatelabor);

    }

}
