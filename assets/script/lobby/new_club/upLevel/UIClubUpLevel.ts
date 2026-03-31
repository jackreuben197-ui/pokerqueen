/*
 * @Author: xfj
 * @Date: 2022-12-27 11:14:08
 * @description: 公会等级
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-16 11:08:14
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/upLevel/UIClubUpLevel.ts
 */

import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { UIClubModel } from "../../labor/UIClubModel";
import {
    WebOrgClubLevelBenefit,
    WebOrgClubLevelInfo,
    WebUserDiamondsWallet,
} from "../../../net/https/WebRequest";
import UIComponent from "../../../ui/UIComponent";
import { UIDefine } from "../../../define/UIDefine";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import TimeHelper from "../../../helper/TimeHelper";
import { EventName } from "../../../config/EventName";
import { i18nMgr } from "../../../i18n/i18nMgr";
import UINewDialogComponent from "../../../ui/dialog/UINewDialogComponent";
import { StringHelper } from "../../../helper/StringHelper";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("脚本分组/new_club/UIClubUpLevel")
export default class UIClubUpLevel extends BaseForm {
    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Node)
    itemNode: cc.Node = null;

    currentLevel_1: cc.Label = null;
    currentLevel_2: cc.Label = null;
    lbl_lastData: cc.Label = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.currentLevel_1 = this.getChildNodeOrComponent(
            "currentLevel_1",
            cc.Label,
        );
        this.currentLevel_2 = this.getChildNodeOrComponent(
            "currentLevel_2",
            cc.Label,
        );
        this.lbl_lastData = this.getChildNodeOrComponent(
            "lbl_lastData",
            cc.Label,
        );
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.getData();
        await UIClubModel.mInstance.WebUserDiamondsWallet();
        let wallet = WebUserDiamondsWallet.Response.data;
        ClubCache._diamonds_wallet = wallet.diamonds_wallet;
        this.initTop();
    }
    initTop() {
        this.currentLevel_2.string = ClubCache.level;
        if (ClubCache.level == 1) {
            this.lbl_lastData.node.active = false;
        } else {
            this.lbl_lastData.node.active = true;
            UIClubModel.mInstance
                .WebOrgClubLevelInfo({ club_id: ClubCache.club_id })
                .then(() => {
                    let data: any = WebOrgClubLevelInfo.Response.data;
                    this.setText(
                        this.lbl_lastData,
                        `${i18nMgr.Get("UIMine_VIP_expire")}:${TimeHelper.convertUTCTimeToLocalTime(data.data.up_level_time)}`,
                    );
                });
        }
        this.currentLevel_1.string = "——LV." + ClubCache.level + "——";
    }

    async getData() {
        this.contentNode.removeAllChildren();
        await UIClubModel.mInstance.WebOrgClubLevelBenefit({
            club_id: ClubCache.club_id,
        });
        let data: any = WebOrgClubLevelBenefit.Response.data;
        for (let index = 0; index < data.data.length; index++) {
            //data.data.lengt
            const element = data?.data[index];

            let item = cc.instantiate(this.itemNode);
            item.parent = this.contentNode;
            this.initItemData(item, element, index);
            item["levelData"] = element;
        }
    }
    initItemData(node, data, index) {
        node.active = true;
        node.getChildByName("Rectangle").active = index % 2 == 0;
        node.getChildByName("itemLevel_1").getComponent(cc.Label).string =
            "—LV." + data.club_level + "—";
        node.getChildByName("itemLevel_2").getComponent(cc.Label).string =
            data.club_level;
        let dur = data.level_duration + " Day";
        if (data.club_level == 1 || data.club_level > 10) {
            dur = i18nMgr.Get("UILevelForever");
        }
        node.getChildByName("levelNum").getComponent(cc.Label).string =
            `Level ${data.club_level}(${dur})`;
        node.getChildByName("peopleNum").getComponent(cc.Label).string =
            data.user_num + " People";
        node.getChildByName("diamondNum").getComponent(cc.Label).string =
            data.level_count;
    }
    upBtn(node) {
        let data = node.target.parent["levelData"];

        if (ClubCache._diamonds_wallet.diamonds < data.level_count) {
            UIComponent.Instance.Toast("钻石余额不足");
            return;
        }
        if (data.level_count <= 1) {
            return;
        }
        let UIGuild_LevelUp = i18nMgr.Get("UIGuild_LevelUp");

        let tip = StringHelper.Format(UIGuild_LevelUp, [
            data.level_count,
            data.club_level,
            data.level_duration,
        ]);
        if (ClubCache.level == data.club_level) {
            tip = StringHelper.Format(UIGuild_LevelUp, [
                data.level_count,
                data.club_level,
                data.level_duration,
            ]);
        } else if (ClubCache.level > data.club_level) {
            tip = StringHelper.Format(i18nMgr.Get("UIGuild_LevelUpTips1"), [
                data.level_count,
                data.club_level,
                data.level_duration,
                ClubCache.level,
            ]);
        }

        UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent, {
            type: UINewDialogComponent.DialogType.CommitCancel,
            title: "提示",
            content: tip,
            contentCommit: "adaptation10012",
            contentCancel: "adaptation10013",
            actionCommit: async () => {
                await UIClubModel.mInstance.WebOrgClubUpLevel({
                    club_id: ClubCache.club_id,
                    level: data.club_level,
                });
                ClubCache._msg.level = data.club_level;
                this.initTop();
                this.post(EventName.refreshMess);
            },
            noAnimation: true,
        });
    }
}
