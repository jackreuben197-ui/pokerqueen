import { isatty } from "tty";
import { TextColor } from "../../config/GameConfig";
import { CommonDefine } from "../../define/CommonDefine";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WebUserRoomSettleDetail } from "../../net/https/WebRequest";
import AssetContext from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasGameEndItem extends UIBase {


    MemberNameTxt: cc.Label = null;
    MemberIDTxt: cc.Label = null;
    MemberComeTxt: cc.Label = null;
    MemberHandleTxt: cc.Label = null;
    MemberScoreTxt: cc.Label = null;

    MemberIcon: cc.Sprite = null;


    bg_a: cc.Node = null;
    bg_b: cc.Node = null;

    c_0: cc.Node = null;
    c_1: cc.Node = null;
    c_2: cc.Node = null;



    protected lateLoad(): void {
        super.lateLoad();

        this.MemberNameTxt = this.getChildNodeOrComponent("MemberNameTxt", cc.Label);
        this.MemberIDTxt = this.getChildNodeOrComponent("MemberIDTxt", cc.Label);
        this.MemberComeTxt = this.getChildNodeOrComponent("MemberComeTxt", cc.Label);
        this.MemberHandleTxt = this.getChildNodeOrComponent("MemberHandleTxt", cc.Label);
        this.MemberScoreTxt = this.getChildNodeOrComponent("MemberScoreTxt", cc.Label);
        this.MemberIcon = this.getChildNodeOrComponent("MemberIcon", cc.Sprite);



        this.bg_a = this.getChildNodeOrComponent("bg_a");
        this.bg_b = this.getChildNodeOrComponent("bg_b");

        this.c_0 = this.getChildNodeOrComponent("c_0");
        this.c_1 = this.getChildNodeOrComponent("c_1");
        this.c_2 = this.getChildNodeOrComponent("c_2");



    }
    onShow(param?: any): void {
        super.onShow(param);
        this.MemberNameTxt.string = StringHelper.LengthNick(param.nick_name);
        this.MemberIDTxt.string = `ID:${param.user_random_id}`;
        this.MemberComeTxt.string = `${i18nMgr.Get("UIMine_RecordItemsNormal_eodrjcHJ")} ${StringHelper.GetLongString(param.bring_in)}`;
        this.MemberHandleTxt.string = `${i18nMgr.Get("UIMine_RecordItemsNormal_3RCUa3w8")} ${param.user_hand_num}`;
        this.MemberScoreTxt.string = `${StringHelper.GetSignedLongString(param.bring_out - param.bring_in)}`;
        WebImageHelper.SetUrlImage(this.MemberIcon, param.avatar, AssetContext.getAsset("RadHead"));
        this.setScoreColor();
        this.setBg();
        this.setTop();
    }
    //设置背景颜色
    setBg() {

        this.bg_a.active = this.index % 2 == 0;
        this.bg_b.active = this.index % 2 == 1;
    }

    //设置排名图标
    setTop() {
        this.c_0.active = this.index == 0;
        this.c_1.active = this.index == 1;
        this.c_2.active = this.index == 2;
    }
    setScoreColor() {
        let value = + this.MemberScoreTxt.string;
        this.MemberScoreTxt.node.color = cc.Color.BLACK.fromHEX(value < 0 ? TextColor.Color6 : TextColor.Color5);
    }
    get param(): any {
        return this._param;
    }

}
