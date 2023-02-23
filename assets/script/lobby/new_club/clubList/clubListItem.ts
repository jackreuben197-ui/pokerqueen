/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-23 11:20:42
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/clubList/clubListItem.ts
 */

import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import SceneManager from "../../../manager/SceneManager";
import { Web_Org_Club_Search_By_Id } from "../../../net/https/WebRequest";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import { ClubAdmin } from "../../labor/UILabarPlayViewForm";

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
        // GC.notify.register(EventName.refreshClubData, () => {
        //     if (this._data?.club_id == ClubCache.club_id) {
        //         this.node['info'] = ClubCache._msg;
        //     }
        // }, this)
    }
    initView() {
        cc.find('messLayout/name', this.node).getComponent(cc.Label).string = this._data.club_name
        cc.find('id', this.node).getComponent(cc.Label).string = 'ID:' + this._data.random_id
        cc.find('table/data', this.node).getComponent(cc.Label).string = this._data.tables
        cc.find('people/data', this.node).getComponent(cc.Label).string = this._data.club_members

        let icon = cc.find('Round', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.logo)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        let iconRole = cc.find('messLayout/hg', this.node);
        if (this._data.user_level == 0) {
            iconRole.active = false;
            return;
        }
        ClubCache.setRoleType(iconRole.getComponent(cc.Sprite), this._data.user_level)
    }


    async onClickItem(event) {
        await UIClubModel.mInstance.APIOrgClubSearchByID(this._data.random_id);
        let data: any = Web_Org_Club_Search_By_Id.Response.data
        ClubCache.setClubData(data);

        UIComponent.open(UIDefine.UIClubHome, null, { SceneUI: SceneManager.Instance.currUI });
    }
}
