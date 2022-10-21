
import { stringify } from "querystring";
import GC from "../frame/GameControl";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { i18nMgr } from "../i18n/i18nMgr";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def, PlayerChipChange, Result } from "../protobuf/holdem/define_pb";
import { ServerMessageActionAll } from "../protobuf/holdem/recv_action_all_pb";
import { ServerMessageAddTimeOthers } from "../protobuf/holdem/recv_add_time_others_pb";
import { ServerMessageChipsChange } from "../protobuf/holdem/recv_chips_change_pb";
import { ServerMessageHandClear } from "../protobuf/holdem/recv_hand_clear_pb";
import { ServerMessageKeepSeat } from "../protobuf/holdem/recv_keep_seat_pb";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageShowcards } from "../protobuf/holdem/recv_showcards_pb";
import { ServerMessageShowPublicCardsOthers } from "../protobuf/holdem/recv_show_public_cards_others_pb";
import { ServerMessageSidePots } from "../protobuf/holdem/recv_side_pots_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageWinner } from "../protobuf/holdem/recv_winner_pb";
import { ServerMessageAction } from "../protobuf/holdem/req_action_pb";
import { ServerMessageAddTime } from "../protobuf/holdem/req_add_time_pb";
import { ServerMessageBringIn } from "../protobuf/holdem/req_bring_in_pb";
import { ServerMessageKeepSeatActive } from "../protobuf/holdem/req_keep_seat_active_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import { ServerMessageSetAutoOnTable } from "../protobuf/holdem/req_set_auto_on_table_pb";
import { ServerMessageShowdown } from "../protobuf/holdem/req_showdown_pb";
import { ServerMessageShowPublicCards } from "../protobuf/holdem/req_show_public_cards_pb";
import { ClientMessageStoreChips, ServerMessageStoreChips } from "../protobuf/holdem/req_store_chips_pb";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import { CardType } from "./CardTypeUtil";
import { CPlayer } from "./CPlayer";
import { GameCache } from "./GameCache";
import { RoomType } from "./GameUtil";
import Seat from "./Seat";
import { SeatAddChips, SeatAllin, SeatCall, SeatCheck, SeatFold, SeatKeep, SeatOperation, SeatPutChip, SeatRaise, SeatRoundEnd, SeatSitAnimation, SeatStart, SeatStartToPlaying, SeatStraddle, SeatWaitBlind, SeatWaitOther, SeatWaitStart } from "./SeatStateHandler";
import TexasGame from "./texas/TexasGame";
import { TexasGameState } from "./TexasGameState";
import UIAutoOperationComponent from "./ui/UIAutoOperationComponent";
import UIOperationComponent from "./ui/UIOperationComponent";

const CanPlayStatus = Def.CanPlayStatus;

export default class TexasGameProtocol {

    constructor(public game: TexasGame) {
    }

    public RegisterMsgHandler(): void {

        console.log(`TexasGame : RegisterMsgHandler`);

        GC.notify.register(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this);//自己坐下
        GC.notify.register(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this);  // 别人坐下
        GC.notify.register(ProtocolCode.Protocol_Holdem_Action, this.HANDLER_REQ_GAME_SEND_ACTION, this);  // 自己牌桌操作
        GC.notify.register(ProtocolCode.Protocol_Holdem_ActionAll, this.HANDLER_REQ_GAME_RECV_ACTION, this);  // 收到牌桌操作
        GC.notify.register(ProtocolCode.Protocol_Holdem_Showcards, this.HANDLER_REQ_GAME_PLAYER_CARDS, this);  // Allin下发玩家手牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_Showdown, this.HANDLER_REQ_SHOWDOWN, this);  // 设置结束时亮的手牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME, this);  // 操作加时
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.HANDLER_REQ_ADD_TIME_OTHERS, this);  // 其他人操作加时
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION, this);  // 查看未发公共牌  
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER, this);  // 查看未发公共牌  
        GC.notify.register(ProtocolCode.Protocol_Holdem_SidePots, this.HANDLER_REQ_SHOW_SIDE_POTS, this);  // 显示分池筹码
        GC.notify.register(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.HANDLER_REQ_INSURANCE_TRIGGED, this);  // 保险触发
        GC.notify.register(ProtocolCode.Protocol_Holdem_BuyInsurance, this.HANDLER_REQ_CLAIM_INSURANCE, this);  // 保险赔付消息
        GC.notify.register(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.HANDLER_REQ_BUY_INSURANCE, this);  // 购买保险
        GC.notify.register(ProtocolCode.Protocol_Holdem_KeepSeat, this.HANDLER_REQ_GAME_KEEP_SEAT, this);  // 留座离桌
        GC.notify.register(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.HANDLER_REQ_GAME_MY_KEEP_SEAT, this);  // 自己留座离桌
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreePost, this.HANDLER_REQ_WAIT_BLIND, this);  // 过庄补盲
        GC.notify.register(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this);  // 补盲状态变化
        GC.notify.register(ProtocolCode.Protocol_Holdem_BringIn, this.HANDLER_REQ_GAME_ADD_CHIPS, this);  // 带入
        GC.notify.register(ProtocolCode.Protocol_Holdem_StoreChips, this.HANDLER_REQ_GAME_OUT_CHIPS, this);  // 带出
        GC.notify.register(ProtocolCode.Protocol_Holdem_ChipsChange, this.HANDLER_REQ_GAME_CHANGE_CHIPS, this);  // 玩家牌桌记分牌变化
        GC.notify.register(ProtocolCode.Protocol_Holdem_BroadcastMsg, this.ProtocolHoldemBroadcastMsgHandler, this);  // 发送表情成功失败返回
        GC.notify.register(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this);  // 广播表情
        GC.notify.register(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.ProtocolHoldemSetAutoOnTableHandler, this);  // 设置每手自动上桌筹码
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, this.ProtocolHoldemAgreeSecondPcsActiveHandler, this);  // 当前玩家同意拒绝第二张牌结果（不处理）
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, this.Protocol_Holdem_AgreeSecondPcsTriggedHandler, this);//触发 是否允许第二套牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, this.Protocol_Holdem_AgreeSecondPcsHandler, this); //玩家同意拒绝第二套牌结果
    }
    public RemoveMsgHandler(): void {
        console.log(`TexasGame : RemoveMsgHandler`);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this);//自己坐下
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this);  // 别人坐下
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Action, this.HANDLER_REQ_GAME_SEND_ACTION, this);  // 自己牌桌操作
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ActionAll, this.HANDLER_REQ_GAME_RECV_ACTION, this);  // 收到牌桌操作
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Showcards, this.HANDLER_REQ_GAME_PLAYER_CARDS, this);  // Allin下发玩家手牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Showdown, this.HANDLER_REQ_SHOWDOWN, this);  // 设置结束时亮的手牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME, this);  // 操作加时
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.HANDLER_REQ_ADD_TIME_OTHERS, this);  // 其他人操作加时
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION, this);  // 查看未发公共牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER, this);  // 查看未发公共牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SidePots, this.HANDLER_REQ_SHOW_SIDE_POTS, this);  // 显示分池筹码
        GC.notify.remove(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.HANDLER_REQ_INSURANCE_TRIGGED, this);  // 保险触发
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BuyInsurance, this.HANDLER_REQ_CLAIM_INSURANCE, this);  // 保险赔付消息
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.HANDLER_REQ_BUY_INSURANCE, this);  // 购买保险
        GC.notify.remove(ProtocolCode.Protocol_Holdem_KeepSeat, this.HANDLER_REQ_GAME_KEEP_SEAT, this);  // 留座离桌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.HANDLER_REQ_GAME_MY_KEEP_SEAT, this);  // 自己留座离桌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreePost, this.HANDLER_REQ_WAIT_BLIND, this);  // 过庄补盲
        GC.notify.remove(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this);  // 补盲状态变化
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BringIn, this.HANDLER_REQ_GAME_ADD_CHIPS, this);  // 带入
        GC.notify.remove(ProtocolCode.Protocol_Holdem_StoreChips, this.HANDLER_REQ_GAME_OUT_CHIPS, this);  // 带出
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ChipsChange, this.HANDLER_REQ_GAME_CHANGE_CHIPS, this);  // 玩家牌桌记分牌变化
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BroadcastMsg, this.ProtocolHoldemBroadcastMsgHandler, this);  // 发送表情
        GC.notify.remove(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this);  // 广播表情
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.ProtocolHoldemSetAutoOnTableHandler, this);  // 设置每手自动上桌筹码
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, this.ProtocolHoldemAgreeSecondPcsActiveHandler, this);  // 同意拒绝第二张牌结果
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, this.Protocol_Holdem_AgreeSecondPcsTriggedHandler, this);//触发 是否允许第二套牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, this.Protocol_Holdem_AgreeSecondPcsHandler, this); //玩家同意拒绝第二套牌结果
    }

    /// <summary>
    /// 其他玩家坐下
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_RECV_SEAT_DOWN(rec: ServerMessageSeatedOthers.AsObject) {
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
    protected HANDLER_REQ_GAME_SEND_MY_SEAT(rec: ServerMessageSeated.AsObject) {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(rec.status));
            return;
        }
        this.game.mainPlayer.chips = rec.chips;
        this.game.mainPlayer.leavelChips = rec.accountChips;
        // GameCache.Instance.gold = rec.accountChips;
        GC.data.user.info.gold = rec.accountChips;
        this.game.mainPlayer.cacheStoreChips = rec.storeChips;

        this.game.mainPlayer.actionStatus = Def.Action.NONE;
        this.game.mainPlayer.canPlayStatus = rec.postStatus;
        this.game.mainPlayer.IsAutoOp = false;
        this.game.mainPlayer.ante = 0;
        this.game.mainPlayer.anteNumber = 0;
        this.game.mainPlayer.cards = this.game.GetEmptyHandCards();

        let mSeat: Seat = null;
        mSeat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.recvSeatId));
        if (null == mSeat)
            return;

        this.game.mainPlayer.seatID = this.game.GetLocalSeatID(rec.recvSeatId);
        mSeat.Player = this.game.mainPlayer;
        mSeat.isBank = false;
        if (!this.game.mainPlayer.isParticipateInTheGame) {
            mSeat.UpdateWaiteNextTips(true);
        }
        this.game.HideWaitBlindBtn();

        if (mSeat.Player.chips > this.game.GetMinPlayChips() && mSeat.seatID == this.game.mainPlayer.seatID) {
            if (this.game.mainPlayer.canPlayStatus == CanPlayStatus.NEED_POST) {
                // 需要补盲
                this.game.ShowWaitBlindBtn();
                mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitBlind.Instance);
            }
            else {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            }

        }

        mSeat.FsmLogicComponent.SM.ChangeState(SeatSitAnimation.Instance);

        // todo 这里要搞十分十分十分酷炫的动画，把自己位移到最下方，0号位

        if (mSeat.ClientSeatId > 0) {
            this.game.ResetSeatUIInfo(mSeat.ClientSeatId);
        }
        //房间坐下时时添加firebase事件触发
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
    /// <summary>
    /// 补盲状态变化
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_WAIT_BLIND_STATE(rec: ServerMessagePostStatusChange.AsObject): void {

        if (rec == null) {
            return;
        }

        if (rec.changesList == null) {
            return;
        }

        for (let i = 0; i < rec.changesList.length; i++) {
            let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.changesList[i].seatId));
            if (null != mSeat) {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            }
            if (mSeat.seatID == this.game.mainPlayer.seatID) {
                if (rec.changesList[i].currentPostStatus == Def.CanPlayStatus.NORMAL || rec.changesList[i].currentPostStatus == Def.CanPlayStatus.AGREE_POST) {
                    mSeat.Player.canPlayStatus = Def.CanPlayStatus.NORMAL;
                    this.game.HideWaitBlindBtn();
                }
                else if (rec.changesList[i].currentPostStatus == Def.CanPlayStatus.NEED_POST) {
                    // 需要补盲
                    this.game.ShowWaitBlindBtn();
                    mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitBlind.Instance);
                }
            }
            else {
                mSeat.Player.canPlayStatus = rec.changesList[i].currentPostStatus;
            }
        }
    }

    /// <summary>
    /// 本手开始
    /// </summary>
    /// <param name="responseData"></param>
    /// <param name="obj"></param>
    public handleRecvStartInfoCommon(responseData: ServerMessageStartInfo.AsObject, obj): void {
        this.game.gamestatus = 1;
        GameCache.Instance.GameStatus = this.game.gamestatus;
        this.game.cacheRound = Def.Round.PREFLOP;
        this.game.uirc.imageWaitForStartTips.active = false;
        this.game.fuck4thPCardByInsuranceState = 0;
        this.game.isAllinGetPlayerCards = false;
        this.game.lastBankerIndex = this.game.bankerIndex;
        this.game.bankerIndex = this.game.GetLocalSeatID(responseData.handInfo.buSeatId);
        this.game.bigIndex = this.game.GetLocalSeatID(responseData.handInfo.bbSeatId);
        this.game.smallIndex = this.game.GetLocalSeatID(responseData.handInfo.sbSeatId);
        if (responseData.nextOperator != null) {
            this.game.operationID = this.game.GetLocalSeatID(responseData.nextOperator.seatId);
        }
        this.game.mHandNum = responseData.handInfo.handNum;
        this.game.UpdateRoomDes();
        this.game.ResetPublicCardsId();
        this.game.ClearPublicCardsUI();
        this.game.HideWaitBlindBtn();
        let Seat: Seat = null;
        let SeverSeatIds: number[] = [];
        for (let i = 0, n = responseData.playersList.length; i < n; i++) {
            Seat = this.game.listSeat[this.game.GetLocalSeatID(responseData.playersList[i].seatId)];
            if (null == Seat || null == Seat.Player) {
                continue;
            }
            SeverSeatIds.push(this.game.GetLocalSeatID(responseData.playersList[i].seatId));
            Seat.isBank = Seat.seatID == this.game.bankerIndex;
            Seat.isBig = Seat.seatID == this.game.bigIndex;
            Seat.isSmall = Seat.seatID == this.game.smallIndex;
            Seat.isStraddle = responseData.playersList[i].action == Def.Action.STRADDLE;
            Seat.Player.SetCards(this.game.GetHandCardsAtRecvStartInfo(responseData, i));
            Seat.Player.chips = responseData.playersList[i].chip;
            Seat.Player.cacheChips = responseData.playersList[i].chip + responseData.playersList[i].roundBet + responseData.playersList[i].ante;
            Seat.Player.canPlayStatus = Def.CanPlayStatus.NORMAL;//数组里面有人即可打牌
            Seat.Player.extraBlind = 0;//是否补盲，已在列表的玩家不需要补盲
            Seat.Player.isFold = responseData.playersList[i].action == Def.Action.FOLD;
            Seat.FoldHeadGray(Seat.Player.isFold);
            Seat.Player.actionStatus = responseData.playersList[i].action;
            Seat.Player.anteNumber = 0;
            Seat.UpdateWaiteNextTips(false);
            Seat.FsmLogicComponent.SM.ChangeState(SeatStart.Instance);
            Seat.Player.anteNumber += responseData.playersList[i].roundBet;
            if (Seat.isStraddle) {
                Seat.FsmLogicComponent.SM.ChangeState(SeatStraddle.Instance);
            }
            if (responseData.playersList[i].ante >= 0) {
                this.game.alreadAnte += responseData.playersList[i].ante;
                this.game.alreadAnte += responseData.playersList[i].roundBet;
            }
            if (Seat.seatID == this.game.mainPlayer.seatID) {
                this.game.HideWaitBlindBtn();
            }

            //设置卡牌隐藏
            for (let i = 0, n = Seat.uirc.listCardUIInfos.length; i < n; i++) {
                Seat.uirc.listCardUIInfos[i].imageSelect.node.active = false;
            }
            for (let i = 0, n = Seat.uirc.listSmallCardUIInfos.length; i < n; i++) {
                Seat.uirc.listSmallCardUIInfos[i].imageSelect.node.active = false;
            }

        }
        if (this.game.smallIndex >= 0) {
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_BET_FIRST);
        }
        else {
            //（短牌没有小盲注位置）当小盲位小于零，算出小盲位置，用于首位发牌人座位。
            this.game.smallIndex = this.game.TexasGameUtils.GetSmallSeatIdByPlayingSeatIds(SeverSeatIds, this.game.bigIndex);
        }
        if (this.game.bigIndex >= 0) {
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_BET_SECOND);
        }

        //判断座位是否运动中,做延迟处理
        if (this.game.SeatPlayRecord.SeatMove) {
            this.game.SeatPlayRecord.StartInfo = responseData;
            this.game.SeatPlayRecord.PlayDealFunc = this.__PlayDealAnimation.bind(this);
            cc.log("————————>延迟执行发牌");
        } else {
            this.__PlayDealAnimation(responseData);
            cc.log("————————>立刻执行发牌");
        }
    }
    private __PlayDealAnimation(responseData) {
        this.game.ResetSeatPlayRecord();
        this.game.PlayDealAnimation(() => {
            cc.log("发牌结束");
            this.game.UpdateAlreadAnte();
            let mSeat0: Seat = null;
            for (let i = 0, n = responseData.playersList.length; i < n; i++) {
                mSeat0 = this.game.listSeat[this.game.GetLocalSeatID(responseData.playersList[i].seatId)];
                if (null == mSeat0 || null == mSeat0.Player) {
                    continue;
                }

                mSeat0.FsmLogicComponent.SM.ChangeState(SeatStartToPlaying.Instance);

                if (this.game.operationID == mSeat0.seatID) {
                    mSeat0.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
                }
                else {
                    mSeat0.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                }
            }

            mSeat0 = this.game.GetSeatByLocalSeatID(this.game.operationID);
            let mMySeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);

            if (null != mMySeat && mMySeat.seatID == mSeat0.seatID && mMySeat.Player.userID == mSeat0.Player.userID) {

                // 到自己操作
                this.game.HideAutoOperationPanel();
                if (mMySeat.Player.isParticipateInTheGame && !mMySeat.Player.IsAutoOp) {
                    this.game.ShowOperationPanel(UIOperationComponent.OperationData(responseData.nextOperator.actionsList, responseData.nextOperator.shortcutsList));
                }
            }
            else {
                // 其他人操作
                this.game.HideOperationPanel();
                if (null != mMySeat && mMySeat.Player.isParticipateInTheGame) {
                    // 自己参与游戏
                    // 非弃牌 && 非ALLIN && 非托管
                    if (mMySeat.Player.actionStatus != Def.Action.FOLD && mMySeat.Player.actionStatus != Def.Action.ALLIN && mMySeat.Player.actionStatus != Def.Action.NONE && !mMySeat.Player.IsAutoOp) {

                        UIComponent.Instance.ShowUI(PrefabUI.UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(responseData.handInfo.roundBet)));
                    }
                    else {
                        this.game.HideAutoOperationPanel();
                    }
                }
                else {
                    // 观众
                    this.game.HideAutoOperationPanel();
                }
            }
        });
    }


    /// <summary>
    /// 设置自动上桌筹码
    /// </summary>
    /// <param name="response"></param>
    protected ProtocolHoldemSetAutoOnTableHandler(rec: ServerMessageSetAutoOnTable.AsObject) {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
        }
    }

    /// <summary>
    /// 主动留座离桌
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_MY_KEEP_SEAT(rec: ServerMessageKeepSeatActive.AsObject): void {
        if (rec == null) {
            return;
        }
        if (rec.status != 0)
            return;
        if (!this.game.cacheCancelKeepSeat) {
            this.game.uirc.imageReserveSeatTips.active = true;
            this.game.TexasGameUtils.WaitFewSeconds(this.game.uirc.imageReserveSeatTips, 3000);
        }
    }
    /// <summary>
    /// 留座离桌
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_KEEP_SEAT(rec: ServerMessageKeepSeat.AsObject): void {

        if (rec == null) {
            return;
        }
        //留座离桌
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.seatId));
        if (null == mSeat) {
            return;
        }
        if (rec.keep) {
            mSeat.keepSeatLeftTime = rec.leftTime - 5;//由于留座消息下发时间是每手结束，需要在清理桌面时才显示留座，中间间隔五秒。
            mSeat.Player.canPlayStatus = Def.CanPlayStatus.KEEP_SEAT;
            this.game.SetIsEixt(true);
        }
        else {
            this.game.cacheCancelKeepSeat = false;
            mSeat.Player.canPlayStatus = rec.postStatus;
            if (!mSeat.Player.isParticipateInTheGame) {
                mSeat.UpdateWaiteNextTips(true);
            }
            this.game.HideWaitBlindBtn();
            if (mSeat.seatID == this.game.mainPlayer.seatID) {
                if (this.game.mainPlayer.canPlayStatus == Def.CanPlayStatus.NEED_POST) {
                    // 需要补盲
                    this.game.ShowWaitBlindBtn();
                    mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitBlind.Instance);
                }
                else {
                    mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
                }
            }
            else {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            }
            this.game.SetIsEixt(false);
        }
    }
    /// <summary>
    /// 底池筹码（分池，主池）
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_SHOW_SIDE_POTS(rec: ServerMessageSidePots.AsObject): void {
        if (rec == null) {
            return;
        }
        let m_pots: number[] = [];
        for (let i = 0; i < rec.potsList.length; i++) {
            m_pots.push(rec.potsList[i].amount);
        }
        if (rec.secondPotsList != null) {
            for (let i = 0; i < rec.secondPotsList.length; i++) {
                m_pots[i] += rec.secondPotsList[i].amount;
            }
        }
        this.game.pots = m_pots;
        // 播放首次收筹码到底池动画是不需要显示Pots
        if (this.game.GetCurPublicCardsCount() > 0)
            this.game.UpdatePots();
    }

    /// <summary>
    /// 查看公共牌
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_SEE_MORE_PUBLIC_ACTION(rec: ServerMessageShowPublicCards.AsObject) {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_SEE_MORE_PUBLIC_ACTION, rec.Status)
            return;
        }
        // GameCache.Instance.gold -= this.game.checkPublicCardsCost;
        GC.data.user.info.gold -= this.game.checkPublicCardsCost;
        this.game.cacheRound = rec.round;
        this.game.AddPublicCards(rec.publicCardsList);
        //启用按钮
        this.game.uirc.buttonSeeMorePublic.getChildByName("click").getComponent(cc.Button).interactable = true;
        // 花费查看未发公共牌
        if (this.game.GetCurPublicCardsCount() == 5) {
            this.game.HideSeeMorePublic();
        }
        this.game.UpdatePublicCardsNoAnim();
    }
    /// <summary>
    /// 其他人查看公共牌后提示
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER(rec: ServerMessageShowPublicCardsOthers.AsObject) {

        if (rec == null) {
            return;
        }
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.seatId));
        //花费查看未发公共牌
        if (mSeat != null && mSeat.Player != null && mSeat.Player.nick?.length) {
            if (rec.round < 3) {
                //查看翻牌圈的牌;
                this.game.ShowSeeMorePublicTips(`${mSeat.Player.nick}${CPErrorCode.LanguageDescription(20025)}`);
            }
            else if (rec.round == 3) {
                //查看转牌圈的牌;
                this.game.ShowSeeMorePublicTips(`${mSeat.Player.nick}${CPErrorCode.LanguageDescription(20026)}`);
            }
            else if (rec.round == 4) {
                //查看河牌圈的牌;
                this.game.ShowSeeMorePublicTips(`${mSeat.Player.nick}${CPErrorCode.LanguageDescription(20027)}`);
            }
        }
    }



    /// <summary>
    /// 展示底牌
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_PLAYER_CARDS(rec: ServerMessageShowcards.AsObject) {
        if (rec == null) {
            return;
        }
        this.game.isAllinGetPlayerCards = true;
        // 保险模式，allin后要收筹码，不用等收到公共牌再收。
        if (this.game.insurance && this.game.GetCurPublicCardsCount() > 0) {
            this.game.PlayRecyclingChipAnimation(null);
        }
        let mSeat: Seat = null;
        for (let i = 0, n = rec.playerCardsList.length; i < n; i++) {
            if (rec.playerCardsList[i].seatId == 0)
                continue;

            mSeat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.playerCardsList[i].seatId));
            if (null == mSeat)
                return;
            if (rec.playerCardsList[i].cardsList != null && rec.playerCardsList[i].cardsList[0] == 0 && rec.playerCardsList[i].cardsList[1] == 0) {
                console.log("player allin card =null");
                return;
            }
            let allinCards: number[] = [];
            for (let j = 0; j < rec.playerCardsList[i].cardsList.length; j++) {
                allinCards.push(rec.playerCardsList[i].cardsList[j]);
            }
            mSeat.Player.SetCards(allinCards);
            if (this.game.mainPlayer.seatID == mSeat.seatID && !rec.isAll) {
                return;
            }
            mSeat.UpdateCards(rec.isAll);
            //allin后显示自己头像
            if (this.game.mainPlayer.seatID == mSeat.seatID) {
                mSeat.SetOperationHeadActive(true);
            }
        }
    }


    /// <summary>
    /// 主动操作加时
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_ADD_TIME(rec: ServerMessageAddTime.AsObject): void {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            this.game.ClickAddTime = false;
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_ADD_TIME, rec.Status)
            return;
        }
        this.game.delayCount = rec.times;
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat) return;
        mSeat.AddOperationTime(rec.duration);
        this.game.UpdateDelayBtn();
        this.game.ClickAddTime = false;
    }

    /// <summary>
    /// 其他人操作加时（不包含自己）
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_ADD_TIME_OTHERS(rec: ServerMessageAddTimeOthers.AsObject) {
        if (rec == null) {
            return;
        }
        //他人延时
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.seatId));
        if (null == mSeat) return;
        mSeat.AddOperationTime(rec.duration);
    }



    /// <summary>
    /// 当前玩家操作结果和下一位操作者
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_RECV_ACTION(rec: ServerMessageActionAll.AsObject): void {

        if (rec == null) {
            return;
        }

        let Seat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.operatorSeatId));
        if (null == Seat) {
            cc.warn("Seat is null");
            GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.NetworkException, null);
            return;
        }

        this.game.stopUpdatePublicCardsAnimation = false;
        // if (null != this.game.sequencePlayFirstRecyclingChipAnimation && sequencePlayFirstRecyclingChipAnimation.IsPlaying()) {
        //     stopUpdatePublicCardsAnimation = true;
        //     sequencePlayFirstRecyclingChipAnimation.Complete(true);

        // }
        // if (null != sequencePlayRecyclingChipAnimation && sequencePlayRecyclingChipAnimation.IsPlaying()) {
        //     stopUpdatePublicCardsAnimation = true;
        //     sequencePlayRecyclingChipAnimation.Complete(true);

        // }
        // if (null != sequenceUpdatePublicCards && sequenceUpdatePublicCards.IsPlaying()) {
        //     sequenceUpdatePublicCards.Complete(true);
        // }

        if (rec.nextOperator != null) {
            this.game.operationID = this.game.GetLocalSeatID(rec.nextOperator.seatId);
        }
        else {
            this.game.operationID = -1;
        }
        this.game.alreadAnte = rec.allBet;

        this.game.UpdateAlreadAnte();

        if (Seat != null && Seat.Player != null) {
            Seat.Player.actionStatus = rec.action;
            Seat.Player.chips -= rec.amount;
            Seat.Player.anteNumber += rec.amount;

            // 下注putchip = 1,跟注call = 2,加注raise = 3,全下allin = 4,让牌check = 5,弃牌fold = 6,超时timeout = 7
            switch (rec.action) {
                case Def.Action.BET:
                    Seat.Player.isOffLine = 0;
                    Seat.FsmLogicComponent.SM.ChangeState(SeatPutChip.Instance);
                    break;
                case Def.Action.CALL:
                    Seat.Player.isOffLine = 0;
                    Seat.FsmLogicComponent.SM.ChangeState(SeatCall.Instance);
                    break;
                case Def.Action.RAISE:
                    Seat.Player.isOffLine = 0;
                    Seat.FsmLogicComponent.SM.ChangeState(SeatRaise.Instance);
                    break;
                case Def.Action.ALLIN:
                    Seat.Player.isOffLine = 0;
                    Seat.FsmLogicComponent.SM.ChangeState(SeatAllin.Instance);
                    break;
                case Def.Action.CHECK:
                    // 其他玩家托管状态，发一牌就check
                    // if (null != sequencePlayDealAnimation && sequencePlayDealAnimation.IsPlaying()) {
                    //     sequencePlayDealAnimation.Complete(true);
                    // }
                    Seat.FsmLogicComponent.SM.ChangeState(SeatCheck.Instance);
                    break;
                case Def.Action.FOLD:
                    // 其他玩家托管状态，发一牌就弃牌
                    Seat.Player.isFold = true;
                    // if (null != sequencePlayDealAnimation && sequencePlayDealAnimation.IsPlaying()) {
                    //     sequencePlayDealAnimation.Complete(true);
                    // }
                    Seat.FsmLogicComponent.SM.ChangeState(SeatFold.Instance);
                    break;
                case Def.Action.STRADDLE:
                    Seat.Player.isOffLine = 0;
                    Seat.FsmLogicComponent.SM.ChangeState(SeatPutChip.Instance);
                    break;
            }
            Seat.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);

        }
        else {
            console.log("Error mSeat is null or mSeat.Player is null");
        }

        if (this.game.operationID != -1) {
            Seat = this.game.GetSeatByLocalSeatID(this.game.operationID);
            if (null == Seat || null == Seat.Player) {
                console.warn("Seat is null");
                GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.NetworkException, null);
                return;
            }
            if (Seat.seatID == this.game.mainPlayer.seatID && Seat.Player.userID == this.game.mainPlayer.userID && this.game.mainPlayer.isPlaying) {
                // 到自己操作
                // 自动
                this.game.HideAutoOperationPanel();
                if ((this.game.autoFold || this.game.autoCheck || (this.game.autoCall && rec.action != Def.Action.RAISE && rec.action != Def.Action.ALLIN) || this.game.autoAllin)) {
                    this.game.HideOperationPanel();
                    if (this.game.TexasGameUtils.AutoOperationHandle(rec.nextOperator.actionsList)) {
                        this.game.HideOperationPanel();
                    }
                    else {
                        this.game.ShowOperationPanel(UIOperationComponent.OperationData(rec.nextOperator.actionsList, rec.nextOperator.shortcutsList));

                    }
                }
                else {
                    this.game.ShowOperationPanel(UIOperationComponent.OperationData(rec.nextOperator.actionsList, rec.nextOperator.shortcutsList));
                }
            }
            else {
                // 下一个操作不是自己
                this.game.HideOperationPanel();

                if (this.game.mainPlayer.isParticipateInTheGame) {
                    // 自己有参与游戏
                    if ((this.game.mainPlayer.actionStatus != Def.Action.FOLD && this.game.mainPlayer.actionStatus != Def.Action.ALLIN && this.game.mainPlayer.actionStatus != Def.Action.NONE) && !this.game.mainPlayer.IsAutoOp) {

                        UIComponent.Instance.ShowUI(PrefabUI.UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(rec.roundBet)));

                    }
                    else {
                        this.game.HideAutoOperationPanel();
                    }
                }
                else {
                    // 观众
                    this.game.HideAutoOperationPanel();
                }
            }

            Seat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
        }
        else {
            this.game.HideOperationPanel();
            //UIComponent.Instance.HideUI(UIType.UIAutoOperation);
        }
    }




    /// <summary>
    /// 自己动作
    /// </summary>
    /// <param name="response"></param>
    HANDLER_REQ_GAME_SEND_ACTION(rec: ServerMessageAction.AsObject) {
        //throw new Error("Method not implemented.");
        if (rec == null) {
            return;
        }
        this.game.autoFold = false;
        this.game.autoCall = false;
        this.game.autoAllin = false;
        this.game.autoCheck = false;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            return;
        }
        this.game.HideOperationPanel();
    }


    /// <summary>
    /// 处理第一，二套公共牌赢牌动画
    /// </summary>
    private async HandleMessageSecondPcsWinnerData() {
        await TimeHelper.Sleep(1500);
        let mSeat: Seat = null;
        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {
            mSeat = this.game.listSeat[this.game.GetLocalSeatID(this.game.MessageWinnerData.resultsList[i].seatId)];
            if (null == mSeat || null == mSeat.Player)
                continue;
            if (!mSeat.IsMySeat) {
                //自己的牌不用更新
                mSeat.Player.SetCards(this.game.GetHandCardsAtRecvWinner(this.game.MessageWinnerData, i));
                mSeat.UpdateCards();
            }
            if (mSeat.IsMySeat) {
                GameCache.Instance.CurGame.mainPlayer.chips = this.game.MessageWinnerData.resultsList[i].chip;
                mSeat.UpdateImageBackActive();
            }
        }
        this.game.TexasGameUtils.SetWinnerCardsHight(this.game.uirc.listCards, this.game.cards);
        //第一套牌
        this.game.SetSecondPublicCardImageColor(cc.Color.GRAY);
        this.HandleTwoWinnerAnimation(true);

        await TimeHelper.Sleep(3000);

        //等待3秒，处理第二套牌动画

        this.game.SetSecondPublicCardImageColor(cc.Color.WHITE);
        this.game.SetPublicCardsImageColor(cc.Color.GRAY);
        this.game.TexasGameUtils.SetWinnerCardsHight(this.game.uirc.listSecondCards, this.game.secondCards);
        this.HandleTwoWinnerAnimation(false);
    }
    /// <summary>
    /// 处理两套公共牌
    /// </summary>
    /// <param name="isFirst"></param>
    private HandleTwoWinnerAnimation(isFirst: boolean): void {
        //Sequence Sequence = null;
        let Sequence = { tween: cc.tween() };
        let tween = Sequence.tween;
        let SeatId = 0;
        let Seat: Seat = null;
        let mainSeatHightCards: number[] = [];


        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {
            let Result = this.game.MessageWinnerData.resultsList[i]
            SeatId = this.game.GetLocalSeatID(Result.seatId);
            Seat = this.game.GetSeatByLocalSeatID(SeatId);
            if (null != Seat && null != Seat.Player && Seat.Player.actionStatus == Def.Action.NONE) {
                console.log("not is Participate In The Game");
                continue;
            }
            if (null == Seat || null == Seat.Player)
                continue;

            let isWin1: boolean = Result.splitResultsList[0].isWinner;
            let isWin2: boolean = Result.splitResultsList[1].isWinner;
            let win1: number = Result.splitResultsList[0].win;
            let win2: number = Result.splitResultsList[1].win;
            let fee: number = Result.fee;
            let fee1: number = 0;
            let fee2: number = 0;

            if (isWin1 && isWin2) {
                if (fee != 0) {
                    fee1 = win1 * fee / (win1 + win2);
                    fee2 = fee - fee1;
                }
            }
            else {
                fee1 = isWin1 ? fee : 0;
                fee2 = isWin2 ? fee : 0;
            }
            let handBet1: number = Result.handBet / 2 ^ 0;
            let handBet2: number = Result.handBet - handBet1;

            Seat.Player.winChips = isFirst ? Result.splitResultsList[0].win - handBet1 - fee1 : Result.splitResultsList[1].win - handBet2 - fee2;


            if (Seat.Player.winChips <= 0) {
                Seat.Player.winChips = 0;
            }
            Seat.Player.recyclingChip = isFirst ? Result.splitResultsList[0].win : Result.splitResultsList[1].win;
            Seat.Player.cardType = isFirst ? Result.handValueType : Result.handValueType2;
            Seat.Player.isWin = isFirst ? Result.splitResultsList[0].isWinner : Result.splitResultsList[1].isWinner;

            Seat.StopAllinArmature();
            Seat.StopWinArmature();
            Seat.PlayWinArmature();
            Seat.UpdateRecyclingWinChip();

            let PlayRecyclingWinChipAnimation_Tween = Seat.PlayRecyclingWinChipAnimation(this.game.uirc.node.convertToWorldSpaceAR(this.game.uirc.textAlreadAnte.node.position));

            if (PlayRecyclingWinChipAnimation_Tween) {

                tween.then(cc.callFunc(() => {
                    PlayRecyclingWinChipAnimation_Tween.IsPlaying = true;
                    PlayRecyclingWinChipAnimation_Tween.tween.start();
                }));
            }
            if (SeatId == this.game.mainPlayer.seatID) {
                if (isFirst) {

                    Result.winCardsList.forEach(winCard => {
                        mainSeatHightCards.push(winCard.card);
                    })
                }
                else {
                    Result.winCards2List.forEach(winCard => {
                        mainSeatHightCards.push(winCard.card);
                    })
                }
            }
            Seat.Player.chips = isFirst ? Result.chip + Result.fee - Result.splitResultsList[1].win - fee1 : Result.chip;
            Seat.UpdateCoin();
        }
        tween.start();
        let mainSeat: Seat = null;
        mainSeat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (mainSeat != null) {
            let cacheCards: number[] = isFirst ? this.game.cards : this.game.secondCards;

            let highlightCards_ref = { highlightCards: null };
            let cardType: CardType = this.game.GetCardType(highlightCards_ref, cacheCards);
            //let highlightCards = highlightCards_ref.highlightCards;
            mainSeat.UpdateCardType(cardType, mainSeatHightCards, true);
        }
    }
    /// <summary>
    /// 处理仅有一套公共牌
    /// </summary>
    private HandleMessageWinnerData(): void {
        let mSeat: Seat = null;
        // 1.发完5张公共牌
        // 2.有发生比牌
        let mOtherAllFold: boolean = true;
        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {
            let result: Result.AsObject = this.game.MessageWinnerData.resultsList[i];
            mSeat = this.game.listSeat[this.game.GetLocalSeatID(result.seatId)];
            if (null != mSeat && null != mSeat.Player && mSeat.Player.isParticipateInTheGame && mSeat.Player.isFold == false) {
                mOtherAllFold = false;
            }
            if (null != mSeat && null != mSeat.Player && mSeat.Player.actionStatus == Def.Action.NONE) {
                cc.log("not is Participate In The Game");
                continue;
            }
            //先更新手牌，方便后面做大牌动画
            if (null == mSeat || null == mSeat.Player)
                continue;
            if (result.chip == 0) {
                mSeat.Player.MttHunterKillAwardOtherPlus = 0;
                mSeat.Player.HunterKillAwardOther = 0;
                mSeat.Player.HunterHeadValue = 0;
            }
            else {
                mSeat.Player.MttHunterKillAwardOtherPlus += result.mttHunterKillAwardOtherPlus;
            }

            if (!mSeat.IsMySeat) {
                //自己的牌不用更新
                mSeat.Player.SetCards(this.game.GetHandCardsAtRecvWinner(this.game.MessageWinnerData, i));
            }
            if (mSeat.IsMySeat) {
                GameCache.Instance.CurGame.mainPlayer.chips = result.chip;
                mSeat.UpdateImageBackActive();
            }
            let mShow = false;
            for (let j = 0, k = mSeat.Player.cards.length; j < k; j++) {
                if (mSeat.Player.cards[j] != -1) {
                    mShow = true;
                    break;
                }
            }
            if (!mShow) {
                if (!mSeat.Player.isFold)
                    mSeat.UpdateCards();
            }
            else {
                mSeat.UpdateCards();
            }

        }



        let mCount = this.game.GetCurPublicCardsCount();
        let mCanPlayEndPublicCardsAnimation = mCount == 5 && !mOtherAllFold;
        if (mCanPlayEndPublicCardsAnimation) {
            let highlightCards_ref = { highlightCards: null };
            let cardType: CardType = this.game.GetCardType(highlightCards_ref, this.game.cards);
            let highlightCards = highlightCards_ref.highlightCards;
            for (let i = 0, n = this.game.uirc.listCards.length; i < n; i++) {
                this.game.uirc.listCards[i].imageSelect.node.active = false;
                for (let j = 0, m = highlightCards.length; j < m; j++) {
                    if (this.game.uirc.listCards[i].cardId == highlightCards[j]) {
                        this.game.uirc.listCards[i].imageSelect.node.active = true;
                        break;
                    }
                }
            }
            let mSeatmy: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
            if (null != mSeatmy) {
                if (this.game.mainPlayer.cards.length > 3) {
                    mSeatmy.UpdateCardType(cardType, highlightCards, true);
                }
            }
        }
        this.game.sequencePlayEndPublicCardsAnimation = { tween: cc.tween(this.game.uirc.node), IsPlaying: true };
        let tween: cc.Tween = null;
        if (mCanPlayEndPublicCardsAnimation) {
            tween = this.game.sequencePlayEndPublicCardsAnimation.tween;
        }
        let mSeatId = -1;
        let mIsFirst: boolean = true;
        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {

            mSeat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(this.game.MessageWinnerData.resultsList[i].seatId));

            if (null != mSeat && null != mSeat.Player && mSeat.Player.actionStatus == Def.Action.NONE) {
                cc.log("not is Participate In The Game");
                continue;
            }

            if (null == mSeat || null == mSeat.Player)
                continue;
            if (mSeat.Player.muckStatus == 1) {
                //盖牌
                mSeat.Player.actionStatus = Def.Action.FOLD;
                mSeat.UpdateBubble();
            }

            mSeat.UpdateCoin();

            if (mCanPlayEndPublicCardsAnimation) {
                if (mSeat.CanPlayRecyclingWinChipAnimation) {
                    // if (mIsFirst) {
                    //     mIsFirst = false;
                    //     tween.Append(mSeat.PlayRecyclingChipAnimation());
                    // }
                    // else {
                    //     tween.Join(mSeat.PlayRecyclingChipAnimation());
                    // }
                    mSeat.PlayRecyclingChipAnimation();
                }
            }
            else {
                if (mSeat.CanPlayRecyclingWinChipAnimation)
                    //tween = mSeat.PlayRecyclingChipAnimation();
                    mSeat.PlayRecyclingChipAnimation();
            }
        }

        if (null == tween)
            tween = this.game.sequencePlayEndPublicCardsAnimation.tween;


        //mIsFirst = true;
        // let isHaveWiner = false;
        // for (let i = 0; i < this.game.MessageWinnerData.resultsList.length; i++) {
        //     if (this.game.MessageWinnerData.resultsList[i].win > this.game.MessageWinnerData.resultsList[i].handBet) {
        //         isHaveWiner = true;
        //     }
        // }
        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {

            let result = this.game.MessageWinnerData.resultsList[i];

            mSeatId = this.game.GetLocalSeatID(result.seatId);

            mSeat = this.game.GetSeatByLocalSeatID(mSeatId);

            if (null != mSeat && null != mSeat.Player && mSeat.Player.actionStatus == Def.Action.NONE) {
                cc.log("not is Participate In The Game");
                continue;
            }
            if (null == mSeat || null == mSeat.Player)
                continue;

            if (result.win > result.handBet) {
                mSeat.Player.winChips = result.win + result.insuranceWin - result.insurance - result.handBet - result.fee;
            }
            else {
                mSeat.Player.winChips = result.insuranceWin;
            }
            mSeat.Player.recyclingChip = result.win;
            mSeat.Player.cardType = result.handValueType;
            mSeat.Player.isWin = result.win > result.handBet;
            mSeat.StopAllinArmature();
            mSeat.PlayWinArmature();
            mSeat.UpdateRecyclingWinChip();
            //猎人赛人头奖励刷新
            // if (GameCache.Instance.room_type > RoomType.Omaha6SixPlusFixedAof && (GameCache.Instance.CurGame as MTTGame).huntMode)
            // {
            //     mSeat.UpdateHunterAward();
            // }
            let PlayRecyclingWinChipAnimation_Tween: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function }
                = mSeat.PlayRecyclingWinChipAnimation(this.game.uirc.node.convertToWorldSpaceAR(this.game.uirc.textAlreadAnte.node.position));

            if (PlayRecyclingWinChipAnimation_Tween) {

                tween.then(cc.callFunc(() => {
                    PlayRecyclingWinChipAnimation_Tween.IsPlaying = true;
                    PlayRecyclingWinChipAnimation_Tween.tween.start();
                }));

                if (i == n - 1) {
                    let duration: number = (PlayRecyclingWinChipAnimation_Tween as any).duration;
                    if (duration) {
                        tween.delay(duration);
                    }
                }
            }
        }

        tween.start();

        let mCacheWinnerSeatIds: number[] = null; // 赢家座位
        let mCacheWinnerCardTypes: number[] = null; // 赢家牌型

        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {
            let result = this.game.MessageWinnerData.resultsList[i];
            // 找到赢家
            if (result.win > 0) {
                if (null == mCacheWinnerSeatIds)
                    mCacheWinnerSeatIds = [];
                mCacheWinnerSeatIds.push(this.game.GetLocalSeatID(result.seatId));
                if (null == mCacheWinnerCardTypes)
                    mCacheWinnerCardTypes = [];
                mCacheWinnerCardTypes.push(result.handValueType);
            }
        }

        let mTmpCardSorts = [];

        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {
            let mTmpCards = [];
            for (let j = 0, m = this.game.MessageWinnerData.resultsList[i].winCardsList.length; j < m; j++) {
                mTmpCards.push(this.game.MessageWinnerData.resultsList[i].winCardsList[j].card);
            }
            mTmpCardSorts.push(mTmpCards);
        }

        let mHaveCardSort = true;

        if (mHaveCardSort && null != mCacheWinnerSeatIds && mCacheWinnerSeatIds.length != 0) {

            for (let i = 0; i < mCacheWinnerSeatIds.length; i++) {
                mSeatId = mCacheWinnerSeatIds[i];

                mSeat = this.game.GetSeatByLocalSeatID(mSeatId);

                if (null == mSeat || null == mSeat.Player)
                    continue;

                if (mTmpCardSorts.length > i) {
                    if (mSeat.Player.userID != GameCache.Instance.CurGame.mainPlayer.userID) {
                        mSeat.UpdateCardType(mSeat.Player.cardType, mTmpCardSorts[i], true);
                    }

                }

            }
        }

        if (mCanPlayEndPublicCardsAnimation) {
            this.game.PlayEndPublicCardsAnimation(this.game.MessageWinnerData);
        }
        for (let i = 0, n = this.game.MessageWinnerData.resultsList.length; i < n; i++) {
            mSeat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(this.game.MessageWinnerData.resultsList[i].seatId));

            if (null != mSeat && null != mSeat.Player && mSeat.Player.actionStatus == Def.Action.NONE) {
                cc.log("not is Participate In The Game");
                continue;
            }

            if (null == mSeat || null == mSeat.Player)
                continue;

            mSeat.Player.chips = this.game.MessageWinnerData.resultsList[i].chip;
            mSeat.UpdateCoin();
        }
    }




    /// <summary>
    /// 公共牌
    /// </summary>
    /// <param name="source"></param>
    public HandleGetPublicCards(source: ServerMessagePublicCards.AsObject): void {
        //UIComponent.Instance.HideUI(UIType.UIInsurance);
        //UIComponent.Instance.Remove(UIType.UIAgreeSecondPcs);
        this.game.autoCall = false;
        this.game.autoAllin = false;
        this.game.autoCheck = false;
        this.game.autoFold = false;
        let iCount: number = this.game.GetCurPublicCardsCount();  // 要在更新公共牌前拿数量

        console.log("HandleGetPublicCards : ", this.game.GameState, iCount);
        console.log("this.game.cards>>>>>", this.game.cards);

        if (this.game.GameState == TexasGameState.HandFlop && iCount == 0) {
            this.game.AddPublicCards(source.publicCardsArrayList);
        }
        else if (this.game.GameState == TexasGameState.HandTurn && iCount == 3) {
            this.game.AddPublicCards(source.publicCardsArrayList);
        }
        else if (this.game.GameState == TexasGameState.HandRiver && iCount == 4) {
            this.game.AddPublicCards(source.publicCardsArrayList);
        }
        else {
            cc.warn("public card error：" + this.game.GameState + " Cur Public Cards Count :" + iCount);
        }

        let lastPubicCard: number = source.publicCardsArrayList[source.publicCardsArrayList.length - 1];
        this.game.IsSecondPsc = source.extPublicCardsArrayList != null && source.extPublicCardsArrayList.length > 0;
        let bust: boolean = false;
        let mRoomType: RoomType = GameCache.Instance.room_type;
        if (this.game.cacheTrunOutsCards != null) {

            this.game.cacheTrunOutsCards.forEach((value, key) => {
                if (value.includes(lastPubicCard)) {
                    bust = true;
                }
                if (this.game.GetLocalSeatID(key) == this.game.mainPlayer.seatID && value.includes(lastPubicCard) && this.game.cacheBuyActiveAmount > 0) {
                    //this.ShowInsuranceTipJieSuan(GameUtil.GetOddsByPlayerNum(cacheBuyInsurancePotUserCount, item.Value.length) * cacheBuyActiveAmount);
                }
            })
        }
        if (bust) {
            //爆牌动画
            //this.ShowBustCardAnimation();
        }
        this.game.ClearSeatBubble(false);
        let mCacheSeat: Seat = null;
        for (let i = 0, n = this.game.listSeat.length; i < n; i++) {
            mCacheSeat = this.game.listSeat[i];
            if (null == mCacheSeat || null == mCacheSeat.Player || !mCacheSeat.Player.isPlaying)
                continue;

            mCacheSeat.Player.anteNumber = 0;
            mCacheSeat.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
        }
        let opSeatID: number = -1;
        if (source.nextOperator != null) {
            opSeatID = this.game.GetLocalSeatID(source.nextOperator.seatId);
        }

        //TweenCallback mTweenCallback = () => {
        let mTweenCallback = () => {

            let mSeat: Seat = this.game.GetSeatByLocalSeatID(opSeatID);
            if (null == mSeat)
                return;

            if (mSeat.seatID == this.game.mainPlayer.seatID && mSeat.Player.userID == this.game.mainPlayer.userID && mSeat.Player.isPlaying) {
                // 到自己操作
                this.game.HideAutoOperationPanel();

                // 非托管
                if (!this.game.mainPlayer.IsAutoOp) {
                    this.game.ShowOperationPanel(UIOperationComponent.OperationData(source.nextOperator.actionsList, source.nextOperator.shortcutsList));
                }
            }
            else {
                // 下一个操作不是自己
                this.game.HideOperationPanel();
                // 非弃牌、非ALL IN、非空闲等待下一局、非托管
                if (this.game.mainPlayer.isPlaying && !this.game.mainPlayer.IsAutoOp) {
                    // 预操作UI
                    UIComponent.Instance.ShowUI(PrefabUI.UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(0)));
                }
                else {
                    // 无预操作UI
                    this.game.HideAutoOperationPanel();
                }

            }
            mSeat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
        };

        //TweenCallback SecondTweenCallback = () => {
        let SecondTweenCallback = () => {
            if (source.extPublicCardsArrayList != null && source.extPublicCardsArrayList.length > 0) {

                this.game.AddSecondPublicCards(source.extPublicCardsArrayList);
                //执行第二套牌动画
                this.game.UpdateSecondPublicCards(iCount, source.extPublicCardsArrayList.length, null);

            }
            else {
                this.game.IsSecondPsc = false;
            }
        };
        this.game.stopUpdatePublicCardsAnimation = false;

        console.log("当前开始翻牌:", iCount);

        if (iCount == 0) {

            this.game.PlayFirstRecyclingChipAnimation(() => {

                this.game.PlayFirstRecyclingChipSubAnimation(() => {
                    this.game.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                    if (this.game.stopUpdatePublicCardsAnimation && null != this.game.sequenceUpdatePublicCards) {
                        this.game.sequenceUpdatePublicCards.Complete(true);
                    }

                    this.game.stopUpdatePublicCardsAnimation = false;
                });
                if (this.game.stopUpdatePublicCardsAnimation && null != this.game.sequencePlayFirstRecyclingChipSubAnimation &&
                    this.game.sequencePlayFirstRecyclingChipSubAnimation.IsPlaying) {
                    this.game.sequencePlayFirstRecyclingChipSubAnimation.complete(true);
                }
            });
        }
        else {
            if (this.game.isAllinGetPlayerCards && this.game.insurance) {
                // 保险就是多事，特殊处理一下。来了三张公共牌，动画播放中，没有保险可买，马上又来了一张公共牌。
                this.game.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                if (this.game.stopUpdatePublicCardsAnimation && null != this.game.sequenceUpdatePublicCards && this.game.sequenceUpdatePublicCards.IsPlaying) {
                    this.game.sequenceUpdatePublicCards.Complete(true);
                }

                this.game.stopUpdatePublicCardsAnimation = false;
            }
            else {
                this.game.PlayRecyclingChipAnimation(() => {
                    this.game.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                    if (this.game.stopUpdatePublicCardsAnimation && null != this.game.sequenceUpdatePublicCards && this.game.sequenceUpdatePublicCards.IsPlaying) {
                        this.game.sequenceUpdatePublicCards.Complete();
                    }
                    this.game.stopUpdatePublicCardsAnimation = false;
                });
            }
        }
    }






    /// <summary>
    /// 本手结算
    /// </summary>
    /// <param name="MessageWinnerData"></param>
    /// <param name="obj"></param>
    public handleWinnerInfoCommon(rec: ServerMessageWinner.AsObject, obj: any): void {
        this.game.autoFold = false;
        this.game.autoCall = false;
        this.game.autoAllin = false;
        this.game.autoCheck = false;

        //GameendDelayClear();
        this.game.gamestatus = -1;
        this.game.cacheRound = rec.round;
        GameCache.Instance.GameStatus = this.game.gamestatus;

        UIComponent.Instance.HideUI(PrefabUI.UIAutoOperationComponent);
        UIComponent.Instance.HideUI(PrefabUI.UIOperationComponent);

        let mSeat: Seat = null;
        for (let i = 0, n = rec.resultsList.length; i < n; i++) {
            mSeat = this.game.listSeat[this.game.GetLocalSeatID(rec.resultsList[i].seatId)];
            if (null == mSeat || null == mSeat.Player)
                continue;

            if (mSeat.IsMySeat) {
                if (!rec.resultsList[i].standUp) {
                    this.game.ShowSeeMorePublic();
                }
            }
        }
        this.game.ClearSeatBubble(true);
        this.game.SetPublicCardInfosId();
        this.game.MessageWinnerData = rec;

        if (this.game.IsSecondPsc) {
            cc.log("is second public cards ");
            this.HandleMessageSecondPcsWinnerData();
        }
        else {
            this.HandleMessageWinnerData();
        }
    }

    /// <summary>
    /// 结束后主动亮底牌操作
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_SHOWDOWN(rec: ServerMessageShowdown.AsObject): void {
        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_SHOWDOWN, rec.Status)
            return;
        }

        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat)
            return;
        mSeat.UpdateShowCardsId();
    }

    /// <summary>
    /// 本手结束清理桌面
    /// </summary>
    /// <param name="source"></param>
    public HandleRoundFinish(source: ServerMessageHandClear.AsObject): void {
        this.game.gamestatus = -1;
        GameCache.Instance.GameStatus = this.game.gamestatus;
        //每手清理缓存购买池子人数
        this.game.cacheBuyInsurancePotUserCount = 0;
        this.game.IsSecondPsc = false;
        this.game.HideSeeMorePublic();
        this.game.HideSeeMorePublicTips();

        this.game.HideWaitBlindBtn();
        this.game.HideOperationPanel();
        //防止大牌动画未消失
        if (this.game.isPlayingBigWinAnimation) {
            //UIComponent.Instance.HideUI(UIType.UIBigWinAnimation);
        }

        // 刷新底池
        this.game.alreadAnte = 0;
        this.game.UpdateAlreadAnte();
        // 刷新分池
        this.game.pots = [];
        this.game.UpdatePots();

        // 刷新公共牌
        this.game.ResetPublicCardsId();
        this.game.ResetPublicCardsImage();

        //刷新第二套公共牌
        this.game.ResetSecondPublicCardsId();
        this.game.ResetSecondPublicCardsImage();

        if (null != this.game.cacheTrunOutsCards) {
            this.game.cacheTrunOutsCards.clear();
            this.game.cacheTrunOutsCards = null;
        }
        let mSeat: Seat = null;
        for (let i = 0, n = this.game.listSeat.length; i < n; i++) {
            mSeat = this.game.listSeat[i];
            if (mSeat != null && null == mSeat.Player) {
                mSeat.SeatFSM.EmptyEnter();
            }
            if (null == mSeat || null == mSeat.Player)
                continue;

            mSeat.Player.actionStatus = Def.Action.NONE;
            mSeat.FsmLogicComponent.SM.ChangeState(SeatRoundEnd.Instance);
            if (mSeat.Player.canPlayStatus == Def.CanPlayStatus.KEEP_SEAT) {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatKeep.Instance);
            }
            else {
                mSeat.Player.canPlayStatus = Def.CanPlayStatus.DISABLE;
            }
        }

        this.game.ResetSeatPlayRecord();

    }
    ProtocolHoldemGetMsgHandler(Protocol_Holdem_GetMsg: ProtocolCode, ProtocolHoldemGetMsgHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    ProtocolHoldemBroadcastMsgHandler(Protocol_Holdem_BroadcastMsg: ProtocolCode, ProtocolHoldemBroadcastMsgHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }

    /// <summary>
    /// 所有玩家筹码变动
    /// </summary>
    /// <param name="response"></param>
    HANDLER_REQ_GAME_CHANGE_CHIPS(rec: ServerMessageChipsChange.AsObject) {

        if (rec == null) {
            return;
        }
        rec.changesList.forEach((playerChipChange: PlayerChipChange.AsObject) => {
            let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(playerChipChange.seatId));
            if (null == mSeat) return;
            mSeat.Player.chips = playerChipChange.chips;
            mSeat.Player.MttHunterKillAwardOtherPlus += playerChipChange.mttHunterHeadPlus;
            if (this.game.mainPlayer.seatID == this.game.GetLocalSeatID(playerChipChange.seatId)) {
                if (playerChipChange.reason == Def.ChipChangeReason.CC_MTT_ADD_ON || playerChipChange.reason == Def.ChipChangeReason.CC_MTT_ADD_ON_PLUS_MODE1 || playerChipChange.reason == Def.ChipChangeReason.CC_MTT_ADD_ON_PLUS_MODE2) {
                    UIComponent.Instance.Toast(StringHelper.Format(i18nMgr.Get("Addondz"), StringHelper.GetSignedLongString(playerChipChange.change)));
                }
                UIComponent.Instance.HideUI(PrefabUI.UIOutChipsComponent);
                this.game.mainPlayer.cacheStoreChips = playerChipChange.storeChips;
            }
            mSeat.FsmLogicComponent.SM.ChangeState(SeatAddChips.Instance);
        })

    }
    /// <summary>
    /// 带出
    /// </summary>
    /// <param name="response"></param>
    HANDLER_REQ_GAME_OUT_CHIPS(rec: ServerMessageStoreChips.AsObject) {

        if (rec == null) {
            return;
        }
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            return;
        }
        // UIComponent.Instance.Show(UIType.UIOutChipsTip,
        //     new UIOutChipsTipComponent.OutClipstipData()
        //                   {

        //         state = rec.Status,

        //         tableChips = (int)cacheOutChips,
        //     });
        this.game.cacheOutChips = 0;
        UIComponent.Instance.HideUI(PrefabUI.UIOutChipsComponent);
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat) return;
        mSeat.Player.chips = rec.chips;
        mSeat.FsmLogicComponent.SM.ChangeState(SeatAddChips.Instance);
    }
    /// <summary>
    /// 带入
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_ADD_CHIPS(rec: ServerMessageBringIn.AsObject) {

        if (rec == null) {
            return;
        }

        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));//CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_GAME_ADD_CHIPS, rec.Status)
            return;
        }
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat) {

            return;
        }
        mSeat.Player.chips = rec.chips;
        UIComponent.Instance.HideUI(PrefabUI.UIAddChipsComponent);
        mSeat.FsmLogicComponent.SM.ChangeState(SeatAddChips.Instance);
        mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
    }

    HANDLER_REQ_WAIT_BLIND(Protocol_Holdem_AgreePost: ProtocolCode, HANDLER_REQ_WAIT_BLIND: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_BUY_INSURANCE(Protocol_Holdem_BuyInsuranceActive: ProtocolCode, HANDLER_REQ_BUY_INSURANCE: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_CLAIM_INSURANCE(Protocol_Holdem_BuyInsurance: ProtocolCode, HANDLER_REQ_CLAIM_INSURANCE: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_INSURANCE_TRIGGED(Protocol_Holdem_InsuranceTrigged: ProtocolCode, HANDLER_REQ_INSURANCE_TRIGGED: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_AgreeSecondPcsHandler(Protocol_Holdem_AgreeSecondPcs: ProtocolCode, Protocol_Holdem_AgreeSecondPcsHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_AgreeSecondPcsTriggedHandler(Protocol_Holdem_AgreeSecondPcsTrigged: ProtocolCode, Protocol_Holdem_AgreeSecondPcsTriggedHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    ProtocolHoldemAgreeSecondPcsActiveHandler(Protocol_Holdem_AgreeSecondPcsActive: ProtocolCode, ProtocolHoldemAgreeSecondPcsActiveHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
}
