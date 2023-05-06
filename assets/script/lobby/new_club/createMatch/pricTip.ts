/*
 * @Author: xfj
 * @Date: 2023-05-06 11:37:00
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-06 11:39:17
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/pricTip.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/pricTip')
export default class PricTip extends cc.Component {
    @property(cc.Label)
    price: cc.Label = null;
    btnClick() {
        this.node.active = false
    }

}
