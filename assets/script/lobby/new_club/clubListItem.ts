/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 11:05:57
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/clubListItem.ts
 */

import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import SceneManager from "../../manager/SceneManager";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { ClubAdmin } from "../labor/UILabarPlayViewForm";

const { ccclass, property, menu } = cc._decorator;

@ccclass

@menu('脚本分组/new_club/clubListItem')

export default class clubListItem extends UIBase {
    _data = null;
    initData(data) {
        this._data = data
        this.initView();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        GC.notify.register(EventName.refreshClubData, () => {
            if (this._data?.club_id == ClubCache.club_id) {
                this.node['info'] = ClubCache._msg;
            }
        }, this)
    }
    initView() {
        cc.find('messLayout/name', this.node).getComponent(cc.Label).string = this._data.club_name
        cc.find('messLayout/id', this.node).getComponent(cc.Label).string = 'ID:' + this._data.random_id
        cc.find('table/data', this.node).getComponent(cc.Label).string = this._data.tables
        cc.find('people/data', this.node).getComponent(cc.Label).string = this._data.club_members

        let icon = cc.find('iconMask/icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.logo)
        this.node['info'] = this._data;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
    }

    onClickItem(event) {
        let target = event.target;
        let info = target.info;
        ClubCache.setClubData(info);
        UIComponent.open(UIDefine.UIClubHome, info, { SceneUI: SceneManager.Instance.currUI });
    }
}
