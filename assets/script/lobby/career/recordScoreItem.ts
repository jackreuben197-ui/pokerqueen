/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-07 18:02:20
 * @FilePath: /pokerqueen/assets/script/lobby/career/recordScoreItem.ts
 */


import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
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
        this.setText(this.nickName, StringHelper.LengthNick(GC.data.languageTemp.temp.getName(this._data.name)))
        this.id.string = 'ID:' + this._data.room_id
        this.hands.string = this._data.hand_num + i18nMgr.Get('UICareerhands')
        this.setText(this.wins, StringHelper.GetLongString(this._data.change))
        this.setTextColor(this.wins, this._data.change < 0 ? '#FF7C7C' : '#B0FFAE')

        this.node.getComponent(cc.Sprite).enabled = index % 2 == 0;
    }
    itemClick() {
        UIComponent.open(UIDefine.UIMine_Poker, { info: this._data })
    }
}
