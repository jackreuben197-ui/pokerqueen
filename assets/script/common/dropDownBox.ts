/*
 * @Author: xfj
 * @Date: 2022-12-22 19:24:17
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-05 11:44:46
 * @FilePath: /pokerqueen/assets/script/common/dropDownBox.ts
 */
import List from '../common/List';
import AssetContext, { AssetFold } from '../ui/component/AssetContext';
import UIBase from '../ui/UIBase';
import dropDownBoxItem from './dropDownBoxItem';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/common/dropDownBox')
export default class dropDownBox extends UIBase {
    private list: List = null;
    private _data = [];
    private _aniing: boolean = false;
    private _selectItem: Function = null;
    @property(cc.Node)
    Group: cc.Node = null;
    @property(cc.Node)
    rateTypeList: cc.Node = null;

    lateLoad() {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent('rateTypeList', List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.rateTypeList, this.clickBg);
    }

    initData(dataConfig, selectItem, isCanClick = true) {
        this.rateTypeList.active = false;
        this._data = dataConfig;
        this._selectItem = selectItem;
        this.initSortData(this._data[0]);
        this.Group.active = isCanClick;
    }

    open() {
        this.rateTypeList.height = this._data.length * 100 + 60;
        this.rateTypeList.width = this.node.width;
        this.list.numItems = this._data.length;
        this.rateTypeList.scale = 0;
        this._aniing = true;
        cc.Tween.stopAllByTarget(this.rateTypeList);
        cc.tween(this.rateTypeList)
            .to(0.1, { scale: 1 })
            .call(() => {
                this._aniing = false;
            })
            .start();
    }

    close(ani: boolean = true) {
        if (this.rateTypeList.active) {
            if (ani) {
                this._aniing = false;
                cc.Tween.stopAllByTarget(this.rateTypeList);
                cc.tween(this.rateTypeList)
                    .to(0.1, { scale: 0 })
                    .call(() => {
                        this._aniing = false;
                        this.setActive(this.rateTypeList, false);
                    })
                    .start();
            } else {
                this.rateTypeList.scale = 0;
                this.setActive(this.rateTypeList, false);
            }
        }
    }

    clickBg() {
        if (!this._aniing) {
            this.close();
        }
    }

    onRender(node: cc.Node, index) {
        let item = node.getComponent('dropDownBoxItem');
        item.initData(this._data[index], this.node.width, this.selectItemCb.bind(this));
    }

    clickSelect() {
        this.rateTypeList.active = true;
        this.open();
    }

    selectItemCb(data) {
        this.selectSort(data);
    }

    selectSort(data) {
        this._selectItem && this._selectItem(data);
        this.initSortData(data);
    }

    initSortData(data) {
        let Rectangle = this.node.getChildByName('Rectangle');
        let sortType = Rectangle.getChildByName('sortType');
        sortType.getChildByName('num').getComponent(cc.Label).string = data.desc;
        let Polygon = sortType.getChildByName('Polygon').getComponent(cc.Sprite);
        Polygon.node.active = true;
        Polygon.spriteFrame = AssetContext.getAsset(data.type + '', AssetFold.texture_new_club);
    }
}
