import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasPlayerInfoComponent extends UIBase {

    Image_MenuMask: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        //节点引用
        this.Image_MenuMask = this.getChildNodeOrComponent("Image_MenuMask");
    }
    onShow(param?: any): void {
        super.onShow(param);
    }

    protected regiterTouchEvents(): void {
        this.Image_MenuMask.on("click", this.onClickClose, this);
    }

    private onClickClose(): void {
        //PlayerPrefsMgr.mInstance.SetInt(PlayerPrefsKeys.KEY_INFODEFAULT, GameCache.Instance.CurInfoRoomPath);
        UIComponent.close(this.UIDefine);
    }
}
