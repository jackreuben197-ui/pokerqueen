/*
 * @Author: xfj
 * @Date: 2022-12-29 11:17:46
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-29 12:11:21
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubActiveBord.ts
 */

import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubActiveBord')
export default class UIClubActiveBord extends UIBase {
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.Label)
    text: cc.Label = null;
    _data = null;
    protected lateLoad(): void {
        super.lateLoad();


    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this._data = param;
        this.initLabel();
    }
    initLabel() {
        this.title.string = this._data.title
        this.text.string = this._data.content
    }

    sureClick() {
        this.onClose();
    }
    cancle() {
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let currenTime = new Date(year, month, day).getTime();
        localStorage.setItem(this._data.id + '_' + currenTime, 1 + '')
    }
}
