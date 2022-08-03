import Dispatcher from "../event/Dispatcher";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import TexasGame from "./TexasGame";

export default class TexasGameProtocol {

    constructor(public game: TexasGame) {
    }

    public RegisterMsgHandler(): void {
        this.RemoveMsgHandler();
        console.log(`TexasGame : RegisterMsgHandler`);

        //Dispatcher.on(ProtocolCode.Protocol_Holdem_Seated, HANDLER_REQ_GAME_SEND_MY_SEAT,this);//自己坐下
        // CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_SeatedOthers, HANDLER_REQ_GAME_RECV_SEAT_DOWN);  // 别人坐下
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

        // CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_Seated, HANDLER_REQ_GAME_SEND_MY_SEAT);//自己坐下
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

}
