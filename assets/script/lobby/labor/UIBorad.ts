/*
 * @Author: xfj
 * @Date: 2022-09-27 11:30:34
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-09-27 11:30:42
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIBorad.ts
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
