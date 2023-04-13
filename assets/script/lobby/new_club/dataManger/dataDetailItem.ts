/*
 * @Author: xfj
 * @Date: 2023-04-06 13:24:06
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-11 12:03:32
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/dataManger/dataDetailItem.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import { StringHelper } from "../../../helper/StringHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/dataManger/dataDetailItem')

export default class dataDetailItem extends UIBase {
    _data = null;
    _order_by = 'fee'
    pt: cc.Node = null;
    mtt: cc.Node = null;
    sp_icon: cc.Sprite = null;
    lbl_name: cc.Label = null;
    lbl_fee: cc.Label = null;
    lbl_id: cc.Label = null;
    lbl_win: cc.Label = null;
    lbl_runk: cc.Label = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.pt = this.getChildNodeOrComponent('pt')
        this.mtt = this.getChildNodeOrComponent('mtt')

        this.lbl_name = this.getChildNodeOrComponent('lbl_name', cc.Label)
        this.lbl_fee = this.getChildNodeOrComponent('lbl_fee', cc.Label)
        this.lbl_id = this.getChildNodeOrComponent('lbl_id', cc.Label)
        this.lbl_win = this.getChildNodeOrComponent('lbl_win', cc.Label)
        this.sp_icon = this.getChildNodeOrComponent('Round', cc.Sprite)

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
    }
    initData(data, order_by, index) {
        let node = this.pt;
        this._data = data;
        this.mtt.active = this._data.is_match
        this.pt.active = !this.mtt.active

        if (this._data.is_match) {
            node = this.mtt
            this.lbl_runk = cc.find('lblNode/lbl_runk', node).getComponent(cc.Label)
            this.lbl_runk.string = index
        }
        this.lbl_name = cc.find('lblNode/lbl_name', node).getComponent(cc.Label)
        this.lbl_fee = cc.find('lblNode/lbl_fee', node).getComponent(cc.Label)
        this.lbl_id = cc.find('lblNode/lbl_id', node).getComponent(cc.Label)
        this.lbl_win = cc.find('lblNode/lbl_win', node).getComponent(cc.Label)
        this.sp_icon = node.getChildByName('Round').getComponent(cc.Sprite)
        this._order_by = order_by
        this.initUI();
    }
    initUI() {
        this.setText(this.lbl_name, StringHelper.LengthNick(this._data.nick_name))
        this.setText(this.lbl_id, this._data.random_id)
        WebImageHelper.SetHeadImage(this.sp_icon, this._data.avatar)
        this.setFeeType()
        this.setColor()

    }
    setColor() {
        if (this._data.win > 0) {
            this.setText(this.lbl_win, "+" + StringHelper.GetLongString(this._data.win))
            this.setTextColor(this.lbl_win, '#47AB8D')
        } else {
            this.setText(this.lbl_win, StringHelper.GetLongString(this._data.win))
            this.setTextColor(this.lbl_win, '#CC4629')
        }
    }
    setFeeType() {
        switch (this._order_by) {
            case 'fee':
                this.setText(this.lbl_fee, StringHelper.GetLongString(this._data.fee))

                break;
            case 'buy_in':
                this.setText(this.lbl_fee, StringHelper.GetLongString(this._data.buy_in))

                break;
            case 'insurance':
                this.setText(this.lbl_fee, this._data.insurance)

                break;
            case 'hand_num':
                this.setText(this.lbl_fee, this._data.hand_num)

                break;

            default:
                break;
        }

    }

}
