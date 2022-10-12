import { type } from "os"
import { BetType, GameType, PokerType } from "../game/GameUtil"


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

export type TDeskNameTemp = {
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
    rid: number,
    name: string,
    room_type: number,
    game_type: number,      // 游戏类型 0-德州 1-OMAHA4 2-OMAHA5 3-OMAHA6
    poker_type: number,     // 牌类型 0-长牌 2-短牌
    limit_bet_type: number, // 下注类型 0-无底池限制 1-底池限制 2-AOF
    status: number,         //0:待创建 1:已创建未开始 2:已开始 3:已结束
    ante: number,
    sb: number,
    op_duration: number,             //操作时间
    no_user_wait_duration: number,   //用户不足等待开局间隔
    keep_seat_duration: number,      //无筹码留坐站起时间
    total_bring_in: number,          //房间内总共带入多少
    total_bring_out: number,
    total_chip: number,      //当前筹码数量
    min_rate: number,        //最小带入倍率(BB的倍数)
    max_rate: number,        //最大带入倍率
    min_players: number,     //最小游戏人数
    autostart_min_players: number,   //自动开始最小人数 <2 非自动开始 >= 2 自动开始
    straddle_on: number,        //1 开 0 关
    straddle_max: number,
    insurance_on: number,       //1 开 0 关
    insurance_op_duration: number,   //保险操作时间
    second_pcs_on: number,   
    second_pcs_op_duration: number,
    second_pcs_user_limit: number,
    delay_view_card_on: number,  //延迟看牌开关
    post_on: number,     //1 开 0 关 补盲开关
    muck_on: number,        //1 开 0 关 （是否盖牌翻牌)
    limit_ip_on: number,
    limit_gps_on: number,
    limit_gps_distance: number,
    limit_delay_times: number,
    limit_auto_check_times: number,  //可以超时几次自动Check
    limit_auto_fold_times: number,   //可以超时几次C自动Fold
    seat_count: number,
    empty_seat: number,
    roomers: number,    //房间内人数
    enter_time: string,
    play_duration: number,
    no_user_close_duration: number,
    retain_type: number,
    retain_min_rate: number,    //最小倍率
    schedule_start_time: number,
    start_time: number,
    end_time: number,
    settlement_type: number,
    hand_num: number,
    tribe_id: number,        //联盟ID
    end_reason: string,
    hc_total_hand_lv: number,
    hc_total_hand: number,
    hc_pool_rate_lv: number,
    hc_pool_rate: number,
    service_id: string,
    create_time: string,
    update_time: string,
    voiceprint_verify_on: number,   // 声纹验证是否开启 1 开 0 关
    voiceprint_verify_limit_times: number,   // 声纹验证限制次数
    voiceprint_verify_duration: number, // 声纹验证时长(超时),单位秒
    voiceprint_verify_interval_duration: number, // 声纹验证间隔时间(超时),单位秒
    participation_status: number,  //参与状态:0 未参与 1: 参与中
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