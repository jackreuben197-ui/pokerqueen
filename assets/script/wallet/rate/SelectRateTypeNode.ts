import List from "../../common/List";
import UIBase from "../../ui/UIBase";
import SelectRateTypeItem from "./SelectRateTypeItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/rate/SelectRateTypeNode')
export default class SelectRateTypeNode extends UIBase {
    private rateTypeBg: cc.Node = null;
    private list: List = null;

    private _data: Array<{ country: string, path: string }> = [];
    private _aniing: boolean = false;
    private _selectItem: Function = null;
    lateLoad() {
        super.lateLoad();

        this.rateTypeBg = this.getChildNodeOrComponent("rateTypeBg");
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

        this.rateTypeBg.scale = 0;

        this._aniing = true;
        cc.Tween.stopAllByTarget(this.rateTypeBg);
        cc.tween(this.rateTypeBg)
            .to(0.1, { scale: 1 })
            .call(() => { this._aniing = false })
            .start();

        this.list.numItems = this._data.length;
    }

    close(ani: boolean = true) {
        if (this.node.active) {
            if (ani) {
                this._aniing = false;
                cc.Tween.stopAllByTarget(this.rateTypeBg);
                cc.tween(this.rateTypeBg)
                    .to(0.1, { scale: 0 })
                    .call(() => {
                        this._aniing = false;
                        this.setActive(this.node, false)
                    }).start();
            } else {
                this.rateTypeBg.scale = 0;
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
        let item = node.getComponent(SelectRateTypeItem);
        item.initData(this._data[index], this._selectItem);
    }
}