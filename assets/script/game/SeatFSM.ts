import FSMLogicComponent from "./FSMLogicComponent";
import { GameCache } from "./GameCache";
import Seat from "./Seat";
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
        this.seat.SetNickname("");
        this.seat.SetCoin("");

        this.seat.uirc.imageBanker.active = false;
        // imageStraddle.gameObject.SetActive(false);
        this.seat.uirc.imageHeadFrame.node.active = false;
        this.seat.uirc.transSmallCardBacks.active = false;
        // imageHolding.gameObject.SetActive(false);
        this.seat.HideCards(this.seat.uirc.listCardUIInfos);
        this.seat.HideCards(this.seat.uirc.listSmallCardUIInfos);
        // imageTrust.gameObject.SetActive(false);
        // imageOffline.gameObject.SetActive(false);
        // imageReserveSeat.gameObject.SetActive(false);
        // imageCountDown.gameObject.SetActive(false);
        // Image_CountDownbg.gameObject.SetActive(false);
        // imageBubble.gameObject.SetActive(false);
        // Image_BubbleInsuranceNum.gameObject.SetActive(false);
        // Image_BubbleInsuranceToubao.gameObject.SetActive(false);
        // transCurRoundHaveBet.gameObject.SetActive(false);
        // imageWinner.gameObject.SetActive(false);
        // imageCoinShadow.gameObject.SetActive(false);
        // m_ImageRanking.gameObject.SetActive(false);
        // Image_OtherWinnerCardType.gameObject.SetActive(false);
        // imageBubbleBackDesk.gameObject.SetActive(false);
        // imageCardType.gameObject.SetActive(false);
        // imageRecyclingWinChip.gameObject.SetActive(false);
        // Image_OtherWinner.gameObject.SetActive(false);
        // WaitforthenextmoveTips.gameObject.SetActive(false);
        // FoldHeadGray(false);

        // if (null != armatureVoice.dragonAnimation && armatureVoice.dragonAnimation.isPlaying)
        //     armatureVoice.dragonAnimation.Stop();
        // armatureVoice.gameObject.SetActive(false);

        // StopAllinArmature();
        // StopWinArmature();
        // StopLightArmature();

        this.seat.uirc.imageEmpty.node.active = true;
        // UpdateVoiceprintState(VoiceprintState.None);
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
        this.seat.UpdateNickname();
        this.seat.UpdateCoin();
        //this.seat.UpdateHolding();
        this.seat.UpdateCurRoundHaveBet();
        this.seat.UpdateCards();
        this.seat.UpdateBanker();

        // this.seat.StopAllinArmature();
        // this.seat.StopWinArmature();

        this.seat.uirc.imageHeadFrame.node.active = true;
        this.seat.uirc.imageEmpty.node.active = false;
    }

    public SitExecute(): void {

    }

    public SitExit(): void {

    }
    //#endregion

    //#region 坐下动画
    SitAnimationEnter() {

        cc.tween(this.seat.ui).sequence(cc.scaleTo(0.15, 0, 1), cc.callFunc(() => {
            this.seat.FsmLogicComponent.SM.ChangeState(SeatSit.Instance);
            this.seat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
        }), cc.scaleTo(0.15, 1, 1)).start();

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
        this.seat.uirc.imageHeadFrame.node.active = true;
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
        this.seat.HideCards(this.seat.uirc.listCardUIInfos);
        this.seat.HideCards(this.seat.uirc.listSmallCardUIInfos);
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
        cc.tween(this.seat.ui).sequence(cc.scaleTo(0.15, 0, 1), cc.scaleTo(0.15, 1, 1)).start();
    }

    public StandupAnimationExecute(): void {

    }

    public StandupAnimationExit(): void {

    }
    //#endregion

    //#region 每手开始
    public StartEnter(): void {
        this.seat.HideCards(this.seat.uirc.listCardUIInfos);
        this.seat.HideCards(this.seat.uirc.listSmallCardUIInfos);
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
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_PLAYER_TURN);
            return;
        }
        this.seat.StartCountDown(GameCache.Instance.CurGame.GetOpTime());
    }

    public OperationExecute(dt: number): void {
        if (!this.seat.isCountDown)
            return;

        this.seat.uirc.imageCountDown.fillRange = (this.seat.optCurTime -= dt) / this.seat.optTotalTime;
        this.seat.uirc.image_CountDownTime.string = `${this.seat.optCurTime ^ 0}`;
        if (this.seat.uirc.imageCountDown.fillRange <= 0) {
            this.seat.isCountDown = false;
            this.seat.uirc.imageCountDown.node.active = false;
            this.seat.uirc.Image_CountDownbg.node.active = false;
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
        //this.ShowBubbleInsuranceCountDown();
    }

    public InsuranceExecute(): void {
        if (!this.seat.isCountDown)
            return;

        // imageCountDown.fillAmount = (optCurTime -= Time.deltaTime) / optTotalTime;
        // image_CountDownTime.text = ((int)optCurTime).ToString();
        // if (imageCountDown.fillAmount <= 0) {
        //     isCountDown = false;
        //     imageCountDown.gameObject.SetActive(false);
        //     Image_CountDownbg.gameObject.SetActive(false);
        //     this.seat.PlayLightArmature();
        // }

        if (this.seat.Player.userID != GameCache.Instance.CurGame.mainPlayer.userID) {
            let leftTime = Math.ceil(this.seat.optCurTime);
            if (leftTime < 0)
                leftTime = 0;
            //textBubbleInsuranceCountDown.text = CPErrorCode.LanguageDescription(20062, new List<object>() { leftTime });
        }
    }

    public InsuranceExit(): void {
        this.seat.StopCountDown();
        //this.seat.HideBubbleInsuranceCountDown();
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


}
