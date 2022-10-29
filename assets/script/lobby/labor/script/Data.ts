/*
 * @Author: xfj
 * @Date: 2021-04-15 13:51:49
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-29 14:06:15
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/Data.ts
 */
import { CALENDAR } from './Interface';

export default class Data {
    /**
     * 声明静态类
     */
    private static instance: Data;

    /**
     * static 会将它挂载类上，而不是实例上
     * @returns
     */
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Data();
        }
        return this.instance;
    }

    // 实时日期
    public nowDate: Date;
    // 显示日期
    public selDate: Date;
    // 日历类型
    public cutType: CALENDAR;

    /**
     * 因为 constructor是 private，故外部无法直接 new。
     */
    private constructor() {
        this.cutType = CALENDAR.MONTH;

        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();

        this.nowDate = new Date(year, month, day);
        this.selDate = new Date(year, month, day);
    }

    /**
     * 当前日期与实时日期是否在同年同月
     * @param day
     * @returns
     */
    public isNowMonth(month: number) {
        if (this.nowDate.getFullYear() === this.selDate.getFullYear() && this.nowDate.getMonth() === month) {
            return true;
        }
        return false;
    }

    /**
     * 当前日期与实时日期是否在同年同月同日
     * @param day
     * @returns
     */
    public isNowDay(day: number) {
        if (this.nowDate.getFullYear() === this.selDate.getFullYear() && this.nowDate.getMonth() === this.selDate.getMonth()) {
            if (this.nowDate.getDate() === day) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否与选择日期在同年同月同日
     * @param year
     * @param month
     * @param day
     * @returns
     */
    public isSel(year: number, month: number, day: number) {
        if (this.selDate.getFullYear() === year && this.selDate.getMonth() === month && this.selDate.getDate() === day) {
            return true;
        }
        return false;
    }
}
