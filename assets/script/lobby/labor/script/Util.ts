/*
 * @Author: xfj
 * @Date: 2021-03-26 13:32:28
 * @LastEditTime: 2022-10-29 14:07:04
 * @LastEditors: Please set LastEditors
 * @Description: 工具
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/Util.ts
 */

import { CALENDAR } from './Interface';

export class Util {
    /**
     * 是否闰年
     * @param year 年份
     * @returns
     */
    public static isLeapYear(year: number) {
        var date = new Date(year, 1, 29);
        return date.getDate() === 29;
    }

    /**
     * 深拷贝时间
     * @param date
     * @returns
     */
    public static cloneDate(date: Date): Date {
        return new Date(date.valueOf());
    }

    /**
     * 下一日、下一周、下一月、下一年
     * @param date 待处理时间
     * @param type 类型
     * @returns
     */
    public static nextDate(date: Date, type: CALENDAR = CALENDAR.DAY): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        switch (type) {
            case CALENDAR.YEAR:
                {
                    // 1
                    // date = new Date(date.setFullYear(year + 1));

                    // 2 优化版
                    year++;
                    date = new Date(year, month + 1, 0);
                    if (day <= date.getDate()) {
                        date = new Date(year, month, day);
                    }
                }
                break;
            case CALENDAR.MONTH:
                {
                    // 1
                    // date = new Date(date.setMonth(month + 1));

                    // 2
                    // month++;
                    // if (month === 12) {
                    // 	year++;
                    // 	month = 0;
                    // }
                    // date = new Date(year, month + 1, 0);

                    // 优化
                    month++;
                    date = new Date(year, month + 1, 0);

                    if (day <= date.getDate()) {
                        date = new Date(year, month, day);
                    }
                }
                break;
            case CALENDAR.DAY:
                {
                    date = new Date(date.setDate(day + 1));
                }
                break;
            case CALENDAR.WEEK:
                {
                    date = new Date(date.setDate(day + 7));
                }
                break;

            default:
                break;
        }
        return date;
    }
    public static nextYear(date: Date, type: CALENDAR = CALENDAR.DAY): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        year++;
        date = new Date(year, month + 1, 0);
        if (day <= date.getDate()) {
            date = new Date(year, month, day);
        }
        return date;
    }

    public static lastYear(date: Date, type: CALENDAR = CALENDAR.DAY): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        year--;
        date = new Date(year, month + 1, 0);
        if (day <= date.getDate()) {
            date = new Date(year, month, day);
        }
        return date;
    }

    /**
     * 上一日、上一周、上一月、上一年
     * @param date 待处理时间
     * @param type 类型
     * @returns
     */
    public static lastDate(date: Date, type: CALENDAR = CALENDAR.DAY): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        switch (type) {
            case CALENDAR.YEAR:
                {
                    // 1
                    // date = new Date(date.setFullYear(year - 1));

                    // 2 优化版
                    year--;
                    date = new Date(year, month + 1, 0);
                    if (day <= date.getDate()) {
                        date = new Date(year, month, day);
                    }
                }
                break;
            case CALENDAR.MONTH:
                {
                    // 1
                    // date = new Date(date.setMonth(month - 1));

                    // 2 优化版
                    // month--;
                    // if (month === -1) {
                    // 	year--;
                    // 	month = 11;
                    // }
                    // date = new Date(year, month + 1, 0);

                    // 3 优化
                    month--;
                    date = new Date(year, month + 1, 0);

                    if (day <= date.getDate()) {
                        date = new Date(year, month, day);
                    }
                }
                break;
            case CALENDAR.DAY:
                {
                    date = new Date(date.setDate(day - 1));
                }
                break;
            case CALENDAR.WEEK:
                {
                    date = new Date(date.setDate(day - 7));
                }
                break;

            default:
                break;
        }
        return date;
    }
}

export class UIUtil {
    /**
     * 通过名字单独显示子节点
     * @param name 要单独显示的节点的名字
     * @param target 目标节点
     */
    public static showAloneChildByName(name: string, target: cc.Node) {
        for (const iterator of target.children) {
            iterator.active = false;
            if (iterator.name === name) {
                iterator.active = true;
            }
        }
    }
}
