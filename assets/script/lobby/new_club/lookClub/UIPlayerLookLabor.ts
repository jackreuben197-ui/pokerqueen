/*
 * @Author: xfj
 * @Date: 2022-09-19 18:39:47
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-08 20:42:03
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/lookClub/UIPlayerLookLabor.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import { LobbyControl } from "../../control/LobbyControl";
import GC from "../../../frame/GameControl";
import TimeHelper from "../../../helper/TimeHelper";
import ComFormTitle from "../../../common/ComFormTitle";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import UINewDialogComponent from "../../../ui/dialog/UINewDialogComponent";
import { ClubUserDataCache } from "../../../frame/data/club/ClubUserDataCache";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/lookClub/UIPlayerLookLabor')
export default class UIPlayerLookLabor extends BaseForm {
    @property(cc.Node)
    main1: cc.Node = null;

    // @property(cc.Button)
    // joinTrip: cc.Button = null;


    @property(cc.Node)
    contentNode: cc.Node = null;
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
    initTop() {
        let name = cc.find('messLayout/nameNode/name', this.main1).getComponent(cc.Label);
        name.string = ClubCache.club_name
        let id = cc.find('messLayout/id', this.main1).getComponent(cc.Label);
        id.string = 'ID:' + ClubCache.random_id
        let dec = this.contentNode.getChildByName('dec').getComponent(cc.Label);
        this.setText(dec, ClubCache.desc || 'UIClub_introduce')

        let icon = cc.find('Round', this.main1).getComponent(cc.Sprite);
        WebImageHelper.SetHeadImage(icon, ClubCache.logo)
        this.initClubData()
    }
    initClubData() {

        //初始化创始人
        let csr = this.contentNode.getChildByName('csr')
        let panel_right = csr.getChildByName('panel_right')
        panel_right.getChildByName('name').getComponent(cc.Label).string = ClubCache.club_creator_nickname
        let icon = cc.find('Round', panel_right);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.club_creator_avatar)


        //联盟
        let lm = this.contentNode.getChildByName('lm')
        let lm_panel_right = lm.getChildByName('panel_right')
        let name = lm_panel_right.getChildByName('name').getComponent(cc.Label)
        let union_icon = cc.find('Round', lm_panel_right);

        if (ClubCache.tribe_name && ClubCache.tribe_name != '') {
            this.setText(name, ClubCache.tribe_name)
            WebImageHelper.SetHeadImage(union_icon.getComponent(cc.Sprite), ClubCache.tribe_logo)
            // this.joinTrip.interactable = false;
        } else {
            this.setText(name, 'UIGuild_NoUnion')
            union_icon.active = false;
            // this.joinTrip.interactable = true;
        }
        //联系方式
        let ghllfs = this.contentNode.getChildByName('ghllfs')
        ghllfs.getChildByName('name').getComponent(cc.Label).string = ClubCache.more_contact

        //创建时间
        let chsj = this.contentNode.getChildByName('chsj')
        chsj.getChildByName('time').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(ClubCache.create_time)



    }
    async exitClub() {
        if (ClubUserDataCache.gold == 0 && ClubUserDataCache.usdt == 0) {
            await UIClubModel.mInstance.APIOrgClubQuit();
            this.close()
            UIComponent.close(UIDefine.UIClubHome)
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
