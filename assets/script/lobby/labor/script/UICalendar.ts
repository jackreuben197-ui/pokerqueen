/*
 * @Author: xfj
 * @Date: 2021-03-26 13:56:23
 * @LastEditTime: 2022-10-29 14:07:00
 * @LastEditors: Please set LastEditors
 * @Description: 入口
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/UICalendar.ts
 */

import Day from './Day';
import Data from './Data';
import Year from './Year';
import Month from './Month';
import { Util } from './Util';
import { CALENDAR } from './Interface';
import CCPoolManager from '../plug-in/Pool/CCPoolManager';
// import ComboBox from '../plug-in/ComboBox/comboBox/ComboBox';
import ComboBox from './ComboBox';
import UIBase from '../../../ui/UIBase';

const { ccclass, property } = cc._decorator;
@ccclass
export default class UICalendar extends UIBase {
    @property({ type: cc.Node, tooltip: '下拉框' })
    combo: cc.Node = null;
    @property({ type: cc.Node, tooltip: '内容' })
    content: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: '预支体-年' })
    pYear: cc.Prefab = null;
    @property({ type: cc.Prefab, tooltip: '预支体-月' })
    pMonth: cc.Prefab = null;
    @property({ type: cc.Prefab, tooltip: '预支体-日' })
    pTay: cc.Prefab = null;

    private year: cc.Node = null;
    private month: cc.Node = null;
    private day: cc.Node = null;

    onLoad() {
        CCPoolManager.getInstance().init('day', this.pTay, 366);
        CCPoolManager.getInstance().init('month', this.pMonth, 12);
        CCPoolManager.getInstance().init('year', this.pYear, 1);
    }

    start() {
        this.show();
    }

    onEnable() {
        let self = this;
        cc.director.on('title', function () {
            self.combo.getComponent(ComboBox).setIndex();
            self.combo.getComponent(ComboBox).updateItems();
        });

        cc.director.on('show', function () {
            self.show();
        });
    }

    onDisable() {
        cc.director.off('title');
        cc.director.off('show');
    }

    show() {
        // if (this.year) {
        //     CCPoolManager.getInstance().put(this.year);
        //     this.year = null;
        // }
        if (this.month) {
            CCPoolManager.getInstance().put(this.month);
            this.month = null;
        }
        if (this.day) {
            CCPoolManager.getInstance().put(this.day);
            this.day = null;
        }

        this.combo.getComponent(ComboBox).setIndex();
        this.combo.getComponent(ComboBox).updateItems();
        switch (Data.getInstance().cutType) {
            case CALENDAR.DAY:
                {
                    this.setDay();
                }
                break;
            case CALENDAR.MONTH:
                {
                    this.setMonth();
                }
                break;
            case CALENDAR.YEAR:
                {
                    this.setYear();
                }
                break;
            default:
                break;
        }
    }

    // 设置年
    setYear() {
        if (this.year === null) {
            this.year = CCPoolManager.getInstance().get('year');
        }
        let year = Data.getInstance().selDate.getFullYear();
        this.year.getComponent(Year).initYear(year);
        this.year.parent = this.content;
    }

    // 设置月
    setMonth() {
        if (this.month === null) {
            this.month = CCPoolManager.getInstance().get('month');
        }
        let year = Data.getInstance().selDate.getFullYear();
        let month = Data.getInstance().selDate.getMonth();

        this.month.getComponent(Month).createLastMonth(year, month);
        this.month.getComponent(Month).createNowMonth(year, month);
        this.month.getComponent(Month).createNextMonth(year, month);
        this.month.setPosition(cc.Vec3.ZERO);
        this.month.parent = this.content;
    }

    // 设置周
    setWeek() { }

    // 设置日
    setDay() {
        if (this.day === null) {
            this.day = CCPoolManager.getInstance().get('day');
        }
        let day = Data.getInstance().selDate.getDate();
        this.day.getComponent(Day).initDay(day);
        this.day.getComponent(Day).hideBackground();
        this.day.getComponent(Day).showDay();
        this.day.setPosition(cc.Vec3.ZERO);
        this.day.parent = this.content;
        this.day.scale = 3;
        this.day.on(
            cc.Node.EventType.TOUCH_END,
            function () {
                Data.getInstance().cutType = CALENDAR.MONTH;
                this.show();

            },
            this,
        );
    }

    onCallBack(event: cc.Event, customEventData: string) {
        let date = Data.getInstance().selDate;
        let type = Data.getInstance().cutType;

        switch (customEventData) {
            case 'last':
                let last = Util.lastDate(date, type);
                Data.getInstance().selDate = Util.cloneDate(last);
                break;
            case 'next':
                let next = Util.nextDate(date, type);
                Data.getInstance().selDate = Util.cloneDate(next);
                break;
            case 'last1':
                let last1 = Util.lastYear(date, type);
                Data.getInstance().selDate = Util.cloneDate(last1);
                break;
                break;
            case 'next1':
                let next1 = Util.nextYear(date, type);
                Data.getInstance().selDate = Util.cloneDate(next1);
                break;
            default:
                break;
        }
        this.show();

    }
}
