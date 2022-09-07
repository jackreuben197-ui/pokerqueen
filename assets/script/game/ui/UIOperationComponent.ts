
import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { LanguageCode } from "../../i18n/LanguageCode";
import { ActionLimit, ActionShortcutLimit, Def } from "../../protobuf/holdem/define_pb";
import GGSlider from "../../ui/component/GGSlider";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import GameUtil from "../GameUtil";
import UITexasSettingComponent from "../UITexasSettingComponent";


export type OperationData = {
    actionLimits?: ActionLimit.AsObject[],
    Shortcuts?: ActionShortcutLimit.AsObject[],
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

    sliderFreeCall: GGSlider = null;
    buttonSliderHandle: cc.Node = null;

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

    private callValue: number = 0;

    /// <summary>
    /// 数据缓存
    /// </summary>
    private operationData: OperationData = null;
    private actionDataInfo: ActionDataInfo = null;

    private _isCheckCountDown: boolean = false;
    private _isFoldCountDown: boolean = false;


    public ParamType: OperationData;

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


        this.imageCheckCountDown = this.getChildNodeOrComponent("Image_CheckCountDown", cc.Sprite);
        this.imageFoldCountDown = this.getChildNodeOrComponent("Image_FoldCountDown", cc.Sprite);

        this.sliderFreeCall = this.getChildNodeOrComponent("Slider_FreeCall", GGSlider);

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

        this.buttonSliderHandle = this.sliderFreeCall.node.getChildByName("bar");

    }

    protected regiterTouchEvents(): void {
        this.buttonCall.getChildByName("BtnArea").on("click", this.onClickCall, this);
        this.buttonCheck.on("click", this.onClickCheck, this);
        this.buttonCall0.getChildByName("BtnArea").on("click", this.onClickCall0, this);
        this.buttonCall1.getChildByName("BtnArea").on("click", this.onClickCall1, this);
        this.buttonCall2.getChildByName("BtnArea").on("click", this.onClickCall2, this);
        this.buttonCallLeft.getChildByName("BtnArea").on("click", this.onClickCallLeft, this);
        this.buttonCallRight.getChildByName("BtnArea").on("click", this.onClickCallRight, this);
        this.buttonAllin.getChildByName("BtnArea").on("click", this.onClickAllin, this);
        this.Button_Straddle.getChildByName("BtnArea").on("click", this.onClickStraddle, this);

        this.buttonFreeCall.getChildByName("BtnArea").on("click", this.onClickFreeCall, this);
        this.buttonFreeCallConfirm.getChildByName("BtnArea").on("click", this.onClickSliderHandle, this);

        this.imageFreeCallMask.on("click", this.onClickFreeCallMask, this);
        this.buttonFold.on("click", this.onClickFold, this);
        this.buttonSliderHandle.on("click", this.onClickSliderHandle, this);
        this.sliderFreeCall.onChange(this.onValueChangeFreeCall.bind(this));
    }

    //点击自由加注滑块按钮
    private onClickSliderHandle(): void {
        if (this.sliderFreeCall.moved) {
            this.sliderFreeCall.moved = false;
            return;
        }
        this.callValue = this.sliderFreeCall.value * this.calibrationWeight;
        this.CheckOpt();
        this.showFreeCall(false);
    }


    /// <summary>
    /// 自由加注slider值变化监听
    /// </summary>
    /// <param name="arg0"></param>
    private onValueChangeFreeCall(arg0: number): void {

        if (arg0 >= GameCache.Instance.CurGame.mainPlayer.chips / this.calibrationWeight) {
            this.textFreeCall.string = `ALL IN`;
            this.textFreeCall.node.color = cc.Color.WHITE;
            this.textFreeCall.fontSize = 60;
            //this.buttonSliderHandle.GetComponent<Image>().color = new cc.Color(225, 181, 141, 0);
            this.buttonSliderHandle.getChildByName("Image").active = true;
            //this.buttonSliderHandle.gameObject.GetComponent<Image>().sprite = rc.Get<Sprite>("image_orthogon_c");
        }
        else if (GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type) && arg0 >= this.actionDataInfo.actionLimit.max / this.calibrationWeight) {
            this.textFreeCall.string = `${this.actionDataInfo.actionLimit.max / this.chipScale ^ 0}`;
            this.textFreeCall.node.color = new cc.Color(225, 181, 141, 255);
            this.textFreeCall.fontSize = 45;
            //this.buttonSliderHandle.GetComponent<Image>().color = new Color32(255, 255, 255, 255);
            this.buttonSliderHandle.getChildByName("Image").active = false;
            //this.buttonSliderHandle.gameObject.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_FreeCall_handle_bg");
        }
        else {
            this.textFreeCall.string = `${arg0 * this.calibrationWeight / this.chipScale ^ 0}`;
            this.textFreeCall.node.color = new cc.Color(225, 181, 141, 255);
            this.textFreeCall.fontSize = 45;
            //this.buttonSliderHandle.GetComponent<Image>().color = new Color32(255, 255, 255, 255);
            this.buttonSliderHandle.getChildByName("Image").active = false;
            //this.buttonSliderHandle.gameObject.GetComponent<Image>().sprite = rc.Get<Sprite>("icon_image_FreeCall_handle_bg");
        }

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
    private onClickFreeCall(): void {
        this.showFreeCall(true);
    }

    private onClickFold(): void {
        if (this.buttonCheck.activeInHierarchy) {
            //如果可以让牌，需要弹窗询问弃牌还是让牌
            this.isShowingDialog = true;
            UIComponent.open(UIDefine.UIDialogComponent,
                {
                    type: UIDialogComponent.DialogType.CommitCancel,
                    // title = $"确定弃牌？",
                    title: LanguageCode.LanguageDescription(20037),
                    // content = $"你可以让牌而不需要任何记分牌",
                    content: LanguageCode.LanguageDescription(20038),
                    // contentCommit = "弃牌",
                    contentCommit: LanguageCode.LanguageDescription(10047),
                    // contentCancel = "让牌",
                    contentCancel: LanguageCode.LanguageDescription(10315),
                    actionCommit: () => {
                        GameCache.Instance.CurGame.OptAction(Def.Action.FOLD, 0);
                        this.isCountDown = false;
                    },
                    actionCancel: () => {
                        GameCache.Instance.CurGame.OptAction(Def.Action.CHECK, 0);
                        this.isCountDown = false;
                    },
                    noAnimation: true,
                });
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
            if (this.getActionLimitByAction(Def.Action.BET) != null) {
                GameCache.Instance.CurGame.OptAction(Def.Action.BET, this.actionDataInfo.actionLimit.max);
            }
            else {
                GameCache.Instance.CurGame.OptAction(Def.Action.RAISE, this.actionDataInfo.actionLimit.max);
            }
            return;
        }
        if (this.getActionLimitByAction(Def.Action.BET) != null) {
            GameCache.Instance.CurGame.OptAction(Def.Action.BET, this.callValue);
        }
        else {
            GameCache.Instance.CurGame.OptAction(Def.Action.RAISE, this.callValue);
        }
        this.isCountDown = false;
    }

    /// <summary>
    /// 展示自由加注按钮
    /// </summary>
    /// <param name="show"></param>
    private showFreeCall(show: boolean): void {
        this.sliderFreeCall.value = this.sliderFreeCall.minValue;
        if (show) {
            this.imageFreeCallMask.active = true;
            this.sliderFreeCall.node.active = true;
            this.buttonFreeCallConfirm.active = true;
            this.buttonFreeCall.active = false;
            this.buttonCall0.active = false;
            this.buttonCall1.active = false;
            this.buttonCall2.active = false;
            this.buttonCallLeft.active = false;
            this.buttonCallRight.active = false;
        }
        else {
            cc.log("关闭控制台");
            this.imageFreeCallMask.active = false;
            this.sliderFreeCall.node.active = false;
            this.buttonFreeCallConfirm.active = false;
            this.buttonFreeCall.active = true;
            this.showRaiseButton();
        }
    }

    onShow(obj?: OperationData): void {

        super.onShow(obj);

        if (null == obj) {
            return;
        }
        GameCache.Instance.IsAllowOpenDanmu = false;

        this.operationData = obj;

        if (null == this.operationData || null == this.operationData.actionLimits) {
            return;
        }
        this.SetCalibrationWeight();
        if (this.isShowingDialog) {
            //UIComponent.Instance.HideNoAnimation(UIType.UIDialog);
            UIComponent.close(UIDefine.UIDialogComponent);
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
        this.Text_Straddle.string = StringHelper.getStringDiv100(actionLimit.min);
    }


    private showBet(actionLimit: ActionLimit.AsObject): void {
        cc.log("+ showBet");
        this.actionDataInfo.actionLimit = actionLimit;

        if (actionLimit.max == actionLimit.min) {
            this.sliderFreeCall.maxValue = Math.ceil(actionLimit.max / this.calibrationWeight);//客户端滑动条滑到顶是allin 加注限制区间加一为当前玩家最大筹码
            this.sliderFreeCall.minValue = this.sliderFreeCall.maxValue;
            this.sliderFreeCall.value = this.sliderFreeCall.maxValue;
            this.textFreeCall.string = `ALL IN`;
            this.textFreeCallMax.string = `${(actionLimit.max) / this.chipScale}`;
        }
        else {
            this.sliderFreeCall.maxValue = GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type)
                ? Math.ceil(actionLimit.max / this.calibrationWeight)
                : Math.ceil((actionLimit.max + 1) / this.calibrationWeight);//客户端滑动条滑到顶是allin 加注限制区间加一为当前玩家最大筹码
            if (Math.ceil(actionLimit.min / this.calibrationWeight) >= this.sliderFreeCall.maxValue) {
                cc.log("sliderFreeCall.minValue > sliderFreeCall.maxValue");
                this.sliderFreeCall.minValue = this.sliderFreeCall.maxValue;
                this.sliderFreeCall.value = this.sliderFreeCall.maxValue;
                this.textFreeCall.string = `ALL IN`;
            }
            else {
                this.sliderFreeCall.minValue = Math.ceil(actionLimit.min / this.calibrationWeight);
                this.sliderFreeCall.value = this.sliderFreeCall.minValue;
                this.textFreeCall.string = `${actionLimit.min / this.chipScale}`;
            }
            let actionLimitMax: number = GameUtil.JudgeIsPotLimitRoomPath(GameCache.Instance.room_type) ? (actionLimit.max) : (actionLimit.max + 1);
            this.textFreeCallMax.string = `${actionLimitMax / this.chipScale}`;
        }
        this.setTopCallButtons();
        this.buttonFreeCall.active = true;
    }
    private showCall(actionLimit: ActionLimit.AsObject): void {
        cc.log("+ showCall");
        cc.log("showCall actionLimit:", actionLimit);
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
        this.sliderFreeCall.maxValue = Math.ceil(actionLimit.max / this.calibrationWeight);//客户端滑动条滑到顶是allin 加注限制区间加一为当前玩家最大筹码
        this.sliderFreeCall.minValue = this.sliderFreeCall.maxValue;
        this.sliderFreeCall.value = this.sliderFreeCall.maxValue;
        this.textFreeCall.string = `ALL IN`;
        this.textFreeCallMax.string = `${(actionLimit.max) / this.chipScale}`;
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
                GameCache.Instance.CurGame.HideBtnDelay(false);
            }
            if (this.imageCheckCountDown.fillRange <= 0) {
                this.isCountDown = false;
                this.imageCheckCountDown.node.active = false;
                if (this.isShowingDialog)
                    //UIComponent.Instance.HideNoAnimation(UIType.UIDialog);
                    UIComponent.close(UIDefine.UIDialogComponent);
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
                    UIComponent.close(UIDefine.UIDialogComponent);
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
