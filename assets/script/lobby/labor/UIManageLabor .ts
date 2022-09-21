/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-09-21 13:59:51
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIManageLabor .ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIManageLabor extends BaseForm {

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
    }
    clubMemberManager() {
        UIComponent.open(UIDefine.UIlaborMerberManager);
    }

    // update (dt) {}
}
