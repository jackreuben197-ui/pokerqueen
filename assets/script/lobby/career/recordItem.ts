/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-07 17:57:16
 * @FilePath: /pokerqueen/assets/script/lobby/career/recordItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { stringify } from "querystring";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/career/recordItem')
export default class recordItem extends UIBase {
    lbl_1: cc.Label = null;
    lbl_11: cc.Label = null;
    lbl_22: cc.Label = null;
    lbl_33: cc.Label = null;
    lbl_44: cc.Label = null;
    lbl_55: cc.Label = null;
    gameType: cc.Label = null;
    mtt_lbl_1: cc.Label = null;
    mtt_lbl_11: cc.Label = null;
    mtt_lbl_44: cc.Label = null;
    lbl_node: cc.Node = null;
    mtt_lbl_node: cc.Node = null;
    _data = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.lbl_1 = this.getChildNodeOrComponent('lbl_1', cc.Label)
        this.lbl_11 = this.getChildNodeOrComponent('lbl_11', cc.Label)
        this.lbl_22 = this.getChildNodeOrComponent('lbl_22', cc.Label)
        this.lbl_33 = this.getChildNodeOrComponent('lbl_33', cc.Label)
        this.lbl_44 = this.getChildNodeOrComponent('lbl_44', cc.Label)
        this.lbl_55 = this.getChildNodeOrComponent('lbl_55', cc.Label)
        this.gameType = this.getChildNodeOrComponent('gameType', cc.Label)
        this.mtt_lbl_1 = this.getChildNodeOrComponent('mtt_lbl_1', cc.Label)
        this.mtt_lbl_11 = this.getChildNodeOrComponent('mtt_lbl_11', cc.Label)
        this.mtt_lbl_44 = this.getChildNodeOrComponent('mtt_lbl_44', cc.Label)
        this.lbl_node = this.getChildNodeOrComponent('lbl_node')
        this.mtt_lbl_node = this.getChildNodeOrComponent('mtt_lbl_node')
    }
    onShow(param?, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

    }
    initData(data) {
        this._data = data;
        this.lbl_node.active = false;
        this.mtt_lbl_node.active = false
        if (this._data.game_type_name == 'MTT') {
            this.mtt_lbl_node.active = true
            this.setText(this.mtt_lbl_1, StringHelper.LengthNick(GC.data.languageTemp.temp.getName(this._data.Name)))
            this.mtt_lbl_11.string = 'ID:' + this._data.RoomID
            this.setText(this.mtt_lbl_44, TimeHelper.convertUTCTimeToLocalTime(this._data.end_time))
        } else {
            this.lbl_node.active = true;
            this.setText(this.lbl_1, StringHelper.LengthNick(GC.data.languageTemp.temp.getName(this._data.Name)))
            this.lbl_11.string = 'ID:' + this._data.RoomID
            this.setText(this.lbl_22, this._data.hand_num)
            this.setText(this.lbl_33, this._data.blinds)
            this.setText(this.lbl_44, TimeHelper.convertUTCTimeToLocalTime(this._data.end_time))
        }
        this.lbl_55.string = (this._data.Change < 0 ? '' : '+') + StringHelper.GetLongString(this._data.Change)
        this.setTextColor(this.lbl_55, this._data.Change < 0 ? '#FF7C7C' : '#B0FFAE')
        this.setText(this.gameType, this._data.game_type_name);
        this.setGameType();
    }
    itemClick() {
        UIComponent.open(UIDefine.UIRecordDetail, this._data.RoomID)
    }
    setGameType() {
        switch (this._data.game_type_name) {
            case 'NLH':

                break;
            case 'PLO':

                break;
            case '6+':

                break;
            case '6+':

                break;

            default:
                break;
        }

    }
}
