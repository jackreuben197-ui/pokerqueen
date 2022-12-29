/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-29 12:35:36
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIManageLabor.ts
 */


import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubGold, APIOrgMangerList, APIOrgMemberList, Web_Org_Club_Get, Web_Org_Club_Search_By_Id } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIManageLabor')
export default class UIManageLabor extends BaseForm {

    @property(cc.Node)
    mask_group: cc.Node = null;
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;
    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    iconNodeMan: cc.Node = null;
    @property(cc.Node)
    iconNodeMer: cc.Node = null;

    @property(cc.Node)
    rusp_st: cc.Node = null;

    @property(cc.Node)
    yxss_st: cc.Node = null;

    @property(cc.Node)
    tstz_st: cc.Node = null;

    @property(cc.Node)
    tgllfs_st: cc.Node = null;
    @property(cc.EditBox)
    lxfsEditBox: cc.EditBox = null;

    // tstz_state = 1;
    // tglxff_state = 1;
    // rusp_st_state = false
    // yxss_st_state = true;



    // @property(cc.Label)
    // lbl_glod: cc.Label = null;

    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Manage"
        this.comFormTitle.initData(title, this);
        // await UIClubModel.mInstance.APIOrgClubSearchByID(ClubCache.random_id);
        // let data: any = Web_Org_Club_Search_By_Id.Response.data
        // ClubCache.setClubData(data);
        this.initTop();
        // this.initMangerList();
        // this.initMemberList();

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        // this.listen(GGEvent.CLUB_DELE_USER, this.initMemberList);
        // this.listen(EventName.refreshAdmin, this.initMangerList);

        this.listen(EventName.clubGoldChange, this.updateGold);
        this.listen(EventName.refreshClubLevel, this.initClubData);

    }

    initTop() {
        // let data: any = Web_Org_Club_Get.Response.data;

        let name = cc.find('node_name/name', this.mask_group).getComponent(cc.Label);
        name.string = ClubCache.club_name
        let id = this.mask_group.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + ClubCache.random_id
        this.EditBox.string = ClubCache.desc   //|| '暂无公会说明'
        let icon = cc.find('iconMask/icon', this.mask_group);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.logo)

        this.initClubData();
    }
    initClubData() {
        // let data: any = Web_Org_Club_Get.Response.data;
        //初始化等级
        let ghdj = this.contentNode.getChildByName('ghdj')
        ghdj.getChildByName('level').getComponent(cc.Label).string = 'LV.' + ClubCache.level
        //初始化创始人
        let csr = this.contentNode.getChildByName('csr')
        // csr.getChildByName('pName').getComponent(cc.Label).string = data.club_creator_nickname
        let panel_right = csr.getChildByName('panel_right')
        panel_right.getChildByName('name').getComponent(cc.Label).string = ClubCache.club_creator_nickname
        let icon = cc.find('iconMask/icon', panel_right);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.club_creator_avatar)
        //创建时间
        let chsj = this.contentNode.getChildByName('chsj')
        chsj.getChildByName('time').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(ClubCache.create_time)

        this.updateGold();
        //联盟
        let lm = this.contentNode.getChildByName('lm')
        let lm_panel_right = lm.getChildByName('panel_right')
        lm_panel_right.getChildByName('name').getComponent(cc.Label).string = ClubCache.tribe_name || ''
        this.lxfsEditBox.string = ClubCache.more_contact

        this.initYxssAndRusp();
        this.initTctz();
        this.initTgllxf();
    }

    updateGold() {
        let jj = this.contentNode.getChildByName('jj')
        let lbl_gold = cc.find('img_right_bg/lbl_glod', jj).getComponent(cc.Label);
        this.setText(lbl_gold, GC.data.club.info.displayGold);
    }
    clickAdmin() {
        UIComponent.open(UIDefine.UIAuditAdmin)
    }

    async initMangerList() {
        let data: any = Web_Org_Club_Get.Response.data;
        // await UIClubModel.mInstance.APIOrgMangerList(data.random_id);
        // data = APIOrgMangerList.Response.data

        await UIClubModel.mInstance.APIOrgMangerList(data.random_id, 5, 0);
        data = APIOrgMangerList.Response.data
        for (let index = 0; index < this.iconNodeMan.childrenCount; index++) {
            const element = this.iconNodeMan.children[index];
            element.active = false;
        }
        for (let index = 0; index < data?.data?.length; index++) {

            const element = this.iconNodeMan.children[index].getChildByName('icon').getComponent(cc.Sprite);
            WebImageHelper.SetHeadImage(element, data?.data[index].avatar)
            this.iconNodeMan.children[index].active = true;
        }
    }
    async initMemberList() {
        let data: any = Web_Org_Club_Get.Response.data;
        await UIClubModel.mInstance.APIOrgMemberList(data.random_id);
        data = APIOrgMemberList.Response.data;
        for (let index = 0; index < this.iconNodeMer.childrenCount; index++) {
            const element = this.iconNodeMer.children[index];
            element.active = false
        }
        for (let index = 0; index < data?.data?.length; index++) {

            const element = this.iconNodeMer.children[index].getChildByName('icon').getComponent(cc.Sprite);
            WebImageHelper.SetHeadImage(element, data?.data[index].avatar)
            this.iconNodeMer.children[index].active = true;
        }
    }
    managementMember() {
        UIComponent.open(UIDefine.UIClubMerberManager);
    }
    joinUnion() {

        UIComponent.open(UIDefine.UIJoinUnion);

        // let lm = this.contentNode.getChildByName('lm')
        // let data: any = Web_Org_Club_Get.Response.data;
        // if (!data.tribe_name) {
        //     lm.active = true;
        //     UIComponent.open(UIDefine.UIJoinUnion);
        // } else {
        //     lm.active = false;
        // }
    }
    initYxssAndRusp() {
        let st2 = this.yxss_st.getChildByName('st2')
        let st4 = this.yxss_st.getChildByName('st4')
        st2.active = ClubCache.search_switch == 1
        st4.active = !st2.active

        let st21 = this.rusp_st.getChildByName('st2')
        let st41 = this.rusp_st.getChildByName('st4')
        st21.active = ClubCache.auto_audit_switch == 1
        st41.active = !st21.active
    }
    yxssClick() {
        ClubCache._msg.search_switch = ClubCache.search_switch == 1 ? 2 : 1
        this.initYxssAndRusp();
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, search_switch: ClubCache.search_switch })
    }
    ruspClick() {
        ClubCache._msg.auto_audit_switch = ClubCache.auto_audit_switch == 1 ? 2 : 1
        this.initYxssAndRusp();
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, auto_audit_switch: ClubCache.auto_audit_switch })
    }
    initTgllxf() {
        let st22 = this.tgllfs_st.getChildByName('st2')
        let st42 = this.tgllfs_st.getChildByName('st4')
        st22.active = ClubCache.show_contact_switch == 1
        st42.active = !st22.active
    }
    tglxfsClick() {
        ClubCache._msg.show_contact_switch = ClubCache.show_contact_switch == 1 ? 2 : 1
        this.initTgllxf();
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, show_contact_switch: ClubCache.show_contact_switch })
    }

    initTctz() {
        let st22 = this.tstz_st.getChildByName('st2')
        let st42 = this.tstz_st.getChildByName('st4')
        st22.active = ClubCache.show_notice_switch == 1
        st42.active = !st22.active
    }
    tctzClick() {
        ClubCache._msg.show_notice_switch = ClubCache.show_notice_switch == 1 ? 2 : 1
        this.initTctz();
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, show_notice_switch: ClubCache.show_notice_switch })

    }

    changeClubData() {
        Web_Org_Club_Get.Response.data['desc'] = this.EditBox.string
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, desc: this.EditBox.string })
    }
    clickActive() {
        UIComponent.open(UIDefine.UIClubActive)
    }
    clickDateManage() {
        UIComponent.open(UIDefine.UIClubDataMange)
    }

    clickJijin() {
        UIComponent.open(UIDefine.MyWalletForm, true)
    }
    clickLevel() {
        // this.node.active = false
        UIComponent.open(UIDefine.UIClubUpLevel)
    }

    clickRate() {
        UIComponent.open(UIDefine.UIClubRateSet)
        // UIComponent.open(UIDefine.UIClubActive)
    }

    lxfsEditBoxCb() {
        this.lxfsEditBox.string = this.lxfsEditBox.string.trim()
        ClubCache._msg.more_contact = this.lxfsEditBox.string
        UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, more_contact: this.lxfsEditBox.string })

    }


}
