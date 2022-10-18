import { BetType, GameType, PokerType } from "../game/GameUtil"
import { ERateType } from "./EEnumConfig"


export type TSendInfo = {
    api?: string
    request?: any,
    body?: any,
    cuscomHost?: string,
    onSuccess?: Function,
    onFailure?: Function,
    headers?: any,
    isJson?: boolean,
    isGet?: boolean,
}

export type TRoomBlinds = {
    sb: number,
    cnt: number
}

export type TLanguageTemp = {
    template_id: string,
    cn_name: string,
    us_name: string,
    br_name: string
}

export type TLobbyGroup = {
    game_type?: GameType,
    count?: number,
    player_count?: number,
    poker_type?: PokerType,
    limit_bet_type?: BetType
}

export type TRoomList = {
    limit: number,
    offset: number,
    records: Array<TRoomListItem>,
    total: number
}

export type TRoomListItem = {
    rid: number,//房间id
    name: string,//房间名称
    room_type: number,//room path 房间类型
    game_type: number,//游戏类型
    poker_type: number,//牌类型
    limit_bet_type: number,//底池限注类型
    status: number,//房间状态  0 未真是创建，1  已创建 未开始，2 进行中，3 强制关闭，4 即将关闭，5 房间关闭 。 RoomStatus
    ante: number,//前注
    sb: number,//小盲
    op_duration: number,//操作时间
    no_user_wait_duration: number,//无用户等待时间
    keep_seat_duration: number,//留座离桌时间
    total_bring_in: number,//总带入
    total_bring_out: number,//总带出	
    total_chip: number,//总记分牌
    min_rate: number,//最小带入倍率
    max_rate: number,//最大带入倍率
    min_players: number,//最小人数
    autostart_min_players: number,//最小人数自动开桌
    straddle_on: number,//强制盲注开启。1：开启，0：关闭
    straddle_max: number,//强制盲注最大人数
    insurance_on: number,//保险开启。1：开启，0：关闭
    insurance_op_duration: number,//保险操作时间
    delay_view_card_on: number,//延迟看牌。1：开启，0，关闭	
    post_on: number,//补盲开关，1：开启，0，关闭
    muck_on: number,//是否开启盖牌
    limit_ip_on: number,//IP开启
    limit_gps_on: number,//gps开启
    limit_gps_distance: number,//gps 距离
    limit_delay_times: number,//操作延迟次数
    limit_auto_check_times: number,//自动过牌次数
    limit_auto_fold_times: number,//自动弃牌次数
    seat_count: number,//房间座位数量
    empty_seat: number,//剩余空座位
    roomers: number,//房间内人数
    enter_time: string,//允许进入时间	
    play_duration: number,//游戏时长
    retain_type: number,//藏钱类型
    retain_min_rate: number,//最小倍率	
    schedule_start_time: string,//	
    start_time: string,//开始时间
    end_time: string,//结束时间	
    hand_num: number,//手数
    tribe_id: number,//联盟id	
    end_reason: string,//结束原因	
    hc_total_hand_lv: number,//限制总手数胜率
    hc_total_hand: number,//限制总手数	
    hc_pool_rate_lv: number,//限制入池率	
    hc_pool_rate: number,//限制入池数	
    service_id: string,//用于查询IP列表IP Port
    create_time: string,//创建时间	
    update_time: string,//	
    voiceprint_verify_on: number,//开启声纹验证 0 关闭，1 开启。	
    voiceprint_verify_limit_times: number,//该房间次数限制 
    voiceprint_verify_duration: number,//被验证倒计时	
    voiceprint_verify_interval_duration: number,//被验证间隔时间
    participation_status: number,//参与状态:0 未参与 1: 参与中

    second_pcs_on: number,
    second_pcs_op_duration: number,
    second_pcs_user_limit: number,
    no_user_close_duration: number,
    settlement_type: number,
    tablecloth_tag: string, // 桌布
    club_id: number, // 公会ID
    origin_type: number,    // 创建来源 1 平台，2 联盟，3 公会

}

export type TUserInfo = {
    user_id: number,
    area: string,
    phone: string,
    status: number,
    forbid: number,
    lc: number,
    lt: string,
    ut: number,
    forbid_bring_in: number,
    forbid_withdraw_gold: number,
    limit: number,
    description: string,
    ub_operator_id: number,
    w_u_id: number,
    gold: number,
    gold_lock: number,
    wallet_status: number,
    p_u_id: number,
    un_id: number,
    nickname: string,
    avatar: string,
    sex: number,
    birthday: null,
    country: string,
    city: string,
    province: string,
    platform: number,
    mnt: number,
    mat: number,
    operator_id: number,
    vip: number,
    vip_endtime: number
}

export type TUserGoldChangeLogs = {
    limit: number,
    offset: number,
    list: Array<TUserGoldChangeLogItem>,
    total: number
}

export type TUserGoldChangeLogItem = {
    hand: number,                              //手数
    hand_win: number,                          //每手盈亏筹码
    hand_bet: number,                          //每手下注筹码
    insurance: number,                         //保险

    user_id: number,                           //用户ID
    src_type: number,                          //来源 0-普通非游戏，1-来源德州玩法房间，2-来源MTT，3-来源牛仔
    src_room_id: number,                       //游戏roomID
    src_match_id: number,                       //mtt赛事ID
    name: string,                             //来源名称为了标识

    op_id: number,                             //操作人ID
    op_code: string,                   //操作类型
    gold_before: number,                    //资金变动前金币
    gold_change: number,                       //资金变动金币
    gold_after: number,                     //资金变动后金币
    gold_lock_before: number,                //锁定金币变动前金币
    gold_lock_change: number,               //锁定金币变动金币
    gold_lock_after: number,                   //锁定金币变动后金币
    create_time: string
}

export type TClubGoldChangeLogs = {
    limit: number,
    offset: number,
    list: Array<TClubGoldChangeLogItem>,
    total: number
}

export type TClubGoldChangeLogItem = {
    id: number,
    room_name: string,
    desc: string
    org_Id: number,
    org_account_id: number,
    org_account_type: number,

    user_id: number,
    src_type: number,
    src_room_id: number,
    src_match_id: number,
    name: string,

    op_id: number,
    op_code: string, //类型,工会收回玩，家提现的金币
    gold_before: number, //资金变动前
    gold_change: number, //资金变动
    gold_after: number, //资金变动后
    gold_lock_before: number, //锁定金币变动前
    gold_lock_change: number, //锁定金币变动
    gold_lock_after: number, //锁定金币变动后
    create_time: string,
}


////rate
export type TRateConfig = {
    type: ERateType,
    country: string,
    flag: string,
    path: string
}

export type TRateItem = {
    id: number, // ID
    from_currency: string, // 第一币种
    from_rate: number, // 第一币种比例值
    to_currency: string, // 第二币种
    to_rate: number, // 第二币种比例值
}