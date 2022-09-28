import UIBase from "../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/GoldOprationItem')
export default class GoldOprationItem extends UIBase {
    private numLab: cc.Label = null;

    private _data: number = 0;
    private _callBack: Function = null;
    lateLoad() {
        super.lateLoad();
        this.numLab = this.getChildNodeOrComponent("numLab", cc.Label);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();

        this.bindClick(this.node, this.clickItem);
    }

    initData(data: number, callBack: Function) {
        this._data = data;
        this._callBack = callBack;

        this.setText(this.numLab, data);
    }

    clickItem() {
        this._callBack && this._callBack(this._data);
    }
}