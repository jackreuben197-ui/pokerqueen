/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:06
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 11:08:33
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlabor.ts
 */

import { UIDefine } from "../..//define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIlabor')
export default class UIlabor extends UIBase {
    protected lateLoad() {
        super.lateLoad();

    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);

    }
    async joinBtnClick() {

        UIComponent.open(UIDefine.UIlaborJoin);

    }
    createrBtnClick() {

        UIComponent.open(UIDefine.UICreatelabor);

    }

}
