
import { TextColor } from "../config/GameConfig";
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import { GameCache } from "../game/GameCache";
import { InsuranceData } from "../game/new_ui/UIInsurance";
import Seat from "../game/seat/Seat";
import PublicHelper from "../helper/PublicHelper";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import HttpRequest from "../net/https/HttpRequest";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ServerMessageInsuranceTrigged } from "../protobuf/holdem/recv_insurance_trigged_pb";
import { ServerMessageEnterRoom } from "../protobuf/holdem/req_enter_room_pb";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import { UIRechargeDialogType } from "../ui/dialog/UIRechargeDialog";

export class GM {
    private static __DebugSwitch: number[] = null;


    public static get Instance(): GM {
        return (this as any).__Instance ??= new GM();
    }



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
            "last_bring_out": null,
            "return_table": false,
            "wallet": [
                {
                    "w_u_id": 6727,
                    "club_id": 47,
                    "tribe_id": 3,
                    "gold": 18900,
                    "gold_lock": 0,
                    "wallet_status": 3,
                    "gold_type": 1,
                    "gold_currency": "USD",
                    "user_status": 0,
                    "user_type": 0,
                    "club_random_id": 928776,
                    "club_name": "超级联盟"
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
                // {
                //     "seatId": 7,
                //     "userRid": 92955898,
                //     "action": 6,
                //     "cardsList": [
                //         17,
                //         24
                //     ],
                //     "name": "Player",
                //     "avatar": "http://static.awanptesting.com/image-normal/20220310094859-noCSy.png",
                //     "sex": 0,
                //     "chip": 10000,
                //     "handBet": 20000,
                //     "roundBet": 20000,
                //     "status": 1,
                //     "keepSeatLeftTime": -1,
                //     "buyInsuranceStep": 0,
                //     "buyInsuranceList": [

                //     ],
                //     "isAutoop": false,
                //     "roundActioned": true,
                //     "hunterKill": 0,
                //     "hunterKillAward": 0,
                //     "hunterKillAwardOther": 0,
                //     "hunterHeadValue": 0,
                //     "vip": 0
                // },
                // {
                //     "seatId": 5,
                //     "userRid": 98123898,
                //     "action": 3,
                //     "cardsList": [
                //         0,
                //         0
                //     ],
                //     "name": "Player",
                //     "avatar": "http://static.awanptesting.com/image-normal/20220310094859-noCSy.png",
                //     "sex": 0,
                //     "chip": 30000,
                //     "handBet": 20000,
                //     "roundBet": 20000,
                //     "status": 1,
                //     "keepSeatLeftTime": -1,
                //     "buyInsuranceStep": 0,
                //     "buyInsuranceList": [

                //     ],
                //     "isAutoop": false,
                //     "roundActioned": false,
                //     "hunterKill": 0,
                //     "hunterKillAward": 0,
                //     "hunterKillAwardOther": 0,
                //     "hunterHeadValue": 0,
                //     "vip": 0
                // }
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
    static OpenBackDialog() {
        let dialog_param = {
            title: i18nMgr.Get("UIBackDiolg_title04"),
            content: i18nMgr.Get("UIBackDiolg_textContent03").replace("{0}", "富贵"),
            cancelText: i18nMgr.Get("UIBackDiolg_Cancel_02"),
            commitText: i18nMgr.Get("UIBackDiolg_Commit_02"),
            knowText: i18nMgr.Get("UIBackDiolg_Konw_01"),
            info: { prop_type: 2, game_prop: { prop_value: 100 } },
            this: this
        }
        UIComponent.open(UIDefine.UIBackDialog, dialog_param);
    }



    static _room_data = {
        "status": 0,
        "gameStatus": 3,
        "roomInfo": {
            "ante": 0,
            "smallBlind": 10,
            "scheduleStartTime": 0,
            "schedulePlayDuration": 1800,
            "startTime": 1681959426,
            "currentMinRate": 10,
            "currentMaxRate": 80,
            "limitIp": false,
            "limitGps": false,
            "insurance": false,
            "limitPoolRateAllLv": false,
            "limitMinPoolRate": 0,
            "limitRetainMinRate": 0,
            "limitTotalHandNumAllLv": false,
            "limitTotalHandNum": 0,
            "delaySeeCard": false,
            "straddle": true,
            "opDuration": 15,
            "retainType": 0,
            "muck": false,
            "uniqueId": "1681959384",
            "isAgreeSecondPcs": false
        },
        "handInfo": {
            "handNum": 2,
            "buSeatId": 2,
            "sbSeatId": 2,
            "bbSeatId": 1,
            "publicCardsList": [
                8,
                49,
                50
            ],
            "allBet": 40,
            "potsList": [
                {
                    "potId": 0,
                    "amount": 40,
                    "seatIdsList": [
                        2,
                        1
                    ]
                }
            ],
            "roundBet": 0,
            "insurancePool": 0,
            "extPublicCardsList": [

            ]
        },
        "playersList": [
            {
                "seatId": 1,
                "userRid": 96615706,
                "action": 8,
                "cardsList": [
                    20,
                    58
                ],
                "name": "三个核桃",
                "avatar": "https://static.awanptest.com/awanptesting-intl-test/image-avatar/96615706-GBgac.JPG",
                "sex": 0,
                "chip": 170,
                "handBet": 20,
                "roundBet": 0,
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
                "vip": 0,
                "keepSeatDeadline": 0,
                "keepSeatReason": 0
            },
            {
                "seatId": 2,
                "userRid": 98015834,
                "action": 6,
                "cardsList": [
                    0,
                    0
                ],
                "name": "Player3",
                "avatar": "https://static.awanptest.com/awanptesting-intl-test/image-normal/20220310094520-FKeDL.png",
                "sex": 0,
                "chip": 190,
                "handBet": 20,
                "roundBet": 0,
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
                "vip": 0,
                "keepSeatDeadline": 0,
                "keepSeatReason": 0
            }
        ],
        "myInfo": {
            "chip": 170,
            "seatId": 1,
            "mttCurrentRank": 0,
            "rebuyTimes": 0,
            "addon": false,
            "hunterKill": 0,
            "hunterKillAward": 0,
            "hunterRank": 0,
            "storeChips": 0,
            "isAutoop": false,
            "roundActioned": false,
            "addonPlusMode1Times": 0,
            "addonPlusMode2Times": 0,
            "hunterKillAwardOther": 0,
            "hunterHeadValue": 0
        },
        "operatorList": [
            {
                "seatId": 1,
                "actionsList": [
                    {
                        "action": 7,
                        "min": 0,
                        "max": 0,
                        "straddleLevel": 0
                    },
                    {
                        "action": 5,
                        "min": 20,
                        "max": 169,
                        "straddleLevel": 0
                    },
                    {
                        "action": 8,
                        "min": 0,
                        "max": 0,
                        "straddleLevel": 0
                    },
                    {
                        "action": 10,
                        "min": 170,
                        "max": 170,
                        "straddleLevel": 0
                    }
                ],
                "insuranceLimitList": [

                ],
                "leftOpTime": 100000,
                "delayTimes": 0,
                "shortcutsList": [
                    {
                        "sc": 0,
                        "amount": 20
                    },
                    {
                        "sc": 3,
                        "amount": 26
                    },
                    {
                        "sc": 4,
                        "amount": 30
                    },
                    {
                        "sc": 5,
                        "amount": 24
                    },
                    {
                        "sc": 6,
                        "amount": 40
                    },
                    {
                        "sc": 7,
                        "amount": 60
                    }
                ],
                "isInsurance": false,
                "isAgreeSecondPc": false,
                "opDeadline": 1681959525
            }
        ],
        "mttRoom": {
            "roomId": 91748082,
            "matchId": 0
        }
    }


    static refreshRoom() {

        cc.log(this._room_data);

        GC.game.UpdateRoomCommon(<ServerMessageEnterRoom.AsObject>this._room_data);

    }



    private steps = [
        {
            key: "Protocol_Holdem_SeatedOthers", value:
            {
                "seatId": 1,
                "sex": 0,
                "avatar": "https://static.awanptest.com/awanptesting-intl-test/image-avatar/96615706-GBgac.JPG",
                "name": "三个核桃",
                "userRid": 96615706,
                "chips": 200,
                "storeChips": 0,
                "hunterKill": 0,
                "hunterKillAward": 0,
                "hunterKillAwardOther": 0,
                "hunterHeadValue": 0,
                "vip": 0,
                "keepSeatLeftTime": 0,
                "keepSeatDeadline": 0
            }
        },
        {
            key: "Protocol_Holdem_Seated", value:
            {
                "status": 0,
                "chips": 200,
                "accountChips": 0,
                "recvSeatId": 2,
                "postStatus": 1,
                "storeChips": 0,
                "keepSeatLeftTime": 0,
                "keepSeatDeadline": 0
            }
        },
        {
            key: "Protocol_Holdem_StartInfo", value:
            {
                "handInfo": {
                    "handNum": 1,
                    "buSeatId": 2,
                    "sbSeatId": 2,
                    "bbSeatId": 1,
                    "publicCardsList": [

                    ],
                    "allBet": 30,
                    "potsList": [

                    ],
                    "roundBet": 20,
                    "insurancePool": 0,
                    "extPublicCardsList": [

                    ]
                },
                "nextOperator": {
                    "seatId": 2,
                    "actionsList": [
                        {
                            "action": 9,
                            "min": 30,
                            "max": 189,
                            "straddleLevel": 0
                        },
                        {
                            "action": 10,
                            "min": 190,
                            "max": 190,
                            "straddleLevel": 0
                        },
                        {
                            "action": 7,
                            "min": 0,
                            "max": 0,
                            "straddleLevel": 0
                        },
                        {
                            "action": 6,
                            "min": 10,
                            "max": 10,
                            "straddleLevel": 0
                        }
                    ],
                    "insuranceLimitList": [

                    ],
                    "leftOpTime": 15,
                    "delayTimes": 0,
                    "shortcutsList": [
                        {
                            "sc": 0,
                            "amount": 30
                        },
                        {
                            "sc": 3,
                            "amount": 36
                        },
                        {
                            "sc": 4,
                            "amount": 40
                        },
                        {
                            "sc": 5,
                            "amount": 34
                        },
                        {
                            "sc": 6,
                            "amount": 50
                        },
                        {
                            "sc": 7,
                            "amount": 70
                        }
                    ],
                    "isInsurance": false,
                    "isAgreeSecondPc": false,
                    "opDeadline": 1682592033
                },
                "playersList": [
                    {
                        "seatId": 2,
                        "cardsList": [
                            27,
                            19
                        ],
                        "ante": 0,
                        "action": 2,
                        "roundBet": 10,
                        "chip": 190,
                        "storeChips": 0
                    },
                    {
                        "seatId": 1,
                        "cardsList": [

                        ],
                        "ante": 0,
                        "action": 3,
                        "roundBet": 20,
                        "chip": 180,
                        "storeChips": 0
                    }
                ]
            }
        },
        {
            key: "Protocol_Holdem_PublicCards", value:
            {
                "publicCardsArrayList": [
                    14,
                    22,
                    52
                ],
                "nextOperator": {
                    "seatId": 1,
                    "actionsList": [

                    ],
                    "insuranceLimitList": [

                    ],
                    "leftOpTime": 16,
                    "delayTimes": 0,
                    "shortcutsList": [

                    ],
                    "isInsurance": false,
                    "isAgreeSecondPc": false,
                    "opDeadline": 1682592042
                },
                "extPublicCardsArrayList": [

                ],
                "rnd": 2
            }
        },
        {
            key: "Protocol_Holdem_Showcards", value:
            {
                "playerCardsList": [
                    {
                        "seatId": 1,
                        "cardsList": [
                            11,
                            6
                        ]
                    },
                    {
                        "seatId": 2,
                        "cardsList": [
                            27,
                            19
                        ]
                    }
                ],
                "isAll": true
            }
        },
        {
            key: "Protocol_Holdem_InsuranceTrigged", value:
            {
                "round": 2,
                "operatorList": [
                    {
                        "seatId": 2,
                        "actionsList": [

                        ],
                        "insuranceLimitList": [
                            {
                                "potId": 0,
                                "potAmount": 400,
                                "bet": 200,
                                "max": 100,
                                "min": 1,
                                "insuranced": 0,
                                "outs": 6,
                                "outsDetailList": [
                                    {
                                        "seatId": 1,
                                        "outsCardsList": [
                                            {
                                                "card": 51,
                                                "isEqual": false
                                            },
                                            {
                                                "card": 21,
                                                "isEqual": false
                                            },
                                            {
                                                "card": 56,
                                                "isEqual": false
                                            },
                                            {
                                                "card": 26,
                                                "isEqual": false
                                            },
                                            {
                                                "card": 41,
                                                "isEqual": false
                                            },
                                            {
                                                "card": 36,
                                                "isEqual": false
                                            }
                                        ]
                                    }
                                ],
                                "potUserCount": 2,
                                "potLeaderCount": 1
                            }
                        ],
                        "leftOpTime": 15,
                        "delayTimes": 0,
                        "shortcutsList": [

                        ],
                        "isInsurance": true,
                        "isAgreeSecondPc": false,
                        "opDeadline": 1682592050
                    }
                ]
            }
        },
        {
            key: "Protocol_Holdem_BuyInsurance", value:
                { "round": 2, "seatId": 2, "buyList": [] }
        }
    ]

    //显示保险
    public async showIns() {


        //GC.game.TexasGameProtocol.HANDLER_REQ_INSURANCE_TRIGGED(this._insurance_data);


        // let data: InsuranceData = new InsuranceData;
        // data.publicCards = [11, -1, -1, -1, -1];
        // data.triggedDatas = [];
        // data.timeLeft = 30;
        // //data.delayTimes = this.game.mainPlayer.delayTimes;
        // UIComponent.Instance.ShowUI(PrefabUI.UIInsurance, data);
        //this.steps.length = 3;
        for (let i = 0; i < this.steps.length; i++) {
            let code = this.steps[i].key;
            let value = this.steps[i].value;
            cc.log(" == >执行", code);
            GC.notify.post(ProtocolCode[code], value);
            await TimeHelper.Sleep(1000);
        }

        //GC.notify.post(ProtocolCode.Protocol_Holdem_SeatedOthers)
    }


    public showDialog() {
        let data = { more_contact: "1111", digital_wallet_erc: "2222", digital_wallet_trc: "3333" };
        //requestSuccess(data: any) {
        //act.data.more_contact, act.data.digital_wallet_erc, act.data.digital_wallet_trc
        if (data?.more_contact) {
            let copy_list = [];
            data.digital_wallet_erc && copy_list.push({ show: `ERC:${data.digital_wallet_erc}`, copy: `${data.digital_wallet_erc}` });
            data.digital_wallet_trc && copy_list.push({ show: `TRC:${data.digital_wallet_trc}`, copy: `${data.digital_wallet_trc}` });

            UIComponent.open<UIRechargeDialogType>(UIDefine.UIRechargeDialog, {
                this: this,
                title: i18nMgr.Get("UIGuild_TipsTitle"),
                cancel: i18nMgr.Get("UIBackDialog_ticketsbtnClose"),
                commit: i18nMgr.Get("CopyContact"),
                content: StringHelper.Format(i18nMgr.Get("UIGuildFund_RtTips005"), [` ${StringHelper.GetColorText(data.more_contact, TextColor.Color4)} `]),
                copy_list: copy_list.length > 0 ? copy_list : null,
                commit_click: () => {
                    PublicHelper.copyToClipBoard(data.more_contact);
                }
            });
        } else {
            UIComponent.Instance.ToastLanguage("roomError171_5");
        }
        //}
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
