import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { UIClubModel } from "../../lobby/labor/UIClubModel";
import { WebOrgClubUploadIcon, WebUserInfo, WebUserModifyUserInfo, WebWww } from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import BottomSelector from "../../ui/component/BottomSelector";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import UILobbyIndex from "../index/UILobbyIndex";
import UIMe from "./UIMe";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIEditInformation extends BaseFormPlus {

    $Head: cc.Node = null;
    cc_Sprite$head: cc.Sprite = null;
    BottomSelector$selector: BottomSelector = null;
    //part1
    $Page1: cc.Node = null;
    $name: cc.Node = null;
    $sex: cc.Node = null;
    cc_Label$name: cc.Label = null;
    cc_Label$sex: cc.Label = null;
    /////////////////////////////////////////////
    bottomSelect_data: any = null;

    lateLoad() {
        this.name = "UIEditInformation";
        super.lateLoad();
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.refreshUserInfo();
        this.BottomSelector$selector.data = ["UIMine_UserInfoSetting_Female", "UIMine_UserInfoSetting_Male", this];
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$name, this.onNameClick);
        this.setButtonClick(this.$sex, this.onSexClick);
        this.setButtonClick(this.$Head, this.onHeadClick);

    }
    //刷新用户信息
    refreshUserInfo() {
        WebImageHelper.SetHeadImage(this.cc_Sprite$head, WebUserInfo.Response.data.user.avatar);
        this.refreshNick();
        this.refreshSex();
    }

    refreshNick() {
        this.cc_Label$name.string = WebUserInfo.Response.data.user.nickname;
    }
    // 1女 2男
    refreshSex() {
        console.log("刷新性别,", WebUserInfo.Response.data.user.sex);
        this.cc_Label$sex.string = i18nMgr.Get(WebUserInfo.Response.data.user.sex == 1 ? "UIMine_UserInfoSetting_Female" : "UIMine_UserInfoSetting_Male");
    }
    ////////////click////////////

    async onHeadClick() {
        await UIClubModel.mInstance.WebOrgClubUploadIcon();
        let icon: any = WebOrgClubUploadIcon.Response.data;
        if (icon) {
            await WebImageHelper.SetUrlImage(this.cc_Sprite$head, icon, null);
            this.reqUserHead(icon);
        }
    }



    onNameClick() {
        //更改姓名
        UIComponent.open(UIDefine.UIChangeName);
    }
    onSexClick() {
        //更改性别
        this.BottomSelector$selector.onShow();
    }
    //性别选择
    onBottomSelect(index: number) {
        this.reqChangeSex(index + 1);
    }

    //请求改变性别
    reqChangeSex(sex: number) {
        WebWww.Instance.CommonAPI(
            {
                web_class: WebUserModifyUserInfo,
                body: {
                    sex: sex,
                    used_prop_id: 0,
                }
            }
        ).then(
            (res: typeof WebUserModifyUserInfo.Response) => {
                UIComponent.Instance.ToastLanguage("UIMine_Setting117");
                this.reqUserInfo();
            },
            (res: any) => {
            }
        )
    }
    //请求用户信息，判断剩余修改次数
    reqUserInfo() {

        // WebWww.Instance.CommonAPI(
        //     {
        //         web_class: WebUserInfo,
        //     }
        // ).then(
        //     (res: typeof WebUserInfo.Response) => {
        //         this.refreshUserInfo();
        //         UIComponent.Instance.getComponent<UIMe>("UIMe")?.refreshUserInfo();
        //         UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex")?.refreshUserInfo();
        //     },
        //     (res: any) => {

        //     }
        // )

        LobbySession.APIUserInfo().then(
            (res: any) => {
                this.refreshUserInfo();
                UIComponent.Instance.getComponent<UIMe>("UIMe")?.refreshUserInfo();
                UIComponent.Instance.getComponent<UILobbyIndex>("UILobbyIndex")?.refreshUserInfo();
            }
        )
    }
    //修改头像
    reqUserHead(avatar: string) {

        WebWww.Instance.CommonAPI(
            {
                web_class: WebUserModifyUserInfo,
                body: {
                    avatar: avatar,
                }
            }
        ).then(
            (res: typeof WebUserInfo.Response) => {
                this.reqUserInfo();
            },
            (res: any) => {

            }
        )
    }
}
