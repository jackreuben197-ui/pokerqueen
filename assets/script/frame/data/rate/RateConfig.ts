

export const RateConfig = [
    { country: "USD", flag: "$", path: "rate_USD", desc: "美元" },
    { country: "CNY", flag: "￥", path: "rate_CNY", desc: "人民币" },
    { country: "VND", flag: "₫", path: "rate_VND", desc: "越南盾" },
    { country: "THB", flag: "฿", path: "rate_THB", desc: "泰铢" },
]
export const memberAdminConfig = [
    //type 0 不显示 1上 2 下
    { type: 1, desc: "输赢值", model: 1 },
    { type: 2, desc: "输赢值", model: 1 },
    { type: 1, desc: "手数", model: 2 },
    { type: 2, desc: "手数", model: 2 },
    { type: 1, desc: "服务费", model: 3 },
    { type: 2, desc: "服务费", model: 3 },
    { type: 1, desc: "最后登录时间", model: 4 },
    { type: 2, desc: "最后登录时间", model: 4 },
]
export const memberRoleConfig = [
    //type 0 不显示 1上 2 下
    //用户等级 0 普通 1会长  3管理员 4代理
    { type: 0, desc: "管理员", model: 3 },
    { type: 0, desc: "贵宾", model: 4 },
    { type: 0, desc: "成员", model: 0 },
]
