/**
 * 跟引擎相关的辅助工具
 */

export default class CCTools {

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

}
