/*
 * @Author: xfj
 * @Date: 2023-04-06 13:24:06
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-07 12:07:08
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/dataManger/dataItem.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/dataManger/dataItem')

export default class dataItem extends UIBase {
    _data = null;
    lbl_longTime: cc.Label = null;
    lbl_game: cc.Label = null;
    lbl_staus: cc.Label = null;
    lbl_date: cc.Label = null;
    lbl_fee: cc.Label = null;
    lbl_mr: cc.Label = null;
    lbl_mz: cc.Label = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.lbl_game = this.getChildNodeOrComponent('lbl_game', cc.Label)
        this.lbl_staus = this.getChildNodeOrComponent('lbl_staus', cc.Label)
        this.lbl_date = this.getChildNodeOrComponent('lbl_date', cc.Label)
        this.lbl_fee = this.getChildNodeOrComponent('lbl_fee', cc.Label)
        this.lbl_mr = this.getChildNodeOrComponent('lbl_mr', cc.Label)
        this.lbl_mz = this.getChildNodeOrComponent('lbl_mz', cc.Label)
        this.lbl_longTime = this.getChildNodeOrComponent('lbl_longTime', cc.Label)

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
    }
    initData(data) {
        this._data = data;
        this.initUI();
    }
    initUI() {
        this.setText(this.lbl_staus, this.staus)
        this.setText(this.lbl_game, this.gameType.type)
        this.setTextColor(this.lbl_game, this.gameType.color)
        this.setText(this.lbl_date, `${new Date(this._data.start_time_str).getHours()}: ${TimeHelper.toTimeFormat(new Date(this._data.start_time_str).getMinutes())}`)
        this.setText(this.lbl_fee, StringHelper.GetLongString(this._data.fee))
        this.setText(this.lbl_mr, StringHelper.getStringDiv100(this._data.buy_in))
        this.setText(this.lbl_mz, `${StringHelper.getStringDiv100(this._data.sb)}/${StringHelper.getStringDiv100(this._data.sb * 2)}`)
        this.setText(this.lbl_longTime, this._data.date)
    }
    get staus() {
        let string = ''
        switch (this._data.game_status) {
            case 1:
                string = 'MTT_State_NotStart'
                break;
            case 2:
                string = 'adaptation10186'
                break;
            case 3:
                string = 'Mtt_Complete'
                break;

            default:
                break;
        }
        return string
    }
    get gameType() {
        let string = ''
        let color = null
        switch (this._data.game_type) {
            case 1:
                string = 'NLH'
                color = cc.color().fromHEX('#83B518')
                break;
            case 2:
                string = 'PLO'
                color = cc.color().fromHEX('#5096FF')
                break;
            case 3:
                string = '6+'
                color = cc.color().fromHEX('#DE5C5C')
                break;

            default:
                break;
        }
        return { type: string, color: color }
    }
    click() {
        UIComponent.open(UIDefine.UIFriendDataDetail, this._data.room_id)
    }
}
