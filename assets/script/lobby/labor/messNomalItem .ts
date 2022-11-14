/*
 * @Author: xfj
 * @Date: 2022-11-12 11:36:57
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-14 17:14:21
 * @FilePath: /pokerqueen/assets/script/lobby/labor/messNomalItem .ts
 */

import WebImageHelper from "../../helper/WebImageHelper";
import { Web_User_Info } from "../../net/https/WebRequest";


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
        let id = Web_User_Info.Response.data.user.user_id
        this.ower.active = this._data.sender_id == id
        this.other.active = !this.ower.active
        this.iconMask.x = this._data.sender_id == id ? 447 : -447;
        WebImageHelper.SetHeadImage(this.icon, '')
        let cont = this._data.sender_id == id ? this.ower.getChildByName('name') : this.other.getChildByName('name')
        cont.getComponent(cc.Label).string = this._data.content;
        setTimeout(() => {
            this.node.height = cont.height + 150 > 250 ? cont.height + 150 : 250

        }, 100)

    }
}
