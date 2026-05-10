import SimpleNodePool from '../../common/MyNodePool';
import PublicHelper from '../../helper/PublicHelper';
import { i18nMgr } from '../../i18n/i18nMgr';
import UIBasePlus from '../UIBasePlus';
import UIComponent from '../UIComponent';
/**
 *  弹框
 * 1.支持带标题和不带标题
 * 2.支持单按钮和双按钮
 * 3.根据content内容自动上下伸展框体高度
 * 4.所有文本都是富文本
 */
const { ccclass, menu } = cc._decorator;

export type UIRechargeDialogType = {
    this?: any; //点击回调的this作用域
    title?: string; //富文本
    content?: string; //富文本
    ok?: string; //富文本
    cancel?: string; //富文本
    commit?: string; //富文本
    ok_click?: Function; //单按钮确认点击
    commit_click?: Function; //双按钮的取消点击
    cancel_click?: Function; //双按钮的确认点击
    stop_back?: boolean; //阻止back背景点击关闭,默认点击关闭
    copy_list?: { show: string; copy: string }[];
};

@ccclass
@menu('脚本分组/ui/dialog/UIRechargeDialog')
export default class UIRechargeDialog extends UIBasePlus {
    $back: cc.Node = null;
    cc_RichText$title: cc.RichText = null;
    cc_RichText$content: cc.RichText = null;
    $v_line: cc.Node = null;
    //单按钮和双按钮
    $ok: cc.Node = null;
    $cancel: cc.Node = null;
    $commit: cc.Node = null;
    //copy的条目容器
    $copy_layout: cc.Node = null;
    $copy_item: cc.Node = null;
    _param: UIRechargeDialogType;
    copy_pool: SimpleNodePool = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.$copy_item.active = false;
        this.copy_pool = new SimpleNodePool(this.$copy_item);
    }

    onShow(data = null): void {
        data = data || {};
        super.onShow(data);
        this.refreshUI(data);
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$back, this.onClickBack);
        this.setButtonClick(this.$ok, this.onClickOK);
        this.setButtonClick(this.$cancel, this.onClickCancel);
        this.setButtonClick(this.$commit, this.onClickCommit);
    }

    refreshUI(data: UIRechargeDialogType) {
        this.$cancel.active = !data.ok_click;
        this.$commit.active = !data.ok_click;
        this.$ok.active = !!data.ok_click;
        this.$v_line.active = !data.ok_click;
        this.cc_RichText$title.node.active = data.title?.length > 0;
        this.cc_RichText$title.string = data.title || i18nMgr.Get('UIGuild_NoticeTitle');
        this.cc_RichText$content.string = data.content || i18nMgr.Get('adaptation10005');
        this.setChildLabel(this.$ok, 'label', data.ok || i18nMgr.Get('adaptation10008'));
        this.setChildLabel(this.$commit, 'label', data.commit || i18nMgr.Get('adaptation10012'));
        this.setChildLabel(this.$cancel, 'label', data.cancel || i18nMgr.Get('adaptation10013'));
        //copy条目
        this.$copy_layout.active = data.copy_list?.length > 0;
        this.clearCopyList();
        if (data.copy_list?.length) {
            data.copy_list.forEach(item => {
                let item_node = this.copy_pool.GetNode();
                item_node.active = true;
                item_node.parent = this.$copy_layout;
                item_node.getChildByName('label').getComponent(cc.Label).string = item.show;
                let click = item_node.getChildByName('copy_click');
                click['item'] = item;
                this.setButtonClick(click, this.click_copy_item);
            });
        }
    }

    click_copy_item(button: cc.Button) {
        let item = button.node['item'];
        PublicHelper.copyToClipBoard(item.copy);
        //console.log("copy", item.copy);
    }

    clearCopyList() {
        this.$copy_layout.children.forEach(child => {
            this.copy_pool.BackNode(child);
        });
        this.$copy_layout.removeAllChildren();
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
