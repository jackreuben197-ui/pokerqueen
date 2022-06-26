
import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class SampleForm extends UIBase {

    title_label: cc.Label = null;

    back_btn: cc.Node = null;

    protected baseInit() {
        this.title_label = cc.find("top/title", this.node).getComponent(cc.Label);
        this.title_label.string = this.UIDefine?.Title || "Title";
        this.back_btn = cc.find("top/back_click", this.node);
        this.back_btn.on("click", this.onCloseClick, this);
    }
    protected lateLoad() {
        super.lateLoad();
        this.baseInit();
    }
    protected onCloseClick() {
        UIManager.close(this.UIDefine);
    }
}
