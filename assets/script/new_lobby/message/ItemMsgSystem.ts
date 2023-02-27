
import { MessageSubType } from "../../config/TTypeConfig";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import LobbySession from "../../session/LobbySession";
import AssetContext from "../../ui/component/AssetContext";
import UIBasePlus from "../../ui/UIBasePlus";
import MyMessageModel from "./MyMessageModel";

const { ccclass, executionOrder, property } = cc._decorator;

@ccclass
@executionOrder(-1)
export default class ItemMsgSystem extends UIBasePlus {
    @property([cc.SpriteFrame])
    icons: cc.SpriteFrame[] = [];
    //内容
    cc_RichText$content: cc.RichText = null;
    //时间
    cc_Label$time: cc.Label = null;
    //右下角图标
    cc_Sprite$icon: cc.Sprite = null;
    //右下角头像
    cc_Sprite$head: cc.Sprite = null;
    //右下角名称
    cc_Label$name: cc.Label = null;

    //////////////////////////////////////

    isLarge: boolean = false;

    allText: string = "";

    //////////////////////////////////

    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param: any) {
        super.onShow(param);
        this.reset();
        this.refreshUI(param);
    }
    //重置
    reset() {
        this.isLarge = false;
        this.allText = "";
        this.cc_Sprite$icon.spriteFrame = null;
        this.cc_Sprite$head.spriteFrame = null;
        this.cc_Label$name.string = "";
        this.cc_Label$name.node.active = false;
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.node, this.onClick);
    }

    onClick() {
        if (this.isLarge) {
            //开启完整信息显示
            console.log("打开完整信息");
        }
    }

    refreshSystem(data) {
        let msg = "";
        switch (data.msg_type) {
            case MessageSubType.MsgSuper1Winner:
                msg = i18nMgr.Get("UIHappyShop_Super1WinLuckNewsTC");
                this.cc_RichText$content.string = msg;
                break;
            case MessageSubType.MsgSuper1WinNormal:
                if (~data.content.indexOf(":")) {
                    var str = data.content.split(':');
                    let QiHao = +str[1];
                    //是数字
                    if (!isNaN(QiHao)) {
                        msg = StringHelper.Format(i18nMgr.Get("UIHappyShop_Super1WinUnLuckNews"), [` <color=#E1B58D> ${str[0]} </color> `, ` <color=#E1B58D> ${QiHao} </color> `]);
                        this.cc_RichText$content.string = msg;
                    } else {
                        console.log("一元购未获奖消息期号错误");
                    }
                }
                break;
            case MessageSubType.MsgSuper1WinTocken:
                if (~data.content.indexOf(":")) {
                    var str = data.content.split(':');
                    let QiHao = +str[1];
                    //是数字
                    if (!isNaN(QiHao)) {
                        msg = StringHelper.Format(i18nMgr.Get("UIHappyShop_Super1WinLuckNewsBag"), [` <color=#E1B58D> ${str[0]} </color> `, ` <color=#E1B58D> ${QiHao} </color> `]);
                        this.cc_RichText$content.string = msg;
                    } else {
                        console.log("一元购获奖消息数量错误");
                    }
                }
                break;
            default:
                msg = MyMessageModel.Instance.GetMsg(data.msg_type);
                if (msg?.length) {
                    let str = "";
                    if (data.title == "999") {
                        str = i18nMgr.Get("MessgainfoForever");
                    } else {
                        str = StringHelper.Format(msg, [data.title, data.content, data.remark]);
                    }
                    this.cc_RichText$content.string = str;
                    this.isLarge = StringHelper.SetLargeText(this.cc_RichText$content, 208);
                    var a = `<color=#E1B58D>${data.title}</color>`;
                    var b = `<color=#E1B58D>${data.content}</color>`;
                    var c = `<color=#E1B58D>${data.remark}</color>`;
                    this.allText = StringHelper.Format(msg, [a, b, c]);
                    this.isLarge || (this.cc_RichText$content.string = this.allText);

                }
                break;
        }
    }
    refreshNormal(data) {
        //刷新右下角内容
        if (data.sender_icon == null || data.sender_icon == "")//联盟图
        {
            this.cc_Sprite$icon.node.active = true;
            this.cc_Sprite$head.node.active = false;
            this.cc_Sprite$icon.spriteFrame = this.icons[2]; // union
        }
        else if (data.sender_icon == "NEW POKER") { //系统图
            this.cc_Sprite$icon.node.active = true;
            this.cc_Sprite$head.node.active = false;
            this.cc_Sprite$icon.spriteFrame = this.icons[1]; // null
        }
        else if (data.sender_icon == "FRIEND ROOM") { //朋友图
            this.cc_Sprite$icon.node.active = true;
            this.cc_Sprite$head.node.active = false;
            this.cc_Sprite$icon.spriteFrame = this.icons[0]; // friend
        }
        else {
            this.cc_Sprite$icon.node.active = false;
            this.cc_Sprite$head.node.active = true;
            WebImageHelper.SetUrlImage(this.cc_Sprite$head, data.sender_icon, AssetContext.getAsset("default_club_head"));
        }
        //this.cc_Label$name.string = data.sender_name || "";
        if (data.sender_name?.length) {
            this.cc_Label$name.node.active = true;
            this.cc_Label$name.string = data.sender_name;
        } else {
            this.cc_Label$name.node.active = false;
        }

        let msg = MyMessageModel.Instance.GetMsg(data.msg_type);
        if (msg?.length) {
            //#7187FF
            let a = `<color=#7187FF>${data.title}</color>`;
            let b = `<color=#7187FF>${LobbySession.getLanguageValueByKey(data.content)}</color>`;
            let c = `<color=#7187FF>${data.remark}</color>`;
            let tTxtContent = "";
            switch (data.msg_type) {
                case MessageSubType.MsgBagTypeGetTickets:
                case MessageSubType.MsgBagTypeUserTransferTicketsToSelf:
                case MessageSubType.MsgBagTypeUserTransferTicketsToOther:
                //case MessageSubType.MsgBagTypeAwardPropsByEveryDayTask:
                case MessageSubType.MsgBagTypeAwardPropsByAchievementsTask:
                case MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward:
                    let str = data.title.split('X');
                    let num = " x" + str[str.length - 1];
                    let prop = data.title.substring(0, data.title.lastIndexOf('X'));
                    prop = prop.trim();
                    a = `<color=#7187FF>${LobbySession.getLanguageValueByKey(prop)}${num}</color>`;
                    break;
                case MessageSubType.MsgBagTypeSignUpMatch:
                case MessageSubType.MsgMoneyTypeMatchSignUp:
                    let time = TimeHelper.convertUTCTimeToLocalTime(+data.title * 1000);
                    a = `<color=#FFFFFF>${time}</color>`;
                    break;
                ////////////////////////////////////////省略了一些
                case MessageSubType.MsgBagTypeUserTransferTicketsToSelf:
                    tTxtContent = StringHelper.Format(msg, [a, b]);
                    break;
                case MessageSubType.MsgBagTypeUserTransferTicketsToOther:
                    tTxtContent = StringHelper.Format(msg, [b, a]);
                    break;
                case MessageSubType.MsgBagTypeAwardPropsByEveryDayTask:
                case MessageSubType.MsgBagTypeAwardPropsByAchievementsTask:
                case MessageSubType.MsgBagTypeAwardPropsByVipInvitationReward:
                    tTxtContent = StringHelper.Format(msg, [c, a]);
                    break;
                case MessageSubType.MsgSuper1AwardDiscount:
                    tTxtContent = StringHelper.Format(msg, [b, c]);
                    break;
                case MessageSubType.MsgBagTypeClubGrantGold:
                    tTxtContent = StringHelper.Format(msg, [data.title, (+data.content) / 100]);
                    break;
                case MessageSubType.MsgMoneyTypeReleaseClubFunds://俱乐部金钱转换

                    let remarks = data.remark.split('_');
                    if (remarks.length <= 1) {
                        return;
                    }
                    let coinType = (+str[1]) || 0;
                    let coinStr = "";
                    if (coinType == 1) {
                        coinStr = i18nMgr.Get("UIGuild_VipCountGoldType1");
                    }
                    else if (coinType == 2) {
                        coinStr = i18nMgr.Get("UIGuild_VipCountGoldType2");
                    }
                    tTxtContent = StringHelper.Format(msg, [`<color=#7187FF>${str[0]}</color>`, coinStr]);
                    break;
                default:
                    let typename = "";
                    if (data.game_type > 0) {
                        typename = LobbySession.getLanguageValueByKey(data.multi_language_id);
                    }
                    tTxtContent = StringHelper.Format(msg, [`<color=#7187FF>${typename}${data.content}</color>`, c, a]);
                    break;
            }
            this.cc_RichText$content.string = tTxtContent;

            // if (AlineText(tTxt, tTxt.text)) {
            //     //tTxt.raycastTarget = true;
            //     UIEventListener.Get(go).onClick = (tmp) => {
            //         UIComponent.Instance.ShowNoAnimation(UIType.UIMine_MsgSystemContent, tTxtContent);
            //     };
            // }
            // else {
            //     tTxt.text = tTxtContent;
            //     tTxt.raycastTarget = false;
            // }
        }
    }
    private refreshUI(param: any) {
        this.cc_Label$time.string = TimeHelper.UTCToLocal(param.data.create_time);
        if (param.type == 0) {
            this.refreshSystem(param.data);
        } else {
            this.refreshNormal(param.data);
        }
    }
}
