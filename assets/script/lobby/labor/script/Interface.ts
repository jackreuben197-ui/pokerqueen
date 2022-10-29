/*
 * @Author: xfj
 * @Date: 2021-03-26 13:27:45
 * @LastEditTime: 2022-10-29 14:06:52
 * @LastEditors: Please set LastEditors
 * @Description: 接口
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/Interface.ts
 */

// 日历格式
export const CALENDARNAMES = ['yyyy年', 'yyyy年mm月', 'yyyy年mm月dd日'];

// 日期类型
export enum DAYTYPE {
    TODAY = 0,
    YESTERDAY = 1,
    TOMORROW = 2,
    NONE = 3,
}

// 日历类型 日、月、年、周
export enum CALENDAR {
    YEAR = 0,
    MONTH = 1,
    DAY = 2,
    WEEK = 3, // 周 暂未使用
}

// 周 暂未使用
export enum WEEK {
    SUN = 0,
    MON = 1,
    TUE = 2,
    WED = 3,
    THU = 4,
    FEI = 5,
    SAT = 6,
}
