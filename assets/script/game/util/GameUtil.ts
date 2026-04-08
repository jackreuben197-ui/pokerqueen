import { GameConfig } from "../../config/GameConfig";
import { ProcedureEnum } from "../../define/EIDefine";
import { UIDefineType } from "../../define/UIDefine";
import { GM } from "../../gm/GMAPI";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import WebSocketClient from "../../net/websocket/WebSocketClient";
import LobbySession from "../../session/LobbySession";
import UIComponent from "../../ui/UIComponent";
import { EnterRoomInfo, GameCache } from "../GameCache";
import Seat, { SeatUIInfo } from "../seat/Seat";
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






export class some_pos {

    //所有座位位置
    public static readonly all_seat_pos = [
        cc.v3(0, -2270), //  0 下中

        cc.v3(-480, -1580),//1 左下
        cc.v3(-480, -1155),//2 左中
        cc.v3(-480, -730),//3 左上

        cc.v3(-165, -440),//4 上左
        cc.v3(0, -440),//5 上中
        cc.v3(165, -440),//6 上右

        cc.v3(480, -730),//7 右上
        cc.v3(480, -1155),//8 右中
        cc.v3(480, -1580),//9 右下
    ];
    // 所有庄家bank位置
    public static all_bank_pos: cc.Vec3[] = [
        cc.v3(-300, 0),//中下为自己的位置

        cc.v3(0, -224),//除自己外所有方位的位置
        cc.v3(0, -224),
        cc.v3(0, -224),

        cc.v3(-160, -120),
        cc.v3(-160, -120),
        cc.v3(160, -120),

        cc.v3(0, -224),
        cc.v3(0, -224),
        cc.v3(0, -224),

        cc.v3(-300, 0),// 10 中下为自己的位置
        cc.v3(-300, 0),// 11 中下为其他玩家的位置
    ];
    //所有手上背面牌容器坐标
    public static readonly all_card_back_pos: cc.Vec3[] = [
        cc.v3(160, 5),

        cc.v3(160, 5),
        cc.v3(160, 5),
        cc.v3(160, 5),

        cc.v3(-160, 5),
        cc.v3(-160, 5),
        cc.v3(160, 5),

        cc.v3(-160, 5),
        cc.v3(-160, 5),
        cc.v3(-160, 5),
    ];
    //所有下注筹码位置
    public static readonly all_bet_pos: cc.Vec3[] = [
        cc.v3(135, -60), //  0 下中

        cc.v3(135, -60),//1 左下
        cc.v3(135, -60),//2 左中
        cc.v3(135, -60),//3 左上

        cc.v3(-5, -210),//4 上左
        cc.v3(-5, -210),//5 上中
        cc.v3(5, -210),//6 上右

        cc.v3(-135, -60),//7 右上
        cc.v3(-135, -60),//8 右中
        cc.v3(-135, -60),//9 右下

        cc.v3(135, 370),// 10 中下为自己时候的位置
        cc.v3(135, -60),//11 中下为其他玩家时候的位置


    ];
    //所有气泡位置
    public static readonly all_bubble_pos: cc.Vec3[] = [
        cc.v3(0, 100),
        cc.v3(0, 100),
        cc.v3(0, 100),
        cc.v3(0, 100),
        cc.v3(0, 100),
        cc.v3(0, 100),
        cc.v3(-0, 100),
        cc.v3(-0, 100),
        cc.v3(-0, 100),
        cc.v3(-0, 100),
    ];
    //保险时间位置

    public static readonly all_insurance_pos: cc.Vec3[] = [
        cc.v3(190, 28),
        cc.v3(190, 28),
        cc.v3(190, 28),
        cc.v3(190, 28),
        cc.v3(190, 28),
        cc.v3(190, 28),
        cc.v3(-190, 28),
        cc.v3(-190, 28),
        cc.v3(-190, 28),
        cc.v3(-190, 28),
    ];

    //蘑菇位置
    public static readonly all_mushroom_pos: cc.Vec3[] = [
        cc.v3(80, 55),//中下为自己的位置

        cc.v3(80, 55),//除自己外所有方位的位置
        cc.v3(80, 55),
        cc.v3(80, 55),

        cc.v3(80, 55),
        cc.v3(80, 55),
        cc.v3(-80, 55),

        cc.v3(-80, 55),
        cc.v3(-80, 55),
        cc.v3(-80, 55),

        cc.v3(80, 55),// 10 中下为自己的位置
        cc.v3(80, 55),// 11 中下为其他玩家的位置
    ]
    //蘑菇数字容器位置（相对于 MushroomPool）
    public static readonly all_mushroom_label_pos: cc.Vec3[] = [
        cc.v3(20, 55, 0),   // 0

        cc.v3(20, 55, 0),   // 1
        cc.v3(20, 55, 0),   // 2
        cc.v3(20, 55, 0),   // 3

        cc.v3(20, 55, 0),  // 4
        cc.v3(-20, 55, 0),   // 5
        cc.v3(-20, 55, 0),   // 6

        cc.v3(-20, 55, 0),  // 7
        cc.v3(-20, 55, 0),  // 8
        cc.v3(-20, 55, 0),  // 9

        cc.v3(20, 55, 0),   // 10
        cc.v3(20, 55, 0),   // 11
    ]
    //蘑菇价值文本位置（相对于 MushroomLabel）
    public static readonly all_mushroom_chip_pos: cc.Vec3[] = [
        cc.v3(-65, 50, 0), // 0

        cc.v3(-65, 50, 0), // 1
        cc.v3(-65, 50, 0), // 2
        cc.v3(-65, 50, 0), // 3

        cc.v3(-65, 50, 0),  // 4
        cc.v3(-65, 50, 0), // 5
        cc.v3(75, 50, 0), // 6

        cc.v3(75, 50, 0),  // 7
        cc.v3(75, 50, 0),  // 8
        cc.v3(75, 50, 0),  // 9

        cc.v3(-65, 50, 0), // 10
        cc.v3(-65, 50, 0), // 11
    ]
    //鱿鱼位置
    public static readonly all_squid_pos: cc.Vec3[] = [
        cc.v3(80, 50),//中下为自己的位置

        cc.v3(80, 50),//除自己外所有方位的位置
        cc.v3(80, 50),
        cc.v3(80, 50),

        cc.v3(80, 50),
        cc.v3(80, 50),
        cc.v3(-95, 50),

        cc.v3(-95, 50),
        cc.v3(-95, 50),
        cc.v3(-95, 50),

        cc.v3(80, 50),// 10 中下为自己的位置
        cc.v3(80, 50),// 11 中下为其他玩家的位置
    ]
}
export class seat_info {
    seat_pos: cc.Vec3 = null;
    bank_pos: cc.Vec3 = null;
    card_back_pos: cc.Vec3 = null;
    bet_pos: cc.Vec3 = null;
    bubble_pos: cc.Vec3 = null;
    insurance_pos: cc.Vec3 = null;
    mushroom_pos: cc.Vec3 = null;
    mushroom_label_pos: cc.Vec3 = null;
    mushroom_chip_pos: cc.Vec3 = null;
    squid_pos: cc.Vec3 = null;
    squid_label_pos: cc.Vec3 = null;
    constructor(public index: number) {
        this.seat_pos = some_pos.all_seat_pos[index];
        this.bank_pos = some_pos.all_bank_pos[index];
        this.card_back_pos = some_pos.all_card_back_pos[index];
        this.bet_pos = some_pos.all_bet_pos[index];
        this.bubble_pos = some_pos.all_bubble_pos[index];
        this.insurance_pos = some_pos.all_insurance_pos[index];
        this.mushroom_pos = some_pos.all_mushroom_pos[index];
        this.mushroom_label_pos = some_pos.all_mushroom_label_pos[index];
        this.mushroom_chip_pos = some_pos.all_mushroom_chip_pos[index];
        this.squid_pos = some_pos.all_squid_pos[index];
        this.squid_label_pos = some_pos.all_mushroom_label_pos[index];
    }
}
/**
 * 游戏类型
 */
export enum GameType {
    Holdem = 0,//德州
    Omaha4 = 1,//奥马哈四张
    Omaha5 = 2,//奥马哈五张
    Omaha6 = 3,//奥马哈六张
    Plus6 = 4, //6+
    All = 5, //全部

}
/**
 * 游戏类型
 */
export enum Game_Type {
    All = 0, //6+
    Holdem = 1,//德州
    Plo = 2,
    Plus6 = 3, //6+
}
export enum Table_Type {
    club = 0,
    holl = 1,
    friend = 2,
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

//牌桌進入類型
export enum GameEnterType {
    Lobby,
    Club,
    Friend,
    MTT,
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

    public static SeatGoldPos = [cc.v2(0, -109), cc.v2(0, -187)];

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


    //座位位置配置
    public static pos_config = {
        2: [
            new seat_info(0),
            new seat_info(5),
        ],
        3: [
            new seat_info(0),
            new seat_info(3),
            new seat_info(7),
        ],
        4: [
            new seat_info(0),
            new seat_info(2),
            new seat_info(5),
            new seat_info(8),
        ],
        5: [
            new seat_info(0),
            new seat_info(2),
            new seat_info(4),
            new seat_info(6),
            new seat_info(8),
        ],
        6: [
            new seat_info(0),
            new seat_info(1),
            new seat_info(3),
            new seat_info(5),
            new seat_info(7),
            new seat_info(9),
        ],
        7: [
            new seat_info(0),
            new seat_info(1),
            new seat_info(3),
            new seat_info(4),
            new seat_info(6),
            new seat_info(7),
            new seat_info(9),
        ],
        8: [
            new seat_info(0),
            new seat_info(1),
            new seat_info(2),
            new seat_info(3),
            new seat_info(5),
            new seat_info(7),
            new seat_info(8),
            new seat_info(9),
        ],
        9: [
            new seat_info(0),
            new seat_info(1),
            new seat_info(2),
            new seat_info(3),
            new seat_info(4),
            new seat_info(6),
            new seat_info(7),
            new seat_info(8),
            new seat_info(9),
        ]
    }

    //目前每次坐下需要重置0号位置的bankPos
    public static ResetSeatInfo() {
        //bank庄家位置
        some_pos.all_bank_pos[0].x = some_pos.all_bank_pos[11].x;
        some_pos.all_bank_pos[0].y = some_pos.all_bank_pos[11].y;
        //筹码位置
        some_pos.all_bet_pos[0].x = some_pos.all_bet_pos[11].x;
        some_pos.all_bet_pos[0].y = some_pos.all_bet_pos[11].y;

        console.log("重置位置:", some_pos.all_bet_pos[0].x, some_pos.all_bet_pos[0].y);

    }
    //刷新自己位bank_pos
    public static RefreshMeBankPos() {
        //bank庄家位置
        some_pos.all_bank_pos[0].x = some_pos.all_bank_pos[10].x;
        some_pos.all_bank_pos[0].y = some_pos.all_bank_pos[10].y;
        //筹码位置
        some_pos.all_bet_pos[0].x = some_pos.all_bet_pos[10].x;
        some_pos.all_bet_pos[0].y = some_pos.all_bet_pos[10].y;

        console.log("刷新位置:", some_pos.all_bet_pos[0].x, some_pos.all_bet_pos[0].y);
    }

    //上下座位 适配位置
    public static SeatAdapterPos() {

        // if (cc.view.getVisibleSize().height < GameConfig.DesignResolution.height) {
        //     this.SeatPosV3[0].y = 522 - cc.view.getVisibleSize().height / 2;
        //     console.log("适配0位置:", this.SeatPosV3[0].toString());
        // }
        // if (cc.view.getVisibleSize().height < 2410) {
        //     this.SeatPosV3[7].y = cc.view.getVisibleSize().height / 2 - 205;
        //     console.log("适配7位置:", this.SeatPosV3[7].toString());
        // }
    }

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

        cc.v3(0, -812),

        cc.v3(-283, -960),
        cc.v3(0, -960),
        cc.v3(283, -960),

        cc.v3(-283, -1025),
        cc.v3(0, -1025),
        cc.v3(283, -1025),

        cc.v3(-143, -1090),
        cc.v3(143, -1090),

    ];




    static get isInGameplay() {
        return GameCache.Instance.CurrentRoomID != 0;
    }

    //扑克映射表 服务端 : 客户端
    private static Poker_Map = {
        //桃
        2: { res: 1, show: "♠2" },
        3: { res: 2, show: "♠3" },
        4: { res: 3, show: "♠4" },
        5: { res: 4, show: "♠5" },
        6: { res: 5, show: "♠6" },
        7: { res: 6, show: "♠7" },
        8: { res: 7, show: "♠8" },
        9: { res: 8, show: "♠9" },
        10: { res: 9, show: "♠10" },
        11: { res: 10, show: "♠J" },
        12: { res: 11, show: "♠Q" },
        13: { res: 12, show: "♠K" },
        14: { res: 0, show: "♠A" },
        //心
        17: { res: 14, show: "♥2" },
        18: { res: 15, show: "♥3" },
        19: { res: 16, show: "♥4" },
        20: { res: 17, show: "♥5" },
        21: { res: 18, show: "♥6" },
        22: { res: 19, show: "♥7" },
        23: { res: 20, show: "♥8" },
        24: { res: 21, show: "♥9" },
        25: { res: 22, show: "♥10" },
        26: { res: 23, show: "♥J" },
        27: { res: 24, show: "♥Q" },
        28: { res: 25, show: "♥K" },
        29: { res: 13, show: "♥A" },
        //梅
        32: { res: 27, show: "♣2" },
        33: { res: 28, show: "♣3" },
        34: { res: 29, show: "♣4" },
        35: { res: 30, show: "♣5" },
        36: { res: 31, show: "♣6" },
        37: { res: 32, show: "♣7" },
        38: { res: 33, show: "♣8" },
        39: { res: 34, show: "♣9" },
        40: { res: 35, show: "♣10" },
        41: { res: 36, show: "♣J" },
        42: { res: 37, show: "♣Q" },
        43: { res: 38, show: "♣K" },
        44: { res: 26, show: "♣A" },
        //方块
        47: { res: 40, show: "♢2" },
        48: { res: 41, show: "♢3" },
        49: { res: 42, show: "♢4" },
        50: { res: 43, show: "♢5" },
        51: { res: 44, show: "♢6" },
        52: { res: 45, show: "♢7" },
        53: { res: 46, show: "♢8" },
        54: { res: 47, show: "♢9" },
        55: { res: 48, show: "♢10" },
        56: { res: 49, show: "♢J" },
        57: { res: 50, show: "♢Q" },
        58: { res: 51, show: "♢K" },
        59: { res: 39, show: "♢A" },
    }
    public static GetCardNameByNum(n: number): string {

        if (n > 0) {
            return `p_${this.Poker_Map[n].res}`;
        }
        return "p_88";
    }

    public static showPais(list: number[], flag: string = "卡牌:") {
        let pais = [];
        list.forEach(item => {
            pais.push(this.Poker_Map[item].show);
        })
        console.log(flag, pais);
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
                    cc.v3(-65, 216),
                    cc.v3(65, 216),
                ],
                backSmallCardPos: [
                    cc.v3(-15, 5),
                    cc.v3(15, 5),
                ],
                smallCardPos: [
                    cc.v3(-48, 0),
                    cc.v3(45, 0),
                ],
                myCardTypePos: [cc.v3(-218, -258)],
                voiceStatePositon: cc.v3(284, -237, 0),

                myCardsScale: 1
            },
            4: {
                myCardsPos: [
                    cc.v3(-120, 216),
                    cc.v3(-40, 216),
                    cc.v3(40, 216),
                    cc.v3(120, 216),
                ],
                backSmallCardPos: [
                    cc.v3(-30, 5),
                    cc.v3(-10, 5),
                    cc.v3(10, 5),
                    cc.v3(30, 5),
                ],
                smallCardPos: [
                    cc.v3(-42, 0),
                    cc.v3(-15, 0),
                    cc.v3(11, 0),
                    cc.v3(38, 0),
                ],
                myCardTypePos: [cc.v3(-291, -258)],
                voiceStatePositon: cc.v3(335.4, -232, 0),

                myCardsScale: 1
            },
            5: {
                myCardsPos: [
                    cc.v3(-120, 216),
                    cc.v3(-60, 216),
                    cc.v3(0, 216),
                    cc.v3(60, 216),
                    cc.v3(120, 216),
                ],
                backSmallCardPos: [
                    cc.v3(-40, 5),
                    cc.v3(-20, 5),
                    cc.v3(0, 5),
                    cc.v3(20, 5),
                    cc.v3(40, 5),
                ],
                smallCardPos: [
                    cc.v3(-55, 0),
                    cc.v3(-28, 0),
                    cc.v3(-3, 0),
                    cc.v3(24, 0),
                    cc.v3(52, 0),
                ],
                myCardTypePos: [cc.v3(-338, -258)],
                voiceStatePositon: cc.v3(446, -233, 0),

                myCardsScale: 1
            },
            6: {
                myCardsPos: [
                    cc.v3(-150, 216),
                    cc.v3(-90, 216),
                    cc.v3(-30, 216),
                    cc.v3(30, 216),
                    cc.v3(90, 216),
                    cc.v3(150, 216),
                ],
                backSmallCardPos: [
                    cc.v3(-50, 5),
                    cc.v3(-30, 5),
                    cc.v3(-10, 5),
                    cc.v3(10, 5),
                    cc.v3(30, 5),
                    cc.v3(50, 5),
                ],
                smallCardPos: [
                    cc.v3(-68, 0),
                    cc.v3(-42, 0),
                    cc.v3(-15, 0),
                    cc.v3(11, 0),
                    cc.v3(37, 0),
                    cc.v3(64, 0),
                ],
                myCardTypePos: [cc.v3(-387, -258)],
                voiceStatePositon: cc.v3(515, -237, 0),
                myCardsScale: 1
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
        if (selectOuts > 30 || selectOuts < 0) return 0;

        return outs[selectOuts];
    }

    /**
     * 
     * @param enter_room_info 
     * @param delay 进入延迟时间
     * @param fromUI 
     * @returns 
     */
    public static async EnterRoomAPI(enter_room_info: EnterRoomInfo, enter_param: any = null) {
        //, fromUIs?: UIDefineType[]) {
        //注释掉  2023/3/20
        // if (!GameCache.Instance.hasClub) {
        //     UIComponent.Instance.ToastLanguage("error2005");
        //     return;
        // }
        let room_type: number = enter_room_info.room_type;
        //未开放房间类型
        if (!GameUtil.IsOpenRoomType(room_type)) {
            cc.log("未开放的房间类型:", room_type);
            UIComponent.Instance.Toast(i18nMgr.Get("adaptation10301"));
            return;
        }
        if (WebSocketClient.CheckOpen()) {
            if (RoomType[room_type]) {
                let response = await LobbySession.APIWebUserRoominsur(enter_room_info.rid).catch((e) => {
                    console.log(e);
                });

                if (response) {
                    //GC.data.lobby.roomList.selected = this._data;

                    GameCache.Instance.InitEnterRoomInfo(enter_room_info);

                    ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, enter_param);
                    //{ fromUIs: fromUIs });
                }
            } else {
                console.warn("房间类型未解析:", enter_room_info.room_type);
                UIComponent.Instance.Toast(`room_type:${enter_room_info.room_type} is error`);
            }
        }
    }

    public static EnterMTTRoom(param) {

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


    //获取 公会或者朋友桌类型 1 朋友桌，2 工会内部桌。3 大厅桌
    public static GetFriendsOrClubTable(): number {

        let tableType = 3;

        if (GameCache.Instance.share_table == 1) {
            if (GameCache.Instance.origin_type == 4) tableType = 1;
            if (GameCache.Instance.origin_type == 3) tableType = 2;
        }
        return tableType;
    }


    //桌布渐变色
    public static Table_Colors = [
        ["3B4374", "181B2A"],
        ["3B6374", "142428"],
        ["3B745F", "142821"],
        ["583B74", "21182A"],
        ["743B61", "2A1824"],
        ["743B3B", "2A1818"],
        ["5D473A", "2D231C"],
    ]


    //转换筹码值(BB开关显示BB单位)
    public static TransBetValue(value: number, bigBlind: number = 0): string {
        bigBlind > 0 || (bigBlind = GameCache.Instance.carry_small);
        let ratio = GameCache.Instance.bb_on ? bigBlind : 100;
        let ex: string = GameCache.Instance.bb_on ? "BB" : "";
        return `${StringHelper.GetDecimalN(value / ratio)}${ex}`;
    }

}
(window as any).GameUtil = GameUtil;
(window as any).some_pos = some_pos;

// public static GetCardNameByNum(cardNum: number): string {
//     if (cardNum <= 0) {
//         return "poker_88";
//     }
//     if (cardNum < 10) {
//         return `poker_dz_0${cardNum}`;
//     }
//     else {
//         return `poker_dz_${cardNum}`;
//     }
// }
