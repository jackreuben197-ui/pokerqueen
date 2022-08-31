import { RoomType } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import WebImageHelper from "../helper/WebImageHelper";
import { LanguageCode } from "../i18n/LanguageCode";
import { UIMineModel } from "../lobby/UIMineModel";
import { Def } from "../protobuf/holdem/define_pb";
import { CacheDataManager } from "./CacheDataManager";
import { CPlayer } from "./CPlayer";
import FSMLogicComponent from "./FSMLogicComponent";
import { GameCache } from "./GameCache";
import GameUtil from "./GameUtil";
import { SeatFSM } from "./SeatFSM";
import { SeatEmpty, SeatSit } from "./SeatStateHandler";
import SeatUIRC, { CardUIInfo } from "./SeatUIRC";

export default class Seat {

    public fsm: SeatFSM = null;

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


    protected defaultIconChipLocalPos: cc.Vec3 = null;


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



    public seatUIInfo: SeatUIInfo = null;

    protected PlayerCount: number = 0;//最大人数

    public uirc: SeatUIRC = null;

    constructor(public id: number, public ui: cc.Node) {

        this.fsm = new SeatFSM(id, this);

        this.uirc = ui.getComponent(SeatUIRC);

        this.uirc.seat = this;

        UpdateComponent.Add(this.FsmLogicComponent = new FSMLogicComponent(), this.fsm);

        this.RegiterTouchEvents();

        this.InitUIStaticData();

    }

    public Clear() {

        this.ui = null;

        this.fsm = null;

        this.UnRegiterTouchEvents();

        UpdateComponent.Remove(this.FsmLogicComponent);

    }

    RegiterTouchEvents() {
        this.uirc.imageEmpty.node.on("click", this.onClickEmpty, this);
        this.uirc.rawimageHead.node.on("click", this.onClickEmpty, this);
    }
    UnRegiterTouchEvents() {
        this.uirc.imageEmpty.node.off("click", this.onClickEmpty, this);
        this.uirc.rawimageHead.node.off("click", this.onClickEmpty, this);
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


    onClickEmpty() {

        UIMineModel.mInstance.ObtainUserInfo(pDto => {
            if (pDto.user.forbid_bring_in == 1) {
                // UIComponent.Instance.ShowNoAnimation(UIType.UIDialog,
                //     new UIDialogComponent.DialogData()
                // 				{
                //         type = UIDialogComponent.DialogData.DialogType.Commit,
                //         title = "",

                //         content = LanguageManager.Get("UIForbidBringInTips"),
                //         // contentCommit = "确定",
                //         contentCommit = CPErrorCode.LanguageDescription(10012),
                //         actionCommit = () => { },
                //         actionCancel = null
                //     });
                return;
            }
            else {
                GameCache.Instance.CurGame.Sitdown(this.ClientSeatId, true);
            }
        });
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
            //this.armatureVoice.setPosition(-90, 50, 0);
        }
        else {
            //this.armatureVoice.setPosition(90, 50, 0);
        }

        // RectTransform mRectTransform = imageBubble.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        // mRectTransform.localPosition = info.BubblePos;


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
        // if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode())
        // {
        //     mRectTransform.localPosition = info.AoMaHaInsurancetoubaoPos;
        // }
        // else
        // {
        //     mRectTransform.localPosition = info.InsurancetoubaoPos;
        // }
        // if (IsMySeat)
        // {
        //     WaitforthenextmoveTips.GetComponent<Text>().text = $"{CPErrorCode.LanguageDescription(20090)}";
        //     WaitforthenextmoveTips.localPosition = new Vector3(0, -416);
        // }
        // else
        // {
        //     WaitforthenextmoveTips.GetComponent<Text>().text = $"{CPErrorCode.LanguageDescription(20091)}";
        //     WaitforthenextmoveTips.localPosition = new Vector3(0, -240);
        // }

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

        // switch (Player.actionStatus) {
        //     case Def.Types.Action.None:
        //         // 未操作过(显示名字)
        //         FsmLogicComponent.SM.ChangeState(SeatWaitStart<Entity>.Instance);
        //         break;
        //     case Def.Types.Action.Bet:
        //         // 下注
        //         // FsmLogicComponent.SM.ChangeState(SeatPutChip<Entity>.Instance);
        //         FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
        //         break;
        //     case Def.Types.Action.Call:
        //         // 跟注
        //         // FsmLogicComponent.SM.ChangeState(SeatCall<Entity>.Instance);
        //         UpdateCards();
        //         FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
        //         break;
        //     case Def.Types.Action.Raise:
        //         // 加注
        //         // FsmLogicComponent.SM.ChangeState(SeatRaise<Entity>.Instance);
        //         FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
        //         break;
        //     case Def.Types.Action.Allin:
        //         // 全下
        //         // FsmLogicComponent.SM.ChangeState(SeatAllin<Entity>.Instance);
        //         UpdateCards();
        //         FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
        //         break;
        //     case Def.Types.Action.Check:
        //         // 让牌
        //         // FsmLogicComponent.SM.ChangeState(SeatCheck<Entity>.Instance);
        //         FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
        //         break;
        //     case Def.Types.Action.Fold:
        //         // 弃牌
        //         // FsmLogicComponent.SM.ChangeState(SeatFold<Entity>.Instance);
        //         Player.isFold = true;
        //         FoldHeadGray(Player.isFold);
        //         UpdateCards();
        //         HideCardBack();
        //         FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
        //         break;

        // }
        // switch (Player.canPlayStatus) {
        //     case Def.Types.CanPlayStatus.Disable:
        //         FsmLogicComponent.SM.ChangeState(SeatWaitStart<Entity>.Instance);
        //         break;
        //     case Def.Types.CanPlayStatus.Normal:
        //         break;
        //     case Def.Types.CanPlayStatus.NeedPost:
        //         break;
        //     case Def.Types.CanPlayStatus.AgreePost:
        //         break;
        //     case Def.Types.CanPlayStatus.KeepSeat:
        //         FsmLogicComponent.SM.ChangeState(SeatKeep<Entity>.Instance);
        //         break;
        //     default:
        //         break;
        // }
    }

    /// <summary>
    /// 刷新气泡
    /// </summary>
    public UpdateBubble(isAllinShowVioce = false, isReconect = false): void {
        // 1.出现筹码时隐藏昵称
        // 2.操作提示与牌型提示，只出现一个则与头像居中对齐，出现两个则以居中对齐的线对称上下摆放

        // 1:下注  2:跟注  3:加注  4:全下 5:让牌  6:弃牌 10:straddle--客户端
        /** 
        if (null == Player) {
            if (imageBubble.gameObject.activeInHierarchy)
                imageBubble.gameObject.SetActive(false);
            return;
        }

        if (isReconect && !Player.RoundActioned) {
            return;
        }
        // SetNickname(string.Empty); // 气泡时，不显示昵称，避免重叠

        switch (Player.actionStatus) {
            case Def.Types.Action.Call:
                if (!GetRorL()) {

                    imageBubble.sprite = rc.Get<Sprite>("icon_image_game_genzhu_r");
                }
                else {

                    imageBubble.sprite = rc.Get<Sprite>("match_icon_genzhu");
                }

                // textBubble.text = "跟注";
                textBubble.text = CPErrorCode.LanguageDescription(10044);
                textBubble.gameObject.SetActive(true);
                StopAllinArmature();
                break;
            case Def.Types.Action.Bet:
            case Def.Types.Action.Raise:
                if (!GetRorL()) {
                    imageBubble.sprite = rc.Get<Sprite>("icon_jiazhur");
                }
                else {
                    imageBubble.sprite = rc.Get<Sprite>("match_icon_jiazhu");

                }

                // textBubble.text = "加注";
                textBubble.text = CPErrorCode.LanguageDescription(10045);
                textBubble.gameObject.SetActive(true);
                StopAllinArmature();
                break;
            case Def.Types.Action.Allin:
                if (!GetRorL()) {
                    imageBubble.sprite = rc.Get<Sprite>("icon_image_game_allin_r");
                }
                else {
                    imageBubble.sprite = rc.Get<Sprite>("match_icon_allin");
                }

                textBubble.text = "All in";
                textBubble.gameObject.SetActive(true);
                PlayAllinArmature(isAllinShowVioce);
                break;
            case Def.Types.Action.Check:
                if (!GetRorL()) {
                    imageBubble.sprite = rc.Get<Sprite>("icon_image_game_rangpai_r");
                }
                else {
                    imageBubble.sprite = rc.Get<Sprite>("match_icon_kanpai");
                }

                // textBubble.text = "看牌";
                textBubble.text = CPErrorCode.LanguageDescription(10046);
                textBubble.gameObject.SetActive(true);
                StopAllinArmature();
                break;
            case Def.Types.Action.Fold:
                if (!GetRorL()) {
                    imageBubble.sprite = rc.Get<Sprite>("icon_image_game_qipai_r");
                }
                else {
                    imageBubble.sprite = rc.Get<Sprite>("match_icon_qipai");
                }

                // textBubble.text = "弃牌";
                textBubble.text = CPErrorCode.LanguageDescription(10047);
                textBubble.gameObject.SetActive(true);
                StopAllinArmature();
                break;
            case Def.Types.Action.Straddle:
                if (!GetRorL()) {
                    imageBubble.sprite = rc.Get<Sprite>("match_icon_straddle");

                }
                else {
                    imageBubble.sprite = rc.Get<Sprite>("icon_image_game_straddle_r");
                }

                textBubble.text = "Straddle";
                textBubble.gameObject.SetActive(false);
                StopAllinArmature();
                break;
            //case (int)Def.Types.Action.:
            //    if (!GetRorL())
            //    {
            //        imageBubble.sprite = rc.Get<Sprite>("icon_image_game_genzhu_r");

            //    }
            //    else
            //    {
            //        imageBubble.sprite = rc.Get<Sprite>("match_icon_genzhu"); 
            //    } 
            //    // textBubble.text = "盖牌";
            //    textBubble.text = CPErrorCode.LanguageDescription(10048);
            //    textBubble.gameObject.SetActive(false);
            //    StopAllinArmature();
            //    break;
            default:
                imageBubble.sprite = null;
                textBubble.text = string.Empty;
                StopAllinArmature();
                break;
        }


        if (null == imageBubble.sprite) {
            imageBubble.color = Color.white;
            imageBubble.transform.localScale = new Vector3(1, 1, 1);
            imageBubble.gameObject.SetActive(false);
            sequenceUpdateBubble = null;
            UpdateNickname();
        }
        else {
            // imageBubble.SetNativeSize();
            if (!string.IsNullOrEmpty(textBubble.text)) {
                //(imageBubble.transform as RectTransform).sizeDelta = new Vector2(textBubble.preferredWidth + 26, 57);
                if (null == sequenceUpdateBubble || !sequenceUpdateBubble.IsPlaying())
                    PlayUpdateBubbleAnimation();
            }
            else {
                if (null != sequenceUpdateBubble && sequenceUpdateBubble.IsPlaying())
                    sequenceUpdateBubble.Kill(true);

                imageBubble.color = Color.white;
                imageBubble.transform.localScale = new Vector3(1, 1, 1);
                imageBubble.gameObject.SetActive(false);
                sequenceUpdateBubble = null;
            }
        }
        **/
    }
    /// <summary>
    /// 刷新离线
    /// </summary>
    public UpdateOnOrOffLine(): void {
        let mEnumRoomType: RoomType = GameCache.Instance.room_type;
        // if (mEnumRoomType == RoomType.MTTTexasHoldemStandardNoLimit) {
        //     this.imageOffline.gameObject.SetActive(false);
        //     return;
        // }
        // if (this.imageReserveSeat.gameObject.activeInHierarchy) {
        //     this.imageOffline.gameObject.SetActive(false);
        // }
        // else {
        //     this.imageOffline.gameObject.SetActive(this.Player.isOffLine > 0 && !this.IsMySeat);
        // }
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

        this.uirc.imageIconChip.node.getPosition(this.defaultIconChipLocalPos);
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
    public PlayBetAnimation(): Function {
        let pos = cc.v3();
        this.uirc.imageEmpty.node.getPosition(pos);
        this.uirc.imageIconChip.node.setPosition(GameUtil.ChangeToLocalPos(pos, this.ui, this.uirc.transCurRoundHaveBet));
        this.uirc.imageIconChip.node.active = true;
        return () => {
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_POST_RAISE);
            cc.tween(this.uirc.imageIconChip.node).to(.2, { position: this.defaultIconChipLocalPos }).start();
        }
    }


    /// <summary>
    /// 播放庄家动画
    /// </summary>
    /// <returns></returns>
    public PlayBankerAnimation(): cc.Tween {
        if (GameCache.Instance.CurGame.lastBankerIndex == -1 || this.seatID == GameCache.Instance.CurGame.lastBankerIndex)
            return null;

        let mSeat: Seat = GameCache.Instance.CurGame.GetSeatByLocalSeatID(GameCache.Instance.CurGame.lastBankerIndex);
        if (null == mSeat) return null;

        mSeat.uirc.imageBanker.active = false;
        this.uirc.imageBanker.setPosition(GameUtil.ChangeToLocalPos(mSeat.seatUIInfo.BankerPos, mSeat.ui, this.ui));
        this.uirc.imageBanker.active = true;
        //return imageBanker.transform.DOLocalMove(seatUIInfo.BankerPos, 0.3f);
        let tween = cc.tween(this.uirc.imageBanker);
        return tween.to(.3, { position: this.seatUIInfo.BankerPos });
    }


    /// <summary>
    /// 播放回收筹码动画
    /// </summary>
    public PlayRecyclingChipAnimation(): Function {
        let func = null;
        if (this.uirc.imageIconChip.node.activeInHierarchy) {
            this.uirc.textCurRoundHaveBet.node.active = false;
            let pos = this.uirc.textCurRoundHaveBet.node.convertToNodeSpaceAR(GameCache.Instance.CurGame.GetRecyclingChipPosV3());
            func = () => {
                //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_MOVE_CHIPS);
                cc.tween(this.uirc.imageIconChip.node).to(.5, { position: pos }).call(() => {
                    this.uirc.imageIconChip.node.active = false;
                }).start();
            };
        }
        return func;
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
    public PlayDealAnimation(targetPos: cc.Vec3): cc.Tween {
        for (let i = 0, n = this.uirc.listCardUIInfos.length; i < n; i++) {
            this.uirc.listCardUIInfos[i].imageSelect.node.active = false;
        }
        for (let i = 0, n = this.uirc.listSmallCardUIInfos.length; i < n; i++) {
            this.uirc.listSmallCardUIInfos[i].imageSelect.node.active = false;
        }

        let sequenceTween = cc.tween(this.ui);

        let sequence: any[] = [];

        if (GameCache.Instance.CurGame.mainPlayer.seatID != this.seatID) {
            // 其他玩家发牌动画
            //sequencePlayDealAnimation = DOTween.Sequence();
            //let sequencePlayDealAnimation: { sequence: {}[], time }[] = [];

            sequence.push(cc.callFunc(() => {
                this.uirc.transSmallCardBacks.active = true;
            }));

            //cc.spawn()
            let spawns: cc.Tween<cc.Node>[] = [];
            let mLocalPos: cc.Vec3 = this.uirc.transSmallCardBacks.convertToNodeSpaceAR(targetPos);
            for (let i = 0, n = this.uirc.listImageSmallCardBack.length; i < n; i++) {
                this.uirc.listImageSmallCardBack[i].node.setPosition(mLocalPos);
                let mTmpObj: cc.Node = this.uirc.listImageSmallCardBack[i].node;
                let pos = this.GetBackSmallCardPos(i);
                let tween_child = cc.tween(mTmpObj);
                //cc.tween(mTmpObj).to(0.4, { position: this.GetBackSmallCardPos(i) });
                tween_child.sequence(cc.callFunc(() => {
                    //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_NEW_CARD);
                    mTmpObj.active = true;
                }), cc.moveTo(0.4, pos.x, pos.y))
                spawns.push(tween_child);

            }
            // sequencePlayDealAnimation.spawn.unshift(
            //     () => {
            //         this.uirc.transSmallCardBacks.active = true;
            //     }
            // );

            //sequence.push(cc.spawn(...spawns))
            sequenceTween.sequence(cc.delayTime(0), sequence[0]).parallel.apply(this.ui, spawns);

            return sequenceTween;
        }
        else {
            //sequencePlayDealAnimation = DOTween.Sequence();
            try {
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
                    if (i == 0) {
                        // sequencePlayDealAnimation = {
                        //     type: 1,
                        //     spawn: [
                        //         () => {
                        //             //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_NEW_CARD);
                        //             cc.tween(this.uirc.listCardUIInfos[i].imageCard).to(0.4, { position: Seat.myCardsPos[i] }).start()
                        //         },

                        //     ], time: 0.4
                        // };
                    }
                    else {
                        // sequencePlayDealAnimation.spawn.push(
                        //     () => {
                        //         cc.tween(this.uirc.listCardUIInfos[i].imageCard).to(0.4, { position: Seat.myCardsPos[i] }).start();
                        //     }
                        // );
                    }

                    let tmp = i;
                    //
                    if (!GameCache.Instance.CurlimitDelaySeeCard) {
                        // sequencePlayDealAnimation.spawn.push(
                        //     () => {
                        //         cc.tween(this.uirc.listCardUIInfos[i].imageBack.node).to(0.25, { opacity: 0 }).call(() => {
                        //             this.uirc.listCardUIInfos[tmp].imageBack.node.active = false;
                        //         }).start();
                        //     }
                        // );
                    }
                    // sequencePlayDealAnimation.spawn.push(() => {
                    //     cc.tween(this.uirc.listCardUIInfos[i].imageCard).to(0.4, { scaleX: 1.5, scaleY: 1.3 }).start();
                    // });

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

                //     for (int i = 0; i < Player.cards.Count; i++)
                //     {
                //         logContent.Append(string.Format("Player.cards:= {0},", Player.cards[i]));
                //     }
                // }
                // Log.write(UnityEngine.LogType.Log, logContent.ToString());
            }
            // sequencePlayDealAnimation.OnStart(() => {

            // });
            return sequenceTween;
        }
    }




    public UpdateImageBackActive(istrue: boolean = false): void {
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            //if (listCardUIInfos[i].imageBack.gameObject.activeInHierarchy)
            //{
            this.uirc.listCardUIInfos[i].imageBack.node.active = istrue;
            //}
        }
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
            this.uirc.WaitforthenextmoveTips.string = `${LanguageCode.LanguageDescription(20090)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -416);
        }
        else {
            this.uirc.WaitforthenextmoveTips.string = `${LanguageCode.LanguageDescription(20091)}`;
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

