import { RoomType } from "../define/EIDefine";
import { SeatUIInfo } from "../game/Seat";
import TexasGame from "../game/TexasGame";

export default class GameUtil {
    private static readonly normalOuts: number[] = [0, 30, 16, 10, 8, 6, 5, 4, 3.5, 3, 2.5, 2.2, 2, 1.8, 1.6, 1.4, 1.2, 1, 0.8, 0.6, 0.5];
    private static readonly omahaOuts: number[] = [0, 24, 12, 8, 6, 4.5, 4, 3.2, 2.7, 2.3, 2, 1.7, 1.5, 1.3, 1.2, 1.1, 1, 0.8, 0.7, 0.6, 0.5];
    public static OutsList = new Map<number, number[]>();
    public static TexasGameDic = new Map<RoomType, TexasGame>();

    //#region 牌局内座位UI信息   
    // 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly SeatPosV3: cc.Vec3[] = [

        cc.v3(0, -841),
        cc.v3(-516, -272),
        cc.v3(-516, -95),
        cc.v3(-516, 155),
        cc.v3(-516, 495),
        cc.v3(-516, 582),
        cc.v3(-212, 987),
        cc.v3(0, 987),
        cc.v3(214, 987),
        cc.v3(512, 582),
        cc.v3(512, 495),
        cc.v3(512, 155),
        cc.v3(512, -95),
        cc.v3(512, -272),
    ];

    // Dealer标识坐标 0左、1右
    public static readonly BankerLRV3: cc.Vec3[] = [

        cc.v3(138, -175),
        cc.v3(0, -180),
    ];

    // 牌背面坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly CardBackLRV3 =
        [
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
            cc.v3(51, -57),
        ];

    // 牌背面旋转 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly CardBackRotLRV3 =
        [
            cc.v3(0, 0, 45),
            cc.v3(0, 0, -30),
            cc.v3(0, 0, -30),
            cc.v3(0, 0, -30),
            cc.v3(0, 0, -30),
            cc.v3(0, 0, -30),
            cc.v3(0, 0, -120),
            cc.v3(0, 0, -120),
            cc.v3(0, 0, 140),
            cc.v3(0, 0, 45),
            cc.v3(0, 0, 45),
            cc.v3(0, 0, 45),
            cc.v3(0, 0, 45),
            cc.v3(0, 0, 45),
        ];

    // 牌坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly CardsPosLRV3 =
        [
            cc.v3(-67, -292),
            cc.v3(155, -22),
            cc.v3(155, -22),
            cc.v3(155, 20),
            cc.v3(155, -77),
            cc.v3(155, -77),
            cc.v3(-155, 0),
            cc.v3(155, 0),
            cc.v3(155, 0),
            cc.v3(-155, -77),
            cc.v3(-155, -77),
            cc.v3(-155, 20),
            cc.v3(-155, -22),
            cc.v3(-155, -22),
        ];

    // 本手已下注坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly CurRoundHaveBetPosLRV3 =
        [
            cc.v3(374, -12.5),
            cc.v3(-200, -10),
            cc.v3(-200, -10),
            cc.v3(-200, -10),
            cc.v3(200, -10),
            cc.v3(200, -10),
            cc.v3(200, -10),
            cc.v3(200, -10),
            cc.v3(200, -10),
            cc.v3(160, -126),
            cc.v3(-104, -126),
        ];

    // 操作气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly BubblePosLRV3 =
        [
            cc.v3(-102, 43),
            cc.v3(-102, 43),
            cc.v3(-102, 43),
            cc.v3(-102, 43),
            cc.v3(-102, 43),
            cc.v3(111, 43),
            cc.v3(111, 43),
            cc.v3(111, 43),
            cc.v3(111, 43),
        ];
    // 保险倒计时气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly InsurancePosLRV3 =
        [
            cc.v3(-175, 20),
            cc.v3(-175, 20),
            cc.v3(-175, 20),
            cc.v3(-175, 20),
            cc.v3(-175, 20),
            cc.v3(175, 20),
            cc.v3(175, 20),
            cc.v3(175, 20),
            cc.v3(175, 20),
        ];
    // aomaha保险倒计时气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly AoMaHaInsurancePosLRV3 =
        [
            cc.v3(-207, 20),
            cc.v3(-207, 20),
            cc.v3(-207, 20),
            cc.v3(-207, 20),
            cc.v3(-207, 20),
            cc.v3(207, 20),
            cc.v3(207, 20),
            cc.v3(207, 20),
            cc.v3(207, 20),
        ];
    // 保险不保气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly InsuranceBubaoPosLRV3 =
        [
            cc.v3(-153, 20),
            cc.v3(-153, 20),
            cc.v3(-153, 20),
            cc.v3(-153, 20),
            cc.v3(-153, 20),
            cc.v3(153, 20),
            cc.v3(153, 20),
            cc.v3(153, 20),
            cc.v3(153, 20),
        ];
    // aomaha保险不保气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly AoMaHaInsuranceBubaoPosLRV3 =
        [
            cc.v3(-186, 20),
            cc.v3(-186, 20),
            cc.v3(-186, 20),
            cc.v3(-186, 20),
            cc.v3(-186, 20),
            cc.v3(186, 20),
            cc.v3(186, 20),
            cc.v3(186, 20),
            cc.v3(186, 20),
        ];
    // 保险投保气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly InsuranceToubaoPosLRV3 =
        [
            cc.v3(-177, 20),
            cc.v3(-177, 20),
            cc.v3(-177, 20),
            cc.v3(-177, 20),
            cc.v3(-177, 20),
            cc.v3(177, 20),
            cc.v3(177, 20),
            cc.v3(177, 20),
            cc.v3(177, 20),
        ];
    // aomaha保险投保气泡坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly AoMaHaInsuranceToubaoPosLRV3 =
        [
            cc.v3(-209, 20),
            cc.v3(-209, 20),
            cc.v3(-209, 20),
            cc.v3(-209, 20),
            cc.v3(-209, 20),
            cc.v3(209, 20),
            cc.v3(209, 20),
            cc.v3(209, 20),
            cc.v3(209, 20),
        ];


    public static readonly SeatUIInfos: { [key: number]: SeatUIInfo[] } = {

        2: [{
            Pos: GameUtil.SeatPosV3[0],
            BankerPos: GameUtil.BankerLRV3[0],
            CardBackPos: GameUtil.CardBackLRV3[0],
            CardBackRot: GameUtil.CardBackRotLRV3[0],
            CardsPos: GameUtil.CardsPosLRV3[0],
            CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
            BubblePos: GameUtil.BubblePosLRV3[0],
            InsurancePos: GameUtil.InsurancePosLRV3[0],
            AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
            InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
            AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
            InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
            AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0]
        },
        {
            Pos: GameUtil.SeatPosV3[7],
            BankerPos: GameUtil.BankerLRV3[1],
            CardBackPos: GameUtil.CardBackLRV3[8],
            CardBackRot: GameUtil.CardBackRotLRV3[7],
            CardsPos: GameUtil.CardsPosLRV3[7],
            CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
            BubblePos: GameUtil.BubblePosLRV3[8],
            InsurancePos: GameUtil.InsurancePosLRV3[8],
            AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
            InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
            AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
            InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
            AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
        },
        ],
        [3]: [{

            Pos: GameUtil.SeatPosV3[0],
            BankerPos: GameUtil.BankerLRV3[0],
            CardBackPos: GameUtil.CardBackLRV3[0],
            CardBackRot: GameUtil.CardBackRotLRV3[0],
            CardsPos: GameUtil.CardsPosLRV3[0],
            CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
            BubblePos: GameUtil.BubblePosLRV3[0],
            InsurancePos: GameUtil.InsurancePosLRV3[0],
            AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
            InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
            AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
            InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
            AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
        },

        {
            Pos: GameUtil.SeatPosV3[4],
            BankerPos: GameUtil.BankerLRV3[1],
            CardBackPos: GameUtil.CardBackLRV3[8],
            CardBackRot: GameUtil.CardBackRotLRV3[4],
            CardsPos: GameUtil.CardsPosLRV3[4],
            CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
            BubblePos: GameUtil.BubblePosLRV3[8],
            InsurancePos: GameUtil.InsurancePosLRV3[8],
            AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
            InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
            AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
            InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
            AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
        },

        {
            Pos: GameUtil.SeatPosV3[10],
            BankerPos: GameUtil.BankerLRV3[1],
            CardBackPos: GameUtil.CardBackLRV3[1],
            CardBackRot: GameUtil.CardBackRotLRV3[10],
            CardsPos: GameUtil.CardsPosLRV3[10],
            CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
            BubblePos: GameUtil.BubblePosLRV3[1],
            InsurancePos: GameUtil.InsurancePosLRV3[1],
            AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
            InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
            AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
            InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
            AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],
        },
        ],
        4: [

            {
                Pos: GameUtil.SeatPosV3[0],
                BankerPos: GameUtil.BankerLRV3[0],
                CardBackPos: GameUtil.CardBackLRV3[0],
                CardBackRot: GameUtil.CardBackRotLRV3[0],
                CardsPos: GameUtil.CardsPosLRV3[0],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
                BubblePos: GameUtil.BubblePosLRV3[0],
                InsurancePos: GameUtil.InsurancePosLRV3[0],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
            },

            {
                Pos: GameUtil.SeatPosV3[3],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[8],
                CardBackRot: GameUtil.CardBackRotLRV3[3],
                CardsPos: GameUtil.CardsPosLRV3[3],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
                BubblePos: GameUtil.BubblePosLRV3[8],
                InsurancePos: GameUtil.InsurancePosLRV3[8],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
            },

            {
                Pos: GameUtil.SeatPosV3[7],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[7],
                CardBackRot: GameUtil.CardBackRotLRV3[7],
                CardsPos: GameUtil.CardsPosLRV3[7],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
                BubblePos: GameUtil.BubblePosLRV3[7],
                InsurancePos: GameUtil.InsurancePosLRV3[7],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[7],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[7],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[7],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[7],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[7],
            },

            {
                Pos: GameUtil.SeatPosV3[11],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[1],
                CardBackRot: GameUtil.CardBackRotLRV3[11],
                CardsPos: GameUtil.CardsPosLRV3[11],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
                BubblePos: GameUtil.BubblePosLRV3[1],
                InsurancePos: GameUtil.InsurancePosLRV3[1],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],
            },
        ],
        5: [
            {
                Pos: GameUtil.SeatPosV3[0],
                BankerPos: GameUtil.BankerLRV3[0],
                CardBackPos: GameUtil.CardBackLRV3[0],
                CardBackRot: GameUtil.CardBackRotLRV3[0],
                CardsPos: GameUtil.CardsPosLRV3[0],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
                BubblePos: GameUtil.BubblePosLRV3[0],
                InsurancePos: GameUtil.InsurancePosLRV3[0],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
            },

            {
                Pos: GameUtil.SeatPosV3[3],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[8],
                CardBackRot: GameUtil.CardBackRotLRV3[3],
                CardsPos: GameUtil.CardsPosLRV3[3],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
                BubblePos: GameUtil.BubblePosLRV3[8],
                InsurancePos: GameUtil.InsurancePosLRV3[8],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
            },

            {
                Pos: GameUtil.SeatPosV3[6],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[7],
                CardBackRot: GameUtil.CardBackRotLRV3[6],
                CardsPos: GameUtil.CardsPosLRV3[6],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[10],
                BubblePos: GameUtil.BubblePosLRV3[7],
                InsurancePos: GameUtil.InsurancePosLRV3[7],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[7],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[7],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[7],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[7],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[7],
            },

            {
                Pos: GameUtil.SeatPosV3[8],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[2],
                CardBackRot: GameUtil.CardBackRotLRV3[8],
                CardsPos: GameUtil.CardsPosLRV3[8],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
                BubblePos: GameUtil.BubblePosLRV3[2],
                InsurancePos: GameUtil.InsurancePosLRV3[2],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[2],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[2],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[2],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[2],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[2],
            },

            {
                Pos: GameUtil.SeatPosV3[11],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[1],
                CardBackRot: GameUtil.CardBackRotLRV3[11],
                CardsPos: GameUtil.CardsPosLRV3[11],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
                BubblePos: GameUtil.BubblePosLRV3[1],
                InsurancePos: GameUtil.InsurancePosLRV3[1],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],
            },
        ],
        6: [

            {
                Pos: GameUtil.SeatPosV3[0],
                BankerPos: GameUtil.BankerLRV3[0],
                CardBackPos: GameUtil.CardBackLRV3[0],
                CardBackRot: GameUtil.CardBackRotLRV3[0],
                CardsPos: GameUtil.CardsPosLRV3[0],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
                BubblePos: GameUtil.BubblePosLRV3[0],
                InsurancePos: GameUtil.InsurancePosLRV3[0],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
            },

            {
                Pos: GameUtil.SeatPosV3[1],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[8],
                CardBackRot: GameUtil.CardBackRotLRV3[2],
                CardsPos: GameUtil.CardsPosLRV3[2],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
                BubblePos: GameUtil.BubblePosLRV3[8],
                InsurancePos: GameUtil.InsurancePosLRV3[8],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
            },

            {
                Pos: GameUtil.SeatPosV3[5],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[7],
                CardBackRot: GameUtil.CardBackRotLRV3[4],
                CardsPos: GameUtil.CardsPosLRV3[4],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[7],
                BubblePos: GameUtil.BubblePosLRV3[7],
                InsurancePos: GameUtil.InsurancePosLRV3[7],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[7],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[7],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[7],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[7],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[7],
            },

            {
                Pos: GameUtil.SeatPosV3[7],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[6],
                CardBackRot: GameUtil.CardBackRotLRV3[7],
                CardsPos: GameUtil.CardsPosLRV3[7],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
                BubblePos: GameUtil.BubblePosLRV3[6],
                InsurancePos: GameUtil.InsurancePosLRV3[6],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[6],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[6],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[6],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[6],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[6],
            },

            {
                Pos: GameUtil.SeatPosV3[9],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[2],
                CardBackRot: GameUtil.CardBackRotLRV3[10],
                CardsPos: GameUtil.CardsPosLRV3[10],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[2],
                BubblePos: GameUtil.BubblePosLRV3[2],
                InsurancePos: GameUtil.InsurancePosLRV3[2],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[2],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[2],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[2],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[2],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[2],
            },

            {
                Pos: GameUtil.SeatPosV3[13],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[1],
                CardBackRot: GameUtil.CardBackRotLRV3[12],
                CardsPos: GameUtil.CardsPosLRV3[12],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
                BubblePos: GameUtil.BubblePosLRV3[1],
                InsurancePos: GameUtil.InsurancePosLRV3[1],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],

            },
        ],
        7: [

            {
                Pos: GameUtil.SeatPosV3[0],
                BankerPos: GameUtil.BankerLRV3[0],
                CardBackPos: GameUtil.CardBackLRV3[0],
                CardBackRot: GameUtil.CardBackRotLRV3[0],
                CardsPos: GameUtil.CardsPosLRV3[0],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
                BubblePos: GameUtil.BubblePosLRV3[0],
                InsurancePos: GameUtil.InsurancePosLRV3[0],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
            },

            {
                Pos: GameUtil.SeatPosV3[2],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[8],
                CardBackRot: GameUtil.CardBackRotLRV3[2],
                CardsPos: GameUtil.CardsPosLRV3[2],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
                BubblePos: GameUtil.BubblePosLRV3[8],
                InsurancePos: GameUtil.InsurancePosLRV3[8],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
            },

            {
                Pos: GameUtil.SeatPosV3[4],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[7],
                CardBackRot: GameUtil.CardBackRotLRV3[4],
                CardsPos: GameUtil.CardsPosLRV3[4],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[7],
                BubblePos: GameUtil.BubblePosLRV3[7],
                InsurancePos: GameUtil.InsurancePosLRV3[7],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[7],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[7],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[7],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[7],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[7],
            },

            {
                Pos: GameUtil.SeatPosV3[6],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[6],
                CardBackRot: GameUtil.CardBackRotLRV3[6],
                CardsPos: GameUtil.CardsPosLRV3[6],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[10],
                BubblePos: GameUtil.BubblePosLRV3[6],
                InsurancePos: GameUtil.InsurancePosLRV3[6],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[6],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[6],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[6],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[6],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[6],
            },

            {
                Pos: GameUtil.SeatPosV3[8],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[3],
                CardBackRot: GameUtil.CardBackRotLRV3[8],
                CardsPos: GameUtil.CardsPosLRV3[8],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
                BubblePos: GameUtil.BubblePosLRV3[3],
                InsurancePos: GameUtil.InsurancePosLRV3[3],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[3],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[3],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[3],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[3],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[3],
            },

            {
                Pos: GameUtil.SeatPosV3[10],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[2],
                CardBackRot: GameUtil.CardBackRotLRV3[10],
                CardsPos: GameUtil.CardsPosLRV3[10],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[2],
                BubblePos: GameUtil.BubblePosLRV3[2],
                InsurancePos: GameUtil.InsurancePosLRV3[2],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[2],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[2],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[2],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[2],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[2],
            },

            {
                Pos: GameUtil.SeatPosV3[12],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[1],
                CardBackRot: GameUtil.CardBackRotLRV3[12],
                CardsPos: GameUtil.CardsPosLRV3[12],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
                BubblePos: GameUtil.BubblePosLRV3[1],
                InsurancePos: GameUtil.InsurancePosLRV3[1],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],
            },

        ],
        8: [

            {
                Pos: GameUtil.SeatPosV3[0],
                BankerPos: GameUtil.BankerLRV3[0],
                CardBackPos: GameUtil.CardBackLRV3[0],
                CardBackRot: GameUtil.CardBackRotLRV3[0],
                CardsPos: GameUtil.CardsPosLRV3[0],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
                BubblePos: GameUtil.BubblePosLRV3[0],
                InsurancePos: GameUtil.InsurancePosLRV3[0],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
            },

            {
                Pos: GameUtil.SeatPosV3[1],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[8],
                CardBackRot: GameUtil.CardBackRotLRV3[1],
                CardsPos: GameUtil.CardsPosLRV3[1],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
                BubblePos: GameUtil.BubblePosLRV3[8],
                InsurancePos: GameUtil.InsurancePosLRV3[8],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
            },

            {
                Pos: GameUtil.SeatPosV3[3],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[7],
                CardBackRot: GameUtil.CardBackRotLRV3[3],
                CardsPos: GameUtil.CardsPosLRV3[3],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[7],
                BubblePos: GameUtil.BubblePosLRV3[7],
                InsurancePos: GameUtil.InsurancePosLRV3[7],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[7],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[7],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[7],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[7],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[7],
            },

            {
                Pos: GameUtil.SeatPosV3[5],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[6],
                CardBackRot: GameUtil.CardBackRotLRV3[5],
                CardsPos: GameUtil.CardsPosLRV3[5],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[6],
                BubblePos: GameUtil.BubblePosLRV3[6],
                InsurancePos: GameUtil.InsurancePosLRV3[6],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[6],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[6],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[6],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[6],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[6],
            },

            {
                Pos: GameUtil.SeatPosV3[7],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[5],
                CardBackRot: GameUtil.CardBackRotLRV3[7],
                CardsPos: GameUtil.CardsPosLRV3[7],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
                BubblePos: GameUtil.BubblePosLRV3[5],
                InsurancePos: GameUtil.InsurancePosLRV3[5],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[5],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[5],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[5],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[5],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[5],
            },

            {
                Pos: GameUtil.SeatPosV3[9],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[3],
                CardBackRot: GameUtil.CardBackRotLRV3[9],
                CardsPos: GameUtil.CardsPosLRV3[9],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[3],
                BubblePos: GameUtil.BubblePosLRV3[3],
                InsurancePos: GameUtil.InsurancePosLRV3[3],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[3],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[3],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[3],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[3],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[3],
            },

            {
                Pos: GameUtil.SeatPosV3[11],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[2],
                CardBackRot: GameUtil.CardBackRotLRV3[11],
                CardsPos: GameUtil.CardsPosLRV3[11],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[2],
                BubblePos: GameUtil.BubblePosLRV3[2],
                InsurancePos: GameUtil.InsurancePosLRV3[2],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[2],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[2],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[2],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[2],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[2],
            },

            {
                Pos: GameUtil.SeatPosV3[13],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[1],
                CardBackRot: GameUtil.CardBackRotLRV3[13],
                CardsPos: GameUtil.CardsPosLRV3[13],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
                BubblePos: GameUtil.BubblePosLRV3[1],
                InsurancePos: GameUtil.InsurancePosLRV3[1],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],
            },
        ],
        9: [

            {
                Pos: GameUtil.SeatPosV3[0],
                BankerPos: GameUtil.BankerLRV3[0],
                CardBackPos: GameUtil.CardBackLRV3[0],
                CardBackRot: GameUtil.CardBackRotLRV3[0],
                CardsPos: GameUtil.CardsPosLRV3[0],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[0],
                BubblePos: GameUtil.BubblePosLRV3[0],
                InsurancePos: GameUtil.InsurancePosLRV3[0],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[0],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[0],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[0],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[0],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[0],
            },

            {
                Pos: GameUtil.SeatPosV3[1],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[8],
                CardBackRot: GameUtil.CardBackRotLRV3[1],
                CardsPos: GameUtil.CardsPosLRV3[1],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[8],
                BubblePos: GameUtil.BubblePosLRV3[8],
                InsurancePos: GameUtil.InsurancePosLRV3[8],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[8],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[8],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[8],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[8],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[8],
            },

            {
                Pos: GameUtil.SeatPosV3[3],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[7],
                CardBackRot: GameUtil.CardBackRotLRV3[3],
                CardsPos: GameUtil.CardsPosLRV3[3],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[7],
                BubblePos: GameUtil.BubblePosLRV3[7],
                InsurancePos: GameUtil.InsurancePosLRV3[7],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[7],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[7],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[7],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[7],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[7],
            },

            {
                Pos: GameUtil.SeatPosV3[5],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[6],
                CardBackRot: GameUtil.CardBackRotLRV3[5],
                CardsPos: GameUtil.CardsPosLRV3[5],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[6],
                BubblePos: GameUtil.BubblePosLRV3[6],
                InsurancePos: GameUtil.InsurancePosLRV3[6],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[6],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[6],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[6],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[6],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[6],
            },

            {
                Pos: GameUtil.SeatPosV3[6],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[5],
                CardBackRot: GameUtil.CardBackRotLRV3[6],
                CardsPos: GameUtil.CardsPosLRV3[6],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[10],
                BubblePos: GameUtil.BubblePosLRV3[5],
                InsurancePos: GameUtil.InsurancePosLRV3[5],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[5],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[5],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[5],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[5],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[5],
            },

            {
                Pos: GameUtil.SeatPosV3[8],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[4],
                CardBackRot: GameUtil.CardBackRotLRV3[8],
                CardsPos: GameUtil.CardsPosLRV3[8],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[9],
                BubblePos: GameUtil.BubblePosLRV3[4],
                InsurancePos: GameUtil.InsurancePosLRV3[4],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[4],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[4],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[4],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[4],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[4],
            },

            {
                Pos: GameUtil.SeatPosV3[9],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[3],
                CardBackRot: GameUtil.CardBackRotLRV3[9],
                CardsPos: GameUtil.CardsPosLRV3[9],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[3],
                BubblePos: GameUtil.BubblePosLRV3[3],
                InsurancePos: GameUtil.InsurancePosLRV3[3],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[3],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[3],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[3],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[3],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[3],
            },

            {
                Pos: GameUtil.SeatPosV3[11],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[2],
                CardBackRot: GameUtil.CardBackRotLRV3[11],
                CardsPos: GameUtil.CardsPosLRV3[11],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[2],
                BubblePos: GameUtil.BubblePosLRV3[2],
                InsurancePos: GameUtil.InsurancePosLRV3[2],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[2],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[2],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[2],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[2],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[2],
            },

            {
                Pos: GameUtil.SeatPosV3[13],
                BankerPos: GameUtil.BankerLRV3[1],
                CardBackPos: GameUtil.CardBackLRV3[1],
                CardBackRot: GameUtil.CardBackRotLRV3[13],
                CardsPos: GameUtil.CardsPosLRV3[13],
                CurRoundHaveBetPos: GameUtil.CurRoundHaveBetPosLRV3[1],
                BubblePos: GameUtil.BubblePosLRV3[1],
                InsurancePos: GameUtil.InsurancePosLRV3[1],
                AoMaHaInsurancePos: GameUtil.AoMaHaInsurancePosLRV3[1],
                InsurancebubaoPos: GameUtil.InsuranceBubaoPosLRV3[1],
                AoMaHaInsurancebubaoPos: GameUtil.AoMaHaInsuranceBubaoPosLRV3[1],
                InsurancetoubaoPos: GameUtil.InsuranceToubaoPosLRV3[1],
                AoMaHaInsurancetoubaoPos: GameUtil.AoMaHaInsuranceToubaoPosLRV3[1],
            },
        ],
    };






    public static InstantiateTexasGame(roomType: RoomType) {

        let game: TexasGame = null;

        switch (roomType) {
            case RoomType.TexasHoldemStandardNoLimit: // 普通
            case RoomType.TexasHoldemStandardPotLimit: // 普通底池限注
            case RoomType.TexasHoldemSixPlusFixedNoLimit: // 普通短牌
            case RoomType.TexasHoldemSixPlusFixedPotLimit: // 普通短牌底池限注
                {

                    (game = GameUtil.TexasGameDic.get(roomType)) || GameUtil.TexasGameDic.set(roomType, game = new TexasGame);
                    //ComponentFactory.CreateWithId<TexasGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.TexasHoldemStandardAof: // 普通AOF
            case RoomType.TexasHoldemSixPlusFixedAof: // 普通短牌AOF
                {
                    //game = ComponentFactory.CreateWithId<TexasAofGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha4StandardNoLimit: // 奥马哈4张
            case RoomType.Omaha4StandardPotLimit: // 奥马哈4张底池限注
            case RoomType.Omaha4SixPlusFixedNoLimit: // 奥马哈4张短牌
            case RoomType.Omaha4SixPlusFixedPotLimit: // 奥马哈4张短牌, 底池限注
                {
                    // game = ComponentFactory.CreateWithId<OmahaGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha4StandardAof: // 奥马哈4张AOF
            case RoomType.Omaha4SixPlusFixedAof: // 奥马哈4张短牌AOF
                {
                    // game = ComponentFactory.CreateWithId<OmahaAofGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha5StandardNoLimit: // 奥马哈5张
            case RoomType.Omaha5StandardPotLimit: // 奥马哈5张底池限注
            case RoomType.Omaha5SixPlusFixedNoLimit: // 奥马哈5张短牌
            case RoomType.Omaha5SixPlusFixedPotLimit: // 奥马哈5张短牌底池限注
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameFive, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha5StandardAof: // 奥马哈5张aof
            case RoomType.Omaha5SixPlusFixedAof: // 奥马哈5张短牌aof
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameFiveAof, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha6StandardNoLimit: // 奥马哈6张
            case RoomType.Omaha6StandardPotLimit: // 奥马哈6张底池限注
            case RoomType.Omaha6SixPlusFixedNoLimit: // 奥马哈6张短牌
            case RoomType.Omaha6SixPlusFixedPotLimit: // 奥马哈6张短牌底池限注
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameSix, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.Omaha6StandardAof: // 奥马哈6张aof
            case RoomType.Omaha6SixPlusFixedAof: // 奥马哈6张短牌aof
                {
                    //game = ComponentFactory.CreateWithId<OmahaGameSixAof, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTTexasHoldemStandardNoLimit:
            case RoomType.MTTTexasHoldemStandardPotLimit:
            case RoomType.MTTTexasHoldemStandardAof:
            case RoomType.MTTTexasHoldemSixPlusFixedNoLimit:
            case RoomType.MTTTexasHoldemSixPlusFixedPotLimit:
            case RoomType.MTTTexasHoldemSixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTGame, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTOmaha4StandardNoLimit:
            case RoomType.MTTOmaha4StandardPotLimit:
            case RoomType.MTTOmaha4StandardAof:
            case RoomType.MTTOmaha4SixPlusFixedNoLimit:
            case RoomType.MTTOmaha4SixPlusFixedPotLimit:
            case RoomType.MTTOmaha4SixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTOmahaGameFour, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTOmaha5StandardNoLimit:
            case RoomType.MTTOmaha5StandardPotLimit:
            case RoomType.MTTOmaha5StandardAof:
            case RoomType.MTTOmaha5SixPlusFixedNoLimit:
            case RoomType.MTTOmaha5SixPlusFixedPotLimit:
            case RoomType.MTTOmaha5SixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTOmahaGameFive, Component>((int)roomType, component, fromPool);
                }
                break;

            case RoomType.MTTOmaha6StandardNoLimit:
            case RoomType.MTTOmaha6StandardPotLimit:
            case RoomType.MTTOmaha6StandardAof:
            case RoomType.MTTOmaha6SixPlusFixedNoLimit:
            case RoomType.MTTOmaha6SixPlusFixedPotLimit:
            case RoomType.MTTOmaha6SixPlusFixedAof:
                {
                    //game = ComponentFactory.CreateWithId<MTTOmahaGameSix, Component>((int)roomType, component, fromPool);
                }
                break;
        }

        return game;

    }



}
