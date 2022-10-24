
import { GameConfig } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UICommonMgr } from "../../ui/UIMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_SettingVersion extends BaseForm {


    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        let version_Text = this.getChildNodeOrComponent("Version_Text", cc.Label);
        version_Text.string = GameConfig.Version;
        
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
