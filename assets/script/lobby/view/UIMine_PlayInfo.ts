import GGEvent from "../../event/GGEvent";
import { GameCache } from "../../game/GameCache";
import WebImageHelper from "../../helper/WebImageHelper";
import ToastManager from "../../manager/ToastManager";
import { APIOrgClubUploadIcon, Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_PlayInfo extends BaseForm {


    ebx_name: cc.EditBox = null;

    isFixHead: boolean = false;
    isFixName: boolean = false;
    isCanFix: boolean = false;

    protected lateLoad() {
        super.lateLoad();
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

        this.refreshHeadImg();

        let img_right: cc.Node = this.getChildNodeOrComponent("img_right")
        img_right.on(cc.Node.EventType.TOUCH_END, this.onClickFix, this);

        this.isCanFix = false;
        this.refreshInputColor();
    }

    refreshHeadImg() {
        let img_head: cc.Sprite = this.getChildNodeOrComponent("img_head", cc.Sprite);
        img_head.node.active =false;
        WebImageHelper.SetUrlImage(img_head, GameCache.Instance.headPic).then(()=>{
            img_head.node.active =true;
        });
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

        let reqParames = {};

        if (this.ebx_name.string != "" && this.ebx_name.string != Web_User_Info.Response.data.user.nickname) {
            this.isFixName = true;
        } else {
            this.isFixName = false;
        }
        
        let headStr: any = "";
        let isCheckName: boolean = false;
        if (this.isFixHead) {
            if (APIOrgClubUploadIcon.Response && APIOrgClubUploadIcon.Response.data) {
                headStr = APIOrgClubUploadIcon.Response.data;
            }   
            if (this.isFixName) {
                // 修改昵称和头像
                reqParames = {
                    nick_name: this.ebx_name.string,
                    avatar: headStr
                }
                isCheckName = true;
            } else {
                // 修改头像
                reqParames = {
                    nick_name: Web_User_Info.Response.data.user.nickname,
                    avatar: headStr
                }
            }
        } else {
            if (this.isFixName) {
                // 修改昵称
                reqParames = {
                    nick_name: this.ebx_name.string,
                    avatar: GameCache.Instance.headPic
                }
                isCheckName = true;
            } else {
                ToastManager.Instance.createToast("请设置头像或者修改昵称");
                return;
            }
        }
        let info = {
            nickname: this.ebx_name.string
        }
        if (isCheckName) {
            LobbyControl.getInstance().CheckNickName(info).then((res) => {
                LobbyControl.getInstance().fixUserInfo(reqParames).then((res) => {
                    this.close()
                    if (this.isFixHead) {
                        GameCache.Instance.headPic = headStr;
                        this.post(GGEvent.Refresh_UserHead);
                    }
                    if (this.isFixName) {
                        Web_User_Info.Response.data.user.nickname = this.ebx_name.string;
                        this.post(GGEvent.Refresh_UserName);
                    }
    
                },)
            }, (res) => {
                // 用户名违规
            })
        } else {
            LobbyControl.getInstance().fixUserInfo(reqParames).then((res) => {
                this.close()
                if (this.isFixHead) {
                    GameCache.Instance.headPic = headStr;
                    this.post(GGEvent.Refresh_UserHead);
                }
            },)
        }
        
    }

    async onClickHead() {
        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        if (icon) {
            let img_head: cc.Sprite = this.getChildNodeOrComponent("img_head", cc.Sprite);
            WebImageHelper.SetUrlImage(img_head, icon);
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
