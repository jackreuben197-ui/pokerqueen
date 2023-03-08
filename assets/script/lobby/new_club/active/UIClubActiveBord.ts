/*
 * @Author: xfj
 * @Date: 2022-12-29 11:17:46
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-08 20:01:49
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/active/UIClubActiveBord.ts
 */

import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubActiveBord')
export default class UIClubActiveBord extends UIBase {
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.Label)
    text: cc.Label = null;
    @property(cc.Node)
    T1: cc.Node = null;
    _data = null;
    _isCheckNoitic = false
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
        if (this._isCheckNoitic) {
            let now = new Date();
            let year = now.getFullYear();
            let month = now.getMonth();
            let day = now.getDate();
            let currenTime = new Date(year, month, day).getTime();
            localStorage.setItem(this._data.id + '_' + currenTime, 1 + '');
        }
        UIComponent.close(this.UIDefine);
    }
    cancle() {
        this._isCheckNoitic = !this._isCheckNoitic
        this.T1.active = this._isCheckNoitic
    }
}
