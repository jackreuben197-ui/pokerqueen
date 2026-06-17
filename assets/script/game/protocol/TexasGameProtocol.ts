import GGEvent from '../../event/GGEvent';
import GC from '../../frame/GameControl';
import { StringHelper } from '../../helper/StringHelper';
import TimeHelper from '../../helper/TimeHelper';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import { i18nMgr } from '../../i18n/i18nMgr';
import { ProtocolCode } from '../../net/websocket/ProtocolCode';
import { Broadcast, BroadcastCode, BroadcastMsg } from '../../net/websocket/ProtocolHoldemMessages';
import { Def, Operator, PlayerCards, PlayerChipChange, Result } from '../../protobuf/holdem/define_pb';
import { ServerMessageActionAll } from '../../protobuf/holdem/recv_th_action_all_pb';
import ChatManager from '../../crazyPoker/gameplay/common/view/chat/ChatManager';
import { ServerMessageAddTimeOthers } from '../../protobuf/holdem/recv_th_add_time_others_pb';
import { ServerMessageAgreeSecondPcs } from '../../protobuf/holdem/recv_th_agree_second_pcs_pb';
import { ServerMessageAgreeSecondPcsTrigged } from '../../protobuf/holdem/recv_th_agree_second_pcs_trigged_pb';
import { ServerMessageBuyInsurance } from '../../protobuf/holdem/recv_th_buy_insurance_pb';
import { ServerMessageChipsChange } from '../../protobuf/holdem/recv_th_chips_change_pb';
import { ServerMessageGetMsg } from '../../protobuf/holdem/recv_th_get_msg_pb';
import { ServerMessageHandClear } from '../../protobuf/holdem/recv_th_hand_clear_pb';
import { ServerMessageInsuranceTrigged } from '../../protobuf/holdem/recv_th_insurance_trigged_pb';
import { ServerMessageKeepSeat } from '../../protobuf/holdem/recv_th_keep_seat_pb';
import { ServerMessagePostStatusChange } from '../../protobuf/holdem/recv_th_post_status_change_pb';
import { ServerMessagePublicCards } from '../../protobuf/holdem/recv_th_public_cards_pb';
import { ServerMessageRoomUserSendDiamond } from '../../protobuf/holdem/recv_g_room_user_send_diamond_pb';
import { ServerMessageShowViewCards } from '../../protobuf/holdem/recv_th_show_view_cards_pb';
import { ServerMessageUserGameWatch } from '../../protobuf/holdem/recv_g_user_game_watch_pb';
import { ServerMessageNextChange } from '../../protobuf/holdem/recv_th_next_change_pb';
import { ServerMessageSeatedOthers } from '../../protobuf/holdem/recv_th_seated_others_pb';
import { ServerMessageShowcards } from '../../protobuf/holdem/recv_th_showcards_pb';
import { ServerMessageShowPublicCardsOthers } from '../../protobuf/holdem/recv_th_show_public_cards_others_pb';
import { ServerMessageSidePots } from '../../protobuf/holdem/recv_th_side_pots_pb';
import { ServerMessageSquidIn } from '../../protobuf/holdem/recv_th_squid_in_pb';
import { ServerMessageStartInfo } from '../../protobuf/holdem/recv_th_start_info_pb';
import { ServerMessageWinner } from '../../protobuf/holdem/recv_th_winner_pb';
import { ServerMessageAction } from '../../protobuf/holdem/req_th_action_pb';
import { ServerMessageAddTime } from '../../protobuf/holdem/req_th_add_time_pb';
import { ServerMessageAgreePost } from '../../protobuf/holdem/req_th_agree_post_pb';
import { ServerMessageAgreeSecondPcsActive } from '../../protobuf/holdem/req_th_agree_second_pcs_active_pb';
import { ServerMessageBringIn } from '../../protobuf/holdem/req_th_bring_in_pb';
import { ServerMessageBuyInsuranceActive } from '../../protobuf/holdem/req_th_buy_insurance_active_pb';
import { ServerMessageKeepSeatActive } from '../../protobuf/holdem/req_th_keep_seat_active_pb';
import { ServerMessageSeated } from '../../protobuf/holdem/req_th_seated_pb';
import { ServerMessageSetAutoOnTable } from '../../protobuf/holdem/req_th_set_auto_on_table_pb';
import { ServerMessageShowdown } from '../../protobuf/holdem/req_th_showdown_pb';
import { ServerMessageShowPublicCards } from '../../protobuf/holdem/req_th_show_public_cards_pb';
import { ServerMessageViewPlayerCards } from '../../protobuf/holdem/req_th_view_player_cards_pb';
import { ServerMessageViewPlayerCardsNum } from '../../protobuf/holdem/req_th_view_player_cards_num_pb';
import { ServerMessageSquidInActive } from '../../protobuf/holdem/req_th_squid_in_active_pb';
import { ServerMessageStoreChips } from '../../protobuf/holdem/req_th_store_chips_pb';
import { ServerMessageUtilAntiCheatRoomVideo } from '../../protobuf/holdem/recv_util_anti_cheat_room_video_pb';
import { ServerMessageVideoMaskChange } from '../../protobuf/holdem/recv_th_video_mask_change_pb';
import UIComponent, { PrefabUI } from '../../ui/UIComponent';
import { CardType } from '../CardTypeUtil';
import { CPlayer } from '../CPlayer';
import { GameCache } from '../GameCache';
import { GameplayPlayerInfoCache } from '../GameplayPlayerInfoCache';
import Seat from '../seat/Seat';
import {
    SeatAddChips,
    SeatAllin,
    SeatCall,
    SeatCheck,
    SeatFold,
    SeatInsurance,
    SeatKeep,
    SeatOperation,
    SeatPutChip,
    SeatRaise,
    SeatRoundEnd,
    SeatSitAnimation,
    SeatStart,
    SeatStartToPlaying,
    SeatStraddle,
    SeatWaitBlind,
    SeatWaitOther,
    SeatWaitStart
} from '../SeatStateHandler';
import TexasGame from '../texas/TexasGame';
import { TexasGameState } from '../TexasGameState';
import UIAgreeSecondPcsComponent from '../ui/UIAgreeSecondPcsComponent';
import UIAutoOperationComponent from '../ui/UIAutoOperationComponent';
import UIOutChipsTipComponent from '../ui/UIOutChipsTipComponent';
import GameUtil, { RoomType } from '../util/GameUtil';
import MTTGame from '../texas/MTTGame';
import { InsuranceData, WrapTriggerInsuranceData } from '../new_ui/UIInsuranceNewPanel';
import AgoraManager from '../../net/agora/AgoraManager';
import AgoraVideoRender from '../../net/agora/AgoraVideoRender';
import { VideoModel } from '../../crazyPoker/gameplay/common/constant/VideoModel';
import ToastManager from '../../manager/ToastManager';
import { MicIconState } from '../SeatUIRC';
import { WebUserSetVideoMask } from '../../net/https/web_request/WebRequestUser';
import { WWW } from '../../net/https/WebRequestBase';
import { HttpUserSetVideoMaskProtocol } from '../../crazyPoker/module/message/CPHotfixWebMessage/user/HttpUserSetVideoMaskProtocol';
const LN = '[TexasGameProtocol]';

//const CanPlayStatus = Def.CanPlayStatus;

export default class TexasGameProtocol {
    /** 暂存发送的道具数据，等服务端返回成功后触发本地动画 */
    public pendingPropData: { type: number; user_id: number; target_user_id: number } | null = null;

    constructor(public game: TexasGame) {}

    public RegisterMsgHandler(): void {
        console.log(LN, `RegisterMsgHandler`);
        // 视频频道加入移至 JoinVideoChannelAfterEnterRoom，在进房成功后调用
        GC.notify.register(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this); //自己坐下
        GC.notify.register(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this); // 别人坐下
        GC.notify.register(ProtocolCode.Protocol_Holdem_Action, this.HANDLER_REQ_GAME_SEND_ACTION, this); // 自己牌桌操作
        GC.notify.register(ProtocolCode.Protocol_Holdem_ActionAll, this.HANDLER_REQ_GAME_RECV_ACTION, this); // 收到牌桌操作
        GC.notify.register(ProtocolCode.Protocol_Holdem_Showcards, this.HANDLER_REQ_GAME_PLAYER_CARDS, this); // Allin下发玩家手牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_Showdown, this.HANDLER_REQ_SHOWDOWN, this); // 设置结束时亮的手牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME, this); // 操作加时
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.HANDLER_REQ_ADD_TIME_OTHERS, this); // 其他人操作加时
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION, this); // 查看未发公共牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER, this); // 查看未发公共牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_ViewPlayerCards, this.HANDLER_REQ_VIEW_PLAYER_CARDS, this); // 付费看手牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_ViewPlayerCardsNum, this.HANDLER_REQ_VIEW_PLAYER_CARDS_NUM, this); // 看手牌次数
        GC.notify.register(ProtocolCode.Protocol_Holdem_SidePots, this.HANDLER_REQ_SHOW_SIDE_POTS, this); // 显示分池筹码
        GC.notify.register(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.HANDLER_REQ_INSURANCE_TRIGGED, this); // 保险触发
        GC.notify.register(ProtocolCode.Protocol_Holdem_BuyInsurance, this.HANDLER_REQ_CLAIM_INSURANCE, this); // 保险赔付消息
        GC.notify.register(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.HANDLER_REQ_BUY_INSURANCE, this); // 购买保险
        GC.notify.register(ProtocolCode.Protocol_Holdem_KeepSeat, this.HANDLER_REQ_GAME_KEEP_SEAT, this); // 留座离桌
        GC.notify.register(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.HANDLER_REQ_GAME_MY_KEEP_SEAT, this); // 自己留座离桌
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreePost, this.HANDLER_REQ_WAIT_BLIND, this); // 过庄补盲
        GC.notify.register(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this); // 补盲状态变化
        GC.notify.register(ProtocolCode.Protocol_Holdem_BringIn, this.HANDLER_REQ_GAME_ADD_CHIPS, this); // 带入
        GC.notify.register(ProtocolCode.Protocol_Holdem_StoreChips, this.HANDLER_REQ_GAME_OUT_CHIPS, this); // 带出
        GC.notify.register(ProtocolCode.Protocol_Holdem_ChipsChange, this.HANDLER_REQ_GAME_CHANGE_CHIPS, this); // 玩家牌桌记分牌变化
        GC.notify.register(ProtocolCode.Protocol_Holdem_BroadcastMsg, this.ProtocolHoldemBroadcastMsgHandler, this); // 发送表情成功失败返回
        GC.notify.register(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this); // 广播表情
        GC.notify.register(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.ProtocolHoldemSetAutoOnTableHandler, this); // 设置每手自动上桌筹码
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, this.ProtocolHoldemAgreeSecondPcsActiveHandler, this); // 当前玩家同意拒绝第二张牌结果（不处理）
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, this.Protocol_Holdem_AgreeSecondPcsTriggedHandler, this); //触发 是否允许第二套牌
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, this.Protocol_Holdem_AgreeSecondPcsHandler, this); //玩家同意拒绝第二套牌结果
        GC.notify.register(ProtocolCode.Protocol_Holdem_SquidInActive, this.HANDLER_REQ_SQUID_IN_ACTIVE, this); // 主动加入鱿鱼返回
        GC.notify.register(ProtocolCode.Protocol_Holdem_SquidIn, this.HANDLER_REQ_SQUID_IN, this); // 鱿鱼加入状态广播
        GC.notify.register(ProtocolCode.Protocol_Holdem_NextChange, this.HANDLER_REQ_NEXT_CHANGE, this); // 下一手配置变更
        GC.notify.register(ProtocolCode.Protocol_Holdem_AntiCheatRoomVideo, this.HANDLER_RANDOM_VIDEO_VERIFY, this); // 随机视频验证
        GC.notify.register(ProtocolCode.Protocol_Holdem_VideoMaskChange, this.HANDLER_REQ_VIDEO_MASK_CHANGE, this); // 视频窗花变更
        GC.notify.register(ProtocolCode.Protocol_Holdem_RoomUserSendDiamond, this.ProtocolHoldemRoomUserSendDiamondHandler, this); // 赠送钻石广播
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowViewCards, this.HANDLER_REQ_SHOW_VIEW_CARDS, this); // 偷偷看手牌推送 (1127)
        GC.notify.register(ProtocolCode.Protocol_Holdem_UserGameWatch, this.HANDLER_REQ_USER_GAME_WATCH, this); // 被看牌者通知 (110)
    }

    public RemoveMsgHandler(): void {
        console.log(LN, 'RemoveMsgHandler');
        // 离开房间时退出视频频道
        this.LeaveVideoChannel();
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Seated, this.HANDLER_REQ_GAME_SEND_MY_SEAT, this); //自己坐下
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SeatedOthers, this.HANDLER_REQ_GAME_RECV_SEAT_DOWN, this); // 别人坐下
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Action, this.HANDLER_REQ_GAME_SEND_ACTION, this); // 自己牌桌操作
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ActionAll, this.HANDLER_REQ_GAME_RECV_ACTION, this); // 收到牌桌操作
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Showcards, this.HANDLER_REQ_GAME_PLAYER_CARDS, this); // Allin下发玩家手牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Showdown, this.HANDLER_REQ_SHOWDOWN, this); // 设置结束时亮的手牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTime, this.HANDLER_REQ_ADD_TIME, this); // 操作加时
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.HANDLER_REQ_ADD_TIME_OTHERS, this); // 其他人操作加时
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION, this); // 查看未发公共牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.HANDLER_REQ_SEE_MORE_PUBLIC_ACTION_OTHER, this); // 查看未发公共牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ViewPlayerCards, this.HANDLER_REQ_VIEW_PLAYER_CARDS, this); // 付费看手牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ViewPlayerCardsNum, this.HANDLER_REQ_VIEW_PLAYER_CARDS_NUM, this); // 看手牌次数
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SidePots, this.HANDLER_REQ_SHOW_SIDE_POTS, this); // 显示分池筹码
        GC.notify.remove(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.HANDLER_REQ_INSURANCE_TRIGGED, this); // 保险触发
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BuyInsurance, this.HANDLER_REQ_CLAIM_INSURANCE, this); // 保险赔付消息
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.HANDLER_REQ_BUY_INSURANCE, this); // 购买保险
        GC.notify.remove(ProtocolCode.Protocol_Holdem_KeepSeat, this.HANDLER_REQ_GAME_KEEP_SEAT, this); // 留座离桌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.HANDLER_REQ_GAME_MY_KEEP_SEAT, this); // 自己留座离桌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreePost, this.HANDLER_REQ_WAIT_BLIND, this); // 过庄补盲
        GC.notify.remove(ProtocolCode.Protocol_Holdem_PostStatusChange, this.HANDLER_REQ_WAIT_BLIND_STATE, this); // 补盲状态变化
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BringIn, this.HANDLER_REQ_GAME_ADD_CHIPS, this); // 带入
        GC.notify.remove(ProtocolCode.Protocol_Holdem_StoreChips, this.HANDLER_REQ_GAME_OUT_CHIPS, this); // 带出
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ChipsChange, this.HANDLER_REQ_GAME_CHANGE_CHIPS, this); // 玩家牌桌记分牌变化
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BroadcastMsg, this.ProtocolHoldemBroadcastMsgHandler, this); // 发送表情
        GC.notify.remove(ProtocolCode.Protocol_Holdem_GetMsg, this.ProtocolHoldemGetMsgHandler, this); // 广播表情
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.ProtocolHoldemSetAutoOnTableHandler, this); // 设置每手自动上桌筹码
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreeSecondPcsActive, this.ProtocolHoldemAgreeSecondPcsActiveHandler, this); // 同意拒绝第二张牌结果
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreeSecondPcsTrigged, this.Protocol_Holdem_AgreeSecondPcsTriggedHandler, this); //触发 是否允许第二套牌
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreeSecondPcs, this.Protocol_Holdem_AgreeSecondPcsHandler, this); //玩家同意拒绝第二套牌结果
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SquidInActive, this.HANDLER_REQ_SQUID_IN_ACTIVE, this); // 主动加入鱿鱼返回
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SquidIn, this.HANDLER_REQ_SQUID_IN, this); // 鱿鱼加入状态广播
        GC.notify.remove(ProtocolCode.Protocol_Holdem_NextChange, this.HANDLER_REQ_NEXT_CHANGE, this); // 下一手配置变更
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AntiCheatRoomVideo, this.HANDLER_RANDOM_VIDEO_VERIFY, this); // 随机视频验证
        GC.notify.remove(ProtocolCode.Protocol_Holdem_VideoMaskChange, this.HANDLER_REQ_VIDEO_MASK_CHANGE, this); // 视频窗花变更
        GC.notify.remove(ProtocolCode.Protocol_Holdem_RoomUserSendDiamond, this.ProtocolHoldemRoomUserSendDiamondHandler, this); // 赠送钻石广播
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowViewCards, this.HANDLER_REQ_SHOW_VIEW_CARDS, this); // 偷偷看手牌推送 (1127)
        GC.notify.remove(ProtocolCode.Protocol_Holdem_UserGameWatch, this.HANDLER_REQ_USER_GAME_WATCH, this); // 被看牌者通知 (110)
        // 清理随机验证倒计时
        this._clearRandomVideoTimer();
    }

    /// <summary>
    /// 其他玩家坐下
    /// </summary>
    /// <param name="response"></param>
    protected HANDLER_REQ_GAME_RECV_SEAT_DOWN(rec: ServerMessageSeatedOthers.AsObject) {
        if (rec == null) return;
        console.log('[VideoMask] 别人坐下, videoMaskId:', rec.videoMaskId, 'userRid:', rec.userRid);
        // videoMaskId > 4 时客户端统一归为 1
        if (rec.videoMaskId > 4) rec.videoMaskId = 1;
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
        mPlayer.isVip = rec.vip;
        mPlayer.KeepSeatLeftTime = rec.keepSeatLeftTime;
        mPlayer.inSquid = rec.squidIn || false;
        mPlayer.squidRoundSeated = mPlayer.inSquid;
        mPlayer.squidCount = 0;
        mPlayer.squidEscaped = false;
        mPlayer.videoMaskId = rec.videoMaskId || 0;
        mSeat.Player = mPlayer;
        mSeat.isBank = false;
        mSeat.FsmLogicComponent.SM.ChangeState(SeatSitAnimation.Instance);
        if (this.game.squidEnabled) {
            this.game.RefreshSquidMarks();
            this.game.UpdateRoomDes();
        }
        this.game.UpdateStartGameState();
        // 视频房间：检查该玩家是否已有远端视频流
        this.TryRenderRemoteVideoForSeat(mSeat);
        // 刷新麦克风图标（新人坐下可能需要显示静音图标）
        this._refreshAllMicIcons();
        // 新玩家入座 → 预取战绩 + 公共信息缓存（对齐 Unity CacheUserDataOnSitDown）
        if (randomId) {
            GameplayPlayerInfoCache.Instance.prefetch([randomId]);
        }
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
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            return;
        }
        console.log('[VideoMask] 自己坐下, videoMaskId:', rec.videoMaskId);
        // videoMaskId > 4 时客户端统一归为 1
        if (rec.videoMaskId > 4) rec.videoMaskId = 1;
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
        this.game.mainPlayer.inSquid = rec.squidIn || false;
        this.game.mainPlayer.squidRoundSeated = rec.squidRoundSeated || this.game.mainPlayer.inSquid;
        this.game.mainPlayer.squidEscaped = false;
        this.game.mainPlayer.squidCount = 0;
        this.game.mainPlayer.videoMaskId = rec.videoMaskId || 0;
        this.game.squidTotalLimit = rec.squidTotalLimit || this.game.squidTotalLimit;
        this.game.mainPlayer.KeepSeatLeftTime = rec.keepSeatLeftTime;
        if (rec.keepSeatLeftTime > 0) {
            UIComponent.Instance.Toast(`${i18nMgr.Get('UITexas_FriendtableapplyBringinTips001')}${rec.keepSeatLeftTime}s`);
            //记录这个需要申请审核的房间
            GameCache.Instance.BringCheckRoomIdMap[GameCache.Instance.room_id] = true;
        }
        let seat: Seat = null;
        //服务器记录的id
        let me_seat_id: number = this.game.GetLocalSeatID(rec.recvSeatId);
        seat = this.game.GetSeatByLocalSeatID(me_seat_id);
        if (null == seat) return;
        //设置自己的座位id
        this.game.mainPlayer.seatID = me_seat_id;
        seat.Player = this.game.mainPlayer;
        seat.isBank = false;
        if (!this.game.mainPlayer.isParticipateInTheGame) {
            seat.UpdateWaiteNextTips(true);
        }
        this.game.HideWaitBlindBtn();
        if (seat.Player.chips > this.game.GetMinPlayChips() && seat.seatID == this.game.mainPlayer.seatID) {
            if (this.game.mainPlayer.canPlayStatus == Def.CanPlayStatus.NEED_POST) {
                // 需要补盲
                this.game.ShowWaitBlindBtn();
                seat.FsmLogicComponent.SM.ChangeState(SeatWaitBlind.Instance);
            }
            // else {
            //     mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            // }
        }
        //翻转动画
        seat.FsmLogicComponent.SM.ChangeState(SeatSitAnimation.Instance);
        // todo 这里要搞十分十分十分酷炫的动画，把自己位移到最下方，0号位
        //判断自己的方位id不在最下方,进行位移动画
        // if (seat.ClientSeatId > 0) {
        //     this.game.ResetSeatUIInfo(seat.ClientSeatId);
        // }
        this.game.ResetSeatUIInfo(seat.ClientSeatId);
        this.game.uirc.refreshViewOnSitAndStandup(true);
        if (this.game.squidEnabled) {
            this.game.RefreshSquidMarks();
            this.game.UpdateRoomDes();
        }
        if (GameCache.Instance.Vip == 1) {
            //ShowVipSeatDownTips(GameCache.Instance.nick);
        }
        // 视频房间：坐下后渲染本地摄像头到自己的头像
        if (GameCache.Instance._videoModel !== VideoModel.NONE) {
            const agora = AgoraManager.Instance;
            if (agora.isJoined) {
                // 频道已加入，直接渲染
                this.renderLocalVideoOnMySeat().then(ok => {
                    if (!ok) {
                        ToastManager.Instance.showToast('无法开启摄像头，请检查浏览器权限后重新入座');
                        setTimeout(() => {
                            this.game.TexasGameUtils.LeaveRoom();
                        }, 3000);
                    }
                });
            }
            // 频道还没加入时不弹 toast，等 JoinVideoChannelIfNeed 完成后自动补渲染
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
        this.game.UpdateStartGameState();
        // 刷新麦克风图标（自己坐下后更新静音/喇叭状态）
        this._refreshAllMicIcons();
        // 自己坐下 → 预取自己的战绩 + 公共信息缓存（对齐 Unity CacheUserDataOnSitDown）
        const selfId = GameCache.Instance.nUserId;
        if (selfId) {
            GameplayPlayerInfoCache.Instance.prefetch([selfId]);
        }
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
            if (null == mSeat) continue;
            mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            if (mSeat.seatID == this.game.mainPlayer.seatID) {
                if (rec.changesList[i].currentPostStatus == Def.CanPlayStatus.NORMAL || rec.changesList[i].currentPostStatus == Def.CanPlayStatus.AGREE_POST) {
                    mSeat.Player.canPlayStatus = Def.CanPlayStatus.NORMAL;
                    this.game.HideWaitBlindBtn();
                } else if (rec.changesList[i].currentPostStatus == Def.CanPlayStatus.NEED_POST) {
                    // 需要补盲
                    this.game.ShowWaitBlindBtn();
                    this.game.onClickWaitBlind();
                    mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitBlind.Instance);
                }
            } else {
                mSeat.Player.canPlayStatus = rec.changesList[i].currentPostStatus;
            }
        }
    }

    /// <summary>
    /// 本手开始
    /// </summary>
    /// <param name="responseData"></param>
    /// <param name="obj"></param>
    public handleRecvStartInfoCommon(rec: ServerMessageStartInfo.AsObject): void {
        const wasInSquidRound = this.game.isGameInSquidRound;
        this.game.gamestatus = 1;
        GameCache.Instance.GameStatus = this.game.gamestatus;
        this.game.cacheRound = Def.Round.PREFLOP;
        this.game.uirc.Image_WaitForStartTips.active = false;
        this.game.fuck4thPCardByInsuranceState = 0;
        this.game.isAllinGetPlayerCards = false;
        this.game.lastBankerIndex = this.game.bankerIndex;
        this.game.bankerIndex = this.game.GetLocalSeatID(rec.handInfo.buSeatId);
        this.game.bigIndex = this.game.GetLocalSeatID(rec.handInfo.bbSeatId);
        this.game.smallIndex = this.game.GetLocalSeatID(rec.handInfo.sbSeatId);
        this.game.operationID = -1;
        if (rec.nextOperator != null) {
            this.game.operationID = this.game.GetLocalSeatID(rec.nextOperator.seatId);
        }
        // 麦序模式：新一手牌开始，切换到首个操作者
        this.onSequenceOperatorChange(this.game.operationID);
        this.game.dealStartIndex = -1;
        if (rec.handInfo?.dealOrderList?.length > 0) {
            this.game.dealStartIndex = this.game.GetLocalSeatID(rec.handInfo.dealOrderList[0]);
        } else if (this.game.operationID >= 0) {
            this.game.dealStartIndex = this.game.operationID;
        }
        // 蘑菇池以 StartInfo 下发为准，不做客户端累加
        const pools = rec.handInfo.pools;
        this.game.mushroomPool = (pools && pools.mushroomPool) || 0;
        this.game.squidPool = (pools && pools.squidPool) || 0;
        this.game.squidCurrentRound = rec.handInfo.conRounds || 0;
        this.game.isGameInSquidRound = rec.handInfo.inSquid || false;
        this.game.mHandNum = rec.handInfo.handNum;
        this.game.curCriticalHitRound = rec.handInfo.conRounds || 0;
        this.game.UpdateRoomDes();
        // this.game.ResetPublicCardsId_1();
        // this.game.ResetPublicCardsId_2();
        this.game.ResetPublicCards();
        this.game.ClearPublicCardsUI();
        this.game.ClearSecondPublicCardsUI();
        this.game.ResetPublicCardsImage();
        this.game.ResetSecondPublicCardsImage();
        this.game.HideWaitBlindBtn();
        // 每手开始先重置全部座位庄/盲状态，避免未在 playersList 的旧状态残留
        this.game.listSeat.forEach(s => {
            if (!s) return;
            s.isBank = false;
            s.isBig = false;
            s.isSmall = false;
            s.isStraddle = false;
        });
        let Seat: Seat = null;
        let SeverSeatIds: number[] = [];
        let hasMainSeatInPlayers = false;
        for (let i = 0, n = rec.playersList.length; i < n; i++) {
            Seat = this.game.listSeat[this.game.GetLocalSeatID(rec.playersList[i].seatId)];
            if (null == Seat || null == Seat.Player) {
                continue;
            }
            // 蘑菇玩法标记
            if (this.game.mushroomEnabled) {
                Seat.Player.inMushroom = rec.playersList[i].inMushroom || false;
                Seat.Player.costMushroom = rec.playersList[i].costMushroom || 0;
                Seat.Player.mushroomCount = (rec.playersList[i] as any).mushroomCount || Seat.Player.mushroomCount;
                Seat.Player.mushroomAmount = (rec.playersList[i] as any).mushroomAmount || Seat.Player.mushroomAmount;
                // 如果池未清空且服务端未标记，默认新入玩家不参与本手蘑菇
                if (this.game.mushroomPool > 0 && rec.playersList[i].inMushroom == null) {
                    Seat.Player.inMushroom = false;
                }
            } else {
                Seat.Player.inMushroom = false;
                Seat.Player.costMushroom = 0;
            }
            // 鱿鱼玩法标记
            if (this.game.squidEnabled && this.game.isGameInSquidRound) {
                Seat.Player.inSquid = rec.playersList[i].inSquid || false;
                Seat.Player.squidCount = rec.playersList[i].squidCount || 0;
                Seat.Player.squidEscaped = rec.playersList[i].squidEscaped || false;
                Seat.Player.squidRoundSeated = true;
            } else {
                Seat.Player.inSquid = false;
                Seat.Player.squidCount = 0;
                Seat.Player.squidEscaped = false;
                Seat.Player.squidRoundSeated = false;
            }
            SeverSeatIds.push(this.game.GetLocalSeatID(rec.playersList[i].seatId));
            Seat.isBank = Seat.seatID == this.game.bankerIndex;
            Seat.isBig = Seat.seatID == this.game.bigIndex;
            Seat.isSmall = Seat.seatID == this.game.smallIndex;
            Seat.isStraddle = rec.playersList[i].action == Def.Action.STRADDLE;
            Seat.Player.SetCards(this.game.GetHandCardsByRecList(rec.playersList[i].cardsList));
            Seat.Player.chips = rec.playersList[i].chip;
            Seat.Player.cacheChips = rec.playersList[i].chip + rec.playersList[i].roundBet + rec.playersList[i].ante;
            Seat.Player.canPlayStatus = Def.CanPlayStatus.NORMAL; //数组里面有人即可打牌
            Seat.Player.extraBlind = 0; //是否补盲，已在列表的玩家不需要补盲
            Seat.Player.isFold = rec.playersList[i].action == Def.Action.FOLD;
            Seat.FoldHeadGray(Seat.Player.isFold);
            Seat.Player.actionStatus = rec.playersList[i].action;
            Seat.Player.anteNumber = 0;
            Seat.UpdateWaiteNextTips(false);
            Seat.FsmLogicComponent.SM.ChangeState(SeatStart.Instance);
            Seat.Player.anteNumber += rec.playersList[i].roundBet;
            if (Seat.isStraddle) {
                Seat.FsmLogicComponent.SM.ChangeState(SeatStraddle.Instance);
            }
            if (rec.playersList[i].ante >= 0) {
                this.game.alreadAnte += rec.playersList[i].ante;
                this.game.alreadAnte += rec.playersList[i].roundBet;
            }
            if (Seat.seatID == this.game.mainPlayer.seatID) {
                hasMainSeatInPlayers = true;
                if (Seat.Player.actionStatus == Def.Action.NONE) {
                    console.warn(LN, '[StartInfo] main seat in playersList but action is NONE', {
                        handNum: rec.handInfo?.handNum,
                        mainSeatID: this.game.mainPlayer.seatID,
                        mainCanPlayStatus: Seat.Player.canPlayStatus,
                        playersSeatIds: rec.playersList?.map(p => p.seatId) || []
                    });
                }
                this.game.HideWaitBlindBtn();
            }
            //设置卡牌隐藏
            for (let i = 0, n = Seat.listCardUIInfos.length; i < n; i++) {
                Seat.listCardUIInfos[i].imageSelect.node.active = false;
            }
            for (let i = 0, n = Seat.listSmallCardUIInfos.length; i < n; i++) {
                Seat.listSmallCardUIInfos[i].imageSelect.node.active = false;
            }
        }
        // 不在客户端本地累加蘑菇池，完全以服务端 StartInfo 下发值为准
        if (this.game.mushroomEnabled) {
            this.game.UpdateRoomDes();
            // 刷新所有座位蘑菇标识（避免旧庄家残留）
            this.game.listSeat.forEach(s => s?.UpdateMushroomTag(this.game.mushroomPool, this.game.mushroomBase, this.game.mushroomEnabled));
        }
        if (this.game.squidEnabled) {
            this.game.UpdateRoomDes();
            this.game.RefreshSquidMarks();
        } else {
            this.game.listSeat.forEach(s => s?.ClearSquidTag());
        }
        if (this.game.smallIndex >= 0) {
            GC.sound.Play('sfx_desk_bet_first');
        } else {
            // Unity 对齐：小盲无效时，使用当前操作者作为发牌起点兜底。
            this.game.smallIndex =
                this.game.operationID >= 0 ? this.game.operationID : this.game.TexasGameUtils.GetSmallSeatIdByPlayingSeatIds(SeverSeatIds, this.game.bigIndex);
        }
        if (this.game.dealStartIndex < 0) {
            this.game.dealStartIndex = this.game.smallIndex >= 0 ? this.game.smallIndex : (SeverSeatIds[0] ?? 0);
        }
        if (this.game.bigIndex >= 0) {
            GC.sound.Play('sfx_desk_bet_second');
        }
        if (this.game.mainPlayer?.seatID >= 0 && !hasMainSeatInPlayers) {
            const mainSeat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
            const mainServerSeatID = this.game.GetRemoteSeatID(this.game.mainPlayer.seatID);
            console.warn('[StartInfo] main seat is not in playersList', {
                handNum: rec.handInfo?.handNum,
                mainSeatID: this.game.mainPlayer.seatID,
                mainServerSeatID: mainServerSeatID,
                mainCanPlayStatus: mainSeat?.Player?.canPlayStatus,
                mainActionStatus: mainSeat?.Player?.actionStatus,
                mainChips: mainSeat?.Player?.chips,
                mainInSquid: mainSeat?.Player?.inSquid,
                inSquidRound: this.game.isGameInSquidRound,
                playersSeatIds: rec.playersList?.map(p => p.seatId) || [],
                dealOrderList: rec.handInfo?.dealOrderList || []
            });
        }
        // Unity 对齐：本手开始直接发牌，避免入座换位期间缓存队列导致漏发。
        if (this.game.seatMoveStruct.moving) {
            cc.warn('StartInfo arrived while seat moving, play deal immediately', {
                handNum: rec.handInfo?.handNum
            });
        }
        this.__PlayDealAnimation(rec);
        console.log(LN, '立刻执行发牌');
        this.game.UpdateStartGameState();
    }

    private __PlayDealAnimation(responseData: any) {
        this.game.ResetSeatMoveStruct();
        this.game.PlayDealAnimation(() => {
            if (this.game?.IsDispose || !this.game?.mainPlayer || !this.game?.listSeat?.length) {
                cc.warn('[TexasGameProtocol] skip stale deal callback after dispose');
                return;
            }
            cc.log('发牌结束');
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
                } else {
                    mSeat0.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                }
            }
            //mSeat0 = this.game.GetSeatByLocalSeatID(this.game.operationID);
            let mMySeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
            //if (null != mMySeat && mMySeat.seatID == mSeat0.seatID && mMySeat.Player.userID == mSeat0.Player.userID) {
            if (mMySeat?.Player && this.game.operationID == this.game.mainPlayer.seatID) {
                // 到自己操作
                this.game.HideAutoOperationPanel();
                if (mMySeat.Player.isParticipateInTheGame && !mMySeat.Player.IsAutoOp) {
                    this.game.ShowOperationPanel(responseData.nextOperator);
                }
            } else {
                // 其他人操作
                this.game.HideOperationPanel();
                if (null != mMySeat && mMySeat.Player.isParticipateInTheGame) {
                    // 自己参与游戏
                    // 非弃牌 && 非ALLIN && 非托管
                    if (
                        mMySeat.Player.actionStatus != Def.Action.FOLD &&
                        mMySeat.Player.actionStatus != Def.Action.ALLIN &&
                        mMySeat.Player.actionStatus != Def.Action.NONE &&
                        !mMySeat.Player.IsAutoOp
                    ) {
                        UIComponent.Instance.ShowUI(
                            PrefabUI.UIAutoOperationComponent,
                            UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(responseData.handInfo.roundBet))
                        );
                    } else {
                        this.game.HideAutoOperationPanel();
                    }
                } else {
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
        if (rec.status != 0) return;
        if (!this.game.cacheCancelKeepSeat) {
            this.game.uirc.Image_ReserveSeatTips.active = true;
            this.game.TexasGameUtils.WaitFewSeconds(this.game.uirc.Image_ReserveSeatTips, 3000);
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
        mSeat.Player.keepSeatReason = rec.keepSeatReason;
        if (rec.keep && rec.keepSeatReason == Def.KeepSeatReason.KSR_TAKE_SEAT) {
            mSeat.Player.KeepSeatLeftTime = rec.leftTime;
            mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            if (rec.leftTime > 0 && mSeat.IsMySeat) {
                UIComponent.Instance.Toast(`${i18nMgr.Get('UITexas_FriendtableapplyBringinTips001')}${rec.leftTime}s`);
            }
            this.game.UpdateStartGameState();
            return;
        }
        if (rec.keep) {
            mSeat.keepSeatLeftTime = rec.leftTime - 5; //由于留座消息下发时间是每手结束，需要在清理桌面时才显示留座，中间间隔五秒。
            mSeat.Player.canPlayStatus = Def.CanPlayStatus.KEEP_SEAT;
            this.game.SetIsEixt(true);
        } else {
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
                } else {
                    mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
                }
            } else {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
            }
            this.game.SetIsEixt(false);
        }
        this.game.UpdateStartGameState();
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
        if (this.game.GetPublicCardsCount(1) > 0) this.game.UpdatePots();
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
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            this.game.InteractableSeeMorePublic(true);
            return;
        }
        // 游戏状态校验：必须处于结算阶段
        if (this.game.GameState != TexasGameState.HandShowdown && this.game.GameState != TexasGameState.HandRiver) {
            console.log('[SeeMorePublic] 收到成功响应但游戏状态不是结算/河牌:', this.game.GameState);
        }
        // 更新round（全看模式服务器返回UNDEFINED时映射为RIVER）
        if (rec.round == Def.Round.UNDEFINED) {
            this.game.cacheRound = 4; // Def.Round.RIVER
        } else {
            this.game.cacheRound = rec.round;
        }
        this.game.UpgradePublicCards(1, rec.publicCardsList);
        if (this.game.isBombPot) {
            this.game.AddSecondPublicCardsBombPot(rec.publicCards2List || []);
            this.game.IsSecondPsc = this.game.GetPublicCardsCount(2) > 0;
        }
        // 免费次数扣减
        if (this.game._viewPubFreeCount > 0) {
            this.game._viewPubFreeCount--;
        }
        // 显示成功提示
        let public_card_count = this.game.GetPublicCardsCount(1);
        if (this.game._publicViewType == 2) {
            this.game.ShowSeeMorePublicTips(CPErrorCode.LanguageDescription(10018)); // "查看翻牌" - 全看成功
        } else if (public_card_count == 3) {
            this.game.ShowSeeMorePublicTips(CPErrorCode.LanguageDescription(10018)); // 翻牌成功
        } else if (public_card_count == 4) {
            this.game.ShowSeeMorePublicTips(CPErrorCode.LanguageDescription(10019)); // 转牌成功
        } else {
            this.game.ShowSeeMorePublicTips(CPErrorCode.LanguageDescription(10020)); // 河牌成功
        }
        //启用按钮
        this.game.InteractableSeeMorePublic(true);
        // 花费查看未发公共牌
        if (this.game.GetPublicCardsCount(1) == 5) {
            this.game.HideSeeMorePublic();
        }
        // 刷新价格显示（免费次数可能已变化）
        this.game.SetSeeMorePublicCardPrice();
        // 刷新钻石余额（服务端真实扣费）
        this.game._reqDiamondBalance();
        // 再从服务端刷新免费次数
        this.game.RefreshViewPubFreeCount();
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
            } else if (rec.round == 3) {
                //查看转牌圈的牌;
                this.game.ShowSeeMorePublicTips(`${mSeat.Player.nick}${CPErrorCode.LanguageDescription(20026)}`);
            } else if (rec.round == 4) {
                //查看河牌圈的牌;
                this.game.ShowSeeMorePublicTips(`${mSeat.Player.nick}${CPErrorCode.LanguageDescription(20027)}`);
            }
        }
    }

    /// <summary>
    /// 付费看手牌响应 (1026)
    /// </summary>
    protected HANDLER_REQ_VIEW_PLAYER_CARDS(rec: ServerMessageViewPlayerCards.AsObject) {
        if (rec == null) return;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            this.game.InteractableLookHandCard(true);
            return;
        }
        this.game.ShowSeeMorePublicTips(i18nMgr.Get('UITexas_LookCardFlipSuccessTips')); // 偷偷看成功：翻牌成功,详情可去牌谱查看
        this.game.HideLookHandCard(); // 成功后隐藏按钮（对齐 Unity: _lookCardBg.SetActive(false)）
        // 成功后刷新次数
        this.game.SendViewPlayerCardsNum();
    }

    /// <summary>
    /// 看手牌次数响应 (1029)
    /// </summary>
    protected HANDLER_REQ_VIEW_PLAYER_CARDS_NUM(rec: ServerMessageViewPlayerCardsNum.AsObject) {
        if (rec == null) return;
        if (rec.status == 0) {
            this.game.lookCardsPayTimes = rec.payTimes || 0;
            // 收到次数后刷新价格（对齐 Unity OnMsgLookCardsTime）
            this.game.SetLookHandCardPrice();
        }
    }

    /// <summary>
    /// 偷偷看手牌推送 (1127)：服务端推送被偷看的手牌数据，在座位上显示小牌面
    /// 对齐 Unity OnMsgShowViewCards / TexasSeat.ShowSmallCard
    /// </summary>
    protected HANDLER_REQ_SHOW_VIEW_CARDS(rec: ServerMessageShowViewCards.AsObject) {
        if (!rec || !rec.playerCardsList) return;
        for (let i = 0; i < rec.playerCardsList.length; i++) {
            const card = rec.playerCardsList[i];
            if (card.seatId == 0) continue;
            const seat = this.game.GetSeatByServerSeatID(card.seatId);
            if (!seat || !seat.Player || seat.IsMySeat) continue;
            // 将手牌数据写入 Player
            const cards: number[] = [];
            for (let k = 0; k < card.cardsList.length; k++) {
                cards.push(card.cardsList[k]);
            }
            seat.Player.SetCards(cards);
            // 显示小牌面
            seat.ShowCards(seat.listSmallCardUIInfos);
            seat.HideCardBack();
        }
    }

    /// <summary>
    /// 被看牌者通知 (110)：有人付费查看了你的手牌
    /// 对齐 Unity OnMsgUserGameWatch
    /// </summary>
    protected HANDLER_REQ_USER_GAME_WATCH(rec: ServerMessageUserGameWatch.AsObject) {
        if (!rec) return;
        const userName = rec.userName || '';
        const roomId = rec.roomId || 0;
        const handNum = rec.handNum || 0;
        const amount = rec.amount || 0;
        if (amount > 0) {
            UIComponent.Instance.Toast(
                StringHelper.Format(i18nMgr.Get('UITexas_payLookHandCardToast1'), [userName, String(roomId), String(handNum), String(amount)])
            );
        } else {
            UIComponent.Instance.Toast(StringHelper.Format(i18nMgr.Get('UITexas_payLookHandCardToast2'), [userName, String(roomId), String(handNum)]));
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
        // 记录是否全部玩家已秀牌（用于控制偷偷看按钮显隐）
        if (rec.isAll) {
            this.game.allCardsShown = true;
        }
        // 保险模式，allin后要收筹码，不用等收到公共牌再收。
        if (this.game.insurance && this.game.GetPublicCardsCount(1) > 0) {
            this.game.PlayRecyclingChipAnimation(null);
        }
        let mSeat: Seat = null;
        for (let i = 0, n = rec.playerCardsList.length; i < n; i++) {
            let playerCards: PlayerCards.AsObject = rec.playerCardsList[i];
            if (playerCards.seatId == 0) continue;
            mSeat = this.game.GetSeatByServerSeatID(playerCards.seatId);
            if (null == mSeat) return;
            if (playerCards?.cardsList?.[0] == 0 && playerCards?.cardsList?.[1] == 0) {
                console.log('player allin card = 0,0');
                return;
            }
            let allinCards: number[] = [];
            for (let j = 0; j < playerCards.cardsList.length; j++) {
                allinCards.push(playerCards.cardsList[j]);
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
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status)); //CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_ADD_TIME, rec.Status)
            // 加时失败，倒计时已归零，需要手动关闭操作面板
            this.game.HideOperationPanel();
            return;
        }
        this.game.delayCount = rec.times;
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat) return;
        mSeat.AddOperationTime(rec.duration);
        this.game.UpdateDelayBtn();
        // ClickAddTime 在 UIOperationComponent.HANDLER_REQ_ADD_TIME 中恢复倒计时后清除
        UIComponent.Instance.ToastLanguage('UITexas_AddTimeSuccess');
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
            cc.warn('Seat is null');
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
        } else {
            this.game.operationID = -1;
        }
        // 麦序模式：操作者切换时强制开关视频
        this.onSequenceOperatorChange(this.game.operationID);
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
        } else {
            console.log('Error mSeat is null or mSeat.Player is null');
        }
        if (this.game.operationID != -1) {
            Seat = this.game.GetSeatByLocalSeatID(this.game.operationID);
            if (null == Seat || null == Seat.Player) {
                console.warn('Seat is null');
                GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.NetworkException, null);
                return;
            }
            if (Seat.seatID == this.game.mainPlayer.seatID && Seat.Player.userID == this.game.mainPlayer.userID && this.game.mainPlayer.isPlaying) {
                // 到自己操作
                // 自动
                this.game.HideAutoOperationPanel();
                if (
                    this.game.autoFold ||
                    this.game.autoCheck ||
                    (this.game.autoCall && rec.action != Def.Action.RAISE && rec.action != Def.Action.ALLIN) ||
                    this.game.autoAllin
                ) {
                    this.game.HideOperationPanel();
                    if (this.game.TexasGameUtils.AutoOperationHandle(rec.nextOperator.actionsList)) {
                        this.game.HideOperationPanel();
                    } else {
                        this.game.ShowOperationPanel(rec.nextOperator);
                    }
                } else {
                    this.game.ShowOperationPanel(rec.nextOperator);
                }
            } else {
                // 下一个操作不是自己
                this.game.HideOperationPanel();
                if (this.game.mainPlayer.isParticipateInTheGame) {
                    // 自己有参与游戏
                    if (
                        this.game.mainPlayer.actionStatus != Def.Action.FOLD &&
                        this.game.mainPlayer.actionStatus != Def.Action.ALLIN &&
                        this.game.mainPlayer.actionStatus != Def.Action.NONE &&
                        !this.game.mainPlayer.IsAutoOp
                    ) {
                        UIComponent.Instance.ShowUI(
                            PrefabUI.UIAutoOperationComponent,
                            UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(rec.roundBet))
                        );
                    } else {
                        this.game.HideAutoOperationPanel();
                    }
                } else {
                    // 观众
                    this.game.HideAutoOperationPanel();
                }
            }
            Seat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
        } else {
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
            if (null == mSeat || null == mSeat.Player) continue;
            if (!mSeat.IsMySeat) {
                //自己的牌不用更新
                mSeat.Player.SetCards(this.game.GetHandCardsByRecList(this.game.MessageWinnerData.resultsList[i].myCardsList));
                mSeat.UpdateCards();
            }
            if (mSeat.IsMySeat) {
                GameCache.Instance.CurGame.mainPlayer.chips = this.game.MessageWinnerData.resultsList[i].chip;
                mSeat.UpdateImageBackActive();
            }
        }
        this.game.TexasGameUtils.SetWinnerCardsHight(this.game.uirc.listCards, this.game.GetPublicCards(1));
        //第一套牌
        this.game.SetSecondPublicCardImageColor(cc.Color.GRAY);
        this.HandleTwoWinnerAnimation(true);
        await TimeHelper.Sleep(3000);
        //等待3秒，处理第二套牌动画
        this.game.SetSecondPublicCardImageColor(cc.Color.WHITE);
        this.game.SetPublicCardsImageColor(cc.Color.GRAY);
        this.game.TexasGameUtils.SetWinnerCardsHight(this.game.uirc.listSecondCards, this.game.GetPublicCards(2));
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
            let Result = this.game.MessageWinnerData.resultsList[i];
            SeatId = this.game.GetLocalSeatID(Result.seatId);
            Seat = this.game.GetSeatByLocalSeatID(SeatId);
            if (null != Seat && null != Seat.Player && Seat.Player.actionStatus == Def.Action.NONE) {
                console.log('not is Participate In The Game');
                continue;
            }
            if (null == Seat || null == Seat.Player) continue;
            let isWin1: boolean = Result.splitResultsList[0].isWinner;
            let isWin2: boolean = Result.splitResultsList[1].isWinner;
            let win1: number = Result.splitResultsList[0].win;
            let win2: number = Result.splitResultsList[1].win;
            let fee: number = Result.fee;
            let fee1: number = 0;
            let fee2: number = 0;
            if (isWin1 && isWin2) {
                if (fee != 0) {
                    fee1 = (win1 * fee) / (win1 + win2);
                    fee2 = fee - fee1;
                }
            } else {
                fee1 = isWin1 ? fee : 0;
                fee2 = isWin2 ? fee : 0;
            }
            let handBet1: number = (Result.handBet / 2) ^ 0;
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
            let PlayRecyclingWinChipAnimation_Tween = Seat.PlayRecyclingWinChipAnimation(this.game.GetRecyclingChipPosV3());
            if (PlayRecyclingWinChipAnimation_Tween) {
                tween.then(
                    cc.callFunc(() => {
                        if (!Seat?.ui?.isValid) return;
                        PlayRecyclingWinChipAnimation_Tween.IsPlaying = true;
                        PlayRecyclingWinChipAnimation_Tween.tween.start();
                    })
                );
            }
            if (SeatId == this.game.mainPlayer.seatID) {
                if (isFirst) {
                    Result.winCardsList.forEach(winCard => {
                        mainSeatHightCards.push(winCard.card);
                    });
                } else {
                    Result.winCards2List.forEach(winCard => {
                        mainSeatHightCards.push(winCard.card);
                    });
                }
            }
            Seat.Player.chips = isFirst ? Result.chip + Result.fee - Result.splitResultsList[1].win - fee1 : Result.chip;
            Seat.UpdateCoin();
        }
        tween.start();
        let mainSeat: Seat = null;
        mainSeat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (mainSeat != null) {
            let cacheCards: number[] = isFirst ? this.game.GetPublicCards(1) : this.game.GetPublicCards(2);
            let highlightCards_ref = { highlightCards: [] as number[] };
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
                cc.log('not is Participate In The Game');
                continue;
            }
            //先更新手牌，方便后面做大牌动画
            if (null == mSeat || null == mSeat.Player) continue;
            if (result.chip == 0) {
                mSeat.Player.MttHunterKillAwardOtherPlus = 0;
                mSeat.Player.HunterKillAwardOther = 0;
                mSeat.Player.HunterHeadValue = 0;
            } else {
                mSeat.Player.MttHunterKillAwardOtherPlus += result.mttHunterKillAwardOtherPlus;
            }
            mSeat.UpdateHunterAward();
            if (!mSeat.IsMySeat) {
                //自己的牌不用更新
                mSeat.Player.SetCards(this.game.GetHandCardsByRecList(this.game.MessageWinnerData.resultsList[i].myCardsList));
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
                if (!mSeat.Player.isFold) mSeat.UpdateCards();
            } else {
                mSeat.UpdateCards();
            }
        }
        let mCount = this.game.GetPublicCardsCount(1);
        let mCanPlayEndPublicCardsAnimation = mCount == 5 && !mOtherAllFold;
        if (mCanPlayEndPublicCardsAnimation) {
            let highlightCards_ref = { highlightCards: [] as number[] };
            let cardType: CardType = this.game.GetCardType(highlightCards_ref, this.game.GetPublicCards(1));
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
                cc.log('not is Participate In The Game');
                continue;
            }
            if (null == mSeat || null == mSeat.Player) continue;
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
            } else {
                if (mSeat.CanPlayRecyclingWinChipAnimation)
                    //tween = mSeat.PlayRecyclingChipAnimation();
                    mSeat.PlayRecyclingChipAnimation();
            }
        }
        if (null == tween) tween = this.game.sequencePlayEndPublicCardsAnimation.tween;
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
                cc.log('not is Participate In The Game');
                continue;
            }
            if (null == mSeat || null == mSeat.Player) continue;
            if (result.win > result.handBet) {
                mSeat.Player.winChips = result.win + result.insuranceWin - result.insurance - result.handBet - result.fee;
            } else {
                mSeat.Player.winChips = result.insuranceWin;
            }
            mSeat.Player.recyclingChip = result.win;
            mSeat.Player.cardType = result.handValueType;
            mSeat.Player.isWin = result.win > result.handBet;
            mSeat.StopAllinArmature();
            mSeat.PlayWinArmature();
            mSeat.UpdateRecyclingWinChip();
            //猎人赛人头奖励刷新
            if (GameCache.Instance.room_type > RoomType.Omaha6SixPlusFixedAof && (GameCache.Instance.CurGame as MTTGame).huntMode) {
                mSeat.UpdateHunterAward();
            }
            let PlayRecyclingWinChipAnimation_Tween: { tween?: cc.Tween; complete?: Function; IsPlaying?: boolean; Kill?: Function } =
                mSeat.PlayRecyclingWinChipAnimation(this.game.GetRecyclingChipPosV3());
            if (PlayRecyclingWinChipAnimation_Tween) {
                tween.then(
                    cc.callFunc(() => {
                        if (!mSeat?.ui?.isValid) return;
                        PlayRecyclingWinChipAnimation_Tween.IsPlaying = true;
                        PlayRecyclingWinChipAnimation_Tween.tween.start();
                    })
                );
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
                if (null == mCacheWinnerSeatIds) mCacheWinnerSeatIds = [];
                mCacheWinnerSeatIds.push(this.game.GetLocalSeatID(result.seatId));
                if (null == mCacheWinnerCardTypes) mCacheWinnerCardTypes = [];
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
                if (null == mSeat || null == mSeat.Player) continue;
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
                cc.log('not is Participate In The Game');
                continue;
            }
            if (null == mSeat || null == mSeat.Player) continue;
            mSeat.Player.chips = this.game.MessageWinnerData.resultsList[i].chip;
            mSeat.UpdateCoin();
        }
    }

    /// <summary>
    /// 公共牌
    /// </summary>
    /// <param name="source"></param>
    public HandleGetPublicCards(source: ServerMessagePublicCards.AsObject): void {
        UIComponent.Instance.HideUI(PrefabUI.UIInsuranceNewPanel);
        UIComponent.Instance.HideUI(PrefabUI.UIAgreeSecondPcsComponent);
        this.game.autoCall = false;
        this.game.autoAllin = false;
        this.game.autoCheck = false;
        this.game.autoFold = false;
        let iCount: number = this.game.GetPublicCardsCount(1); // 要在更新公共牌前拿数量
        //未发公共牌状态
        if (this.game.GameState == TexasGameState.HandFlop && iCount == 0) {
            this.game.UpgradePublicCards(1, source.publicCardsArrayList);
        }
        //发了三张公共牌状态
        else if (this.game.GameState == TexasGameState.HandTurn && iCount == 3) {
            this.game.UpgradePublicCards(1, source.publicCardsArrayList);
        }
        //发了四张公共牌状态
        else if (this.game.GameState == TexasGameState.HandRiver && iCount == 4) {
            this.game.UpgradePublicCards(1, source.publicCardsArrayList);
        } else {
            cc.warn('public card error：' + this.game.GameState + ' Cur Public Cards Count :' + iCount);
        }
        let lastPubicCard: number = source.publicCardsArrayList[source.publicCardsArrayList.length - 1];
        const secondCards = this.game.isBombPot ? source.publicCardsArray2List || [] : source.extPublicCardsArrayList || [];
        this.game.IsSecondPsc = secondCards.length > 0;
        let bust: boolean = false;
        let mRoomType: RoomType = GameCache.Instance.room_type;
        if (this.game.cacheTrunOutsCards != null) {
            this.game.cacheTrunOutsCards.forEach((value, key) => {
                if (value.includes(lastPubicCard)) {
                    bust = true;
                }
                if (this.game.GetLocalSeatID(key) == this.game.mainPlayer.seatID && value.includes(lastPubicCard) && this.game.cacheBuyActiveAmount > 0) {
                    this.game.uirc.ShowInsuranceTipJieSuan(
                        GameUtil.GetOddsByPlayerNum(this.game.cacheBuyInsurancePotUserCount, value.length) * this.game.cacheBuyActiveAmount
                    );
                }
            });
        }
        if (bust) {
            //爆牌动画
            //this.ShowBustCardAnimation();
        }
        this.game.ClearSeatBubble(false);
        let mCacheSeat: Seat = null;
        for (let i = 0, n = this.game.listSeat.length; i < n; i++) {
            mCacheSeat = this.game.listSeat[i];
            if (null == mCacheSeat || null == mCacheSeat.Player || !mCacheSeat.Player.isPlaying) continue;
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
            if (null == mSeat) return;
            if (mSeat.seatID == this.game.mainPlayer.seatID && mSeat.Player.userID == this.game.mainPlayer.userID && mSeat.Player.isPlaying) {
                // 到自己操作
                this.game.HideAutoOperationPanel();
                // 非托管
                if (!this.game.mainPlayer.IsAutoOp) {
                    this.game.ShowOperationPanel(source.nextOperator);
                }
            } else {
                // 下一个操作不是自己
                this.game.HideOperationPanel();
                // 非弃牌、非ALL IN、非空闲等待下一局、非托管
                if (this.game.mainPlayer.isPlaying && !this.game.mainPlayer.IsAutoOp) {
                    // 预操作UI
                    UIComponent.Instance.ShowUI(
                        PrefabUI.UIAutoOperationComponent,
                        UIAutoOperationComponent.AutoOperationData(this.game.TexasGameUtils.getAutoOperationCallAmount(0))
                    );
                } else {
                    // 无预操作UI
                    this.game.HideAutoOperationPanel();
                }
            }
            // 麦序模式：公共牌下发后更新操作者视频状态
            this.game.operationID = opSeatID;
            this.onSequenceOperatorChange(opSeatID);
            mSeat.FsmLogicComponent.SM.ChangeState(SeatOperation.Instance);
        };
        //TweenCallback SecondTweenCallback = () => {
        let SecondTweenCallback = () => {
            if (this.game.isBombPot) {
                if (source.publicCardsArray2List != null && source.publicCardsArray2List.length > 0) {
                    this.game.AddSecondPublicCardsBombPot(source.publicCardsArray2List);
                    //执行第二套牌动画
                    this.game.UpdateSecondPublicCards(iCount, source.publicCardsArray2List.length, null);
                } else {
                    this.game.IsSecondPsc = false;
                }
            } else if (source.extPublicCardsArrayList != null && source.extPublicCardsArrayList.length > 0) {
                this.game.UpgradePublicCards(2, source.extPublicCardsArrayList);
                //执行第二套牌动画
                this.game.UpdateSecondPublicCards(iCount, source.extPublicCardsArrayList.length, null);
            } else {
                this.game.IsSecondPsc = false;
            }
        };
        this.game.stopUpdatePublicCardsAnimation = false;
        console.log('当前开始翻牌:', iCount);
        if (iCount == 0) {
            this.game.PlayFirstRecyclingChipAnimation(() => {
                this.game.PlayFirstRecyclingChipSubAnimation(() => {
                    this.game.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                    if (this.game.stopUpdatePublicCardsAnimation && null != this.game.sequenceUpdatePublicCards) {
                        this.game.sequenceUpdatePublicCards.Complete(true);
                    }
                    this.game.stopUpdatePublicCardsAnimation = false;
                });
                if (
                    this.game.stopUpdatePublicCardsAnimation &&
                    null != this.game.sequencePlayFirstRecyclingChipSubAnimation &&
                    this.game.sequencePlayFirstRecyclingChipSubAnimation.IsPlaying
                ) {
                    this.game.sequencePlayFirstRecyclingChipSubAnimation.complete(true);
                }
            });
        } else {
            if (this.game.isAllinGetPlayerCards && this.game.insurance) {
                // 保险就是多事，特殊处理一下。来了三张公共牌，动画播放中，没有保险可买，马上又来了一张公共牌。
                this.game.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                if (this.game.stopUpdatePublicCardsAnimation && null != this.game.sequenceUpdatePublicCards && this.game.sequenceUpdatePublicCards.IsPlaying) {
                    this.game.sequenceUpdatePublicCards.Complete(true);
                }
                this.game.stopUpdatePublicCardsAnimation = false;
            } else {
                this.game.PlayRecyclingChipAnimation(() => {
                    this.game.UpdatePublicCards(iCount, mTweenCallback, SecondTweenCallback);
                    if (
                        this.game.stopUpdatePublicCardsAnimation &&
                        null != this.game.sequenceUpdatePublicCards &&
                        this.game.sequenceUpdatePublicCards.IsPlaying
                    ) {
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
        this.game.HideOperationPanel();
        const squidOldCountMap = new Map<number, number>();
        const squidNoMarkCountBefore = this.game.CountSquidNoMarkPlayers();
        if (this.game.squidEnabled) {
            this.game.listSeat.forEach(seat => {
                if (seat?.Player) {
                    squidOldCountMap.set(seat.seatID, seat.Player.squidCount || 0);
                }
            });
        }
        let mSeat: Seat = null;
        for (let i = 0, n = rec.resultsList.length; i < n; i++) {
            mSeat = this.game.listSeat[this.game.GetLocalSeatID(rec.resultsList[i].seatId)];
            if (null == mSeat || null == mSeat.Player) continue;
            if (mSeat.IsMySeat) {
                this.game.callTimeCount = Number((rec.resultsList[i] as any).callTimeCount || 0);
                this.game.callTimeStay = !!(rec.resultsList[i] as any).callTimeStay;
                console.log(
                    '[ShowButtons] IsMySeat, standUp=' + rec.resultsList[i].standUp + ', isParticipating=' + this.game.mainPlayer.isParticipateInTheGame
                );
                if (!rec.resultsList[i].standUp) {
                    this.game.ShowSeeMorePublic();
                    // 全部玩家已秀牌时不显示偷偷看按钮
                    if (!this.game.allCardsShown) {
                        this.game.ShowLookHandCard();
                    }
                    this.game.SendViewPlayerCardsNum();
                }
            }
        }
        this.game.ShowCallTime();
        this.game.ClearSeatBubble(true);
        this.game.SetPublicCardInfosId();
        this.game.MessageWinnerData = rec;
        // 蘑菇结算：读取 Ehcs 的 EhcMushroom，统计获胜者并清空蘑菇池
        if (this.game.mushroomEnabled && rec?.resultsList?.length) {
            let hasMushWinner = false;
            rec.resultsList.forEach(r => {
                const seat = this.game.listSeat[this.game.GetLocalSeatID(r.seatId)];
                if (!seat || !seat.Player) {
                    return;
                }
                if (r.ehcsList && r.ehcsList.length) {
                    r.ehcsList.forEach(ehc => {
                        if (ehc.ehcType === Def.EHCType.EHC_MUSHROOM) {
                            const mushCount = ehc.pb_in || (ehc as any).in || 0;
                            if (mushCount > 0) {
                                hasMushWinner = true;
                                seat.Player.mushroomCount += mushCount;
                                seat.Player.mushroomAmount += mushCount * this.game.mushroomBase;
                            }
                        }
                    });
                }
            });
            if (hasMushWinner) {
                this.game.mushroomPool = 0;
            } else if (this.game.mushroomPool > 0) {
                // 无明确蘑菇赢家时，将池按本手结果中的 inMushroom 玩家平分
                // const eligibleSeats = rec.resultsList
                //     .map(r => this.game.listSeat[this.game.GetLocalSeatID(r.seatId)])
                //     .filter(s => s && s.Player && s.Player.inMushroom && !s.Player.isFold);
                // if (eligibleSeats.length > 0) {
                //     const share = Math.floor(this.game.mushroomPool / eligibleSeats.length);
                //     eligibleSeats.forEach(s => {
                //         s.Player.mushroomAmount += share;
                //     });
                //     this.game.mushroomPool = 0;
                // }
            }
            if (this.game.mushroomEnabled) {
                this.game.UpdateRoomDes();
                const bankerSeat = this.game.listSeat[this.game.bankerIndex];
                bankerSeat?.UpdateMushroomTag(this.game.mushroomPool, this.game.mushroomBase, this.game.mushroomEnabled);
            }
        }
        // 鱿鱼结算：同步玩家标记、播放首获动画，满足条件时触发轮结束并重置
        if (this.game.squidEnabled && rec?.resultsList?.length) {
            const newSquidSeats: Seat[] = [];
            let hasSquidSettlement = false;
            const pools = rec.pools as any;
            if (pools && pools.squidPool != null) {
                this.game.squidPool = pools.squidPool;
            }
            rec.resultsList.forEach(r => {
                const seat = this.game.listSeat[this.game.GetLocalSeatID(r.seatId)];
                if (!seat || !seat.Player) return;
                const oldCount = squidOldCountMap.get(seat.seatID) || 0;
                seat.Player.squidEscaped = (r as any).squidEscaped || false;
                seat.Player.squidCount = (r as any).squidCount || 0;
                if (oldCount === 0 && seat.Player.squidCount > oldCount) {
                    newSquidSeats.push(seat);
                }
                if (r.ehcsList?.length) {
                    const hasEhcSquid = r.ehcsList.some(ehc => {
                        if (ehc.ehcType !== Def.EHCType.EHC_SQUID) return false;
                        const inNum = (ehc as any).in || 0;
                        const outNum = (ehc as any).out || 0;
                        return inNum > 0 || outNum > 0;
                    });
                    if (hasEhcSquid) {
                        hasSquidSettlement = true;
                    }
                }
            });
            this.game.RefreshSquidMarks();
            newSquidSeats.forEach(seat => {
                seat.PlaySquidGetMarkAnim();
            });
            const squidNoMarkCountAfter = this.game.CountSquidNoMarkPlayers();
            const reachEndByCount = newSquidSeats.length > 0 && squidNoMarkCountBefore > 1 && squidNoMarkCountAfter <= 1;
            const reachEndBySettle = hasSquidSettlement || !!(pools?.squidDetailsList && pools.squidDetailsList.length > 0);
            if (reachEndByCount || reachEndBySettle) {
                this.game.PlaySquidRoundEndAnim(rec);
            }
            if (reachEndBySettle) {
                this.game.ResetSquidRoundState();
            } else {
                this.game.UpdateRoomDes();
            }
        }
        if (this.game.IsSecondPsc) {
            cc.log('is second public cards ');
            this.HandleMessageSecondPcsWinnerData();
        } else {
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
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status)); //CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_SHOWDOWN, rec.Status)
            return;
        }
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat) return;
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
        // this.game.HideSeeMorePublic();
        // this.game.HideSeeMorePublicTips();
        // this.game.HideWaitBlindBtn();
        // this.game.HideOperationPanel();
        //防止大牌动画未消失
        if (this.game.isPlayingBigWinAnimation) {
            //UIComponent.Instance.HideUI(UIType.UIBigWinAnimation);
        }
        // 刷新底池
        this.game.alreadAnte = 0;
        this.game.UpdateAlreadAnte();
        // 刷新分池
        this.game.HideAllPots();
        //GameUtil.ResetSeatInfo();
        this.game.ClearTableUI();
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
            if (null == mSeat || null == mSeat.Player) continue;
            mSeat.Player.actionStatus = Def.Action.NONE;
            mSeat.FsmLogicComponent.SM.ChangeState(SeatRoundEnd.Instance);
            if (mSeat.Player.canPlayStatus == Def.CanPlayStatus.KEEP_SEAT) {
                mSeat.FsmLogicComponent.SM.ChangeState(SeatKeep.Instance);
            } else {
                mSeat.Player.canPlayStatus = Def.CanPlayStatus.DISABLE;
            }
        }
        this.game.ResetSeatMoveStruct();
        this.game.UpdateStartGameState();
    }

    ProtocolHoldemBroadcastMsgHandler(rec: { status: number }) {
        console.log('[Emoji] BroadcastMsg response:', rec);
        // 扔道具：服务端返回成功后，用暂存数据在发送者本地播放动画
        if (rec?.status === 0 && this.pendingPropData) {
            console.log('[ThrowProp] 服务端确认成功，本地播放动画');
            this.game?.throwPropMgr?.handlePropMessage(this.pendingPropData);
            this.pendingPropData = null;
        }
    }

    /** 赠送钻石广播（所有玩家都收到，包括发送者） */
    private ProtocolHoldemRoomUserSendDiamondHandler(rec: ServerMessageRoomUserSendDiamond.AsObject) {
        if (!rec) return;
        console.log('[Diamond] 收到赠送钻石广播:', rec);
        this.game?.throwPropMgr?.playDiamondAnimation(rec.senderId, rec.recieveId, rec.amount);
    }

    protected ProtocolHoldemGetMsgHandler(rec: ServerMessageGetMsg.AsObject) {
        if (rec == null) {
            return;
        }
        let json: string;
        try {
            const _bin = atob(rec.extra.toString());
            const _u8 = new Uint8Array(_bin.length);
            for (let i = 0; i < _bin.length; i++) _u8[i] = _bin.charCodeAt(i);
            json = new TextDecoder('utf-8').decode(_u8);
        } catch (e) {
            console.warn('[GetMsg] extra decode error:', e);
            return;
        }
        let responseData: { code: number; data: string };
        try {
            responseData = Broadcast.Response(json);
        } catch (e) {
            console.warn('[GetMsg] JSON parse error, raw json:', json?.substring(0, 200));
            return;
        }
        let code: number = responseData.code;
        let data: string = responseData.data;
        switch (code) {
            case BroadcastCode.BroadcastMsg:
            case 10001:
                var broadcastMsg = BroadcastMsg.Response(data);
                {
                    const EMOJI_TYPE_BASE = Def.ConsumeType.CT_EMOJI_1 * 100;
                    const emojiOffset = broadcastMsg.type - EMOJI_TYPE_BASE;
                    if (emojiOffset >= 0 && emojiOffset < 15) {
                        const emojiIndex = emojiOffset + 1;
                        const seat = this.game?.GetSeatByUserId(broadcastMsg.user_id);
                        if (seat) {
                            seat.ShowEmojiAnimation(emojiIndex);
                        }
                    }
                }
                // 扔道具处理 (type 600-611)
                {
                    const PROP_TYPE_BASE = Def.ConsumeType.CT_EMOJI_2 * 100; // 600
                    const propOffset = broadcastMsg.type - PROP_TYPE_BASE;
                    if (propOffset >= 0 && propOffset < 12) {
                        this.game?.throwPropMgr?.handlePropMessage(broadcastMsg);
                    }
                }
                // 聊天/弹幕消息转发给 ChatManager (type=0 为聊天文本)
                {
                    ChatManager.Instance.handleBroadcastMsg(broadcastMsg);
                }
                break;
            case BroadcastCode.BroadcastVoiceprint:
                // var VoiceprintData = VoiceprintMsg.Response(responseData.data);
                // 	Seat mSeat = GameCache.Instance.CurGame.GetSeatByUserId((uint)VoiceprintData.suspect_rid);
                // if (mSeat != null) {
                //     mSeat.Player.VoiceprintId = VoiceprintData.verify_id;
                // }
                // switch (VoiceprintData.msg_type) {
                //     case 1:
                //         //1 - 发给嫌疑人,
                //         if (mainPlayer.seatID > -1 && mainPlayer.userID == VoiceprintData.suspect_rid) {
                //             cacheVoiceprintMsgId = VoiceprintData.verify_id;
                //             HandleVerifiedStatus(VoiceprintData);
                //         }
                //         break;
                //     case 2:
                //         //2 - 发给房间内所有人
                //         ShowVoiceprintMsgObj(VoiceprintData);
                //         break;
                //     default:
                //         break;
                // }
                break;
            // TODO: SeatFriendBringInApply / SeatClubBringInApply / BringInApplyMsg 待协议定义后启用
            // case BroadcastCode.SeatFriendBringInApply://朋友桌申请带入
            // case BroadcastCode.SeatClubBringInApply://公会桌申请带入
            //     var BringInApplyData = BringInApplyMsg.Response(responseData.data);
            //     if (BringInApplyData.status == 2) {
            //         UIComponent.Instance.ToastLanguage("UITexas_FriendtableapplyBringinTips003");
            //     }
            //     else if (BringInApplyData.status == 3) {
            //         UIComponent.Instance.ToastLanguage("UITexas_FriendtableapplyBringinTips002");
            //     }
            //     else if (BringInApplyData.status == 1) {
            //         UIComponent.Instance.ToastLanguage("UITexas_FriendtableapplyBringinTips001");
            //     }
            //     break;
            // case BroadcastCode.SeatFriendApplyRefreshMsgNum:
            // case BroadcastCode.SeatClubApplyRefreshMsgNum:
            //     //牌桌
            //     if (SceneManager.Instance.currUI.getComponent(UIBase).name == "UITexas") {
            //         this.game?.UpdateMsgBtnSprite();
            //     }
            //     //{"code":2001,"data":"{\"room_id\":90619954,\"user_id\":6922,\"bring_in\":200,\"status\":1,\"origin_type\":4}"}
            //     break;
            default:
                break;
        }
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
            if (playerChipChange.chips > 0) {
                mSeat.Player.KeepSeatLeftTime = -1;
            }
            mSeat.Player.MttHunterKillAwardOtherPlus += playerChipChange.mttHunterHeadPlus;
            mSeat.UpdateHunterAward();
            if (this.game.mainPlayer.seatID == this.game.GetLocalSeatID(playerChipChange.seatId)) {
                if (
                    playerChipChange.reason == Def.ChipChangeReason.CC_MTT_ADD_ON ||
                    playerChipChange.reason == Def.ChipChangeReason.CC_MTT_ADD_ON_PLUS_MODE1 ||
                    playerChipChange.reason == Def.ChipChangeReason.CC_MTT_ADD_ON_PLUS_MODE2
                ) {
                    UIComponent.Instance.Toast(StringHelper.Format(i18nMgr.Get('Addondz'), [StringHelper.GetSignedLongString(playerChipChange.change)]));
                }
                UIComponent.Instance.HideUI(PrefabUI.UIBringOut);
                this.game.mainPlayer.cacheStoreChips = playerChipChange.storeChips;
            }
            mSeat.FsmLogicComponent.SM.ChangeState(SeatAddChips.Instance);
        });
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
        UIComponent.Instance.ShowUI(PrefabUI.UIOutChipsTipComponent, new UIOutChipsTipComponent.OutClipstipData(rec.status, this.game.cacheOutChips));
        this.game.cacheOutChips = 0;
        UIComponent.Instance.HideUI(PrefabUI.UIBringOut);
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
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status)); //CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_GAME_ADD_CHIPS, rec.Status)
            return;
        }
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        if (null == mSeat) {
            return;
        }
        mSeat.Player.chips = rec.chips;
        //UIComponent.Instance.HideUI(PrefabUI.UIAddChipsComponent);
        UIComponent.Instance.HideUI(PrefabUI.UIBringIn);
        mSeat.FsmLogicComponent.SM.ChangeState(SeatAddChips.Instance);
        mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
        // 补充筹码成功后的 toast（对齐 Unity OnMsgBringIn → SetUCBringInTips(false, chips)）
        // seated=false: 由 SetUCBringInTips 内部按 isPlaying 判断弹"下一手前完成带入"
        this.game.SetUCBringInTips(false, rec.chips);
    }

    /** 主动加入/退出鱿鱼轮返回 */
    protected HANDLER_REQ_SQUID_IN_ACTIVE(rec: ServerMessageSquidInActive.AsObject): void {
        if (!rec) return;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
        }
    }

    /** 鱿鱼加入状态广播 */
    protected HANDLER_REQ_SQUID_IN(rec: ServerMessageSquidIn.AsObject): void {
        if (!rec) return;
        const meServerSeatID = this.game.mainPlayer?.seatID >= 0 ? this.game.GetRemoteSeatID(this.game.mainPlayer.seatID) : -1;
        console.log('[SquidIn] recv', {
            seatId: rec.seatId,
            enable: rec.enable,
            firstIn: rec.firstIn,
            meServerSeatID,
            isMe: rec.seatId === meServerSeatID
        });
        const seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(rec.seatId));
        if (!seat?.Player) return;
        seat.Player.inSquid = rec.enable;
        seat.Player.squidEscaped = false;
        if (rec.enable) {
            seat.Player.squidRoundSeated = true;
        } else {
            seat.Player.squidCount = 0;
            seat.ClearSquidTag();
        }
        if (rec.squidTotalLimit > 0) {
            this.game.squidTotalLimit = rec.squidTotalLimit;
        }
        this.game.RefreshSquidMarks();
        this.game.UpdateRoomDes();
    }

    /** 下一手配置变化（鱿鱼开关/价值） */
    protected HANDLER_REQ_NEXT_CHANGE(rec: ServerMessageNextChange.AsObject): void {
        if (!rec) return;
        if (rec.squidBase > 0) {
            this.game.squidBase = rec.squidBase;
            this.game.squidEnabled = true;
        }
        if (rec.squidOpen) {
            this.game.squidEnabled = true;
        }
        if (rec.squidTotalLimit > 0) {
            this.game.squidTotalLimit = rec.squidTotalLimit;
        }
        if (this.game.squidEnabled) {
            if (rec.squidOpen && !this.game.isGameInSquidRound) {
                this.game.PlaySquidRoundStartAnim();
                this.game.squidPool = 0;
            } else if (!rec.squidOpen && this.game.isGameInSquidRound) {
                this.game.PlaySquidRoundEndAnim();
                this.game.ResetSquidRoundState();
            } else {
                this.game.UpdateRoomDes();
            }
        } else if (this.game.criticalHitEnabled) {
            const prevCriticalHitOpen = this.game.isCriticalHitOpen;
            this.game.isCriticalHitOpen = !!rec.criticalHitOpen;
            if (!prevCriticalHitOpen && this.game.isCriticalHitOpen) {
                this.game.PlayCriticalHitStartAnim();
            }
            this.game.UpdateRoomDes();
        }
        //todo 以后已该逻辑为准
        if (GameCache.Instance._texasData._isSquidEnable) {
            if (GameCache.Instance._texasData._squidMode == 1) {
                GameCache.Instance._texasData._squidMaxNum = rec.squidTotalLimit;
            } else {
                GameCache.Instance._texasData._isGameInSquidRoundReal = false;
            }
        } else {
            if (GameCache.Instance._texasData._isCriticalHitEnable) {
                GameCache.Instance._texasData._isCriticalHitOpen = rec.criticalHitOpen;
                if (rec.criticalHitOpen) {
                }
            }
        }
    }

    /// <summary>
    /// 保险触发
    /// </summary>
    /// <param name="response"></param>
    public HANDLER_REQ_INSURANCE_TRIGGED(rec: ServerMessageInsuranceTrigged.AsObject) {
        // rec = {"round":2,"operatorList":[{"seatId":1,"actionsList":[],"insuranceLimitList":[{"potId":0,"potAmount":400000,"bet":200000,"max":100000,"min":1,"insuranced":0,"outs":6,"outsDetailList":[{"seatId":2,"outsCardsList":[{"card":26,"isEqual":false},{"card":11,"isEqual":false},{"card":28,"isEqual":false},{"card":41,"isEqual":false},{"card":13,"isEqual":false},{"card":58,"isEqual":false}]}],"potUserCount":2,"potLeaderCount":1}],"leftOpTime":30,"delayTimes":0,"shortcutsList":[],"isInsurance":true,"isAgreeSecondPc":false,"opDeadline":1667618865}]};
        if (rec == null) {
            return;
        }
        GameCache.Instance.CurGame.cacheRound = rec.round;
        if (rec.operatorList == null || rec.operatorList.length == 0) {
            if (rec.invalidPotsList && rec.invalidPotsList.length > 0) {
                for (const invalidPot of rec.invalidPotsList) {
                    switch (invalidPot.reason) {
                        case Def.IIReason.IIR_ZERO_OUTS:
                        case Def.IIReason.IIR_NO_ODDS_FOUND: {
                            const outsNum = (GameUtil.OutsList.get(invalidPot.potUserCount) ?? []).length;
                            UIComponent.Instance.Toast(
                                i18nMgr.Get('adaptation20005') +
                                    (invalidPot.potId + 1) +
                                    ':' +
                                    StringHelper.Format(i18nMgr.Get('UIInsuranceReasonTips1'), [outsNum])
                            );
                            break;
                        }
                        case Def.IIReason.IIR_NO_ODDS_TABLE_FOUND:
                            UIComponent.Instance.Toast(i18nMgr.Get('adaptation20005') + (invalidPot.potId + 1) + ':' + i18nMgr.Get('UIInsuranceReasonTips2'));
                            break;
                        case Def.IIReason.IIR_EV_LIMIT:
                            UIComponent.Instance.Toast(i18nMgr.Get('UIEVInsuranceTips5'));
                            break;
                        default:
                            UIComponent.Instance.Toast(i18nMgr.Get('Purchase_insurance'));
                            break;
                    }
                }
            } else {
                UIComponent.Instance.Toast(i18nMgr.Get('Purchase_insurance'));
            }
            return;
        }
        this.HandlerInsueranceData(rec.operatorList);
    }

    /// <summary>
    /// 保险数据处理
    /// </summary>
    /// <param name="operators"></param>
    public HandlerInsueranceData(operators: Operator.AsObject[]) {
        //显示玩家买保险动画，及如果有自己，缓存操作数据。
        let CanInsurance = false;
        let Seat: Seat = null;
        let mOperator: Operator.AsObject = null;
        for (let itemOperator of operators) {
            Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(itemOperator.seatId));
            if (Seat?.Player) {
                Seat.Player.playerStatus_insurance = itemOperator.isInsurance;
                Seat.Player.timeLeft_insurance = itemOperator.leftOpTime;
                Seat.Player.delayTimes = itemOperator.delayTimes;
                if (Seat.Player.userID == this.game.mainPlayer.userID && Seat.Player.playerStatus_insurance) {
                    mOperator = itemOperator;
                    CanInsurance = true;
                }
                if (Seat.Player.playerStatus_insurance) {
                    Seat.FsmLogicComponent.SM.ChangeState(SeatInsurance.Instance);
                }
            }
        }
        let mTweenCallback = () => {
            if (!CanInsurance || mOperator == null)
                // 如果可购买保险用户中没有自己，不用往下执行
                return;
            //List < UIInsuranceComponent.WrapTriggerInsuranceData > wrapTriggedInsuranceDatas = new List<UIInsuranceComponent.WrapTriggerInsuranceData>();
            let wrapTriggedInsuranceDatas: WrapTriggerInsuranceData[] = [];
            //UIInsuranceComponent.WrapTriggerInsuranceData mWrapTriggerInsuranceData = null;
            let mWrapTriggerInsuranceData: WrapTriggerInsuranceData = null;
            mOperator.insuranceLimitList.forEach(insurancePotLimit => {
                mWrapTriggerInsuranceData = new WrapTriggerInsuranceData();
                mWrapTriggerInsuranceData.outsPerUser = [];
                mWrapTriggerInsuranceData.userNames = [];
                mWrapTriggerInsuranceData.userIds = [];
                mWrapTriggerInsuranceData.playerCards = [];
                mWrapTriggerInsuranceData.outsCards = [];
                //赋值保险池等数据，
                mWrapTriggerInsuranceData.subPot = insurancePotLimit.potId;
                mWrapTriggerInsuranceData.pot = insurancePotLimit.potAmount;
                mWrapTriggerInsuranceData.potTotalCost = insurancePotLimit.bet;
                mWrapTriggerInsuranceData.leastAmount = insurancePotLimit.min;
                mWrapTriggerInsuranceData.mostAmount = insurancePotLimit.max;
                mWrapTriggerInsuranceData.odds = insurancePotLimit.odds;
                mWrapTriggerInsuranceData.potUserCount = insurancePotLimit.potUserCount;
                mWrapTriggerInsuranceData.potLeaderCount = insurancePotLimit.potLeaderCount;
                GameCache.Instance._texasData._buyInsurancePotUserCount.set(insurancePotLimit.potId, insurancePotLimit.potUserCount);
                mWrapTriggerInsuranceData.insuranced = insurancePotLimit.insuranced;
                mWrapTriggerInsuranceData.potAllowOutSelection = insurancePotLimit.insuranced > 0 ? 0 : 1;
                for (let userOuts of insurancePotLimit.outsDetailList) {
                    let ins_Seat: Seat = this.game.GetSeatByLocalSeatID(this.game.GetLocalSeatID(userOuts.seatId));
                    if (ins_Seat == null) {
                        console.log('---------------------Insurance others player is null');
                        continue;
                    }
                    //需要显示玩家手牌和名字，通过座位号在牌局中缓存座位，获取已下发得手牌和名字。
                    mWrapTriggerInsuranceData.userNames.push(ins_Seat.Player.nick);
                    mWrapTriggerInsuranceData.userIds.push(ins_Seat.Player.userID);
                    mWrapTriggerInsuranceData.playerCards.push(ins_Seat.Player.cards);
                    //各个玩家
                    mWrapTriggerInsuranceData.outsPerUser.push(userOuts.outsCardsList.length);
                    //添加所有玩家outs ，在保险界面处理是否平分outs
                    mWrapTriggerInsuranceData.outsCards.push(userOuts.outsCardsList);
                }
                wrapTriggedInsuranceDatas.push(mWrapTriggerInsuranceData);
            });
            let data: InsuranceData = new InsuranceData();
            data.publicCards = this.game.GetPublicCards(1);
            data.triggedDatas = wrapTriggedInsuranceDatas;
            data.timeLeft = this.game.mainPlayer.timeLeft_insurance;
            data.delayTimes = this.game.mainPlayer.delayTimes;
            data.round = this.game.cacheRound;
            UIComponent.Instance.ShowUI(PrefabUI.UIInsuranceNewPanel, data);
        };
        mTweenCallback();
    }

    //同意补盲
    HANDLER_REQ_WAIT_BLIND(rec: ServerMessageAgreePost.AsObject) {
        if (rec == null) return;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status)); //CPErrorCode.RoomErrorDescription(HotfixOpcode.REQ_WAIT_BLIND, rec.Status)
            return;
        }
        this.game.HideWaitBlindBtn();
        let mSeat: Seat = this.game.GetSeatByLocalSeatID(this.game.mainPlayer.seatID);
        UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(20021));
        if (null != mSeat) {
            mSeat.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
        }
    }

    //主动购买保险
    HANDLER_REQ_BUY_INSURANCE(rec: ServerMessageBuyInsuranceActive.AsObject) {
        if (rec == null) return;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
        }
    }

    //保险赔付
    HANDLER_REQ_CLAIM_INSURANCE(rec: ServerMessageBuyInsurance.AsObject) {
        if (rec == null) return;
        this.game.cacheTrunOutsCards = new Map<number, number[]>();
        rec.buyList.forEach(potInsuranceBuy => {
            if (potInsuranceBuy.activeAmount > 0) {
                let mSeat: Seat = this.game.GetSeatByServerSeatID(rec.seatId);
                mSeat.Player.totalInsuredAmount = potInsuranceBuy.activeAmount;
                mSeat.Player.autoInsuredAmount = potInsuranceBuy.passiveAmount;
                mSeat.HideBubbleInsuranceCountDown();
                mSeat.UpdateBubbleInsurance();
                let mouts: number[] = [];
                for (let j = 0; j < potInsuranceBuy.activeOutsList.length; j++) {
                    mouts.push(potInsuranceBuy.activeOutsList[j]);
                }
                this.game.cacheTrunOutsCards.set(rec.seatId, mouts);
                if (this.game.GetLocalSeatID(rec.seatId) == this.game.mainPlayer.seatID) {
                    const insuranceMode = GameCache.Instance._texasData._insuranceMode;
                    if (insuranceMode === Def.IsuranceMode.IM_NORMAL || insuranceMode === Def.IsuranceMode.IM_NEW_NORMAL) {
                        const potUserCount =
                            GameCache.Instance._texasData._buyInsurancePotUserCount.get(potInsuranceBuy.potId) ?? this.game.cacheBuyInsurancePotUserCount;
                        this.game.cacheBuyInsurancePotUserCount = potUserCount;
                        this.game.cacheBuyActiveAmount = potInsuranceBuy.activeAmount;
                        if (this.game.uirc.Image_InsuranceTips.activeInHierarchy) {
                            this.game.uirc.Image_InsuranceTips.active = false;
                        }
                        this.game.uirc.ShowInsuranceTip(
                            potInsuranceBuy.activeOutsList.length,
                            potInsuranceBuy.activeAmount,
                            GameUtil.GetOddsByPlayerNum(potUserCount, potInsuranceBuy.activeOutsList.length) * potInsuranceBuy.activeAmount
                        );
                    }
                }
            }
            if (potInsuranceBuy.passiveAmount > 0 && this.game.GetLocalSeatID(rec.seatId) == this.game.mainPlayer.seatID) {
                UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(20053, [potInsuranceBuy.passiveAmount / 100]));
            }
        });
    }

    // 所有人收到有人是否允许的结果信息 (同意|拒绝发送第二套公共牌)
    protected Protocol_Holdem_AgreeSecondPcsHandler(rec: ServerMessageAgreeSecondPcs.AsObject) {
        if (rec == null) return;
        let seatId: number = this.game.GetLocalSeatID(rec.seatId);
        GC.notify.post(GGEvent.AgreeSecondPcsRefresh, seatId, rec.result);
    }

    //是否允许第2套公共牌触发信息
    Protocol_Holdem_AgreeSecondPcsTriggedHandler(rec: ServerMessageAgreeSecondPcsTrigged.AsObject) {
        if (rec == null) return;
        rec.operatorList.forEach((Operator: Operator.AsObject) => {
            if (this.game.GetLocalSeatID(Operator.seatId) == this.game.mainPlayer.seatID && Operator.isAgreeSecondPc) {
                let data = new UIAgreeSecondPcsComponent.AgreeSecondData();
                data.title = i18nMgr.Get('UIAgreeSecondPcs_title');
                data.content = i18nMgr.Get('UIAgreeSecondPcs_agree');
                data.contentCommit = i18nMgr.Get('adaptation20085');
                data.contentCancel = i18nMgr.Get('adaptation10334');
                data.SecondPcsTime = Operator.leftOpTime;
                data.actionCommit = () => {
                    this.game.TexasGameUtils.RequestAgreeSecondPcsActive(true);
                };
                data.actionCancel = () => {
                    this.game.TexasGameUtils.RequestAgreeSecondPcsActive(false);
                };
                UIComponent.Instance.ShowUI(PrefabUI.UIAgreeSecondPcsComponent, data);
            }
        });
    }

    //当前玩家操作是否同意第二套公共牌返回结果
    ProtocolHoldemAgreeSecondPcsActiveHandler(rec: ServerMessageAgreeSecondPcsActive.AsObject) {
        if (rec == null) return;
        if (rec.status != 0) {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
        }
    }

    // ==================== 视频房间相关 ====================
    /**
     * 进房成功后调用，加入 Agora 视频频道
     * 放在 EnterRoom_Handler 里确保场景和协议都已就绪
     */
    public async JoinVideoChannelAfterEnterRoom(): Promise<void> {
        try {
            await this.JoinVideoChannelIfNeed();
        } catch (e) {
            console.error('[VideoRoom] JoinVideoChannelAfterEnterRoom 异常:', e);
        }
    }

    /**
     * 进入房间时加入 Agora 视频频道
     * 注册远端回调，可以立即看到已坐下的其他玩家视频
     */
    private async JoinVideoChannelIfNeed(): Promise<void> {
        const videoModel = GameCache.Instance._videoModel;
        console.log('[VideoRoom] JoinVideoChannelIfNeed _videoModel=', videoModel);
        if (videoModel === VideoModel.NONE) {
            console.log('[VideoRoom] 非视频房间，跳过');
            return;
        }
        console.log('[VideoRoom] 视频房间，videoModel:', videoModel, '，开始加入频道');
        const agora = AgoraManager.Instance;
        // 防御性清理：确保上一次 LeaveVideoChannel（可能未被 await）已完成
        if (agora.isJoined) {
            console.warn('[VideoRoom] 上一次频道尚未离开，先执行清理');
            await this.LeaveVideoChannel();
        }
        // 等 Agora SDK 加载完成（最多等 10 秒）
        if (!agora.isSDKReady) {
            console.log('[VideoRoom] Agora SDK 未加载，等待...');
            for (let i = 0; i < 100; i++) {
                await new Promise<void>(r => setTimeout(r, 100));
                if (agora.isSDKReady) break;
            }
            if (!agora.isSDKReady) {
                console.error('[VideoRoom] Agora SDK 加载超时（10秒），跳过');
                return;
            }
            console.log('[VideoRoom] Agora SDK 已加载');
        }
        agora.init();
        const roomId = GameCache.Instance._currentRoomID || GameCache.Instance.room_id;
        const channelName = 'rtc_d_1-0-' + roomId;
        const uid = GameCache.Instance.nUserId || GameCache.Instance.userId || 0;
        console.log('[VideoRoom] 加入频道:', channelName, 'uid:', uid);
        const joined = await agora.join(channelName, undefined, uid);
        if (!joined) {
            console.error('[VideoRoom] 加入频道失败');
            return;
        }
        // 注册远端视频回调
        agora.onRemoteVideo = this._onRemoteVideo.bind(this);
        agora.onRemoteVideoUnsubscribed = this._onRemoteVideoUnsubscribed.bind(this);
        agora.onUserLeft = this._onRemoteUserLeft.bind(this);
        // 注册远端音频回调：远端开关麦克风时刷新图标状态
        agora.onRemoteAudio = this._onRemoteAudio.bind(this);
        // 注册重连回调：重连成功后重新渲染远端视频
        agora.onReconnected = this._onAgoraReconnected.bind(this);
        // 注册错误回调：SDK 放弃重连时清理 UI 状态
        agora.onError = this._onAgoraError.bind(this);
        // 注册音量监控回调：检测谁在说话，更新麦克风图标
        agora.onActiveSpeaker = this._onActiveSpeaker.bind(this);
        agora.startVolumeMonitor();
        // 渲染已在座位上的远端玩家视频
        this._renderAllExistingRemoteVideos();
        // 频道加入时如果自己已坐下，自动渲染本地视频（处理坐下比频道加入早的时序问题）
        const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
        if (mySeat && GameCache.Instance._videoModel !== VideoModel.NONE) {
            console.log('[VideoRoom] 频道就绪时自己已坐下，补渲染本地视频');
            this.renderLocalVideoOnMySeat().then(ok => {
                if (!ok) {
                    ToastManager.Instance.showToast('无法开启摄像头，请检查浏览器权限后重新入座');
                    setTimeout(() => {
                        this.game.TexasGameUtils.LeaveRoom();
                    }, 3000);
                }
            });
        }
        // 麦序模式：应用可见性规则（仅显示当前操作者）
        if (GameCache.Instance._videoModel === VideoModel.SEQUENCE) {
            this._sequenceSyncRemoteVideos(this.game?.operationID ?? -1);
        }
        // 初始化所有座位的麦克风图标状态
        this._refreshAllMicIcons();
        console.log('[VideoRoom] 频道就绪，等待远端视频');
    }

    /**
     * 离开房间时退出 Agora 频道
     */
    private async LeaveVideoChannel(): Promise<void> {
        // 清理随机验证相关定时器（延迟倒计时 + 验证倒计时）
        this._clearRandomVideoTimer();
        GameCache.Instance._randomVideoActive = false;
        GameCache.Instance._randomVideoEndTime = 0;
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        // 停止所有座位的视频渲染（防御性遍历）
        try {
            if (this.game?.listSeat) {
                this.game.listSeat.forEach((seat: Seat) => {
                    try {
                        if (seat?.uirc?.Raw_Head?.node?.isValid) {
                            const vr = seat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
                            if (vr) {
                                vr.onRenderStopped = null; // 先清回调，防止 stopRender 触发异步 disableCamera
                                vr.stopRender();
                            }
                        }
                    } catch (_) {
                        /* 单个座位清理失败不影响其他 */
                    }
                });
            }
        } catch (_) {
            /* listSeat 可能不可用 */
        }
        // 显式关闭摄像头和麦克风（同步 await，确保在 leave 前完成）
        await agora.disableCamera();
        agora.disableMic();
        // 清除所有回调
        agora.onRemoteVideo = null;
        agora.onRemoteVideoUnsubscribed = null;
        agora.onUserLeft = null;
        agora.onRemoteAudio = null;
        agora.onReconnected = null;
        agora.onError = null;
        agora.onActiveSpeaker = null;
        agora.stopVolumeMonitor();
        // 清理所有座位的麦克风图标
        this._hideAllMicIcons();
        // 重置视频按钮状态
        this.game?.uirc?.resetVideoButtons();
        // 清理窗花纹理缓存
        AgoraVideoRender.clearMaskCache();
        await agora.leave();
        console.log('[VideoRoom] 已离开视频频道');
    }

    // ==================== 麦序模式视频控制 ====================
    /**
     * 麦序模式：操作者切换时强制开关视频
     * 使用序列号防止并发竞态：新调用会自动取消旧调用的后续操作
     * @param operatorSeatId 当前操作者的本地座位ID，-1 表示无人操作（本手结束）
     */
    public async onSequenceOperatorChange(operatorSeatId: number): Promise<void> {
        if (GameCache.Instance._videoModel !== VideoModel.SEQUENCE) return;
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        // 递增序列号，使之前正在执行的旧调用在 await 后自动放弃
        const seq = ++this._sequenceOpSeq;
        const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
        const isMyTurn = operatorSeatId !== -1 && mySeat && operatorSeatId === mySeat.seatID;
        if (isMyTurn) {
            // 轮到自己操作：强制开启摄像头
            GameCache.Instance._sequenceVideoActive = true;
            console.log('[SequenceVideo] 轮到操作，强制开启摄像头, seq:', seq);
            await this.renderLocalVideoOnMySeat();
            if (seq !== this._sequenceOpSeq) {
                console.log('[SequenceVideo] 已被更新的操作者切换取消（开启后）, seq:', seq);
                return;
            }
            this.game?.uirc?.syncVideoButtonsFromAgora();
        } else {
            // 不是自己的操作轮次：强制关闭摄像头
            GameCache.Instance._sequenceVideoActive = false;
            console.log('[SequenceVideo] 非操作轮次，强制关闭摄像头, seq:', seq);
            // 停止本地视频渲染（同步，无竞态）
            if (mySeat?.uirc?.Raw_Head?.node?.isValid) {
                const vr = mySeat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
                if (vr) {
                    vr.onRenderStopped = null;
                    vr.stopRender();
                }
            }
            await agora.disableCamera();
            if (seq !== this._sequenceOpSeq) {
                console.log('[SequenceVideo] 已被更新的操作者切换取消（关闭后）, seq:', seq);
                return;
            }
            this.game?.uirc?.syncVideoButtonsFromAgora();
        }
        // 更新所有远端视频：只渲染当前操作者，关闭其他人
        this._sequenceSyncRemoteVideos(operatorSeatId);
    }

    /**
     * 麦序模式：同步远端视频渲染状态
     * 只渲染当前操作者的远端视频，关闭其他所有人的远端视频
     */
    private _sequenceSyncRemoteVideos(operatorSeatId: number): void {
        if (!this.game?.listSeat) return;
        this.game.listSeat.forEach((seat: Seat) => {
            if (!seat?.Player || seat.IsMySeat || !seat.uirc?.Raw_Head?.node?.isValid) return;
            const vr = seat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
            const isOperator = seat.seatID === operatorSeatId;
            if (isOperator) {
                // 当前操作者：渲染远端视频
                const uid = seat.Player.userID;
                console.log('[SequenceVideo] 渲染操作者远端视频, uid:', uid);
                this._renderRemoteVideoOnSeat(uid);
            } else {
                // 非操作者：停止远端视频渲染
                if (vr?.isRendering) {
                    console.log('[SequenceVideo] 停止非操作者远端视频, uid:', seat.Player.userID);
                    vr.stopRender();
                }
            }
        });
    }

    /**
     * 自己坐下后渲染本地摄像头到自己的头像
     */
    public async renderLocalVideoOnMySeat(): Promise<boolean> {
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return false;
        // 开启本地摄像头并发布视频（Agora 内部调用 getUserMedia 创建 track）
        const cameraOk = await agora.enableCamera();
        if (!cameraOk) {
            console.error('[VideoRoom] 开启摄像头失败');
            return false;
        }
        // 复用 Agora 已创建的 localVideoTrack，不再重复调 getUserMedia
        const rawTrack = agora.localVideoTrack?.getMediaStreamTrack?.();
        if (!rawTrack) {
            console.error('[VideoRoom] 获取本地视频 MediaStreamTrack 失败');
            return false;
        }
        const mySeat = this.game.listSeat.find((s: Seat) => s.IsMySeat);
        if (!mySeat || !mySeat.uirc?.Raw_Head) {
            console.warn('[VideoRoom] 未找到自己的座位或头像节点');
            return false;
        }
        const headNode = mySeat.uirc.Raw_Head.node;
        let videoRender = headNode.getComponent(AgoraVideoRender);
        if (!videoRender) {
            videoRender = headNode.addComponent(AgoraVideoRender);
            videoRender.renderTarget = 'local';
            videoRender.mirror = true;
            videoRender.targetFps = 15;
        }
        // 先清回调，防止 stopRender 触发旧的 onRenderStopped 干扰新渲染
        videoRender.onRenderStopped = null;
        const rendered = await videoRender.renderFromTrack(rawTrack);
        console.log('[VideoRoom] 本地视频渲染:', rendered ? '成功' : '失败');
        if (rendered) {
            // 注册渲染停止回调：同步按钮状态（不调 disableCamera，避免退房时异步竞态）
            videoRender.onRenderStopped = () => {
                console.log('[VideoRoom] 本地视频渲染已停止，同步按钮状态');
                this.game?.uirc?.syncVideoButtonsFromAgora();
            };
            this.game.uirc?.syncVideoButtonsFromAgora();
            // 设置窗花贴纸
            videoRender.setVideoMaskId(this.game.mainPlayer.videoMaskId);
        }
        return rendered;
    }

    /**
     * 渲染当前已坐下的远端玩家视频（进入房间时可能已有玩家在座位上）
     * 无条件渲染，麦序模式的可见性由 _sequenceSyncRemoteVideos 统一管理
     */
    private _renderAllExistingRemoteVideos(): void {
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        const remoteUsers = agora.getRemoteUsers();
        if (remoteUsers.length === 0) return;
        this.game.listSeat.forEach((seat: Seat) => {
            if (!seat?.Player || !seat.uirc?.Raw_Head) return;
            const uid = seat.Player.userID;
            const remoteUser = remoteUsers.find(u => u.uid === uid && u.hasVideo);
            if (remoteUser) {
                console.log('[VideoRoom] 发现已坐下的远端玩家, uid:', uid);
                this._renderRemoteVideoOnSeat(uid);
            }
        });
    }

    /**
     * 远端用户发布视频回调
     * 无条件渲染远端视频到对应座位，麦序模式的可见性由 _sequenceSyncRemoteVideos 统一管理
     */
    /**
     * 远端音频发布回调：远端用户开关麦克风时刷新图标状态
     */
    private _onRemoteAudio(uid: number, track: any): void {
        console.log('[VideoRoom] 收到远端音频, uid:', uid, 'hasTrack:', !!track);
        this._refreshAllMicIcons();
    }

    private _onRemoteVideo(uid: number, track: any): void {
        console.log('[VideoRoom] 收到远端视频, uid:', uid);
        this._renderRemoteVideoOnSeat(uid);
    }

    /**
     * 将远端视频渲染到对应 uid 的座位头像上
     */
    private _renderRemoteVideoOnSeat(uid: number): void {
        const seat = this.game?.listSeat?.find((s: Seat) => s.Player && s.Player.userID === uid);
        if (!seat) {
            console.warn('[VideoRoom] 未找到 uid:', uid, '对应的座位，等待玩家坐下后渲染');
            return;
        }
        if (!seat.uirc?.Raw_Head?.node?.isValid) {
            console.warn('[VideoRoom] 座位头像节点不存在, uid:', uid);
            return;
        }
        const headNode = seat.uirc.Raw_Head.node;
        let videoRender = headNode.getComponent(AgoraVideoRender);
        if (!videoRender) {
            videoRender = headNode.addComponent(AgoraVideoRender);
            videoRender.renderTarget = 'remote';
            videoRender.remoteUid = uid;
            videoRender.targetFps = 15;
        }
        // 先停掉旧的渲染（可能是上一轮的最后一帧残留），再重新渲染
        if (videoRender.isRendering) {
            console.log('[VideoRoom] 远端视频已在渲染中，先停止再重新渲染, uid:', uid);
            videoRender.onRenderStopped = null;
            videoRender.stopRender();
        }
        videoRender
            .renderRemoteUser(uid)
            .then(ok => {
                console.log('[VideoRoom] 远端视频渲染 uid:', uid, ok ? '成功' : '失败');
                if (ok && seat?.Player) {
                    videoRender.setVideoMaskId(seat.Player.videoMaskId);
                }
            })
            .catch(e => {
                console.warn('[VideoRoom] 远端视频渲染异常, uid:', uid, e);
            });
    }

    /**
     * 远端用户离开频道回调
     */
    private _onRemoteUserLeft(uid: number): void {
        console.log('[VideoRoom] 远端用户离开, uid:', uid);
        try {
            const seat = this.game?.listSeat?.find((s: Seat) => s.Player && s.Player.userID === uid);
            if (!seat?.uirc?.Raw_Head?.node?.isValid) return;
            const videoRender = seat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
            if (videoRender) {
                videoRender.stopRender();
                console.log('[VideoRoom] 已停止远端视频渲染, uid:', uid);
            }
        } catch (e) {
            console.warn('[VideoRoom] 远端用户离开处理异常, uid:', uid, e);
        }
    }

    /**
     * 远端视频被取消订阅回调（用户点击屏蔽远端视频时触发）
     * 停止该座位的视频渲染，恢复显示头像
     */
    private _onRemoteVideoUnsubscribed(uid: number): void {
        console.log('[VideoRoom] 远端视频取消订阅, uid:', uid);
        try {
            const seat = this.game?.listSeat?.find((s: Seat) => s.Player && s.Player.userID === uid);
            if (!seat?.uirc?.Raw_Head?.node?.isValid) return;
            const videoRender = seat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
            if (videoRender) {
                videoRender.stopRender();
                console.log('[VideoRoom] 已停止远端视频渲染（取消订阅）, uid:', uid);
            }
        } catch (e) {
            console.warn('[VideoRoom] 远端视频取消订阅处理异常, uid:', uid, e);
        }
    }

    /**
     * 其他玩家坐下时检查是否需要渲染远端视频（视频先到、玩家后坐下的时序）
     * 无条件渲染，麦序模式的可见性由 _sequenceSyncRemoteVideos 统一管理
     */
    private TryRenderRemoteVideoForSeat(seat: Seat): void {
        if (GameCache.Instance._videoModel === VideoModel.NONE) return;
        if (!seat?.Player || !seat.uirc?.Raw_Head) return;
        const uid = seat.Player.userID;
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        const remoteUsers = agora.getRemoteUsers();
        const remoteUser = remoteUsers.find(u => u.uid === uid && u.hasVideo);
        if (!remoteUser) return;
        console.log('[VideoRoom] 玩家坐下后发现已有视频, uid:', uid);
        this._renderRemoteVideoOnSeat(uid);
    }

    /**
     * Agora 重连成功回调
     * SDK 重连后会自动重新触发 user-published 事件 → onRemoteVideo → 自动恢复远端视频
     * 这里只需要恢复本地视频 + 同步按钮状态
     */
    private _onAgoraReconnected(): void {
        console.log('[VideoRoom] Agora 重连成功，恢复视频');
        try {
            // 麦序模式：按当前操作者统一恢复视频状态
            if (GameCache.Instance._videoModel === VideoModel.SEQUENCE) {
                this.onSequenceOperatorChange(this.game?.operationID ?? -1);
                return;
            }
            // 非麦序模式：恢复本地视频
            const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
            if (mySeat && AgoraManager.Instance.localVideoTrack) {
                const headNode = mySeat.uirc?.Raw_Head?.node;
                if (headNode?.isValid) {
                    const vr = headNode.getComponent(AgoraVideoRender);
                    if (vr && !vr.isRendering) {
                        const rawTrack = AgoraManager.Instance.localVideoTrack.getMediaStreamTrack?.();
                        if (rawTrack && rawTrack.readyState !== 'ended') {
                            vr.renderFromTrack(rawTrack)
                                .then(ok => {
                                    console.log('[VideoRoom] 重连后本地视频恢复:', ok ? '成功' : '失败');
                                })
                                .catch(e => {
                                    console.warn('[VideoRoom] 重连后本地视频恢复异常:', e);
                                });
                        }
                    }
                }
            }
            // 同步按钮状态
            this.game?.uirc?.syncVideoButtonsFromAgora();
        } catch (e) {
            console.warn('[VideoRoom] 重连后恢复视频异常:', e);
        }
    }

    /**
     * Agora 错误回调（SDK 放弃重连 / 加入失败等）
     */
    private _onAgoraError(err: any): void {
        const code = err?.code || 'UNKNOWN';
        console.error('[VideoRoom] Agora 错误:', code, err?.message || '');
        if (code === 'CONNECTION_LOST') {
            // SDK 重连失败，频道已断开 — 停止所有渲染，关闭 track，同步 UI
            console.warn('[VideoRoom] Agora 连接彻底断开，停止视频渲染');
            try {
                if (this.game?.listSeat) {
                    this.game.listSeat.forEach((seat: Seat) => {
                        try {
                            if (seat?.uirc?.Raw_Head?.node?.isValid) {
                                const vr = seat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
                                if (vr) {
                                    vr.onRenderStopped = null;
                                    vr.stopRender();
                                }
                            }
                        } catch (_) {}
                    });
                }
            } catch (_) {}
            // 显式关闭摄像头（防止远端还能看到画面）
            AgoraManager.Instance.disableCamera().catch(() => {});
            // 重置按钮（视频不可用）
            this.game?.uirc?.resetVideoButtons();
        }
    }

    // ==================== 随机视频验证 ====================
    /**
     * 音量监控回调：当前说话者变化时更新所有座位的麦克风图标
     * @param uid 说话者的 uid，null 表示无人说话
     */
    private _onActiveSpeaker(uid: number | null): void {
        this._refreshAllMicIcons(uid);
    }

    /**
     * 刷新所有座位的麦克风图标状态（供 UITexas 麦克风开关后调用）
     */
    public refreshMicIcons(): void {
        this._refreshAllMicIcons();
    }

    /**
     * 刷新所有座位的麦克风图标状态
     * @param speakingUid 当前说话者 uid（null=无人说话），不传则从 AgoraManager 获取
     */
    private _refreshAllMicIcons(speakingUid?: number | null): void {
        const agora = AgoraManager.Instance;
        if (!agora.isJoined) return;
        const activeUid = speakingUid !== undefined ? speakingUid : agora.speakingUid;
        const remoteUsers = agora.getRemoteUsers();
        this.game?.listSeat?.forEach((seat: Seat) => {
            if (!seat?.Player || !seat.uirc) return;
            const playerUid = seat.Player.userID;
            const isMySeat = seat.IsMySeat;
            if (activeUid === playerUid) {
                seat.uirc.setMicIconState(MicIconState.SPEAKING);
            } else if (isMySeat) {
                seat.uirc.setMicIconState(agora.localAudioTrack ? MicIconState.HIDDEN : MicIconState.MUTED);
            } else {
                const remoteUser = remoteUsers.find(u => u.uid === playerUid);
                seat.uirc.setMicIconState(remoteUser?.hasAudio ? MicIconState.HIDDEN : MicIconState.MUTED);
            }
        });
    }

    /** 隐藏所有座位的麦克风图标（离开频道时调用） */
    private _hideAllMicIcons(): void {
        this.game?.listSeat?.forEach((seat: Seat) => {
            if (seat?.uirc) {
                seat.uirc.setMicIconState(MicIconState.HIDDEN);
            }
        });
    }

    /** 随机验证倒计时定时器 */
    private _randomVideoTimer: number = 0;
    /** 麦序操作者切换序列号，用于取消过期的 async 调用 */
    private _sequenceOpSeq: number = 0;
    /** 随机视频验证延迟启动定时器（收到902到真正开始验证之间的等待期） */
    private _randomVideoCountdownTimer: number = 0;

    /**
     * 解析 anti_cheat_video_config 配置
     * @returns 解析后的配置对象，解析失败返回 null
     */
    private _parseAntiCheatVideoConfig(): any | null {
        const config = GameCache.Instance._globalConfig;
        if (!config) return null;
        const raw = config.anti_cheat_video_config;
        if (!raw) return null;
        try {
            return typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
            console.warn('[RandomVideo] anti_cheat_video_config 解析失败');
            return null;
        }
    }

    /**
     * 收到 902 消息：服务器选中当前玩家进行随机视频验证
     * 流程：收到消息 → toast提示 → 等待 random_countdown 秒 → 开启验证 → 持续 random_overtime 秒 → 结束
     */
    private async HANDLER_RANDOM_VIDEO_VERIFY(rec: ServerMessageUtilAntiCheatRoomVideo.AsObject): Promise<void> {
        if (!rec) return;
        console.log('[RandomVideo] 收到随机视频验证消息, status:', rec.status, 'roomType:', rec.roomType);
        // 仅随机验证模式处理
        if (GameCache.Instance._videoModel !== VideoModel.RANDOM) {
            console.warn('[RandomVideo] 当前不是随机验证模式，忽略');
            return;
        }
        // 如果已经在验证中，不重复触发
        if (GameCache.Instance._randomVideoActive) {
            console.log('[RandomVideo] 已在验证中，忽略重复消息');
            return;
        }
        // 从全局配置读取延迟和持续时长
        const videoConfig = this._parseAntiCheatVideoConfig();
        const countdown = videoConfig?.random_countdown || 5;
        const overtime = videoConfig?.random_overtime || 30;
        console.log('[RandomVideo] 将在', countdown, '秒后开始验证，持续', overtime, '秒');
        // 立即 toast 提示：{countdown}秒后开启视频验证
        const toastText = i18nMgr.Get('UIVideoModelverifyRandomCountDown').replace('{0}', String(countdown));
        ToastManager.Instance.showToast(toastText);
        // 等待 countdown 秒后再开始验证
        await new Promise<void>(resolve => {
            this._randomVideoCountdownTimer = window.setTimeout(() => {
                this._randomVideoCountdownTimer = 0;
                resolve();
            }, countdown * 1000);
        });
        // 等待期间可能已离开牌桌，检查有效性
        if (!this.game?.uirc) {
            console.log('[RandomVideo] 等待期间已离开牌桌，取消验证');
            return;
        }
        // 标记开始验证
        GameCache.Instance._randomVideoActive = true;
        // 计算结束时间（毫秒）
        GameCache.Instance._randomVideoEndTime = Date.now() + overtime * 1000;
        console.log('[RandomVideo] 开始随机验证，持续', overtime, '秒');
        // Toast 提示验证开始
        const startToast = i18nMgr.Get('UIVideoModelverifyRandom02').replace('{0}', String(overtime));
        ToastManager.Instance.showToast(startToast);
        // 强制开启摄像头并渲染到自己的头像
        await this.renderLocalVideoOnMySeat();
        // 同步按钮状态（禁用关闭按钮）
        this.game?.uirc?.syncVideoButtonsFromAgora();
        // 启动倒计时
        this._startRandomVideoCountdown();
    }

    /**
     * 启动随机验证倒计时
     */
    private _startRandomVideoCountdown(): void {
        this._clearRandomVideoTimer();
        this._randomVideoTimer = window.setInterval(() => {
            const remaining = GameCache.Instance._randomVideoEndTime - Date.now();
            if (remaining <= 0) {
                // 倒计时结束
                console.log('[RandomVideo] 验证倒计时结束，恢复手动控制');
                this._clearRandomVideoTimer();
                GameCache.Instance._randomVideoActive = false;
                GameCache.Instance._randomVideoEndTime = 0;
                // 检查玩家是否还在座位上，如果已站起/离开则关闭摄像头
                const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
                if (!mySeat) {
                    console.log('[RandomVideo] 玩家已不在座位，关闭摄像头');
                    AgoraManager.Instance.disableCamera().catch(() => {});
                }
                // 摄像头保持开启，恢复关闭按钮
                this.game?.uirc?.syncVideoButtonsFromAgora();
            }
        }, 1000);
    }

    /**
     * 清理随机验证倒计时
     */
    private _clearRandomVideoTimer(): void {
        if (this._randomVideoTimer) {
            window.clearInterval(this._randomVideoTimer);
            this._randomVideoTimer = 0;
        }
        if (this._randomVideoCountdownTimer) {
            window.clearTimeout(this._randomVideoCountdownTimer);
            this._randomVideoCountdownTimer = 0;
        }
    }

    // ==================== 窗花贴纸设置 ====================
    /**
     * 请求服务器修改自己的窗花贴纸
     * 服务器收到后会通过 1133 消息广播给房间内所有人
     * @param videoMaskId 新的贴纸ID（0=取消贴纸）
     */
    public async requestSetVideoMask(videoMaskId: number): Promise<boolean> {
        try {
            const response = await WWW.Instance.CommonAPI<HttpUserSetVideoMaskProtocol.ResponseData>({
                web_class: WebUserSetVideoMask,
                body: {
                    video_mask_id: videoMaskId
                }
            });
            if (response.code === 0) {
                console.log('[VideoMask] 设置窗花成功, videoMaskId:', videoMaskId);
                // 立即更新本地数据
                this.game.mainPlayer.videoMaskId = videoMaskId;
                // 如果视频正在渲染，同步刷新窗花显示
                const mySeat = this.game?.listSeat?.find((s: Seat) => s.IsMySeat);
                if (mySeat?.uirc?.Raw_Head?.node?.isValid) {
                    const vr = mySeat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
                    if (vr) {
                        vr.setVideoMaskId(videoMaskId);
                    }
                }
                return true;
            } else {
                console.warn('[VideoMask] 设置窗花失败:', response);
                return false;
            }
        } catch (e) {
            console.error('[VideoMask] 设置窗花请求异常:', e);
            return false;
        }
    }

    /**
     * 收到 1133 视频窗花变更广播（某人修改了窗花，服务器广播给房间内所有人）
     * 消息字段：userId, userRid, videoMaskId
     */
    protected HANDLER_REQ_VIDEO_MASK_CHANGE(rec: ServerMessageVideoMaskChange.AsObject) {
        if (rec == null) return;
        console.log('[VideoMask] 收到窗花变更广播, userRid:', rec.userRid, 'videoMaskId:', rec.videoMaskId);
        // 自己的变更已经在 requestSetVideoMask 里本地处理过了，跳过
        if (rec.userRid === this.game.mainPlayer.userID) return;
        // videoMaskId > 4 时客户端统一归为 1
        let maskId = rec.videoMaskId || 0;
        if (maskId > 4) maskId = 1;
        // 找到对应座位
        const seat = this.game?.GetSeatByUserId(rec.userRid);
        if (!seat?.Player) return;
        // 更新玩家数据
        seat.Player.videoMaskId = maskId;
        // 如果该座位的视频正在渲染，刷新窗花显示
        if (seat.uirc?.Raw_Head?.node?.isValid) {
            const vr = seat.uirc.Raw_Head.node.getComponent(AgoraVideoRender);
            if (vr?.isRendering) {
                vr.setVideoMaskId(maskId);
            }
        }
    }
}
