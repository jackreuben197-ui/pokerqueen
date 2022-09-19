
import UpdateComponent from "../funcomponent/UpdateComponent";
import WebImageHelper from "../helper/WebImageHelper";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { UIMineModel } from "../lobby/UIMineModel";
import { Def } from "../protobuf/holdem/define_pb";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import UIComponent from "../ui/UIComponent";
import { CacheDataManager } from "./CacheDataManager";
import { CardType, CardTypeUtil } from "./CardTypeUtil";
import { CPlayer } from "./CPlayer";
import FSMLogicComponent from "./FSMLogicComponent";
import { GameCache } from "./GameCache";
import GameUtil, { RoomType } from "./GameUtil";
import { SeatFSM } from "./SeatFSM";
import { SeatEmpty, SeatKeep, SeatSit, SeatWaitOther, SeatWaitStart } from "./SeatStateHandler";
import SeatUIRC, { CardUIInfo } from "./SeatUIRC";

/// <summary>
/// 声纹状态
/// </summary>
export enum VoiceprintState {
    None,
    Start,//发起验证
    Recording,//录入中
    Voting,//投票中
    Checking,//等待审核
    Robot,//被验证是机器人
    Real//被验证是真人
}

export default class Seat {

    public SeatFSM: SeatFSM = null;

    /// <summary>
    /// 自己手牌位置
    /// </summary>
    protected static myCardsPos: cc.Vec3[] = [];
    /// <summary>
    /// 自己手牌旋转
    /// </summary>
    protected static myCardsRot: cc.Vec3[] = [];

    /// <summary>
    /// 小手牌
    /// </summary>
    protected static backSmallCardPos: cc.Vec3[] = [];
    /// <summary>
    /// 小手牌
    /// </summary>
    protected static backSmallCardRot: cc.Vec3[] = [];

    /// <summary>
    /// 输赢时显示的手牌位置
    /// </summary>
    protected static smallCardPos: cc.Vec3[] = [];
    /// <summary>
    /// 自己牌型位置
    /// </summary>
    protected static myCardTypePos: cc.Vec3[] = [];


    protected defaultIconChipLocalPos: cc.Vec3 = cc.v3();


    public FsmLogicComponent: FSMLogicComponent = null;//状态机


    public ClientSeatId: number = 0;    // 客户端座位号

    public seatID: number = 0;   // 服务器座位号

    public Player: CPlayer = null;  // 玩家信息

    public isSmall: boolean = false; // 是否小盲
    public isBig: boolean = false;    // 是否大盲
    public isBank: boolean = false;  // 是否庄家
    public isStraddle: boolean = false;// 是否Straddle

    public keepSeatLeftTime: number = 0;  // 留座剩余时间（s）
    public ranking: number = 0;   //玩家排名(mtt)
    private voiceprintTime: number = 0;
    private OriginalVoicePos: cc.Vec3 = null;
    //private Transform OriginalVoiceObj;

    public optCurTime: number = 0;
    public optTotalTime: number = 0;
    public isCountDown: boolean = false;

    public seatUIInfo: SeatUIInfo = null;

    protected PlayerCount: number = 0;//最大人数

    public uirc: SeatUIRC = null;


    protected sequencePlayFoldAnimation: cc.Tween;



    public SeatVoiceprintState: VoiceprintState = VoiceprintState.None;

    private isStartHide: boolean = false;


    /// <summary>
    /// 是否留座离桌倒计时中
    /// </summary>
    public bKeepSeatCounting: boolean = false;
    public keepSeatDeltaTime: number = 0;

    tweenerPlayRecyclingWinChipAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function } = null;
    sequenceUpdateBubble: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function } = null;
    tweenerHideBubble: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function } = null;

    IsDisposed: boolean = false;

    constructor(public id: number, public ui: cc.Node) {

        this.SeatFSM = new SeatFSM(id, this);

        this.uirc = ui.getComponent(SeatUIRC);

        this.uirc.seat = this;

        UpdateComponent.Add(this.FsmLogicComponent = new FSMLogicComponent(), this.SeatFSM);

        this.FsmLogicComponent.start();

        this.InitUIStaticData();

    }

    public Clear() {

        this.ui = null;

        this.SeatFSM = null;

        UpdateComponent.Remove(this.FsmLogicComponent);

    }




    InitUIStaticData() {
        if (Seat.myCardsPos.length != 2) {
            Seat.myCardsPos = [];
            Seat.myCardsPos.push(cc.v3(-20, 0));
            Seat.myCardsPos.push(cc.v3(160, 0));
        }
        if (Seat.myCardTypePos.length != 1) {
            Seat.myCardTypePos = [];
            Seat.myCardTypePos.push(cc.v3(-80, -243));
        }
        if (Seat.myCardsRot.length != 2) {
            Seat.myCardsRot = [];
            Seat.myCardsRot.push(cc.v3(0, 0));
            Seat.myCardsRot.push(cc.v3(0, 0, -8));
        }

        if (Seat.backSmallCardPos.length != 4) {
            Seat.backSmallCardPos = [];
            Seat.backSmallCardPos.push(cc.v3(0, 14.5));
            Seat.backSmallCardPos.push(cc.v3(-10, 14.5));

            Seat.backSmallCardPos.push(cc.v3(0, 14.5));
            Seat.backSmallCardPos.push(cc.v3(-10, 14.5));
        }

        if (Seat.backSmallCardRot.length != 2) {
            Seat.backSmallCardRot = [];
            Seat.backSmallCardRot.push(cc.v3(0, 0, -15));
            Seat.backSmallCardRot.push(cc.v3(0, 0, 0));
        }

        if (Seat.smallCardPos.length != 2) {
            Seat.smallCardPos = [];
            Seat.smallCardPos.push(cc.v3(-29, 14.5));
            Seat.smallCardPos.push(cc.v3(35, 14.5));
        }
    }





    public UpdateVoiceprintState(voiceprintState: VoiceprintState, time: number = 0): void {
        this.SeatVoiceprintState = voiceprintState;
        switch (voiceprintState) {
            case VoiceprintState.None:
                this.HideAllVoiceprintState();
                break;
            case VoiceprintState.Start:
                if (time > 0) {
                    this.voiceprintTime = time;
                }
                this.ShowVoiceprintState(0);
                break;
            case VoiceprintState.Recording:
                if (time > 0) {
                    this.voiceprintTime = time;
                }
                this.ShowVoiceprintState(1);
                break;
            case VoiceprintState.Checking:
                this.ShowVoiceprintState(2);
                break;
            case VoiceprintState.Robot:
                this.ShowVoiceprintState(3);
                this.isStartHide = true;
                break;
            case VoiceprintState.Real:
                this.ShowVoiceprintState(4);
                this.isStartHide = true;
                break;
            case VoiceprintState.Voting:
                if (time >= 0 && this.Player != null) {
                    this.Player.UpdateStateTime = time;
                }
                this.ShowVoiceprintState(5);
                break;
            default:
                break;
        }
    }

    private ShowVoiceprintState(num: number): void {
        for (let i = 0; i < this.uirc.voiceprintList.length; i++) {
            this.uirc.voiceprintList[i].active = (num == i);
        }
    }
    private HideAllVoiceprintState(): void {
        if (this.uirc.voiceprintList?.length) {
            for (let i = 0; i < this.uirc.voiceprintList.length; i++) {
                if (this.uirc.voiceprintList[i] != null) {
                    this.uirc.voiceprintList[i].active = false;
                }
            }
        }
    }
    /// <summary>
    /// 初始化SeatUI元素
    /// </summary>
    /// <param name="info"></param>
    public InitSeatUIInfo(info: SeatUIInfo, usercount: number): void {
        this.PlayerCount = usercount;
        this.ClientSeatId = + this.ui.name.substring(this.ui.name.length - 1);
        this.seatUIInfo = info;
        this.ui.setPosition(info.Pos);

        this.uirc.imageBanker.setPosition(info.BankerPos);
        this.uirc.transSmallCardBacks.setPosition(info.CardBackPos);
        this.uirc.transCurRoundHaveBet.setPosition(info.CurRoundHaveBetPos);


        if (this.ui.x > 0) {
            //this.uirc.armatureVoice.setPosition(-90, 50, 0);
        }
        else {
            //this.uirc.armatureVoice.setPosition(90, 50, 0);
        }

        let mRectTransform = this.uirc.imageBubble.node;
        //mRectTransform.SetParent(transBubble);
        mRectTransform.setPosition(info.BubblePos);


        // mRectTransform = imageBubbleInsurance.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        // mRectTransform.localPosition = info.BubblePos;

        // mRectTransform = imageBubbleInsuranceCountDown.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        // if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode())
        // {
        //     mRectTransform.localPosition = info.AoMaHaInsurancePos;
        // }
        // else
        // {
        //     mRectTransform.localPosition = info.InsurancePos;
        // }
        // //
        // mRectTransform = Image_BubbleInsuranceNum.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        // if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode())
        // {
        //     mRectTransform.localPosition = info.AoMaHaInsurancebubaoPos;
        // }
        // else
        // {
        //     mRectTransform.localPosition = info.InsurancebubaoPos;
        // }
        // //
        // mRectTransform = Image_BubbleInsuranceToubao.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
            // mRectTransform.localPosition = info.AoMaHaInsurancetoubaoPos;
        }
        else {
            //mRectTransform.localPosition = info.InsurancetoubaoPos;
        }
        if (this.IsMySeat) {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20090)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -416);
        }
        else {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20091)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -240);
        }

    }

    /// <summary>
    /// 刷新头像
    /// </summary>
    public UpdateHead(): void {
        if (null == this.Player) {
            this.uirc.imageEmpty.node.active = true;
            this.uirc.imageHeadFrame.node.active = false;
        }
        else {
            WebImageHelper.SetUrlImage(this.uirc.rawimageHead, this.Player.headPic);
        }
    }

    /// <summary>
    /// 刷新筹码
    /// </summary>
    public UpdateCoin(): void {

        if (null == this.Player) {
            this.SetCoin("");
            // textCoin.text = string.Empty;
        }
        else {
            if (this.Player.chips < 0) {
                this.SetCoin("");
            }
            else {
                this.SetCoin(`${this.Player.chips / 100 ^ 0}`);
            }
            // textCoin.text = StringHelper.GetShortString(Player.chips);
        }
    }
    public SetCoin(coin: string): void {
        this.uirc.textCoin.string = coin;
        if (coin != "") {
            cc.log(" player coins:" + coin);
        }
        this.uirc.textCoinBg.node.active = !(coin == "");
        let mTmpWidth: number = 0;



        // if (textCoin.preferredWidth > 0 && textCoin.preferredWidth < textCoin.rectTransform.sizeDelta.x)
        //     mTmpWidth = textCoin.preferredWidth + 36;
        // else if (textCoin.preferredWidth >= textCoin.rectTransform.sizeDelta.x)
        //     mTmpWidth = textCoin.rectTransform.sizeDelta.x;
        //imageCoinShadow.rectTransform.sizeDelta = new Vector2(mTmpWidth, textCoin.fontSize + 4);
        // if (mTmpWidth == 0) {
        //     imageCoinIcon.gameObject.SetActive(false);
        // }
        // else {
        //     imageCoinIcon.gameObject.SetActive(true);
        // }
        if (this.IsMySeat) {
            this.uirc.textCoinBg.node.setPosition(0, -174);
        }
        else {
            this.uirc.textCoinBg.node.setPosition(0, -125);
        }
    }

    /// <summary>
    /// 刷新状态机，主要用户刷新冒泡
    /// </summary>
    public UpdateFSMbyStatus(isConnect = false): void {
        if (null == this.Player) {
            this.FsmLogicComponent.SM.ChangeState(SeatEmpty.Instance);
            return;
        }

        this.FsmLogicComponent.SM.ChangeState(SeatSit.Instance);

        this.UpdateBubble(false, isConnect);

        switch (this.Player.actionStatus) {
            case Def.Action.NONE:
                // 未操作过(显示名字)
                this.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
                break;
            case Def.Action.BET:
                // 下注

                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.CALL:
                // 跟注
                this.UpdateCards();
                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.RAISE:
                // 加注

                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.ALLIN:
                // 全下

                this.UpdateCards();
                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.CHECK:
                // 让牌

                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.FOLD:
                // 弃牌
                this.Player.isFold = true;
                this.FoldHeadGray(this.Player.isFold);
                this.UpdateCards();
                this.HideCardBack();
                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;

        }
        switch (this.Player.canPlayStatus) {
            case Def.CanPlayStatus.DISABLE:
                this.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
                break;
            case Def.CanPlayStatus.NORMAL:
                break;
            case Def.CanPlayStatus.NEED_POST:
                break;
            case Def.CanPlayStatus.AGREE_POST:
                break;
            case Def.CanPlayStatus.KEEP_SEAT:
                this.FsmLogicComponent.SM.ChangeState(SeatKeep.Instance);
                break;
            default:
                break;
        }
    }

    /// <summary>
    /// 刷新气泡
    /// </summary>
    public UpdateBubble(isAllinShowVioce = false, isReconect = false): void {
        // 1.出现筹码时隐藏昵称
        // 2.操作提示与牌型提示，只出现一个则与头像居中对齐，出现两个则以居中对齐的线对称上下摆放

        // 1:下注  2:跟注  3:加注  4:全下 5:让牌  6:弃牌 10:straddle--客户端

        if (null == this.Player) {
            if (this.uirc.imageBubble.node.activeInHierarchy)
                this.uirc.imageBubble.node.active = false;
            return;
        }

        if (isReconect && !this.Player.RoundActioned) {
            return;
        }

        let rc = GameCache.Instance.CurGame.GetBubbleSpriteBySpriteName;

        switch (this.Player.actionStatus) {
            case Def.Action.CALL:
                if (!this.GetRorL()) {
                    this.uirc.imageBubble.spriteFrame = rc("icon_genzhur");
                }
                else {
                    this.uirc.imageBubble.spriteFrame = rc("icon_genzhul");
                }
                // textBubble.text = "跟注";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10044);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.BET:
            case Def.Action.RAISE:
                if (!this.GetRorL()) {
                    this.uirc.imageBubble.spriteFrame = rc("icon_jiazhur");
                }
                else {
                    this.uirc.imageBubble.spriteFrame = rc("icon_jiazhul");

                }

                // textBubble.text = "加注";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10045);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.ALLIN:
                if (!this.GetRorL()) {
                    this.uirc.imageBubble.spriteFrame = rc("icon_quanxiar");
                }
                else {
                    this.uirc.imageBubble.spriteFrame = rc("icon_quanxial");
                }
                this.uirc.textBubble.string = "All in";
                this.uirc.textBubble.node.active = true;
                this.PlayAllinArmature(isAllinShowVioce);
                break;
            case Def.Action.CHECK:
                if (!this.GetRorL()) {
                    this.uirc.imageBubble.spriteFrame = rc("icon_rangpair");
                }
                else {
                    this.uirc.imageBubble.spriteFrame = rc("icon_rangpail");
                }

                // textBubble.text = "看牌";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10046);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.FOLD:
                if (!this.GetRorL()) {
                    this.uirc.imageBubble.spriteFrame = rc("icon_qipair");
                }
                else {
                    this.uirc.imageBubble.spriteFrame = rc("icon_qipail");
                }

                // textBubble.text = "弃牌";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10047);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.STRADDLE:
                if (!this.GetRorL()) {
                    this.uirc.imageBubble.spriteFrame = rc("icon_image_game_straddle");
                }
                else {
                    this.uirc.imageBubble.spriteFrame = rc("icon_image_game_straddle_r");
                }
                this.uirc.textBubble.string = "Straddle";
                this.uirc.textBubble.node.active = false;
                this.StopAllinArmature();
                break;
            default:
                this.uirc.imageBubble.spriteFrame = null;
                this.uirc.textBubble.string = "";
                this.StopAllinArmature();
                break;
        }


        if (null == this.uirc.imageBubble.spriteFrame) {
            this.uirc.imageBubble.node.color = cc.Color.WHITE;
            this.uirc.imageBubble.node.setScale(cc.Vec3.ONE);
            this.uirc.imageBubble.node.active = false;
            this.sequenceUpdateBubble = null;
            this.UpdateNickname();
        }
        else {

            if (this.uirc.textBubble.string != "") {

                if (null == this.sequenceUpdateBubble || !this.sequenceUpdateBubble.IsPlaying)
                    this.PlayUpdateBubbleAnimation();
            }
            else {
                if (this.sequenceUpdateBubble?.IsPlaying)
                    this.sequenceUpdateBubble.Kill(true);

                this.uirc.imageBubble.node.color = cc.Color.WHITE;
                this.uirc.imageBubble.node.setScale(cc.Vec3.ONE);
                this.uirc.imageBubble.node.active = false;
                this.sequenceUpdateBubble = null;
            }
        }

    }


    /// <summary>
    /// 获取左边或者右边气泡
    /// </summary>
    /// <returns></returns>
    private GetRorL(): boolean {
        let isR = false;
        switch (this.ClientSeatId) {
            case 0:
                isR = false;
                break;
            case 1:
                isR = true;
                break;
            case 2:
                if (this.PlayerCount == 3) {
                    isR = false;
                }
                else {
                    isR = true;
                }
                break;
            case 3:
                if (this.PlayerCount == 4) {
                    isR = false;
                }
                else if (this.PlayerCount == 5) {
                    isR = false;
                }
                else {
                    isR = true;
                }
                break;
            case 4:
                if (this.PlayerCount == 5) {
                    isR = false;
                }
                else if (this.PlayerCount == 6) {
                    isR = false;
                }
                else {
                    isR = true;
                }
                break;
            case 5:
                isR = false;
                break;
            case 6:
                isR = false;
                break;
            case 7:
                isR = false;
                break;
            case 8:
                isR = false;
                break;

            default:
                isR = false;
                break;
        }
        return isR;
    }


    /// <summary>
    /// 刷新离线
    /// </summary>
    public UpdateOnOrOffLine(): void {
        let mEnumRoomType: RoomType = GameCache.Instance.room_type;
        if (mEnumRoomType == RoomType.MTTTexasHoldemStandardNoLimit) {
            this.uirc.imageOffline.active = false;
            return;
        }
        if (this.uirc.imageReserveSeat.activeInHierarchy) {
            this.uirc.imageOffline.active = false;
        }
        else {
            this.uirc.imageOffline.active = this.Player.isOffLine > 0 && !this.IsMySeat;
        }
    }

    /// <summary>
    /// 刷新昵称
    /// </summary>
    public UpdateNickname(): void {
        this.SetNickname(null == this.Player ? "" : CacheDataManager.mInstance.GetRemarkName(this.Player.userID, this.Player.nick));
        // textNickname.text = null == Player ? string.Empty : CacheDataManager.mInstance.GetRemarkName(Player.userID, Player.nick);
        if (null != this.Player) {
            this.uirc.textNickname.node.color = cc.Color.WHITE;
        }
    }
    /// <summary>
    /// 刷新本手下注筹码
    /// </summary>
    public UpdateCurRoundHaveBet(): void {
        let mOffset: number = 5;
        // 0不显示
        if (null == this.Player || this.Player.anteNumber <= 0) {
            this.uirc.transCurRoundHaveBet.active = false;
            return;
        }


        if (this.isBig && GameCache.Instance.CurGame.cacheRound == Def.Round.PREFLOP) {
            this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_big_chip");
            this.isBig = false;
        }
        else if (this.isSmall && GameCache.Instance.CurGame.cacheRound == Def.Round.PREFLOP) {
            this.isSmall = false;
            this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_small_chip");
        }
        else {
            this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");

        }
        let str: string = `${this.Player.anteNumber / 100}`;

        let num: number = +str;

        if (num != (num ^ 0)) {
            str = num.toFixed(1);
        }
        this.uirc.textCurRoundHaveBet.string = str;

        this.uirc.textCurRoundHaveBet.node.active = true;


        this.uirc.imageIconChip.node.setPosition(cc.Vec3.ZERO);

        this.uirc.imageIconChip.node.getPosition(this.defaultIconChipLocalPos);
        //this.defaultIconChipLocalPos = this.uirc.imageIconChip.node.position.clone();
        this.uirc.imageIconChip.node.active = true;
        this.uirc.transCurRoundHaveBet.active = true;
    }

    /// <summary>
    /// 隐藏手牌
    /// </summary>
    public HideCards(list: CardUIInfo[]): void {
        for (let i = 0, n = list.length; i < n; i++) {
            list[i].imageCard.active = false;
        }
    }
    /// <summary>
    /// 隐藏手牌背面
    /// </summary>
    public HideCardBack(): void {
        this.uirc.transSmallCardBacks.active = false;
    }

    /// <summary>
    /// 刷新庄家标识
    /// </summary>
    public UpdateBanker(): void {
        this.uirc.imageBanker.active = this.isBank;
    }


    /// <summary>
    /// 刷新手牌
    /// </summary>
    public UpdateCards(isAllin: boolean = false): void {
        if (this.IsMySeat) {

            this.HideCards(this.uirc.listSmallCardUIInfos);
            this.HideCardBack();
            if (this.Player?.cards != null) {

                if (isAllin) {
                    this.UpdateImageBackActive();
                }

                let hadCard: boolean = false;
                if (this.Player.cards.length > 0 && this.Player.cards[0] > 0) {
                    //有牌必定显示
                    hadCard = true;
                }
                if (hadCard || this.Player.isPlaying) {

                    for (let i = 0, n = this.uirc.listCardUIInfos.length; i < n; i++) {
                        this.uirc.listCardUIInfos[i].imageCard.color = this.Player.isFold ? cc.Color.GRAY : cc.Color.WHITE;
                    }
                    this.ShowCards(this.uirc.listCardUIInfos);
                }
                else {
                    this.HideCards(this.uirc.listCardUIInfos);
                }
            }
            else {
                this.HideCards(this.uirc.listCardUIInfos);
            }
        }
        else {

            this.HideCards(this.uirc.listCardUIInfos);
            if (this.Player?.cards != null) {
                let mShow: boolean = false;
                for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                    if (this.Player.cards[i] > 0) {
                        mShow = true;
                        break;
                    }
                }

                if (this.Player.cards.length > 0 && mShow) {
                    this.ShowCards(this.uirc.listSmallCardUIInfos);
                    // tweenerHideBubble = imageBubble.transform.DOScale(new Vector3(0, 0, 1), 0.2f).SetDelay(1f).OnComplete(() => {
                    //     imageBubble.gameObject.SetActive(false);


                    // });

                    this.HideCardBack();
                }
                else {
                    this.HideCards(this.uirc.listSmallCardUIInfos);
                    if (this.Player.isPlaying) {
                        this.ShowCardBack();
                    }
                    else {
                        this.HideCardBack();
                    }
                }
            }
            else {
                this.HideCards(this.uirc.listSmallCardUIInfos);
                this.HideCardBack();
            }
        }
    }

    /// <summary>
    /// 显示手牌
    /// </summary>
    protected ShowCards(list: CardUIInfo[]): void {

        let mUpdateStart = 0;
        let mUpdateEnd = 0;
        let mHideStart = 0;
        let mHideEnd = 0;

        if (this.Player?.cards != null) {
            if (this.Player.cards.length > list.length) {
                mUpdateStart = 0;
                mUpdateEnd = list.length;
            }
            else if (this.Player.cards.length < list.length) {
                mUpdateStart = 0;
                mUpdateEnd = this.Player.cards.length;

                mHideStart = mUpdateEnd + 1;
                mHideEnd = list.length;
            }
            else {
                mUpdateStart = 0;
                mUpdateEnd = this.Player.cards.length;
            }
        }

        try {
            for (let i = mUpdateStart; i < mUpdateEnd; i++) {
                if (this.IsMySeat) {

                    list[i].imageCard.setPosition(Seat.myCardsPos[i]);
                    //list[i].imageCard.transform.localRotation = Quaternion.Euler(myCardsRot[i]);
                }
                else {
                    list[i].imageCard.color = cc.Color.WHITE;
                    list[i].imageCard.setPosition(Seat.smallCardPos[i]);
                }
                let mCard = this.Player.cards[i];
                list[i].imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(mCard));
                list[i].imageCard.active = true;
            }
        }
        catch (Exception) {

            // System.Text.StringBuilder logContent = new System.Text.StringBuilder();
            // if (Player == null) {
            //     logContent.Append(string.Format("Player == null:= {0},", "Player == null"));
            // }
            // if (Player.cards == null) {
            //     logContent.Append(string.Format("Player.cards == null:= {0},", "Player.cards == null"));
            // }
            // if (Player != null && Player.cards != null) {
            //     logContent.Append(string.Format("ShowCards:= {0},", Player.cards.Count));
            //     logContent.Append(string.Format("mUpdateStart:= {0},", mUpdateStart));
            //     logContent.Append(string.Format("mUpdateEnd:= {0},", mUpdateEnd));
            //     for (int i = 0; i < Player.cards.Count; i++)
            //     {
            //         logContent.Append(string.Format("Player.cards:= {0},", Player.cards[i]));
            //     }
            // }
            // Log.write(UnityEngine.LogType.Log, logContent.ToString());

        }


        for (let i = mHideStart; i < mHideEnd; i++) {
            list[i].imageCard.active = false;
        }
    }


    /// <summary>
    /// 显示手牌背面
    /// </summary>
    public ShowCardBack(): void {
        for (let i = 0, n = this.uirc.listImageSmallCardBack.length; i < n; i++) {
            this.uirc.listImageSmallCardBack[i].node.active = true;
            this.uirc.listImageSmallCardBack[i].node.setPosition(this.GetBackSmallCardPos(i));
            //listImageSmallCardBack[i].transform.localRotation = Quaternion.Euler(GetBackSmallCardRot(i));
        }

        this.uirc.transSmallCardBacks.setPosition(this.seatUIInfo.CardBackPos);
        this.uirc.transSmallCardBacks.active = true;
    }
    /// <summary>
    /// 播放下注动画
    /// </summary>
    public PlayBetAnimation(): cc.Tween {
        let pos = cc.v3();
        this.uirc.imageEmpty.node.getPosition(pos);
        this.uirc.imageIconChip.node.setPosition(GameUtil.ChangeToLocalPos(pos, this.ui, this.uirc.transCurRoundHaveBet));
        this.uirc.imageIconChip.node.active = true;
        return cc.tween(this.uirc.imageIconChip.node).to(.2, { position: this.defaultIconChipLocalPos }).start();
    }
    /// <summary>
    /// 播放弃牌动画
    /// </summary>
    public PlayFoldAnimation(): void {
        //sequencePlayFoldAnimation = DOTween.Sequence();
        this.sequencePlayFoldAnimation = cc.tween(this.ui);
        if (!this.IsMySeat) {
            // 其他玩家弃牌
            //this.sequencePlayFoldAnimation.sequence();
            //InverseTransformPoint 世界转局部
            let tween = cc.tween();
            let sequence = [];
            let pos = this.uirc.transSmallCardBacks.parent.convertToNodeSpaceAR(GameCache.Instance.CurGame.GetRecyclingChipPosV3());
            sequence.push(
                cc.callFunc(() => {
                    cc.tween(this.uirc.transSmallCardBacks).to(.5, { position: pos }).start();
                },
                ));
            for (let i = 0, n = this.uirc.listImageSmallCardBack.length; i < n; i++) {
                //sequencePlayFoldAnimation.Join(listImageSmallCardBack[i].DOFade(0, 0.3f));
                sequence.push(
                    cc.callFunc(() => {
                        cc.tween(this.uirc.listImageSmallCardBack[i].node).to(0.3, { opacity: 0 }).start();
                    })
                );
            }
            sequence.push(cc.delayTime(.5));

            this.sequencePlayFoldAnimation.sequence.apply(this.sequencePlayFoldAnimation, sequence).call(() => {
                this.uirc.transSmallCardBacks.position = this.seatUIInfo.CardBackPos;
                for (let i = 0, n = this.uirc.listImageSmallCardBack.length; i < n; i++) {
                    this.uirc.listImageSmallCardBack[i].node.color = cc.Color.WHITE;
                }
                this.uirc.transSmallCardBacks.active = false;
            }).start();
        }
        else {

        }
    }


    /// <summary>
    /// 播放庄家动画
    /// </summary>
    /// <returns></returns>
    public PlayBankerAnimation(tween?: cc.Tween): cc.Tween {
        if (GameCache.Instance.CurGame.lastBankerIndex == -1 || this.seatID == GameCache.Instance.CurGame.lastBankerIndex)
            return null;

        let mSeat: Seat = GameCache.Instance.CurGame.GetSeatByLocalSeatID(GameCache.Instance.CurGame.lastBankerIndex);
        if (null == mSeat) return null;

        mSeat.uirc.imageBanker.active = false;
        this.uirc.imageBanker.setPosition(GameUtil.ChangeToLocalPos(mSeat.seatUIInfo.BankerPos, mSeat.ui, this.ui));
        this.uirc.imageBanker.active = true;

        if (tween) {
            tween.then(cc.callFunc(() => {
                cc.tween(this.uirc.imageBanker).to(.3, { position: this.seatUIInfo.BankerPos }).call(() => { cc.log("运动结束") }).start();
            }))
            tween.delay(.3);
        } else {
            tween = cc.tween();
            tween.sequence(cc.callFunc(() => {
                cc.tween(this.uirc.imageBanker).to(.3, { position: this.seatUIInfo.BankerPos }).call(() => { cc.log("运动结束") }).start();
            }), cc.delayTime(.3));
        }
        return tween;
    }


    /// <summary>
    /// 播放回收筹码动画
    /// </summary>
    public PlayRecyclingChipAnimation(): cc.Tween {
        let tween = cc.tween(this.ui);
        if (this.uirc.imageIconChip.node.activeInHierarchy) {
            this.uirc.textCurRoundHaveBet.node.active = false;
            let pos = this.uirc.textCurRoundHaveBet.node.convertToNodeSpaceAR(GameCache.Instance.CurGame.GetRecyclingChipPosV3());
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_MOVE_CHIPS);
            cc.tween(this.uirc.imageIconChip.node).to(.5, { position: pos }).call(() => {
                this.uirc.imageIconChip.node.active = false;
            }).start();
        }
        return tween;
    }


    /// <summary>
    /// 刷新前注
    /// </summary>
    public UpdateGroupBet(): void {

        let mOffset = 10;

        this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");

        let str: string = `${GameCache.Instance.CurGame.groupBet / 100}`;
        ////是整数不保留小数，不是整数保留一位小数
        let num: number = +str;

        if (num != (num ^ 0)) {
            str = num.toFixed(1);
        }

        this.uirc.textCurRoundHaveBet.string = str;

        //textCurRoundHaveBet.text = string.Format("{0:N0}", GameCache.Instance.CurGame.groupBet / 100D); //StringHelper.GetLongString(GameCache.Instance.CurGame.groupBet);
        this.uirc.textCurRoundHaveBet.node.active = true;
        //RectTransform mRectTransform = imageCurRoundHaveBetFrame.transform as RectTransform;
        //mRectTransform.sizeDelta = new Vector2(textCurRoundHaveBet.preferredWidth + imageIconChip.rectTransform.sizeDelta.x, mRectTransform.sizeDelta.y);

        let mTmpV3: cc.Vec2 = this.ui.getPosition();
        if (mTmpV3.x <= 0) {
            //textCurRoundHaveBet.alignment = TextAnchor.MiddleRight;
        }
        else {
            //textCurRoundHaveBet.alignment = TextAnchor.MiddleLeft;
        }
        if (mTmpV3.y > GameUtil.SeatPosV3[0].y && mTmpV3.y < GameUtil.SeatPosV3[7].y) {
            if (mTmpV3.x < 0) {
                // 左
                //mRectTransform.pivot = new Vector2(0, 0.5f);
                //mRectTransform.localPosition = new Vector3(-mOffset, 0);
            }
            else if (mTmpV3.x > 0) {
                // 右
                //mRectTransform.pivot = new Vector2(1f, 0.5f);
                //mRectTransform.localPosition = new Vector3(mOffset, 0);
            }
            this.uirc.imageIconChip.node.setPosition(cc.Vec2.ZERO);
        }
        else {
            //mRectTransform.pivot = new Vector2(0, 0.5f);
            //mRectTransform.localPosition = new Vector3(-mRectTransform.sizeDelta.x / 2f - mOffset, mRectTransform.localPosition.y);
            this.uirc.imageIconChip.node.setPosition(cc.Vec2.ZERO);
        }

        this.uirc.imageIconChip.node.getPosition(this.defaultIconChipLocalPos);
        this.uirc.imageIconChip.node.active = true;
        this.uirc.transCurRoundHaveBet.active = true;
    }

    /// <summary>
    /// 播放发牌动画
    /// </summary> virtual Sequence 
    public PlayDealAnimation(delay: number, targetPos: cc.Vec3): cc.Tween {

        for (let i = 0, n = this.uirc.listCardUIInfos.length; i < n; i++) {
            this.uirc.listCardUIInfos[i].imageSelect.node.active = false;
        }
        for (let i = 0, n = this.uirc.listSmallCardUIInfos.length; i < n; i++) {
            this.uirc.listSmallCardUIInfos[i].imageSelect.node.active = false;
        }

        let tween = cc.tween(this.uirc.node);

        tween.delay(delay);

        //let sequence: cc.ActionInstant[] = [];

        //let spawns: (cc.ActionInterval | cc.Tween)[] = [];

        if (GameCache.Instance.CurGame.mainPlayer.seatID != this.seatID) {

            // 其他玩家发牌动画
            //sequencePlayDealAnimation = DOTween.Sequence();
            tween.then(cc.callFunc(() => {
                this.uirc.transSmallCardBacks.active = true;
            }));

            let mLocalPos: cc.Vec3 = this.uirc.transSmallCardBacks.convertToNodeSpaceAR(targetPos);
            for (let i = 0, n = this.uirc.listImageSmallCardBack.length; i < n; i++) {
                this.uirc.listImageSmallCardBack[i].node.setPosition(mLocalPos);
                let mTmpObj: cc.Node = this.uirc.listImageSmallCardBack[i].node;
                let pos = this.GetBackSmallCardPos(i);

                tween.then(cc.callFunc(() => {
                    //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_NEW_CARD);
                    mTmpObj.active = true;
                    cc.tween(mTmpObj).to(.4, { position: pos }).start();
                }))
            }
            tween.delay(0.4);

            cc.log("其他玩家发牌动画", tween);

            return tween;
        }
        else {

            try {


                tween.then(cc.callFunc(() => {
                    //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_NEW_CARD);
                }));

                cc.log("this.Player.cards.length >> ", this.Player.cards.length);

                for (let i = 0, n = this.Player.cards.length; i < n; i++) {

                    this.uirc.listCardUIInfos[i].imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(this.Player.cards[i]));
                    this.uirc.listCardUIInfos[i].imageCard.color = cc.Color.WHITE;
                    this.uirc.listCardUIInfos[i].imageBack.spriteFrame = GameCache.Instance.CurGame.GetPokerSpriteBySpriteName(GameUtil.GetCardNameByNum(-1));
                    this.uirc.listCardUIInfos[i].imageBack.node.color = cc.Color.WHITE;
                    this.uirc.listCardUIInfos[i].imageBack.node.active = true;
                    this.uirc.listCardUIInfos[i].imageCard.setScale(cc.v3(0.5, 0.5));
                    //listCardUIInfos[i].imageCard.rectTransform.localRotation = Quaternion.Euler(0, 0, 0);
                    this.uirc.listCardUIInfos[i].imageCard.setPosition(this.uirc.listCardUIInfos[i].imageCard.parent.convertToNodeSpaceAR(targetPos));
                    this.uirc.listCardUIInfos[i].imageCard.active = true;
                    let tween_card = cc.tween(this.uirc.listCardUIInfos[i].imageCard);
                    let tween_back = cc.tween(this.uirc.listCardUIInfos[i].imageBack.node);

                    let cardInfo = this.uirc.listCardUIInfos[i];

                    tween.then(cc.callFunc(() => {
                        tween_card.to(0.4, { scaleX: 1.5, scaleY: 1.3, position: Seat.myCardsPos[i] }).start();
                    }))
                    if (!GameCache.Instance.CurlimitDelaySeeCard) {
                        tween.then(cc.callFunc(() => {
                            tween_back.to(0.25, { opacity: 0 }).call(() => {
                                cardInfo.imageBack.node.active = false;
                            });
                        }))
                    }
                }
                tween.delay(0.4);
            }
            catch (Exception) {


                cc.log("Exception Error ");

                // System.Text.StringBuilder logContent = new System.Text.StringBuilder();
                // if (Player == null) {
                //     logContent.Append(string.Format("Player == null:= {0},", "Player == null"));
                // }
                // if (Player.cards == null) {
                //     logContent.Append(string.Format("Player.cards == null:= {0},", "Player.cards == null"));
                // }
                // if (Player != null && Player.cards != null) {
                //     logContent.Append(string.Format("ShowCards:= {0},", Player.cards.Count));

                //     for (int i = 0; i < Player.cards.Count; i++)
                //     {
                //         logContent.Append(string.Format("Player.cards:= {0},", Player.cards[i]));
                //     }
                // }
                // Log.write(UnityEngine.LogType.Log, logContent.ToString());
            }
            // sequencePlayDealAnimation.OnStart(() => {

            // });
            cc.log("自己发牌动画", tween);

            return tween;
        }
    }

    /// <summary>
    /// 刷新亮牌眼睛
    /// </summary>
    public UpdateShowCardsId(): void {
        if (null == this.Player || null == GameCache.Instance.CurGame.mainPlayer || GameCache.Instance.CurGame.mainPlayer.userID != this.Player.userID ||
            GameCache.Instance.CurGame.mainPlayer.seatID != this.seatID) {
            return;
        }

        for (let i = 0; i < this.uirc.showCardsId.length; i++) {
            this.uirc.listCardUIInfos[i].imageEye.node.active = this.uirc.showCardsId[i] == 1;
        }
    }


    /// <summary>
    /// 轮到自己操作隐藏头像名字
    /// </summary>
    public SetOperationHeadActive(istrue: boolean): void {
        if (istrue) {
            this.uirc.imageBanker.active = this.isBank;
        }
        else {
            //imageBanker.gameObject.SetActive(false);
        }
        this.uirc.imageHeadFrame.node.active = istrue;
        this.uirc.textNickname.node.active = !this.IsMySeat;
    }



    /// <summary>
    /// 停止allin动画
    /// </summary>
    public StopAllinArmature(): void {
        // if (null != this.armatureAllin.dragonAnimation && armatureAllin.dragonAnimation.isPlaying)
        //     armatureAllin.dragonAnimation.Stop();
        // armatureAllin.gameObject.SetActive(false);
    }

    /// <summary>
    /// 停止赢牌头像动画
    /// </summary>
    public StopWinArmature(): void {
        // armatureYouWin.gameObject.SetActive(false);
        // transWinner.gameObject.SetActive(false);
        // Image_OtherWinnerCardType.gameObject.SetActive(false);
        // Image_OtherWinner.gameObject.SetActive(false);
        // imageWinner.gameObject.SetActive(false);

    }
    /// <summary>
    /// 开始倒计时
    /// </summary>
    /// <param name="countDown"></param>
    public StartCountDown(countDown: number, isInsruance: boolean = false): void {
        this.optCurTime = countDown;

        let defaultOpTime: number = GameCache.Instance.CurGame.GetOpTime();
        if (isInsruance)
            defaultOpTime = 30;
        if (countDown > defaultOpTime) {
            defaultOpTime = countDown;
        }
        this.optTotalTime = defaultOpTime;
        this.isCountDown = true;
        this.uirc.imageCountDown.fillRange = this.optCurTime / defaultOpTime;
        this.uirc.imageCountDown.node.active = true;
        this.uirc.Image_CountDownbg.node.active = true;
        this.uirc.image_CountDownTime.string = `${this.optCurTime}`;
        //this.StopLightArmature();
    }

    /// <summary>
    /// 停止倒计时
    /// </summary>
    public StopCountDown(): void {
        if (this.isCountDown) {
            this.isCountDown = false;
            this.uirc.imageCountDown.node.active = false;
            this.uirc.Image_CountDownbg.node.active = false;
        }
        //this.StopLightArmature();
    }

    public UpdateImageBackActive(istrue: boolean = false): void {
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            //if (listCardUIInfos[i].imageBack.gameObject.activeInHierarchy)
            //{
            this.uirc.listCardUIInfos[i].imageBack.node.active = istrue;
            //}
        }
    }

    /// <summary>
    /// 刷新手牌牌型高亮
    /// </summary>
    /// <param name="type"></param>
    /// <param name="hightCards"></param>
    public UpdateCardType(type: CardType, hightCards: number[], isGameend = false): void {
        if (this.Player == null || GameCache.Instance.CurGame.GetCurPublicCardsCount() == 0 || this.CardsCount() == 0) {
            this.uirc.imageCardType.node.active = false;
            this.uirc.imageSmallCardType.node.active = false;
            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                this.uirc.listCardUIInfos[i].imageSelect.node.active = false;
            }
            return;
        }

        if (this.IsMySeat) {
            this.uirc.imageSmallCardType.node.active = false;
            this.uirc.textCardType.string = CardTypeUtil.GetCardTypeName(type);

            this.uirc.imageCardType.node.active = true;
            this.uirc.imageCardType.node.setPosition(Seat.myCardTypePos[0]);
            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                this.uirc.listCardUIInfos[i].imageSelect.node.active = false;
                if (isGameend) {
                    this.uirc.listCardUIInfos[i].imageCard.color = cc.Color.GRAY;
                }

                for (let j = 0, m = hightCards.length; j < m; j++) {
                    if (this.Player.cards[i] == hightCards[j]) {
                        if (isGameend) {
                            this.uirc.listCardUIInfos[i].imageCard.color = cc.Color.WHITE;
                            this.uirc.listCardUIInfos[i].imageCard.setPosition(cc.v3(this.uirc.listCardUIInfos[i].imageCard.position.x, this.uirc.listCardUIInfos[i].imageCard.position.y));//+40奥马哈两个手牌上移
                            this.uirc.listCardUIInfos[i].imageSelect.node.active = false;
                        }
                        else {
                            this.uirc.listCardUIInfos[i].imageSelect.node.active = true;
                        }
                        break;
                    }
                }
            }
        }
        else {
            this.uirc.imageCardType.node.active = false;
            this.uirc.textSmallCardType.string = CardTypeUtil.GetCardTypeName(type);


            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                this.uirc.listSmallCardUIInfos[i].imageSelect.node.active = false;

            }
        }
    }


    /// <summary>
    /// 隐藏手牌牌型高亮
    /// </summary>
    public HideCardType(): void {
        if (null == this.Player || null == this.Player.cards)
            return;

        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            this.uirc.listSmallCardUIInfos[i].imageCard.color = cc.Color.WHITE;
            this.uirc.listCardUIInfos[i].imageSelect.node.active = false;
        }
        this.uirc.imageSmallCardType.node.active = false;
        this.uirc.imageCardType.node.active = false;
    }

    /// <summary>
    /// 可见手牌数量
    /// </summary>
    public CardsCount(): number {
        let iCount = 0;
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            if (this.Player.cards[i] != -1) {
                iCount++;
            }
        }
        return iCount;
    }


    protected GetBackSmallCardPos(index: number): cc.Vec3 {
        return Seat.backSmallCardPos[index];
    }

    protected GetBackSmallCardRot(index: number): cc.Vec3 {
        return Seat.backSmallCardRot[index];
    }

    //刷新座位下的等待文本
    public UpdateWaiteNextTips(ishow: boolean): void {
        if (this.IsMySeat) {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20090)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -416);
        }
        else {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20091)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -240);
        }
        if (GameCache.Instance.GameStatus == 1) {
            this.uirc.WaitforthenextmoveTips.node.active = ishow;
        }
    }



    public SetNickname(name: string): void {
        this.uirc.textNickname.node.active = !this.IsMySeat;
        this.uirc.textNickname.string = name;
        // let mTmpWidth: number = 0;
        // if (this.uirc.textNickname.preferredWidth > 0 && this.uirc.textNickname.preferredWidth < this.uirc.textNickname.rectTransform.sizeDelta.x)
        //     mTmpWidth = textNickname.preferredWidth + 36;
        // else if (textNickname.preferredWidth >= textNickname.rectTransform.sizeDelta.x)
        //     mTmpWidth = textNickname.rectTransform.sizeDelta.x;
        //imageNicknameShadow.rectTransform.sizeDelta = new Vector2(mTmpWidth, textNickname.fontSize );
    }

    public get IsMySeat(): boolean {
        if (null == this.Player) {
            return false;
        }
        return this.Player.userID == GameCache.Instance.CurGame.mainPlayer.userID && this.seatID == GameCache.Instance.CurGame.mainPlayer.seatID;
    }


    public FoldHeadGray(active: boolean): void {
        this.uirc.imageHeadGray.node.active = active;
        if (this.IsMySeat) {
            let mCardUiInfo: CardUIInfo = null;
            for (let i = 0, n = this.uirc.listCardUIInfos.length; i < n; i++) {
                mCardUiInfo = this.uirc.listCardUIInfos[i];
                if (null == mCardUiInfo)
                    continue;

                mCardUiInfo.imageSelect.node.active = false;

                mCardUiInfo.imageCard.color = active ? cc.Color.GRAY : cc.Color.WHITE;
            }
        }
    }

    /// <summary>
    /// 播放allin动画
    /// </summary>
    public PlayAllinArmature(isAllinShowVoice = false): void {
        if (isAllinShowVoice) {
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_ALLIN);
        }
        // armatureAllin.gameObject.SetActive(true);
        // if (null != armatureAllin.dragonAnimation) {
        //     armatureAllin.dragonAnimation.Reset();
        //     armatureAllin.dragonAnimation.Play();
        // }
    }
    /// <summary>
    /// 播放赢牌头像特效
    /// </summary>
    public PlayWinArmature(): void {
        // UpdateWinCoin();

        // if (!Player.isWin) {
        //     return;
        // }
        // transWinner.gameObject.SetActive(true);
        // if (IsMySeat) {
        //     armatureYouWin.gameObject.SetActive(true);
        // }
        // else {
        //     armatureYouWin.gameObject.SetActive(false);
        // }
    }

    /// <summary>
    /// 刷新回收赢的筹码
    /// </summary>
    public UpdateRecyclingWinChip(): void {
        //this.uirc.imageRecyclingWinChip.sprite = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");
    }

    /// <summary>
    /// 隐藏气泡
    /// </summary>
    public HideBubble(): void {
        if (this.uirc.imageBubble.node.activeInHierarchy) {
            if (null == this.sequenceUpdateBubble || !this.sequenceUpdateBubble.IsPlaying) {
                this.uirc.imageBubble.node.color = cc.Color.WHITE;
                this.uirc.imageBubble.node.setScale(1, 1);
            }
        }
        cc.log(">>>>>>>> 隐藏气泡");
        this.tweenerHideBubble = { tween: cc.tween(this.uirc.imageBubble.node), IsPlaying: true }
        let tween = this.tweenerHideBubble.tween;
        tween.to(.2, { scale: 0 })
        tween.delay(1);
        tween.call(() => {
            this.uirc.imageBubble.node.active = false;
            this.UpdateNickname();
            this.tweenerHideBubble.IsPlaying = false;
        });
        tween.start();
        // if (this.uirc.Image_BubbleInsuranceNum.gameObject.activeInHierarchy) {
        //     this.uirc.Image_BubbleInsuranceNum.gameObject.SetActive(false);
        // }
        // if (this.uirc.Image_BubbleInsuranceToubao.gameObject.activeInHierarchy) {
        //     this.uirc.Image_BubbleInsuranceToubao.gameObject.SetActive(false);
        // }
        this.HideBubbleInsurance();
        this.HideBubbleInsuranceCountDown();
    }


    /// <summary>
    /// 播放赢了回收筹码动画
    /// </summary>
    public get CanPlayRecyclingWinChipAnimation(): boolean {
        return this.uirc.imageIconChip.node.activeInHierarchy;
    }

    /// <summary>
    /// 播放赢了回收筹码动画
    /// </summary>
    /// <returns></returns> Tweener
    public PlayRecyclingWinChipAnimation(sourcePos: cc.Vec3): any {

        this.tweenerPlayRecyclingWinChipAnimation = null;

        if (this.Player.recyclingChip > 0)//回收筹码大于零时，执行动画
        {

            let imageRecyclingWinChip = this.uirc.imageRecyclingWinChip;

            imageRecyclingWinChip.node.setPosition(imageRecyclingWinChip.node.parent.convertToNodeSpaceAR(sourcePos));

            this.tweenerPlayRecyclingWinChipAnimation = { tween: cc.tween(imageRecyclingWinChip.node) };

            let tween = this.tweenerPlayRecyclingWinChipAnimation.tween;

            tween.then(cc.callFunc(() => {
                imageRecyclingWinChip.node.active = true;
            }));
            let pos = GameUtil.ChangeToLocalPos(this.uirc.imageHeadFrame.node.position, this.uirc.imageHeadFrame.node.parent, this.ui);
            tween.to(.5, { position: pos });
            tween.call(() => {
                imageRecyclingWinChip.node.active = false;
                this.tweenerPlayRecyclingWinChipAnimation.IsPlaying = false;
            });

            (this.tweenerPlayRecyclingWinChipAnimation as any).duration = 0.5;
        }
        return this.tweenerPlayRecyclingWinChipAnimation;
    }


    /// <summary>
    /// 播放更新气泡动画
    /// </summary>
    protected PlayUpdateBubbleAnimation(): void {
        this.sequenceUpdateBubble = { tween: cc.tween(this.uirc.imageBubble.node), IsPlaying: true };
        let tween = this.sequenceUpdateBubble.tween;
        this.uirc.imageBubble.node.setScale(.8, .8);
        this.uirc.imageBubble.node.opacity = 0;
        //自己仅有弃牌的图标可见
        this.uirc.imageBubble.node.active = (!(this.IsMySeat && this.Player.actionStatus != Def.Action.FOLD));
        tween.parallel(cc.scaleTo(.2, 1, 1), cc.fadeTo(0.1, 255));
        tween.to(.1, { scale: 0.95 });
        tween.to(.1, { scale: 1 });
        tween.call(() => {
            this.sequenceUpdateBubble.IsPlaying = false;
        })
        tween.start();
    }
    /// <summary>
    /// 显示返回游戏、留座
    /// </summary>
    public ShowReturnGame(): void {
        this.bKeepSeatCounting = true;

        if (GameCache.Instance.CurGame.mainPlayer.userID == this.Player.userID) {
            this.uirc.buttonCancelReserveSeat.active = true;
        }
        this.uirc.imageReserveSeat.active = true;
    }
    /// <summary>
    /// 隐藏返回游戏、留座
    /// </summary>
    public HideReturnGame(): void {
        this.bKeepSeatCounting = false;
        this.uirc.buttonCancelReserveSeat.active = false;
        this.uirc.imageReserveSeat.active = false;
    }



    /// <summary>
    /// 隐藏保险冒泡
    /// </summary>
    public HideBubbleInsuranceCountDown(): void {
        //if (null != this.uirc.textBubbleInsuranceCountDown)
        //this.uirc.imageBubbleInsuranceCountDown.gameObject.SetActive(false);
    }
    public HideBubbleInsurance(): void {
        //if (imageBubbleInsurance.gameObject.activeInHierarchy) {
        //  imageBubbleInsurance.gameObject.SetActive(false);
        //}
    }


    /// <summary>
    /// 本轮结束，清理数据。（不是全部数据清空，只需要缓存一手的数据清空）
    /// </summary>
    public ClearRoundEndData(): void {
        if (null != this.Player) {
            this.Player.ClearRoundEndData();
        }
        this.isSmall = false;
        this.isBig = false;
        this.isBank = false;
        this.isStraddle = false;
        this.optCurTime = 0;
        this.optTotalTime = 0;
        this.isCountDown = false;
        this.defaultIconChipLocalPos = cc.Vec3.ZERO;
    }

    /// <summary>
    /// 清空本手下注筹码
    /// </summary>
    public ClearCurRoundHaveBet(): void {
        this.uirc.textCurRoundHaveBet.string = "";
        this.uirc.transCurRoundHaveBet.active = false;
    }
    /// <summary>
    /// 清空数据
    /// </summary>
    public ClearData(): void {
        this.ClientSeatId = -1;
        this.seatID = -1;
        if (null != this.Player) {
            this.Player.Dispose();
            this.Player = null;
        }
        this.isSmall = false;
        this.isBig = false;
        this.isBank = false;
        this.isStraddle = false;
        this.keepSeatLeftTime = 0;

        this.optCurTime = 0;
        this.optTotalTime = 0;
        this.isCountDown = false;
        this.defaultIconChipLocalPos = cc.Vec3.ZERO;
        this.bKeepSeatCounting = false;
        this.keepSeatDeltaTime = 0;
        this.voiceprintTime = 0;
        this.UpdateVoiceprintState(VoiceprintState.None);
    }
    /// <summary>
    /// 删除所有Tweener动画
    /// </summary>
    /// <param name="complete">true马上设置为结束值</param>
    public KillAllTweener(complete = false): void {
        if (null != this.tweenerPlayRecyclingWinChipAnimation && this.tweenerPlayRecyclingWinChipAnimation.IsPlaying) {
            this.tweenerPlayRecyclingWinChipAnimation.Kill(complete);
        }
        this.tweenerPlayRecyclingWinChipAnimation = null;

        // if (null != sequencePlayRecyclingChipAnimation && sequencePlayRecyclingChipAnimation.IsPlaying()) {
        //     sequencePlayRecyclingChipAnimation.Kill(complete);
        // }

        // sequencePlayRecyclingChipAnimation = null;

        // if (null != sequencePlayDealAnimation && sequencePlayDealAnimation.IsPlaying()) {
        //     sequencePlayDealAnimation.Kill(complete);
        // }

        // sequencePlayDealAnimation = null;

        // if (null != sequenceSitAnimationEnter && sequenceSitAnimationEnter.IsPlaying()) {
        //     sequenceSitAnimationEnter.Kill(complete);
        // }

        // sequenceSitAnimationEnter = null;

        // if (null != sequenceStandupAnimationEnter && sequenceStandupAnimationEnter.IsPlaying()) {
        //     sequenceStandupAnimationEnter.Kill(complete);
        // }

        // sequenceStandupAnimationEnter = null;

        // if (null != tweenerPlayBankerAnimation && tweenerPlayBankerAnimation.IsPlaying()) {
        //     tweenerPlayBankerAnimation.Kill(complete);
        // }

        // tweenerPlayBankerAnimation = null;

        // if (null != tweenerPlayBetAnimation && tweenerPlayBetAnimation.IsPlaying()) {
        //     tweenerPlayBetAnimation.Kill(complete);
        // }

        // tweenerPlayBetAnimation = null;

        // if (null != sequencePlayFoldAnimation && sequencePlayFoldAnimation.IsPlaying()) {
        //     sequencePlayFoldAnimation.Kill(complete);
        // }

        // sequencePlayFoldAnimation = null;

        // if (null != this.sequenceUpdateBubble && sequenceUpdateBubble.IsPlaying()) {
        //     sequenceUpdateBubble.Kill(complete);
        // }

        // sequenceUpdateBubble = null;

        // if (null != tweenerHideBubble && tweenerHideBubble.IsPlaying()) {
        //     tweenerHideBubble.Kill(complete);
        // }

        // tweenerHideBubble = null;

        // if (null != tweenerUpdateBubbleInsurance && tweenerUpdateBubbleInsurance.IsPlaying()) {
        //     tweenerUpdateBubbleInsurance.Kill(complete);
        // }

        // tweenerUpdateBubbleInsurance = null;
    }

    Dispose() {
        if (this.IsDisposed) {
            return;
        }

        this.KillAllTweener();

        if (null != this.FsmLogicComponent) {
            this.FsmLogicComponent.stop();
        }

        //this.ClearUI();
        this.ClearData();

    }
}
export interface SeatUIInfo {
    Pos: cc.Vec3;
    BankerPos: cc.Vec3;
    CardBackPos: cc.Vec3;
    CardBackRot: cc.Vec3;
    CardsPos: cc.Vec3;
    CurRoundHaveBetPos: cc.Vec3;
    BubblePos: cc.Vec3;
    InsurancePos: cc.Vec3;
    AoMaHaInsurancePos: cc.Vec3;
    InsurancebubaoPos: cc.Vec3;
    AoMaHaInsurancebubaoPos: cc.Vec3;
    InsurancetoubaoPos: cc.Vec3;
    AoMaHaInsurancetoubaoPos: cc.Vec3;
}

