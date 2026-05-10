import UIBasePlus from '../UIBasePlus';
const { ccclass, menu } = cc._decorator;

@ccclass
@menu('GG/GGASCom')
export default class GGASCom extends UIBasePlus {
    $sub: cc.Node = null;
    $add: cc.Node = null;
    cc_Label$label: cc.Label = null;
    /////////////////////////////
    _value: number;
    _use: boolean;
    private _data: any = {
        value: 0,
        step: 0,
        min: 0,
        max: 0
    };

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$sub, this.onSub);
        this.setButtonClick(this.$add, this.onAdd);
    }

    onSub() {
        if (!this._use) return;
        let a = this.value - this._data.step;
        a = Math.max(this._data.min, a);
        this.value = a;
        this._data.sub_click?.();
    }

    onAdd() {
        if (!this._use) return;
        let a = this.value + this._data.step;
        a = Math.min(this._data.max, a);
        this.value = a;
        this._data.add_click?.();
    }

    //设置数据
    set data(vdata: any) {
        this._data = vdata;
        this.value = this._data.value;
    }

    //刷新value
    set value(num: number) {
        this._value = num;
        this.cc_Label$label.string = `${num}`;
    }

    //获取value
    get value() {
        return this._value;
    }

    set use(boo: boolean) {
        this._use = boo;
    }
}
