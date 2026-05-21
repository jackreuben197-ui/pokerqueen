import { i18nMgr } from '../../../../../i18n/i18nMgr';
import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import BaseTouchBoard from '../../../../../ui/board/BaseTouchBoard';
import UIBase from '../../../../../ui/UIBase';
/**
 *  弹框
 * 1.支持带标题和不带标题
 * 2.支持单按钮和双按钮
 * 3.根据content内容自动上下伸展框体高度
 * 4.所有文本都是富文本
 */
const { ccclass, menu, property } = cc._decorator;

export type UIConfirmDialogParam = {
    this?: any; //点击回调的this作用域
    title?: string; //富文本
    content: string; //富文本
    ok?: string; //富文本
    cancel?: string; //富文本
    commit?: string; //富文本
    ok_click?: Function; //单按钮确认点击
    commit_click?: Function; //双按钮的取消点击
    cancel_click?: Function; //双按钮的确认点击
    stop_back?: boolean; //阻止back背景点击关闭,默认点击关闭
};

@ccclass
@menu('CrazyPoker/Common/UIConfirmDialog')
export default class UIConfirmDialog extends UIBasePlus {
    cc_RichText$title: cc.RichText = null;
    cc_RichText$content: cc.RichText = null;
    //单按钮和双按钮、
    @property(cc.Node)
    $ok: cc.Node = null;
    @property(cc.Node)
    $cancel: cc.Node = null;
    @property(cc.Node)
    $commit: cc.Node = null;
    @property(cc.Node)
    $back: cc.Node = null;
    @property(cc.RichText)
    okLabel: cc.RichText = null;
    @property(cc.RichText)
    commitLabel: cc.RichText = null;
    @property(cc.RichText)
    cancelLabel: cc.RichText = null;

    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI(param);
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$back, this.onClickBack);
        this.setButtonClick(this.$ok, this.onClickOK);
        this.setButtonClick(this.$cancel, this.onClickCancel);
        this.setButtonClick(this.$commit, this.onClickCommit);
    }

    refreshUI(data: UIConfirmDialogParam) {
        this.$cancel.active = !data.ok_click;
        this.$commit.active = !data.ok_click;
        this.$ok.active = !!data.ok_click;
        if (data.title?.length > 0) {
            this.cc_RichText$title.node.active = true;
            this.cc_RichText$title.string = data.title;
        } else {
            this.cc_RichText$title.node.active = false;
        }
        this.cc_RichText$content.string = data.content;
        if (data.ok?.length > 0) {
            this.okLabel.string = data.ok;
        }
        if (data.commit?.length > 0) {
            this.commitLabel.string = data.commit;
        }
        if (data.cancel?.length > 0) {
            this.cancelLabel.string = data.cancel;
        }
    }

    onClickOK() {
        this._param.ok_click?.call(this._param.this);
        this.hideUI();
    }

    onClickCancel() {
        this._param.cancel_click?.call(this._param.this);
        this.hideUI();
    }

    onClickCommit() {
        this._param.commit_click?.call(this._param.this);
        this.hideUI();
    }

    onClickBack() {
        if (this._param.stop_back) return;
        this.hideUI();
    }

    hideUI() {
        UIComponent.close(this.UIDefine);
    }
}
