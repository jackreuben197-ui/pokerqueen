

import GameCache from "../manager/GameCache";
import UIBase from "../ui/UIBase";
import Seat from "./Seat";


export class CardUIInfo {
    public imageSelect: cc.Sprite;
    public imageBack: cc.Sprite;
    public imageEye: cc.Sprite;

    constructor(public imageCard: cc.Node) {
        this.imageSelect = imageCard.getChildByName("Image_SmallSelectCard").getComponent(cc.Sprite);
        this.imageBack = imageCard.getChildByName("Image_EyeCard").getComponent(cc.Sprite);
        this.imageEye = imageCard.getChildByName("Image_CardBack").getComponent(cc.Sprite);
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

    public listCardUIInfos: CardUIInfo[] = null;

    imageCard0: cc.Node = null;
    imageCard1: cc.Node = null;
    imageCard2: cc.Node = null;
    imageCard3: cc.Node = null;
    imageCard4: cc.Node = null;
    imageCard5: cc.Node = null;

    ///////////////////////////////////

    ///////////////////////////////////
    /**
     * 声明内容
     */
    public seat: Seat = null;
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

        this.imageCard0 = this.getChildNodeOrComponent("Image_Card0");
        this.imageCard1 = this.getChildNodeOrComponent("Image_Card1");
        this.imageCard2 = this.getChildNodeOrComponent("Image_Card2");
        this.imageCard3 = this.getChildNodeOrComponent("Image_Card3");
        this.imageCard4 = this.getChildNodeOrComponent("Image_Card4");
        this.imageCard5 = this.getChildNodeOrComponent("Image_Card5");

        if (null == this.listCardUIInfos) {
            this.listCardUIInfos = [];
        }
        if (this.listCardUIInfos.length > 0) this.listCardUIInfos = [];
        //listCardUIInfos.Clear();
        this.listCardUIInfos.push(new CardUIInfo(this.imageCard0));
        this.listCardUIInfos.push(new CardUIInfo(this.imageCard1));



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


}
