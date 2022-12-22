/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 13:12:39
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/memberItem.ts
 */

import { UIDefine } from "../../define/UIDefine";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/MemberItem')
export default class MemberItem extends UIBase {
    _data = null;
    initData(data) {
        this._data = data
        this.initView();
    }
    initView() {
        cc.find('messLayout/nameNode/name', this.node).getComponent(cc.Label).string = this._data.nick_name
        let hg = cc.find('messLayout/nameNode/hg', this.node)
        hg.active = true;
        // //0-所有;1-普通;2-创建者;3-管理员;4-代理;
        switch (this._data.user_level) {
            case 0:
                hg.active = false;
                break;
            case 1:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg03', AssetFold.texture_new_club)

                break;
            case 2:
                break;
            case 3:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg02', AssetFold.texture_new_club)
                break;
            case 4:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg01', AssetFold.texture_new_club)
                break;
            default:
                break;
        }
        cc.find('messLayout/id', this.node).getComponent(cc.Label).string = 'ID:' + this._data.random_num
        // cc.find('messLayout/beizhu', this.node).getComponent(cc.Label).string
        // cc.find('messLayout/xiaxian', this.node).getComponent(cc.Label).string
        // cc.find('messLayout/guibin', this.node).getComponent(cc.Label).string


        this.node.getChildByName('data').getComponent(cc.Label).string = this._data.last_login_time_str// TimeHelper.ShowRemainingSemicolon2((new Date().getTime() / 1000 - this._data.last_login_time))
        this.node['last_login_time'] = this._data.last_login_time_str
        let icon = cc.find('iconMask/icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.avatar)
        this.node['info'] = this._data;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        this.node.getChildByName('img_lock').active = this._data.forbidden;
    }

    onClickItem(event) {
        let target = event.target;
        let info = target.info;
        UIComponent.open(UIDefine.UIClubMember, { info: info });
    }
}
