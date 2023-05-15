/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-15 20:13:13
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/lookClub/UIManageLabor.ts
 */


import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { APIMessageRed_num, APIOrgClubGold, APIOrgClubLevelInfo, APIOrgMangerList, APIOrgMemberList, Web_Org_Club_Get, Web_Org_Club_Search_By_Id } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import ComFormTitle from "../../../common/ComFormTitle";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GGSwitch from "../../../ui/component/GGSwitch";
import { ClubUserDataCache } from "../../../frame/data/club/ClubUserDataCache";
import UINewDialogComponent from "../../../ui/dialog/UINewDialogComponent";
import AssetContext from "../../../ui/component/AssetContext";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/lookClub/UIManageLabor')
export default class UIManageLabor extends BaseForm {
    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    exitbutton: cc.Node = null;


    @property(GGSwitch)
    rusp_st: GGSwitch = null;

    @property(GGSwitch)
    yxss_st: GGSwitch = null;

    @property(GGSwitch)
    tstz_st: GGSwitch = null;

    @property(GGSwitch)
    tgllfs_st: GGSwitch = null;

    @property(GGSwitch)
    szqb_st: GGSwitch = null;

    @property(cc.Node)
    hlRed: cc.Node = null;
    @property(cc.Node)
    gxpjRed: cc.Node = null;

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
        this.exitbutton.active = ClubCache.user_level != 1

        await UIClubModel.mInstance.APIMessageRed_num()
        let redData = APIMessageRed_num.Response.data
        redData.forEach((element) => {
            if (element.type == 4) {
                this.gxpjRed.active = element.num != 0
            } else if (element.type == 5) {
                this.hlRed.active = element.num != 0
            }

        })


    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refreshMess, this.initTop);
    }

    initTop() {
        let name = cc.find('messLayout/nameNode/name', this.contentNode).getComponent(cc.Label);
        name.string = ClubCache.club_name
        let id = cc.find('messLayout/id', this.contentNode).getComponent(cc.Label);
        id.string = 'ID:' + ClubCache.random_id
        let dec = this.contentNode.getChildByName('dec').getComponent(cc.Label);
        this.setText(dec, ClubCache.desc || 'UIClub_introduce')

        let icon = cc.find('messLayout/Round', this.contentNode).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, ClubCache.logo, AssetContext.getAsset("default_club_head"))
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
        let name = lm_panel_right.getChildByName('name').getComponent(cc.Label)
        let union_icon = cc.find('Round', lm_panel_right);
        if (ClubCache.tribe_name && ClubCache.tribe_name != '') {
            this.setText(name, ClubCache.tribe_name)
            WebImageHelper.SetHeadImage(union_icon.getComponent(cc.Sprite), ClubCache.tribe_logo)
        } else {
            this.setText(name, 'UIGuild_NoUnionTips')
            union_icon.active = false;
        }
        //联系方式
        let lxfs = this.contentNode.getChildByName('lxfs')
        let label = cc.find('editNode/label', lxfs).getComponent(cc.Label);
        label.string = ClubCache.more_contact

        //创建时间
        let chsj = this.contentNode.getChildByName('chsj')
        chsj.getChildByName('time').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(ClubCache.create_time)
        this.initSwitch()

        let hl = this.contentNode.getChildByName('hl')
        let yxss = this.contentNode.getChildByName('yxss')
        let rusp = this.contentNode.getChildByName('rusp')
        hl.active = true;
        yxss.active = true;
        rusp.active = true;

        if (ClubCache.user_level == 3) {
            hl.active = false;
            yxss.active = false;
            rusp.active = false;
        }

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
        this.szqb_st.setIsOn(ClubCache.digital_wallet_switch == 1)
        this.szqb_st.clickObj = {
            click: () => {
                ClubCache._msg.digital_wallet_switch = ClubCache.digital_wallet_switch == 1 ? 2 : 1
                UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, digital_wallet_switch: ClubCache.digital_wallet_switch })
            }, self: this
        };


    }

    clickSzqb() {
        // this.node.active = false
        UIComponent.open(UIDefine.UIClubDigitalWallet)
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

    openEdit(event, customData) {
        UIComponent.open(UIDefine.UIClubEdit, { type: Number(customData) })
    }

    joinTrip() {
        if (ClubCache.tribe_name && ClubCache.tribe_name != '') return
        UIComponent.open(UIDefine.UIJoinUnion, { type: 1 })

    }

    async exitClub() {
        if (ClubUserDataCache.gold == 0 && ClubUserDataCache.usdt == 0) {
            await UIClubModel.mInstance.APIOrgClubQuit();
            UIComponent.Instance.CloseNoAnimation(UIDefine.UIManageLabor);
            UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubHome);
            this.post(EventName.refreshClubList)
            return
        }
        UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent,
            {
                type: UINewDialogComponent.DialogType.Commit,
                title: "UIGuild_TipsTitle",
                content: 'UIGuild_MoneyNotZero',
                contentCommit: "adaptation10013",
                noAnimation: true,
            });
    }
    exitClubSure() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent,
            {
                type: UINewDialogComponent.DialogType.CommitCancel,
                title: "sr_r9ccQuit",
                content: 'UIGuild_QuitTips',
                contentCommit: "adaptation10012",
                contentCancel: "adaptation10013",
                actionCommit: () => {
                    this.exitClub()
                },
                noAnimation: true,
            });
    }



}
