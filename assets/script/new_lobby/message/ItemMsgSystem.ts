
import { MessageSubType } from "../../config/TTypeConfig";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import AssetContext from "../../ui/component/AssetContext";
import UIBasePlus from "../../ui/UIBasePlus";
import MyMessageModel from "./MyMessageModel";

const { ccclass, executionOrder, property } = cc._decorator;

@ccclass
//@executionOrder(-1)
export default class ItemMsgSystem extends UIBasePlus {
    @property([cc.SpriteFrame])
    icons: cc.SpriteFrame[] = [];
    //内容
    cc_RichText$content: cc.RichText = null;
    //时间
    cc_Label$time: cc.Label = null;

    //右下角图标
    cc_Sprite$union: cc.Sprite = null;
    cc_Sprite$null: cc.Sprite = null;
    cc_Sprite$friend: cc.Sprite = null;
    cc_Sprite$head: cc.Sprite = null;



    //右下角名称
    cc_Label$name: cc.Label = null;

    //////////////////////////////////////

    isLarge: boolean = false;

    allText: string = "";

    //////////////////////////////////

    onShow(param: any) {
        super.onShow(param);
        this.reset();
        this.refreshUI(param);
    }
    //重置
    reset() {
        this.isLarge = false;
        this.allText = "";
        this.cc_Sprite$union.node.active = false;
        this.cc_Sprite$null.node.active = false;
        this.cc_Sprite$friend.node.active = false;
        this.cc_Sprite$head.node.active = false;
        this.cc_Label$name.string = "";
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        //this.setButtonClick(this.node, this.onClick);
    }

    refreshNormal(data) {
        //刷新右下角内容
        if (data.sender_icon == null || data.sender_icon == "")//联盟图
        {
            this.cc_Sprite$union.node.active = true;
            this.cc_Sprite$null.node.active = false;
            this.cc_Sprite$friend.node.active = false;
            this.cc_Sprite$head.node.active = false;
        }
        else if (data.sender_icon == "NEW POKER") { //系统图
            this.cc_Sprite$union.node.active = false;
            this.cc_Sprite$null.node.active = true;
            this.cc_Sprite$friend.node.active = false;
            this.cc_Sprite$head.node.active = false;
        }
        else if (data.sender_icon == "FRIEND ROOM") { //朋友图
            this.cc_Sprite$union.node.active = false;
            this.cc_Sprite$null.node.active = false;
            this.cc_Sprite$friend.node.active = true;
            this.cc_Sprite$head.node.active = false;
        }
        else {
            this.cc_Sprite$union.node.active = false;
            this.cc_Sprite$null.node.active = false;
            this.cc_Sprite$friend.node.active = false;
            this.cc_Sprite$head.node.active = true;
            WebImageHelper.SetUrlImage(this.cc_Sprite$head, data.sender_icon, AssetContext.getAsset("default_club_head"));
        }

        this.cc_Label$name.string = data.sender_name || "";
        this.cc_Label$name.node.active = this.cc_Label$name.string.length > 0;


        let subType: MessageSubType = data.msg_type;

        let subType_str: string = MessageSubType[subType];

        if (subType_str?.includes("MsgSuper1Win")) {
            switch (subType) {
                case MessageSubType.MsgSuper1Winner:
                    this.cc_RichText$content.string = i18nMgr.Get("UIHappyShop_Super1WinLuckNewsTC");
                    break;
                case MessageSubType.MsgSuper1WinNormal:
                    if (~data.content.indexOf(":")) {
                        var str = data.content.split(':');
                        let QiHao = +str[1];
                        //是数字
                        if (!isNaN(QiHao)) {
                            this.cc_RichText$content.string = StringHelper.Format(i18nMgr.Get("UIHappyShop_Super1WinUnLuckNews"), [` <color=#FEEC8E> ${str[0]} </color> `, ` <color=#FEEC8E> ${QiHao} </color> `]);
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
                            this.cc_RichText$content.string = StringHelper.Format(i18nMgr.Get("UIHappyShop_Super1WinLuckNewsBag"), [` <color=#FEEC8E> ${str[0]} </color> `, ` <color=#FEEC8E> ${QiHao} </color> `]);
                        } else {
                            console.log("一元购获奖消息数量错误");
                        }
                    }
                    break;
            }
        } else {

            let msg = MyMessageModel.Instance.GetMsg(data.msg_type);

            if (msg) {
                let str = "";
                if (data.title == "999") {
                    str = i18nMgr.Get("MessgainfoForever");
                } else {
                    str = StringHelper.Format(msg, [data.title, data.content, data.remark]);
                }
                var a = `<color=#F8C255>${data.title}</color>`;
                var b = `<color=#F8C255>${data.content}</color>`;
                var c = `<color=#F8C255>${data.remark}</color>`;
                if (this._param.isFromEx) {
                    this.allText = StringHelper.Format(msg, [b, c, a]);
                    this.cc_RichText$content.string = this.allText;

                } else {
                    this.cc_RichText$content.string = str;
                    this.isLarge = StringHelper.SetLargeText(this.cc_RichText$content, 208);
                    this.allText = StringHelper.Format(msg, [b, c, a]);
                    this.isLarge || (this.cc_RichText$content.string = this.allText);
                }

            } else {
                this.cc_RichText$content.string = "";
            }
        }
    }

    private refreshUI(param: any) {
        this.refreshNormal(param.data);
        this.cc_Label$time.string = TimeHelper.UTCToLocal(param.data.create_time);
    }
}
