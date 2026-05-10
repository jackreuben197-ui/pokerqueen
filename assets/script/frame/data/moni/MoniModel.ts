import { LogStyle } from '../../../config/GameConfig';
import { ProtocolCode } from '../../../net/websocket/ProtocolCode';
import GC from '../../GameControl';

/**
 * 模擬數據模型
 **/
export default class MoniModel {

    public static get Instance(): MoniModel {
        return ((this as any).__Instance ??= new MoniModel());
    }

    public Next() {
        let obj = this.all_01[this.play_index];
        let code = obj.code;
        let body = obj.body;
        GC.notify.post(code, body);
        console.log('%c%s', LogStyle.ws_response, `${ProtocolCode[code]} == > + ${JSON.stringify(body)}`);
        this.play_index++;
    }

    public Reset() {
        this.play_index = 0;
    }
    public play_index: number = 0;
    //正常一套牌
    public all_01 = [
        // {
        //     code: ProtocolCode.Protocol_Holdem_EnterRoom,
        //     body: {
        //         "status": 0,
        //         "gameStatus": 0,
        //         "roomInfo": {
        //             "ante": 0,
        //             "smallBlind": 1000,
        //             "scheduleStartTime": 0,
        //             "schedulePlayDuration": 1800,
        //             "startTime": 0,
        //             "currentMinRate": 100,
        //             "currentMaxRate": 400,
        //             "limitIp": false,
        //             "limitGps": false,
        //             "insurance": true,
        //             "limitPoolRateAllLv": false,
        //             "limitMinPoolRate": 0,
        //             "limitRetainMinRate": 0,
        //             "limitTotalHandNumAllLv": false,
        //             "limitTotalHandNum": 0,
        //             "delaySeeCard": false,
        //             "straddle": false,
        //             "opDuration": 15,
        //             "retainType": 0,
        //             "muck": false,
        //             "uniqueId": "1668426313",
        //             "isAgreeSecondPcs": false
        //         },
        //         "handInfo": {
        //             "handNum": 0,
        //             "buSeatId": 0,
        //             "sbSeatId": 0,
        //             "bbSeatId": 0,
        //             "publicCardsList": [
        //             ],
        //             "allBet": 0,
        //             "potsList": [
        //             ],
        //             "roundBet": 0,
        //             "insurancePool": 0,
        //             "extPublicCardsList": [
        //             ]
        //         },
        //         "playersList": [
        //         ],
        //         "operatorList": [
        //         ],
        //         "mttRoom": {
        //             "roomId": 92915770,
        //             "matchId": 0
        //         }
        //     }
        // },
        {
            code: ProtocolCode.Protocol_Holdem_SeatedOthers,
            body: {
                seatId: 1,
                sex: 0,
                avatar: 'http://static.awanptesting.com/image-normal/20220310094859-noCSy.png',
                name: 'Player',
                userRid: 98123898,
                chips: 200000,
                storeChips: 0,
                hunterKill: 0,
                hunterKillAward: 0,
                hunterKillAwardOther: 0,
                hunterHeadValue: 0,
                vip: 0
            }
        },
        {
            code: ProtocolCode.Protocol_Holdem_Seated,
            body: { status: 0, chips: 200000, accountChips: 3486564, recvSeatId: 2, postStatus: 1, storeChips: 0 }
        },
        {
            code: ProtocolCode.Protocol_Holdem_StartInfo,
            body: {
                handInfo: {
                    handNum: 1,
                    buSeatId: 1,
                    sbSeatId: 1,
                    bbSeatId: 2,
                    publicCardsList: [],
                    allBet: 3000,
                    potsList: [],
                    roundBet: 2000,
                    insurancePool: 0,
                    extPublicCardsList: []
                },
                nextOperator: {
                    seatId: 1,
                    actionsList: [],
                    insuranceLimitList: [],
                    leftOpTime: 15,
                    delayTimes: 0,
                    shortcutsList: [],
                    isInsurance: false,
                    isAgreeSecondPc: false,
                    opDeadline: 1668578041
                },
                playersList: [
                    {
                        seatId: 1,
                        cardsList: [],
                        ante: 0,
                        action: 2,
                        roundBet: 1000,
                        chip: 199000,
                        storeChips: 0
                    },
                    {
                        seatId: 2,
                        cardsList: [19, 3],
                        ante: 0,
                        action: 3,
                        roundBet: 2000,
                        chip: 198000,
                        storeChips: 0
                    }
                ]
            }
        },
        {
            code: ProtocolCode.Protocol_Holdem_SidePots,
            body: { potsList: [{ potId: 0, amount: 4000, seatIdsList: [1, 2] }], secondPotsList: [] }
        },
        {
            code: ProtocolCode.Protocol_Holdem_PublicCards,
            body: {
                publicCardsArrayList: [6, 34, 38],
                nextOperator: {
                    seatId: 2,
                    actionsList: [
                        {
                            action: 7,
                            min: 0,
                            max: 0,
                            straddleLevel: 0
                        },
                        {
                            action: 5,
                            min: 2000,
                            max: 197999,
                            straddleLevel: 0
                        },
                        {
                            action: 8,
                            min: 0,
                            max: 0,
                            straddleLevel: 0
                        },
                        {
                            action: 10,
                            min: 198000,
                            max: 198000,
                            straddleLevel: 0
                        }
                    ],
                    insuranceLimitList: [],
                    leftOpTime: 16,
                    delayTimes: 0,
                    shortcutsList: [
                        {
                            sc: 0,
                            amount: 2000
                        },
                        {
                            sc: 3,
                            amount: 2666
                        },
                        {
                            sc: 4,
                            amount: 3000
                        },
                        {
                            sc: 5,
                            amount: 2400
                        },
                        {
                            sc: 6,
                            amount: 4000
                        },
                        {
                            sc: 7,
                            amount: 6000
                        }
                    ],
                    isInsurance: false,
                    isAgreeSecondPc: false,
                    opDeadline: 1668578045
                },
                extPublicCardsArrayList: [],
                rnd: 2
            }
        },
        {
            code: ProtocolCode.Protocol_Holdem_EnterRoom,
            body: { status: 0, chips: 200000, accountChips: 3486564, recvSeatId: 2, postStatus: 1, storeChips: 0 }
        },
        {
            code: ProtocolCode.Protocol_Holdem_EnterRoom,
            body: { status: 0, chips: 200000, accountChips: 3486564, recvSeatId: 2, postStatus: 1, storeChips: 0 }
        },
        {
            code: ProtocolCode.Protocol_Holdem_EnterRoom,
            body: { status: 0, chips: 200000, accountChips: 3486564, recvSeatId: 2, postStatus: 1, storeChips: 0 }
        },
        {
            code: ProtocolCode.Protocol_Holdem_EnterRoom,
            body: { status: 0, chips: 200000, accountChips: 3486564, recvSeatId: 2, postStatus: 1, storeChips: 0 }
        }
    ];
}
