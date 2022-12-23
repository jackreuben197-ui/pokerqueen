/*
 * @Author: xfj
 * @Date: 2022-09-19 18:39:47
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-23 18:37:44
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIPlayerLookLabor.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import { UIClubModel } from "./UIClubModel";
import { LobbyControl } from "../control/LobbyControl";
import { GameCache } from "../../game/GameCache";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIPlayerLookLabor')
export default class UIPlayerLookLabor extends BaseForm {
    @property(cc.Node)
    mask_group: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;
    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Look"
        this.comFormTitle.initData(title, this);
        await UIClubModel.mInstance.APIOrgClubGet()
        this.initTop();
    }
    initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let name = cc.find('Node_name/name', this.mask_group).getComponent(cc.Label);
        name.string = data.club_name
        let id = this.mask_group.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + data.random_id
        let dec = this.mask_group.parent.getChildByName('TEXT_LABEL').getComponent(cc.Label);
        dec.string = data.desc || ''

        let icon = cc.find('iconMask/icon', this.mask_group).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, data.logo)
        // let lbl_glod = cc.find('img_right_bg/lbl_glod', this.mask_group).getComponent(cc.Label);
        this.initClubData()
    }
    initClubData() {
        // let data: any = Web_Org_Club_Get.Response.data;

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
        //联盟
        let ghllfs = this.contentNode.getChildByName('ghllfs')
        ghllfs.getChildByName('name').getComponent(cc.Label).string = ClubCache.more_contact

        //联盟
        let lm = this.contentNode.getChildByName('lm')
        let lm_panel_right = lm.getChildByName('panel_right')
        lm_panel_right.getChildByName('name').getComponent(cc.Label).string = ClubCache.tribe_name || ''
    }
    async exitClub() {
        if (GC.data.user.info.displayGold == 0) {
            await UIClubModel.mInstance.APIOrgClubQuit();
            GC.data.user.info.gold = 0;
            this.close();
            LobbyControl.getInstance().switchContent("UIlabor");
            return
        }
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                // content: `您的账户内剩余金豆${GameCache.Instance.gold}，如减持退出，系统将清空您的所有剩余金豆，是否继续？`,
                content: `您的账户内金豆 ${GC.data.user.info.displayGold}和usdt ${GC.data.user.info.displayGold} ,将会清空,是否继续？`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    await UIClubModel.mInstance.APIOrgClubQuit();
                    GC.data.user.info.gold = 0;
                    this.close();
                    LobbyControl.getInstance().switchContent("UIlabor");
                },
                noAnimation: true,
            });
    }
    exitClubSure() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "退出公会",
                content: '退出后无法参与游戏，是否继续推出？',
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: () => {
                    this.exitClub()
                },
                noAnimation: true,
            });
    }
}
