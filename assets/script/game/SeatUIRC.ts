

import { UIMineModel } from "../lobby/UIMineModel";
import UIBase from "../ui/UIBase";
import { GameCache } from "./GameCache";
import Seat, { VoiceprintState } from "./Seat";


export class CardUIInfo {
    public imageSelect: cc.Sprite = null;
    public imageBack: cc.Sprite = null;
    public imageEye: cc.Sprite = null;

    constructor(public imageCard: cc.Node) {
        this.imageSelect = imageCard.getChildByName("Image_SelectCard")?.getComponent(cc.Sprite);
        this.imageBack = imageCard.getChildByName("Image_CardBack")?.getComponent(cc.Sprite);
        this.imageEye = imageCard.getChildByName("Image_EyeCard")?.getComponent(cc.Sprite);
    }
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeatUIRC extends UIBase {

    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    imageHeadFrame: cc.Sprite = null;
    imageHeadGray: cc.Sprite = null;
    imageEmpty: cc.Sprite = null;
    rawimageHead: cc.Sprite = null;
    textCoin: cc.Label = null;
    textCoinBg: cc.Sprite = null;
    textNickname: cc.Label = null;
    WaitforthenextmoveTips: cc.Label = null;


    transCurRoundHaveBet: cc.Node = null;
    imageIconChip: cc.Sprite = null;
    textCurRoundHaveBet: cc.Label = null;

    transSmallCardBacks: cc.Node = null;
    imageBanker: cc.Node = null;

    public listCardUIInfos: CardUIInfo[] = null;
    public listSmallCardUIInfos: CardUIInfo[] = null;
    public listImageSmallCardBack: cc.Sprite[] = null;

    imageCard0: cc.Node = null;
    imageCard1: cc.Node = null;
    imageCard2: cc.Node = null;
    imageCard3: cc.Node = null;
    imageCard4: cc.Node = null;
    imageCard5: cc.Node = null;


    imageSmallCard0: cc.Node = null;
    imageSmallCard1: cc.Node = null;
    imageSmallCard2: cc.Node = null;
    imageSmallCard3: cc.Node = null;
    imageSmallCard4: cc.Node = null;
    imageSmallCard5: cc.Node = null;

    imageSmallCardBack0: cc.Sprite = null;
    imageSmallCardBack1: cc.Sprite = null;
    imageSmallCardBack2: cc.Sprite = null;
    imageSmallCardBack3: cc.Sprite = null;
    imageSmallCardBack4: cc.Sprite = null;
    imageSmallCardBack5: cc.Sprite = null;

    imageCountDown: cc.Sprite = null;
    Image_CountDownbg: cc.Sprite = null;
    image_CountDownTime: cc.Label = null;



    imageCardType: cc.Sprite = null;
    textCardType: cc.Label = null;
    imageSmallCardType: cc.Sprite = null;
    textSmallCardType: cc.Label = null;


    imageRecyclingWinChip: cc.Sprite = null;

    ///////////////////////////////////

    ///////////////////////////////////
    /**
     * 声明内容
     */
    public seat: Seat = null;
    /// <summary>
    /// 亮牌数据
    /// </summary>
    public showCardsId: number[] = null;

    public voiceprintList: cc.Node[];
    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.imageHeadFrame = this.getChildNodeOrComponent("Image_HeadFrame", cc.Sprite);
        this.imageHeadGray = this.getChildNodeOrComponent("Image_HeadGray", cc.Sprite);
        this.imageEmpty = this.getChildNodeOrComponent("Image_Empty", cc.Sprite);
        this.rawimageHead = this.getChildNodeOrComponent("RawImage_Head", cc.Sprite);
        this.textCoin = this.getChildNodeOrComponent("Text_Coin", cc.Label);
        this.textCoinBg = this.getChildNodeOrComponent("Text_Coin_Bg", cc.Sprite);
        this.textNickname = this.getChildNodeOrComponent("Text_Nickname", cc.Label);
        this.WaitforthenextmoveTips = this.getChildNodeOrComponent("WaitforthenextmoveTips", cc.Label);

        this.transCurRoundHaveBet = this.getChildNodeOrComponent("CurRoundHaveBet");
        this.imageIconChip = this.getChildNodeOrComponent("Image_IconChip", cc.Sprite);
        this.textCurRoundHaveBet = this.getChildNodeOrComponent("Text_CurRoundHaveBet", cc.Label);

        this.transSmallCardBacks = this.getChildNodeOrComponent("SmallCardBacks");
        this.imageBanker = this.getChildNodeOrComponent("Image_Banker");

        this.imageCard0 = this.getChildNodeOrComponent("Image_Card0");
        this.imageCard1 = this.getChildNodeOrComponent("Image_Card1");
        this.imageCard2 = this.getChildNodeOrComponent("Image_Card2");
        this.imageCard3 = this.getChildNodeOrComponent("Image_Card3");
        this.imageCard4 = this.getChildNodeOrComponent("Image_Card4");
        this.imageCard5 = this.getChildNodeOrComponent("Image_Card5");

        this.imageSmallCard0 = this.getChildNodeOrComponent("Image_SmallCard0");
        this.imageSmallCard1 = this.getChildNodeOrComponent("Image_SmallCard1");
        this.imageSmallCard2 = this.getChildNodeOrComponent("Image_SmallCard2");
        this.imageSmallCard3 = this.getChildNodeOrComponent("Image_SmallCard3");
        this.imageSmallCard4 = this.getChildNodeOrComponent("Image_SmallCard4");
        this.imageSmallCard5 = this.getChildNodeOrComponent("Image_SmallCard5");


        this.imageSmallCardBack0 = this.getChildNodeOrComponent("Image_SmallCardBack0", cc.Sprite);
        this.imageSmallCardBack1 = this.getChildNodeOrComponent("Image_SmallCardBack1", cc.Sprite);
        this.imageSmallCardBack2 = this.getChildNodeOrComponent("Image_SmallCardBack2", cc.Sprite);
        this.imageSmallCardBack3 = this.getChildNodeOrComponent("Image_SmallCardBack3", cc.Sprite);
        this.imageSmallCardBack4 = this.getChildNodeOrComponent("Image_SmallCardBack4", cc.Sprite);
        this.imageSmallCardBack5 = this.getChildNodeOrComponent("Image_SmallCardBack5", cc.Sprite);


        this.imageCountDown = this.getChildNodeOrComponent("Image_CountDown", cc.Sprite);
        this.Image_CountDownbg = this.getChildNodeOrComponent("Image_CountDownbg", cc.Sprite);
        this.image_CountDownTime = this.Image_CountDownbg.node.getChildByName("Text").getComponent(cc.Label);

        this.imageCardType = this.getChildNodeOrComponent("Image_CardType", cc.Sprite);
        this.textCardType = this.getChildNodeOrComponent("Text_CardType", cc.Label);

        this.imageSmallCardType = this.getChildNodeOrComponent("Image_SmallCardType", cc.Sprite);
        this.textSmallCardType = this.getChildNodeOrComponent("Text_SmallCardType", cc.Label);


        this.imageRecyclingWinChip = this.getChildNodeOrComponent("Image_RecyclingWinChip", cc.Sprite);


        this.voiceprintList = [];
        // this.voiceprintList.Add(VoiceprintStart);
        // this.voiceprintList.Add(VoiceprintEntering);
        // this.voiceprintList.Add(VoiceprintEnd);
        // this.voiceprintList.Add(VoiceprintRobot);
        // this.voiceprintList.Add(VoiceprintReal);
        // this.voiceprintList.Add(VoiceprintVoting);


        if (null == this.listCardUIInfos || this.listCardUIInfos.length > 0) this.listCardUIInfos = [];
        this.listCardUIInfos.push(new CardUIInfo(this.imageCard0));
        this.listCardUIInfos.push(new CardUIInfo(this.imageCard1));


        if (null == this.listSmallCardUIInfos || this.listSmallCardUIInfos.length > 0) this.listSmallCardUIInfos = [];
        this.listSmallCardUIInfos.push(new CardUIInfo(this.imageSmallCard0));
        this.listSmallCardUIInfos.push(new CardUIInfo(this.imageSmallCard1));



        if (null == this.listImageSmallCardBack || this.listImageSmallCardBack.length > 0) this.listImageSmallCardBack = [];
        if (null == this.listImageSmallCardBack || this.listImageSmallCardBack.length > 0) this.listImageSmallCardBack = [];
        this.listImageSmallCardBack.push(this.imageSmallCardBack0);
        this.listImageSmallCardBack.push(this.imageSmallCardBack1);
        this.ResetShowCardsId();


    }


    protected regiterTouchEvents(): void {

        for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
            this.listCardUIInfos[i].imageCard.on("click", this.onClickCard, this);
        }
        this.imageEmpty.node.on("click", this.onClickEmpty, this);
        this.rawimageHead.node.on("click", this.onClickHead, this);
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
                //             UIComponent.Instance.ShowNoAnimation(UIType.UIDialog, new UIDialogComponent.DialogData()
                // 				{
                //                     type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                //                     title = LanguageManager.Get("UiVoiceprint_10001"),
                //                     content = string.Format(LanguageManager.Get("UiVoiceprint_10046"), Player.nick),
                //                     contentCancel = LanguageManager.Get("UiVoiceprint_10030"),
                //                     contentCommit = LanguageManager.Get("UIBackDiolg_Konw_01"),
                //                     actionCancel = () => {
                //                         UIComponent.Instance.ShowNoAnimation(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
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
                            // UIComponent.Instance.ShowNoAnimation(UIType.UITexasHumanVote, new UITexasHumanVoteComponent.VoteDataInfo()
                            // 	{
                            //         verify_id = this.Player.VoiceprintId,
                            //         name = this.Player.nick,
                            //         updateTime = this.Player.UpdateStateTime,
                            //         userId = this.Player.userID
                            //     });
                        }
                        else {
                            //         UIComponent.Instance.ShowNoAnimation(UIType.UIDialog, new UIDialogComponent.DialogData()
                            // 			{
                            //                 type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                            //                 title = "",
                            //                 contentCommit = LanguageManager.Get("adaptation10024"),//知道了
                            //                 contentCancel = LanguageManager.Get("UiVoiceprint_10030"),//验证记录
                            //                 content = LanguageManager.Get("UiVoiceprint_10027"),//上桌后可参与该玩家真人验证投票
                            //                 actionCommit = () => { UIComponent.Instance.Remove(UIType.UIDialog); },
                            //                 actionCancel = () => {
                            //                     UIComponent.Instance.ShowNoAnimation(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                            //     }
                            // });
                        }
                    }
                    else {
                        //         UIComponent.Instance.ShowNoAnimation(UIType.UIDialog, new UIDialogComponent.DialogData()
                        // 			{
                        //                 type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                        //                 title = "",
                        //                 contentCommit = LanguageManager.Get("adaptation10024"),//知道了
                        //                 contentCancel = LanguageManager.Get("UiVoiceprint_10030"),//验证记录
                        //                 content = LanguageManager.Get("UiVoiceprint_10027"),//上桌后可参与该玩家真人验证投票
                        //                 actionCommit = () => { UIComponent.Instance.Remove(UIType.UIDialog); },
                        //                 actionCancel = () => {
                        //                     UIComponent.Instance.ShowNoAnimation(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                        //     }
                        // });
                    }

                }
                break;
            default:
                break;
        }

    }


    protected onClickCard(): void {
        //         var mTmpSequencePlayDealAnimation = GameCache.Instance.CurGame.GetSequencePlayDealAnimation();
        //         if (null != mTmpSequencePlayDealAnimation && mTmpSequencePlayDealAnimation.IsPlaying()) {
        //             return;
        //         }

        //         // 亮牌   弃牌 , 未动作（没有开赛）
        //         if (null == Player || Player.userID != GameCache.Instance.CurGame.MainPlayer.userID ||
        //             seatID != GameCache.Instance.CurGame.MainPlayer.seatID || !Player.isParticipateInTheGame) {
        //             return;
        //         }

        // 			string mTmp = go.name.Substring(go.name.Length - 1);
        // 			int mCardIndex = -1;
        //         if (int.TryParse(mTmp, out mCardIndex)) {
        // 				bool mActive = listCardUIInfos[mCardIndex].imageEye.gameObject.activeInHierarchy;
        //             listCardUIInfos[mCardIndex].imageEye.gameObject.SetActive(!mActive);

        //             showCardsId[mCardIndex] = (!mActive) ? 1 : 0;
        //             CPGameSessionComponent.Instance.Send(new Protocol_Holdem_Showdown()
        // 				{
        //                     RoomID = (ulong)GameCache.Instance.room_id,
        //                     MatchID = (ulong)GameCache.Instance.match_id,
        //                     request = new ClientMessageShowdown()
        // 					{
        //                     Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
        //                 ShowCards = showCardsId,
        // 					}

        //     });

        // }
    }

    public ResetShowCardsId(): void {
        if (this.showCardsId == null) {
            this.showCardsId = [];
        }
        else {
            this.showCardsId.length = 0;
        }
        for (let i = 0; i < GameCache.Instance.CurGame.HandCards; i++) {
            this.showCardsId.push(0);
        }

    }
}
