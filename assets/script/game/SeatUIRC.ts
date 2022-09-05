

import UIBase from "../ui/UIBase";
import { GameCache } from "./GameCache";
import Seat from "./Seat";


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

        for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
            this.listCardUIInfos[i].imageCard.on("click", this.onClickCard, this);
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
