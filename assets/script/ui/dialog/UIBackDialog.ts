import UIBasePlus from "../UIBasePlus";
import UIComponent from "../UIComponent";

const {ccclass, menu} = cc._decorator;

@ccclass
@menu('脚本分组/ui/dialog/UIBackDialog')
export default class UIBackDialog extends UIBasePlus {
    static type:{
        status:number,
        title?:string,
        content?:string,
        texts?:string[],
        callbacks?:Function[],
        this:any,
        cover?:Function,
    };
    $cover:cc.Node = null;
    //panel
    cc_Label$content:cc.Label = null;
    //status1
    $status1:cc.Node = null;
    cc_Label$confirm:cc.Label = null;
    $confirm:cc.Node = null;
    //status2
    $status2:cc.Node = null;
    cc_Label$confirm1:cc.Label = null;
    cc_Label$confirm2:cc.Label = null;
    $confirm1:cc.Node = null;
    $confirm2:cc.Node = null;
    _param:typeof UIBackDialog.type;
    onShow(data: typeof UIBackDialog.type): void {
        super.onShow(data);
        this.cc_Label$content.string = data.content;
        this.$status1.active = data.status == 1;
        this.$status2.active = data.status == 2;

        if(data.status == 1){
            this.cc_Label$confirm.string = data.texts[0];
        }else{
            this.cc_Label$confirm1.string = data.texts[0];
            this.cc_Label$confirm2.string = data.texts[1];
        }
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$cover,this.onClickCover);
        this.setButtonClick(this.$confirm,this.onClickConfirm);
        this.setButtonClick(this.$confirm1,this.onClickConfirm1);
        this.setButtonClick(this.$confirm2,this.onClickConfirm2);
    }
    onClickConfirm(){
        this._param.callbacks?.[0].call(this._param.this);
        this.hideUI();
    }
    onClickConfirm1(){
        this._param.callbacks?.[0].call(this._param.this);
        this.hideUI();
    }
    onClickConfirm2(){
        this._param.callbacks?.[1].call(this._param.this);
        this.hideUI();
    }
    onClickCover(){
        if(this._param.cover) {
            this._param.cover.call(this._param.this);
        }else{
            this.hideUI();
        }
    }
    hideUI(){
        UIComponent.close(this.UIDefine);
    }
}
