import GGEvent from "../../event/GGEvent";
import { GameCache } from "../../game/GameCache";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon, Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_PlayInfo extends BaseForm {


    ebx_name: cc.EditBox = null;

    img_head: cc.Sprite = null;

    isFixHead: boolean = false;
    isFixName: boolean = false;
    isCanFix: boolean = false;

    protected lateLoad() {
        super.lateLoad();
        let PLACEHOLDER_LABEL = this.getChildNodeOrComponent("PLACEHOLDER_LABEL", cc.Label);
        PLACEHOLDER_LABEL.string = Web_User_Info.Response.data.user.nickname;

        let lbl_name = this.getChildNodeOrComponent("lbl_name", cc.Label);
        lbl_name.string = Web_User_Info.Response.data.user.nickname;

        let btn_save: cc.Node = this.getChildNodeOrComponent("btn_save");
        btn_save.on(cc.Node.EventType.TOUCH_END, this.onClickSave, this);

        this.ebx_name = this.getChildNodeOrComponent("ebx_name", cc.EditBox);
        this.ebx_name.string = "";

        let UIHead: cc.Node = this.getChildNodeOrComponent("UIHead")
        UIHead.on(cc.Node.EventType.TOUCH_END, this.onClickHead, this);

        this.img_head = this.getChildNodeOrComponent("img_head", cc.Sprite);
        WebImageHelper.SetUrlImage(this.img_head, GameCache.Instance.headPic);

        let img_right: cc.Node = this.getChildNodeOrComponent("img_right")
        img_right.on(cc.Node.EventType.TOUCH_END, this.onClickFix, this);

        this.refreshInputColor();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
        this.isFixHead = false;
        this.isFixName = false;
        this.isCanFix = false;
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: BaseForm): void {
        super.onShow(param, fromUI);
    }
    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
    }

    /**
     * 20004 用户钱包金额不足
     * 20009 用户钱包被冻结
     */
    onClickSave () {
        if (this.isFixHead) {
            if (this.isFixName) {
                // 修改昵称和头像

            } else {
                // 修改头像

            }
        } else {
            // 修改昵称
        }
        let info = {
            nickname: this.ebx_name.string
        }
        let headStr: any = "";
        if (APIOrgClubUploadIcon.Response && APIOrgClubUploadIcon.Response.data) {
            headStr = APIOrgClubUploadIcon.Response.data;
        }
        LobbyControl.getInstance().CheckNickName(info).then((res) => {
            LobbyControl.getInstance().fixUserInfo({
                sex: 0,
                nick_name: this.ebx_name.string,
                avatar: headStr
            }).then((res) => {
                this.close()
            },)
        }, (res) => {
            // 用户名违规
        })
    }

    async onClickHead() {
        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        if (icon) {
            WebImageHelper.SetUrlImage(this.img_head, icon);
            this.post(GGEvent.Refresh_UserHead);
            this.isFixHead = true;
        }
    }

    refreshInputColor() {
        let ebx_name: cc.Node = this.getChildNodeOrComponent("ebx_name");
        let lbl_name: cc.Node = this.getChildNodeOrComponent("lbl_name");
        if (this.isCanFix) {
            ebx_name.active = true;
            lbl_name.active = false;
        } else {
            ebx_name.active = false;
            lbl_name.active = true;
        }
        
    }

    onClickFix() {
        this.isCanFix = !this.isCanFix;
        this.refreshInputColor();
    }
}
