
import { GameCache } from "../game/GameCache";
import Seat from "../game/seat/Seat";
import HttpRequest from "../net/https/HttpRequest";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";

export class GM {
    private static __DebugSwitch: number[] = null;
    public static SetDebugSwitch(obj: string) {
        if (!obj) return;
        let list: any[] = obj.split(",");
        for (let i = 0; i < list.length; i++) {
            list[i] = +list[i];
        }
        this.__DebugSwitch = list;
    }
    //房间id开启显示
    static switch_roomid_show: boolean = false;
    /**
     * id 
     * 1:显示座位id
     * 2:调试 非MTT 房间Enter数据
     * 3.调试 MTT 房间Enter数据
     */
    public static GetDebugSwitch(id: number): boolean {
        return this.__DebugSwitch?.indexOf(id) > -1;
    }

    //user/room 模拟数据
    static Moni_user_room = 
    {
        "last_bring_out":null,
        "return_table":false,
        "wallet":[
            {
                "w_u_id":6727,
                "club_id":47,
                "tribe_id":3,
                "gold":18900,
                "gold_lock":0,
                "wallet_status":3,
                "gold_type":1,
                "gold_currency":"USD",
                "user_status":0,
                "user_type":0,
                "club_random_id":928776,
                "club_name":"超级联盟"
            }
        ]
    }

    //MTT进入房间模拟数据
    static Moni_MTT_ServerMessageEnterRoom: { seat_count: number, rec: ServerMessageEnterRoom.AsObject } = {
        seat_count: 9,
        rec:
        {
            "status": 0,
            "gameStatus": 3,
            "roomInfo": {
                "ante": 0,
                "smallBlind": 10000,
                "scheduleStartTime": 0,
                "schedulePlayDuration": 0,
                "startTime": 1667992583,
                "currentMinRate": 0,
                "currentMaxRate": 0,
                "limitIp": false,
                "limitGps": false,
                "insurance": false,
                "limitPoolRateAllLv": false,
                "limitMinPoolRate": 0,
                "limitRetainMinRate": 0,
                "limitTotalHandNumAllLv": false,
                "limitTotalHandNum": 0,
                "delaySeeCard": false,
                "straddle": false,
                "opDuration": 15,
                "retainType": 0,
                "muck": false,
                "uniqueId": "1667992583",
                "isAgreeSecondPcs": false
            },
            "handInfo": {
                "handNum": 12,
                "buSeatId": 7,
                "sbSeatId": 7,
                "bbSeatId": 5,
                "publicCardsList": [

                ],
                "allBet": 40000,
                "potsList": [

                ],
                "roundBet": 20000,
                "insurancePool": 0,
                "extPublicCardsList": [

                ]
            },
            "playersList": [
                {
                    "seatId": 7,
                    "userRid": 92955898,
                    "action": 6,
                    "cardsList": [
                        17,
                        24
                    ],
                    "name": "Player",
                    "avatar": "http://static.awanptesting.com/image-normal/20220310094859-noCSy.png",
                    "sex": 0,
                    "chip": 10000,
                    "handBet": 20000,
                    "roundBet": 20000,
                    "status": 1,
                    "keepSeatLeftTime": -1,
                    "buyInsuranceStep": 0,
                    "buyInsuranceList": [

                    ],
                    "isAutoop": false,
                    "roundActioned": true,
                    "hunterKill": 0,
                    "hunterKillAward": 0,
                    "hunterKillAwardOther": 0,
                    "hunterHeadValue": 0,
                    "vip": 0
                },
                {
                    "seatId": 5,
                    "userRid": 98123898,
                    "action": 3,
                    "cardsList": [
                        0,
                        0
                    ],
                    "name": "Player",
                    "avatar": "http://static.awanptesting.com/image-normal/20220310094859-noCSy.png",
                    "sex": 0,
                    "chip": 30000,
                    "handBet": 20000,
                    "roundBet": 20000,
                    "status": 1,
                    "keepSeatLeftTime": -1,
                    "buyInsuranceStep": 0,
                    "buyInsuranceList": [

                    ],
                    "isAutoop": false,
                    "roundActioned": false,
                    "hunterKill": 0,
                    "hunterKillAward": 0,
                    "hunterKillAwardOther": 0,
                    "hunterHeadValue": 0,
                    "vip": 0
                }
            ],
            "myInfo": {
                "chip": 10000,
                "seatId": 7,
                "mttCurrentRank": 2,
                "rebuyTimes": 2,
                "addon": false,
                "hunterKill": 0,
                "hunterKillAward": 0,
                "hunterRank": 0,
                "storeChips": 0,
                "isAutoop": false,
                "roundActioned": true,
                "addonPlusMode1Times": 0,
                "addonPlusMode2Times": 0,
                "hunterKillAwardOther": 0,
                "hunterHeadValue": 0
            },
            "operatorList": [
                {
                    "seatId": 5,
                    "actionsList": [

                    ],
                    "insuranceLimitList": [

                    ],
                    "leftOpTime": 3,
                    "delayTimes": 0,
                    "shortcutsList": [

                    ],
                    "isInsurance": false,
                    "isAgreeSecondPc": false,
                    "opDeadline": 1667992945
                }
            ],
            "mttInfo": {
                "upBlindInterval": 120,
                "blindType": 0,
                "rebuyTimes": 2,
                "maxRebuyBlindLevel": 15,
                "rebuyScore": 20000,
                "addOn": false,
                "startAddOnBlindLevel": 0,
                "endAddOnBlindLevel": 0,
                "addOnScore": 0,
                "huntMode": false,
                "hunterBonus": 0,
                "hunterFee": 0,
                "poolFee": 0,
                "serviceFee": 500,
                "partialBringIn": false,
                "moneySync": false,
                "partialBringInReturnBlindLevel": 0,
                "buyPropId": 0,
                "propBuyType": 0,
                "addOnPlusMode1": false,
                "addOnPlusMode1Limit": 0,
                "addOnPlusMode1MaxTimes": 0,
                "addOnPlusMode2": false,
                "addOnPlusMode2EndBl": 0,
                "addOnPlusMode2MaxTimes": 0,
                "buyRatio": 1
            },
            "mttProgress": {
                "upBlindLeftTime": 21,
                "nextAnte": 2500,
                "nextSmallBlind": 12500,
                "startCountDown": 0,
                "blindLevel": 4,
                "canAddOn": false,
                "addonMode": 0,
                "isBubbleWait": false
            },
            "mttRoom": {
                "roomId": 1,
                "matchId": 93226850
            }
        }
    }

    /**
     * 用户信息请求
     */
    static async Web_GMC_Recharge() {
        let param: typeof Web_GMC_Recharge.RequestParams = {
            amount: 5000000,
            user_id: GameCache.Instance.nUserId
        }
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_GMC_Recharge,
                body: Web_GMC_Recharge.Request(param),
                onSuccess: function () {
                    resolve(Web_GMC_Recharge.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    //显示 座位ID
    static ShowSeatIDs() {
        let seat_count = GameCache.Instance.CurGame?.listSeat?.length;
        if (seat_count) {
            GameCache.Instance.CurGame?.listSeat.forEach((item, index) => {
                item.uirc.Text_NickName.string = `${item.Player?.nick ?? ""}:${index}`;
            })
        }
    }

}
(window as any).GM = GM;
export var GM_Templete = {
    Recharge:
        `{
        "amount":5000000,
        "user_id":%0
    }`
}
/**
 * GM 加钱接口
 */
export class Web_GMC_Recharge {
    //接口地址
    public static API: string = "/api/user/debug/recharge";
    //字段声明
    public static RequestParams: {
        amount?: number,
        user_id?: number
    } = null;

    public static ResponseData: {
        flow_id?: number;
        wallet: typeof Web_GMC_Recharge.Wallet;
    } = null;
    public static Wallet:
        {
            w_u_id: number,
            gold: number,
            gold_lock: number,
            wallet_status: number,
        } = null;


    public static Request(param: typeof Web_GMC_Recharge.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_GMC_Recharge.ResponseData };
}
