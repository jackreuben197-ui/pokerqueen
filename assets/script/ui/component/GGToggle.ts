import UIBasePlus from "../UIBasePlus";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("GG/GGToggle")
export default class GGToggle extends UIBasePlus {
    $click:cc.Node = null;
    $check:cc.Node = null;
    $uncheck:cc.Node = null;
    cc_Label$label:cc.Label = null;
    /////////////////////////////
    _isCheck:boolean = false;

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$click,this.onClick);
    }
    uncheck(){
        this._isCheck = false;
        this.$uncheck.active = true;
        this.$check.active = false;
    }
    check(){
        this._isCheck = true;
        this.$uncheck.active = false;
        this.$check.active = true;
    }
    onClick(){
        this.isCheck ? this.uncheck() : this.check();
    }
    //判断选择
    get isCheck(){
        return this._isCheck;
    }
    //设置文本
    set string(text:string) {
        this.cc_Label$label.string = text;
    }

}
