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
    game_type: number,
    poker_type: number,
    limit_bet_type: number,
    status: number,  //0:待创建 1:已创建未开始 2:已开始 3:已结束
    ante: number,
    sb: number,
    // op_duration: number,
    // no_user_wait_duration: number,
    // keep_seat_duration: number,
    // total_bring_in: number,
    // total_bring_out: number,
    // total_chip: number,
    // min_rate: number,
    // max_rate: number,
    // min_players: number,
    // autostart_min_players: number,
    straddle_on: number,
    // straddle_max: number,
    insurance_on: number,
    // insurance_op_duration: number,
    // second_pcs_on: number,
    // second_pcs_op_duration: number,
    // second_pcs_user_limit: number,
    // delay_view_card_on: number,
    // post_on: number,
    muck_on: number,
    // limit_ip_on: number,
    // limit_gps_on: number,
    // limit_gps_distance: number,
    // limit_delay_times: number,
    // limit_auto_check_times: number,
    // limit_auto_fold_times: number,
    seat_count: number,
    empty_seat: number,
    // roomers: number,
    // enter_time: string,
    play_duration: number,
    // no_user_close_duration: number,
    // retain_type: number,
    // retain_min_rate: number,
    // schedule_start_time: number,
    // start_time: number,
    // end_time: number,
    // settlement_type: number,
    // hand_num: number,
    // tribe_id: number,
    // end_reason: string,
    // hc_total_hand_lv: number,
    // hc_total_hand: number,
    // hc_pool_rate_lv: number,
    // hc_pool_rate: number,
    service_id: string,
    // create_time: string,
    // update_time: string,
    voiceprint_verify_on: number,
    // voiceprint_verify_limit_times: number,
    voiceprint_verify_duration: number,
    // voiceprint_verify_interval_duration: number,
    participation_status: number,  //参与状态:0 未参与 1: 参与中
    tablecloth_tag: string,
    // club_id: number,
    // origin_type: number,
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