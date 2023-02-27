/*
 * @Author: xfj
 * @Date: 2022-12-25 21:27:26
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-27 11:31:08
 * @FilePath: /pokerqueen/assets/script/frame/data/rate/RateConfig.ts
 */


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
export const dcjfpConfig = [
    { type: 0, desc: "自动", model: 1 },
    { type: 0, desc: "手动", model: 2 },
]
export const zxbljfpbsConfig = [
    { type: 0, desc: "1", model: 1 },
    { type: 0, desc: "2", model: 2 },
    { type: 0, desc: "3", model: 3 },
    { type: 0, desc: "4", model: 4 },
]

export const jslxConfig = [
    { type: 0, desc: "按把抽", model: 1 },
    { type: 0, desc: "按局抽", model: 2 },
]
export const zwslConfig = [
    { type: 0, desc: "2人", model: 2 },
    { type: 0, desc: "3人", model: 3 },
    { type: 0, desc: "4人", model: 4 },
    { type: 0, desc: "5人", model: 5 },
    { type: 0, desc: "6人", model: 6 },
    { type: 0, desc: "7人", model: 7 },
    { type: 0, desc: "8人", model: 8 },
    { type: 0, desc: "9人", model: 9 },
]
export const straddleConfig = [
    { type: 0, desc: "2", model: 2 },
    { type: 0, desc: "3", model: 3 },
    { type: 0, desc: "4", model: 4 },
    { type: 0, desc: "5", model: 5 },
    { type: 0, desc: "6", model: 6 },

]
export const dxmConfig = [
    [0.1, 0.2, 0.3, 0.4, 0.5],
    [1, 2, 3, 4, 5],
    [10, 15, 20, 25, 30, 50],
    [100, 200, 300, 500, 1000]
]
// export const clubListConfig = [
//     //type 0 不显示 1上 2 下
//     { type: 1, desc: "创建时间", model: 1 },
//     { type: 2, desc: "创建时间", model: 1 },
//     { type: 1, desc: "在线成员数", model: 2 },
//     { type: 2, desc: "在线成员数", model: 2 },
//     { type: 1, desc: "当前牌桌数", model: 3 },
//     { type: 2, desc: "当前牌桌数", model: 3 },
// ]




//新版  下拉框配置
//战绩赛选
export const careerConfig = [
    //type 0 不显示 1上 2 下
    { type: 0, desc: "UICareer_uc", model: 1 },
    { type: 0, desc: "UICareer_ustd", model: 2 },
]

export const clubListConfig = [
    //type 0 不显示 1上 2 下
    { type: 0, desc: "UIGuild_FilterName001", model: 1 },
    { type: 0, desc: "UIGuild_FilterName002", model: 2 },
    { type: 0, desc: "UIGuild_FilterName003", model: 3 },

]
export const memberSortConfig = [
    //type 0 不显示 1上 2 下
    { type: 0, desc: "UIGuild_FilterName001", model: 1 },
    { type: 0, desc: "UIGuild_FilterName002", model: 2 },
    { type: 0, desc: "UIGuild_FilterName003", model: 3 },

]




