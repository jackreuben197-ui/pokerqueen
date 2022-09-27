import { Web_Stats_Other_User_Stats } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { UITexasModel } from "../UITexasModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasPlayerInfoComponent extends UIBase {

    openInfo: any = null;
    respInfo: any = null;
    isShowDown: boolean = null;

    btn_close: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        //节点引用
        this.btn_close = this.getChildNodeOrComponent("btn_close");
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.isShowDown = param[0] != GameCache.Instance.nUserId;
        this.openInfo = param;
        UITexasModel.mInstance.getOtherUserStats(param[0]).then(
            (tResp: typeof Web_Stats_Other_User_Stats.Response) => {
            if (tResp.code == 0) {
                this.refreshCenterInfo(tResp);
            }
        }, (tResp: typeof Web_Stats_Other_User_Stats.Response) => {
        })
        this.refreshUpInfo();
        this.resetCenterInfo();
        this.refreshDownInfo();
    }

    refreshUpInfo() {
        let lbl_id = this.getChildNodeOrComponent("lbl_id", cc.Label);
        lbl_id.string = this.openInfo[0].toString();
        let leavelChips = this.openInfo[2].leavelChips ?? 0;
        let lbl_gold = this.getChildNodeOrComponent("lbl_gold", cc.Label);
        lbl_gold.string = leavelChips.toString();
    }

    resetCenterInfo() {
        let panel_bottom: cc.Node = this.getChildNodeOrComponent("panel_bottom");
        panel_bottom.children.forEach(element => {
            let lbl = element.getComponent(cc.Label);
            lbl.string = "";
        });
    }

    refreshCenterInfo(info: any) {
        let room_data = info.data.room_data;
        let panel_bottom: cc.Node = this.getChildNodeOrComponent("panel_bottom");
        panel_bottom.children.forEach((element, index) => {
            let lbl = element.getComponent(cc.Label);
            if (index == 0) {
                lbl.string = room_data.total_game_cnt.toString();
            } else if (index == 1) {
                lbl.string = room_data.vpip.toString() + "%";
            } else if (index == 2) {
                lbl.string = room_data.prf.toString() + "%";
            } else if (index == 3) {
                lbl.string = room_data.total_hand.toString();
            } else if (index == 4) {
                lbl.string = room_data.wins.toString() + "%";
            } else if (index == 5) {
                lbl.string = (room_data.aveage_earn_hundred / 100).toString();
            }
        });
    }

    refreshDownInfo() {
        let panel_down: cc.Node = this.getChildNodeOrComponent("panel_down");
        let img_bg1: cc.Node = this.getChildNodeOrComponent("img_bg1");
        let img_bg0: cc.Node = this.getChildNodeOrComponent("img_bg0");
        let btn_close: cc.Node = this.getChildNodeOrComponent("btn_close");
        if (this.isShowDown == false) {
            panel_down.active = false;
            img_bg1.active = false;
            img_bg0.active = true;
            btn_close.y = -600;
            return;
        }
        panel_down.active = true;
        img_bg1.active = true;
        img_bg0.active = false;
        btn_close.y = -1055;

    }

    protected regiterTouchEvents(): void {
        this.btn_close.on("click", this.onClickClose, this);
    }

    private onClickClose(): void {
        //PlayerPrefsMgr.mInstance.SetInt(PlayerPrefsKeys.KEY_INFODEFAULT, GameCache.Instance.CurInfoRoomPath);
        UIComponent.close(this.UIDefine);
    }
}
