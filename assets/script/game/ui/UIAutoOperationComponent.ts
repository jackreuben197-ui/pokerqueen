
import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { ActionLimit, ActionShortcutLimit, Def } from "../../protobuf/holdem/define_pb";
import GGSlider from "../../ui/component/GGSlider";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import GameUtil, { RoomType } from "../GameUtil";
import UITexasSettingComponent from "../UITexasSettingComponent";
import ToggleButton from "../../ui/component/ToggleButton";


// export type OperationData = {
//     actionLimits?: ActionLimit.AsObject[],
//     Shortcuts?: ActionShortcutLimit.AsObject[],
// }
// class ActionDataInfo {

//     // public ActionLimit actionLimit;//只用于raise 或 bet
//     public constructor(public CallAmount: number = 0, public StraddleAmount: number = 0, public AllInAmount: number = 0, public actionLimit: ActionLimit.AsObject = null) {

//     }
// }


export type AutoOperationData = {
    callAmount?: number
}


const { ccclass } = cc._decorator;

@ccclass
export default class UIAutoOperationComponent extends UIBase {
    /**
     * 组件绑定
     */
    toggleAutoFold: ToggleButton = null;
    toggleAutoCall: ToggleButton = null;
    toggleAutoAllin: ToggleButton = null;
    toggleAutoCheck: ToggleButton = null;
    textAutoCall: cc.Label = null;
    /**
     * 声明
     */
    public ParamType: AutoOperationData;
    LocalCallNum: number = 0;
    protected lateLoad(): void {
        super.lateLoad();
        this.toggleAutoFold = this.getChildNodeOrComponent("Toggle_AutoFold", ToggleButton);
        this.toggleAutoCall = this.getChildNodeOrComponent("Toggle_AutoCall", ToggleButton);
        this.toggleAutoAllin = this.getChildNodeOrComponent("Toggle_AutoAllin", ToggleButton);
        this.toggleAutoCheck = this.getChildNodeOrComponent("Toggle_AutoCheck", ToggleButton);
        this.textAutoCall = this.getChildNodeOrComponent("Text_AutoCall", cc.Label);
    }

    onShow(param?: any): void {
        super.onShow(param);
        let autoOperationData: AutoOperationData = param as AutoOperationData;
        if (null == autoOperationData)
            return;

        let enumRoomType: RoomType = GameCache.Instance.room_type;
        if (enumRoomType == RoomType.TexasHoldemStandardAof || enumRoomType == RoomType.TexasHoldemSixPlusFixedAof || enumRoomType == RoomType.Omaha4StandardAof || enumRoomType == RoomType.Omaha4SixPlusFixedAof || enumRoomType == RoomType.Omaha5SixPlusFixedAof || enumRoomType == RoomType.Omaha5StandardAof || enumRoomType == RoomType.Omaha6SixPlusFixedAof || enumRoomType == RoomType.Omaha6StandardAof) {
            //必下场，只显示Allin和Fold
            autoOperationData.callAmount = GameCache.Instance.CurGame.mainPlayer.chips;
        }

        this.toggleAutoFold.isOn = GameCache.Instance.CurGame.autoFold;
        this.toggleAutoCall.isOn = GameCache.Instance.CurGame.autoCall;
        this.toggleAutoAllin.isOn = GameCache.Instance.CurGame.autoAllin;
        this.toggleAutoCheck.isOn = GameCache.Instance.CurGame.autoCheck;

        if (autoOperationData.callAmount == 0) {
            this.toggleAutoCheck.node.active = true;
            this.toggleAutoCall.node.active = false;
            this.toggleAutoAllin.node.active = false;
        }
        else if (autoOperationData.callAmount < GameCache.Instance.CurGame.mainPlayer.chips) {
            this.toggleAutoCheck.node.active = false;
            this.toggleAutoCall.node.active = true;
            this.toggleAutoAllin.node.active = false;
            if (this.LocalCallNum < autoOperationData.callAmount) {
                this.toggleAutoCall.isOn = false;
                GameCache.Instance.CurGame.autoCall = false;
                GameCache.Instance.CurGame.autoCheck = false;
            }
            this.LocalCallNum = autoOperationData.callAmount;
            this.textAutoCall.string = StringHelper.getStringDiv100(autoOperationData.callAmount);
        } else if (autoOperationData.callAmount >= GameCache.Instance.CurGame.mainPlayer.chips) {
            GameCache.Instance.CurGame.autoCall = false;
            GameCache.Instance.CurGame.autoCheck = false;
            this.toggleAutoCheck.node.active = false;
            this.toggleAutoCall.node.active = false;
            this.toggleAutoAllin.node.active = true;
        }

    }

    protected regiterTouchEvents(): void {

    }

    static AutoOperationData(callAmount: number): AutoOperationData {
        return {
            callAmount: callAmount
        }
    }


}
