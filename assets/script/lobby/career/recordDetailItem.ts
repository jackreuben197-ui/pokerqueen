/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-03 17:15:21
 * @FilePath: /pokerqueen/assets/script/lobby/career/recordDetailItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIDefine } from "../../define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/recordDetailItem')
export default class recordDetailItem extends UIBase {
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    nickName: cc.Label = null;
    @property(cc.Label)
    id: cc.Label = null;
    @property(cc.Label)
    buyin: cc.Label = null;
    @property(cc.Label)
    hands: cc.Label = null;
    @property(cc.Label)
    wins: cc.Label = null;

    _data = null;
    initData(data, index) {
        this._data = data;
        let num = this.icon.node.getChildByName('num' + (index + 1))
        if (num) {
            num.active = true
        }
        this.node.getComponent(cc.Sprite).enabled = index % 2 == 0;
    }
    itemClick() {
        UIComponent.open(UIDefine.UIRecordHands, { type: 2 })
    }
}
