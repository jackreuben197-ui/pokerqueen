/*
 * @Author: xfj
 * @Date: 2021-04-15 13:51:49
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-10-29 14:05:13
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/ComboBox.ts
 */

// js
// Date.prototype.format = function (fmt) {
// 	var o = {
// 		'M+': this.getMonth() + 1, //月份
// 		'd+': this.getDate(), //日
// 		'h+': this.getHours(), //小时
// 		'm+': this.getMinutes(), //分
// 		's+': this.getSeconds(), //秒
// 		'q+': Math.floor((this.getMonth() + 3) / 3), //季度
// 		S: this.getMilliseconds(), //毫秒
// 	};

// 	//  获取年份
// 	// ①
// 	if (/(y+)/i.test(fmt)) {
// 		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
// 	}

// 	for (var k in o) {
// 		// ②
// 		if (new RegExp('(' + k + ')', 'i').test(fmt)) {
// 			fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
// 		}
// 	}
// 	return fmt;
// };

export default class DatePlus {
    // 日期
    private date: Date;
    public constructor(date?: Date) {
        this.date = date ? date : new Date();
    }

    /**
     * 格式化
     * @param fmt
     * @returns
     */
    public format(fmt: string = 'yyyy-mm-dd'): string {
        let _date = this.date;

        var o = {
            'M+': _date.getMonth() + 1, //月份
            'd+': _date.getDate(), //日
            'h+': _date.getHours(), //小时
            'm+': _date.getMinutes(), //分
            's+': _date.getSeconds(), //秒
            'q+': Math.floor((_date.getMonth() + 3) / 3), //季度
            S: _date.getMilliseconds(), //毫秒
        };

        //  获取年份
        // ①
        if (/(y+)/i.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            // ②
            if (new RegExp('(' + k + ')', 'i').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
            }
        }
        return fmt;
    }
}
