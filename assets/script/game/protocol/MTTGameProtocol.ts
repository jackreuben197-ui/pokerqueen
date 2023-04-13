
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { Def } from "../../protobuf/holdem/define_pb";
import { ServerMessageAutoOp } from "../../protobuf/holdem/recv_auto_op_pb";
import { ServerMessageChipsChange } from "../../protobuf/holdem/recv_chips_change_pb";
import { ServerMessageHandClear } from "../../protobuf/holdem/recv_hand_clear_pb";
import { ServerMessageNotificationRoomReady } from "../../protobuf/holdem/recv_notification_room_ready_pb";
import { ServerMessageSeatedOthers } from "../../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import { ServerMessageSyncHand } from "../../protobuf/holdem/recv_sync_hand_pb";
import { ServerMessageUpBlind } from "../../protobuf/holdem/recv_up_blind_pb";
import { ServerMessageAddOn } from "../../protobuf/holdem/req_add_on_pb";
import { ServerMessageAutoOpActive } from "../../protobuf/holdem/req_auto_op_active_pb";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
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



    // 本手开始 隐藏倒计时界面
    public override handleRecvStartInfoCommon(rec: ServerMessageStartInfo.AsObject) {

        let game: MTTGame = this.game as MTTGame;

        game.HidePollDownTips();

        if (rec.handInfo.handNum == 1) {
            UIComponent.Instance.HideUI(PrefabUI.UIMTTTimeComponent);
        }
        game.gameStarted = true;
        game.isSyncHand = false;
        game.uirc.Image_WaitForStartBathTips.active = false;
        super.handleRecvStartInfoCommon(rec);

        game.ShowAddOnBtn();
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
    //主动托管/取消托管 消息回调
    Protocol_Holdem_AutoOpActive_Handler(rec: ServerMessageAutoOpActive.AsObject) {
        console.log("# MSG_CALLBACK MTT: Protocol_Holdem_AutoOpActive_Handler");

        if (rec == null) return;

        if (rec.status == 0) {
            UIComponent.Instance.Toast(i18nMgr.Get("Hosting_surre"));
        }
        else {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
        }
    }
    // 玩家托管状态通知消息
    Protocol_Holdem_AutoOp_Handler(rec: ServerMessageAutoOp.AsObject) {

        if (rec == null) return;

        let seat: Seat = this.game.GetSeatByServerSeatID(rec.seatId);

        if (seat?.Player == null) return;

        seat.Player.IsAutoOp = rec.enable;
        seat.UpdateTrust();

        //判断是自己
        let isMainPlayer: boolean = this.game.mainPlayer?.seatID == seat.Player.seatID

        // let isMainPlayer: boolean = this.game.mainPlayer != null
        //     && seat.Player.seatID == this.game.mainPlayer.seatID;
        if (isMainPlayer) {
            if (rec.enable) {
                this.game.uirc.HideMenu();
                this.game.HideOperationPanel();
                this.game.HideAutoOperationPanel();
                this.game.HideWaitBlindBtn();
                this.game.uirc.Text_CancelTrust.string = CPErrorCode.LanguageDescription(10011);
            }
            this.game.uirc.Button_CancelTrust.active = rec.enable;
        }
    }
    // 升盲消息
    Protocol_Holdem_UpBlind_Handler(rec: ServerMessageUpBlind.AsObject) {
        if (rec == null) return;
        let game: MTTGame = this.game as MTTGame;
        if (game.startAddOnLevel == rec.mttProgress.blindLevel) {
            UIComponent.Instance.Toast(i18nMgr.Get("AddOpen"));
        }
        if (game.endAddOnLevel == rec.mttProgress.blindLevel) {
            UIComponent.Instance.Toast(i18nMgr.Get("AddClose"));
        }
        if (game.cachePartialBringInReturnBlindLevel == rec.mttProgress.blindLevel) {
            UIComponent.Instance.Toast(i18nMgr.Get("Coming_soon"));
        }
        //升盲
        if (rec.mttProgress.blindLevel > game.BlindLevel) {
            //替换当前盲注为缓存的下一盲注
            game.curBld = game.nextBld;
            game.curAnte = game.nextAnte;
            game.groupBet = game.nextAnte;
            game.nextAnte = rec.mttProgress.nextAnte;
            game.nextBld = rec.mttProgress.nextSmallBlind;
            //开始新一轮计时
            game.upBlindLeftTime = rec.mttProgress.upBlindLeftTime;
            game.upBldCounting = true;
            game.addOnMode = rec.mttProgress.addonMode;
            game.ShowAddOnBtn();
        }
        else {
            game.upBlindLeftTime = 0;
            game.upBldCounting = false;
        }
        game.BlindLevel = rec.mttProgress.blindLevel;
    }
    // 增购
    Protocol_Holdem_AddOn_Handler(rec: ServerMessageAddOn.AsObject) {
        if (rec == null) return;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            return;
        }
        let game: MTTGame = this.game as MTTGame;
        switch (game.CurrentOpAddOnMode) {
            case Def.AddOnMode.ADDON_NONE:
                break;
            case Def.AddOnMode.PLUS_MODE1:
                game.mainPlayer.AddonPlusMode1Times++;
                game.mainPlayer.usedAddon = true;
                break;
            case Def.AddOnMode.PLUS_MODE2:
                game.mainPlayer.AddonPlusMode2Times++;
                game.mainPlayer.usedAddon = true;
                break;
            case Def.AddOnMode.ADDON_NORMAL:
                game.mainPlayer.AddOn = true;
                break;
            default:
                break;
        }
        UIComponent.Instance.Toast(i18nMgr.Get("AddGcg"));
    }
    Protocol_Holdem_SyncHand_Handler(rec: ServerMessageSyncHand.AsObject) {

        if (rec == null) {
            return;
        }
        (this.game as MTTGame).ClearRoundDate(4000);
    }
    Protocol_Holdem_HandClear_Handler(rec) {
        if (rec == null) return;
        this.HandleRoundFinish(null);
    }

    override HANDLER_REQ_GAME_CHANGE_CHIPS(rec: ServerMessageChipsChange.AsObject) {
        super.HANDLER_REQ_GAME_CHANGE_CHIPS(rec);
        let mSeat: Seat = null;
        for (let i = 0, n = this.game.listSeat.length; i < n; i++) {
            mSeat = this.game.listSeat[i];
            if (null == mSeat || null == mSeat.Player)
                continue;
            mSeat.UpdateHunterAward();
        }
    }

}
