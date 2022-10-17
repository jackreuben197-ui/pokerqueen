/*
 * @Author: xfj
 * @Date: 2022-10-17 11:27:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-17 11:41:12
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatchHome.ts
 */

import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateMatchHome extends BaseForm {

    @property(cc.Prefab)
    modelItem: cc.Prefab = null;

    @property(cc.Label)
    lbModel: cc.Label = null;

    @property(cc.Node)
    contentModel: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.contentModel.removeAllChildren();
        for (let index = 0; index < 4; index++) {
            const element = cc.instantiate(this.modelItem);
            element.position.x = 0;
            element.parent = this.contentModel
        }
    }
    createMatch() {

    }
}
