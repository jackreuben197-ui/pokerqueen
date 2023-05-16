
import { Def, GPS, PotInsuranceBuy, Room } from "../../protobuf/holdem/define_pb";
import { ServerMessageActionAll } from "../../protobuf/holdem/recv_action_all_pb";
import { ServerMessageError } from "../../protobuf/holdem/recv_error_pb";
import { ServerMessageHandClear } from "../../protobuf/holdem/recv_hand_clear_pb";
import { ServerMessageLeaveNotification } from "../../protobuf/holdem/recv_leave_notification_pb";
import { ServerMessagePostStatusChange } from "../../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSidePots } from "../../protobuf/holdem/recv_side_pots_pb";
import { ServerMessageStandup } from "../../protobuf/holdem/recv_stand_up_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import { ServerMessageWinner } from "../../protobuf/holdem/recv_winner_pb";
import { ClientMessageAction, ServerMessageAction } from "../../protobuf/holdem/req_action_pb";
import { ClientMessageBringIn, ServerMessageBringIn } from "../../protobuf/holdem/req_bring_in_pb";
import { ClientMessageEnterRoom, ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { ClientMessageHeartbeat, ServerMessageHeartbeat } from "../../protobuf/holdem/req_heartbeat_pb";
import { ClientMessageLeave, ServerMessageLeave } from "../../protobuf/holdem/req_leave_pb";
import { ClientMessageRegister, ServerMessageRegister } from "../../protobuf/holdem/req_register_pb";
import { ClientMessageRoomers, ServerMessageRoomers } from "../../protobuf/holdem/req_roomers_pb";
import { ClientMessageSeated, ServerMessageSeated } from "../../protobuf/holdem/req_seated_pb";
import { ClientMessageStandupActive, ServerMessageStandupActive } from "../../protobuf/holdem/req_stand_up_active_pb";
import { ClientMessagePublicReplay, ServerMessagePublicReplay } from "../../protobuf/holdem/req_replay_pb";
import { ClientMessageKeepSeatActive, ServerMessageKeepSeatActive } from "../../protobuf/holdem/req_keep_seat_active_pb";

import { ClientMessageAddTime, ServerMessageAddTime } from "../../protobuf/holdem/req_add_time_pb";

import { ProtocolCode } from "./ProtocolCode";
import { ClientMessageShowdown, ServerMessageShowdown } from "../../protobuf/holdem/req_showdown_pb";
import { ServerMessageAddTimeOthers } from "../../protobuf/holdem/recv_add_time_others_pb";
import { ServerMessageKeepSeat } from "../../protobuf/holdem/recv_keep_seat_pb";
import { ClientMessageShowPublicCards, ServerMessageShowPublicCards } from "../../protobuf/holdem/req_show_public_cards_pb";
import { ServerMessageShowPublicCardsOthers } from "../../protobuf/holdem/recv_show_public_cards_others_pb";
import { ClientMessageSetAutoOnTable, ServerMessageSetAutoOnTable } from "../../protobuf/holdem/req_set_auto_on_table_pb";
import { ClientMessageStoreChips, ServerMessageStoreChips } from "../../protobuf/holdem/req_store_chips_pb";
import { ServerMessageChipsChange } from "../../protobuf/holdem/recv_chips_change_pb";
import { ServerMessageInsuranceTrigged } from "../../protobuf/holdem/recv_insurance_trigged_pb";
import { ServerMessageGetMsg } from "../../protobuf/holdem/recv_get_msg_pb";
import { ClientMessageAddOn, ServerMessageAddOn } from "../../protobuf/holdem/req_add_on_pb";
import { ServerMessageAgreeSecondPcsTrigged } from "../../protobuf/holdem/recv_agree_second_pcs_trigged_pb";
import { ServerMessageAgreeSecondPcs } from "../../protobuf/holdem/recv_agree_second_pcs_pb";
import { ClientMessageAgreeSecondPcsActive, ServerMessageAgreeSecondPcsActive } from "../../protobuf/holdem/req_agree_second_pcs_active_pb";
import { ClientMessageBuyInsuranceActive, ServerMessageBuyInsuranceActive } from "../../protobuf/holdem/req_buy_insurance_active_pb";
import { ServerMessageShowcards } from "../../protobuf/holdem/recv_showcards_pb";
import { ServerMessageUpBlind } from "../../protobuf/holdem/recv_up_blind_pb";
import { ServerMessageBuyInsurance } from "../../protobuf/holdem/recv_buy_insurance_pb";
import { ClientMessageAutoOpActive, ServerMessageAutoOpActive } from "../../protobuf/holdem/req_auto_op_active_pb";
import { ServerMessageAutoOp } from "../../protobuf/holdem/recv_auto_op_pb";
import { ClientMessageObservers, ServerMessageObservers } from "../../protobuf/holdem/req_observers_pb";

export class ProtocolCommon {

    private _request_map = new Map();

    private _body: any = null;

    public static get Instance(): ProtocolCommon {
        return (<any>this).instance ??= new ProtocolCommon();
    }
    Response<Server extends { AsObject: null, toObject: Function }>(bytes: Uint8Array, c: any): Server["AsObject"] {
        let result: Server = c.deserializeBinary(bytes);
        return result.toObject();
    }
    Request<Client_AsObject>(code: number, body?: Client_AsObject, classDic?: any): Uint8Array {
        let c: any = ProtocolMap.GetCS(code).Client;
        let request: { serializeBinary: Function } = this._getRequest(c);
        this.setBody(request, body, classDic || { room: Room, gps: GPS, buyList: PotInsuranceBuy });
        return request.serializeBinary();
    }
    _getRequest(c: any): { serializeBinary: Function } {
        let request = this._request_map.get(c);
        if (!request) {
            this._request_map.set(c, request = new c);
        }
        return request;
    }
    _setBody(obj, body, classDic?: any) {

        for (let key in body) {

            let value = body[key];

            let func = `set${key[0].toLocaleUpperCase()}${key.slice(1)}`;

            cc.log("set 对象", func, value);

            if (classDic && classDic[key]) {
                //如果是数组
                if (value instanceof Array) {
                    let childs = [];
                    value.forEach(item => {
                        let childObj = new classDic[key]();
                        //cc.log("new 对象", key)
                        this._setBody(childObj, item, classDic);
                        childs.push(childObj);
                    })
                    obj[func](childs);
                } else {
                    let childObj = new classDic[key]();
                    obj[func](childObj);
                    this._setBody(childObj, value, classDic);
                }
            } else {
                obj[func](value);

            }
        }

    }
    setBody(request: any, body: any = null, cls?: any) {
        this._body = body;
        this._setBody(request, body, cls);
    }


}

export enum BroadcastCode {
    BroadcastMsg = 1000,
    BroadcastVoiceprint = 1001,
    VerifyCan = 1002,//用户可以被验证
    VerifyDoNotCan = 1003,//用户不能被验证
    VerifyTickets = 1004,//验证门票
    Super1_PMD = 1005,//一元购开奖中奖_跑马灯消息
    Super1_TC = 1006,//一元购开奖中奖_弹窗消息
    FaceRecognizeCode = 1007,// 房间人脸识别消息
    SeatFriendApplyRefreshMsgNum = 2001,//朋友桌房主提示
    SeatFriendBringInApply = 2002,//朋友桌房主同意坐下
    SeatClubApplyRefreshMsgNum = 2003,//公会桌房主提示
    SeatClubBringInApply = 2004,//公会房主同意坐下
    AntiCheatRoomVideoMsgCode = 2005,//随机触发强制视频		

}

export class Broadcast {

    public static RequestData:
        {
            code: number,//BroadcastCode
            data: string // json 
        } = null;

    public static ResponseData:
        {
            code: number,//BroadcastCode
            data: string // json 
        } = null;
    public static Request(data: typeof Broadcast.RequestData): string {
        return JSON.stringify(data);
    }
    public static Response(json: string): typeof Broadcast.ResponseData {
        return JSON.parse(json);
    }
}

//广播管理消息自定义
export class BroadcastMessage {
    public static ResponseData: {
        pt_msg: string,//葡语
        en_msg: string,//英语
        rotate_times: number,//次数
    } = null;

    public static Response(json: string): typeof BroadcastMessage.ResponseData {
        return JSON.parse(json);
    }
}

//表情弹幕自定义数据结构
export class BroadcastMsg {
    public static RequestData: {
        name: string,//名字
        type: number,//类型
        user_id: number,//当前玩家id
        target_user_id: number,//目标玩家id
        message: string//文本消息
    } = null;

    public static ResponseData: {
        name: string,//名字
        type: number,//类型
        user_id: number,//当前玩家id
        target_user_id: number,//目标玩家id
        message: string,//文本消息
    } = null;

    public static Request(data: typeof BroadcastMsg.RequestData): string {
        return JSON.stringify(data);
    }

    public static Response(json: string): typeof BroadcastMsg.ResponseData {
        return JSON.parse(json);
    }
}
//朋友桌带入申请返回结构
export class BringInApplyMsg {
    public static ResponseData: {
        room_id: number,//房间ID
        user_id: number,//用户ID
        bring_in: number,//带入筹码
        status: number,// 状态 1 待审批，2通过，3拒绝，4取消
    } = null;
    public static Response(json: string): typeof BringInApplyMsg.ResponseData {
        return JSON.parse(json);
    }
}

export const ProtocolMap = {

    GetCS(code: number): { Server: any, Client?: any } {
        return ProtocolMap[code];
    },
    [ProtocolCode.Protocol_Holdem_Register]: {
        Client: ClientMessageRegister,
        Server: ServerMessageRegister,
    },
    [ProtocolCode.Protocol_Holdem_Heartbeat]: {
        Client: ClientMessageHeartbeat,
        Server: ServerMessageHeartbeat,
    },
    [ProtocolCode.Protocol_Holdem_Leave]: {
        Client: ClientMessageLeave,
        Server: ServerMessageLeave,
    },
    [ProtocolCode.Protocol_Holdem_EnterRoom]: {
        Client: ClientMessageEnterRoom,
        Server: ServerMessageEnterRoom,
    },
    [ProtocolCode.Protocol_Holdem_SeatedOthers]: {
        Server: ServerMessageSeatedOthers,
    },
    [ProtocolCode.Protocol_Holdem_Seated]: {
        Client: ClientMessageSeated,
        Server: ServerMessageSeated,
    },
    [ProtocolCode.Protocol_Holdem_BringIn]: {
        Client: ClientMessageBringIn,
        Server: ServerMessageBringIn,
    },
    [ProtocolCode.Protocol_Holdem_StandupActive]: {
        Client: ClientMessageStandupActive,
        Server: ServerMessageStandupActive,
    },
    [ProtocolCode.Protocol_Holdem_Standup]: {
        Server: ServerMessageStandup,
    },
    [ProtocolCode.Protocol_Holdem_PostStatusChange]: {
        Server: ServerMessagePostStatusChange,
    },
    [ProtocolCode.Protocol_Holdem_StartInfo]: {
        Server: ServerMessageStartInfo,
    },
    [ProtocolCode.Protocol_Holdem_Roomers]: {
        Client: ClientMessageRoomers,
        Server: ServerMessageRoomers,
    },
    [ProtocolCode.Protocol_Holdem_Observers]: {
        Client: ClientMessageObservers,
        Server: ServerMessageObservers,
    },
    [ProtocolCode.Protocol_Holdem_PublicReplay]: {
        Client: ClientMessagePublicReplay,
        Server: ServerMessagePublicReplay,
    },
    [ProtocolCode.Protocol_Holdem_Action]: {
        Client: ClientMessageAction,
        Server: ServerMessageAction,
    },
    [ProtocolCode.Protocol_Holdem_ActionAll]: {
        Server: ServerMessageActionAll,
    },
    [ProtocolCode.Protocol_Holdem_SidePots]: {
        Server: ServerMessageSidePots,
    },
    [ProtocolCode.Protocol_Holdem_PublicCards]: {
        Server: ServerMessagePublicCards,
    },
    [ProtocolCode.Protocol_Holdem_Winner]: {
        Server: ServerMessageWinner,
    },
    [ProtocolCode.Protocol_Holdem_LeaveNotification]: {
        Server: ServerMessageLeaveNotification,
    },
    [ProtocolCode.Protocol_Holdem_HandClear]: {
        Server: ServerMessageHandClear,
    },
    [ProtocolCode.Protocol_Holdem_Error]: {
        Server: ServerMessageError,
    },
    [ProtocolCode.Protocol_Holdem_AddTime]: {
        Client: ClientMessageAddTime,
        Server: ServerMessageAddTime,
    },
    [ProtocolCode.Protocol_Holdem_AddTimeOthers]: {
        Server: ServerMessageAddTimeOthers,
    },
    [ProtocolCode.Protocol_Holdem_Showdown]: {
        Client: ClientMessageShowdown,
        Server: ServerMessageShowdown,
    },
    [ProtocolCode.Protocol_Holdem_KeepSeat]: {
        Server: ServerMessageKeepSeat,
    },
    [ProtocolCode.Protocol_Holdem_KeepSeatActive]: {
        Client: ClientMessageKeepSeatActive,
        Server: ServerMessageKeepSeatActive,
    },
    [ProtocolCode.Protocol_Holdem_ShowPublicCards]: {
        Client: ClientMessageShowPublicCards,
        Server: ServerMessageShowPublicCards,
    },
    [ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers]: {
        Server: ServerMessageShowPublicCardsOthers,
    },
    [ProtocolCode.Protocol_Holdem_SetAutoOnTable]: {
        Client: ClientMessageSetAutoOnTable,
        Server: ServerMessageSetAutoOnTable,
    },
    [ProtocolCode.Protocol_Holdem_StoreChips]: {
        Client: ClientMessageStoreChips,
        Server: ServerMessageStoreChips,
    },
    [ProtocolCode.Protocol_Holdem_ChipsChange]: {
        Server: ServerMessageChipsChange,
    },
    [ProtocolCode.Protocol_Holdem_InsuranceTrigged]: {
        Server: ServerMessageInsuranceTrigged,
    },
    [ProtocolCode.Protocol_Holdem_GetMsg]: {
        Server: ServerMessageGetMsg,
    },
    [ProtocolCode.Protocol_Holdem_AddOn]: {
        Client: ClientMessageAddOn,
        Server: ServerMessageAddOn,
    },
    [ProtocolCode.Protocol_Holdem_AgreeSecondPcs]: {
        Server: ServerMessageAgreeSecondPcs,
    },
    [ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive]: {
        Client: ClientMessageAgreeSecondPcsActive,
        Server: ServerMessageAgreeSecondPcsActive,
    },

    [ProtocolCode.Protocol_Holdem_BuyInsurance]: {
        Server: ServerMessageBuyInsurance,
    },

    [ProtocolCode.Protocol_Holdem_BuyInsuranceActive]: {
        Client: ClientMessageBuyInsuranceActive,
        Server: ServerMessageBuyInsuranceActive,
    },
    [ProtocolCode.Protocol_Holdem_Showcards]: {
        Server: ServerMessageShowcards,
    },
    //触发第二套牌的投票
    [ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged]: {
        Server: ServerMessageAgreeSecondPcsTrigged,
    },
    //升盲
    [ProtocolCode.Protocol_Holdem_UpBlind]: {
        Server: ServerMessageUpBlind
    },
    //主动自动操作
    [ProtocolCode.Protocol_Holdem_AutoOpActive]: {
        Client: ClientMessageAutoOpActive,
        Server: ServerMessageAutoOpActive,
    },
    //被动自动操作
    [ProtocolCode.Protocol_Holdem_AutoOp]: {
        Server: ServerMessageAutoOp,
    }
}

