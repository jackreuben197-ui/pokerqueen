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
    status: number,//房间状态  0 待创建，1  已创建 未开始，2 进行中|已开始，3 强制关闭|已结束，4 即将关闭，5 房间关闭 。 RoomStatus
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
    country: string,
    flag: string,
    path: string,
    desc: string
}

export type TRateItem = {
    id?: number, // ID
    from_currency?: string, // 第一币种
    from_rate?: number, // 第一币种比例值
    to_currency?: string, // 第二币种
    to_rate?: number, // 第二币种比例值
}

export type TListStepReq = {
    reqing: boolean,
    reqEnd: boolean,
    offset: number
}


export type TOrderRecords = {
    limit: number,
    offset: number,
    list: Array<TOrderRecordItem>,
    total: number
}

export type TOrderRecordItem = {
    id: number,
    user_id: number,
    user_type: number,  // 1 普通用户; 2 支桌号; 3 牌局机器人; 4 牛仔机器人
    club_id: number,
    tribe_id: number,
    order_no: string
    order_type: number,// 订单类型 1 申请充豆；2申请提豆 3工会发豆
    gold_num: number,
    amount: number,
    status: number,     // 状态（1-申请中,2-同意,3-拒绝,4-取消申请）
    audit_time: string
    audit_user_id: number,
    audit_type: number,// 审核来源：1 CMS; 2 app
    create_time: string
    update_time: string
    change_id: number,
    desc: "",
    user_random_id: number,
    nickname: "Player",
    avatar: string
    club_random_id: number,
    club_name: string
    tribe_random_id: number,
    tribe_name: string
}


export type TIssueUserList = {
    limit: number,
    offset: number,
    list: Array<TIssueUserItem>,
    total: number
}

export type TIssueUserItem = {
    user_id: number,
    random_id: number,
    nick_name: string,
    mobile: string,
    avatar: string,
    member_type: number,
    forbidden: false,
    user_wallet: any,
    user_org: any,
    is_vip: false,
    vip_members: number,
    bring_in: number,
    register_time: number,
    login_time: number,
    dz_service_profit: number,
    dz_insurance_profit: number,
    omaha_service_profit: number,
    omaha_insurance_profit: number,
    cowboy_profit: number,
    mtt_profit: number,
    up_table_times: number,
    invitation_code: string,
    logo: string,
    user_type: number,
    create_time: number,
    source_type: number,
    user_service_ratio: number,
    user_service_ratio_status: number,
    user_mtt_ratio: number,
    user_mtt_ratio_status: number,
    gender: number,
    operator_id: number,
    operator_random_id: number,
    operator_nick_name: string,
    description: string,
    recharge_gold_total: number,
    withdraw_gold_total: number,
    recharge_withdraw_diff_gold_total: number,
    forbid_bring_in: false,
    forbid_withdraw_gold: false,
    updated_time: number,
    account_name: string,
    account_password: string,
    total_profit: number,
    current_day_profit: number,
    current_day_add_friend: number,
    current_day_active_count: number,
    vip_id: number,
    vip_random_id: number,
    vip_name: string,
    match_active: number,
    no_match_active: number,
    buy_head_time: number,
    hands_time: number,
    register_to_recharge: number,
    first_recharge_count: number,
    two_recharge_count: number,
    limit: number,
    invitation_reward: null,
    invitation_reward_string: string
}

export type TOrderApplyItem = {
    id: number,
    user_id: number,
    user_type: number,
    club_id: number,
    tribe_id: number,
    order_no: string,
    order_type: number,
    gold_num: number,
    amount: number,
    status: number,   // 状态（1-申请中,2-同意,3-拒绝,4-取消申请）
    audit_time: number,
    audit_user_id: number,
    audit_type: number,
    create_time: string,
    update_time: string,
    change_id: number,
    desc: string,
    user_random_id: number,
    nickname: string,
    avatar: string,
    club_random_id: number,
    club_name: string,
    tribe_random_id: number,
    tribe_name: string
}

export type TMttListItem = {
    prize_pool: number,     //奖池
    bought: number,        // 状态 0 无法报名 1: 报名中 2: 参与中
    match_id: number,        //显示ID
    name: string,       //比赛名称
    type: number,       //throom.RoomType
    game_type: number,      //游戏类型
    poker_type: number,     //牌类型
    limit_bet_type: number,         //下注类型
    rank_type: number,      //排名属性
    enter_time: string,     //提前进入的时间戳
    start_time: number,     //比赛开始时间戳
    end_time: number,       //结束时间
    hunter_on: number,      //猎人模式
    hunter_bonus: number,       //猎人赛滚雪球比例 0~100 0:杀白丁无收益 1～99 单次收益 100:不滚雪球
    partial_on: number,     //部分带入
    parital_return_bl: number,      //部分带入,合并筹码的等级
    straddle_on: number,        //1 开 0 关
    straddle_max: number,       //抓次数限制
    muck_on: number,        //1 开 0 关 （是否盖牌翻牌)
    rooms: number,      //当前房间数
    max_room_id: number,        //最大房间号
    delay_view_card_on: number,     //延迟看牌开关
    limit_min: number,      //参赛人数下限
    limit_delay_times: number,      //延时限制次数
    limit_auto_check_times: number,     //可以超时几次自动Check
    limit_auto_fold_times: number,      //可以超时几次C自动Fold
    participants: number,       //参与人数(人数)
    alive: number,      //玩家活跃数量                              
    award_num: number,      //奖励人数
    money_sync: number,     //奖励圈同步(截止无法买入以后才会开启)
    status: number,     //当前状态 (0 创建，1 运行，2 结束，3 取消)
    seat_count: number,     //最大座位数（每桌）
    final_seat_count: number,       //最终座位数（每桌）
    no_user_wait_duration: number,      //用户不足等待开局间隔
    initial_score: number,      //初始带入
    blindtable_type: number,        // 盲注类型 0-快速赛/1-锦标赛/2-豪克塞/3-免费赛/4-110滚雪球赛/5-每日票赛/6-特色赛事880滚雪球赛/7-最新免费赛/8-周1.2特色赛事/9-周3特色赛/10-周4.5特色赛事/11-周六特色赛事/12-周末特色赛事
    upblind_interval: number,       //升盲间隔(s)
    apply_start_time: string,       //报名开始时间戳
    op_duration: number,        //操作等待时间(s)
    max_delay_apply_bl: number,     //延迟报名最高盲注级别
    rebuy_times: number,        //每人限制重购次数
    max_rebuy_bl: number,       //重购最高盲注级别
    limit_total_buy_times: number,      //最大报名次数（针对免费赛）
    total_buy_times: number,        //总共购买次数(人次)
    total_buyin_times: number,      //总共买入次数(人次)
    total_rebuy_times: number,      //所有重购次数(人次)
    addon_begin_bl: number,     //额外买入开始时间 0 代表没有额外买入
    addon_end_bl: number,       //额外买入开始时间 0 代表没有额外买入
    addon_score: number,        //额外买入算的计分牌
    total_addon_times: number,      //所有AddOn次数(人次)
    apply_fee_pool: number,     //报名费 进池
    apply_fee_service: number,      //报名费 服务费
    apply_fee_hunter: number,       //报名费 人头费
    prize_type: number,     //奖励类型
    prize_base_pool: number,        //保底奖金池
    tribe_id: number,       //联盟ID
    create_time: string,
    update_time: string,
    buy_prop_id: number,        // 替代买入/重构
    prop_buy_type: number,      // 道具使用类型 1: 只能道具 2: 混合 0: 不支持道具
    game_icon: string,      // 赛事icon图片url
    voiceprint_verify_on: number,       // 声纹验证是否开启 1 开 0 关
    voiceprint_verify_duration: number,     // 声纹验证时长(超时),单位秒

    addonplus_m1_on: number,                          // 增购Plus开关(截止买入/重购前)
    addonplus_m1_max_times: number,               // 最多增购plus次数(截止买入/重购前)
    addonplus_m1_limit: number,                    // 可以购买的门槛百分比(0-100)(截止买入/重购前) 初始筹码为基准计算 initScore
    total_addonplus_m1_times: number,        // 所有AddOnPlus截止买入/重购前)次数
    addonplus_m2_on: number,                          // 增购Plus开关(截止买入/重购后)
    addonplus_m2_max_times: number,               // 最多增购plus次数(截止买入/重购后)
    addonplus_m2_max_bl: number,                  // 可以购买的截止等级(截止买入/重购后)
    total_addonplus_m2_times: number,        // 所有AddOnPlus截止买入/重购后)次数
    buy_ratio: number,                                      // 买入可选倍率最高(默认 1)
    pre_buyin_bonus: number,                          // 提前报名额外奖励筹码 (0~n)
    tablecloth_tag: number,                                                // 桌布tag
    limit_tag: number,                                                     // 限制重复报名tag
    bonustable_type: number,              // 奖励表类型
    buyin_free_times: number,                   // 报名限免次数
    rebuy_free_times: number,                   // 重构限免次数
    multi_ratio_free_times: number,       // 多倍率买入限免次数
    addon_free_times: number,                   // 增购限免次数（包含addon addonp1 addonp2）
    buyin_free_incl_svr: number,             // 报名限免是否包含服务费，0不包含，1包含
    rebuy_free_incl_svr: number,             // 重构限免是否包含服务费，0不包含，1包含
    multi_ratio_free_incl_svr: number, // 多倍率买入限免是否包含服务费，0不包含，1包含
    addon_free_incl_svr: number,             // 增购限免是否包含服务费，0不包含，1包含
    award_replace_prop_id: number,         // 道具奖励代替ID
    award_replace_prop_value: number,   // 道具奖励代替价值
    award_extra_buy_times: number,         // 额外奖励条件：除报名外的总次数
    award_extra_add_count: number,         // 额外奖励：人数
    award_extra_prop_id: number,             // 额外奖励：道具ID
    award_extra_gold_value: number,       // 额外奖励：金豆数量
    award_extra_gold_buy: number,           // 额外奖励是否包含金豆买入，0不包含，1包含
    award_extra_ticket_buy: number,       // 额外奖励是否包含门票买入，0不包含，1包含
    award_extra_free_buy: number,           // 额外奖励是否包含限免买入，0不包含，1包含
    break_base_pool: number,                     // 破保（在报名总金额小于保底时，除报名外的买入从保底奖池累加）设置，0不破保，1破保
    total_extra_buy_times: number,         // 额外奖励买入次数
    award_extra_prop_value: number,       // 额外奖励：道具价值
}



/////////////////////////////////////////////////////////////////////

export type TClubInfo = {
    club_id: number,
    club_name: string,
    logo: string,
    random_id: number,
    upper_limit: number,
    club_members: number,
    area_id: string,
    club_type: number,
    create_time: string,
    is_official: number,
    club_status: number,
    desc: string,
    contact_info: {},
    member_type: number,
    more_contact: string,
    level: number,
    search_switch: number,
    auto_audit_switch: number,
    show_contact_switch: number,
    club_creator_random_id: number,
    club_creator_avatar: string,
    club_creator_nickname: string,
    tribe_name: string
}



export type TMttRank = {
    limit, //条目
    offset, //开始下标。例子（offset=0，limit=10，0-9。）
    alive, //存活人数
    total, //总人数
    records: Array<TMttRankItem>,  // 玩家列表
}
export type TMttRankItem = {
    rank: number, //排名
    chip: number, //记分牌
    alive: boolean, //是否被淘汰
    rid: number, //桌号
    urid: number, //玩家随机id
    seat: number, //座位号
    rebuy: number, //重构次数
    addon: boolean, //是否重构
    name: string, //名字
}


export type TMttDetailData = {
    alive: number,/// 存活人数
    state_code: number, /// 当前玩家的状态 MTTPlayerStatus定义
    mtt: TMttDetail,/// 比赛细节信息
    state: TMttDetailPlayerStatus,/// 玩家筹码状态信息
    more: TMttDetailPlayerMore,/// 盲注等级和奖励池
    top: number/// 最大记分牌
}

export type TMttDetail = {
    match_id: number, // 比赛id
    name: string, // 比赛名字
    type: number, // 房间类型
    game_type: number,//游戏类型
    poker_type: number,//牌类型
    limit_bet_type: number,//底池限注类型
    rank_type: number,//排名类型
    enter_time: string,//进入时间
    start_time: string,//开始时间
    end_time: string,//结束时间
    hunter_on: number,//猎人赛开启  1：开启，0关闭
    hunter_bonus: number,//0-100  //猎人赛滚雪球比例 0~100 0:杀白丁无收益 1～99 单次收益 100:不滚雪球
    partial_on: number,//部分带入开启  1：开启，0：关闭
    parital_return_bl: number,//部分带入返还金币盲注等级
    straddle_on: number,//强制盲注开启 1：开启，0：关闭
    straddle_max: number,//强制盲注数量
    rooms: number,//房间数量
    max_room_id: number,//最大房间id
    delay_view_card_on: number,//延迟看牌  1：开启，0：关闭
    limit_min: number,//最低参赛人数下限
    limit_delay_times: number,//操作加时次数限制
    limit_auto_check_times: number,//自动过牌次数
    limit_auto_fold_times: number,//自动弃牌次数
    participants: number,//参赛人数
    award_num: number,//奖金
    money_sync: number,//奖励圈同步(截止无法买入以后才会开启)
    status: number,//游戏状态
    seat_count: number,//在座人数
    final_seat_count: number,//最终座位人数
    no_user_wait_duration: number,
    initial_score: number,//初始化记分牌
    blindtable_type: number,//盲注表类型
    upblind_interval: number,//升盲时间间隔
    apply_start_time: string,//报名开始时间
    op_duration: number,//操作时间
    max_delay_apply_bl: number,//延迟报名升盲等级
    rebuy_times: number,//重构次数          
    max_rebuy_bl: number,//重购升盲等级
    limit_total_buy_times: number,//最大买入次数上限
    total_buy_times: number,//总买入次数
    total_rebuy_times: number,//总重购次数
    addon_begin_bl: number,//增购开启 升盲等级
    addon_end_bl: number,//增购关闭 升盲等级
    addon_score: number,//增购 记分牌
    total_addon_times: number,//增购次数
    apply_fee_pool: number,//报名费
    apply_fee_service: number,//服务费
    apply_fee_hunter: number,//猎人赛费用
    prize_type: number,//奖励类型
    tribe_id: number,//联盟id
    create_time: string,//创建房间时间
    update_time: string,
    game_icon: string,
    prop_buy_type: number,// 道具使用类型 1: 只能道具 2: 混合 0: 不支持道具
    voiceprint_verify_on: number,//是否开启验证声纹 0 关闭，1 开启。
    voiceprint_verify_duration: number,//验证声纹时长
    buy_prop_id: number,//道具id
    addonplus_m1_on: number,//增购plus 模式一 0 关闭，1 开启
    addonplus_m1_max_times: number,//增购最大次数
    addonplus_m1_limit: number,//增购限制筹码
    total_addonplus_m1_times: number,//总增购次数
    addonplus_m2_on: number,//增购模式2 0 关闭，1 开启
    addonplus_m2_max_times: number,//增购限制最大次数
    addonplus_m2_max_bl: number,//增购 截止盲注
    total_addonplus_m2_times: number,//增购总次数
    buy_ratio: number,//买入倍率
    pre_buyin_bonus: number,//赛前报名多得记分牌
    tablecloth_tag: string,//桌布id
    limit_tag: string,//相同比赛检测tag
}

export type TMttDetailPlayerStatus = {
    left_rebuy_times: number,//剩余重购次数
    chip: number,//桌上记分牌
    store: number,//存储记分牌
    init_score: number,//初始化记分牌
    partial_enable: boolean,//是否允许部分带入
}

export type TMttDetailPlayerMore = {
    ante: number,//当前前注
    nante: number,//下一前注
    bl: number,//当前盲注等级
    nbl: number,//下一盲注等级
    sb: number,//当前小盲
    nsb: number,//下一小盲
    prize_pool: number,//奖池
}


export type TMttRealPrizeData = {
    dynamic: boolean,//是否是动态
    award: number,//总奖池
    award_type: number,//奖励类型
    award_num: number,//奖励圈人数
    participants: number,//参与人数
    next_award_count: number,//1. 如果是动态奖池 其实是下一等级参与人数, 会影响奖励人数  2. 如果是静态奖池 是下一个等级的买入人次, 会影响奖励人数
    prizes: Array<TMttRealPrizeItem>,
}

export type TMttRealPrizeItem = {
    min: number,//最小名次
    max: number,//最大名次
    award: number,//奖励
    goods: Array<TMttRealPrize>,
}

export type TMttRealPrize = {
    i: number,//道具id
    na: string,//道具名称
    v: number,//价值等价货币
    n: number,//数量
}



export type TMttRoomsData = {
    limit: number,//条目
    offset: number,//开始下标。例子（offset=0，limit=10，0-9。）
    total: number,//总人数
    records: Array<TMttRoomsDeskItem>,  // 玩家列表
}
export type TMttRoomsDeskItem = {
    rid: number,//进入MTT房间id
    service_id: string,//用于查询IP列表IP Port
    roomers: Array<TMttRoomsDeskPlayer>,//玩家列表
}
export type TMttRoomsDeskPlayer = {
    uid: number,//玩家id
    chip: number,//玩家筹码
    seat: number,//玩家座位号
}