import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';

const { ccclass } = cc._decorator;

@ccclass
export default class UIChatDlg extends UIBasePlus {

    // 自动绑定：$panel_click（背景遮罩，点击关闭）
    $panel_click: cc.Node = null;

    private _closeBtn: cc.Node = null;
    private _dlgNode: cc.Node = null;

    protected override lateLoad(): void {
        super.lateLoad();

        // 点击背景遮罩关闭
        this.setButtonClick(this.$panel_click, this.click_close);

        // 手动查找对话框面板内的节点
        this._dlgNode = this.node.getChildByName('ChatDlg');
        if (this._dlgNode) {
            this._closeBtn = this._dlgNode.getChildByName('closeBtn');
            if (this._closeBtn) {
                // closeBtn 没有 cc.Button 组件，直接用 touch 监听
                this._closeBtn.on(cc.Node.EventType.TOUCH_END, this.click_close, this);
            }
            // 阻止 ChatDlg 区域触摸事件冒泡，防止误触关闭
            this._dlgNode.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            });
            this._dlgNode.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
                e.stopPropagation();
            });
        }
    }

    private click_close(): void {
        UIComponent.close(UIDefine.UIChatDlg);
    }
}
