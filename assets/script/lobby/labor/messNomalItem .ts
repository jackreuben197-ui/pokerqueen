/*
 * @Author: xfj
 * @Date: 2022-11-12 11:36:57
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-12 12:57:36
 * @FilePath: /pokerqueen/assets/script/lobby/labor/messNomalItem .ts
 */

import WebImageHelper from "../../helper/WebImageHelper";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/labor/messNomalItem')
export default class messNomalItem extends cc.Component {

    @property(cc.Node)
    other: cc.Node = null

    @property(cc.Node)
    ower: cc.Node = null

    @property(cc.Node)
    iconMask: cc.Node = null

    @property(cc.Sprite)
    icon: cc.Sprite = null
    _data = null;


    initData(data) {
        this._data = data
        this.ower.active = this._data.isOwen
        this.other.active = !this._data.isOwen
        this.iconMask.x = this._data.isOwen ? 447 : -447;
        WebImageHelper.SetHeadImage(this.icon, '')
        let cont = this._data.isOwen ? this.ower.getChildByName('name') : this.other.getChildByName('name')
        cont.getComponent(cc.Label).string = this._data.lbl;
        setTimeout(() => {
            this.node.height = cont.height + 150 > 250 ? cont.height + 150 : 250
        }, 100)

    }
}
