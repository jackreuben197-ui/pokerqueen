/*
 * @Author: xfj
 * @Date: 2022-10-21 21:48:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-22 11:04:37
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIApplyJoin.ts
 */


import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIApplyJoin extends BaseForm {
    @property(cc.Node)
    itemNode: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
    }

    async onShow(param?: any) {
        super.onShow(param);

    }

    initCotentNode() {
        for (let index = 0; index < 4; index++) {
            const element = cc.instantiate(this.itemNode);
            element.parent = this.contentNode;
            this.initItem(element, '');
        }
    }

    initItem(item, data) {

    }


}
