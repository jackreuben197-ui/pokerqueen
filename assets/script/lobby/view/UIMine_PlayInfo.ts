import { Web_User_Info } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_PlayInfo extends BaseForm {

    protected lateLoad() {
        super.lateLoad();
        let PLACEHOLDER_LABEL = this.getChildNodeOrComponent("PLACEHOLDER_LABEL", cc.Label);
        PLACEHOLDER_LABEL.string = Web_User_Info.Response.data.user.nickname;
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
}
