
import { StringHelper } from "../../helper/StringHelper";
import { ActionLimit, ActionShortcutLimit, Def } from "../../protobuf/holdem/define_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";
import GameUtil from "../GameUtil";
import UITexasSettingComponent from "../UITexasSettingComponent";



export type OperationData = {
    actionLimits?: ActionLimit.AsObject[],
    Shortcuts?: ActionShortcutLimit.AsObject[],
}
class ActionDataInfo {
    // public ulong CallAmount;
    // public ulong StraddleAmount;
    // public ulong AllInAmount;
    // public ActionLimit actionLimit;//只用于raise 或 bet
    public constructor(public CallAmount: number = 0, public StraddleAmount: number = 0, public AllInAmount: number = 0, public actionLimit: ActionLimit.AsObject = null) {
        // CallAmount = 0;
        // StraddleAmount = 0;
        // AllInAmount = 0;
        // actionLimit = null;
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIOperationComponent extends UIBase {
    /**
     * 组件绑定
     */
    buttonAllin: cc.Node = null;
    Button_Straddle: cc.Node = null;
    buttonCall: cc.Node = null;
    buttonCall0: cc.Node = null;
    buttonCall1: cc.Node = null;
    buttonCall2: cc.Node = null;
    buttonCallLeft: cc.Node = null;
    buttonCallRight: cc.Node = null;
    buttonCheck: cc.Node = null;
    buttonFold: cc.Node = null;
    buttonFreeCall: cc.Node = null;
    buttonFreeCallConfirm: cc.Node = null;



    Text_Straddle: cc.Label = null;
    textCallTitle0: cc.Label = null;
    textCallTitle1: cc.Label = null;
    textCallTitle2: cc.Label = null;


    textCallPot0: cc.Label = null;
    textCallPot1: cc.Label = null;
    textCallPot2: cc.Label = null;
    textCallPotLeft: cc.Label = null;
    textCallPotRight: cc.Label = null;


    textCallPotValue0: cc.Label = null;
    textCallPotValue1: cc.Label = null;
    textCallPotValue2: cc.Label = null;
    textCallPotValueLeft: cc.Label = null;
    textCallPotValueRight: cc.Label = null;

    textFreeCall: cc.Label = null;
    textFreeCallMax: cc.Label = null;

    textCall: cc.Label = null;


    imageCheckCountDown: cc.Sprite = null;
    imageFoldCountDown: cc.Sprite = null;
    /**
     * 声明
     */
    private optCurTime: number = 0;
    private optTotalTime: number = 0;
    private isCountDown: boolean = false;
    private hadAlertSound: boolean = false;
    private isShowingDialog: boolean = false;
    private calibrationWeight: number = 100;
    private chipScale: number = 100;


    private callValue0: number = 0;
    private callValue1: number = 0;
    private callValue2: number = 0;
    private callValueLeft: number = 0;
    private callValueRight: number = 0;

    /// <summary>
    /// 数据缓存
    /// </summary>
    private operationData: OperationData = null;
    private actionDataInfo: ActionDataInfo = null;

    private _isCheckCountDown: boolean = false;
    private _isFoldCountDown: boolean = false;



    protected lateLoad(): void {
        super.lateLoad();
        this.buttonAllin = this.getChildNodeOrComponent("Button_Allin");
        this.Button_Straddle = this.getChildNodeOrComponent("Button_Straddle");
        this.buttonCall = this.getChildNodeOrComponent("Button_Call");
        this.buttonCall0 = this.getChildNodeOrComponent("Button_Call0");
        this.buttonCall1 = this.getChildNodeOrComponent("Button_Call1");
        this.buttonCall2 = this.getChildNodeOrComponent("Button_Call2");
        this.buttonCallLeft = this.getChildNodeOrComponent("Button_Call_left");
        this.buttonCallRight = this.getChildNodeOrComponent("Button_Call_right");
        this.buttonCheck = this.getChildNodeOrComponent("Button_Check");
        this.buttonFold = this.getChildNodeOrComponent("Button_Fold");
        this.buttonFreeCall = this.getChildNodeOrComponent("Button_FreeCall");
        this.buttonFreeCallConfirm = this.getChildNodeOrComponent("Button_FreeCall_Confirm");


        this.imageCheckCountDown = this.getChildNodeOrComponent("Image_CheckCountDown", cc.Sprite);
        this.imageFoldCountDown = this.getChildNodeOrComponent("Image_FoldCountDown", cc.Sprite);


        this.Text_Straddle = this.Button_Straddle.getChildByName("Text").getComponent(cc.Label);

        this.textCallTitle0 = this.buttonCall0.getChildByName("Text_CallTitle").getComponent(cc.Label);
        this.textCallTitle1 = this.buttonCall1.getChildByName("Text_CallTitle").getComponent(cc.Label);
        this.textCallTitle2 = this.buttonCall2.getChildByName("Text_CallTitle").getComponent(cc.Label);



        this.textCallPot0 = this.buttonCall0.getChildByName("Text_Pot").getComponent(cc.Label);
        this.textCallPot1 = this.buttonCall1.getChildByName("Text_Pot").getComponent(cc.Label);
        this.textCallPot2 = this.buttonCall2.getChildByName("Text_Pot").getComponent(cc.Label);


        this.textCallPotLeft = this.buttonCallLeft.getChildByName("Text_Pot").getComponent(cc.Label);
        this.textCallPotRight = this.buttonCallRight.getChildByName("Text_Pot").getComponent(cc.Label);

        this.textCallPotValue0 = this.buttonCall0.getChildByName("Text_CallPotValue").getComponent(cc.Label);
        this.textCallPotValue1 = this.buttonCall1.getChildByName("Text_CallPotValue").getComponent(cc.Label);
        this.textCallPotValue2 = this.buttonCall2.getChildByName("Text_CallPotValue").getComponent(cc.Label);
        this.textCallPotValueLeft = this.buttonCallLeft.getChildByName("Text_CallPotValue").getComponent(cc.Label);
        this.textCallPotValueRight = this.buttonCallRight.getChildByName("Text_CallPotValue").getComponent(cc.Label);

        this.textCall = this.buttonCall.getChildByName("Text_Call").getComponent(cc.Label);

        //this.textFreeCall = rc.Get<GameObject>("Text_FreeCall").GetComponent<Text>();
        //this.textFreeCallMax = rc.Get<GameObject>("Text_FreeCall_Max").GetComponent<Text>();



    }


    onShow(obj?: any): void {
        super.onShow(obj);

        if (null == obj) {
            return;
        }
        GameCache.Instance.IsAllowOpenDanmu = false;

        this.operationData = obj as OperationData;
        if (null == this.operationData || null == this.operationData.actionLimits) {
            return;
        }
        this.SetCalibrationWeight();
        if (this.isShowingDialog) {
            //UIComponent.Instance.HideNoAnimation(UIType.UIDialog);
        }
        this.isShowingDialog = false;
        this.actionDataInfo = new ActionDataInfo();
        this.optCurTime = GameCache.Instance.CurGame.GetOpTime();
        this.optTotalTime = this.optCurTime;
        this.hadAlertSound = false;
        if (this.optTotalTime < GameCache.Instance.CurGame.opTime) {
            this.optTotalTime = GameCache.Instance.CurGame.opTime;
        }
        this.isCountDown = false;

        this.show(this.operationData.actionLimits);


    }

    private show(actionLimits: ActionLimit.AsObject[]): void {
        actionLimits.forEach(actionLimit => {
            switch (actionLimit.action) {
                case Def.Action.STRADDLE:

                    this.showStraddle(actionLimit);

                    break;
                case Def.Action.BET:

                    this.showBet(actionLimit);

                    break;
                case Def.Action.CALL:


                    this.showCall(actionLimit);

                    break;
                case Def.Action.FOLD:

                    this.showFold(actionLimit);

                    break;
                case Def.Action.CHECK:

                    this.showCheck(actionLimit);

                    break;
                case Def.Action.RAISE:

                    this.showBet(actionLimit);

                    break;
                case Def.Action.ALLIN:

                    if (this.getActionLimitByAction(Def.Action.BET) == null && this.getActionLimitByAction(Def.Action.RAISE) == null && this.getActionLimitByAction(Def.Action.CALL) != null) {
                        this.showAllInRaise(actionLimit);
                    }
                    else if (this.getActionLimitByAction(Def.Action.BET) == null && this.getActionLimitByAction(Def.Action.RAISE) == null && this.getActionLimitByAction(Def.Action.CHECK) != null) {
                        this.showAllInRaise(actionLimit);
                    }
                    else {
                        this.showAllin(actionLimit);
                    }


                    break;
                default:

                    cc.warn(`UIOperationComponent: cannot recognize action: ${actionLimit.action}`);

                    break;
            }
        })

    }

    //观
    private showStraddle(actionLimit: ActionLimit.AsObject): void {
        cc.log("+ showStraddle");
        this.actionDataInfo.StraddleAmount = actionLimit.min;
        this.Button_Straddle.active = true;
        this.Button_Straddle.getChildByName("Text").getComponent(cc.Label).string = StringHelper.getStringDiv100(actionLimit.min);
    }

    private showBet(actionLimit: ActionLimit.AsObject): void {
        cc.log("+ showBet");
        this.actionDataInfo.actionLimit = actionLimit;

        if (actionLimit.max == actionLimit.min) {
            // sliderFreeCall.maxValue = (float)Math.Ceiling((actionLimit.Max) / calibrationWeight);//客户端滑动条滑到顶是allin 加注限制区间加一为当前玩家最大筹码
            // sliderFreeCall.minValue = sliderFreeCall.maxValue;
            // sliderFreeCall.value = sliderFreeCall.maxValue;
            // textFreeCall.text = $"ALL IN";
            // textFreeCallMax.text = $"{(actionLimit.Max) / chipScale }";
        }
        else {
            //             sliderFreeCall.maxValue = GameUtil.JudgeIsPotLimitRoomPath((RoomType)GameCache.Instance.room_type) ? (float)Math.Ceiling((actionLimit.Max) / calibrationWeight) : (float)Math.Ceiling((actionLimit.Max + 1) / calibrationWeight);//客户端滑动条滑到顶是allin 加注限制区间加一为当前玩家最大筹码
            //             if ((float)Math.Ceiling(actionLimit.Min / calibrationWeight) >= sliderFreeCall.maxValue)
            //             {
            //                 Log.Debug("sliderFreeCall.minValue > sliderFreeCall.maxValue");
            //                 sliderFreeCall.minValue = sliderFreeCall.maxValue;
            //                 sliderFreeCall.value = sliderFreeCall.maxValue;
            //                 textFreeCall.text = $"ALL IN";
            //             }
            //                 else
            //                 {
            //     sliderFreeCall.minValue = (float)Math.Ceiling(actionLimit.Min / calibrationWeight);
            //     sliderFreeCall.value = sliderFreeCall.minValue;
            //     textFreeCall.text = $"{actionLimit.Min/ chipScale}";
            // }
            //                 ulong actionLimitMax = GameUtil.JudgeIsPotLimitRoomPath((RoomType)GameCache.Instance.room_type) ? (actionLimit.Max) : (actionLimit.Max + 1);
            // textFreeCallMax.text = $"{(actionLimitMax) / chipScale }";
            //             }
            this.setTopCallButtons();
            this.buttonFreeCall.active = true;
        }
    }


    private showCall(actionLimit: ActionLimit.AsObject): void {
        cc.log("+ showCall");
        this.actionDataInfo.CallAmount = actionLimit.min;
        this.buttonCall.active = true;
        this.textCall.string = StringHelper.getStringDiv100(actionLimit.min);
    }

    private showFold(actionLimit: ActionLimit.AsObject): void {
        cc.log("+ showFold");
        this.buttonFold.active = true;
        if (this.getActionLimitByAction(Def.Action.CHECK) != null) {
            return;
        }
        this.imageFoldCountDown.node.active = true;
        this.imageFoldCountDown.fillRange = 1;
        this._isFoldCountDown = true;
    }

    private showCheck(AactionLimit: ActionLimit.AsObject): void {
        cc.log("+ showCheck");
        this.buttonCheck.active = true;
        this.imageCheckCountDown.node.active = true;
        this.imageCheckCountDown.fillRange = 1;
        this._isCheckCountDown = true;
    }
    /// <summary>
    /// 设置 n/m底池加注按钮
    /// </summary>
    private setTopCallButtons(): void {
        if (this.operationData == null) {
            return;
        }
        let totalChips: number = GameCache.Instance.CurGame.mainPlayer.chips;

        let numLeftStr: string = UITexasSettingComponent.GetCurQuickActionNum(0);
        let num0Str: string = UITexasSettingComponent.GetCurQuickActionNum(1);
        let num1Str: string = UITexasSettingComponent.GetCurQuickActionNum(2);
        let num2Str: string = UITexasSettingComponent.GetCurQuickActionNum(3);
        let numRightStr: string = UITexasSettingComponent.GetCurQuickActionNum(4);

        this.callValueLeft = numLeftStr == "Allin" ? totalChips : (numLeftStr == "0" ? 0 : this.getPotMutiplierByQuickAction(UITexasSettingComponent.GetCurQuickActionNumValue(0)));
        this.callValue0 = num0Str == "Allin" ? totalChips : this.getPotMutiplierByQuickAction(UITexasSettingComponent.GetCurQuickActionNumValue(1));
        this.callValue1 = num1Str == "Allin" ? totalChips : this.getPotMutiplierByQuickAction(UITexasSettingComponent.GetCurQuickActionNumValue(2));
        this.callValue2 = num2Str == "Allin" ? totalChips : this.getPotMutiplierByQuickAction(UITexasSettingComponent.GetCurQuickActionNumValue(3));
        this.callValueRight = numRightStr == "Allin" ? totalChips : (numRightStr == "0" ? 0 : this.getPotMutiplierByQuickAction(UITexasSettingComponent.GetCurQuickActionNumValue(4)));

        this.textCallTitle0.string = "POT";
        this.textCallTitle1.string = "POT";
        this.textCallTitle2.string = "POT";

        this.textCallPotLeft.string = UITexasSettingComponent.GetCurQuickActionNum(0);
        this.textCallPot0.string = UITexasSettingComponent.GetCurQuickActionNum(1);
        this.textCallPot1.string = UITexasSettingComponent.GetCurQuickActionNum(2);
        this.textCallPot2.string = UITexasSettingComponent.GetCurQuickActionNum(3);
        this.textCallPotRight.string = UITexasSettingComponent.GetCurQuickActionNum(4);
        //}

        this.textCallPotValue0.string = this.callValue0 <= 0 ? "" : (this.callValue0 < totalChips ? StringHelper.getStringDiv100(this.callValue0) : "All in");
        this.textCallPotValue1.string = this.callValue1 <= 0 ? "" : (this.callValue1 < totalChips ? StringHelper.getStringDiv100(this.callValue1) : "All in");
        this.textCallPotValue2.string = this.callValue2 <= 0 ? "" : (this.callValue2 < totalChips ? StringHelper.getStringDiv100(this.callValue2) : "All in");
        this.textCallPotValueLeft.string = this.callValueLeft <= 0 ? "" : (this.callValueLeft < totalChips ? StringHelper.getStringDiv100(this.callValueLeft) : "All in");
        this.textCallPotValueRight.string = this.callValueRight <= 0 ? "" : (this.callValueRight < totalChips ? StringHelper.getStringDiv100(this.callValueRight) : "All in");

        //展示加注按钮和自由加注按钮
        this.showRaiseButton();
    }


    /// <summary>
    /// 展示加注按钮和自由加注按钮
    /// </summary>
    private showRaiseButton(): void {
        this.buttonCall0.active = true;
        this.buttonCall1.active = true;
        this.buttonCall2.active = true;

        this.buttonCallLeft.active = UITexasSettingComponent.GetCurQuickActionNum(0) != "0";

        this.buttonCallRight.active = UITexasSettingComponent.GetCurQuickActionNum(4) != "0";

        this.buttonFreeCall.active = true;
    }


    private showAllInRaise(actionLimit: ActionLimit.AsObject): void {
        this.actionDataInfo.AllInAmount = actionLimit.min;
        this.actionDataInfo.actionLimit = actionLimit;
        // this.sliderFreeCall.maxValue = (float)Math.Ceiling((actionLimit.Max) / calibrationWeight);//客户端滑动条滑到顶是allin 加注限制区间加一为当前玩家最大筹码
        // this.sliderFreeCall.minValue = sliderFreeCall.maxValue;
        // this.sliderFreeCall.value = sliderFreeCall.maxValue;
        //this.textFreeCall.string = `ALL IN`;
        //this.textFreeCallMax.string = `${(actionLimit.max) / this.chipScale}`;
        this.setTopCallButtons();
        this.buttonFreeCall.active = true;
        cc.log("+ showRaise");
    }

    private showAllin(actionLimit: ActionLimit.AsObject) {
        cc.log("+ showAllin");
        this.actionDataInfo.AllInAmount = actionLimit.min;
        this.buttonAllin.active = true;
    }



    /// <summary>
    /// 获取快捷面板底池加注值
    /// </summary>
    /// <param name="quickActionStr"></param>
    /// <returns></returns>
    private getPotMutiplierByQuickAction(times: number): number {
        let valueTmp: number = this.actionDataInfo.actionLimit.min;
        if (this.actionDataInfo.actionLimit.action == Def.Action.ALLIN) {
            cc.log("Allin");
            valueTmp = GameCache.Instance.CurGame.mainPlayer.chips;
        }
        else {
            if (GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type)) {
                cc.log("IsPotLimit");
                if (this.potMutiplier(times) >= GameCache.Instance.CurGame.mainPlayer.chips && this.potMutiplier(times) <= this.actionDataInfo.actionLimit.max) {
                    valueTmp = GameCache.Instance.CurGame.mainPlayer.chips;
                }
                else {
                    if (this.potMutiplier(times) >= this.actionDataInfo.actionLimit.max) {
                        valueTmp = this.actionDataInfo.actionLimit.max;
                    }
                    else if (this.potMutiplier(times) <= this.actionDataInfo.actionLimit.min) {
                        valueTmp = this.actionDataInfo.actionLimit.min;
                    }
                    else {
                        valueTmp = this.potMutiplier(times);
                    }
                }
            }
            else {
                if (this.potMutiplier(times) >= GameCache.Instance.CurGame.mainPlayer.chips) {
                    valueTmp = GameCache.Instance.CurGame.mainPlayer.chips;
                }
                else {
                    if (this.potMutiplier(times) > this.actionDataInfo.actionLimit.min) {
                        valueTmp = this.potMutiplier(times);
                    }
                    else {
                        valueTmp = this.actionDataInfo.actionLimit.min;
                    }
                }
                cc.log("not IsPotLimit");
                valueTmp = this.potMutiplier(times) >= GameCache.Instance.CurGame.mainPlayer.chips ? GameCache.Instance.CurGame.mainPlayer.chips : (this.potMutiplier(times) >= this.actionDataInfo.actionLimit.min ? this.potMutiplier(times) : this.actionDataInfo.actionLimit.min);
            }
        }
        if (valueTmp < GameCache.Instance.CurGame.mainPlayer.chips) {
            if (Math.ceil(valueTmp / this.calibrationWeight) * this.calibrationWeight >= this.actionDataInfo.actionLimit.max) {
                valueTmp = Math.floor(this.actionDataInfo.actionLimit.max / this.calibrationWeight) * this.calibrationWeight;
            }
            else {
                valueTmp = Math.ceil(valueTmp / this.calibrationWeight) * this.calibrationWeight;
            }
        }
        cc.log("times:" + times + "  valueTmp:" + valueTmp + "  potMutiplier(times):" + this.potMutiplier(times));

        return valueTmp;
    }

    /// <summary>
    /// 通过Action 取得ActionLimit
    /// </summary>
    /// <param name="action"></param>
    /// <returns></returns>
    private getActionLimitByAction(action: Def.ActionMap[keyof Def.ActionMap]): ActionLimit.AsObject {
        for (let actionLimit of this.operationData.actionLimits) {
            if (actionLimit.action == action) {
                return actionLimit;
            }
        }
        return null;
    }
    /// <summary>
    /// 计算 n/m池加注 数值
    /// </summary>
    /// <param name="times"></param>
    /// <returns></returns>
    private potMutiplier(times: number): number {
        return this.actionDataInfo.CallAmount + (GameCache.Instance.CurGame.alreadAnte + this.actionDataInfo.CallAmount) * times;
    }


    private SetCalibrationWeight(): void {
        if (GameCache.Instance.CurGame.smallBlind < 100) {
            this.calibrationWeight = 10;
        }
        else {
            this.calibrationWeight = 100;
        }

    }

    static GetOperationData(actionsList, shortcutsList): OperationData {
        return {
            actionLimits: actionsList,
            Shortcuts: shortcutsList
        }
    }

    protected update(dt: number): void {
        if (!this._isCheckCountDown && !this._isFoldCountDown) {
            return;
        }

        if (this._isCheckCountDown) {
            this.imageCheckCountDown.fillRange = (this.optCurTime -= dt) / this.optTotalTime;

            if (this.imageCheckCountDown.fillRange <= 0.02) {
                //GameCache.Instance.CurGame.HideBtnDelay(false);
            }
            if (this.imageCheckCountDown.fillRange <= 0) {
                this.isCountDown = false;
                this.imageCheckCountDown.node.active = false;
                if (this.isShowingDialog)
                    //UIComponent.Instance.HideNoAnimation(UIType.UIDialog);
                    this.isShowingDialog = false;
                //如需客户端倒计时结束发送让牌，在这里做
                GameCache.Instance.CurGame.HideOperationPanel();

            }
        }

        if (this._isFoldCountDown) {
            this.imageFoldCountDown.fillRange = (this.optCurTime -= dt) / this.optTotalTime;
            if (this.imageFoldCountDown.fillRange <= 0.02) {
                //GameCache.Instance.CurGame.HideBtnDelay(false);
            }
            if (this.imageFoldCountDown.fillRange <= 0) {
                this.isCountDown = false;
                this.imageFoldCountDown.node.active = false;
                if (this.isShowingDialog)
                    //UIComponent.Instance.HideNoAnimation(UIType.UIDialog);
                    this.isShowingDialog = false;
                //如需客户端倒计时结束发送弃牌，在这里做
                GameCache.Instance.CurGame.HideOperationPanel();
            }
        }

        if (this.optCurTime < 6.1 && this.optCurTime > 6 && !this.hadAlertSound) {
            //剩余5秒音效
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_ACTION_ALERT);
            this.hadAlertSound = true;
            //this.DelayPlayBarrage();
        }
    }
}
