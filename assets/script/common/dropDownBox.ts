/*
 * @Author: xfj
 * @Date: 2022-12-22 19:24:17
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 20:29:56
 * @FilePath: /pokerqueen/assets/script/common/dropDownBox.ts
 */
import List from "../common/List";
import UIBase from "../ui/UIBase";
import dropDownBoxItem from "./dropDownBoxItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/common/dropDownBox')
export default class dropDownBox extends UIBase {
    private list: List = null;

    private _data: Array<{ country: string, path: string }> = [];
    private _aniing: boolean = false;
    private _selectItem: Function = null;
    lateLoad() {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent("rateTypeList", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();

    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();

        this.bindClick(this.node, this.clickBg);
    }

    open(data: Array<{ country: string, path: string }>, selectItem: Function) {
        this._data = data;
        this._selectItem = selectItem;

        this.node.scale = 0;

        this._aniing = true;
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(0.1, { scale: 1 })
            .call(() => { this._aniing = false })
            .start();

        this.list.numItems = this._data.length;
    }

    close(ani: boolean = true) {
        if (this.node.active) {
            if (ani) {
                this._aniing = false;
                cc.Tween.stopAllByTarget(this.node);
                cc.tween(this.node)
                    .to(0.1, { scale: 0 })
                    .call(() => {
                        this._aniing = false;
                        this.setActive(this.node, false)
                    }).start();
            } else {
                this.node.scale = 0;
                this.setActive(this.node, false);
            }
        }
    }

    clickBg() {
        if (!this._aniing) {
            this.close();
        }
    }

    onRender(node: cc.Node, index) {
        let item = node.getComponent(dropDownBoxItem);
        item.initData(this._data[index], this._selectItem);
    }
}