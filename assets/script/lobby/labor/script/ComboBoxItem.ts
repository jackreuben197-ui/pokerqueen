/*
 * @Author: xfj
 * @Date: 2021-04-15 13:51:49
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-29 14:07:14
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/ComboBoxItem.ts
 */

import Data from './Data';
import DatePlus from './DatePlus';
import { CALENDARNAMES } from './Interface';
import ComboBox from './ComboBox';
const { ccclass, property } = cc._decorator;

@ccclass
export default class ComboBoxItem extends cc.Component {
    @property({ type: cc.Label, tooltip: '显示文本' })
    label: cc.Label = null;

    // 下拉框
    private cb: ComboBox = null;
    // 下标
    private index: number = 0;

    /**
     * 初始化下拉框
     * @param cb
     * @param index 下标
     */
    initComboBox(cb: ComboBox, index: number) {
        this.cb = cb;
        this.updateIndex(index);
    }

    /**
     * 更新文本
     * @param index
     */
    updateIndex(index: number) {
        this.index = index;
        let datePlus = new DatePlus(Data.getInstance().selDate);
        this.label.string = datePlus.format(CALENDARNAMES[index]);
    }

    onCallback(event: cc.Event, customEventData: string) {
        if (this.cb) {
            this.cb.comboBoxClicked();
            this.cb.setIndex(this.index);
        }

        cc.director.emit('show');
    }
}
