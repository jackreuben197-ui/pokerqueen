
import { ITweenDuration } from "../define/EIDefine";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { CPErrorCode } from "../i18n/CPErrorCode";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def, Result } from "../protobuf/holdem/define_pb";
import { ServerMessageActionAll } from "../protobuf/holdem/recv_action_all_pb";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSidePots } from "../protobuf/holdem/recv_side_pots_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageWinner } from "../protobuf/holdem/recv_winner_pb";
import { ServerMessageAction } from "../protobuf/holdem/req_action_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import UIComponent from "../ui/UIComponent";
import { CardType } from "./CardTypeUtil";
import { CPlayer } from "./CPlayer";
import { GameCache } from "./GameCache";
import { RoomType } from "./GameUtil";
import Seat from "./Seat";
import { SeatAllin, SeatCall, SeatCheck, SeatFold, SeatOperation, SeatPutChip, SeatRaise, SeatSitAnimation, SeatStart, SeatStartToPlaying, SeatStraddle, SeatWaitBlind, SeatWaitOther, SeatWaitStart } from "./SeatStateHandler";
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

        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this);//自己坐下
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this);  // 别人坐下
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Action, this.HANDLER_REQ_GAME_SEND_ACTION, this);  // 自己牌桌操作
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ActionAll, this.HANDLER_REQ_GAME_RECV_ACTION, this);  // 收到牌桌操作
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showcards, this.HANDLER_REQ_GAME_PLAYER_CARDS, this);  // Allin下发玩家手牌
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_Showdown, this.HANDLER_REQ_SHOWDOWN, this);  // 设置结束时亮的手牌
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME, this);  // 操作加时
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.HANDLER_REQ_ADD_TIME_OTHERS, this);  // 其他人操作加时
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION, this);  // 查看未发公共牌  
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER, this);  // 查看未发公共牌  
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SidePots, this.HANDLER_REQ_SHOW_SIDE_POTS, this);  // 显示分池筹码
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.HANDLER_REQ_INSURANCE_TRIGGED, this);  // 保险触发
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, this.HANDLER_REQ_CLAIM_INSURANCE, this);  // 保险赔付消息
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.HANDLER_REQ_BUY_INSURANCE, this);  // 购买保险
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeat, this.HANDLER_REQ_GAME_KEEP_SEAT);  // 留座离桌
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.HANDLER_REQ_GAME_MY_KEEP_SEAT, this);  // 自己留座离桌
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreePost, this.HANDLER_REQ_WAIT_BLIND, this);  // 过庄补盲
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this);  // 补盲状态变化
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BringIn, this.HANDLER_REQ_GAME_ADD_CHIPS, this);  // 带入
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_StoreChips, this.HANDLER_REQ_GAME_OUT_CHIPS, this);  // 带出
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_ChipsChange, this.HANDLER_REQ_GAME_CHANGE_CHIPS, this);  // 玩家牌桌记分牌变化
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_BroadcastMsg, this.ProtocolHoldemBroadcastMsgHandler, this);  // 发送表情成功失败返回
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this);  // 广播表情
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.ProtocolHoldemSetAutoOnTableHandler, this);  // 设置每手自动上桌筹码
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, this.ProtocolHoldemAgreeSecondPcsActiveHandler, this);  // 当前玩家同意拒绝第二张牌结果（不处理）
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, this.Protocol_Holdem_AgreeSecondPcsTriggedHandler, this);//触发 是否允许第二套牌
        CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, this.Protocol_Holdem_AgreeSecondPcsHandler, this); //玩家同意拒绝第二套牌结果
    }
    public RemoveMsgHandler(): void {
        console.log(`TexasGame : RemoveMsgHandler`);
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this);//自己坐下
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this);  // 别人坐下
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Action, this.HANDLER_REQ_GAME_SEND_ACTION, this);  // 自己牌桌操作
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ActionAll, this.HANDLER_REQ_GAME_RECV_ACTION, this);  // 收到牌桌操作
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showcards, this.HANDLER_REQ_GAME_PLAYER_CARDS, this);  // Allin下发玩家手牌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Showdown, this.HANDLER_REQ_SHOWDOWN, this);  // 设置结束时亮的手牌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME, this);  // 操作加时
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.HANDLER_REQ_ADD_TIME_OTHERS, this);  // 其他人操作加时
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION, this);  // 查看未发公共牌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER, this);  // 查看未发公共牌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SidePots, this.HANDLER_REQ_SHOW_SIDE_POTS, this);  // 显示分池筹码
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.HANDLER_REQ_INSURANCE_TRIGGED, this);  // 保险触发
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsurance, this.HANDLER_REQ_CLAIM_INSURANCE, this);  // 保险赔付消息
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.HANDLER_REQ_BUY_INSURANCE, this);  // 购买保险
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeat, this.HANDLER_REQ_GAME_KEEP_SEAT, this);  // 留座离桌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.HANDLER_REQ_GAME_MY_KEEP_SEAT, this);  // 自己留座离桌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreePost, this.HANDLER_REQ_WAIT_BLIND, this);  // 过庄补盲
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this);  // 补盲状态变化
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BringIn, this.HANDLER_REQ_GAME_ADD_CHIPS, this);  // 带入
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_StoreChips, this.HANDLER_REQ_GAME_OUT_CHIPS, this);  // 带出
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_ChipsChange, this.HANDLER_REQ_GAME_CHANGE_CHIPS, this);  // 玩家牌桌记分牌变化
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_BroadcastMsg, this.ProtocolHoldemBroadcastMsgHandler, this);  // 发送表情
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this);  // 广播表情
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.ProtocolHoldemSetAutoOnTableHandler, this);  // 设置每手自动上桌筹码
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, this.ProtocolHoldemAgreeSecondPcsActiveHandler, this);  // 同意拒绝第二张牌结果
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, this.Protocol_Holdem_AgreeSecondPcsTriggedHandler, this);//触发 是否允许第二套牌
        CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, this.Protocol_Holdem_AgreeSecondPcsHandler, this); //玩家同意拒绝第二套牌结果
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
        GameCache.Instance.gold = rec.accountChips;
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
        //this.game.ResetPublicCardsId();
        //this.game.ClearPublicCardsUI();
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
        // 发牌动画和结束响应
        this.game.PlayDealAnimation(() => {
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

                        this.game.ShowUI(this.game.uirc.UIAutoOperation, UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(responseData.handInfo.roundBet)));
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




    Protocol_Holdem_AgreeSecondPcsHandler(Protocol_Holdem_AgreeSecondPcs: ProtocolCode, Protocol_Holdem_AgreeSecondPcsHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    Protocol_Holdem_AgreeSecondPcsTriggedHandler(Protocol_Holdem_AgreeSecondPcsTrigged: ProtocolCode, Protocol_Holdem_AgreeSecondPcsTriggedHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    ProtocolHoldemAgreeSecondPcsActiveHandler(Protocol_Holdem_AgreeSecondPcsActive: ProtocolCode, ProtocolHoldemAgreeSecondPcsActiveHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    ProtocolHoldemSetAutoOnTableHandler(Protocol_Holdem_SetAutoOnTable: ProtocolCode, ProtocolHoldemSetAutoOnTableHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    ProtocolHoldemGetMsgHandler(Protocol_Holdem_GetMsg: ProtocolCode, ProtocolHoldemGetMsgHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    ProtocolHoldemBroadcastMsgHandler(Protocol_Holdem_BroadcastMsg: ProtocolCode, ProtocolHoldemBroadcastMsgHandler: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_GAME_CHANGE_CHIPS(Protocol_Holdem_ChipsChange: ProtocolCode, HANDLER_REQ_GAME_CHANGE_CHIPS: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_GAME_OUT_CHIPS(Protocol_Holdem_StoreChips: ProtocolCode, HANDLER_REQ_GAME_OUT_CHIPS: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_GAME_ADD_CHIPS(Protocol_Holdem_BringIn: ProtocolCode, HANDLER_REQ_GAME_ADD_CHIPS: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_WAIT_BLIND(Protocol_Holdem_AgreePost: ProtocolCode, HANDLER_REQ_WAIT_BLIND: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_GAME_MY_KEEP_SEAT(Protocol_Holdem_KeepSeatActive: ProtocolCode, HANDLER_REQ_GAME_MY_KEEP_SEAT: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_GAME_KEEP_SEAT(Protocol_Holdem_KeepSeat: ProtocolCode, HANDLER_REQ_GAME_KEEP_SEAT: any) {
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
    HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER(Protocol_Holdem_ShowPublicCardsOthers: ProtocolCode, HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_SEE_MORE_PUBLIC_ACTION(Protocol_Holdem_ShowPublicCards: ProtocolCode, HANDLER_REQ_SEE_MORE_PUBLIC_ACTION: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_ADD_TIME_OTHERS(Protocol_Holdem_AddTimeOthers: ProtocolCode, HANDLER_REQ_ADD_TIME_OTHERS: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_ADD_TIME(Protocol_Holdem_AddTime: ProtocolCode, HANDLER_REQ_ADD_TIME: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_SHOWDOWN(Protocol_Holdem_Showdown: ProtocolCode, HANDLER_REQ_SHOWDOWN: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    HANDLER_REQ_GAME_PLAYER_CARDS(Protocol_Holdem_Showcards: ProtocolCode, HANDLER_REQ_GAME_PLAYER_CARDS: any, arg2: this) {
        throw new Error("Method not implemented.");
    }
    // HANDLER_REQ_GAME_RECV_ACTION(Protocol_Holdem_ActionAll: ProtocolCode, HANDLER_REQ_GAME_RECV_ACTION: any, arg2: this) {
    //     throw new Error("Method not implemented.");
    // }


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

                        this.game.ShowUI(this.game.uirc.UIAutoOperation, UIAutoOperationComponent, UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(rec.roundBet)));

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
            //UIComponent.Instance.HideNoAnimation(UIType.UIAutoOperation);
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
        //await (1.5);
        //Game.Scene.ModelScene.GetComponent<TimerComponent>().WaitAsync(1500);
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
        // this.game.TexasGameUtils.SetWinnerCardsHight(listCards, cards);
        // //第一套牌
        // SetSecondPublicCardImageColor(Color.grey);
        // HandleTwoWinnerAnimation(true);
        // await Game.Scene.ModelScene.GetComponent<TimerComponent>().WaitAsync(3000);

        // //等待3秒，处理第二套牌动画

        // SetSecondPublicCardImageColor(Color.white);
        // SetPublicCardsImageColor(Color.grey);
        // SetWinnerCardsHight(listSecondCards, secondCards);
        // HandleTwoWinnerAnimation(false);
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
            let PlayRecyclingWinChipAnimation_Tween: cc.Tween = mSeat.PlayRecyclingWinChipAnimation(this.game.uirc.node.convertToWorldSpaceAR(this.game.uirc.textAlreadAnte.node.position));

            tween.then(cc.callFunc(() => {
                PlayRecyclingWinChipAnimation_Tween.start();
            }));

            if (i == n - 1) {
                let duration: number = (PlayRecyclingWinChipAnimation_Tween as any).duration;
                if (duration) {
                    tween.delay(duration);
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

        this.game.HideUI(this.game.uirc.UIAutoOperation);
        this.game.HideUI(this.game.uirc.UIOperation);

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



}
