
import { StringHelper } from "../../helper/StringHelper";
import { ActionLimit, ActionShortcutLimit, Def } from "../../protobuf/holdem/define_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";
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
    public constructor(public CallAmount = 0, public StraddleAmount = 0, public AllInAmount = 0, public actionLimit = null) {
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


    private callValue0: number;
    private callValue1: number;
    private callValue2: number;
    private callValueLeft: number;
    private callValueRight: number;

    /// <summary>
    /// 数据缓存
    /// </summary>
    private operationData: OperationData;
    private actionDataInfo: ActionDataInfo;



    protected lateLoad(): void {
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
        //this.buttonFreeCall = this.getChildNodeOrComponent("Button_Allin");
        this.buttonFreeCallConfirm = this.getChildNodeOrComponent("Button_FreeCall_Confirm");




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

                    if (this.getActionLimitByAction(pbt.Action.Bet) == null && this.getActionLimitByAction(pbt.Action.Raise) == null && this.getActionLimitByAction(pbt.Action.Call) != null) {
                        this.showAllInRaise(actionLimit);
                    }
                    else if (getActionLimitByAction(pbt.Action.Bet) == null && this.getActionLimitByAction(pbt.Action.Raise) == null && this.getActionLimitByAction(pbt.Action.Check) != null) {
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

       this. textCallPotValue0.text = callValue0 <= 0 ? string.Empty : (callValue0 < totalChips ? StringHelper.GetLongString((long)callValue0) : "All in");
       this. textCallPotValue1.text = callValue1 <= 0 ? string.Empty : (callValue1 < totalChips ? StringHelper.GetLongString((long)callValue1) : "All in");
       this. textCallPotValue2.text = callValue2 <= 0 ? string.Empty : (callValue2 < totalChips ? StringHelper.GetLongString((long)callValue2) : "All in");
       this. textCallPotValueLeft.text = callValueLeft <= 0 ? string.Empty : (callValueLeft < totalChips ? StringHelper.GetLongString((long)callValueLeft) : "All in");
       this.textCallPotValueRight.text = callValueRight <= 0 ? string.Empty : (callValueRight < totalChips ? StringHelper.GetLongString((long)callValueRight) : "All in");

        //展示加注按钮和自由加注按钮
        this.showRaiseButton();
    }

    /// <summary>
    /// 获取快捷面板底池加注值
    /// </summary>
    /// <param name="quickActionStr"></param>
    /// <returns></returns>
    private getPotMutiplierByQuickAction(float times): number {
            ulong valueTmp = actionDataInfo.actionLimit.Min;
        if (actionDataInfo.actionLimit.Action == pbt.Action.Allin) {
            Log.Debug("Allin");
            valueTmp = GameCache.Instance.CurGame.MainPlayer.chips;
        }
        else {
            if (GameUtil.JudgeIsPotLimitRoomPath((RoomType)GameCache.Instance.room_type)) {
                Log.Debug("IsPotLimit");
                if (potMutiplier(times) >= GameCache.Instance.CurGame.MainPlayer.chips && potMutiplier(times) <= actionDataInfo.actionLimit.Max) {
                    valueTmp = GameCache.Instance.CurGame.MainPlayer.chips;
                }
                else {
                    if (potMutiplier(times) >= actionDataInfo.actionLimit.Max) {
                        valueTmp = actionDataInfo.actionLimit.Max;
                    }
                    else if (potMutiplier(times) <= actionDataInfo.actionLimit.Min) {
                        valueTmp = actionDataInfo.actionLimit.Min;
                    }
                    else {
                        valueTmp = potMutiplier(times);
                    }
                }
            }
            else {
                if (potMutiplier(times) >= GameCache.Instance.CurGame.MainPlayer.chips) {
                    valueTmp = GameCache.Instance.CurGame.MainPlayer.chips;
                }
                else {
                    if (potMutiplier(times) > actionDataInfo.actionLimit.Min) {
                        valueTmp = potMutiplier(times);
                    }
                    else {
                        valueTmp = actionDataInfo.actionLimit.Min;
                    }
                }
                Log.Debug("not IsPotLimit");
                valueTmp = potMutiplier(times) >= GameCache.Instance.CurGame.MainPlayer.chips ? GameCache.Instance.CurGame.MainPlayer.chips : (potMutiplier(times) >= actionDataInfo.actionLimit.Min ? potMutiplier(times) : actionDataInfo.actionLimit.Min);
            }
        }
        if (valueTmp < GameCache.Instance.CurGame.MainPlayer.chips) {
            if (Math.Ceiling(valueTmp / calibrationWeight) * calibrationWeight >= actionDataInfo.actionLimit.Max) {
                valueTmp = (ulong)(Math.Floor(actionDataInfo.actionLimit.Max / calibrationWeight) * calibrationWeight);
            }
            else {
                valueTmp = (ulong)(Math.Ceiling(valueTmp / calibrationWeight) * calibrationWeight);
            }
        }
        Log.Debug("times:" + times + "  valueTmp:" + valueTmp + "  potMutiplier(times):" + potMutiplier(times));

        return valueTmp;
    }





    private SetCalibrationWeight(): void {
        if (GameCache.Instance.CurGame.smallBlind < 100) {
            this.calibrationWeight = 10;
        }
        else {
            this.calibrationWeight = 100;
        }

    }

    static GetOperationData(responseData: ServerMessageStartInfo.AsObject): OperationData {
        return {
            actionLimits: responseData.nextOperator.actionsList,
            Shortcuts: responseData.nextOperator.shortcutsList
        }
    }
}
