
import BaseForm from "./BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class $name extends BaseForm {
    /**
     * 节点|组件 定义
     */

    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////
    /**
     * onLoad之后处理的内容
     */
    protected lateLoad() {
        super.lateLoad();
    }
    /**
     * 关闭需要处理的内容
     */
    protected lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param: any = null) {
        super.onShow(param);
    }
    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {

    }
    /**
     * 停止所有 动作，包括 tween ,update，等
     */
    protected stopAllThings() {

    }
}
