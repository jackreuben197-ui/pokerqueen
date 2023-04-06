/*
 * @Author: xfj
 * @Date: 2023-04-06 13:24:06
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2023-04-06 13:24:12
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/dataManger/dataItem.ts
 */

import UIBase from "../../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/dataManger/dataItem')

export default class dataItem extends UIBase {

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
    }
    initData() {

    }
}
