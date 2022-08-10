import UpdateComponent from "../funcomponent/UpdateComponent";
import { StateHandler } from "../statemachine/StateHandler";
import { CPlayer } from "./CPlayer";
import FSMLogicComponent from "./FSMLogicComponent";
import { SeatFSM } from "./SeatFSM";

export default class Seat {

    public fsm: SeatFSM = null;

    // ui
    protected imageBanker: cc.Sprite = null;
    protected transSmallCardBacks: cc.Node = null;
    protected transCurRoundHaveBet: cc.Node = null;
    protected armatureVoice: cc.Node = null;



    public Player: CPlayer;  // 玩家信息
    public seatID: number; // 服务器座位号
    public isBank: boolean;    // 是否庄家
    public FsmLogicComponent: FSMLogicComponent;//状态机


    public seatUIInfo: SeatUIInfo;
    public ClientSeatId: number;    // 客户端座位号

    protected PlayerCount: number;//最大人数


    constructor(public ui: cc.Node) {

        this.fsm = new SeatFSM(this);

        UpdateComponent.Add(this.FsmLogicComponent = new FSMLogicComponent(), this.fsm);

    }

    public Clear() {

        this.ui = null;

        this.fsm = null;

        UpdateComponent.Remove(this.FsmLogicComponent);

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

