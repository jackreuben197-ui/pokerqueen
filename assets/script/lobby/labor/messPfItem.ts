/*
 * @Author: xfj
 * @Date: 2022-11-12 11:38:08
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-12 12:36:41
 * @FilePath: /pokerqueen/assets/script/lobby/labor/messPfItem.ts
 */

import WebImageHelper from "../../helper/WebImageHelper";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/labor/messPfItem')
export default class messPfItem extends cc.Component {
    @property(cc.Node)
    other: cc.Node = null

    @property(cc.Node)
    ower: cc.Node = null

    @property(cc.Label)
    type: cc.Label = null

    @property(cc.Label)
    nckName: cc.Label = null

    @property(cc.RichText)
    winType: cc.RichText = null

    @property(cc.Label)
    dm: cc.Label = null

    @property(cc.Label)
    winNum: cc.Label = null

    @property(cc.Node)
    iconMask: cc.Node = null

    @property(cc.Sprite)
    icon: cc.Sprite = null
    _data = null;


    initData(data) {
        this._data = data
        this.dm.string = this._data.time
        this.ower.active = this._data.isOwen
        this.other.active = !this._data.isOwen
        this.iconMask.x = this._data.isOwen ? 447 : -447;
        WebImageHelper.SetHeadImage(this.icon, '')
        this.type.string = '牌谱分享'
        this.nckName.string = 'aaaa'
        this.winType.string = '以<color=#35A3B3>同花顺</color>获得胜利'
        this.dm.string = '40/80'
        this.winNum.string = '+888'
    }
}

