
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { ServerMessageHandClear } from "../../protobuf/holdem/recv_hand_clear_pb";
import { ServerMessageNotificationRoomReady } from "../../protobuf/holdem/recv_notification_room_ready_pb";
import { ServerMessageSeatedOthers } from "../../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSyncHand } from "../../protobuf/holdem/recv_sync_hand_pb";
import { GameCache } from "../GameCache";
import Seat from "../seat/Seat";
import MTTGame from "../texas/MTTGame";
import TexasGame from "../texas/TexasGame";
import { TexasGameState } from "../TexasGameState";
import TexasGameProtocol from "./TexasGameProtocol";




export default class MTTGameProtocol extends TexasGameProtocol {

    constructor(public game: TexasGame) {
        super(game);
    }

    public override RegisterMsgHandler(): void {
        super.RegisterMsgHandler();
        // 不需要在此处注册RoomReady回调，因为RoomReady其实并不是来自房间服的消息
        GC.notify.register(ProtocolCode.Protocol_Holdem_AutoOpActive, this.Protocol_Holdem_AutoOpActive_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_AutoOp, this.Protocol_Holdem_AutoOp_Handler, this);  // MTT玩家托管通知
        GC.notify.register(ProtocolCode.Protocol_Holdem_UpBlind, this.Protocol_Holdem_UpBlind_Handler, this);  // MTT牌局内升盲消息
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddOn, this.Protocol_Holdem_AddOn_Handler, this);  // MTT牌局内升盲消息
        GC.notify.register(ProtocolCode.Protocol_Holdem_SyncHand, this.Protocol_Holdem_SyncHand_Handler, this);  // MTT牌局内挤泡沐消息	
        GC.notify.register(ProtocolCode.Protocol_Holdem_HandClear, this.Protocol_Holdem_HandClear_Handler, this);//MTT牌局结束清理

    }
    public override RemoveMsgHandler(): void {
        super.RemoveMsgHandler();
        // 防御式移除RoomReady消息回调
        GC.notify.remove(ProtocolCode.Protocol_Holdem_NotificationRoomReady, this.Protocol_Holdem_NotificationRoomReady_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AutoOpActive, this.Protocol_Holdem_AutoOpActive_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AutoOp, this.Protocol_Holdem_AutoOp_Handler, this);  // MTT玩家托管通知
        GC.notify.remove(ProtocolCode.Protocol_Holdem_UpBlind, this.Protocol_Holdem_UpBlind_Handler, this);  // MTT牌局内升盲消息
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddOn, this.Protocol_Holdem_AddOn_Handler, this);  // MTT牌局内升盲消息
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SyncHand, this.Protocol_Holdem_SyncHand_Handler, this);  // MTT牌局内挤泡沐消息
        GC.notify.remove(ProtocolCode.Protocol_Holdem_HandClear, this.Protocol_Holdem_HandClear_Handler, this);//MTT牌局结束清理
    }
    public override async HandleRoundFinish(source: ServerMessageHandClear.AsObject) {
        super.HandleRoundFinish(source);
        await TimeHelper.Sleep(4000);
        // if (IsDisposed) {
        //     return;
        // }
        this.JudgeHavePlayer();
    }
    /// <summary>
    /// 判断除了自己此时的房间的人数
    /// </summary>
    private JudgeHavePlayer() {
        var currentPlayers = this.game.TexasGameUtils.GetCurrentPlayers();
        if (currentPlayers.length == 0) {
            (this.game as MTTGame).isStartShowPullDown = true;
            this.game.uirc.Image_RedistributionTips.active = true;
        }
    }


    //其他玩家坐下
    protected override HANDLER_REQ_GAME_RECV_SEAT_DOWN(rec: ServerMessageSeatedOthers.AsObject) {
        super.HANDLER_REQ_GAME_RECV_SEAT_DOWN(rec);
        if (rec == null) return;
        let mSeat: Seat = this.game.GetSeatByServerSeatID(rec.seatId);
        mSeat?.UpdateHunterAward();
    }

    ///////////////////////////////////////////////////////消息回调
    //用户可以进入房间  消息回调
    public Protocol_Holdem_NotificationRoomReady_Handler(rec: ServerMessageNotificationRoomReady.AsObject) {
        console.log("# MSG_CALLBACK MTT: Protocol_Holdem_NotificationRoomReady_Handler");

        if (rec == null) return;

        if (rec.room.matchId == 0) return;

        GameCache.Instance.match_id = rec.room.matchId;
        GameCache.Instance.room_id = rec.room.roomId;
        this.game.SMAgency.ChangeGameState(TexasGameState.Launch, null);
    }

    Protocol_Holdem_AutoOpActive_Handler(rec) {

    }

    Protocol_Holdem_AutoOp_Handler(rec) {

    }
    Protocol_Holdem_UpBlind_Handler(rec) {

    }
    Protocol_Holdem_AddOn_Handler(rec) {
    }
    Protocol_Holdem_SyncHand_Handler(rec: ServerMessageSyncHand.AsObject) {

        if (rec == null) {
            return;
        }
        (this.game as MTTGame).ClearRoundDate(4000);
    }
    Protocol_Holdem_HandClear_Handler(rec) {

    }
}
