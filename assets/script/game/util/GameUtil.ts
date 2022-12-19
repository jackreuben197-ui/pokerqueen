import { GameConfig } from "../../config/GameConfig";
import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefineType } from "../../define/UIDefine";
import { GM } from "../../gm/GMAPI";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import LobbySession from "../../session/LobbySession";
import UIComponent from "../../ui/UIComponent";
import { EnterRoomInfo, GameCache } from "../GameCache";
import { SeatUIInfo } from "../seat/Seat";
import MTTGame from "../texas/MTTGame";
import MTTOmahaGame4 from "../texas/MTTOmahaGame4";
import MTTOmahaGame5 from "../texas/MTTOmahaGame5";
import MTTOmahaGame6 from "../texas/MTTOmahaGame6";
import OmahaAofGame4 from "../texas/OmahaAofGame4";
import OmahaAofGame5 from "../texas/OmahaAofGame5";
import OmahaAofGame6 from "../texas/OmahaAofGame6";
import OmahaGame4 from "../texas/OmahaGame4";
import OmahaGame5 from "../texas/OmahaGame5";
import OmahaGame6 from "../texas/OmahaGame6";
import TexasAofGame from "../texas/TexasAofGame";
import TexasGame from "../texas/TexasGame";


/**
 * 游戏类型
 */
export enum GameType {
    Holdem = 0,//德州
    Omaha4 = 1,//奥马哈四张
    Omaha5 = 2,//奥马哈五张
    Omaha6 = 3,//奥马哈六张
    Plus6 = 4, //6+
}

/**
 * 扑克类型
 */
export enum PokerType {
    Normal = 0,//普通
    SixPlus = 2//短牌
}

/**
 * 下注类型
 */
export enum BetType {
    NoLimit = 0,//无限注
    PotLimit = 1,//底池限注
    Aof = 2,//aof
}
/**
 * 开放的房间类型
 */
export var OpenRoomType = [];




export enum RoomType {
    TexasHoldemStandardNoLimit = 0,               //普通局 德州--
    TexasHoldemStandardPotLimit = 1,              //普通局 德州--底池限注
    TexasHoldemStandardAof = 2,                   //普通局 德州--AOF
    TexasHoldemSixPlusFixedNoLimit = 16,          //普通局 德州--短牌
    TexasHoldemSixPlusFixedPotLimit = 17,         //普通局 德州--短牌，底池限注
    TexasHoldemSixPlusFixedAof = 18,              //普通局 德州--短牌，AOF
    Omaha4StandardNoLimit = 64,                   //奥马哈--4张，普通
    Omaha4StandardPotLimit = 65,                  //奥马哈--4张，底池限注
    Omaha4StandardAof = 66,                       //奥马哈--4张，AOF
    Omaha4SixPlusFixedNoLimit = 80,               //奥马哈--4张，短牌
    Omaha4SixPlusFixedPotLimit = 81,              //奥马哈--4张，短牌，底池限注
    Omaha4SixPlusFixedAof = 82,                   //奥马哈--4张，短牌，AOF
    Omaha5StandardNoLimit = 128,                  //奥马哈--5张，普通
    Omaha5StandardPotLimit = 129,                 //奥马哈--5张，底池限注
    Omaha5StandardAof = 130,                      //奥马哈--5张，AOF
    Omaha5SixPlusFixedNoLimit = 144,              //奥马哈--5张，短牌
    Omaha5SixPlusFixedPotLimit = 145,             //奥马哈--5张，短牌底池限注
    Omaha5SixPlusFixedAof = 146,                  //奥马哈--5张，短牌，AOF
    Omaha6StandardNoLimit = 192,                  //奥马哈--6张     
    Omaha6StandardPotLimit = 193,                 //奥马哈--6张，底池限注
    Omaha6StandardAof = 194,                      //奥马哈--6张，AOF
    Omaha6SixPlusFixedNoLimit = 208,              //奥马哈--6张，短牌
    Omaha6SixPlusFixedPotLimit = 209,             //奥马哈--6张，短牌，底池限注
    Omaha6SixPlusFixedAof = 210,                  //奥马哈--6张，短牌，AOF
    MTTTexasHoldemStandardNoLimit = 512,          //MTT--普通
    MTTTexasHoldemStandardPotLimit = 513,
    MTTTexasHoldemStandardAof = 514,
    MTTTexasHoldemSixPlusFixedNoLimit = 528,
    MTTTexasHoldemSixPlusFixedPotLimit = 529,
    MTTTexasHoldemSixPlusFixedAof = 530,
    MTTOmaha4StandardNoLimit = 576,
    MTTOmaha4StandardPotLimit = 577,
    MTTOmaha4StandardAof = 578,
    MTTOmaha4SixPlusFixedNoLimit = 592,
    MTTOmaha4SixPlusFixedPotLimit = 593,
    MTTOmaha4SixPlusFixedAof = 594,
    MTTOmaha5StandardNoLimit = 640,
    MTTOmaha5StandardPotLimit = 641,
    MTTOmaha5StandardAof = 642,
    MTTOmaha5SixPlusFixedNoLimit = 656,
    MTTOmaha5SixPlusFixedPotLimit = 657,
    MTTOmaha5SixPlusFixedAof = 658,
    MTTOmaha6StandardNoLimit = 704,
    MTTOmaha6StandardPotLimit = 705,
    MTTOmaha6StandardAof = 706,
    MTTOmaha6SixPlusFixedNoLimit = 720,
    MTTOmaha6SixPlusFixedPotLimit = 721,
    MTTOmaha6SixPlusFixedAof = 722,

    GameNiuZai = 1024, // 牛仔游戏
}


export default class GameUtil {
    private static readonly normalOuts: number[] = [0, 30, 16, 10, 8, 6, 5, 4, 3.5, 3, 2.5, 2.2, 2, 1.8, 1.6, 1.4, 1.2, 1, 0.8, 0.6, 0.5];
    private static readonly omahaOuts: number[] = [0, 24, 12, 8, 6, 4.5, 4, 3.2, 2.7, 2.3, 2, 1.7, 1.5, 1.3, 1.2, 1.1, 1, 0.8, 0.7, 0.6, 0.5];
    public static OutsList = new Map<number, number[]>();
    //游戏实例Map
    public static GameInstanceMap = new Map<RoomType, TexasGame>();
    //游戏类型映射游戏类
    public static GameMap: Map<RoomType, any> = null;

    //每套公共牌数量
    public static PublicCardMaxCount: number = 5;

    public static SeatGoldPos = [cc.v2(0, -202), cc.v2(0, -104)];

    //初始化 roomtype映射Game
    private static _SetGameMap() {

        if (this.GameMap) return;

        this.GameMap = new Map();
        //1.TexasGame基础
        this.GameMap.set(RoomType.TexasHoldemStandardNoLimit, GM.GetDebugSwitch(3) ? MTTGame : TexasGame);// 普通
        this.GameMap.set(RoomType.TexasHoldemStandardPotLimit, TexasGame);// 普通底池限注
        this.GameMap.set(RoomType.TexasHoldemSixPlusFixedNoLimit, TexasGame);// 普通短牌
        this.GameMap.set(RoomType.TexasHoldemSixPlusFixedPotLimit, TexasGame);// 普通短牌底池限注
        //2.TexasAofGame
        this.GameMap.set(RoomType.TexasHoldemStandardAof, TexasAofGame);// 普通AOF
        this.GameMap.set(RoomType.TexasHoldemSixPlusFixedAof, TexasAofGame);// 普通短牌AOF
        //3.OmahaGame4
        this.GameMap.set(RoomType.Omaha4StandardNoLimit, OmahaGame4);// 奥马哈4张
        this.GameMap.set(RoomType.Omaha4StandardPotLimit, OmahaGame4);// 奥马哈4张底池限注
        this.GameMap.set(RoomType.Omaha4SixPlusFixedNoLimit, OmahaGame4);// 奥马哈4张短牌
        this.GameMap.set(RoomType.Omaha4SixPlusFixedPotLimit, OmahaGame4);// 奥马哈4张短牌, 底池限注
        //4.OmahaAofGame4
        this.GameMap.set(RoomType.Omaha4StandardAof, OmahaAofGame4);// 奥马哈4张AOF
        this.GameMap.set(RoomType.Omaha4SixPlusFixedAof, OmahaAofGame4);// 奥马哈4张短牌AOF
        //5.OmahaGame5
        this.GameMap.set(RoomType.Omaha5StandardNoLimit, OmahaGame5);// 奥马哈5张
        this.GameMap.set(RoomType.Omaha5StandardPotLimit, OmahaGame5);// 奥马哈5张底池限注
        this.GameMap.set(RoomType.Omaha5SixPlusFixedNoLimit, OmahaGame5);// 奥马哈5张短牌
        this.GameMap.set(RoomType.Omaha5SixPlusFixedPotLimit, OmahaGame5);// 奥马哈5张短牌, 底池限注
        //6.OmahaGameFiveAof
        this.GameMap.set(RoomType.Omaha5StandardAof, OmahaAofGame5);// 奥马哈5张aof
        this.GameMap.set(RoomType.Omaha5SixPlusFixedAof, OmahaAofGame5);// 奥马哈5张短牌aof
        //7.OmahaGame6
        this.GameMap.set(RoomType.Omaha6StandardNoLimit, OmahaGame6);// 奥马哈6张
        this.GameMap.set(RoomType.Omaha6StandardPotLimit, OmahaGame6);// 奥马哈6张底池限注
        this.GameMap.set(RoomType.Omaha6SixPlusFixedNoLimit, OmahaGame6);// 奥马哈6张短牌
        this.GameMap.set(RoomType.Omaha6SixPlusFixedPotLimit, OmahaGame6);// 奥马哈6张短牌, 底池限注
        //8.OmahaGameSixAof
        this.GameMap.set(RoomType.Omaha6StandardAof, OmahaAofGame6);// 奥马哈6张aof
        this.GameMap.set(RoomType.Omaha6SixPlusFixedAof, OmahaAofGame6);// 奥马哈6张aof
        //9.MTT基础
        this.GameMap.set(RoomType.MTTTexasHoldemStandardNoLimit, MTTGame);// MTT
        this.GameMap.set(RoomType.MTTTexasHoldemStandardPotLimit, MTTGame);// 
        this.GameMap.set(RoomType.MTTTexasHoldemStandardAof, MTTGame);// 
        this.GameMap.set(RoomType.MTTTexasHoldemSixPlusFixedNoLimit, MTTGame);// 
        this.GameMap.set(RoomType.MTTTexasHoldemSixPlusFixedPotLimit, MTTGame);// 
        this.GameMap.set(RoomType.MTTTexasHoldemSixPlusFixedAof, MTTGame);// 
        //10.MTTOmahaGameFour
        this.GameMap.set(RoomType.MTTOmaha4StandardNoLimit, MTTOmahaGame4);// MTT
        this.GameMap.set(RoomType.MTTOmaha4StandardPotLimit, MTTOmahaGame4);// MTT
        this.GameMap.set(RoomType.MTTOmaha4StandardAof, MTTOmahaGame4);// MTT
        this.GameMap.set(RoomType.MTTOmaha4SixPlusFixedNoLimit, MTTOmahaGame4);// MTT
        this.GameMap.set(RoomType.MTTOmaha4SixPlusFixedPotLimit, MTTOmahaGame4);// MTT
        this.GameMap.set(RoomType.MTTOmaha4SixPlusFixedAof, MTTOmahaGame4);// MTT

        //11.MTTOmahaGameFive

        this.GameMap.set(RoomType.MTTOmaha5StandardNoLimit, MTTOmahaGame5);// MTT
        this.GameMap.set(RoomType.MTTOmaha5StandardPotLimit, MTTOmahaGame5);// MTT
        this.GameMap.set(RoomType.MTTOmaha5StandardAof, MTTOmahaGame5);// MTT
        this.GameMap.set(RoomType.MTTOmaha5SixPlusFixedNoLimit, MTTOmahaGame5);// MTT
        this.GameMap.set(RoomType.MTTOmaha5SixPlusFixedPotLimit, MTTOmahaGame5);// MTT
        this.GameMap.set(RoomType.MTTOmaha5SixPlusFixedAof, MTTOmahaGame5);// MTT

        //12.MTTOmahaGameSix
        this.GameMap.set(RoomType.MTTOmaha6StandardNoLimit, MTTOmahaGame6);// MTT
        this.GameMap.set(RoomType.MTTOmaha6StandardPotLimit, MTTOmahaGame6);// MTT
        this.GameMap.set(RoomType.MTTOmaha6StandardAof, MTTOmahaGame6);// MTT
        this.GameMap.set(RoomType.MTTOmaha6SixPlusFixedNoLimit, MTTOmahaGame6);// MTT
        this.GameMap.set(RoomType.MTTOmaha6SixPlusFixedPotLimit, MTTOmahaGame6);// MTT
        this.GameMap.set(RoomType.MTTOmaha6SixPlusFixedAof, MTTOmahaGame6);// MTT
    }
    private static GetGame(roomType: RoomType, Game_Cls: any) {
        if (!Game_Cls) return null;
        let game = GameUtil.GameInstanceMap.get(roomType);
        if (!game) {
            game = new Game_Cls();
            GameUtil.GameInstanceMap.set(roomType, game);
        }
        return game;
    }
    //是否开放的房间类型
    public static IsOpenRoomType(roomType: number): boolean {
        this._SetGameMap();
        return !!this.GameMap.get(roomType);
    }
    //实例游戏类(从缓存Map中拿去)
    public static InstantiateTexasGame(roomType: RoomType) {
        return this.GetGame(roomType, this.GameMap.get(roomType));;
    }

    //#region 牌局内座位UI信息   
    // 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    //2: 0,7
    //3: 0,4,10
    //4: 0,3,7,11
    //5: 0,3,6,8,11
    //6: 0,1,5,7,9,13
    //7: 0,2,4,6,8,10,12
    //8: 0,1,3,5,7,9,11,13
    //9: 0,1,3,5,6,8,9,11,13
    public static SeatPosV3: cc.Vec3[] = [
        cc.v3(0, -841 + 19),//0
        cc.v3(-502, -248),//1 -cc.v3(-516, -272)
        cc.v3(-502, -248),//2 -cc.v3(-516, -95)
        cc.v3(-502, 254),//3 -cc.v3(-516, 155) 
        cc.v3(-502, 300 + 19),//4 -cc.v3(-516, 495),
        cc.v3(-496, 558),//5 -cc.v3(-516, 582)
        cc.v3(-330, 893),//6 -cc.v3(-212, 987)
        cc.v3(0, 1000),//7 -cc.v3(0, 987),
        cc.v3(330, 893),//8 -cc.v3(214, 987)
        cc.v3(496, 558),//9 -cc.v3(512, 582)
        cc.v3(502, 300 + 19),//10 -cc.v3(512, 495),
        cc.v3(502, 254),//11 -cc.v3(512, 155)
        cc.v3(502, -248),//12 -cc.v3(502, -95)
        cc.v3(502, -248),//13 -cc.v3(512, -272)
    ];
    

    //上下座位 适配位置
    public static SeatAdapterPos() {

        if (cc.view.getVisibleSize().height < GameConfig.DesignResolution.height) {
            this.SeatPosV3[0].y = 522 - cc.view.getVisibleSize().height / 2;
            console.log("适配0位置:", this.SeatPosV3[0].toString());
        }
        if (cc.view.getVisibleSize().height < 2410) {
            this.SeatPosV3[7].y = cc.view.getVisibleSize().height / 2 - 205;
            console.log("适配7位置:", this.SeatPosV3[7].toString());
        }
    }



    // Dealer标识坐标 0左、1右
    public static readonly BankerLRV3: cc.Vec3[] = [

        cc.v3(105, -200),//cc.v3(138, -175),
        cc.v3(0, -180),
    ];

    // 牌背面坐标 0中下、1左下、2左中下、3左中、4左中上、5左上、6中上偏左、7中上、8中上偏右、9右上、10右中上、11右中、12右中下、13右下
    public static readonly CardBackLRV3 =
        [
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
            cc.v3(51, -42),
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
            cc.v3(374, 22),//cc.v3(374, -12.5),
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
        3: [{

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

    /// <summary>
    /// 判断是否是短牌
    /// </summary>
    /// <param name="roomType"></param>
    /// <returns></returns>
    public static JudgeIsSixPlusRoomPath(roomType: RoomType): boolean {
        let isSixPlus = false;
        switch (roomType) {
            case RoomType.TexasHoldemSixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.TexasHoldemSixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.TexasHoldemSixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.Omaha4SixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.Omaha4SixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.Omaha4SixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.Omaha5SixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.Omaha5SixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.Omaha5SixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.Omaha6SixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.Omaha6SixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.Omaha6SixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.MTTTexasHoldemSixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTTexasHoldemSixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTTexasHoldemSixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha4SixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha4SixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha4SixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha5SixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha5SixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha5SixPlusFixedAof:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha6SixPlusFixedNoLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha6SixPlusFixedPotLimit:
                isSixPlus = true;
                break;
            case RoomType.MTTOmaha6SixPlusFixedAof:
                isSixPlus = true;
                break;
            default:
                isSixPlus = false;
                break;
        }

        return isSixPlus;
    }




    /// <summary>
    /// 牌局分池位置
    /// </summary>
    public static readonly TexasPots: cc.Vec3[] = [
        // cc.v3(-71.8, 103),
        // cc.v3(-332, -130),
        // cc.v3(-65, -62.3),
        // cc.v3(295, -130),
        // cc.v3(-332, -130),
        // cc.v3(-65, -146.4),
        // cc.v3(295, -130),
        // cc.v3(-332, -230.8),
        // cc.v3(-65, -230.8),
        cc.v3(0, 103),

        cc.v3(-207, -90),
        cc.v3(0, -90),
        cc.v3(207, -90),

        cc.v3(-207, -170),
        cc.v3(0, -170),
        cc.v3(207, -170),

        cc.v3(-97, -250),
        cc.v3(97, -250),

    ];

    static get isInGameplay() {
        return GameCache.Instance.CurrentRoomID != 0;
    }

    public static GetCardNameByNum(cardNum: number): string {
        if (cardNum <= 0) {
            return "poker_88";
        }
        if (cardNum < 10) {
            return `poker_dz_0${cardNum}`;
        }
        else {
            return `poker_dz_${cardNum}`;
        }
    }


    /// <summary>
    /// 判断是否是底池限注
    /// </summary>
    /// <param name="roomType"></param>
    /// <returns></returns>
    public static JudgeIsPotLimitRoomPath(roomType: RoomType): boolean {
        let isPotLimit: boolean = false;
        switch (roomType) {
            case RoomType.MTTOmaha4SixPlusFixedPotLimit:
            case RoomType.MTTOmaha4StandardPotLimit:
            case RoomType.MTTOmaha5SixPlusFixedPotLimit:
            case RoomType.MTTOmaha5StandardPotLimit:
            case RoomType.MTTOmaha6SixPlusFixedPotLimit:
            case RoomType.MTTOmaha6StandardPotLimit:
            case RoomType.MTTTexasHoldemSixPlusFixedPotLimit:
            case RoomType.MTTTexasHoldemStandardPotLimit:
            case RoomType.Omaha4SixPlusFixedPotLimit:
            case RoomType.Omaha4StandardPotLimit:
            case RoomType.Omaha5SixPlusFixedPotLimit:
            case RoomType.Omaha5StandardPotLimit:
            case RoomType.Omaha6SixPlusFixedPotLimit:
            case RoomType.Omaha6StandardPotLimit:
            case RoomType.TexasHoldemSixPlusFixedPotLimit:
            case RoomType.TexasHoldemStandardPotLimit:
                isPotLimit = true;
                break;
            default:
                isPotLimit = false;
                break;
        }
        return isPotLimit;
    }


    //判断是否是奥马哈
    public static JudgeIsOmahaRoomPath(roomType: RoomType): boolean {
        let isOmaha: boolean = false;
        switch (roomType) {
            case RoomType.Omaha4StandardNoLimit:

            case RoomType.Omaha4StandardPotLimit:

            case RoomType.Omaha4StandardAof:

            case RoomType.Omaha4SixPlusFixedNoLimit:

            case RoomType.Omaha4SixPlusFixedPotLimit:

            case RoomType.Omaha4SixPlusFixedAof:

            case RoomType.Omaha5StandardNoLimit:

            case RoomType.Omaha5StandardPotLimit:

            case RoomType.Omaha5StandardAof:

            case RoomType.Omaha5SixPlusFixedNoLimit:

            case RoomType.Omaha5SixPlusFixedPotLimit:

            case RoomType.Omaha5SixPlusFixedAof:

            case RoomType.Omaha6StandardNoLimit:

            case RoomType.Omaha6StandardPotLimit:

            case RoomType.Omaha6StandardAof:

            case RoomType.Omaha6SixPlusFixedNoLimit:

            case RoomType.Omaha6SixPlusFixedPotLimit:

            case RoomType.Omaha6SixPlusFixedAof:

            case RoomType.MTTOmaha4StandardNoLimit:

            case RoomType.MTTOmaha4StandardPotLimit:

            case RoomType.MTTOmaha4StandardAof:

            case RoomType.MTTOmaha4SixPlusFixedNoLimit:

            case RoomType.MTTOmaha4SixPlusFixedPotLimit:

            case RoomType.MTTOmaha4SixPlusFixedAof:

            case RoomType.MTTOmaha5StandardNoLimit:

            case RoomType.MTTOmaha5StandardPotLimit:

            case RoomType.MTTOmaha5StandardAof:

            case RoomType.MTTOmaha5SixPlusFixedNoLimit:

            case RoomType.MTTOmaha5SixPlusFixedPotLimit:

            case RoomType.MTTOmaha5SixPlusFixedAof:

            case RoomType.MTTOmaha6StandardNoLimit:

            case RoomType.MTTOmaha6StandardPotLimit:

            case RoomType.MTTOmaha6StandardAof:

            case RoomType.MTTOmaha6SixPlusFixedNoLimit:

            case RoomType.MTTOmaha6SixPlusFixedPotLimit:

            case RoomType.MTTOmaha6SixPlusFixedAof:
                isOmaha = true;
                break;
            default:
                isOmaha = false;
                break;
        }

        return isOmaha;
    }



    /// <summary>
    /// 源变换本地坐标转化为目标变换本地坐标
    /// </summary>
    /// <param name="sourceLocalPos">源本地坐标</param>
    /// <param name="sourceTransform">源变换</param>
    /// <param name="targetTransform">目标变换</param>
    /// <returns>目标本地坐标</returns>
    public static ChangeToLocalPos(sourceLocalPos: cc.Vec3, sourceTransform: cc.Node, targetTransform: cc.Node): cc.Vec3 {
        let w = sourceTransform.convertToWorldSpaceAR(sourceLocalPos);
        let l = targetTransform.convertToNodeSpaceAR(w);
        return l;
        //return targetTransform.InverseTransformPoint(sourceTransform.TransformPoint(sourceLocalPos));
    }

    /// <summary>
    /// 查看公共牌花费
    /// </summary>
    /// <param name="small"></param>
    /// <returns></returns>
    public static GetSeeMoreCost(small: number): number {
        return 50;
    }


    /**
     * 座位上元素的位置 2,4,5,6 张牌
     */
    public static Seat_ElementPos: {
        [key: number]:
        {
            myCardsPos?: cc.Vec3[],
            backSmallCardPos?: cc.Vec3[],
            smallCardPos?: cc.Vec3[],
            myCardTypePos?: cc.Vec3[],
            voiceStatePositon?: cc.Vec3,
            myCardsScale?: number,
        }
    } =
        {
            2: {
                myCardsPos: [
                    cc.v3(-73, -12),
                    cc.v3(73, -12),
                ],
                backSmallCardPos: [
                    cc.v3(-5, 2),
                    cc.v3(-5 - 16, 2),
                ],
                smallCardPos: [
                    cc.v3(-29, 0),
                    cc.v3(35, 0),
                ],
                myCardTypePos: [cc.v3(-80, -243)],
                voiceStatePositon: cc.v3(284, -237, 0),

                myCardsScale: 1
            },
            4: {
                myCardsPos: [
                    cc.v3(-157, -12),
                    cc.v3(-157 + 107, -12),
                    cc.v3(-157 + 107 * 2, -12),
                    cc.v3(-157 + 107 * 3, -12),
                ],
                backSmallCardPos: [
                    cc.v3(-5, 2),
                    cc.v3(-5 - 16, 2),
                    cc.v3(-5 - 16 * 2, 2),
                    cc.v3(-5 - 16 * 3, 2),
                ],
                smallCardPos: [
                    cc.v3(-60, 0),
                    cc.v3(-17, 0),
                    cc.v3(26, 0),
                    cc.v3(70, 0),
                ],
                myCardTypePos: [cc.v3(-117, -243)],
                voiceStatePositon: cc.v3(335.4, -232, 0),

                myCardsScale: 1
            },
            5: {
                myCardsPos: [
                    cc.v3(-157, -12),
                    cc.v3(-157 + 80, -12),
                    cc.v3(-157 + 80 * 2, -12),
                    cc.v3(-157 + 80 * 3, -12),
                    cc.v3(-157 + 80 * 4, -12),
                ],
                backSmallCardPos: [
                    cc.v3(-5, 2),
                    cc.v3(-5 - 16, 2),
                    cc.v3(-5 - 16 * 2, 2),
                    cc.v3(-5 - 16 * 3, 2),
                    cc.v3(-5 - 16 * 4, 2),
                ],
                smallCardPos: [
                    cc.v3(-60, 0),
                    cc.v3(-27.5, 0),
                    cc.v3(5, 0),
                    cc.v3(37.5, 0),
                    cc.v3(70, 0),
                ],
                myCardTypePos: [cc.v3(-117, -243)],
                voiceStatePositon: cc.v3(446, -233, 0),

                myCardsScale: .8
            },
            6: {
                myCardsPos: [
                    cc.v3(-163, -12),
                    cc.v3(-163 + 66, -12),
                    cc.v3(-163 + 66 * 2, -12),
                    cc.v3(-163 + 66 * 3, -12),
                    cc.v3(-163 + 66 * 4, -12),
                    cc.v3(-163 + 66 * 5, -12),
                ],
                backSmallCardPos: [
                    cc.v3(-5, 2),
                    cc.v3(-5 - 16, 2),
                    cc.v3(-5 - 16 * 2, 2),
                    cc.v3(-5 - 16 * 3, 2),
                    cc.v3(-5 - 16 * 4, 2),
                    cc.v3(-5 - 16 * 5, 2),
                ],
                smallCardPos: [
                    cc.v3(-60, 0),
                    cc.v3(-34, 0),
                    cc.v3(-8, 0),
                    cc.v3(18, 0),
                    cc.v3(44, 0),
                    cc.v3(70, 0),
                ],
                myCardTypePos: [cc.v3(-117, -243)],
                voiceStatePositon: cc.v3(515, -237, 0),
                myCardsScale: .7
            },
        }

    public static GetOddsByPlayerNum(playerNum: number, selectOuts: number): number {
        selectOuts -= 1;//从数组零下标开始
        let outs: number[] = [];
        //this.OutsList.TryGetValue(playerNum, out outs);
        let value = this.OutsList.get(playerNum);

        if (value) outs = value;

        if (selectOuts > outs.length && selectOuts <= 30) {
            return outs[outs.length - 1];
        }
        if (selectOuts > 30)
            return 0;
        if (selectOuts < 0) {
            return 0;
        }
        return outs[selectOuts];
    }

    /**
     * 
     * @param enter_room_info 
     * @param delay 进入延迟时间
     * @param fromUI 
     * @returns 
     */
    public static async EnterRoomAPI(enter_room_info: EnterRoomInfo, fromUIs?: UIDefineType[]) {
        let room_type: number = enter_room_info.room_type;
        console.log("EnterRoom room_type:", room_type);
        //未开放房间类型
        if (!GameUtil.IsOpenRoomType(room_type)) {
            UIComponent.Instance.Toast(i18nMgr.Get("adaptation10301"));
            return;
        }
        if (WebSocketClient.CheckOpen()) {
            if (RoomType[room_type]) {
                let response = await LobbySession.APIWebUserRoominsur(enter_room_info.rid).catch(() => { });

                if (response) {
                    //GC.data.lobby.roomList.selected = this._data;

                    GameCache.Instance.InitEnterRoomInfo(enter_room_info);

                    ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, { fromUIs: fromUIs });//[this.UIDefine, false, 0]
                }
            } else {
                console.warn("房间类型未解析:", enter_room_info.room_type);
                UIComponent.Instance.Toast(`room_type:${enter_room_info.room_type} is error`);
            }
        }
    }

    public static EnterMTTRoom(param: { fromUIs?: UIDefineType[], isLookOn?: boolean }) {

        let room_type: number = GameCache.Instance.room_type;

        console.log("EnterMTTRoom room_type:", room_type);
        //未开放房间类型
        if (!GameUtil.IsOpenRoomType(room_type)) {
            UIComponent.Instance.Toast(i18nMgr.Get("adaptation10301"));
            return;
        }
        if (WebSocketClient.CheckOpen()) {
            if (RoomType[room_type]) {
                ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, param);//[this.UIDefine, false, 0]
            }
            else {
                console.warn("房间类型未解析:", room_type);
                UIComponent.Instance.Toast(`room_type:${room_type} is error`);
            }
        }
    }
}
(window as any).GameUtil = GameUtil;
