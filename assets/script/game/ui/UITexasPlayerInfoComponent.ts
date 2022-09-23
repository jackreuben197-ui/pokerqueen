import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasPlayerInfoComponent extends UIBase {

    btn_close: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        //节点引用
        this.btn_close = this.getChildNodeOrComponent("btn_close");
    }
    onShow(param?: any): void {
        super.onShow(param);
    }

    protected regiterTouchEvents(): void {
        this.btn_close.on("click", this.onClickClose, this);
    }

    private onClickClose(): void {
        //PlayerPrefsMgr.mInstance.SetInt(PlayerPrefsKeys.KEY_INFODEFAULT, GameCache.Instance.CurInfoRoomPath);
        UIComponent.close(this.UIDefine);
    }
}
