/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-20 17:47:51
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIManageLabor.ts
 */


import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubGold, APIOrgMangerList, APIOrgMemberList, Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";
import ComFormTitle from "../../common/ComFormTitle";

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
    rusp_st_state = false
    yxss_st_state = true;

    @property(cc.Label)
    lbl_glod: cc.Label = null;

    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Manage"
        this.comFormTitle.initData(title, this);
        this.initTop();
        this.initMangerList();

        this.initMemberList();

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.clubGoldChange, this.updateGold);
        this.listen(EventName.refreshAdmin, this.initMangerList);
        this.listen(EventName.refreshClubLevel, this.initClubData);
        this.listen(GGEvent.CLUB_DELE_USER, this.initMemberList);

    }

    initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let name = cc.find('node_name/name', this.mask_group).getComponent(cc.Label);
        name.string = data.club_name
        let id = this.mask_group.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + data.random_id
        this.EditBox.string = data.desc   //|| '暂无公会说明'
        let icon = cc.find('iconMask/icon', this.mask_group);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), data.logo)
        this.initClubData();
    }
    initClubData() {
        let data: any = Web_Org_Club_Get.Response.data;
        //初始化等级
        let ghdj = this.contentNode.getChildByName('ghdj')
        ghdj.getChildByName('level').getComponent(cc.Label).string = 'LV.' + data.level
        //初始化创始人
        let csr = this.contentNode.getChildByName('csr')
        // csr.getChildByName('pName').getComponent(cc.Label).string = data.club_creator_nickname
        let panel_right = csr.getChildByName('panel_right')
        panel_right.getChildByName('name').getComponent(cc.Label).string = data.club_creator_nickname
        let icon = cc.find('iconMask/icon', panel_right);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), data.club_creator_avatar)
        //创建时间
        let chsj = this.contentNode.getChildByName('chsj')
        chsj.getChildByName('time').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(data.create_time)

        //基金
        // let _data: any = APIOrgClubGold.Response.data

        this.updateGold();
        //联盟
        let lm = this.contentNode.getChildByName('lm')
        let lm_panel_right = lm.getChildByName('panel_right')
        lm_panel_right.getChildByName('name').getComponent(cc.Label).string = data.tribe_name || ''
        this.initYxssAndRusp();
        // if (data.tribe_name) {
        //     lm.active = true
        // } else {
        //     lm.active = false
        // }
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
        let data = Web_Org_Club_Get.Response.data;
        let st2 = this.yxss_st.getChildByName('st2')
        let st4 = this.yxss_st.getChildByName('st4')
        if (data.search_switch == 1) {
            this.yxss_st_state = true
        } else {
            this.yxss_st_state = false
        }
        st2.active = this.yxss_st_state
        st4.active = !st2.active
        if (data.auto_audit_switch == 1) {
            this.rusp_st_state = true;
        } else {
            this.rusp_st_state = false;
        }

        let st21 = this.rusp_st.getChildByName('st2')
        let st41 = this.rusp_st.getChildByName('st4')
        st21.active = this.rusp_st_state
        st41.active = !st21.active
    }
    yxssClick() {

        let st2 = this.yxss_st.getChildByName('st2')
        let st4 = this.yxss_st.getChildByName('st4')
        this.yxss_st_state = !this.yxss_st_state
        st2.active = this.yxss_st_state
        st4.active = !st2.active
        let search_switch = 1;
        if (this.yxss_st_state == true) {
            search_switch = 1
        } else {
            search_switch = 2
        }
        UIClubModel.mInstance.APIOrgChangeClubData({ search_switch: search_switch })

    }

    ruspClick() {
        this.rusp_st_state = !this.rusp_st_state
        let st2 = this.rusp_st.getChildByName('st2')
        let st4 = this.rusp_st.getChildByName('st4')
        st2.active = this.rusp_st_state
        st4.active = !st2.active
        let auto_audit_switch = 1;
        if (this.rusp_st_state == true) {
            auto_audit_switch = 1
        } else {
            auto_audit_switch = 2
        }
        UIClubModel.mInstance.APIOrgChangeClubData({ auto_audit_switch: auto_audit_switch })
    }
    changeClubData() {
        Web_Org_Club_Get.Response.data['desc'] = this.EditBox.string
        UIClubModel.mInstance.APIOrgChangeClubData({ desc: this.EditBox.string })
    }
    clickActive() {
        UIComponent.open(UIDefine.UIActiveMange)
    }
    clickDateManage() {
        UIComponent.open(UIDefine.UIClubDataMange)
    }

    clickJijin() {
        UIComponent.open(UIDefine.MyWalletForm, true)
    }
    clickLevel() {
        // this.node.active = false
        UIComponent.open(UIDefine.UIClubLevel)
    }

    clickRate() {
        UIComponent.open(UIDefine.RateManagerListForm)
    }
}
