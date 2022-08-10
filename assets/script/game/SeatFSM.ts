import Seat from "./Seat";

export class SeatFSM {

    constructor(public seat: Seat) {

    }

    //#region 坐下
    public SitEnter(): void {
        // this.seat.SetClient0BubblePos();
        // this.seat.UpdateHead();
        // this.seat.UpdateNickname();
        // this.seat.UpdateCoin();
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

        cc.tween(this.seat.ui).sequence(cc.scaleTo(0.15, 0, 1), cc.callFunc(() => { }), cc.scaleTo(0.15, 1, 1)).start();

    }
    SitAnimationExecute() {
    }
    SitAnimationExit() {
    }
    //#endregion






}
