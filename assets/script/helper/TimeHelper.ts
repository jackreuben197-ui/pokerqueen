/*
 * @Author: xfj
 * @Date: 2022-09-05 15:28:55
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-29 16:23:42
 * @FilePath: /pokerqueen/assets/script/helper/TimeHelper.ts
 */

import { match } from "assert";
import { i18nMgr } from "../i18n/i18nMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TimeHelper {
    //当前毫秒
    public static get Now() {
        return new Date().getTime();
    }
    //当前秒
    public static get NowS() {
        return (new Date().getTime() / 1000) ^ 0;
    }
    public static convertUTCTimeToLocalTime(UTCDateString, separated = '-', isNeedMin = true) {
        let date2 = new Date(UTCDateString);     //这步是关键
        let year = date2.getFullYear();
        let formatFunc = (str) => {    //格式化显示
            return str > 9 ? str : '0' + str
        }
        let mon = formatFunc(date2.getMonth() + 1);
        let day = formatFunc(date2.getDate());
        let hour = date2.getHours();
        // let noon = hour >= 12 ? 'PM' : 'AM';
        // hour = hour >= 12 ? hour - 12 : hour;
        hour = formatFunc(hour);
        let min = formatFunc(date2.getMinutes());
        let dateStr = year + separated + mon + separated + day
        if (isNeedMin) {
            dateStr = dateStr + ' ' + hour + ':' + min;
        }
        return dateStr;
    }

    public static RFC3339TimeConvertToUTCTime(rfc3339Time) {
        let t = Date.parse(rfc3339Time)    //   DateTime.Parse(rfc3339Time).ToUniversalTime();
        return t;
    }

    public static ShowRemainingSemicolon(pNum) {//1小时3600秒      1天86400秒
        if (pNum >= 3600)//>1小时
        {


            let tHour = Math.floor(pNum / 3600);
            let tMinutes = Math.floor(pNum % 3600 / 60);
            let tseconds = Math.floor(pNum % 3600 % 60);
            return tHour.toString().padStart(2, '0') + ":" + tMinutes.toString().padStart(2, '0') + ":" + tseconds.toString().padStart(2, '0');
        }
        else if (pNum >= 60)//>1分钟
        {
            let tMinutes = Math.floor(pNum / 60);
            let tseconds = Math.floor(pNum % 60);
            return "00:" + tMinutes.toString().padStart(2, '0') + ":" + tseconds.toString().padStart(2, '0');

        }
        else if (pNum < 60) {
            return "00:00:" + pNum.toString();
        }
        return "";
    }
    public static ShowRemainingSemicolon2(pNum) {//1小时3600秒      1天86400秒
        if (pNum >= 3600)//>1小时
        {
            let tHour = Math.floor(pNum / 3600);
            let tMinutes = Math.floor(pNum % 3600 / 60);
            let tseconds = Math.floor(pNum % 3600 % 60);
            return tHour.toString().padStart(2, '0') + "小时" + tMinutes.toString().padStart(2, '0') + "分钟" + tseconds.toString().padStart(2, '0') + '秒';
        }
        else if (pNum >= 60)//>1分钟
        {
            let tMinutes = Math.floor(pNum / 60);
            let tseconds = Math.floor(pNum % 60);
            return tMinutes.toString().padStart(2, '0') + "分钟" + tseconds.toString().padStart(2, '0') + '秒';

        }
        else if (pNum < 60) {
            return Math.ceil(pNum).toString() + '秒';
        }
        return "";
    }

    /**
    * 定义延时函数
    * delaytime 延时时长，单位毫秒
    */
    public static Sleep(delaytime = 1000) {
        return new Promise(resolve => setTimeout(resolve, delaytime))
    }

    /**
     * 获取格式化时间  MM/dd HH:mm
     */
    public static TimeToString(time: number, format: string) {
        let date = new Date(time);
        let MM = this.ZeroNum(date.getMonth() + 1);
        let dd = this.ZeroNum(date.getDate());
        let HH = this.ZeroNum(date.getHours());
        let mm = this.ZeroNum(date.getMinutes());
        let result = format;
        result = result.replace("MM", MM);
        result = result.replace("dd", dd);
        result = result.replace("HH", HH);
        result = result.replace("mm", mm);
        return result;
    }

    public static ZeroNum(num: number): string {
        return `${num < 10 ? 0 : ""}${num}`;
    }

    static getYMD(t: number, flag: string = null, isMil: boolean = false) {
        let data = this.getDateStructYMD(t, isMil);
        if (flag) {
            return `${data.year}${flag}${data.month}${flag}${data.day}`;
        }

        if (i18nMgr.isCN) {
            return `${data.year}年${data.month}月${data.day}日`;
        } else {
            return `${this.getMonthENName(data.month)} ${data.day}, ${data.year}`;
        }
    }

    static getMD(t: number, flag: string = null, isMil: boolean = false) {
        let data = this.getDateStructYMD(t, isMil);
        if (flag) {
            return `${data.month}${flag}${data.day}`;
        }

        if (i18nMgr.isCN) {
            return `${data.month}月${data.day}日`;
        } else {
            return `${this.getMonthENName(data.month)} ${data.day}`;
        }
    }

    static getMDHMS(t: number, flag: string = null, isMil: boolean = false) {
        let data = this.getDateStructYMD(t, isMil);
        let hms = this.getDateStructHMS(t, isMil)
        if (flag) {
            return `${data.month}${flag}${data.day}${flag}${hms.hour}${flag}${hms.min}${flag}${hms.sec}`;
        }

        if (i18nMgr.isCN) {
            return `${data.month}月${data.day}日${hms.hour}时${hms.min}分${hms.sec}秒`;
        } else {
            return `${hms.hour}:${hms.min}:${hms.sec} on ${this.getMonthENName(data.month)} ${data.day}`;
        }
    }

    /**
     * 
     * @param t :
     * @param flag 
     * @param isMil 
     * @returns 
     */

    static getHM(t: number, flag: string = null, isMil: boolean = false) {
        let data = this.getDateStructHMS(t, isMil);
        if (flag) {
            return `${data.hour}${flag}${data.min}`;
        }

        if (i18nMgr.isCN) {
            return `${data.hour}时${data.min}分`;
        } else {
            return `${data.hour}:${data.min}`;
        }
    }

    static getHMS(t: number, flag: string = null, isMil: boolean = false) {
        let data = this.getDateStructHMS(t, isMil);
        if (flag) {
            return `${data.hour}${flag}${data.min}${flag}${data.sec}`;
        }
        if (i18nMgr.isCN) {
            return `${data.hour}时${data.min}分${data.sec}秒`;
        } else {
            return `${data.hour}:${data.min}:${data.sec}`;
        }
    }


    static getTimeBefore(t: number, isMil: boolean = false) {
        let subTime = this.NowS - t / (isMil ? 1000 : 1);
        if (subTime < 60) {
            return i18nMgr.isCN ? `${subTime}秒前` : `${subTime}s ago`;
        }
        if (subTime < 60 * 60) {
            return i18nMgr.isCN ? `${Math.floor(subTime / 60)}分钟前` : `${subTime}min ago`;
        }

        if (subTime < 60 * 60 * 24) {
            return i18nMgr.isCN ? `${Math.floor(subTime / 60 / 60)}小时前` : `${subTime}h ago`;
        }
        if (subTime < 60 * 60 * 24 * 365) {
            return i18nMgr.isCN ? `${Math.floor(subTime / 60 / 60 * 24)}天前` : `${subTime}day ago`;
        }
        return i18nMgr.isCN ? `${Math.floor(subTime / 60 / 60 * 24 * 365)}年前` : `${subTime}year ago`;
    }

    static getSubTimeHMS(subTime: number, flag: string = null, isMil: boolean = false) {
        let data = this.getSubDateStructHMS(subTime, isMil);
        if (flag) {
            return `${data.hour}${flag}${data.min}${flag}${data.sec}`;
        }

        if (i18nMgr.isCN) {
            return data.hour + "小时" + data.min + "分钟" + data.sec + "秒";
        } else {
            return `${data.hour}h${data.min}m${data.sec}s`;
        }
    }

    static getSubTimeMS(subTime: number, flag: string = null, isMil: boolean = false) {
        let data = this.getSubDateStructHMS(subTime, isMil);
        if (flag) {
            return `${data.min}${flag}${data.sec}`;
        }
        if (i18nMgr.isCN) {
            return data.min + "分钟" + data.sec + "秒";
        } else {
            return `${data.min}m${data.sec}s`;
        }
    }

    static getSubTimeHM(subTime: number, flag: string = null, isMil: boolean = false) {
        let data = this.getSubDateStructHMS(subTime, isMil);
        if (flag) {
            return `${data.hour}${flag}${data.min}${flag}${data.sec}`;
        }
        if (i18nMgr.isCN) {
            return data.hour + "小时" + data.min + "分钟 ";
        } else {
            return `${data.hour}h${data.min}m`;
        }
    }

    static getSubD(subTime: number, flag: string = null, isMil: boolean = false, isUp: boolean = true) {
        let day = subTime / (24 * 3600 * (isMil ? 1000 : 1));
        day = isUp ? Math.ceil(day) : Math.floor(day);
        if (flag) {
            return `${day}${flag}`;
        }
        if (i18nMgr.isCN) {
            return day + "天";
        } else {
            return `${day}day${day > 1 ? "s" : ""}`;
        }
    }

    static getSubH(subTime: number, flag: string = null, isMil: boolean = false, isUp: boolean = true) {
        let hour = subTime / (3600 * (isMil ? 1000 : 1));
        hour = isUp ? Math.ceil(hour) : Math.floor(hour);
        if (flag) {
            return `${hour}${flag}`;
        }

        if (i18nMgr.isCN) {
            return hour + "小时";
        } else {
            return `${hour}day${hour > 1 ? "s" : ""}`;
        }
    }

    static getSubM(subTime: number, flag: string = null, isMil: boolean = false, isUp: boolean = true) {
        let m = subTime / (60 * (isMil ? 1000 : 1));
        m = isUp ? Math.ceil(m) : Math.floor(m);
        if (flag) {
            return `${m}${flag}`;
        }

        if (i18nMgr.isCN) {
            return m + "分钟";
        } else {
            return `${m}day${m > 1 ? "s" : ""}`;
        }
    }

    static getDays(time: number, isMil: boolean = false) {
        // 0是从8点开始，所以加8；  0点算第二天的开始，所以加一
        time = time / (isMil ? 1000 : 1) + 8 * 60 * 60 + 1;
        return Math.ceil(time / 86400);
    }

    static isToday(time: number, isMil: boolean = false) {
        return this.isSameDay(this.NowS, time, isMil)
    }

    static isYesterday(time: number, isMil: boolean = false) {
        return this.isSameDay(this.NowS - 24 * 60 * 60, time, isMil);
    }

    static isSameDay(milTime1: number, milTime2: number, isMil: boolean = false) {
        let day1 = new Date(milTime1 * (isMil ? 1 : 1000));
        let day2 = new Date(milTime2 * (isMil ? 1 : 1000));
        return (day1.getFullYear() == day2.getFullYear() && day1.getMonth() == day2.getMonth() && day1.getDate() == day2.getDate());
    }

    static getDateStructYMD(t, isMil: boolean = false) {
        let data = new Date(t * (isMil ? 1 : 1000));
        let year = this.toTimeFormat(data.getFullYear());
        let month = this.toTimeFormat(data.getMonth() + 1);
        let day = this.toTimeFormat(data.getDate());
        return { year, month, day };
    }

    private static getDateStructHMS(t, isMil: boolean = false) {
        let data = new Date(t * (isMil ? 1 : 1000));
        let hour = this.toTimeFormat(data.getHours());
        let min = this.toTimeFormat(data.getMinutes());
        let sec = this.toTimeFormat(data.getSeconds());
        return { hour, min, sec };
    }

    private static getSubDateStructHMS(subTime: number, isMil: boolean = false) {
        let subSecond = isMil ? subTime / 1000 : subTime;

        //计算出小时数
        let subDaySecond = subSecond % (24 * 3600)    //计算天数后剩余的秒数
        //计算相差分钟数
        let subHourSecond = subSecond % 3600       //计算小时数后剩余的秒数
        //计算相差秒数
        let subMinSecond = subSecond % 60      //计算分钟数后剩余的秒数

        let hour = this.toTimeFormat(Math.floor(subDaySecond / 3600))
        let min = this.toTimeFormat(Math.floor(subHourSecond / 60))
        let sec = this.toTimeFormat(Math.ceil(subMinSecond))
        return { hour, min, sec };
    }

    private static toTimeFormat(unit: number) {
        return unit >= 0 ? `${unit < 10 ? "0" : ""}${unit}` : "00";
    }

    private static getMonthENName(m) {
        return [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November,",
            "December",
        ][m - 1];
    }


    //格式:余下----5:22:10  小时:分钟:秒</summary>
    public static ShowRemainingSemicolonPure(pNum: number): string {//1小时3600秒      1天86400秒

        let tHour, tMinutes, tseconds;

        if (pNum >= 3600)//>1小时
        {
            tHour = pNum / 3600 ^ 0;
            tMinutes = (pNum % 3600 / 60) ^ 0;
            tseconds = pNum % 3600 % 60;
            return `${this.__PadZero(tHour)}:${this.__PadZero(tMinutes)}:${this.__PadZero(tseconds)}`;
        }
        else if (pNum >= 60)//>1分钟
        {
            tMinutes = pNum / 60 ^ 0;
            tseconds = pNum % 60;
            return `${this.__PadZero(tMinutes)}:${this.__PadZero(tseconds)}`;

        }
        else if (pNum < 60) {
            return `00:${this.__PadZero(pNum)}`
        }
        return "";
    }
    //小于10,前补0
    private static __PadZero(num: number) {
        return num < 10 ? "0" + num : num;
    }

}
(window as any).TimeHelper = TimeHelper;