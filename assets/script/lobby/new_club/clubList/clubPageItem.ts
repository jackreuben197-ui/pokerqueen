/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-23 11:01:58
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/clubList/clubPageItem.ts
 */

import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import SceneManager from "../../../manager/SceneManager";
import { Web_Org_Club_Search_By_Id } from "../../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";

const { ccclass, property, menu } = cc._decorator;

@ccclass

@menu('脚本分组/new_club/clubPageItem')

export default class clubPageItem extends UIBase {
    @property(cc.Node)
    messNode: cc.Node = null;

    @property(cc.Node)
    nomalNode: cc.Node = null;
    _data = null;
    initData(data) {
        this._data = data
        this.messNode.active = this._data != null
        this.nomalNode.active = this._data == null
        if (this._data) {
            this.initView();
        }
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        // GC.notify.register(EventName.refreshClubData, () => {
        //     if (this._data?.club_id == ClubCache.club_id) {
        //         this.node['info'] = ClubCache._msg;
        //     }
        // }, this)
    }
    async initView() {

        cc.find('node/messLayout/name', this.messNode).getComponent(cc.Label).string = this._data.club_name
        cc.find('node/messLayout/id', this.messNode).getComponent(cc.Label).string = 'ID:' + this._data.random_id
        cc.find('table/data', this.messNode).getComponent(cc.Label).string = this._data.tables
        cc.find('people/data', this.messNode).getComponent(cc.Label).string = this._data.club_members
        let icon = cc.find('Group_3340/Round', this.messNode);
        // WebImageHelper.setImageSize(icon.getComponent(cc.Sprite), 398, 398)

        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.logo)
        // this.node['info'] = this._data;
        // this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        let hg = cc.find('node/iconRole/icon', this.messNode);
        hg.active = true;
        if (this._data.user_level == 0) {
            let iconRole = cc.find('node/iconRole', this.messNode);
            iconRole.active = false;
            return;
        }
        ClubCache.setRoleType(hg, this._data.user_level)
    }

    async onClickItem(event) {
        // return;
        await UIClubModel.mInstance.APIOrgClubSearchByID(this._data.random_id);
        let data: any = Web_Org_Club_Search_By_Id.Response.data
        ClubCache.setClubData(data);
        // , { SceneUI: SceneManager.Instance.currUI }
        UIComponent.open(UIDefine.UIClubHome, null);
    }
    createClub() {
        UIComponent.open(UIDefine.UICreatelabor, null, { SceneUI: SceneManager.Instance.currUI });
    }
}
