
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import { LanguageCode } from "../i18n/LanguageCode";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessageActionAll } from "../protobuf/holdem/recv_action_all_pb";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessagePublicCards } from "../protobuf/holdem/recv_public_cards_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageSidePots } from "../protobuf/holdem/recv_side_pots_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageAction } from "../protobuf/holdem/req_action_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import UIComponent from "../ui/UIComponent";
import { CPlayer } from "./CPlayer";
import { GameCache } from "./GameCache";
import Seat from "./Seat";
import { SeatAllin, SeatCall, SeatCheck, SeatFold, SeatOperation, SeatPutChip, SeatRaise, SeatSitAnimation, SeatStart, SeatStartToPlaying, SeatStraddle, SeatWaitBlind, SeatWaitOther, SeatWaitStart } from "./SeatStateHandler";
import TexasGame from "./TexasGame";
import { TexasGameState } from "./TexasGameState";
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
            ToastManager.Instance.createToast(LanguageCode.ServerErrorDescription(rec.status));
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
                    this.game.ShowOperationPanel(UIOperationComponent.GetOperationData(responseData.nextOperator.actionsList, responseData.nextOperator.shortcutsList));
                }
            }
            else {
                // 其他人操作
                this.game.HideOperationPanel();
                if (null != mMySeat && mMySeat.Player.isParticipateInTheGame) {
                    // 自己参与游戏
                    // 非弃牌 && 非ALLIN && 非托管
                    if (mMySeat.Player.actionStatus != Def.Action.FOLD && mMySeat.Player.actionStatus != Def.Action.ALLIN && mMySeat.Player.actionStatus != Def.Action.NONE && !mMySeat.Player.IsAutoOp) {
                        // UIComponent.Instance.ShowNoAnimation(UIType.UIAutoOperation, new UIAutoOperationComponent.AutoOperationData()
                        //         {
                        //         callAmount = getAutoOperationCallAmount(responseData.HandInfo.RoundBet)
                        //     });
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
                        this.game.ShowOperationPanel(UIOperationComponent.GetOperationData(rec.nextOperator.actionsList, rec.nextOperator.shortcutsList));

                    }
                }
                else {
                    this.game.ShowOperationPanel(UIOperationComponent.GetOperationData(rec.nextOperator.actionsList, rec.nextOperator.shortcutsList));
                }
            }
            else {
                // 下一个操作不是自己
                this.game.HideOperationPanel();

                if (this.game.mainPlayer.isParticipateInTheGame) {
                    // 自己有参与游戏
                    if ((this.game.mainPlayer.actionStatus != Def.Action.FOLD && this.game.mainPlayer.actionStatus != Def.Action.ALLIN && this.game.mainPlayer.actionStatus != Def.Action.NONE) && !this.game.mainPlayer.IsAutoOp) {
                        // UIComponent.Instance.ShowNoAnimation(UIType.UIAutoOperation, new UIAutoOperationComponent.AutoOperationData()
                        //     {
                        //         callAmount = getAutoOperationCallAmount(rec.RoundBet)
                        //     });
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
            UIComponent.Instance.Toast(LanguageCode.ServerErrorDescription(rec.status));
            return;
        }
        this.game.HideOperationPanel();
    }




}
