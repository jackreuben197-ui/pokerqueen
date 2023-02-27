/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-27 12:03:23
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/memberAdmin/MemberItem.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { ClubUserDataCache } from "../../../frame/data/club/ClubUserDataCache";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { APIOrgClubUserInfo, Web_User_Info } from "../../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/MemberItem')
export default class MemberItem extends UIBase {
    _data = null;

    initData(data, index) {
        this.node.getChildByName('Rectangle').active = index % 2 == 0
        this._data = data
        this.initView();
    }
    initView() {

        cc.find('messLayout/panle/name', this.node).getComponent(cc.Label).string = this._data.nick_name
        let hg = cc.find('messLayout/panle/hg', this.node)
        hg.active = true;
        // //0-所有;1-普通;2-创建者;3-管理员;4-代理;
        ClubCache.setRoleType(hg, this._data.user_level)

        cc.find('messLayout/id', this.node).getComponent(cc.Label).string = 'ID:' + this._data.random_num
        if (this._data.remark_desc && this._data.remark_desc != '') {
            let beizhu = cc.find('messLayout/beizhu', this.node)
            beizhu.active = true;
            beizhu.getComponent(cc.Label).string = '备注: ' + this._data.remark_desc

        }
        // cc.find('messLayout/xiaxian', this.node).getComponent(cc.Label).string


        if (this._data.agent_random_id) {
            let vip = cc.find('messLayout/guibin', this.node)
            vip.active = true
            vip.getComponent(cc.Label).string = i18nMgr.Get('UIClub_AgentItem') + " ID:" + this._data.agent_random_id
        }
        cc.find('messLayout/panle/data', this.node).getComponent(cc.Label).string = this._data.last_login_time_str
        // this.node.getChildByName('data')// TimeHelper.ShowRemainingSemicolon2((new Date().getTime() / 1000 - this._data.last_login_time))
        this.node['last_login_time'] = this._data.last_login_time_str
        let icon = cc.find('icon', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.avatar)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        this.node.getChildByName('img_lock').active = this._data.forbidden;
    }

    async onClickItem(event) {
        await UIClubModel.mInstance.APIOrgClubUserInfo({
            "user_id": this._data.user_id,
            "club_id": ClubCache.club_id
        })
        let data: any = APIOrgClubUserInfo.Response.data
        ClubUserDataCache.setUserData(data);
        // data.user_info.user_join_club_time = this._data.user_join_club_time
        // data.user_info.remark_desc = this._data.remark_desc
        // data.user_info.remark_name = this._data.remark_name

        UIComponent.open(UIDefine.UIClubMember, { info: data, agent_random_id: this._data.agent_random_id });
    }
}
