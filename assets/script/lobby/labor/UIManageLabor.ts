/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 12:50:50
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIManageLabor.ts
 */


import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubGold, APIOrgClubLevelInfo, APIOrgMangerList, APIOrgMemberList, Web_Org_Club_Get, Web_Org_Club_Search_By_Id } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";
import GGSwitch from "../../ui/component/GGSwitch";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIManageLabor')
export default class UIManageLabor extends BaseForm {
    @property(cc.Node)
    contentNode: cc.Node = null;



    @property(GGSwitch)
    rusp_st: GGSwitch = null;

    @property(GGSwitch)
    yxss_st: GGSwitch = null;

    @property(GGSwitch)
    tstz_st: GGSwitch = null;

    @property(GGSwitch)
    tgllfs_st: GGSwitch = null;

    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Info"
        this.comFormTitle.initData(title, this);
        this.initTop();

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refreshClubLevel, this.initClubData);
    }

    initTop() {
        let name = cc.find('messLayout/nameNode/name', this.contentNode).getComponent(cc.Label);
        name.string = ClubCache.club_name
        let id = cc.find('messLayout/id', this.contentNode).getComponent(cc.Label);
        id.string = 'ID:' + ClubCache.random_id
        let dec = this.contentNode.getChildByName('dec').getComponent(cc.Label);
        this.setText(dec, ClubCache.desc || 'UIClub_introduce')

        let icon = cc.find('messLayout/Round', this.contentNode).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, ClubCache.logo)
        this.initClubData();
    }
    initClubData() {
        //初始化等级
        let csr = this.contentNode.getChildByName('csr')
        let panel_right = csr.getChildByName('panel_right')
        panel_right.getChildByName('name').getComponent(cc.Label).string = ClubCache.club_creator_nickname
        let icon = cc.find('Round', panel_right);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.club_creator_avatar)

        //公会等级
        let ghdj = this.contentNode.getChildByName('ghdj')
        ghdj.getChildByName('level').getComponent(cc.Label).string = 'LV.' + ClubCache.level

        //联盟
        let lm = this.contentNode.getChildByName('lm')
        let lm_panel_right = lm.getChildByName('panel_right')
        lm_panel_right.getChildByName('name').getComponent(cc.Label).string = ClubCache.tribe_name || ''
        let union_icon = cc.find('Round', lm_panel_right);
        WebImageHelper.SetHeadImage(union_icon.getComponent(cc.Sprite), ClubCache.tribe_logo
        )
        //联系方式
        let lxfs = this.contentNode.getChildByName('lxfs')
        let label = cc.find('editNode/label', lxfs).getComponent(cc.Label);
        label.string = ClubCache.more_contact

        //创建时间
        let chsj = this.contentNode.getChildByName('chsj')
        chsj.getChildByName('time').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(ClubCache.create_time)
        this.initSwitch()
    }
    initSwitch() {
        this.rusp_st.setIsOn(ClubCache.auto_audit_switch == 1)
        this.rusp_st.clickObj = {
            click: () => {
                ClubCache._msg.auto_audit_switch = ClubCache.auto_audit_switch == 1 ? 2 : 1
                UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, auto_audit_switch: ClubCache.auto_audit_switch })

            }, self: this
        };
        this.yxss_st.setIsOn(ClubCache.search_switch == 1)
        this.yxss_st.clickObj = {
            click: () => {
                ClubCache._msg.search_switch = ClubCache.search_switch == 1 ? 2 : 1
                UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, search_switch: ClubCache.search_switch })

            }, self: this
        };
        this.tstz_st.setIsOn(ClubCache.show_notice_switch == 1)
        this.tstz_st.clickObj = {
            click: () => {
                ClubCache._msg.show_notice_switch = ClubCache.show_notice_switch == 1 ? 2 : 1
                UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, show_notice_switch: ClubCache.show_notice_switch })
            }, self: this
        };
        this.tgllfs_st.setIsOn(ClubCache.show_contact_switch == 1)
        this.tgllfs_st.clickObj = {
            click: () => {
                ClubCache._msg.show_contact_switch = ClubCache.show_contact_switch == 1 ? 2 : 1
                UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, show_contact_switch: ClubCache.show_contact_switch })
            }, self: this
        };

    }

    clickLevel() {
        // this.node.active = false
        UIComponent.open(UIDefine.UIClubUpLevel)
    }

    clickRate() {
        UIComponent.open(UIDefine.UIClubRateSet)
    }
    opActive() {
        UIComponent.open(UIDefine.UIClubActive)
    }
    clickShareMath() {
        UIComponent.open(UIDefine.UIClubShareMatch)
    }






    joinUnion() {

        // UIComponent.open(UIDefine.UIJoinUnion, { type: 1 });

        // let lm = this.contentNode.getChildByName('lm')
        // let data: any = Web_Org_Club_Get.Response.data;
        // if (!data.tribe_name) {
        //     lm.active = true;
        //     UIComponent.open(UIDefine.UIJoinUnion);
        // } else {
        //     lm.active = false;
        // }
    }

    changeClubData() {
        Web_Org_Club_Get.Response.data['desc'] = this.EditBox.string
        ClubCache._msg.desc = this.EditBox.string;
        this.post(EventName.refreshClubTitle);
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, desc: this.EditBox.string })
    }
    // lxfsEditBoxCb() {
    //     this.lxfsEditBox.string = this.lxfsEditBox.string.trim()
    //     ClubCache._msg.more_contact = this.lxfsEditBox.string
    //     UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, more_contact: this.lxfsEditBox.string })

    // }


}
