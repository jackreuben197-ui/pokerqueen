import { Code } from "../../protobuf/holdem/code_pb";
/**
 * 消息码
 */
export enum ProtocolCode {
    /**
     * 通用
     */
    Protocol_Holdem_Register                      = Code.MSG_D_REGISTER, // Code: 1
    Protocol_Holdem_Heartbeat                     = Code.MSG_D_HEARTBEAT, // Code: 2 心跳
    Protocol_Holdem_Error                         = Code.MSG_S_ERROR, // Code: 99
    /**
     * 通知
     */
    Protocol_Holdem_NotificationRoomReady         = Code.MSG_S_NOTIFICATION_ROOM_READY, // Code: 101
    Protocol_Holdem_UserBan                       = Code.MSG_S_USER_BAN, // Code: 102 冻结用户(个人)
    Protocol_Holdem_NotificationSystemMaintain    = Code.MSG_S_NOTIFICATION_SYSTEM_MAINTAIN, // Code: 103 系统维护(全体)
    Protocol_Holdem_RoomReadyForEnter             = Code.MSG_S_ROOM_READY_FOR_ENTER, // Code: 104 有新普通房间可以进入了(全体)
    Protocol_Holdem_MttReadyForApply              = Code.MSG_S_MTT_READY_FOR_APPLY, // Code: 105 有新MTT可以报名了(全体)
    Protocol_Holdem_UserKickedFromClub            = Code.MSG_S_USER_KICKED_FROM_CLUB, // Code: 106 用户被踢出俱乐部(个人)
    Protocol_Holdem_NotificationMttWillStart      = Code.MSG_S_NOTIFICATION_MTT_WILL_START, // Code: 107 MTT即将开始(参赛人员)
    Protocol_Holdem_SystemMessage                 = Code.MSG_S_SYSTEM_MESSAGE, // Code: 108 系统发布通用消息(全体)
    /**
     * 房间相关(HEAD有roomid+matchid)
     */
    Protocol_Holdem_EnterRoom                     = Code.MSG_D_ENTER_ROOM, // Code: 1002
    Protocol_Holdem_Seated                        = Code.MSG_D_SEATED, // Code: 1003 主动坐下(非MTT使用)
    Protocol_Holdem_AddOn                         = Code.MSG_D_ADD_ON, // Code: 1004 MTT时候AddOn
    Protocol_Holdem_BringIn                       = Code.MSG_D_BRING_IN, // Code: 1005 桌子上额外买入(非MTT)
    Protocol_Holdem_Action                        = Code.MSG_D_ACTION, // Code: 1006 主动行为
    Protocol_Holdem_AutoOpActive                  = Code.MSG_D_AUTO_OP_ACTIVE, // Code: 1007 主动托管/取消托管
    Protocol_Holdem_SetAutoOnTable                = Code.MSG_D_SET_AUTO_ON_TABLE, // Code: 1008 设置自动带入额度(自动每手带入）
    Protocol_Holdem_StandupActive                 = Code.MSG_D_STANDUP_ACTIVE, // Code: 1009 用户主动站起（非MTT）
    Protocol_Holdem_Leave                         = Code.MSG_D_LEAVE, // Code: 1010 用户主动离开房间(非MTT使用)会立即结算
    Protocol_Holdem_KeepSeatActive                = Code.MSG_D_KEEP_SEAT_ACTIVE, // Code: 1011 主动留座
    Protocol_Holdem_Showdown                      = Code.MSG_D_SHOWDOWN, // Code: 1012 主动展示底牌
    Protocol_Holdem_ShowPublicCards               = Code.MSG_D_SHOW_PUBLIC_CARDS, // Code: 1013 要求亮明未使用的公共牌
    Protocol_Holdem_AddTime                       = Code.MSG_D_ADD_TIME, // Code: 1014 加时
    Protocol_Holdem_BuyInsuranceActive            = Code.MSG_D_BUY_INSURANCE_ACTIVE, // Code: 1015 保险人购买保险,并接收结果返回
    Protocol_Holdem_AgreePost                     = Code.MSG_D_AGREE_POST, // Code: 1016 同意补盲
    Protocol_Holdem_StoreChips                    = Code.MSG_D_STORE_CHIPS, // Code: 1017 主动存筹码
    Protocol_Holdem_PublicReplay                  = Code.MSG_D_PUBLIC_REPLAY, // Code: 1018 公开牌谱
    Protocol_Holdem_BroadcastMsg                  = Code.MSG_D_BROADCAST_MSG, // Code: 1019 广播消息
    Protocol_Holdem_PrivateMsg                    = Code.MSG_D_PRIVATE_MSG, // Code: 1020 私聊消息
    Protocol_Holdem_Roomers                       = Code.MSG_D_ROOMERS, // Code: 1021 房间内人员信息
    Protocol_Holdem_AgreeSecondPcsActive          = Code.MSG_D_AGREE_SECOND_PCS_ACTIVE, // Code: 1022 同意/拒绝发第2套公共牌
    Protocol_Holdem_Observers                     = Code.MSG_D_OBSERVERS,//Code: 1023 旁观者信息(包含历史)
    Protocol_Holdem_ShowPublicCardsOthers         = Code.MSG_S_SHOW_PUBLIC_CARDS_OTHERS, // Code: 1100 其他人收到有人看公共牌
    Protocol_Holdem_Showcards                     = Code.MSG_S_SHOWCARDS, // Code: 1101 亮牌
    Protocol_Holdem_SeatedOthers                  = Code.MSG_S_SEATED_OTHERS, // Code: 1102 房间内人收到有人坐下的信息（不包括坐下的本人）
    Protocol_Holdem_StartInfo                     = Code.MSG_S_START_INFO, // Code: 1103 开始一手
    Protocol_Holdem_PublicCards                   = Code.MSG_S_PUBLIC_CARDS, // Code: 1104 所有人收到公共牌
    Protocol_Holdem_SidePots                      = Code.MSG_S_SIDE_POTS, // Code: 1105 边池信息
    //Protocol_Holdem_AddOnFail                     = Code.MSG_S_ADDON_FAIL, // Code: 1106 MTT AddOn失败
    Protocol_Holdem_ChipsChange                   = Code.MSG_S_CHIPS_CHANGE, // Code: 1107 桌上筹码带入变动（上桌的筹码变动)
    Protocol_Holdem_ActionAll                     = Code.MSG_S_ACTION_ALL, // Code: 1108 所有人收到主动/自动行为（包括自己）
    Protocol_Holdem_AutoOp                        = Code.MSG_S_AUTO_OP, // Code: 1109 自动托管
    Protocol_Holdem_Standup                       = Code.MSG_S_STANDUP, // Code: 1110 接收用户站起信息,PlayerID=自己代表自己被强制站起了,reason给出原因
    Protocol_Holdem_KeepSeat                      = Code.MSG_S_KEEP_SEAT, // Code: 1111 本人/所有人都收到的消息（本人主动留座收不到，被动会收到）
    Protocol_Holdem_Winner                        = Code.MSG_S_WINNER, // Code: 1112 结果通知
    Protocol_Holdem_AddTimeOthers                 = Code.MSG_S_ADD_TIME_OTHERS, // Code: 1113 加时（其他人接收）
    Protocol_Holdem_LeaveNotification             = Code.MSG_S_LEAVE_NOTIFICATION, // Code: 1114 通知本人离开房间
    Protocol_Holdem_InsuranceTrigged              = Code.MSG_S_INSURANCE_TRIGGED, // Code: 1115 所有玩家接收保险触发信息
    Protocol_Holdem_BuyInsurance                  = Code.MSG_S_BUY_INSURANCE, // Code: 1116 所有人接收到有人购买保险
    Protocol_Holdem_PostStatusChange              = Code.MSG_S_POST_STATUS_CHANGE, // Code: 1117 补盲状态变化
    Protocol_Holdem_BringInOrStoreFail            = Code.MSG_S_BRING_IN_OR_STORE_FAIL, // Code: 1118 带入/存储失败
    Protocol_Holdem_HandClear                     = Code.MSG_S_HAND_CLEAR, // Code: 1119 一手结束清理桌面
    Protocol_Holdem_UpBlind                       = Code.MSG_S_UP_BLIND, // Code: 1120 升盲
    Protocol_Holdem_GetMsg                        = Code.MSG_S_GET_MSG, // Code: 1121 收到消息
    Protocol_Holdem_AgreeSecondPcsTrigged         = Code.MSG_S_AGREE_SECOND_PCS_TRIGGED, // Code: 1122 是否允许第2套公共牌出发信息
    Protocol_Holdem_AgreeSecondPcs                = Code.MSG_S_AGREE_SECOND_PCS, // Code: 1123 所有人收到有人是否允许的结果信息
    Protocol_Holdem_SyncHand                      = Code.MSG_S_SYNC_HAND, // Code: 1124 等待同步开始(MTT)

    /**
     * 牛仔相关
     */
    Protocol_Holdem_CbEnterRoom                   = Code.MSG_D_CB_ENTER_ROOM, // Code: 2001 
    Protocol_Holdem_CbPlay                        = Code.MSG_D_CB_PLAY, // Code: 2002 下注
    Protocol_Holdem_CbCancelPlay                  = Code.MSG_D_CB_CANCEL_PLAY, // Code: 2003 取消下注
    Protocol_Holdem_CbLeave                       = Code.MSG_D_CB_LEAVE, // Code: 2004 离开房间
    Protocol_Holdem_CbChat                        = Code.MSG_D_CB_CHAT, // Code: 2005 发起聊天
    Protocol_Holdem_CbTop                         = Code.MSG_D_CB_TOP, // Code: 2006 排行榜
    Protocol_Holdem_CbWaymap                      = Code.MSG_D_CB_WAYMAP, // Code: 2007 路图
    Protocol_Holdem_CbLastGames                   = Code.MSG_D_CB_LAST_GAMES, // Code: 2008 最近的游戏结果
    Protocol_Holdem_CbGameStart                   = Code.MSG_S_CB_GAME_START, // Code: 2100 一手开始
    Protocol_Holdem_CbGamePlayInfo                = Code.MSG_S_CB_GAME_PLAY_INFO, // Code: 2101 下注信息
    Protocol_Holdem_CbGamePlayEnd                 = Code.MSG_S_CB_GAME_PLAY_END, // Code: 2102 下注结束
    Protocol_Holdem_CbGameResult                  = Code.MSG_S_CB_GAME_RESULT, // Code: 2103 结果结束
    Protocol_Holdem_CbWaymapUpdate                = Code.MSG_S_CB_WAYMAP_UPDATE, // Code: 2104 房间路图更新
    Protocol_Holdem_CbRoomClose                   = Code.MSG_S_CB_ROOM_CLOSE, // Code: 2105 房间关闭(用户会被踢出房间)
    Protocol_Holdem_CbChatOthers                  = Code.MSG_S_CB_CHAT_OTHERS, // Code: 2106 聊天接收
    Protocol_Holdem_CbLeaveNotification           = Code.MSG_S_CB_LEAVE_NOTIFICATION, // Code: 2107 接收自己离开房间(主要针对被动离开)

}

(window as any).ProtocolCode = ProtocolCode;