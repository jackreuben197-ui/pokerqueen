import UIBasePlus from "../ui/UIBasePlus";
import UIComponent from "../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBlank_dialog extends UIBasePlus {

    private dlgTitle: cc.Label = null;
    private closeBtn: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        // UIBasePlus 只索引 $ 节点，这里用 getChildByName 直接获取
        const titleNode = this.node.getChildByName("dlgTitle");
        this.dlgTitle = titleNode ? titleNode.getComponent(cc.Label) : null;
        this.closeBtn = this.node.getChildByName("closeBtn");
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        }
    }

    onShow(param?: { title?: string }): void {
        super.onShow(param);
        const title = (this.param as { title?: string })?.title;
        if (this.dlgTitle && title) {
            this.dlgTitle.string = title;
        }
    }

    private onClickClose(): void {
        UIComponent.close(this.UIDefine);
    }
}
