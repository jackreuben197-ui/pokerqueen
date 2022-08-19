import FSMLogicComponent from "./FSMLogicComponent";
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

        // imageBanker.gameObject.SetActive(false);
        // imageStraddle.gameObject.SetActive(false);
        this.seat.uirc.imageHeadFrame.node.active = false;
        // transSmallCardBacks.gameObject.SetActive(false);
        // imageHolding.gameObject.SetActive(false);
        // HideCards(listCardUIInfos);
        // HideCards(listSmallCardUIInfos);
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
        // this.seat.UpdateNickname();
        this.seat.UpdateCoin();
        // this.seat.UpdateHolding();
        // //UpdateShowCardsId(new List<sbyte>());
        // this.seat.UpdateCurRoundHaveBet();
        // this.seat.UpdateCards();
        // this.seat.UpdateBanker();

        // this.seat.StopAllinArmature();
        // this.seat.StopWinArmature();

        //this.seat.imageHeadFrame.node.active(true);
        //this.seat.imageEmpty.gameObject.SetActive(false);
    }

    public SitExecute(): void {

    }

    public SitExit(): void {

    }
    //#endregion

    //#region 坐下动画
    SitAnimationEnter() {
        // sequenceSitAnimationEnter = DOTween.Sequence();
        // sequenceSitAnimationEnter.Append(Trans.DOScaleX(0, 0.15f).OnComplete(() => {
        //     this.FsmLogicComponent.SM.ChangeState(SeatSit.Instance);
        //     this.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
        // }));
        // sequenceSitAnimationEnter.Append(Trans.DOScaleX(1, 0.15f));

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
        // UpdateNickname();
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
        //HideCards(listCardUIInfos);
        //HideCards(listSmallCardUIInfos);
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



}
