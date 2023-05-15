/*
 * @Author: xfj
 * @Date: 2023-01-13 11:05:06
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-15 12:19:13
 * @FilePath: /pokerqueen/assets/script/common/tabNode1.ts
 */

import UIBase from "../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('common/tabNode1')

export default class TabNode1 extends UIBase {

    _selectBg: cc.Node = null;
    _title: cc.Node = null;
    _target: UIBase = null;
    _titleNode: cc.Node = null;
    _cb: Function = null;
    _selectIndex = null;
    _isAction = false;
    lateLoad() {
        super.lateLoad();
        this._selectBg = this.getChildNodeOrComponent("selectBg");
        this._title = this.getChildNodeOrComponent("title");
        this._titleNode = this.getChildNodeOrComponent("titleNode");

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    onShow(param?: any): void {
        super.onShow(param);
    }

    initData(param, cb: Function = null, target: UIBase) {
        this._cb = cb
        // this.node.width = param.defaultWidth || 977
        // this.node.height = param.defaultHeight || 159
        this._selectBg.width = (this.node.width - 150) / param.data.length;
        this._title.width = this.node.width / param.data.length;
        this._title.height = this._selectBg.height
        for (let index = 1; index < param.data.length; index++) {
            const element = cc.instantiate(this._title);
            element.parent = this._titleNode
        }
        this._titleNode.children.forEach((item, index) => {
            item.getComponent(cc.Label).fontSize = param.defaultFontSize || 46
            this.setText(item.getComponent(cc.Label), param.data[index]);
            this.bindClick(item, this.onClickTypeTabBtns, index);
        })
        // this.setIndex(param.defaultIndex || 0)
        this.onClickTypeTabBtns(param.defaultIndex || 0)
    }

    setIndex(index) {
        this._selectIndex = index;
        this._selectBg.position = this._titleNode.children[this._selectIndex].position;
        this._titleNode.children.forEach((item, index) => {
            item.opacity = this._selectIndex == index ? 255 : 100
        })
    }

    onClickTypeTabBtns(index) {
        if (this._isAction) return;  //|| this._selectIndex == index
        let pos = this._titleNode.children[index].position;
        // pos = this._titleNode.convertToWorldSpaceAR(pos)
        // pos = this.node.convertToNodeSpaceAR(pos)
        cc.Tween.stopAllByTarget(this._selectBg);
        cc.tween(this._selectBg)
            .to(0.1, { position: pos })
            .call(() => {
                this._isAction = false;
                this.setIndex(index)
                this._cb && this._cb(index);

            }).start();
    }
}
