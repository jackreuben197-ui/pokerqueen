
import MttListItemModel from "../../frame/data/mtt/MttListItemModel";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
export default class UIMttSignDialogComponent extends UIBase {
    panel_click2: cc.Node = null;

    lateLoad() {
        super.lateLoad();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }

    onShow(data?: MttListItemModel): void {
        super.onShow(data);

        this.panel_click2 = this.getChildNodeOrComponent("panel_click2");
        this.panel_click2.active = true;   
        this.panel_click2.on(cc.Node.EventType.TOUCH_END, this.onHideAddMtt, this)
        

      
    }

    setVisible(isShow) {
        this.node.active = isShow;
        this.panel_click2.active = isShow; 
    }

    
    onHideAddMtt() {
        this.setVisible(false);
        this.panel_click2.active = false;
    }

}