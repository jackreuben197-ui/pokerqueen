import { isatty } from "tty";
import { CommonDefine } from "../../define/CommonDefine";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_User_Room_Settle_Detail } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasGameEndItem extends UIBase {

    MemberNumTxt: cc.Label = null;
    MemberNameTxt: cc.Label = null;
    MemberIDTxt: cc.Label = null;
    MemberComeTxt: cc.Label = null;
    MemberHandleTxt: cc.Label = null;
    MemberScoreTxt: cc.Label = null;

    MemberIcon: cc.Sprite = null;

    Image_rankicon1: cc.Node = null;
    Image_rankicon2: cc.Node = null;
    Image_rankicon3: cc.Node = null;

    Image_rankicons: cc.Node[] = [];

    Image_rank: cc.Node = null;

    Image_MyBg: cc.Node = null;


    protected lateLoad(): void {
        super.lateLoad();
        this.MemberNumTxt = this.getChildNodeOrComponent("MemberNumTxt", cc.Label);
        this.MemberNameTxt = this.getChildNodeOrComponent("MemberNameTxt", cc.Label);
        this.MemberIDTxt = this.getChildNodeOrComponent("MemberIDTxt", cc.Label);
        this.MemberComeTxt = this.getChildNodeOrComponent("MemberComeTxt", cc.Label);
        this.MemberHandleTxt = this.getChildNodeOrComponent("MemberHandleTxt", cc.Label);
        this.MemberScoreTxt = this.getChildNodeOrComponent("MemberScoreTxt", cc.Label);

        this.MemberIcon = this.getChildNodeOrComponent("MemberIcon", cc.Sprite);

        this.Image_rank = this.getChildNodeOrComponent("Image_rank");

        this.Image_rankicon1 = this.getChildNodeOrComponent("Image_rankicon1");
        this.Image_rankicon2 = this.getChildNodeOrComponent("Image_rankicon2");
        this.Image_rankicon3 = this.getChildNodeOrComponent("Image_rankicon3");
        this.Image_rankicons.push(this.Image_rankicon1, this.Image_rankicon2, this.Image_rankicon3);
        this.Image_MyBg = this.getChildNodeOrComponent("Image_MyBg");

    }
    onShow(param?: typeof Web_User_Room_Settle_Detail.UsersInfo): void {
        super.onShow(param);
        this.MemberNumTxt.string = `${this.index}`;
        this.MemberNameTxt.string = param.nick_name;
        this.MemberIDTxt.string = `ID:${param.user_random_id}`;
        this.MemberComeTxt.string = `${i18nMgr.Get("UIMine_RecordItemsNormal_eodrjcHJ")} ${StringHelper.GetLongString(param.bring_in)}`;
        this.MemberHandleTxt.string = `${i18nMgr.Get("UIMine_RecordItemsNormal_3RCUa3w8")} ${param.user_hand_num}`;
        this.MemberScoreTxt.string = `${StringHelper.GetSignedLongString(param.bring_out - param.bring_in)}`;
        WebImageHelper.SetHeadImage(this.MemberIcon, param.avatar);
        this.setScoreColor();
        this.setRankShow();
        this.setBg();
    }

    setBg() {

        this.Image_MyBg.active = this.param.user_random_id == GameCache.Instance.nUserId;
    }
    setScoreColor() {
        let value = + this.MemberScoreTxt.string;
        this.MemberScoreTxt.node.color = value >= 0 ? CommonDefine.Text_Yellow_Color : CommonDefine.Text_Green_Color;
    }
    setRankShow() {
        this.Image_rankicons.forEach(node => {
            node.active = false;
        });
        //皇冠标显示
        this.Image_rank.active = this.index == 1;
        //排名123标签显示
        let rank = this.Image_rankicons[this.index - 1];
        rank && (rank.active = true);

    }
    get param(): typeof Web_User_Room_Settle_Detail.UsersInfo {
        return this._param;
    }
    // update (dt) {}
}
