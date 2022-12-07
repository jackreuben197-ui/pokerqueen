import UIBase from "../ui/UIBase";
import UIComponent from "../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('common/comFormTitle')
export default class ComFormTitle extends UIBase {

    public title: cc.Label = null;
    private rightTextBtn: cc.Label = null;


    private _target: UIBase = null;
    private _rightTextBtnCallBack: Function = null;
    lateLoad() {
        super.lateLoad();
        this.title = this.getChildNodeOrComponent("title", cc.Label);
        this.rightTextBtn = this.getChildNodeOrComponent("rightTextBtn", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.rightTextBtn, this.clickRightTextBtn);
        // this.rightTextBtn.node.off(cc.Node.EventType.TOUCH_END, this.clickRightTextBtn, this);
        // this.rightTextBtn.node.on(cc.Node.EventType.TOUCH_END, this.clickRightTextBtn, this);
    }

    onShow(param?: any): void {
        super.onShow(param);
    }

    initData(title: string, target: UIBase, rightTextStr: string = null, rightTextCallBack: Function = null) {
        this._target = target
        this.setText(this.title, title);

        this.rightTextBtn.node.active = Boolean(rightTextStr);
        if (this.rightTextBtn.node.active) {
            this._rightTextBtnCallBack = rightTextCallBack;
            this.setText(this.rightTextBtn, rightTextStr);
        }
    }

    clickRightTextBtn = () => {
        this._rightTextBtnCallBack && this._rightTextBtnCallBack.call(this._target);
    }

    clickBack() {
        UIComponent.close(this._target.UIDefine)
    }
}