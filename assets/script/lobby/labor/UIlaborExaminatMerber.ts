/*
 * @Author: xfj
 * @Date: 2022-09-21 14:36:14
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-09-21 14:36:45
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborExaminatMerber.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends BaseForm {

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
    }

}
