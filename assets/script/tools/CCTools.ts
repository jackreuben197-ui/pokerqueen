/**
 * 跟引擎相关的辅助工具
 */

export default class CCTools {
    private static _noRepeatNum = 10000;
    /**
     * 触发输入文本框的弹出键盘
     */
    static EditBoxBeginEditing(editBox: cc.EditBox) {
        //@ts-ignore
        editBox._impl.beginEditing();
    }
    /**
     * 获取浏览器参数
     * @param 
     * @returns 
     */
    static getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    /**  
     * 随机min到max的数 连续随机用
     *   max 不传， 返回 0~min-1 的数
     */
     public static random(min?: number, max?: number): number {
        if (!CCTools.isNull(max)) {
            return (Math.floor(Math.random() * (max - min + 1)) + min);
        } else if (!CCTools.isNull(min)) {
            return (Math.floor(Math.random() * min));
        }
        return Math.random();
    }

    //单局不重复的数字
    public static get onceNotRepeatNum() {
        if (CCTools._noRepeatNum == Number.MAX_VALUE) {
            CCTools._noRepeatNum = 10000;
        }
        return CCTools._noRepeatNum++;
    }

    //判空
    public static isNull(obj) {
        if (obj == null || obj == undefined) {
            return true;
        }

        if (obj instanceof Array) {
            return obj.length == 0;
        } else if (obj instanceof Map) {
            return obj.size == 0;
        } else if (obj instanceof Object) {
            for (let k in obj) {
                return false;
            }
            return true;
        } else if (typeof obj == "number") {
            return isNaN(obj);
        } else if (typeof obj == "string") {
            return obj == "";
        }
        return false;
    }

}
