/*
 * @Author: xfj
 * @Date: 2022-12-22 20:29:36
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 20:31:53
 * @FilePath: /pokerqueen/assets/script/common/dropDownBoxItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class dropDownBoxItem extends cc.Component {

    initData(data: { country: string, path: string }, selectItem: Function) {

    }
}
