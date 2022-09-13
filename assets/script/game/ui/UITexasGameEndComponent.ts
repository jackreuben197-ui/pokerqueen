import { UIDefine } from "../../define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasGameEndComponent extends UIBase {

    Button_back: cc.Node = null;







    protected lateLoad(): void {
        super.lateLoad();
        this.Button_back = this.getChildNodeOrComponent("Button_back");

    }
    protected regiterTouchEvents(): void {
        this.Button_back.getChildByName("BtnArea").on("click", this.onBackClick, this);
    }


    onShow(param?: any): void {
        super.onShow(param);
    }


    private onBackClick() {
        UIComponent.close(UIDefine.UITexasGameEndComponent);
    }

}
