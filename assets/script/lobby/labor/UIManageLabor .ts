/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-26 14:15:38
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIManageLabor .ts
 */


import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubGold, APIOrgMangerList, APIOrgMemberList, Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;
@ccclass
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

    @property(cc.Label)
    lbl_glod: cc.Label = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        await UIClubModel.mInstance.APIOrgClubGet()
        this.initTop();
        this.initMangerList();
        this.initMemberList();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.clubGoldChange, this.updateGold);
        this.listen(EventName.adminChange, this.initMangerList);
    }

    initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let name = this.mask_group.getChildByName('name').getComponent(cc.Label);
        name.string = data.club_name
        let id = this.mask_group.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + data.random_id
        this.EditBox.string = data.desc   //|| '暂无工会说明'

        let icon = cc.find('iconMask/icon', this.mask_group);
        WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), data.logo)
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
        WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), data.club_creator_avatar)
        //创建时间
        let chsj = this.contentNode.getChildByName('chsj')
        chsj.getChildByName('time').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(data.create_time)

        //基金
        let _data: any = APIOrgClubGold.Response.data

        this.updateGold();
        //联盟
        let lm = this.contentNode.getChildByName('lm')
        let lm_panel_right = lm.getChildByName('panel_right')
        lm_panel_right.getChildByName('name').getComponent(cc.Label).string = data.tribe_name || ''
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
        await UIClubModel.mInstance.APIOrgMangerList(data.random_id);
        data = APIOrgMangerList.Response.data
        for (let index = 0; index < this.iconNodeMan.childrenCount; index++) {
            const element = this.iconNodeMan.children[index];
            element.active = false;
        }
        for (let index = 0; index < data?.data.length; index++) {

            const element = this.iconNodeMan.children[index].getChildByName('icon').getComponent(cc.Sprite);
            WebImageHelper.SetUrlImage(element, data?.data[index].avatar)
            this.iconNodeMan.children[index].active = true;
        }
    }
    async initMemberList() {
        let data: any = Web_Org_Club_Get.Response.data;
        await UIClubModel.mInstance.APIOrgMemberList(data.random_id)
        data = APIOrgMemberList.Response.data;
        for (let index = 0; index < this.iconNodeMer.childrenCount; index++) {
            const element = this.iconNodeMer.children[index];
            element.active = false
        }
        for (let index = 0; index < data?.data?.length; index++) {

            const element = this.iconNodeMer.children[index].getChildByName('icon').getComponent(cc.Sprite);
            WebImageHelper.SetUrlImage(element, data?.data[index].avatar)
            this.iconNodeMer.children[index].active = true;
        }
    }
    managementMember() {
        UIComponent.open(UIDefine.UIlaborMerberManager);
    }
    joinUnion() {
        let data: any = Web_Org_Club_Get.Response.data;
        if (!data.tribe_name) {
            UIComponent.open(UIDefine.UIJoinUnion);
        }
    }
    changeClubData() {
        Web_Org_Club_Get.Response.data['desc'] = this.EditBox.string
        UIClubModel.mInstance.APIOrgChangeClubData({ desc: this.EditBox.string })
    }

    clickJijin() {
        UIComponent.open(UIDefine.MyWalletForm, true)
    }

    clickRate() {
        UIComponent.open(UIDefine.RateManagerListForm)
    }
}
