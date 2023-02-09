/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-09 11:38:11
 * @FilePath: /pokerqueen/assets/script/lobby/career/recordDetailItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UICareerModel } from "./UICareerModel";

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
    @property(cc.Node)
    nomal: cc.Node = null;
    @property(cc.Node)
    mtt: cc.Node = null;
    @property(cc.Node)
    sortNode: cc.Node = null;
    _data = null;
    initData(data, index, gameType = 0) {
        this._data = data;
        this.setText(this.nickName, StringHelper.LengthNick(this._data.nick_name))
        this.id.string = 'ID:' + this._data.user_random_id
        this.nomal.active = gameType == 0
        this.mtt.active = gameType == 1
        if (gameType == 0) {
            this.setText(this.buyin, StringHelper.GetLongString(this._data.bring_in))
            this.setText(this.hands, this._data.user_room_hand_num)
            this.setText(this.wins, StringHelper.GetLongString(this._data.bring_out - this._data.bring_in))
            this.setTextColor(this.wins, this._data.bring_out - this._data.bring_in < 0 ? '#FF7C7C' : '#B0FFAE')
        } else {
            let USDT = this.mtt.getChildByName('USDT')
            let uc_big = USDT.getChildByName('uc_big')
            uc_big.active = UICareerModel.mInstance._coinType == 1
            let num = USDT.getChildByName('num').getComponent(cc.Label)
            num.string = StringHelper.GetLongString(this._data.award)

            let USDT1 = this.mtt.getChildByName('USDT1')
            let uc_big1 = USDT1.getChildByName('uc_big')
            uc_big1.active = UICareerModel.mInstance._coinType == 1
            let num1 = USDT1.getChildByName('num').getComponent(cc.Label)
            num1.string = StringHelper.GetLongString(this._data.hunter_award)
            USDT1.active = this._data.hunter_award != 0
        }
        WebImageHelper.SetHeadImage(this.icon, this._data.avatar);
        let num = this.sortNode.getChildByName('num' + (index + 1))
        if (num) {
            num.active = true
        }
        this.node.getComponent(cc.Sprite).enabled = index % 2 == 0;
    }
    // itemClick() {
    //     UIComponent.open(UIDefine.UIRecordHands, { type: 2 })
    // }
}
