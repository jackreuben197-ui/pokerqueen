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


            this.setChildVisible(this.mtt, "Gold1/uc", UICareerModel.mInstance._coinType == 1);
            this.setChildVisible(this.mtt, "Gold1/gc", UICareerModel.mInstance._coinType == 2);
            this.setChildVisible(this.mtt, "Gold1/dc", UICareerModel.mInstance._coinType == 4);
            this.setChildLabel(this.mtt, "Gold1/num", UICareerModel.mInstance._coinType == 4 ? this._data.award : StringHelper.GetLongString(this._data.award));



            this.setChildVisible(this.mtt, "Gold2", this._data.hunter_award != 0);
            this.setChildVisible(this.mtt, "Gold2/uc", UICareerModel.mInstance._coinType == 1);
            this.setChildVisible(this.mtt, "Gold2/gc", UICareerModel.mInstance._coinType == 2);
            this.setChildVisible(this.mtt, "Gold2/dc", UICareerModel.mInstance._coinType == 4);
            this.setChildLabel(this.mtt, "Gold2/num", UICareerModel.mInstance._coinType == 4 ? this._data.hunter_award : StringHelper.GetLongString(this._data.hunter_award));


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
