
import Singleton from "../common/Singleton";
import TexasGame from "../game/TexasGame";
import GameUtil from "../tools/GameUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCache extends Singleton {

    static Name: string = "GameCache";

    static ins: GameCache;

    //////////////////////////////////////////////
    serviceId = null;
    roomName = null;
    room_type: number = null;
    game_type: number = null;
    poker_type = null;
    bet_type = null;
    room_id: number = 0;
    seat_count = null;
    straddle = null;
    insurance = null;
    muck_switch = null;
    voiceprint_verify_on = null;
    voiceprint_verify_duration = null;
    match_id: number = 0;

    /////////////////
    RoomUIMode: number = 0;//房间列表UI模式开关 1 模式1 ，2 模式2
    MTTEntranceMode: number = 2;//MTT开关 1 开 ，2 关


    PartialBringIn: number = 0;


    longitude: string = "0";//经度
    latitude: string = "0";//纬度


    CurGame: TexasGame = null;


    initTexasGame() {
        this.CurGame = GameUtil.InstantiateTexasGame(this.room_type);
    }

}
