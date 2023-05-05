import { UIDefine } from "../../define/UIDefine";
import { GameCache } from "../../game/GameCache";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { UIMineModel } from "../../lobby/UIMineModel";
import { APIUserDiamondsWallet, Web_Config_Global_Config, Web_User_Check_Nickname, Web_User_Info, Web_User_Modify_User_Info, WWW } from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import BottomSelector from "../../ui/component/BottomSelector";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import UILobbyIndex from "../index/UILobbyIndex";
import UIEditInformation from "./UIEditInformation";
import UIMe from "./UIMe";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIChangeName extends BaseFormPlus {
    //part1
    //剩余钻石
    cc_Label$remain: cc.Label = null;
    //名字长度 1/10
    cc_Label$count: cc.Label = null;
    //跳转钱包
    $towallet: cc.Node = null;
    //输入清空
    $input_close: cc.Node = null;
    //输入框
    cc_EditBox$input: cc.EditBox = null;

    //part2 
    $confirm: cc.Node = null;
    $blight: cc.Node = null;
    cc_Label$confirm: cc.Label = null;

    cc_Label$Tips: cc.Label = null;

    cc_RichText$diamond: cc.RichText = null;
    cc_RichText$diamond_dis: cc.RichText = null;
    /////////////////////////////////////////////
    user_modify_name_cost: number = 0;
    priceData: any = null;

    protected lateLoad(): void {
        this.name = "UIChangeName";
        super.lateLoad();
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.refreshWallet();
        this.refreshUI();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$towallet, this.onWalletClick);
        this.setButtonClick(this.$input_close, this.onInputCloseClick);
        this.setButtonClick(this.$confirm, this.onConfirmClick);
        ///////////
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "UIChangeName";
        handler.handler = "onNickInputChange"
        this.cc_EditBox$input.textChanged = [handler];
    }
    refreshUI() {

        this.activeConfirm(true);

        this.title_label.i18NString = "UIMine_Mission_8";

        this.cc_EditBox$input.string = Web_User_Info.Response.data.user.nickname;

        this.cc_EditBox$input.placeholder = i18nMgr.Get("UIMine_SetNick_InputTips");

        this.user_modify_name_cost = Web_Config_Global_Config.Response.data.user_modify_name_cost;

        //this.cc_Label$Tips.string = i18nMgr.Get("UIMine_ChangeNameTipsZS").replace("{0}", `${this.user_modify_name_cost}`);

        this.refreshModifyCount();

        this.onNickInputChange();
    }
    //刷新次数，显示消耗
    refreshModifyCount() {

        //let user_modify_name_cost = Web_Config_Global_Config.Response.data.user_modify_name_cost;

        if (Web_Config_Global_Config.Response.data.user_modify_name_price?.length > 0) {

            this.priceData = JSON.parse(Web_Config_Global_Config.Response.data.user_modify_name_price);
            this.cc_RichText$diamond.string = `<color=#757CAB>${i18nMgr.Get("UIMine_XHZS")}</color><color=#7187FF>${this.priceData.pay_price}</color>`;
            this.cc_RichText$diamond_dis.string = `${i18nMgr.Get("UIMine_DiamondsPrice")}${this.priceData.raw_price}`;
            this.cc_Label$Tips.string = StringHelper.Format(i18nMgr.Get("UIMine_ChangeNameTipsZS"), [this.priceData.raw_price]);

            this.cc_RichText$diamond.node.active = true;
            this.cc_RichText$diamond_dis.node.active = true;
            this.cc_Label$Tips.node.active = true;
        }
        else {
            this.cc_RichText$diamond.node.active = false;
            this.cc_RichText$diamond_dis.node.active = false;
            this.cc_Label$Tips.node.active = false;
            //layout_right.transform.Find("text_cost_coin").GetComponent<Text>().text = GameCache.Instance.modifyNickNum > 0 ? `${user_modify_name_cost}` : "0";
            //textTips.text = string.Format(LanguageManager.Get("UIMine_ChangeNameTipsZS"), user_modify_name_cost);
        }

        //this.cc_RichText$cost.string = `<color=#757CAB>消耗：</color><color=#7187FF><color=#7187FF>${Web_User_Info.Response.data.user.mnt > 0 ? this.user_modify_name_cost : 0}</color>`;
    }

    //刷新钱包获取钻石
    refreshWallet() {
        WWW.Instance.CommonAPI(
            {
                web_class: APIUserDiamondsWallet,
            }
        ).then(
            (res: any) => {
                this.cc_Label$remain.string = `${i18nMgr.Get("UIMine_ZSYE")}${res.data?.diamonds_wallet?.diamonds || 0}`;
            },
            (res: any) => {

            }
        )
    }
    //激活提交按钮
    activeConfirm(boo: boolean) {
        if (boo) {
            this.$confirm.getComponent(cc.Button).interactable = true;
            this.$blight.active = true;
            this.cc_Label$confirm.node.opacity = 255;
        } else {
            this.$confirm.getComponent(cc.Button).interactable = false;
            this.$blight.active = false;
            this.cc_Label$confirm.node.opacity = 76;
        }

    }
    ////////////click////////////
    //跳转商城
    onWalletClick() {
        UIComponent.open(UIDefine.UIMall, null, { fromComponent: this });
    }
    //输入清空
    onInputCloseClick() {
        this.cc_EditBox$input.string = "";
    }
    //确认提交
    onConfirmClick() {
        let text = this.cc_EditBox$input.string;
        //判断空字符
        if (text == "") {
            UIComponent.Instance.ToastLanguage("UIMine_Setting112");
            return;
        }
        if (this.characterLength > 10) {
            UIComponent.Instance.ToastLanguage("UIMine_UserInfoNick_tooLong");
            return;
        }
        //判断特殊字符
        if (StringHelper.IsContainSpecialCharacter(text)) {
            UIComponent.Instance.ToastLanguage("UIMine_UserInfoNick_Include_Special");
            return;
        }
        //判断钻石数量 非免费情况
        if (Web_User_Info.Response.data.user.mnt > 0 &&
            APIUserDiamondsWallet.Response.data.diamonds_wallet?.diamonds < this.priceData.pay_price) {
            UIComponent.Instance.ToastLanguage("UIMine_DiamondsNotEnough");
            return;
        }
        this.reqCheckName();

    }
    onNickInputChange() {
        //this.cc_Label$count.string = `${this.cc_EditBox$input.string.length}/10`;
        this.RefreshNameLength(this.cc_EditBox$input.string);
    }

    //////////////请求消息//////////////
    //请求检测姓名
    reqCheckName() {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_User_Check_Nickname,
                body: {
                    nickname: this.cc_EditBox$input.string
                }
            }
        ).then(
            (res: any) => {
                this.reqChangeName();
            },
            (res: any) => {

            }
        )
    }
    //请求用户信息，判断剩余修改次数
    reqUserInfo() {

        LobbySession.APIUserInfo().then(
            (res: any) => {
                this.refreshModifyCount();

                this.refreshWallet();

                UIComponent.Instance.getComponent<UIMe>("UIMe")?.refreshNick();
                UIComponent.Instance.getComponent<UIEditInformation>("UIEditInformation")?.refreshNick();
                UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex")?.refreshUserInfo();
            }
        )
    }
    //请求改变姓名
    reqChangeName() {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_User_Modify_User_Info,
                body: {
                    nick_name: this.cc_EditBox$input.string,
                }
            }
        ).then(
            (res: typeof Web_User_Modify_User_Info.Response) => {

                GameCache.Instance.nick = this.cc_EditBox$input.string;

                UIComponent.Instance.ToastLanguage("UIMine_Setting116");

                this.reqUserInfo();

            },
            (res: any) => {

            }
        )
    }

    characterLength: number = 0;
    //获取名称长度
    private RefreshNameLength(name: string) {

        let number = 0;
        let zimu = 0;
        let chinese = 0;

        for (let i = 0; i < name.length; i++) {

            if (name[i].match(/^[\u4e00-\u9fa5]$/)) {
                chinese++;
            }
            if (name[i].match(/^[0-9]$/)) {
                number++;
            }
            if (name[i].match(/^[a-zA-Z]$/)) {
                zimu++;
            }
        }
        this.characterLength = chinese * 2 + number + zimu;
        this.cc_Label$count.string = this.characterLength + "/" + 10;
    }
}
