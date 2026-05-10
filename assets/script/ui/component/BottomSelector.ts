import { GameConfig } from '../../config/GameConfig';
import { i18nMgr } from '../../i18n/i18nMgr';
import UIBasePlus from '../UIBasePlus';
const { ccclass, menu } = cc._decorator;

@ccclass
@menu('common/BottomSelector')
export default class BottomSelector extends UIBasePlus {
    $a: cc.Node = null;
    $b: cc.Node = null;
    $cancel: cc.Node = null;
    _data = null;

    set data(_data: any) {
        this._data = _data;
        this.$a.getChildByName('label').getComponent(cc.Label).string = i18nMgr.Get(_data[0]);
        this.$b.getChildByName('label').getComponent(cc.Label).string = i18nMgr.Get(_data[1]);
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$a, this.onSelectClick.bind(this, 0));
        this.setButtonClick(this.$b, this.onSelectClick.bind(this, 1));
        this.setButtonClick(this.$cancel, this.resetPosition);
    }

    onShow(param?: any): void {
        super.onShow(param);
        this.resetPosition();
        //this.node.x = 0;
        cc.tween(this.node).to(0.2, { x: 0 }).start();
    }

    ///////////click/////////
    onSelectClick(index: number) {
        this._data?.[2]?.onBottomSelect(index);
        this.resetPosition();
    }

    resetPosition() {
        this.node.x = GameConfig.DesignResolution.width;
    }
}
