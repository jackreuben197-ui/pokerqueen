/*
 * @Author: xfj
 * @Date: 2023-02-02 19:04:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-03 10:57:11
 * @FilePath: /pokerqueen/assets/script/lobby/career/recordItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIDefine } from "../../define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import UIRecordDetail from "../view/record/UIRecordDetail";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/career/recordItem')
export default class recordItem extends UIBase {
    _data = null;
    initData(data) {
        this._data = data;
    }
    itemClick() {
        UIComponent.open(UIDefine.UIRecordDetail)
    }
}
