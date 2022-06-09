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
}
