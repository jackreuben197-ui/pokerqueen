import { i18nMgr } from '../../i18n/i18nMgr';
import UIBasePlus from '../UIBasePlus';
import UIComponent from '../UIComponent';
/**
 *  密码弹框
 */
const { ccclass, menu } = cc._decorator;

export type UIPasswordDialogType = {
    this?: any; //点击回调的this作用域
    title?: string; //标题
    password: string; //密码
    cancel?: string;
    commit?: string;
    commit_click?: Function; //双按钮的取消点击
    cancel_click?: Function; //双按钮的确认点击
};

@ccclass
@menu('脚本分组/ui/dialog/UISuperDialog')
export default class UIPasswordDialog extends UIBasePlus {
    $back: cc.Node = null;
    cc_Label$title: cc.Label = null;
    cc_EditBox$input: cc.EditBox = null;
    //单按钮和双按钮
    $ok: cc.Node = null;
    $cancel: cc.Node = null;
    $commit: cc.Node = null;
    _param: UIPasswordDialogType;

    onShow(data = null): void {
        data = data || {};
        super.onShow(data);
        this.refreshUI(data);
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$back, this.onClickBack);
        this.setButtonClick(this.$cancel, this.onClickCancel);
        this.setButtonClick(this.$commit, this.onClickCommit);
    }

    refreshUI(data: UIPasswordDialogType) {
        this.cc_Label$title.string = data.title || i18nMgr.Get('UIGuild_JoinGameTitle');
        this.setChildLabel(this.$commit, 'label', data.commit || i18nMgr.Get('adaptation10012'));
        this.setChildLabel(this.$cancel, 'label', data.cancel || i18nMgr.Get('adaptation10013'));
        this.cc_EditBox$input.string = data.password;
    }

    onClickCancel() {
        this._param.cancel_click?.call(this._param.this);
        this.hideUI();
    }

    onClickCommit() {
        this._param.commit_click?.call(this._param.this, this.cc_EditBox$input.string);
        //this.hideUI();
    }

    onClickBack() {
        this.hideUI();
    }

    hideUI() {
        UIComponent.close(this.UIDefine);
    }
}
