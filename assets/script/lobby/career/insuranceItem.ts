/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-26 12:39:52
 * @FilePath: /pokerqueen/assets/script/lobby/career/insuranceItem.ts
 */


import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/insuranceItem')
export default class insuranceItem extends UIBase {

    @property(cc.Label)
    nickName: cc.Label = null;
    @property(cc.Label)
    runk: cc.Label = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    insuranceNum: cc.Label = null;

    _data = null;
    initData(data, index) {
        this._data = data;
        this.setText(this.nickName, StringHelper.LengthNick(GC.data.languageTemp.temp.getName(this._data.nick_name)))
        this.runk.string = index + 1
        WebImageHelper.SetHeadImage(this.icon, this._data.avatar)
        // this.node.getComponent(cc.Sprite).enabled = index % 2 == 0;
        this.insuranceNum.string = this._data.insurance
        this.setColor()
    }
    setColor() {
        let color = null;
        if (this._data.insurance > 0) {
            color = cc.color().fromHEX('#47AB8D')
        } else if (this._data.insurance == 0) {
            color = cc.color().fromHEX('#FFFFFF')
        } else {
            color = cc.color().fromHEX('#CC4629')
        }
        this.insuranceNum.node.color = color;
    }

}
