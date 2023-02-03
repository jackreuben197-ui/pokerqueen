/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-03 17:18:07
 * @FilePath: /pokerqueen/assets/script/lobby/career/recordScoreItem.ts
 */


import { UIDefine } from "../../define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/recordScoreItem')
export default class recordScoreItem extends UIBase {

    @property(cc.Label)
    nickName: cc.Label = null;
    @property(cc.Label)
    id: cc.Label = null;
    @property(cc.Label)
    hands: cc.Label = null;
    @property(cc.Label)
    wins: cc.Label = null;

    _data = null;
    initData(data, index) {
        this._data = data;
        this.node.getComponent(cc.Sprite).enabled = index % 2 == 0;
    }
    itemClick() {
        UIComponent.open(UIDefine.UIMine_Poker)
    }
}
