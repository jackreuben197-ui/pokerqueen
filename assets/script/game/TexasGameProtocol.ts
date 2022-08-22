import Dispatcher from "../event/Dispatcher";
import { LanguageCode } from "../i18n/LanguageCode";
import GameCache from "../manager/GameCache";
import ToastManager from "../manager/ToastManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessagePostStatusChange } from "../protobuf/holdem/recv_post_status_change_pb";
import { ServerMessageSeatedOthers } from "../protobuf/holdem/recv_seated_others_pb";
import { ServerMessageStartInfo } from "../protobuf/holdem/recv_start_info_pb";
import { ServerMessageSeated } from "../protobuf/holdem/req_seated_pb";
import { CPlayer } from "./CPlayer";
import Seat from "./Seat";
import { SeatSitAnimation, SeatStart, SeatStraddle, SeatWaitBlind, SeatWaitStart } from "./SeatStateHandler";
import TexasGame from "./TexasGame";

const CanPlayStatus = Def.CanPlayStatus;

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
        Dispatcher.on(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this);  // 补盲状态变化
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
        Dispatcher.off(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this);  // 别人坐下
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
        Dispatcher.off(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this);  // 补盲状态变化
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
        this.game.gameUI.imageWaitForStartTips.active = false;
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
            //this.game.smallIndex = this.game.GetSmallSeatIdByPlayingSeatIds(SeverSeatIds,this.game.bigIndex);
        }
        if (this.game.bigIndex >= 0) {
            //SoundComponent.Instance.PlaySFX(SoundComponent.SFX_DESK_BET_SECOND);
        }
        // 发牌动画
    //     this.game.PlayDealAnimation(() => {
    //         UpdateAlreadAnte();
    //             Seat mSeat0 = null;
    //         for (int i = 0, n = responseData.Players.Count; i < n; i++)
    //     {
    //         mSeat0 = listSeat[GetLocalSeatID(responseData.Players[i].SeatId)];

    //         if (null == mSeat0 || null == mSeat0.Player) {
    //             continue;
    //         }

    //         mSeat0.FsmLogicComponent.SM.ChangeState(SeatStartToPlaying<Entity>.Instance);

    //         if (operationID == mSeat0.seatID) {
    //             mSeat0.FsmLogicComponent.SM.ChangeState(SeatOperation<Entity>.Instance);
    //         }
    //         else {
    //             mSeat0.FsmLogicComponent.SM.ChangeState(SeatWaitOther<Entity>.Instance);
    //         }
    //     }

    //     mSeat0 = GetSeatByLocalSeatID(operationID);
    //             Seat mMySeat = GetSeatByLocalSeatID(mainPlayer.seatID);

    //     if (null != mMySeat && mMySeat.seatID == mSeat0.seatID && mMySeat.Player.userID == mSeat0.Player.userID) {

    //         // 到自己操作
    //         HideAutoOperationPanel();
    //         if (mMySeat.Player.isParticipateInTheGame && !mMySeat.Player.IsAutoOp) {
    //             ShowOperationPanel(new UIOperationComponent.OperationData()
    //                     {
    //                     actionLimits = responseData.NextOperator.Actions,
    //                     Shortcuts = responseData.NextOperator.Shortcuts
    //                 });
    //         }
    //     }
    //     else {
    //         // 其他人操作
    //         HideOperationPanel();
    //         if (null != mMySeat && mMySeat.Player.isParticipateInTheGame) {
    //             // 自己参与游戏
    //             // 非弃牌 && 非ALLIN && 非托管
    //             if (mMySeat.Player.actionStatus != Def.Types.Action.Fold && mMySeat.Player.actionStatus != Def.Types.Action.Allin && mMySeat.Player.actionStatus != Def.Types.Action.None && !mMySeat.Player.IsAutoOp) {
    //                 UIComponent.Instance.ShowNoAnimation(UIType.UIAutoOperation, new UIAutoOperationComponent.AutoOperationData()
    //                         {
    //                         callAmount = getAutoOperationCallAmount(responseData.HandInfo.RoundBet)
    //                     });
    //             }
    //             else {
    //                 HideAutoOperationPanel();
    //             }
    //         }
    //         else {
    //             // 观众
    //             HideAutoOperationPanel();
    //         }
    //     }
    // });


}




}
