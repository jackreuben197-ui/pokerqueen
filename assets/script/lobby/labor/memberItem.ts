/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 18:13:19
 * @FilePath: /pokerqueen/assets/script/lobby/labor/memberItem.ts
 */

import { UIDefine } from "../../define/UIDefine";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/memberItem')
export default class memberItem extends UIBase {
    _data = null;
    initData(data) {
        this._data = data
        this.initView();
    }
    initView() {
        this.node.getChildByName('name').getComponent(cc.Label).string = this._data.nick_name
        this.node.getChildByName('id').getComponent(cc.Label).string = this._data.random_num
        this.node.getChildByName('data').getComponent(cc.Label).string = TimeHelper.ShowRemainingSemicolon2((new Date().getTime() / 1000 - this._data.last_login_time))
        this.node['last_login_time'] = this._data.last_login_time
        let icon = cc.find('iconMask/icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.avatar)
        this.node['info'] = this._data;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        this.node.getChildByName('img_lock').active = this._data.forbidden;
    }

    onClickItem(event) {
        let target = event.target;
        let info = target.info;
        UIComponent.open(UIDefine.UIMember, { info: info });
    }
}
