/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:06
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-26 11:07:09
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlabor.ts
 */

import { UIDefine } from "../..//define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlabor extends UIBase {
    protected lateLoad() {
        super.lateLoad();

    }
    onShow(param?: any): void {

    }
    async joinBtnClick() {

        UIComponent.open(UIDefine.UIlaborJoin);

    }
    createrBtnClick() {

        UIComponent.open(UIDefine.UICreatelabor);

    }

}
