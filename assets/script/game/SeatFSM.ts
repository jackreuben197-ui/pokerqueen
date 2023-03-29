import GC from "../frame/GameControl";
import { CPErrorCode } from "../i18n/CPErrorCode";
import GlobalSession from "../session/GlobalSession";
import { GameCache } from "./GameCache";
import Seat, { VoiceprintState } from "./seat/Seat";
import { SeatEmpty, SeatSit, SeatStandup, SeatWaitStart } from "./SeatStateHandler";







export class SeatFSM {

    constructor(public id: number, public seat: Seat) {

    }

    //#region 座位待机
    public IdleEnter(): void {
        //设置座位节点激活显示
        this.seat.ui.active = true;

    }
    public IdleExecute(): void {
    }
    public IdleExit(): void {
    }
    //#endregion

    //#region 空座位
    public EmptyEnter(): void {
        this.seat.Player = null;
        this.seat.SetNickName("");
        this.seat.SetCoin("");
        this.seat.uirc.Text_NickName.node.active = true;
        this.seat.uirc.imageBanker.active = false;
        this.seat.uirc.Image_CoinShadow.active = false;
        // imageStraddle.gameObject.SetActive(false);
        this.seat.uirc.Frame_Head.active = false;
        //this.seat.uirc.transSmallCardBacks.active = false;
        this.seat.HideCardBack();
        // imageHolding.gameObject.SetActive(false);
        this.seat.HideCards(this.seat.listCardUIInfos);
        this.seat.HideCards(this.seat.listSmallCardUIInfos);
        // imageTrust.gameObject.SetActive(false);
        this.seat.uirc.imageOffline.active = false;
        this.seat.uirc.imageReserveSeat.active = false;
        this.seat.uirc.Head_CD.active = false;

        this.seat.uirc.Image_Bubble.active = false;
        // Image_BubbleInsuranceNum.gameObject.SetActive(false);
        // Image_BubbleInsuranceToubao.gameObject.SetActive(false);
        this.seat.uirc.transCurRoundHaveBet.active = false;
        // imageWinner.gameObject.SetActive(false);
        // imageCoinShadow.gameObject.SetActive(false);
        // m_ImageRanking.gameObject.SetActive(false);
        // Image_OtherWinnerCardType.gameObject.SetActive(false);
        // imageBubbleBackDesk.gameObject.SetActive(false);
        this.seat.uirc.imageCardType.node.active = false;
        this.seat.uirc.imageRecyclingWinChip.node.active = false;
        // Image_OtherWinner.gameObject.SetActive(false);
        this.seat.uirc.WaitforthenextmoveTips.node.active = false;


        this.seat.uirc.TextRequesting.node.active = false;

        this.seat.FoldHeadGray(false);

        this.seat.StopAllActions();

        // if (null != armatureVoice.dragonAnimation && armatureVoice.dragonAnimation.isPlaying)
        //     armatureVoice.dragonAnimation.Stop();
        // armatureVoice.gameObject.SetActive(false);

        this.seat.StopAllinArmature();
        this.seat.StopWinArmature();
        this.seat.StopLightArmature();

        this.seat.uirc.imageEmpty.node.active = true;
        this.seat.UpdateVoiceprintState(VoiceprintState.None);

        this.seat.HideReturnGame();

        this.seat.HideTrust();
        this.seat.HideCoinShadow();

    }

    public EmptyExecute(): void {

    }

    public EmptyExit(): void {

    }
    //#endregion

    //#region 坐下
    public SitEnter(): void {
        // this.seat.SetClient0BubblePos();
        this.seat.UpdateHead();
        this.seat.UpdateNickName();
        this.seat.UpdateCoin();
        this.seat.UpdateRequesting();
        //this.seat.UpdateHolding();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateCards();
        this.seat.UpdateBanker();

        // this.seat.StopAllinArmature();
        this.seat.StopWinArmature();

        this.seat.uirc.Frame_Head.active = true;
        this.seat.uirc.imageEmpty.node.active = false;

    }

    public SitExecute(): void {

    }

    public SitExit(): void {

    }
    //#endregion

    //#region 坐下动画
    SitAnimationEnter() {
        cc.tween(this.seat.uirc.Head).to(0.15, { scaleX: 0 }).then(cc.callFunc(() => {
            this.seat.FsmLogicComponent.SM.ChangeState(SeatSit.Instance);
            this.seat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
        })).to(.15, { scaleX: 1 }).start();
    }
    SitAnimationExecute() {
    }
    SitAnimationExit() {
    }
    //#endregion


    //#region 等待开始
    public WaitStartEnter(): void {
        this.seat.UpdateHead();
        //this.seat.UpdateNickname();
        this.seat.UpdateCoin();
        this.seat.UpdateRequesting();
        this.seat.uirc.Frame_Head.active = true;
        this.seat.uirc.imageEmpty.node.active = false;
    }

    public WaitStartExecute(): void {

    }

    public WaitStartExit(): void {

    }
    //#endregion

    //#region 等待补盲
    public WaitBlindEnter(): void {

    }

    public WaitBlindExecute(): void {

    }

    public WaitBlindExit(): void {

    }
    //#endregion

    //#region 站起
    public StandupEnter(): void {
        this.seat.HideCards(this.seat.listCardUIInfos);
        this.seat.HideCards(this.seat.listSmallCardUIInfos);
        this.seat.FsmLogicComponent.SM.ChangeState(SeatEmpty.Instance);
    }

    public StandupExecute(): void {

    }

    public StandupExit(): void {

    }
    //#endregion

    //#region 站起动画
    public StandupAnimationEnter(): void {
        this.seat.FsmLogicComponent.SM.ChangeState(SeatStandup.Instance);
        cc.tween(this.seat.uirc.Head).to(0.15, { scaleX: 0 }).to(.15, { scaleX: 1 }).start();
    }

    public StandupAnimationExecute(): void {

    }

    public StandupAnimationExit(): void {

    }
    //#endregion

    //#region 每手开始
    public StartEnter(): void {
        this.seat.HideCards(this.seat.listCardUIInfos);
        this.seat.HideCards(this.seat.listSmallCardUIInfos);
        this.seat.HideCardBack();
        //this.seat.UpdateHolding(true);
    }

    public StartExecute(): void {

    }

    public StartExit(): void {

    }
    //#endregion


    //#region straddle
    public StraddleEnter(): void {
        this.seat.UpdateBubble();
    }

    public StraddleExecute(): void {

    }

    public StraddleExit(): void {

    }
    //#endregion

    //#region 开始转游戏中
    public StartToPlayingEnter(): void {
        this.seat.UpdateBanker();
        this.seat.UpdateCoin();
        this.seat.UpdateCards();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateShowCardsId();

        this.seat.StopAllinArmature();
        this.seat.StopWinArmature();
    }

    public StartToPlayingExecute(): void {

    }

    public StartToPlayingExit(): void {

    }
    //#endregion


    //#region 操作中
    public OperationEnter(): void {
        if (this.seat.IsMySeat) {
            if (GameCache.Instance.voiceprint_verify_on == 1) {
                //this.seat.VoiceMoveToOhter();
            }
            this.seat.UpdateImageBackActive();
            GC.sound.Play('sfx_desk_player_turn');
            return;
        }
        this.seat.StartCountDown(GameCache.Instance.CurGame.GetOpTime());
    }

    public OperationExecute(dt: number): void {
        if (!this.seat.isCountDown)
            return;

        this.seat.uirc.Head_CD_Mask.fillRange = (this.seat.optCurTime -= dt) / this.seat.optTotalTime;
        this.seat.uirc.Head_CD_Label.string = `${this.seat.optCurTime ^ 0}s`;
        if (this.seat.uirc.Head_CD_Mask.fillRange <= 0) {
            this.seat.isCountDown = false;
            this.seat.uirc.Head_CD.active = false;
            //PlayLightArmature();
        }
    }

    public OperationExit(): void {
        if (this.seat.IsMySeat) {
            if (GameCache.Instance.voiceprint_verify_on == 1) {
                //VoiceMoveToDefault();
            }
        }
        this.seat.StopCountDown();
    }
    //#endregion


    //#region 购买保险
    public InsuranceEnter(): void {
        this.seat.StartCountDown(this.seat.Player.timeLeft_insurance, true);
        this.seat.ShowBubbleInsuranceCountDown();
    }

    public InsuranceExecute(dt: number): void {
        if (!this.seat.isCountDown)
            return;

        this.seat.uirc.Head_CD_Mask.fillRange = (this.seat.optCurTime -= dt) / this.seat.optTotalTime;

        this.seat.uirc.Head_CD_Label.string = `${this.seat.optCurTime}s`;

        if (this.seat.uirc.Head_CD_Mask.fillRange <= 0) {
            this.seat.isCountDown = false;
            this.seat.uirc.Head_CD.active = false;
            //this.seat.PlayLightArmature();
        }

        if (this.seat.Player.userID != GameCache.Instance.CurGame.mainPlayer.userID) {
            let leftTime = Math.ceil(this.seat.optCurTime);
            if (leftTime < 0)
                leftTime = 0;
            this.seat.uirc.Text_BubbleInsuranceCountDown.string = CPErrorCode.LanguageDescription(20062, [leftTime]);
        }
    }
    public InsuranceExit(): void {
        this.seat.StopCountDown();
        this.seat.HideBubbleInsuranceCountDown();
    }
    //#endregion


    //#region 等待其他玩家操作
    public WaitOtherEnter(): void {

    }

    public WaitOtherExecute(): void {

    }

    public WaitOtherExit(): void {

    }
    //#endregion


    //#region 下注
    public PutChipEnter(): void {
        this.seat.UpdateCoin();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateBubble();

        this.seat.PlayBetAnimation();
    }

    public PutChipExecute(): void {
    }

    public PutChipExit(): void {
    }
    //#endregion


    //#region 跟注
    public CallEnter(): void {
        this.seat.UpdateCoin();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateBubble();
        this.seat.UpdateOnOrOffLine();
        this.seat.PlayBetAnimation();
    }

    public CallExecute(): void {

    }

    public CallExit(): void {

    }
    //#endregion

    //#region 加注
    public RaiseEnter(): void {
        this.seat.UpdateCoin();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateBubble();
        this.seat.UpdateOnOrOffLine();
        this.seat.PlayBetAnimation();
    }

    public RaiseExecute(): void {

    }

    public RaiseExit(): void {

    }
    // #endregion


    //#region 全下
    public AllinEnter(): void {
        this.seat.UpdateCoin();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateBubble(true);
        this.seat.UpdateOnOrOffLine();
        this.seat.PlayBetAnimation();
    }

    public AllinExecute(): void {

    }

    public AllinExit(): void {

    }
    //#endregion

    //#region 让牌
    public CheckEnter(): void {
        this.seat.UpdateBubble();
        GC.sound.Play("sfx_desk_player_check");
    }

    public CheckExecute(): void {

    }

    public CheckExit(): void {

    }
    //#endregion

    //#region 弃牌
    public FoldEnter(): void {
        this.seat.UpdateBubble();
        if (null == this.seat.Player)
            return;

        this.seat.FoldHeadGray(this.seat.Player.isFold);
        this.seat.PlayFoldAnimation();

        GC.sound.Play("sfx_desk_player_fold");
    }

    public FoldExecute(): void {

    }

    public FoldExit(): void {

    }
    //#endregion


    //#region 本轮结束
    public RoundEndEnter(): void {
        this.seat.ClearRoundEndData();
        this.seat.HideCards(this.seat.listCardUIInfos);
        this.seat.HideCards(this.seat.listSmallCardUIInfos);
        this.seat.HideCardBack();
        this.seat.ClearCurRoundHaveBet();
        this.seat.ResetShowCardsId();
        this.seat.UpdateShowCardsId();
        this.seat.HideBubbleInsurance();
        this.seat.uirc.imageCardType.node.active = false;
        this.seat.StopAllinArmature();
        this.seat.StopWinArmature();
        this.seat.FoldHeadGray(this.seat.Player.isFold);
    }

    public RoundEndExecute(): void {

    }

    public RoundEndExit(): void {

    }
    //#endregion


    //#region 留座离桌
    public KeepEnter(): void {
        this.seat.ShowReturnGame();
    }

    public KeepExecute(): void {
        if (GlobalSession.NowTimeS - this.seat.keepSeatDeltaTime > 1) {
            this.seat.keepSeatDeltaTime = GlobalSession.NowTimeS;
            this.seat.keepSeatLeftTime -= 1;
            if (this.seat.keepSeatLeftTime <= 0) {
                this.seat.bKeepSeatCounting = false;
            }
            else {
                this.seat.uirc.textCancelReserveSeat.string = `${CPErrorCode.LanguageDescription(10011)}\n${this.seat.keepSeatLeftTime}s`;
                this.seat.uirc.m_ReserveTime.string = `${this.seat.keepSeatLeftTime}s`;
            }
        }
    }

    public KeepExit(): void {
        this.seat.HideReturnGame();
    }
    //#endregion

    //#region 带入
    public AddChipsEnter(): void {
        this.seat.UpdateCoin();
        this.seat.UpdateRequesting();
        //this.seat.UpdateHolding();
    }
    public AddChipsExecute(): void {
    }

    public AddChipsExit(): void {
    }
    //#endregion
}
