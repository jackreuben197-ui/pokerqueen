/*
 * @Author: xfj
 * @Date: 2022-10-24 13:42:49
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-24 15:47:03
 * @FilePath: /pokerqueen/assets/script/lobby/labor/JoinitemNode.ts
 */

import UIBase from "../../ui/UIBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class JoinitemNode extends UIBase {
    _data = null;
    lateLoad() {
        super.lateLoad();
    }
    onShow() {
        super.onShow();
    }
    initData(data) {
        this._data = data;
        this.initView();
    }
    initView() {

    }

    // update (dt) {}
}
