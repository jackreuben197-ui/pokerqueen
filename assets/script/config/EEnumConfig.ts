

export enum ELoginType {
    phone,  //手机号登录
    mail,   //邮箱登录
}

export enum ELoginProcess {
    login,  //登录
    register,   //注册
    reset,  //重置密码
}

export enum EOrderType {
    chongzhi = 1,
    tiqu = 2,
    fafang = 3
}

export enum EOrderOprationStatus {
    agree = 1,
    refused = 2
}

export enum EApplyStatus {
    ing = 1, //-申请中,
    agree = 2, //-同意,
    refused = 3, //-拒绝,
    cancel = 4, //-取消申请）
}

export enum EMttItemStatus {
    create = 0,// 创建，
    run = 1,// 运行，
    end = 2,// 结束，
    cancel = 3,// 取消
}


export enum EMttRealTimeTabType {
    sk = 0,
    pz = 1,
    jl = 2,
    mz = 3
}

export enum EMTTGameType {
    MTT_QUICKGAME,//快速
    MTT_NORMALGAME,//锦标
    MTT_LUXURY,//豪华
    MTT_FREE,//免费
    MTT_110HUNTER,//110滚雪球赛
    MTT_DAILYTICKET,//每日票赛
    MTT_880HUNTER,//880滚雪球赛
    MTT_NEWFREE,//最新免费赛
    MTT_FEATUEEdEVENTS,//8-周1.2特色赛事
    MTT_3FEATUEEdEVENTS,//9-周3特色赛
    MTT_4FEATUEEdEVENTS,//10-周4.5特色赛事
    MTT_6FEATUEEdEVENTS,//11-周6特色赛事
    MTT_7FEATUEEdEVENTS,//12-周7特色赛事
    MTT_GRANDEVENTS,//13-大师赛
    MTT_25EVENTS,//14-25盲注起 带前注
    MTT_50EVENTS,//15-50盲注起 不带前注
}