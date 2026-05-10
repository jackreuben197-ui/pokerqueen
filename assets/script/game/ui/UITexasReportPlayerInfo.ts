import GGEvent from '../../event/GGEvent';
import GC from '../../frame/GameControl';
import { StringHelper } from '../../helper/StringHelper';
import WebImageHelper from '../../helper/WebImageHelper';
import { LobbyControl } from '../../uimodel/LobbyControl';
import { WebStatsOtherUserStats } from '../../net/https/WebRequest';
import UIBase from '../../ui/UIBase';
import UIComponent from '../../ui/UIComponent';
import { UITexasModel } from '../UITexasModel';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/game/ui/UITexasReportPlayerInfo')
export default class UITexasReportPlayerInfo extends UIBase {
    openInfo: any = null;
    respInfo: any = null;
    isShowDown: boolean = null;
    private _isClosing: boolean = false;
    private _activeUserId: number = 0;
    private _statsRequestToken: number = 0;
    btn_close: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        //节点引用
        this.btn_close = this.getChildNodeOrComponent('btn_close');
    }

    onShow(param?: any): void {
        super.onShow(param);
        // this.isShowDown = param[0] != GameCache.Instance.nUserId;
        this.isShowDown = false;
        this.openInfo = param;
        this._isClosing = false;
        this._activeUserId = Number(param[0]) || 0;
        const currentRequestToken = ++this._statsRequestToken;
        let info = {};
        LobbyControl.getInstance()
            .reqOherUserInfo(param[0], info)
            .then(
                (res: any) => {
                    if (res.data) {
                        this.refreshHeadImg(res.data.avatar);
                        this.refreshUserName(res.data.nick_name);
                    }
                },
                res => {}
            );
        // let img_gold: cc.Node = this.getChildNodeOrComponent("img_gold");
        // let lbl_gold: cc.Node = this.getChildNodeOrComponent("lbl_gold");
        // if (param[0] != GameCache.Instance.nUserId) {
        //     img_gold.active = false;
        //     lbl_gold.active = false;
        // } else {
        //     img_gold.active = true;
        //     lbl_gold.active = true;
        // }
        this.refreshUpInfo();
        this.resetCenterInfo();
        UITexasModel.mInstance
            .getOtherUserStats(this._activeUserId, (tResp: typeof WebStatsOtherUserStats.Response) => {
                if (!this.canRefreshStats()) {
                    return;
                }
                if (currentRequestToken !== this._statsRequestToken) {
                    return;
                }
                if ((Number(this.openInfo?.[0]) || 0) !== this._activeUserId) {
                    return;
                }
                if (tResp.code == 0) {
                    const cacheMeta = (tResp as any)?.__cacheMeta;
                    console.log(
                        `[UITexasReportPlayerInfo] user=${this._activeUserId} source=${cacheMeta?.source || 'network'} skipRequest=${cacheMeta?.skippedRequest ? 'yes' : 'no'}`
                    );
                    this.refreshCenterInfo(tResp);
                }
            })
            .catch(() => {});
        // this.refreshDownInfo();
    }

    onClose(param?: any): void {
        this._isClosing = true;
        this._statsRequestToken += 1;
        super.onClose(param);
    }

    private canRefreshStats(): boolean {
        return !this._isClosing && this.nodeIsValid(this.node) && this.node.activeInHierarchy;
    }

    refreshUpInfo() {
        let lbl_id = this.getChildNodeOrComponent('lbl_id', cc.Label);
        lbl_id.string = 'ID:' + this.openInfo[0].toString();
        // let leavelChips = this.openInfo[2].leavelChips ?? 0;
        let lbl_gold = this.getChildNodeOrComponent('lbl_gold', cc.Label);
        lbl_gold.string = GC.data.user.info.displayGold.toString();
    }

    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
        this.listen(GGEvent.Refresh_UserHead, this.refreshHeadImg);
        this.listen(GGEvent.Refresh_UserName, this.refreshUserName);
    }

    refreshHeadImg(headStr: string) {
        let img_head: cc.Sprite = this.getChildNodeOrComponent('img_head', cc.Sprite);
        // img_head.node.active = false;
        WebImageHelper.SetUrlImage(img_head, headStr).then(() => {
            img_head.node.active = true;
        });
    }

    refreshUserName(nameStr: string) {
        let lbl_nickname = this.getChildNodeOrComponent('lbl_name', cc.Label);
        lbl_nickname.string = StringHelper.LengthNick(nameStr);
    }

    resetCenterInfo() {
        let panel_bottom: cc.Node = this.getChildNodeOrComponent('panel_bottom');
        panel_bottom.children.forEach(element => {
            let lbl = element.getComponent(cc.Label);
            lbl.string = '';
        });
    }

    refreshCenterInfo(info: any) {
        let room_data = info.data.room_data;
        let panel_bottom: cc.Node = this.getChildNodeOrComponent('panel_bottom');
        panel_bottom.children.forEach((element, index) => {
            let lbl = element.getComponent(cc.Label);
            if (index == 0) {
                lbl.string = room_data.total_game_cnt.toString();
            } else if (index == 1) {
                lbl.string = room_data.vpip.toString() + '%';
            } else if (index == 2) {
                lbl.string = room_data.prf.toString() + '%';
            } else if (index == 3) {
                lbl.string = room_data.total_hand.toString();
            } else if (index == 4) {
                lbl.string = room_data.wins.toString() + '%';
            } else if (index == 5) {
                lbl.string = (room_data.aveage_earn_hundred / 100).toString();
            }
        });
    }

    refreshDownInfo() {
        // let panel_down: cc.Node = this.getChildNodeOrComponent("panel_down");
        // let img_bg1: cc.Node = this.getChildNodeOrComponent("img_bg1");
        // let img_bg0: cc.Node = this.getChildNodeOrComponent("img_bg0");
        // let btn_close: cc.Node = this.getChildNodeOrComponent("btn_close");
        // if (this.isShowDown == false) {
        //     panel_down.active = false;
        //     img_bg1.active = false;
        //     img_bg0.active = true;
        //     btn_close.y = -600;
        //     return;
        // }
        // panel_down.active = true;
        // img_bg1.active = true;
        // img_bg0.active = false;
        // btn_close.y = -1055;
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.btn_close.on('click', this.onClickClose, this);
        let panel_click: cc.Node = this.getChildNodeOrComponent('panel_click');
        panel_click.on('click', this.onClickClose, this);
    }

    private onClickClose(): void {
        //PlayerPrefsMgr.mInstance.SetInt(PlayerPrefsKeys.KEY_INFODEFAULT, GameCache.Instance.CurInfoRoomPath);
        UIComponent.close(this.UIDefine);
    }
}
