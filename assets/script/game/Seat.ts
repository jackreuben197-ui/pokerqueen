import { RoomType } from "../define/EIDefine";
import UpdateComponent from "../funcomponent/UpdateComponent";
import WebImageHelper from "../helper/WebImageHelper";
import { UIMineModel } from "../lobby/UIMineModel";
import GameCache from "../manager/GameCache";
import LobbySession from "../session/LobbySession";
import { StateHandler } from "../statemachine/StateHandler";
import { CPlayer } from "./CPlayer";
import FSMLogicComponent from "./FSMLogicComponent";
import { SeatFSM } from "./SeatFSM";
import { SeatEmpty, SeatSit } from "./SeatStateHandler";
import SeatUIRC from "./SeatUIRC";

export default class Seat {

    public fsm: SeatFSM = null;

    // ui
    protected imageBanker: cc.Sprite = null;
    protected transSmallCardBacks: cc.Node = null;
    protected transCurRoundHaveBet: cc.Node = null;
    protected armatureVoice: cc.Node = null;




    public FsmLogicComponent: FSMLogicComponent;//状态机


    public ClientSeatId: number;    // 客户端座位号

    public seatID: number   // 服务器座位号

    public Player: CPlayer;  // 玩家信息

    public isSmall: boolean; // 是否小盲
    public isBig: boolean;    // 是否大盲
    public isBank: boolean;  // 是否庄家
    public isStraddle: boolean;// 是否Straddle

    public keepSeatLeftTime: number;  // 留座剩余时间（s）
    public ranking: number;   //玩家排名(mtt)
    private voiceprintTime: number;
    private OriginalVoicePos: cc.Vec3;
    //private Transform OriginalVoiceObj;


    public seatUIInfo: SeatUIInfo;

    protected PlayerCount: number;//最大人数

    public uirc: SeatUIRC = null;

    constructor(public id: number, public ui: cc.Node) {

        this.fsm = new SeatFSM(id, this);

        this.uirc = ui.getComponent(SeatUIRC);

        UpdateComponent.Add(this.FsmLogicComponent = new FSMLogicComponent(), this.fsm);

        this.RegiterTouchEvents();

    }

    public Clear() {

        this.ui = null;

        this.fsm = null;

        UpdateComponent.Remove(this.FsmLogicComponent);

    }

    RegiterTouchEvents() {
        //this.uirc.imageEmpty.node.on("click", this.onEmptyClick, this);
    }
    UnRegiterTouchEvents() {

    }


    onEmptyClick() {

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
        //Trans.localPosition = info.Pos;

        // this.imageBanker.node.setPosition(info.BankerPos);
        // this.transSmallCardBacks.setPosition(info.CardBackPos);
        // this.transCurRoundHaveBet.setPosition(info.CurRoundHaveBetPos);


        // if (this.ui.x > 0) {
        //     this.armatureVoice.setPosition(-90, 50, 0);
        // }
        // else {
        //     this.armatureVoice.setPosition(90, 50, 0);
        // }


        // 	RectTransform mRectTransform = imageBubble.rectTransform;
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
        // if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode()) {
        //     mRectTransform.localPosition = info.AoMaHaInsurancePos;
        // }
        // else {
        //     mRectTransform.localPosition = info.InsurancePos;
        // }
        // //
        // mRectTransform = Image_BubbleInsuranceNum.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        // if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode()) {
        //     mRectTransform.localPosition = info.AoMaHaInsurancebubaoPos;
        // }
        // else {
        //     mRectTransform.localPosition = info.InsurancebubaoPos;
        // }
        // //
        // mRectTransform = Image_BubbleInsuranceToubao.rectTransform;
        // mRectTransform.SetParent(transBubble);
        // mRectTransform.anchorMin = new Vector2(0.5f, 0.5f);
        // mRectTransform.anchorMax = new Vector2(0.5f, 0.5f);
        // if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof.GetHashCode() && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit.GetHashCode()) {
        //     mRectTransform.localPosition = info.AoMaHaInsurancetoubaoPos;
        // }
        // else {
        //     mRectTransform.localPosition = info.InsurancetoubaoPos;
        // }
        // if (IsMySeat) {
        //     WaitforthenextmoveTips.GetComponent<Text>().text = $"{CPErrorCode.LanguageDescription(20090)}";
        //     WaitforthenextmoveTips.localPosition = new Vector3(0, -416);
        // }
        // else {
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
        // this.SetNickname(null == this.Player ? "" : CacheDataManager.mInstance.GetRemarkName((int)Player.userID, Player.nick));
        // // textNickname.text = null == Player ? string.Empty : CacheDataManager.mInstance.GetRemarkName(Player.userID, Player.nick);
        // if (null != this.Player) {
        //     this.uirc.textNickname.node.color = cc.Color.WHITE;
        // }
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

