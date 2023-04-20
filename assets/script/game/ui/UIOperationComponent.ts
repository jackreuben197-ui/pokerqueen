
import SliderPlus from "../../common/SliderPlus";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import PublicHelper from "../../helper/PublicHelper";
import { StringHelper } from "../../helper/StringHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { ActionLimit, ActionShortcutLimit, Def } from "../../protobuf/holdem/define_pb";
import { ServerMessageAddTime } from "../../protobuf/holdem/req_add_time_pb";
import GGSlider from "../../ui/component/GGSlider";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import { UISuperDialogType } from "../../ui/dialog/UISuperDialog";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import UITexasSettingComponent from "../UITexasSettingComponent";
import GameUtil from "../util/GameUtil";


export type OperationData = {
    actionsList?: ActionLimit.AsObject[],
    shortcutsList?: ActionShortcutLimit.AsObject[],
}
class ActionDataInfo {

    // public ActionLimit actionLimit;//只用于raise 或 bet
    public constructor(public CallAmount: number = 0, public StraddleAmount: number = 0, public AllInAmount: number = 0, public actionLimit: ActionLimit.AsObject = null) {

    }
}

const { ccclass } = cc._decorator;

@ccclass
export default class UIOperationComponent extends UIBase {
    /**
     * 组件绑定
     */
    imageFreeCallMask: cc.Node = null;
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

    //sliderFreeCall: GGSlider = null;
    //buttonSliderHandle: cc.Node = null;
    slider: SliderPlus = null;
    slider_bar: cc.Node = null;

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

    //滑动条比例值 
    private calibrationWeight: number = 100;
    //private slider_step: number = 0;
    private chipScale: number = 100;


    private callValue0: number = 0;
    private callValue1: number = 0;
    private callValue2: number = 0;
    private callValueLeft: number = 0;
    private callValueRight: number = 0;

    private callValue: number = 0;

    /// <summary>
    /// 数据缓存
    /// </summary>
    private operationData: OperationData = null;
    private actionDataInfo: ActionDataInfo = null;

    private _isCheckCountDown: boolean = false;
    private _isFoldCountDown: boolean = false;

    public ParamType: OperationData;

    private UI: cc.Node = null;

    //滑动条最底部位置
    //sliderMin: number = 0;

    //滑动条allin状态 
    slider_allin: boolean = false;
    slider_value: number = 0;

    ActionMap: Map<number, ActionLimit.AsObject> = new Map;


    Check_CountDown: cc.Node = null;
    Fold_CountDown: cc.Node = null;


    label_slider_max: cc.Label = null;

    slider_min_value: number = 0;
    slider_max_value: number = 0;

    //倍数|比例
    slider_ab: number = 0;

    protected lateLoad(): void {
        super.lateLoad();
        this.imageFreeCallMask = this.getChildNodeOrComponent("Image_FreeCallMask");
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



        this.Check_CountDown = this.getChildNodeOrComponent("Check_CountDown");
        this.Fold_CountDown = this.getChildNodeOrComponent("Fold_CountDown");

        this.imageCheckCountDown = this.getChildNodeOrComponent("Image_CheckCountDown", cc.Sprite);
        this.imageFoldCountDown = this.getChildNodeOrComponent("Image_FoldCountDown", cc.Sprite);

        //this.sliderFreeCall = this.getChildNodeOrComponent("Slider_FreeCall", GGSlider);
        this.slider = this.getChildNodeOrComponent("slider", SliderPlus);

        this.textFreeCall = this.getChildNodeOrComponent("Text_FreeCall", cc.Label);
        this.textFreeCallMax = this.getChildNodeOrComponent("Text_FreeCall_Max", cc.Label);

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

        this.slider_bar = this.slider.node.getChildByName("bar");

        this.UI = this.getChildNodeOrComponent("UI");

        this.label_slider_max = this.getChildNodeOrComponent("label_slider_max", cc.Label);

    }

    protected regiterTouchEvents(): void {

        this.setButtonClick(this.buttonCall, this.onClickCall);
        this.setButtonClick(this.buttonCheck, this.onClickCheck);
        this.setButtonClick(this.buttonCall0, this.onClickCall0);
        this.setButtonClick(this.buttonCall1, this.onClickCall1);
        this.setButtonClick(this.buttonCall2, this.onClickCall2);
        this.setButtonClick(this.buttonCallLeft, this.onClickCallLeft);
        this.setButtonClick(this.buttonCallRight, this.onClickCallRight);
        this.setButtonClick(this.buttonAllin, this.onClickAllin);
        this.setButtonClick(this.Button_Straddle, this.onClickStraddle);


        this.setButtonClick(this.buttonFreeCall, this.onClickFreeCall);
        this.setButtonClick(this.buttonFreeCallConfirm, this.onClickFreeCallConfirm);
        this.setButtonClick(this.imageFreeCallMask, this.onClickFreeCallMask);
        this.setButtonClick(this.buttonFold, this.onClickFold);

    }


    onShow(obj?: OperationData): void {

        // obj = {

        //     "actionsList": [
        //         {
        //             "action": 9,
        //             "min": 189,
        //             "max": 189,
        //             "straddleLevel": 0
        //         },
        //         {
        //             "action": 10,
        //             "min": 190,
        //             "max": 190,
        //             "straddleLevel": 0
        //         },
        //         {
        //             "action": 7,
        //             "min": 0,
        //             "max": 0,
        //             "straddleLevel": 0
        //         },
        //         {
        //             "action": 6,
        //             "min": 10,
        //             "max": 10,
        //             "straddleLevel": 0
        //         }
        //     ]
        // }

        super.onShow(obj);

        this.hideAllOperationButton();

        this.SetCalibrationWeight();

        GameCache.Instance.IsAllowOpenDanmu = false;

        this.operationData = obj;


        if (this.isShowingDialog) {
            //UIComponent.Instance.HideUI(UIType.UIDialog);
            UIComponent.close(UIDefine.UISuperDialog);
        }
        this.isShowingDialog = false;
        this.actionDataInfo = new ActionDataInfo();
        this.optCurTime = GameCache.Instance.CurGame.GetOpTime();
        this.optTotalTime = this.optCurTime;
        this.hadAlertSound = false;
        if (this.optTotalTime < GameCache.Instance.CurGame.opTime) {
            this.optTotalTime = GameCache.Instance.CurGame.opTime;
        }

        console.log("当前时间:> ", this.optCurTime, this.optTotalTime);

        this.isCountDown = false;

        this.slider_allin = false;
        //this.sliderMin = 0;
        this.show(this.operationData.actionsList);


    }

    //设置UI位置
    public SetUIPos(pos: cc.Vec2) {
        this.UI.setPosition(pos);
    }
    sliderChange(value: number) {

        // this.slider.refreshValueLabel(PublicHelper.FixFloat(this.slider.value));

        // if (value >= this.slider_max_value) {
        //     this.slider.refreshValueLabelStr(i18nMgr.Get("adaptation30074"));
        // }
        this.refreshSliderValueStr();
    }

    refreshSliderValueStr() {

        if (this.slider.value >= this.slider_max_value) {
            this.slider.refreshValueLabelStr(i18nMgr.Get("adaptation30074"));
        } else {
            this.slider.refreshValueLabelStr(GameUtil.TransBetValue(this.slider.value));
        }

    }

    //点击显示滑竿
    private onClickFreeCall(): void {
        this.showFreeCall(true);
    }

    private onClickFreeCallMask(): void {
        this.imageFreeCallMask.active = false;
        //隐藏自由加注
        this.showFreeCall(false);

    }
    private onClickCall2(): void {
        this.callValue = this.callValue2;
        this.CheckOpt();
    }

    private onClickCall1(): void {
        this.callValue = this.callValue1;
        this.CheckOpt();
    }

    private onClickCall0(): void {
        this.callValue = this.callValue0;
        this.CheckOpt();
    }

    private onClickCallLeft(): void {
        this.callValue = this.callValueLeft;
        this.CheckOpt();
    }

    private onClickCallRight(): void {
        this.callValue = this.callValueRight;
        this.CheckOpt();
    }
    private onClickAllin(): void {
        GameCache.Instance.CurGame.OptAction(Def.Action.ALLIN, this.actionDataInfo.AllInAmount);
    }
    private onClickStraddle(): void {
        GameCache.Instance.CurGame.OptAction(Def.Action.STRADDLE, this.actionDataInfo.StraddleAmount);
    }
    private onClickCall(): void {
        GameCache.Instance.CurGame.OptAction(Def.Action.CALL, this.actionDataInfo.CallAmount);
    }
    private onClickCheck(): void {
        GameCache.Instance.CurGame.OptAction(Def.Action.CHECK, 0);
        this.isCountDown = false;
    }


    private onClickFold(): void {
        if (this.buttonCheck.activeInHierarchy) {
            //如果可以让牌，需要弹窗询问弃牌还是让牌
            this.isShowingDialog = true;

            UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
                this: this,
                // title = $"确定弃牌？",
                title: CPErrorCode.LanguageDescription(20037),
                // content = $"你可以让牌而不需要任何记分牌",
                content: CPErrorCode.LanguageDescription(20038),
                // contentCommit = "弃牌",
                commit: CPErrorCode.LanguageDescription(10047),
                // contentCancel = "让牌",
                cancel: CPErrorCode.LanguageDescription(10315),
                commit_click: () => {
                    GameCache.Instance.CurGame?.OptAction(Def.Action.FOLD, 0);
                    this.isCountDown = false;
                },
                cancel_click: () => {
                    GameCache.Instance.CurGame?.OptAction(Def.Action.CHECK, 0);
                    this.isCountDown = false;
                }
            })






            return;
        }
        GameCache.Instance.CurGame.OptAction(Def.Action.FOLD, 0);
    }

    /// <summary>
    /// 自由加注
    /// </summary>
    private CheckOpt(): void {
        if (this.callValue <= 0) {
            return;
        }

        if (this.callValue >= GameCache.Instance.CurGame.mainPlayer.chips) {
            if (this.actionDataInfo.AllInAmount == 0) {
                if (GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type)) {
                    UIComponent.Instance.Toast(i18nMgr.Get("UIOperationComponentTips001"));
                }
                else {
                    UIComponent.Instance.Toast(i18nMgr.Get("UIOperationComponentTips002"));
                }
                return;
            }
            GameCache.Instance.CurGame.OptAction(Def.Action.ALLIN, this.actionDataInfo.AllInAmount);
            return;
        }
        else if (this.callValue >= this.actionDataInfo.actionLimit.max) {
            if (this.ActionMap.get(Def.Action.BET) != null) {
                GameCache.Instance.CurGame.OptAction(Def.Action.BET, this.actionDataInfo.actionLimit.max);
            }
            else {
                GameCache.Instance.CurGame.OptAction(Def.Action.RAISE, this.actionDataInfo.actionLimit.max);
            }
            return;
        }
        if (this.ActionMap.get(Def.Action.BET) != null) {
            GameCache.Instance.CurGame.OptAction(Def.Action.BET, this.callValue);
        }
        else {
            GameCache.Instance.CurGame.OptAction(Def.Action.RAISE, this.callValue);
        }
        this.isCountDown = false;
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

        // this.textCallPotValue0.string = this.callValue0 <= 0 ? "" : (this.callValue0 < totalChips ? StringHelper.getStringDiv100(this.callValue0) : "All in");
        // this.textCallPotValue1.string = this.callValue1 <= 0 ? "" : (this.callValue1 < totalChips ? StringHelper.getStringDiv100(this.callValue1) : "All in");
        // this.textCallPotValue2.string = this.callValue2 <= 0 ? "" : (this.callValue2 < totalChips ? StringHelper.getStringDiv100(this.callValue2) : "All in");
        // this.textCallPotValueLeft.string = this.callValueLeft <= 0 ? "" : (this.callValueLeft < totalChips ? StringHelper.getStringDiv100(this.callValueLeft) : "All in");
        // this.textCallPotValueRight.string = this.callValueRight <= 0 ? "" : (this.callValueRight < totalChips ? StringHelper.getStringDiv100(this.callValueRight) : "All in");

        this.UpdateAllValue();

        //展示加注按钮和自由加注按钮
        this.showRaiseButton();
    }

    UpdateAllValue() {

        let totalChips: number = GameCache.Instance.CurGame.mainPlayer.chips;

        let a = GameUtil.TransBetValue(this.callValue0);
        let b = GameUtil.TransBetValue(this.callValue1);
        let c = GameUtil.TransBetValue(this.callValue2);
        let d = GameUtil.TransBetValue(this.callValueLeft);
        let e = GameUtil.TransBetValue(this.callValueRight);

        this.textCallPotValue0.string = this.callValue0 <= 0 ? "" : (this.callValue0 < totalChips ? a : "All in");
        this.textCallPotValue1.string = this.callValue1 <= 0 ? "" : (this.callValue1 < totalChips ? b : "All in");
        this.textCallPotValue2.string = this.callValue2 <= 0 ? "" : (this.callValue2 < totalChips ? c : "All in");
        this.textCallPotValueLeft.string = this.callValueLeft <= 0 ? "" : (this.callValueLeft < totalChips ? d : "All in");
        this.textCallPotValueRight.string = this.callValueRight <= 0 ? "" : (this.callValueRight < totalChips ? e : "All in");

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



    /// <summary>
    /// 获取快捷面板底池加注值
    /// </summary>
    /// <param name="quickActionStr"></param>
    /// <returns></returns>
    private getPotMutiplierByQuickAction(times: number): number {
        let valueTmp: number = this.actionDataInfo.actionLimit.min;
        if (this.actionDataInfo.actionLimit.action == Def.Action.ALLIN) {
            valueTmp = GameCache.Instance.CurGame.mainPlayer.chips;
        }
        else {
            if (GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type)) {

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

    // /// <summary>
    // /// 通过Action 取得ActionLimit
    // /// </summary>
    // /// <param name="action"></param>
    // /// <returns></returns>
    // private getActionLimitByAction(action: Def.ActionMap[keyof Def.ActionMap]): ActionLimit.AsObject {
    //     for (let actionLimit of this.operationData.actionsList) {
    //         if (actionLimit.action == action) {
    //             return actionLimit;
    //         }
    //     }
    //     return null;
    // }
    /// <summary>
    /// 计算 n/m池加注 数值
    /// </summary>
    /// <param name="times"></param>
    /// <returns></returns>
    private potMutiplier(times: number): number {
        return this.actionDataInfo.CallAmount + (GameCache.Instance.CurGame.alreadAnte + this.actionDataInfo.CallAmount) * times;
    }

    protected update(dt: number): void {

        if (!this._isCheckCountDown && !this._isFoldCountDown) {
            return;
        }
        if (this._isCheckCountDown) {
            this.imageCheckCountDown.fillRange = (this.optCurTime -= dt) / this.optTotalTime;

            if (this.imageCheckCountDown.fillRange <= 0.02) {
                GameCache.Instance.CurGame.HideBtnDelay(false);
            }
            if (this.imageCheckCountDown.fillRange <= 0) {
                this.isCountDown = false;
                //this.imageCheckCountDown.node.active = false;
                this.Check_CountDown.active = false;
                if (this.isShowingDialog)
                    //UIComponent.Instance.HideUI(UIType.UIDialog);
                    UIComponent.close(UIDefine.UIDialogComponent);
                this.isShowingDialog = false;
                //如需客户端倒计时结束发送让牌，在这里做
                GameCache.Instance.CurGame.HideOperationPanel();

            }
        }

        if (this._isFoldCountDown) {
            this.imageFoldCountDown.fillRange = (this.optCurTime -= dt) / this.optTotalTime;
            if (this.imageFoldCountDown.fillRange <= 0.02) {
                GameCache.Instance.CurGame.HideBtnDelay(false);
            }
            if (this.imageFoldCountDown.fillRange <= 0) {
                this.isCountDown = false;
                //this.imageFoldCountDown.node.active = false;
                this.Fold_CountDown.active = false;
                if (this.isShowingDialog)
                    //UIComponent.Instance.HideUI(UIType.UIDialog);
                    UIComponent.close(UIDefine.UIDialogComponent);
                this.isShowingDialog = false;
                //如需客户端倒计时结束发送弃牌，在这里做
                GameCache.Instance.CurGame.HideOperationPanel();
            }
        }



        if (this.optCurTime < 6.1 && this.optCurTime > 6 && !this.hadAlertSound) {
            //剩余5秒音效
            GC.sound.Play("sfx_action_alert");
            this.hadAlertSound = true;
            //this.DelayPlayBarrage();
        }
    }



    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME);  // 操作加时
    }

    protected HANDLER_REQ_ADD_TIME(rec: ServerMessageAddTime.AsObject): void {

        if (rec == null) {
            return;
        }

        if (rec.status != 0) {
            //UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_ADD_TIME, rec.Status)
            return;
        }
        if (rec.status == 0) {
            this.optCurTime += rec.duration;
            this.optTotalTime = this.optCurTime;
        }
    }

    /// <summary>
    /// 用于关闭操作面板时初始化按钮显示
    /// </summary>
    private hideAllOperationButton(): void {
        this.buttonCall0.active = false;
        this.buttonCall1.active = false;
        this.buttonCall2.active = false;
        this.buttonCallLeft.active = false;
        this.buttonCallRight.active = false;
        this.buttonFreeCall.active = false;
        this.buttonCheck.active = false;
        this.buttonCall.active = false;
        this.buttonAllin.active = false;
        this.slider.node.active = false;
        this.buttonFreeCallConfirm.active = false;
        this.Button_Straddle.active = false;
        this.Check_CountDown.active = false;
        this.Fold_CountDown.active = false;
    }
    lateClose(param?: any): void {
        super.lateClose();
        this.isCountDown = false;
        this._isCheckCountDown = false;
        this._isFoldCountDown = false;
        //this.imageCheckCountDown.node.active = false;
        //this.imageFoldCountDown.node.active = false;
        this.Check_CountDown.active = false;
        this.Fold_CountDown.active = false;
        this.hideAllOperationButton();
    }

    ///////////////////////////////滑动条////////////////////////////////
    //设置比例值
    private SetCalibrationWeight(): void {

        //this.calibrationWeight = GameCache.Instance.CurGame.smallBlind < 100 ? 10 : 100;
        this.slider_ab = GameCache.Instance.CurGame.smallBlind < 100 ? 10 : 100;

        console.log("slider_ab", this.slider_ab);
    }

    //点击滑动条下确定按钮 
    onClickFreeCallConfirm() {

        console.log("value :: ", this.slider.value);

        if (this.slider_allin) {
            this.callValue = this.actionDataInfo.AllInAmount;
        } else {
            this.callValue = this.slider.value;
        }
        this.CheckOpt();
        this.showFreeCall(false);
    }

    refreshSliderMaxLabel() {
        this.label_slider_max.string = GameUtil.TransBetValue(this.slider_max_value);
    }

    private show(actions: ActionLimit.AsObject[]): void {

        this.ActionMap.clear();
        actions.forEach(action => {
            this.ActionMap.set(action.action, action);
        });


        actions.forEach(action => {

            //this.ActionMap.set(action.action, action);

            switch (action.action) {

                case Def.Action.STRADDLE://4

                    this.showStraddle(action);

                    break;
                case Def.Action.BET://5

                    this.showBet(action);

                    break;
                case Def.Action.CALL://6

                    this.showCall(action);

                    break;
                case Def.Action.FOLD://7

                    this.showFold(action);

                    break;
                case Def.Action.CHECK://8

                    this.showCheck(action);

                    break;
                case Def.Action.RAISE: // 9 筹码条上下拖动

                    this.showBet(action);

                    break;
                case Def.Action.ALLIN://10


                    if (this.ActionMap.get(Def.Action.BET) == null && this.ActionMap.get(Def.Action.RAISE) == null && this.ActionMap.get(Def.Action.CALL) != null) {
                        this.showAllInRaise(action);
                    }
                    else if (this.ActionMap.get(Def.Action.BET) == null && this.ActionMap.get(Def.Action.RAISE) == null && this.ActionMap.get(Def.Action.CHECK) != null) {
                        this.showAllInRaise(action);
                    }
                    else {
                        this.showAllin(action);
                    }

                    break;
                default:

                    cc.warn(`UIOperationComponent: cannot recognize action: ${action.action}`);

                    break;
            }
        })
    }

    //4 观
    private showStraddle(action: ActionLimit.AsObject): void {
        cc.log("+ showStraddle");
        this.Button_Straddle.active = true;
        this.actionDataInfo.StraddleAmount = action.min;
        this.Text_Straddle.string = StringHelper.GetLongString(action.min);
    }
    //5 , 9 
    private showBet(action: ActionLimit.AsObject): void {

        cc.log("+ showBet");

        this.buttonFreeCall.active = true;

        this.actionDataInfo.actionLimit = action;

        //相同
        if (action.max == action.min) {

            this.slider_min_value = action.max;
            this.slider_max_value = action.max;

            this.slider.show({
                min_value: this.slider_min_value,
                max_value: this.slider_max_value,
                step: 0,
                change: this.sliderChange,
                own: this,
                scale: 100,
            });

            this.slider_allin = true;

        } else {

            if (GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type)) {
                this.slider_max_value = action.max;
            } else {
                this.slider_max_value = action.max + 1;
            }

            this.slider_min_value = action.min;

            if (this.slider_min_value >= this.slider_max_value) {
                this.slider.show({
                    min_value: this.slider_max_value,
                    max_value: this.slider_max_value,
                    step: 0,
                    change: this.sliderChange,
                    own: this,
                    scale: 100,
                });
                this.slider_allin = true;
            } else {
                this.slider.show({
                    min_value: this.slider_min_value,
                    max_value: this.slider_max_value,
                    step: this.slider_ab,
                    change: this.sliderChange,
                    own: this,
                    scale: 100,
                });
                this.slider_allin = false;
            }
        }

        this.refreshSliderMaxLabel();

        //this.sliderChange(min_value);

        console.log(" >> slider = > ", this.slider_min_value, this.slider_max_value, this.slider_ab);

        this.setTopCallButtons();
    }
    // 6 
    private showCall(action: ActionLimit.AsObject): void {
        cc.log("+ showCall");

        this.buttonCall.active = true;

        this.actionDataInfo.CallAmount = action.min;
        this.textCall.string = StringHelper.GetLongString(action.min);
    }
    // 7 
    private showFold(action: ActionLimit.AsObject): void {
        cc.log("+ showFold");
        this.buttonFold.active = true;

        if (this.ActionMap.get(Def.Action.CHECK) != null) {
            return;
        }
        this._isFoldCountDown = true;
        this.Fold_CountDown.active = true;
        this.imageFoldCountDown.fillRange = 1;

    }
    // 8
    private showCheck(action: ActionLimit.AsObject): void {
        cc.log("+ showCheck");
        this.buttonCheck.active = true;

        //this.imageCheckCountDown.node.active = true;
        this._isCheckCountDown = true;
        this.Check_CountDown.active = true;
        this.imageCheckCountDown.fillRange = 1;

    }
    //10-1
    private showAllInRaise(action: ActionLimit.AsObject): void {
        cc.log("+ showRaise");
        this.buttonFreeCall.active = true;
        this.actionDataInfo.AllInAmount = action.min;
        this.actionDataInfo.actionLimit = action;
        this.slider_max_value = action.max;
        this.refreshSliderMaxLabel();
        this.setTopCallButtons();
        this.slider_allin = true;
        this.slider.show({
            min_value: action.max,
            max_value: action.max,
            step: 0,
            change: this.sliderChange,
            own: this,
            scale: 100
        });

    }
    //10-2
    private showAllin(actionLimit: ActionLimit.AsObject) {
        cc.log("+ showAllin");
        this.buttonAllin.active = true;
        this.actionDataInfo.AllInAmount = actionLimit.min;
    }
    //显示或者隐藏 自由加注条
    private showFreeCall(show: boolean): void {
        if (show) {
            this.imageFreeCallMask.active = true;
            //this.sliderFreeCall.node.active = true;
            this.slider.node.active = true;
            this.buttonFreeCallConfirm.active = true;
            this.buttonFreeCall.active = false;
            this.buttonCall0.active = false;
            this.buttonCall1.active = false;
            this.buttonCall2.active = false;
            this.buttonCallLeft.active = false;
            this.buttonCallRight.active = false;
            this.slider.reset();
            this.refreshSliderValueStr();
            if (this.slider_allin) this.slider.refreshValueLabelStr(i18nMgr.Get("adaptation30074"));
        }
        else {
            this.imageFreeCallMask.active = false;
            //this.sliderFreeCall.node.active = false;
            this.slider.node.active = false;
            this.buttonFreeCallConfirm.active = false;
            this.buttonFreeCall.active = true;
            this.showRaiseButton();
        }
    }


}
