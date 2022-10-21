/*
 * @Author: xfj
 * @Date: 2022-09-05 15:28:55
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-29 16:17:01
 * @FilePath: /pokerqueen/assets/script/helper/TimeHelper.ts
 */

import { match } from "assert";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TimeHelper {
    //当前毫秒
    public static Now() {
        return new Date().getTime();
    }
    //当前秒
    public static NowS() {
        return (new Date().getTime() / 1000) ^ 0;
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
            return pNum.toString() + '秒';
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
        let MM = this._zeroNum(date.getMonth() + 1);
        let dd = this._zeroNum(date.getDate());
        let HH = this._zeroNum(date.getHours());
        let mm = this._zeroNum(date.getMinutes());
        let result = format;
        result = result.replace("MM", MM);
        result = result.replace("dd", dd);
        result = result.replace("HH", HH);
        result = result.replace("mm", mm);
        return result;
    }

    public static _zeroNum(num: number): string {
        return `${num < 10 ? 0 : ""}${num}`;
    }
}
(window as any).TimeHelper = TimeHelper;