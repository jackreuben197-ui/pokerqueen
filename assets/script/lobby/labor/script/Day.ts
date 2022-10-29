/*
 * @Author: xfj
 * @Date: 2021-03-25 11:06:20
 * @LastEditTime: 2022-10-29 15:35:57
 * @LastEditors: Please set LastEditors
 * @Description: 日
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/Day.ts
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class Day extends cc.Component {
    @property(cc.Node)
    day: cc.Node = null;
    @property(cc.Node)
    background: cc.Node = null;

    private days: number = 1;

    initDay(day: number) {
        this.days = day;
        this.day.getComponent(cc.Label).string = String(day);
    }

    // 显示背景
    showBackground(bool = false) {
        this.background.active = bool;
    }
    // 显示字体
    showDay(color: cc.Color = cc.Color.WHITE) {
        this.day.active = true;
        this.day.color = color;
    }
    // 隐藏背景
    hideBackground() {
        this.background.active = false;
    }
    // 隐藏字体
    hideDay() {
        this.day.active = false;
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);

        this.node.opacity = 255;
        this.node.scale = 1;
    }
}
