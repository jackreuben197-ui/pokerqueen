

import Day from './Day';
import Data from './Data';
import CCPoolManager from '../plug-in/Pool/CCPoolManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Month extends cc.Component {
    @property({ type: cc.Node, tooltip: '内容' })
    content: cc.Node = null;

    @property({ type: cc.Label, tooltip: '月份' })
    tip: cc.Label = null;

    private list: cc.Node[] = [];

    /**
     * 创建上月
     */
    createLastMonth(year: number, month: number, isTouch: boolean = true, opacity: number = 100) {
        // 上月末
        let lastMonthEnd = new Date(year, month, 0);
        // 上月日数
        let lastMonthDay = lastMonthEnd.getDate();
        // 上月末周几
        let lastMontWeek = lastMonthEnd.getDay();
        if (lastMontWeek < 6) {
            for (let index = lastMontWeek; index > -1; index--) {
                let day = CCPoolManager.getInstance().get('day');
                day.getComponent(Day).initDay(lastMonthDay - index);
                day.getComponent(Day).showBackground();
                day.getComponent(Day).showDay();
                day.parent = this.content;
                day.opacity = opacity;
                this.list.push(day);
                day.scale = 1;

                if (isTouch) {
                    day.on(
                        cc.Node.EventType.TOUCH_START,
                        function () {
                            for (const day of this.list) {
                                day.getComponent(Day).showBackground();
                            }
                            day.getComponent(Day).showBackground(true);
                        },
                        this,
                    );

                    day.on(
                        cc.Node.EventType.TOUCH_END,
                        function () {
                            Data.getInstance().selDate = new Date(year, month - 1, lastMonthDay - index);
                            console.log(Data.getInstance().selDate);
                            cc.director.emit('show');
                        },
                        this,
                    );
                }
            }
        }
    }

    /**
     * 创建本月
     */
    createNowMonth(year: number, month: number, isTouch: boolean = true, opacity: number = 255) {
        // 本月末
        let lastMonthEnd = new Date(year, month + 1, 0);
        // 本月日数
        let nowMonthDay = lastMonthEnd.getDate();
        // 本月标志
        let isNowMonth = Data.getInstance().isNowMonth(month);
        for (let index = 1; index < nowMonthDay + 1; index++) {
            let day = CCPoolManager.getInstance().get('day');
            day.getComponent(Day).initDay(index);
            day.getComponent(Day).showBackground();
            day.getComponent(Day).showDay();
            day.parent = this.content;
            day.opacity = opacity;
            this.list.push(day);
            day.scale = 1;

            if (isNowMonth) {
                if (Data.getInstance().isNowDay(index)) {
                    day.getComponent(Day).showDay(cc.Color.RED);
                }
            }

            if (Data.getInstance().isSel(year, month, index)) {
                day.getComponent(Day).showBackground(true);
            }

            if (isTouch) {
                day.on(
                    cc.Node.EventType.TOUCH_END,
                    function () {
                        for (const day of this.list) {
                            day.getComponent(Day).showBackground();
                        }
                        day.getComponent(Day).showBackground(true);
                        Data.getInstance().selDate = new Date(year, month, index);
                        console.log(Data.getInstance().selDate);
                        cc.director.emit('title');
                    },
                    this,
                );
            }
        }
    }

    /**
     * 创建下月
     */
    createNextMonth(year: number, month: number, isTouch: boolean = true, opacity: number = 100) {
        // 下月初
        let nextMonthStart = new Date(year, month + 1, 1);
        // 下月初周几
        let nextMonthWeek = nextMonthStart.getDay();
        if (nextMonthWeek > 0) {
            for (let index = 1; index < 8 - nextMonthWeek; index++) {
                let day = CCPoolManager.getInstance().get('day');
                day.getComponent(Day).initDay(index);
                day.getComponent(Day).showBackground();
                day.getComponent(Day).showDay();
                day.parent = this.content;
                day.opacity = opacity;
                this.list.push(day);
                day.scale = 1;

                if (isTouch) {
                    day.on(
                        cc.Node.EventType.TOUCH_START,
                        function () {
                            for (const day of this.list) {
                                day.getComponent(Day).showBackground();
                            }
                            day.getComponent(Day).showBackground(true);
                        },
                        this,
                    );

                    day.on(
                        cc.Node.EventType.TOUCH_END,
                        function () {
                            Data.getInstance().selDate = new Date(year, month + 1, index);
                            console.log(Data.getInstance().selDate);
                            cc.director.emit('show');
                        },
                        this,
                    );
                }
            }
        }
    }

    // 显示月份
    showTip(value: string = '') {
        this.tip.string = value;
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_END);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);
        this.node.scale = 1;
        this.showTip();

        for (const day of this.list) {
            CCPoolManager.getInstance().put(day, true);
        }
        this.list.length = 0;
    }
}
