/*
 * @Author: xfj
 * @Date: 2022-12-22 20:29:36
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-23 13:44:14
 * @FilePath: /pokerqueen/assets/script/common/dropDownBoxItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import UIBase from "../ui/UIBase";
const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/common/dropDownBoxItem')
export default class dropDownBoxItem extends UIBase {
    private _data = null;
    private _selectItem: Function = null;
    up: cc.Sprite = null;
    flag: cc.Label = null;
    lateLoad() {
        super.lateLoad();
        this.up = this.getChildNodeOrComponent("up", cc.Sprite);
        this.flag = this.getChildNodeOrComponent("flag", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.node, this.clickItem);
    }

    initData(data, width, selectItem: Function) {
        this.up.node.active = true
        this._data = data;
        this.node.width = width
        this._selectItem = selectItem;
        this.setText(this.flag, this._data.desc);
        this.up.spriteFrame = AssetContext.getAsset(this._data.type + '', AssetFold.texture_new_club)

    }

    clickItem() {
        this._selectItem && this._selectItem(this._data);
    }
}
