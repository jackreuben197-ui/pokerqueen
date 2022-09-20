/*
 * @Author: xfj
 * @Date: 2022-09-05 15:28:55
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-05 18:05:29
 * @FilePath: /pokerqueen/assets/script/helper/TimeHelper.ts
 */

import { match } from "assert";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TimeHelper {
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
            return "00:00:" + pNum.ToString();
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
}
