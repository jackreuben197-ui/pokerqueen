/*
 * @Author: xfj
 * @Date: 2021-04-15 13:51:49
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-10-29 14:05:13
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/ComboBox.ts
 */
/*
 *                        .::::.
 *                      .::::::::.
 *                     :::::::::::
 *                  ..:::::::::::'
 *               '::::::::::::'
 *                 .::::::::::
 *            '::::::::::::::..
 *                 ..::::::::::::.
 *               ``::::::::::::::::
 *                ::::``:::::::::'        .:::.
 *               ::::'   ':::::'       .::::::::.
 *             .::::'      ::::     .:::::::'::::.
 *            .:::'       :::::  .:::::::::' ':::::.
 *           .::'        :::::.:::::::::'      ':::::.
 *          .::'         ::::::::::::::'         ``::::.
 *      ...:::           ::::::::::::'              ``::.
 *     ````':.          ':::::::::'                  ::::..
 *                        '.:::::'                    ':'````..
 *
 * @FilePath: \ComboBox\assets\ComboBox.js
 */
import Data from './Data';
import DatePlus from './DatePlus';
import { CALENDARNAMES } from './Interface';
import ComboBoxItem from './ComboBoxItem';
const { ccclass, property } = cc._decorator;

@ccclass
export default class ComboBox extends cc.Component {
    @property({ type: cc.Node, tooltip: '三角形' })
    triangle: cc.Node = null;
    @property({ type: cc.Node, tooltip: '可展示框' })
    dropDown: cc.Node = null;
    @property({ type: cc.Node, tooltip: '内容' })
    content: cc.Node = null;
    @property({ type: cc.Label, tooltip: '显示文本' })
    label: cc.Label = null;

    @property({ type: cc.Prefab, tooltip: 'Item选项' })
    preItem: cc.Prefab = null;

    private isDropDown: boolean = false;

    onLoad() {
        this.dropDown.active = false;

        this.initItems();
    }

    // 初始化 Items
    initItems() {
        for (let i = 0; i < CALENDARNAMES.length; i++) {
            let item = cc.instantiate(this.preItem);
            item.getComponent(ComboBoxItem).initComboBox(this, i);
            item.parent = this.content;
        }
    }

    // 更新 Items
    updateItems() {
        if (this.content.childrenCount) {
            for (let index = 0; index < this.content.childrenCount; index++) {
                const element = this.content.children[index];
                element.getComponent(ComboBoxItem).updateIndex(index);
            }
        }
    }

    // 设置下标
    setIndex(index?: number) {
        if (index !== undefined) {
            Data.getInstance().cutType = index;
        }

        let datePlus = new DatePlus(Data.getInstance().selDate);
        this.label.string = datePlus.format(CALENDARNAMES[Data.getInstance().cutType]);
    }

    // 下拉框显示与隐藏
    comboBoxClicked() {
        this.dropDown.active = this.isDropDown = !this.isDropDown;
        this.rotateTriangle();
    }

    // 旋转小三角形
    rotateTriangle() {
        let rotateAction = this.isDropDown ? cc.rotateTo(0.5, 180) : cc.rotateTo(0.5, 270);
        this.triangle.runAction(rotateAction.easing(cc.easeCubicActionOut()));
    }
}
