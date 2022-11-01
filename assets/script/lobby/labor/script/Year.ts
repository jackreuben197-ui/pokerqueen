/*
 * @Author: xfj
 * @Date: 2021-04-09 13:30:49
 * @LastEditTime: 2022-10-29 14:07:12
 * @LastEditors: Please set LastEditors
 * @Description: 年
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/Year.ts
 */

import Data from './Data';
import Month from './Month';
import { CALENDAR } from './Interface';
import CCPoolManager from '../plug-in/Pool/CCPoolManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Year extends cc.Component {
    @property({ type: cc.Node, tooltip: '内容' })
    content: cc.Node = null;

    private list: cc.Node[] = [];

    /**
     * 初始化年
     * @param year
     */
    initYear(year: number) {
        for (let index = 0; index < this.content.childrenCount; index++) {
            let month = CCPoolManager.getInstance().get('month');
            month.getComponent(Month).createLastMonth(year, index, false, 0);
            month.getComponent(Month).createNowMonth(year, index, false);
            month.getComponent(Month).createNextMonth(year, index, false, 0);
            month.getComponent(Month).showTip(this.content.children[index].name);
            month.parent = this.content.children[index];
            this.list.push(month);
            month.scale = 0.3;

            month.on(
                cc.Node.EventType.TOUCH_END,
                function () {
                    let year = Data.getInstance().selDate.getFullYear();
                    let maxDay = new Date(year, index + 1, 0).getDate();
                    let day = Data.getInstance().selDate.getDate();
                    if (day > maxDay) {
                        day = maxDay;
                    }

                    Data.getInstance().cutType = CALENDAR.MONTH;
                    Data.getInstance().selDate = new Date(year, index, day);
                    console.log(Data.getInstance().selDate);

                    cc.director.emit('show');
                },
                this,
            );
        }
    }

    onDisable() {
        for (const month of this.list) {
            CCPoolManager.getInstance().put(month, true);
        }
        this.list.length = 0;
    }
}
