/*
 * @Author: xfj
 * @Date: 2022-10-18 11:25:01
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-20 13:55:17
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UISetSmallM.ts
 */

import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UISetSmallM')
export default class UISetSmallM extends cc.Component {
    @property(cc.Node)
    Group: cc.Node = null;
    delagate = null;
    itemData = [0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 50, 100, 200, 300, 500, 1000
    ]
    protected onLoad(): void {
        for (let index = 0; index < this.Group.childrenCount; index++) {
            const element = this.Group.children[index];
            let rectangle = element.getChildByName('Rectangle');
            rectangle.getChildByName('select').active = false;
            rectangle['_data'] = this.itemData[index]
            rectangle.on(cc.Node.EventType.TOUCH_END, () => {
                rectangle.getChildByName('select').active = !rectangle.getChildByName('select').active;
            }, this);
            const lblNode = element.getChildByName('lblNode');
            let small = lblNode.getChildByName('small').getComponent(cc.Label);
            small.string = this.itemData[index] + '';
            let big = lblNode.getChildByName('big').getComponent(cc.Label);
            big.string = this.itemData[index] * 2 + '';

        }
    }
    cancleClick() {
        this.node.active = false;
    }
    sureClick() {
        let data = []

        for (let index = 0; index < this.Group.childrenCount; index++) {
            const element = this.Group.children[index];
            let rectangle = element.getChildByName('Rectangle');
            if (rectangle.getChildByName('select').active) {
                data.push(this.itemData[index])
            }
        }
        if (data.length < 2 || data.length > 12) {
            UIComponent.Instance.Toast('请至少选择2个选型/最多选择12个选项');
        }
        else {
            this.node.active = false;
            this.delagate.setSmallM(data);

        }

    }
    setSetSmallM(data) {
        for (let index = 0; index < this.Group.childrenCount; index++) {
            const element = this.Group.children[index];
            let rectangle = element.getChildByName('Rectangle');
            for (let index1 = 0; index1 < data.length; index1++) {
                if (rectangle['_data'] == data[index1]) {
                    rectangle.getChildByName('select').active = true;
                    break;
                }
            }

        }
    }

    // update (dt) {}
}
