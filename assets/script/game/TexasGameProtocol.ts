import Dispatcher from "../event/Dispatcher";
import { LanguageCode } from "../i18n/LanguageCode";
import GameCache from "../manager/GameCache";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import { CPlayer } from "./CPlayer";
import Seat from "./Seat";
import { SeatSitAnimation } from "./SeatStateHandler";
import TexasGame from "./TexasGame";

export default class TexasGameProtocol {

    constructor(public game: TexasGame) {
    }

    public RegisterMsgHandler(): void {
        this.RemoveMsgHandler();
        console.log(`TexasGame : RegisterMsgHandler`);

        Dispatcher.on(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this);//自己坐下
        Dispatcher.on(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this);  // 别人坐下
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Action, HANDLER_REQ_GAME_SEND_ACTION);  // 自己牌桌操作
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ActionAll, HANDLER_REQ_GAME_RECV_ACTION);  // 收到牌桌操作
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showcards, HANDLER_REQ_GAME_PLAYER_CARDS);  // Allin下发玩家手牌
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showdown, HANDLER_REQ_SHOWDOWN);  // 设置结束时亮的手牌
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTime, HANDLER_REQ_ADD_TIME);  // 操作加时
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, HANDLER_REQ_ADD_TIME_OTHERS);  // 其他人操作加时
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, HANDLER_REQ_SEE_MORE_PUBLIC_ACTION);  // 查看未发公共牌  
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER);  // 查看未发公共牌  
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SidePots, HANDLER_REQ_SHOW_SIDE_POTS);  // 显示分池筹码
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, HANDLER_REQ_INSURANCE_TRIGGED);  // 保险触发
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, HANDLER_REQ_CLAIM_INSURANCE);  // 保险赔付消息
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, HANDLER_REQ_BUY_INSURANCE);  // 购买保险
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeat, HANDLER_REQ_GAME_KEEP_SEAT);  // 留座离桌
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, HANDLER_REQ_GAME_MY_KEEP_SEAT);  // 自己留座离桌
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreePost, HANDLER_REQ_WAIT_BLIND);  // 过庄补盲
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, HANDLER_REQ_WAIT_BLIND_STATE);  // 补盲状态变化
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringIn, HANDLER_REQ_GAME_ADD_CHIPS);  // 带入
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StoreChips, HANDLER_REQ_GAME_OUT_CHIPS);  // 带出
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ChipsChange, HANDLER_REQ_GAME_CHANGE_CHIPS);  // 玩家牌桌记分牌变化
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BroadcastMsg, ProtocolHoldemBroadcastMsgHandler);  // 发送表情成功失败返回
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_GetMsg, ProtocolHoldemGetMsgHandler);  // 广播表情
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, ProtocolHoldemSetAutoOnTableHandler);  // 设置每手自动上桌筹码
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, ProtocolHoldemAgreeSecondPcsActiveHandler);  // 当前玩家同意拒绝第二张牌结果（不处理）
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, Protocol_Holdem_AgreeSecondPcsTriggedHandler);//触发 是否允许第二套牌
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, Protocol_Holdem_AgreeSecondPcsHandler); //玩家同意拒绝第二套牌结果

        //RegisterMessageHandler();
    }

    public RemoveMsgHandler(): void {
        console.log(`TexasGame : RemoveMsgHandler`);

        Dispatcher.off(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this);//自己坐下
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SeatedOthers, HANDLER_REQ_GAME_RECV_SEAT_DOWN);  // 别人坐下
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Action, HANDLER_REQ_GAME_SEND_ACTION);  // 自己牌桌操作
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ActionAll, HANDLER_REQ_GAME_RECV_ACTION);  // 收到牌桌操作
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showcards, HANDLER_REQ_GAME_PLAYER_CARDS);  // Allin下发玩家手牌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showdown, HANDLER_REQ_SHOWDOWN);  // 设置结束时亮的手牌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTime, HANDLER_REQ_ADD_TIME);  // 操作加时
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, HANDLER_REQ_ADD_TIME_OTHERS);  // 其他人操作加时
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, HANDLER_REQ_SEE_MORE_PUBLIC_ACTION);  // 查看未发公共牌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER);  // 查看未发公共牌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SidePots, HANDLER_REQ_SHOW_SIDE_POTS);  // 显示分池筹码
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, HANDLER_REQ_INSURANCE_TRIGGED);  // 保险触发
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, HANDLER_REQ_CLAIM_INSURANCE);  // 保险赔付消息
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, HANDLER_REQ_BUY_INSURANCE);  // 购买保险
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeat, HANDLER_REQ_GAME_KEEP_SEAT);  // 留座离桌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, HANDLER_REQ_GAME_MY_KEEP_SEAT);  // 自己留座离桌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreePost, HANDLER_REQ_WAIT_BLIND);  // 过庄补盲
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, HANDLER_REQ_WAIT_BLIND_STATE);  // 补盲状态变化
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringIn, HANDLER_REQ_GAME_ADD_CHIPS);  // 带入
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StoreChips, HANDLER_REQ_GAME_OUT_CHIPS);  // 带出
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ChipsChange, HANDLER_REQ_GAME_CHANGE_CHIPS);  // 玩家牌桌记分牌变化
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BroadcastMsg, ProtocolHoldemBroadcastMsgHandler);  // 发送表情
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_GetMsg, ProtocolHoldemGetMsgHandler);  // 广播表情
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, ProtocolHoldemSetAutoOnTableHandler);  // 设置每手自动上桌筹码
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, ProtocolHoldemAgreeSecondPcsActiveHandler);  // 同意拒绝第二张牌结果
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, Protocol_Holdem_AgreeSecondPcsTriggedHandler);//触发 是否允许第二套牌
        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, Protocol_Holdem_AgreeSecondPcsHandler); //玩家同意拒绝第二套牌结果
        //RemoveMessageHandler();
    }

    /// <summary>
    /// 其他玩家坐下
    /// </summary>
    /// <param name="response"></param>
    HANDLER_REQ_GAME_RECV_SEAT_DOWN(rec: ServerMessageSeatedOthers.AsObject) {
        if (rec == null) return;
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.seatId));
        if (null == mSeat) return;
        if (null != mSeat.Player) {
            mSeat.Player.Dispose();
            mSeat.Player = null;
        }
        let randomId = rec.userRid;
        let mPlayer: CPlayer = new CPlayer(randomId);
        //ComponentFactory.CreateWithId<CPlayer>(randomId);
        mPlayer.seatID = mSeat.seatID;
        mPlayer.sex = rec.sex;
        mPlayer.headPic = rec.avatar;
        mPlayer.nick = rec.name;
        mPlayer.userID = randomId;
        mPlayer.chips = rec.chips;
        mPlayer.canPlayStatus = Def.CanPlayStatus.DISABLE;
        mPlayer.actionStatus = Def.Action.NONE;
        mPlayer.ante = 0;
        mPlayer.IsAutoOp = false;
        mPlayer.cards = this.game.GetEmptyHandCards();
        mPlayer.HunterHeadValue = rec.hunterHeadValue;
        mPlayer.HunterKillAwardOther = rec.hunterKillAwardOther;
        mSeat.Player = mPlayer;
        mSeat.isBank = false;
        mSeat.FsmLogicComponent.SM.ChangeState(SeatSitAnimation.Instance);
    }
    /// <summary>
    /// 自己坐下
    /// </summary>
    /// <param name="response"></param>
    HANDLER_REQ_GAME_SEND_MY_SEAT(rec: ServerMessageSeated.AsObject) {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            ToastManager.ins.createToast(LanguageCode.ServerErrorDescription(rec.status));
            return;
        }
        this.game.mainPlayer.chips = rec.chips;
        this.game.mainPlayer.leavelChips = rec.accountChips;
        GameCache.Instance.gold = rec.accountChips;
        this.game.mainPlayer.cacheStoreChips = rec.storeChips;

        this.game.mainPlayer.actionStatus = Def.Action.NONE;
        this.game.mainPlayer.canPlayStatus = rec.postStatus;
        this.game.mainPlayer.IsAutoOp = false;
        this.game.mainPlayer.ante = 0;
        this.game.mainPlayer.anteNumber = 0;
        this.game.mainPlayer.cards = this.game.GetEmptyHandCards();

        let mSeat: Seat = null;
        // mSeat = GetSeatByLocalSeatID(GetLocalSeatID(rec.RecvSeatId));
        // if (null == mSeat)
        //     return;

        // mainPlayer.seatID = GetLocalSeatID(rec.RecvSeatId);
        // mSeat.Player = mainPlayer;
        // mSeat.isBank = false;
        // if (!mainPlayer.isParticipateInTheGame) {
        //     mSeat.UpdateWaiteNextTips(true);
        // }
        // HideWaitBlindBtn();

        // if (mSeat.Player.chips > GetMinPlayChips() && mSeat.seatID == mainPlayer.seatID) {
        //     if (mainPlayer.canPlayStatus == Def.Types.CanPlayStatus.NeedPost) {
        //         // 需要补盲
        //         ShowWaitBlindBtn();
        //         mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitBlind<Entity>.Instance);
        //     }
        //     else {
        //         mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart<Entity>.Instance);
        //     }

        // }

        // mSeat.FsmLogicComponent.SM.ChangeState(SeatSitAnimation<Entity>.Instance);

        // // todo 这里要搞十分十分十分酷炫的动画，把自己位移到最下方，0号位

        // if (mSeat.ClientSeatId > 0) {
        //     ResetSeatUIInfo(mSeat.ClientSeatId);
        // }
        // //房间坐下时时添加firebase事件触发
        // Dictionary < string, string > paramMap = new Dictionary<string, string>();
        // paramMap.Add("game_type", GameCache.Instance.game_type + "");//游戏类型
        // paramMap.Add("roomId", GameCache.Instance.room_id + "");//房间id
        // paramMap.Add("roomName", GameCache.Instance.roomName + "");//房间名称
        // paramMap.Add("room_type", GameCache.Instance.room_type + "");//房间类型
        // GoogleFirebaseHelper.LevelStartEvent(paramMap);
        // //添加到appsFlyer统计进入金币房间消息
        // Dictionary < string, string > valuesMap = new Dictionary<string, string>();
        // valuesMap.Add("game_type", GameCache.Instance.game_type + "");//游戏类型
        // valuesMap.Add("roomId", GameCache.Instance.room_id + "");//房间id
        // valuesMap.Add("roomName", GameCache.Instance.roomName + "");//房间名称
        // valuesMap.Add("room_type", GameCache.Instance.room_type + "");//房间类型
        // AppsFlyerHelper.GameEnterEvent(valuesMap);
    }
}
