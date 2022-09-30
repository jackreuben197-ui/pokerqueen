
import { GameConfig } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UICommonMgr } from "../../ui/UIMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_About extends BaseForm {


    protected lateLoad() {
        super.lateLoad();
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
