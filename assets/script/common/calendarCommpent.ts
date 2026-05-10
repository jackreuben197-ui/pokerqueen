/*
 * @Author: xfj
 * @Date: 2023-04-19 10:13:09
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-25 12:38:00
 * @FilePath: /pokerqueen/assets/script/common/calendarCommpent.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import { stringify } from 'querystring';
import { UIDefine } from '../define/UIDefine';
import { StringHelper } from '../helper/StringHelper';
import TimeHelper from '../helper/TimeHelper';
import UIBase from '../ui/UIBase';
import UIComponent from '../ui/UIComponent';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/common/calendarCommpent')
export default class calendarCommpent extends UIBase {
    private cb: Function = null;
    @property(cc.ScrollView)
    year: cc.ScrollView = null;
    @property(cc.Node)
    yearContent: cc.Node = null;
    @property(cc.ScrollView)
    month: cc.ScrollView = null;
    @property(cc.Node)
    monthContent: cc.Node = null;
    @property(cc.ScrollView)
    day: cc.ScrollView = null;
    @property(cc.Node)
    dayContent: cc.Node = null;
    _selectYear = 2023;
    _selectMonth = 4;
    _selectDay = 18;
    _starOff = 440;
    _defaultYear = 10;
    @property(cc.Node)
    item: cc.Node = null;

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.cb = param.cb;
        this.year.node.on('scroll-ended', this.yearScrollEnd, this);
        this.month.node.on('scroll-ended', this.monthScrollEnd, this);
        this.day.node.on('scroll-ended', this.dayScrollEnd, this);
        this.initYear();
        this.initMonth();
        this.initDay();
    }

    close() {
        UIComponent.close(UIDefine.calendarCommpent);
    }

    okBtn() {
        let _date = new Date(this._selectYear, this._selectMonth - 1, this._selectDay);
        if (this.cb) {
            this.cb(_date);
        }
        UIComponent.close(UIDefine.calendarCommpent);
    }

    initYear() {
        this.yearContent.removeAllChildren();
        this._selectYear = new Date().getFullYear();
        for (let index = 1; index < 12; index++) {
            const element = cc.instantiate(this.item);
            // this.year.addPage(element)
            element.parent = this.yearContent;
            this.initItem(element, this._selectYear - this._defaultYear + index);
        }
        this.yearContent.y = (this._defaultYear - 1) * 130 + this._starOff;
        this.setOp(this.yearContent, this._defaultYear - 1);
    }

    yearScrollEnd() {
        let off = this.yearContent.y - this._starOff;
        let index = Math.round(off / 130);
        index = index < 0 ? 0 : index;
        this._selectYear = new Date().getFullYear() - this._defaultYear + index + 1;
        this.yearContent.y = index * 130 + this._starOff;
        this.setOp(this.yearContent, index);
        this.initDay();
    }

    initMonth() {
        this.monthContent.removeAllChildren();
        this._selectMonth = new Date().getMonth() + 1;
        for (let index = 1; index < 13; index++) {
            const element = cc.instantiate(this.item);
            element.parent = this.monthContent;
            this.initItem(element, index);
        }
        this.setOp(this.monthContent, this._selectMonth - 1);
        this.monthContent.y = new Date().getMonth() * 130 + this._starOff;
    }

    monthScrollEnd() {
        let off = this.monthContent.y - this._starOff;
        let index = Math.round(off / 130);
        index = index < 0 ? 0 : index;
        this.setOp(this.monthContent, index);
        this._selectMonth = index + 1;
        this.monthContent.y = index * 130 + this._starOff;
        this.initDay();
    }

    initDay() {
        this.dayContent.removeAllChildren();
        let dayNum = 30;
        if (this._selectMonth == 2) {
            if (this.isLeapYear()) {
                dayNum = 29;
            } else {
                dayNum = 28;
            }
        } else {
            dayNum = this.monthDayNum();
        }
        for (let index = 1; index <= dayNum; index++) {
            const element = cc.instantiate(this.item);
            element.parent = this.dayContent;
            this.initItem(element, index);
        }
        this._selectDay = new Date().getDate();
        this.dayContent.y = (new Date().getDate() - 1) * 130 + this._starOff;
        this.setOp(this.dayContent, this._selectDay - 1);
    }

    dayScrollEnd() {
        let off = this.dayContent.y - this._starOff;
        let index = Math.round(off / 130);
        index = index < 0 ? 0 : index;
        this._selectDay = index + 1;
        this.dayContent.y = index * 130 + this._starOff;
        this.setOp(this.dayContent, index);
    }

    initItem(node: cc.Node, num: number) {
        node.getChildByName('num').getComponent(cc.Label).string = String(num);
    }

    isLeapYear() {
        let date = new Date(this._selectYear, 1, 29);
        return date.getDate() === 29;
    }

    monthDayNum() {
        let num = 30;
        switch (this._selectMonth) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                num = 31;
                break;
            default:
                break;
        }
        return num;
    }

    setOp(node: cc.Node, _index: number) {
        node.children.forEach((item: cc.Node, index: number) => {
            item.opacity = index == _index ? 255 : 150;
        });
    }
}
