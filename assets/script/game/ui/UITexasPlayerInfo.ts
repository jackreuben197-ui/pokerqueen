import { i18nMgr } from "../../i18n/i18nMgr";
import UIBasePlus from "../../ui/UIBasePlus";
import { CPlayer } from "../CPlayer";
import { GameCache } from "../GameCache";
import {
    WebOtherUserInfo,
    WebStatsOtherUserStats,
    WWW,
} from "../../net/https/WebRequest";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import { RoomType } from "../util/GameUtil";
const { ccclass } = cc._decorator;
@ccclass
export default class UITexasPlayerInfo extends UIBasePlus {
    //面板点击
    $panel_click: cc.Node = null;
    //头像
    cc_Sprite$head: cc.Sprite = null;
    //名称
    cc_Label$nick: cc.Label = null;
    //id
    cc_Label$id: cc.Label = null;

    $icon_sex1: cc.Node = null;
    $icon_sex2: cc.Node = null;

    $values: cc.Node = null;
    $tips: cc.Node = null;

    //标题文本
    cc_Label$title: cc.Label = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.setButtonClick(this.$panel_click, this.click_panel);
    }

    onShow(param?: any): void {
        super.onShow(param);

        let player: CPlayer = param;

        //标题文本
        if (GameCache.Instance.CurGame.isMTT) {
            this.cc_Label$title.string = i18nMgr.Get("UIGame_UserInfoTipsMtt");
        } else {
            this.cc_Label$title.string = i18nMgr.Get("UIGame_UserInfoTips");
        }

        this.refreshDownTips();
        this.reqUserInfo(player.userID);
    }
    reqUserInfo(userid: number) {
        WWW.Instance.CommonAPI({
            web_class: WebOtherUserInfo,
            api_id: userid,
        }).then(
            (res: any) => {
                res?.data && this.refreshUserInfo(res.data);
                this.reqUserStats(res.data.random_num);
            },
            (res: any) => {},
        );
    }
    reqUserStats(random_num: number) {
        WWW.Instance.CommonAPI({
            web_class: WebStatsOtherUserStats,
            api_id: random_num,
        }).then(
            (res: any) => {
                res?.data && this.refreshDownValues(res.data);
            },
            (res: any) => {},
        );
    }

    refreshUserInfo(data) {
        WebImageHelper.SetUrlImage(this.cc_Sprite$head, data.avatar);
        this.cc_Label$nick.string = data.nick_name;
        this.cc_Label$id.string = `ID:${data.random_num}`;
        this.$icon_sex1.active = data.sex == 1;
        this.$icon_sex2.active = data.sex == 2;
    }

    refreshDownValues(data) {
        if (
            GameCache.Instance.room_type ==
            RoomType.MTTTexasHoldemStandardNoLimit
        ) {
            this.$values.children[0].getComponent(cc.Label).string =
                `${data.mtt_room_data.frist_times}`;
            this.$values.children[1].getComponent(cc.Label).string =
                `${data.mtt_room_data.second_times}`;
            this.$values.children[2].getComponent(cc.Label).string =
                `${data.mtt_room_data.third_times}`;
            this.$values.children[3].getComponent(cc.Label).string =
                `${data.mtt_room_data.play_times}`;
            this.$values.children[4].getComponent(cc.Label).string =
                `${data.mtt_room_data.win_times}`;
        } else {
            this.$values.children[0].getComponent(cc.Label).string =
                `${data.room_data.total_game_cnt}`;
            this.$values.children[1].getComponent(cc.Label).string =
                `${data.room_data.vpip}%`;
            this.$values.children[2].getComponent(cc.Label).string =
                `${data.room_data.prf}%`;
            this.$values.children[3].getComponent(cc.Label).string =
                `${data.room_data.total_hand}`;
            this.$values.children[4].getComponent(cc.Label).string =
                `${data.room_data.wins}%`;
        }
    }

    refreshDownTips() {
        if (
            GameCache.Instance.room_type ==
            RoomType.MTTTexasHoldemStandardNoLimit
        ) {
            this.$tips.children[0].getComponent(cc.Label).string = i18nMgr.Get(
                "UIData_YGvXd5iXr_006",
            );
            this.$tips.children[1].getComponent(cc.Label).string = i18nMgr.Get(
                "UIData_YGvXd5iXr_007",
            );
            this.$tips.children[2].getComponent(cc.Label).string = i18nMgr.Get(
                "UIData_YGvXd5iXr_008",
            );
            this.$tips.children[3].getComponent(cc.Label).string = i18nMgr.Get(
                "UIData_YGvXd5iXr_005",
            );
            this.$tips.children[4].getComponent(cc.Label).string = i18nMgr.Get(
                "UITexasInfo_wincount",
            );
        } else {
            this.$tips.children[0].getComponent(cc.Label).string =
                i18nMgr.Get("UITexasInfo_games");
            this.$tips.children[1].getComponent(cc.Label).string = i18nMgr.Get(
                "UITexasInfo_poolrate",
            );
            this.$tips.children[2].getComponent(cc.Label).string =
                i18nMgr.Get("UITexasInfo_flop");
            this.$tips.children[3].getComponent(cc.Label).string = i18nMgr.Get(
                "UITexasInfo_allhands",
            );
            this.$tips.children[4].getComponent(cc.Label).string = i18nMgr.Get(
                "UITexasInfo_poolwin",
            );
        }
    }

    click_panel() {
        UIComponent.close(UIDefine.UITexasPlayerInfo);
    }
}
// >>>>> http post - response : https://test2.awanptest.com/api/user/96615706/info
// {
//     "code": 0, "message": "", "data": {
//         "random_num": 96615706, "nick_name": "三个核桃",
//             "sex": 1, "avatar": "https://static.awanptest.com/awanptesting-intl-test/image-avatar/96615706-udyXm.png",
//                 "vip": 0, "vip_endtime": null
//     }
// }

// if (GameCache.Instance.room_type == (int)RoomType.MTTTexasHoldemStandardNoLimit)
// 			{
// 				MTTData.gameObject.SetActive(true);
// 				PuTongData.gameObject.SetActive(false);
// 				Text_Title.text = LanguageManager.mInstance.GetLanguageForKey("UITexasPlayerInfo_MTT");
// 			}
// 			else
// 			{
// 				PuTongData.gameObject.SetActive(true);
// 				MTTData.gameObject.SetActive(false);
// 				Text_Title.text = LanguageManager.mInstance.GetLanguageForKey("UITexasPlayerInfo_PuTong");
// 			}
