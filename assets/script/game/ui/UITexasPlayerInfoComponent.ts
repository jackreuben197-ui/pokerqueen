import { Web_Stats_Other_User_Stats } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UITexasModel } from "../UITexasModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasPlayerInfoComponent extends UIBase {

    openInfo: any = null;
    respInfo: any = null;

    btn_close: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        //节点引用
        this.btn_close = this.getChildNodeOrComponent("btn_close");
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.openInfo = param;
        UITexasModel.mInstance.getOtherUserStats(param[0]).then(
            (tResp: typeof Web_Stats_Other_User_Stats.Response) => {
            if (tResp.code == 0) {
                this.refreshDownInfo();
            }
        }, (tResp: typeof Web_Stats_Other_User_Stats.Response) => {
        })
        this.refreshUpInfo();
        this.resetDownInfo();
    }

    refreshUpInfo() {
        let lbl_id = this.getChildNodeOrComponent("lbl_id", cc.Label);
        lbl_id.string = this.openInfo[0].toString();
        let leavelChips = this.openInfo[2].leavelChips ?? 0;
        let lbl_gold = this.getChildNodeOrComponent("lbl_gold", cc.Label);
        lbl_gold.string = leavelChips.toString();
    }

    resetDownInfo() {
        let panel_bottom: cc.Node = this.getChildNodeOrComponent("panel_bottom");
        panel_bottom.children.forEach(element => {
            let lbl = element.getComponent(cc.Label);
            lbl.string = "";
        });
    }

    refreshDownInfo() {
        let panel_bottom: cc.Node = this.getChildNodeOrComponent("panel_bottom");
        panel_bottom.children.forEach(element => {
            let lbl = element.getComponent(cc.Label);
            // lbl.string = "";
        });
    }

    protected regiterTouchEvents(): void {
        this.btn_close.on("click", this.onClickClose, this);
    }

    private onClickClose(): void {
        //PlayerPrefsMgr.mInstance.SetInt(PlayerPrefsKeys.KEY_INFODEFAULT, GameCache.Instance.CurInfoRoomPath);
        UIComponent.close(this.UIDefine);
    }
}
