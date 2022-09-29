import { Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_PlayInfo extends BaseForm {


    ebx_name: cc.EditBox = null;

    protected lateLoad() {
        super.lateLoad();
        let PLACEHOLDER_LABEL = this.getChildNodeOrComponent("PLACEHOLDER_LABEL", cc.Label);
        PLACEHOLDER_LABEL.string = Web_User_Info.Response.data.user.nickname;

        let btn_save: cc.Node = this.getChildNodeOrComponent("btn_save");
        btn_save.on(cc.Node.EventType.TOUCH_END, this.onClickSave, this);

        this.ebx_name = this.getChildNodeOrComponent("ebx_name", cc.EditBox);
        this.ebx_name.string = "";
    }

    lateClose(param: any = null) {
        super.lateClose(param);
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
     * 20004 ： 用户钱包金额不足
     * 20009 用户钱包被冻结
     */
    onClickSave () {
        let data = {
            nickname: this.ebx_name.string
        }
        LobbyControl.getInstance().CheckNickName(data).then((res) => {
            LobbyControl.getInstance().fixUserInfo({
                sex: 0,
                nick_name: this.ebx_name.string,
                avatar: ""
            }).then((res) => {
                this.close()
            },)
        }, (res) => {
            // 用户名违规
        })
    }
}
