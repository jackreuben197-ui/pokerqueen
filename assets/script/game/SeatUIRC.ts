
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { i18nMgr } from "../i18n/i18nMgr";
import { UIMineModel } from "../lobby/UIMineModel";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ClientMessageKeepSeatActive } from "../protobuf/holdem/req_keep_seat_active_pb";
import { ClientMessageShowdown } from "../protobuf/holdem/req_showdown_pb";
import UIDialogComponent, { UIDialogParam } from "../ui/dialog/UIDialogComponent";
import UIBase from "../ui/UIBase";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import GameUtil from "./GameUtil";
import Seat, { VoiceprintState } from "./seat/Seat";
import { AddClipsData } from "./ui/UIAddChipsComponent";


export class CardUIInfo {
    public imageSelect: cc.Sprite = null;
    public imageBack: cc.Sprite = null;
    public imageEye: cc.Sprite = null;
    public cardId: number;
    constructor(public imageCard: cc.Node) {
        this.imageSelect = imageCard.getChildByName("Image_SelectCard")?.getComponent(cc.Sprite);
        this.imageBack = imageCard.getChildByName("Image_CardBack")?.getComponent(cc.Sprite);
        this.imageEye = imageCard.getChildByName("Image_EyeCard")?.getComponent(cc.Sprite);
    }
    SetSpriteFrame(cardId: number) {
        this.cardId = cardId;
        this.UpdateSpriteFrame();
    }
    UpdateSpriteFrame() {
        this.imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(this.cardId));
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeatUIRC extends UIBase {

    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    Head: cc.Node = null;
    imageHeadFrame: cc.Sprite = null;
    imageHeadGray: cc.Sprite = null;
    imageEmpty: cc.Sprite = null;
    rawimageHead: cc.Sprite = null;
    textCoin: cc.Label = null;
    //textCoinBg: cc.Sprite = null;
    textNickname: cc.Label = null;
    WaitforthenextmoveTips: cc.Label = null;


    transCurRoundHaveBet: cc.Node = null;
    imageIconChip: cc.Sprite = null;
    textCurRoundHaveBet: cc.Label = null;

    transSmallCardBacks: cc.Node = null;
    imageBanker: cc.Node = null;


    imageCountDown: cc.Sprite = null;
    Image_CountDownbg: cc.Sprite = null;
    image_CountDownTime: cc.Label = null;



    imageCardType: cc.Sprite = null;
    textCardType: cc.Label = null;
    imageSmallCardType: cc.Sprite = null;
    textSmallCardType: cc.Label = null;


    imageRecyclingWinChip: cc.Sprite = null;

    buttonCancelReserveSeat: cc.Node = null;
    textCancelReserveSeat: cc.Label = null;


    imageReserveSeat: cc.Node = null;

    m_ReserveTime: cc.Label = null;

    imageOffline: cc.Node = null;

    imageBubble: cc.Sprite = null;
    textBubble: cc.Label = null;

    //用来设置操作面板的位置
    Operation_Pos_Mark: cc.Node = null;
    ///////////////////////////////////

    ///////////////////////////////////
    /**
     * 声明内容
     */
    public seat: Seat = null;

    public voiceprintList: cc.Node[];

    //主玩家手牌节点列表
    imageCards: CardUIInfo[];
    imageSmallCards: CardUIInfo[];
    imageSmallCardBacks: cc.Sprite[];



    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.Head = this.getChildNodeOrComponent("Head");
        this.imageHeadFrame = this.getChildNodeOrComponent("Image_HeadFrame", cc.Sprite);
        this.imageHeadGray = this.getChildNodeOrComponent("Image_HeadGray", cc.Sprite);
        this.imageEmpty = this.getChildNodeOrComponent("Image_Empty", cc.Sprite);
        this.rawimageHead = this.getChildNodeOrComponent("RawImage_Head", cc.Sprite);
        this.textCoin = this.getChildNodeOrComponent("Text_Coin", cc.Label);
        //this.textCoinBg = this.getChildNodeOrComponent("Text_Coin_Bg", cc.Sprite);
        this.textNickname = this.getChildNodeOrComponent("Text_Nickname", cc.Label);
        this.WaitforthenextmoveTips = this.getChildNodeOrComponent("WaitforthenextmoveTips", cc.Label);

        this.transCurRoundHaveBet = this.getChildNodeOrComponent("CurRoundHaveBet");
        this.imageIconChip = this.getChildNodeOrComponent("Image_IconChip", cc.Sprite);
        this.textCurRoundHaveBet = this.getChildNodeOrComponent("Text_CurRoundHaveBet", cc.Label);

        this.transSmallCardBacks = this.getChildNodeOrComponent("SmallCardBacks");
        this.imageBanker = this.getChildNodeOrComponent("Image_Banker");

        //当前最大6张
        this.imageCards = [];
        this.imageSmallCards = [];
        this.imageSmallCardBacks = [];
        for (let i = 0; i < 6; i++) {
            this.imageCards.push(new CardUIInfo(this.getChildNodeOrComponent(`Image_Card${i}`)));
            this.imageSmallCards.push(new CardUIInfo(this.getChildNodeOrComponent(`Image_SmallCard${i}`)));
            this.imageSmallCardBacks.push(this.getChildNodeOrComponent(`Image_SmallCardBack${i}`, cc.Sprite));
        }


        // this.imageCard0 = this.getChildNodeOrComponent("Image_Card0");
        // this.imageCard1 = this.getChildNodeOrComponent("Image_Card1");
        // this.imageCard2 = this.getChildNodeOrComponent("Image_Card2");
        // this.imageCard3 = this.getChildNodeOrComponent("Image_Card3");
        // this.imageCard4 = this.getChildNodeOrComponent("Image_Card4");
        // this.imageCard5 = this.getChildNodeOrComponent("Image_Card5");

        // this.imageSmallCard0 = this.getChildNodeOrComponent("Image_SmallCard0");
        // this.imageSmallCard1 = this.getChildNodeOrComponent("Image_SmallCard1");
        // this.imageSmallCard2 = this.getChildNodeOrComponent("Image_SmallCard2");
        // this.imageSmallCard3 = this.getChildNodeOrComponent("Image_SmallCard3");
        // this.imageSmallCard4 = this.getChildNodeOrComponent("Image_SmallCard4");
        // this.imageSmallCard5 = this.getChildNodeOrComponent("Image_SmallCard5");


        // this.imageSmallCardBack0 = this.getChildNodeOrComponent("Image_SmallCardBack0", cc.Sprite);
        // this.imageSmallCardBack1 = this.getChildNodeOrComponent("Image_SmallCardBack1", cc.Sprite);
        // this.imageSmallCardBack2 = this.getChildNodeOrComponent("Image_SmallCardBack2", cc.Sprite);
        // this.imageSmallCardBack3 = this.getChildNodeOrComponent("Image_SmallCardBack3", cc.Sprite);
        // this.imageSmallCardBack4 = this.getChildNodeOrComponent("Image_SmallCardBack4", cc.Sprite);
        // this.imageSmallCardBack5 = this.getChildNodeOrComponent("Image_SmallCardBack5", cc.Sprite);


        this.imageCountDown = this.getChildNodeOrComponent("Image_CountDown", cc.Sprite);
        this.Image_CountDownbg = this.getChildNodeOrComponent("Image_CountDownbg", cc.Sprite);
        this.image_CountDownTime = this.Image_CountDownbg.node.getChildByName("Text").getComponent(cc.Label);

        this.imageCardType = this.getChildNodeOrComponent("Image_CardType", cc.Sprite);
        this.textCardType = this.getChildNodeOrComponent("Text_CardType", cc.Label);

        this.imageSmallCardType = this.getChildNodeOrComponent("Image_SmallCardType", cc.Sprite);
        this.textSmallCardType = this.getChildNodeOrComponent("Text_SmallCardType", cc.Label);


        this.imageRecyclingWinChip = this.getChildNodeOrComponent("Image_RecyclingWinChip", cc.Sprite);


        this.buttonCancelReserveSeat = this.getChildNodeOrComponent("Button_CancelReserveSeat");
        this.textCancelReserveSeat = this.getChildNodeOrComponent("Text_CancelReserveSeat", cc.Label);
        this.imageReserveSeat = this.getChildNodeOrComponent("Image_ReserveSeat");
        this.m_ReserveTime = this.getChildNodeOrComponent("time", cc.Label);

        this.imageOffline = this.getChildNodeOrComponent("imageOffline");


        this.imageBubble = this.getChildNodeOrComponent("Image_Bubble", cc.Sprite);
        this.textBubble = this.getChildNodeOrComponent("Text_Bubble", cc.Label);


        this.Operation_Pos_Mark = this.getChildNodeOrComponent("Operation_Pos_Mark");

        //声纹
        this.voiceprintList = [];
        // this.voiceprintList.Add(VoiceprintStart);
        // this.voiceprintList.Add(VoiceprintEntering);
        // this.voiceprintList.Add(VoiceprintEnd);
        // this.voiceprintList.Add(VoiceprintRobot);
        // this.voiceprintList.Add(VoiceprintReal);
        // this.voiceprintList.Add(VoiceprintVoting);

    }

    protected regiterTouchEvents(): void {

        for (let i = 0; i < this.imageCards.length; i++) {
            this.imageCards[i].imageCard.on("click", this.onClickCard, this);
        }

        this.imageEmpty.node.on("click", this.onClickEmpty, this);
        this.rawimageHead.node.on("click", this.onClickHead, this);


        //this.buttonCancelReserveSeat.on("click", this.onClickCancelReserveSeat, this);
        this.setButtonClick(this.buttonCancelReserveSeat, this.onClickCancelReserveSeat);
    }


    private onClickCancelReserveSeat(): void {
        UIMineModel.mInstance.ObtainUserInfo(pDto => {
            UIMineModel.mInstance.UIRefreshGoldEvent();//更新完金币ui
            this.ClickCancelReserveSeat();
        });//更新用户金币数量
    }

    private ClickCancelReserveSeat(): void {
        if (this.seat.IsMySeat && this.seat.Player.chips <= 0) {
            UIComponent.Instance.ShowUI<AddClipsData>(PrefabUI.UIAddChipsComponent,
                {
                    bigBlind: GameCache.Instance.CurGame.bigBlind,
                    smallBlind: GameCache.Instance.CurGame.smallBlind,
                    currentMinRate: GameCache.Instance.CurGame.currentMinRate,
                    currentMaxRate: GameCache.Instance.CurGame.currentMaxRate,
                    // totalCoin: GameCache.Instance.gold,
                    totalCoin: GC.data.user.info.gold,
                    tableChips: this.seat.Player.chips
                });
        }
        else {
            ProtocolAgency.Send<ClientMessageKeepSeatActive.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_KeepSeatActive,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                    keep: false,
                    duration: 0
                },
            });
            GameCache.Instance.CurGame.cacheCancelKeepSeat = true;
        }
    }


    onClickEmpty() {

        UIMineModel.mInstance.ObtainUserInfo(pDto => {
            if (pDto.user.forbid_bring_in == 1) {
                UIComponent.open<UIDialogParam>(UIDefine.UIDialogComponent, {
                    title: "",
                    type: UIDialogComponent.DialogType.Commit,
                    content: i18nMgr.Get("UIForbidBringInTips"),
                    contentCommit: CPErrorCode.LanguageDescription(10012),
                })
                return;
            }
            else {
                GameCache.Instance.CurGame.Sitdown(this.seat.ClientSeatId, true);
            }
        });
    }
    /// <summary>
    /// 查看玩家信息
    /// </summary>
    /// <param name="go"></param>
    protected onClickHead(): void {
        switch (this.seat.SeatVoiceprintState) {
            case VoiceprintState.Start:
            case VoiceprintState.Recording:
                //             UIComponent.Instance.ShowUI(UIType.UIDialog, new UIDialogComponent.DialogData()
                // 				{
                //                     type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                //                     title = LanguageManager.Get("UiVoiceprint_10001"),
                //                     content = string.Format(LanguageManager.Get("UiVoiceprint_10046"), Player.nick),
                //                     contentCancel = LanguageManager.Get("UiVoiceprint_10030"),
                //                     contentCommit = LanguageManager.Get("UIBackDiolg_Konw_01"),
                //                     actionCancel = () => {
                //                         UIComponent.Instance.ShowUI(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                //     }
                // });
                break;
            case VoiceprintState.Checking:
            case VoiceprintState.None:
            case VoiceprintState.Robot:
            case VoiceprintState.Real:
                // 查看个人信息
                GameCache.Instance.CurGame.CheckPlayerInfo(this.seat.Player.userID, this.seat.Player);
                break;
            case VoiceprintState.Voting:
                if (this.seat.Player.userID == GameCache.Instance.CurGame.mainPlayer.userID) {
                    GameCache.Instance.CurGame.CheckPlayerInfo(this.seat.Player.userID, this.seat.Player);
                }
                else {
                    let seat: Seat = GameCache.Instance.CurGame.GetSeatByUserId(GameCache.Instance.CurGame.mainPlayer.userID);
                    if (seat != null) {
                        if (seat.Player.seatID >= 0) {
                            // UIComponent.Instance.ShowUI(UIType.UITexasHumanVote, new UITexasHumanVoteComponent.VoteDataInfo()
                            // 	{
                            //         verify_id = this.Player.VoiceprintId,
                            //         name = this.Player.nick,
                            //         updateTime = this.Player.UpdateStateTime,
                            //         userId = this.Player.userID
                            //     });
                        }
                        else {
                            //         UIComponent.Instance.ShowUI(UIType.UIDialog, new UIDialogComponent.DialogData()
                            // 			{
                            //                 type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                            //                 title = "",
                            //                 contentCommit = LanguageManager.Get("adaptation10024"),//知道了
                            //                 contentCancel = LanguageManager.Get("UiVoiceprint_10030"),//验证记录
                            //                 content = LanguageManager.Get("UiVoiceprint_10027"),//上桌后可参与该玩家真人验证投票
                            //                 actionCommit = () => { UIComponent.Instance.Remove(UIType.UIDialog); },
                            //                 actionCancel = () => {
                            //                     UIComponent.Instance.ShowUI(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                            //     }
                            // });
                        }
                    }
                    else {
                        //         UIComponent.Instance.ShowUI(UIType.UIDialog, new UIDialogComponent.DialogData()
                        // 			{
                        //                 type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                        //                 title = "",
                        //                 contentCommit = LanguageManager.Get("adaptation10024"),//知道了
                        //                 contentCancel = LanguageManager.Get("UiVoiceprint_10030"),//验证记录
                        //                 content = LanguageManager.Get("UiVoiceprint_10027"),//上桌后可参与该玩家真人验证投票
                        //                 actionCommit = () => { UIComponent.Instance.Remove(UIType.UIDialog); },
                        //                 actionCancel = () => {
                        //                     UIComponent.Instance.ShowUI(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                        //     }
                        // });
                    }

                }
                break;
            default:
                break;
        }

    }
    protected onClickCard(button: cc.Button): void {
        let mTmpSequencePlayDealAnimation = GameCache.Instance.CurGame.GetSequencePlayDealAnimation();
        if (null != mTmpSequencePlayDealAnimation && mTmpSequencePlayDealAnimation.IsPlaying) {
            return;
        }
        // 亮牌   弃牌 , 未动作（没有开赛）
        if (null == this.seat.Player || this.seat.Player.userID != GameCache.Instance.CurGame.mainPlayer.userID ||
            this.seat.seatID != GameCache.Instance.CurGame.mainPlayer.seatID || !this.seat.Player.isParticipateInTheGame) {
            return;
        }

        let go = button.node;

        let mTmp: string = go.name.substring(go.name.length - 1);
        let mCardIndex: number = +mTmp;


        let mActive: boolean = this.seat.listCardUIInfos[mCardIndex].imageEye.node.activeInHierarchy;
        this.seat.listCardUIInfos[mCardIndex].imageEye.node.active = !mActive;
        this.seat.showCardsId[mCardIndex] = (!mActive) ? 1 : 0;
        ProtocolAgency.Send<ClientMessageShowdown.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Showdown,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body:
            {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                showCardsList: this.seat.showCardsId
            },
        })
    }
}
