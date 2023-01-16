/*
 * @Author: xfj
 * @Date: 2023-01-16 10:38:30
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-16 11:20:58
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import MttPayforHome from "./MttPayforHome";
import MttPayforList from "./MttPayforList";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttPayforItem')
export default class MttPayforItem extends UIBase {
    @property(cc.Label)
    nick_name: cc.Label = null;
    @property(cc.Label)
    id: cc.Label = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Node)
    uc: cc.Node = null;
    @property(cc.Node)
    usdt: cc.Node = null;

    @property(cc.Label)
    num: cc.Label = null;

    @property(cc.Node)
    agree: cc.Node = null;

    _data: any = null;
    _target: MttPayforList = null;
    initData(data, target) {
        this._data = data;
        this._target = target
    }
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(...param: any): void {

    }
    clickCb() {
        this._target.itemClick(this._data)
    }
}
