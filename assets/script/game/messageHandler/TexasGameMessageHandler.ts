import { ProcedureEnum } from '../../define/EIDefine';
import { UIDefine } from '../../define/UIDefine';
import GC from '../../frame/GameControl';
import ReconnectComponent from '../../funcomponent/ReconnectComponent';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import { i18nMgr } from '../../i18n/i18nMgr';
import ProcedureManager from '../../manager/ProcedureManager';
import SceneManager from '../../manager/SceneManager';
import { ProtocolCode } from '../../net/websocket/ProtocolCode';
import { ServerErrorCode } from '../../net/websocket/ServerErrorCode';
import { Def } from '../../protobuf/holdem/define_pb';
import { ServerMessageError } from '../../protobuf/holdem/recv_g_error_pb';
import { ServerMessageHandClear } from '../../protobuf/holdem/recv_th_hand_clear_pb';
import { ServerMessageLeaveNotification } from '../../protobuf/holdem/recv_th_leave_notification_pb';
import { ServerMessagePostStatusChange } from '../../protobuf/holdem/recv_th_post_status_change_pb';
import { ServerMessagePublicCards } from '../../protobuf/holdem/recv_th_public_cards_pb';
import { ServerMessageSeatedOthers } from '../../protobuf/holdem/recv_th_seated_others_pb';
import { ServerMessageStandup } from '../../protobuf/holdem/recv_th_stand_up_pb';
import { ServerMessageStartInfo } from '../../protobuf/holdem/recv_th_start_info_pb';
import { ServerMessageWinner } from '../../protobuf/holdem/recv_th_winner_pb';
import { ServerMessageJackpotGoldChange } from '../../protobuf/holdem/recv_th_jackpot_gold_change_pb';
import { ServerMessageJackpotAward } from '../../protobuf/holdem/recv_th_jackpot_award_pb';
import { ServerMessageEnterRoom } from '../../protobuf/holdem/req_th_enter_room_pb';
import { ServerMessageLeave } from '../../protobuf/holdem/req_th_leave_pb';
import { ServerMessageSeated } from '../../protobuf/holdem/req_th_seated_pb';
import { ServerMessageStandupActive } from '../../protobuf/holdem/req_th_stand_up_active_pb';
import GlobalSession from '../../session/GlobalSession';
import UIComponent from '../../ui/UIComponent';
import { GameCache } from '../GameCache';
import Seat from '../seat/Seat';
import { SeatStandupAnimation } from '../SeatStateHandler';
import TexasGame from '../texas/TexasGame';
import { TexasGameState } from '../TexasGameState';
import { GamePlaySubType } from '../ui/UITexasGameEnd';
import GameUtil, { RoomType } from '../util/GameUtil';
const LN = '[TexasGameMessageHandler]';

export default class TexasGameMessageHandler {

    constructor(public game: TexasGame) {}

    public RegisterMessageHandler() {
        console.log(LN, 'RegisterMessageHandler');
        GC.notify.register(ProtocolCode.Protocol_Holdem_EnterRoom, this.Protocol_Holdem_EnterRoom_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Leave, this.Protocol_Holdem_Leave_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_LeaveNotification, this.Protocol_Holdem_LeaveNotification_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Seated, this.Protocol_Holdem_Seated_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddOn, this.Protocol_Holdem_AddOn_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_BringIn, this.Protocol_Holdem_BringIn_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Action, this.Protocol_Holdem_Action_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.Protocol_Holdem_SetAutoOnTable_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_StandupActive, this.Protocol_Holdem_StandupActive_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Standup, this.Protocol_Holdem_Standup_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.Protocol_Holdem_KeepSeatActive_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Showdown, this.Protocol_Holdem_Showdown_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.Protocol_Holdem_ShowPublicCards_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTime, this.Protocol_Holdem_AddTime_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.Protocol_Holdem_BuyInsuranceActive_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_AgreePost, this.Protocol_Holdem_AgreePost_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_StoreChips, this.Protocol_Holdem_StoreChips_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.Protocol_Holdem_ShowPublicCardsOthers_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Showcards, this.Protocol_Holdem_Showcards_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_SeatedOthers, this.Protocol_Holdem_SeatedOthers_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_StartInfo, this.Protocol_Holdem_StartInfo_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_PublicCards, this.Protocol_Holdem_PublicCards_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_SidePots, this.Protocol_Holdem_SidePots_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_ChipsChange, this.Protocol_Holdem_ChipsChange_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_ActionAll, this.Protocol_Holdem_ActionAll_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_KeepSeat, this.Protocol_Holdem_KeepSeat_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Winner, this.Protocol_Holdem_Winner_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.Protocol_Holdem_AddTimeOthers_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.Protocol_Holdem_InsuranceTrigged_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_BuyInsurance, this.Protocol_Holdem_BuyInsurance_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_PostStatusChange, this.Protocol_Holdem_PostStatusChange_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, this.Protocol_Holdem_BringInOrStoreFail_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_HandClear, this.Protocol_Holdem_HandClear_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_UpBlind, this.Protocol_Holdem_UpBlind_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_JackpotGoldChange, this.Protocol_Holdem_JackpotGoldChange_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_JackpotAward, this.Protocol_Holdem_JackpotAward_Handler, this);
        GC.notify.register(ProtocolCode.Protocol_Holdem_Error, this.Protocol_Holdem_Error_Handler, this);
    }

    public RemoveMessageHandler() {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_EnterRoom, this.Protocol_Holdem_EnterRoom_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Leave, this.Protocol_Holdem_Leave_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_LeaveNotification, this.Protocol_Holdem_LeaveNotification_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Seated, this.Protocol_Holdem_Seated_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddOn, this.Protocol_Holdem_AddOn_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BringIn, this.Protocol_Holdem_BringIn_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Action, this.Protocol_Holdem_Action_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SetAutoOnTable, this.Protocol_Holdem_SetAutoOnTable_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_StandupActive, this.Protocol_Holdem_StandupActive_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Standup, this.Protocol_Holdem_Standup_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_KeepSeatActive, this.Protocol_Holdem_KeepSeatActive_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Showdown, this.Protocol_Holdem_Showdown_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowPublicCards, this.Protocol_Holdem_ShowPublicCards_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTime, this.Protocol_Holdem_AddTime_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BuyInsuranceActive, this.Protocol_Holdem_BuyInsuranceActive_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AgreePost, this.Protocol_Holdem_AgreePost_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_StoreChips, this.Protocol_Holdem_StoreChips_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ShowPublicCardsOthers, this.Protocol_Holdem_ShowPublicCardsOthers_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Showcards, this.Protocol_Holdem_Showcards_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SeatedOthers, this.Protocol_Holdem_SeatedOthers_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_StartInfo, this.Protocol_Holdem_StartInfo_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_PublicCards, this.Protocol_Holdem_PublicCards_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_SidePots, this.Protocol_Holdem_SidePots_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ChipsChange, this.Protocol_Holdem_ChipsChange_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_ActionAll, this.Protocol_Holdem_ActionAll_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_KeepSeat, this.Protocol_Holdem_KeepSeat_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Winner, this.Protocol_Holdem_Winner_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_AddTimeOthers, this.Protocol_Holdem_AddTimeOthers_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_InsuranceTrigged, this.Protocol_Holdem_InsuranceTrigged_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BuyInsurance, this.Protocol_Holdem_BuyInsurance_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_PostStatusChange, this.Protocol_Holdem_PostStatusChange_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_BringInOrStoreFail, this.Protocol_Holdem_BringInOrStoreFail_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_HandClear, this.Protocol_Holdem_HandClear_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_UpBlind, this.Protocol_Holdem_UpBlind_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_JackpotGoldChange, this.Protocol_Holdem_JackpotGoldChange_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_JackpotAward, this.Protocol_Holdem_JackpotAward_Handler, this);
        GC.notify.remove(ProtocolCode.Protocol_Holdem_Error, this.Protocol_Holdem_Error_Handler, this);
    }

    /// <summary>
    /// 进入房间 消息回调
    /// </summary>
    /// <param name="response"></param>
    async Protocol_Holdem_EnterRoom_Handler(response: ServerMessageEnterRoom.AsObject, roomId: number, matchId: number) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_EnterRoom_Handler`);
        if (response == null) return;
        // GameStatusRestoreHandler?.Invoke(responseData.Status);
        // GameStatusRestoreHandler = null;
        let isMTT: boolean = this.game.isMTT;
        console.log(LN, '当前游戏是比赛:', isMTT);
        ReconnectComponent.Instance.ChangeStatus(2);
        //判断重连进行牌桌场景清理
        if (ReconnectComponent.Instance.CheckMask()) {
            GC.game?.ReEnterClear();
            ReconnectComponent.Instance.HideMask();
        }
        if (response.status == 0) {
            if (isMTT) {
                // 缓存房间id
                console.log(LN, response.mttRoom, roomId);
                GameCache.Instance.room_id = response.mttRoom.roomId;
                //matchId;
                console.log(LN, `Protocol_Holdem_EnterRoom_Handler: cache mtt room id: ${GameCache.Instance.room_id}`);
            }
            if (ProcedureManager.currProcedure.id == ProcedureEnum.Texas) {
                let game_enter_type = GameCache.Instance.enter_param.game_enter_type;
                //ProcedureManager.currProcedure.param?.game_enter_type;
                // if (game_enter_type?.length) {
                //     for (let i = 0; i < fromUIs.length; i++) {
                //         UIComponent.Instance.CloseNoAnimation(fromUIs[i]);
                //     }
                // }
                switch (game_enter_type) {
                    case 0:
                        break;
                    case 1: //工會
                        UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubHome);
                        break;
                    case 2: //朋友
                        UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubCreateMatchHome);
                        UIComponent.Instance.CloseNoAnimation(UIDefine.UIClubCreateMatch);
                        break;
                    case 3: //MTT
                        //UIComponent.Instance.CloseNoAnimation(UIDefine.MttDetailForm);
                        // UIComponent.Instance.CloseNoAnimation(UIDefine.MttListForm);
                        // UIComponent.Instance.CloseNoAnimation(UIDefine.UIMTTDetail);
                        // UIComponent.Instance.CloseNoAnimation(UIDefine.UIMTTList);
                        break;
                }
            }
            await SceneManager.Instance.switchScene(UIDefine.UITexas, null, GameCache.Instance.enter_param);
            this.game.SMAgency.ChangeGameState(TexasGameState.Init, response);
            // 进房成功后加入 Agora 视频频道（确保场景和协议都已就绪）
            this.game.TexasGameProtocol.JoinVideoChannelAfterEnterRoom();
        } else if (response.status == ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame && isMTT) {
            console.log(LN, `Protocol_Holdem_EnterRoom_Handler: response.state : ServerErrorCode.Gameplay_AutoSeatReturnToInvalidGame`);
            // 进入ExchangeRoom状态，等待换房
            this.game.SMAgency.ChangeGameState(TexasGameState.ExchangeRoom, null);
        } else {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.status));
            // 进入房间失败
            this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
        }
    }

    /**
     * 离开房间消息返回
     * @param response
     */
    Protocol_Holdem_Leave_Handler(response: ServerMessageLeave.AsObject, roomID: number, matchID: number) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Leave_Handler`, roomID, matchID);
        if (response == null) return;
        // 如果我正在进入则忽略此消息(非主动离开)
        if (!GameCache.Instance.isActiveLeaving && roomID == GameCache.Instance.room_id && matchID == GameCache.Instance.match_id) {
            return;
        }
        if (response.status != 0) {
            console.warn(`Protocol_Holdem_Leave: status = ${response.status}`);
            this.game.TexasGameUtils.ExitRoom();
            return;
        }
        UIComponent.Instance.Toast(
            i18nMgr.Get(`LeaveReason${Def.LeaveReason.LR_ACTIVE}`),
            {
                stayDuration: 1
            },
            () => {
                this.game.TexasGameUtils.ExitRoom();
            }
        );
    }

    /**
     * 其他玩家坐下
     * @param response
     */
    Protocol_Holdem_SeatedOthers_Handler(response: ServerMessageSeatedOthers.AsObject) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_SeatedOthers_Handler`);
        // 协议层会先更新座位数据，这里下一帧再刷新开始按钮，避免回调顺序导致人数未更新
        setTimeout(() => {
            this.game?.UpdateStartGameState?.();
        }, 0);
    }

    /// <summary>
    /// 主动坐下(非MTT使用) 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_Seated_Handler(response: ServerMessageSeated.AsObject) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Seated_Handler`);
        // 协议层会先更新自己座位数据，这里下一帧再刷新开始按钮，避免回调顺序导致人数未更新
        setTimeout(() => {
            this.game?.UpdateStartGameState?.();
            this.game?.PlayJackpotStartAnim?.();
        }, 0);
    }

    Protocol_Holdem_JackpotGoldChange_Handler(response: ServerMessageJackpotGoldChange.AsObject) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_JackpotGoldChange_Handler`);
        if (!response) return;
        this.game?.OnJackpotGoldChange?.(response);
    }

    Protocol_Holdem_JackpotAward_Handler(response: ServerMessageJackpotAward.AsObject) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_JackpotAward_Handler`);
        if (!response) return;
        this.game?.OnJackpotAward?.(response);
    }

    /// <summary>
    /// 用户主动站起（非MTT）消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_StandupActive_Handler(response: ServerMessageStandupActive.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_StandupActive_Handler`);
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            if (this.game.mainPlayer != null && this.game.mainPlayer.isPlaying) {
                UIComponent.Instance.Toast(i18nMgr.Get('Over_folded'));
            }
        } else {
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.status));
        }
    }

    /// <summary>
    /// 接收用户站起信息,PlayerID=自己代表自己被强制站起了,reason给出原因 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Standup_Handler(response: ServerMessageStandup.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Standup_Handler`);
        if (response == null) {
            return;
        }
        let localSeatID: number = this.game.GetLocalSeatID(response.seatId);
        let seat: Seat = this.game.GetSeatByLocalSeatID(localSeatID);
        if (seat == null || seat.Player == null) {
            return;
        }
        let isMainPlayer: boolean = seat.Player.userID == this.game.mainPlayer.userID;
        if (isMainPlayer) {
            GameUtil.ResetSeatInfo();
            this.game.mainPlayer.cacheStoreChips = response.storeChips;
            this.game.HideOperationPanel();
            this.game.HideAutoOperationPanel();
            this.game.HideSeeMorePublic();
            this.game.callTimeStay = false;
            this.game.callTimeCount = 0;
            this.game.ShowCallTime();
            this.game.TexasGameUtils.doStandUp(localSeatID);
        } else {
            //     UI uiTexasPlayerInfo = UIComponent.Instance.Get(UIType.UITexasPlayerInfo);
            // if (uiTexasPlayerInfo != null && uiTexasPlayerInfo.GameObject.activeInHierarchy) {
            //         UITexasPlayerInfoComponent uiComponent = uiTexasPlayerInfo.GetComponent<UITexasPlayerInfoComponent>();
            //     uiComponent.PlayerStandUp((int)seat.Player.userID);
            // }
            // 站起消息到达时先清理扩展玩法角标，避免动画期间残留
            seat.ClearMushroomTag();
            seat.ClearSquidTag();
            seat.HideFold();
            seat.FsmLogicComponent.SM.ChangeState(SeatStandupAnimation.Instance);
        }
        this.game.UpdateStartGameState();
    }

    /// <summary>
    /// 补盲状态变化 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_PostStatusChange_Handler(response: ServerMessagePostStatusChange.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_PostStatusChange_Handler`);
    }

    /// <summary>
    /// 开始一手 消息回调
    /// </summary>
    /// <param name="response"></param>
    public Protocol_Holdem_StartInfo_Handler(response: ServerMessageStartInfo.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_StartInfo_Handler`);
        if (response == null) {
            return;
        }
        this.game.SMAgency.ChangeGameState(TexasGameState.HandStarted, response);
    }

    /// <summary>
    /// 通知本人离开房间 消息回调
    /// </summary>
    /// <param name="response"></param>
    public Protocol_Holdem_LeaveNotification_Handler(response: ServerMessageLeaveNotification.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_LeaveNotification_Handler`);
        if (response == null) {
            return;
        }
        switch (response.reason) {
            case Def.LeaveReason.LR_ACTIVE: // 主动退出
                {
                    // 主动退出已由别处处处理
                }
                break;
            case Def.LeaveReason.LR_AUTO_EXCEED_MAX_TIMES: // 超过最大自动操作次数限制
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            case Def.LeaveReason.LR_GAME_END: // 游戏结束
                {
                    if (GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
                        const gamePlaySubType = this.game?.squidEnabled
                            ? GamePlaySubType.SQUID
                            : this.game?.mushroomEnabled
                              ? GamePlaySubType.MUSH
                              : GamePlaySubType.NONE;
                        const roomId = String(GameCache.Instance.room_id || '');
                        const query: Record<string, string> = {
                            roomId,
                            from: 'cocos',
                            reason: String(response.reason ?? ''),
                            roomName: String(GameCache.Instance.roomName || ''),
                            gameType: String(GameCache.Instance.game_type ?? ''),
                            betType: String(GameCache.Instance.bet_type ?? ''),
                            pokerType: String(GameCache.Instance.poker_type ?? ''),
                            gamePlaySubType: String(gamePlaySubType)
                        };
                        const h5NavigatePayload = {
                            path: '/tableGameEnd',
                            query,
                            replace: false,
                            ensureVisible: true
                        };
                        console.log(LN, '[game-end] queue h5 navigate after exit cleanup', h5NavigatePayload);
                        this.game.SMAgency.ChangeGameState(TexasGameState.Exit, {
                            response,
                            h5NavigatePayload
                        });
                        break;
                    }
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            case Def.LeaveReason.LR_FORCE: // 强制退出
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            case Def.LeaveReason.LR_OFFLINE: // 离线
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
            default:
                {
                    this.game.SMAgency.ChangeGameState(TexasGameState.Exit, response);
                }
                break;
        }
        UIComponent.Instance.Toast(i18nMgr.Get(`LeaveReason${response.reason}`));
    }

    /// <summary>
    /// MTT AddOn 消息回调
    /// </summary>
    /// <param name="response"></param>
    public Protocol_Holdem_AddOn_Handler(): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_AddOn_Handler`);
    }

    /// <summary>
    /// 桌子上额外买入(非MTT) 消息回调
    /// </summary>
    /// <param name="response"></param>
    public Protocol_Holdem_BringIn_Handler(): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_BringIn_Handler`);
    }

    public Protocol_Holdem_UpBlind_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_UpBlind_Handler`);
    }

    /// <summary>
    /// 一手结束清理桌面 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_HandClear_Handler(response: ServerMessageHandClear.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_HandClear_Handler`);
        if (response == null) {
            return;
        }
        this.game.SMAgency.ChangeGameState(TexasGameState.HandEnd, response);
    }

    Protocol_Holdem_BringInOrStoreFail_Handler(Protocol_Holdem_BringInOrStoreFail: ProtocolCode, Protocol_Holdem_BringInOrStoreFail_Handler: any, arg2: this) {
        throw new Error('Method not implemented.');
    }

    Protocol_Holdem_BuyInsurance_Handler(Protocol_Holdem_BuyInsurance: ProtocolCode, Protocol_Holdem_BuyInsurance_Handler: any, arg2: this) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_BuyInsurance_Handler`);
    }

    Protocol_Holdem_InsuranceTrigged_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_InsuranceTrigged_Handler`);
    }

    /// <summary>
    /// 加时（其他人接收）消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_AddTimeOthers_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_AddTimeOthers_Handler`);
    }

    /// <summary>
    /// 结果通知 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Winner_Handler(response: ServerMessageWinner.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Winner_Handler`);
        if (response == null) {
            return;
        }
        this.game.SMAgency.ChangeGameState(TexasGameState.HandShowdown, response);
    }

    /// <summary>
    /// 本人/所有人都收到的消息（本人主动留座收不到，被动会收到）消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_KeepSeat_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_KeepSeat_Handler`);
    }

    /// <summary>
    /// 所有人收到主动/自动行为（包括自己） 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_ActionAll_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_ActionAll_Handler`);
    }

    /// <summary>
    /// 桌上筹码带入变动（上桌的筹码变动) 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_ChipsChange_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_ChipsChange_Handler`, response);
    }

    /// <summary>
    /// 边池信息 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_SidePots_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_SidePots_Handler`);
    }

    /// <summary>
    /// 所有人收到公共牌 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_PublicCards_Handler(response: ServerMessagePublicCards.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_PublicCards_Handler`);
        if (response == null) {
            return;
        }
        let nextState: TexasGameState = TexasGameState.None;
        switch (response.rnd) {
            case Def.Round.FLOP:
                {
                    nextState = TexasGameState.HandFlop;
                }
                break;
            case Def.Round.TURN:
                {
                    nextState = TexasGameState.HandTurn;
                }
                break;
            case Def.Round.RIVER:
                {
                    nextState = TexasGameState.HandRiver;
                }
                break;
        }
        this.game.SMAgency.ChangeGameState(nextState, response);
    }

    /// <summary>
    /// 亮牌 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_Showcards_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Showcards_Handler`);
    }

    /// <summary>
    /// 主动存筹码 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_StoreChips_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_StoreChips_Handler`);
    }

    Protocol_Holdem_AgreePost_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_AgreePost_Handler`);
    }

    Protocol_Holdem_BuyInsuranceActive_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_BuyInsuranceActive_Handler`);
    }

    /// <summary>
    /// 要求亮明未使用的公共牌 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_ShowPublicCards_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_ShowPublicCards_Handler`);
    }

    /// <summary>
    /// 其他人收到有人看公共牌 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_ShowPublicCardsOthers_Handler(response: any) {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_ShowPublicCardsOthers_Handler`);
    }

    /// <summary>
    /// 主动留座 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_KeepSeatActive_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_KeepSeatActive_Handler`);
    }

    /// <summary>
    /// 设置自动带入额度(自动每手带入） 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_SetAutoOnTable_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_SetAutoOnTable_Handler`);
    }

    /// <summary>
    /// 主动行为 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_Action_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Action_Handler`);
    }

    /// <summary>
    /// 加时 消息回调
    /// </summary>
    /// <param name="response"></param>
    Protocol_Holdem_AddTime_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_AddTime_Handler`);
    }

    /// <summary>
    /// 主动展示底牌 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Showdown_Handler(response: any): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Showdown_Handler`);
    }

    /// <summary>
    /// 异常错误 消息回调
    /// </summary>
    /// <param name="response"></param>
    private Protocol_Holdem_Error_Handler(response: ServerMessageError.AsObject): void {
        console.log(LN, `# MSG_CALLBACK: Protocol_Holdem_Error_Handler`);
        if (response == null) {
            return;
        }
        //CPLoginSessionComponent.Instance.Logout();
        UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.status));
        GlobalSession.Logout();
    }
}
