import UIBasePlus from '../../../../../ui/UIBasePlus';
import UIComponent from '../../../../../ui/UIComponent';
import { UIDefine } from '../../../../../define/UIDefine';
import { GameCache } from '../../../../../game/GameCache';
import { i18nMgr } from '../../../../../i18n/i18nMgr';
import { WWW } from '../../../../../net/https/WebRequest';
import { WebChatMessageReport } from '../../../../../net/https/web_request/WebRequestChat';
import { WebCmsExtUserComplaIntReport } from '../../../../../net/https/web_request/WebRequestCmsExt';

const { ccclass, property } = cc._decorator;

/** 每条举报原因对应的 report_type 值 */
const REPORT_TYPES = [1, 2, 3, 4, 5];

@ccclass
export default class UIReport extends UIBasePlus {
    /** 自动绑定：背景遮罩（点击关闭） */
    $panel_click: cc.Node = null;

    @property(cc.SpriteFrame)
    checkedFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    uncheckedFrame: cc.SpriteFrame = null;

    private _dlgNode: cc.Node = null;
    private _closeBtn: cc.Node = null;
    private _reasonNodes: cc.Node[] = [];
    private _reasonSelected: boolean[] = [false, false, false, false, false];
    private _editBox: cc.EditBox = null;
    private _submitBtn: cc.Node = null;

    // 举报参数
    private _roomId: number = 0;
    private _userId: number = 0;
    private _sendName: string = '';
    private _randomNum: number = 0;
    private _type: number = 1;

    protected lateLoad(): void {
        super.lateLoad();
        // 点击背景遮罩关闭
        this.setButtonClick(this.$panel_click, this.click_close);

        this._dlgNode = cc.find('DialogNode', this.node);
        if (!this._dlgNode) return;

        // 阻止 DialogNode 区域触摸冒泡，防止误触关闭
        this._dlgNode.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => e.stopPropagation());
        this._dlgNode.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => e.stopPropagation());

        // 关闭按钮
        this._closeBtn = this._dlgNode.getChildByName('closeBtn');
        if (this._closeBtn) {
            this._closeBtn.on(cc.Node.EventType.TOUCH_END, this.click_close, this);
        }

        // 举报原因行 (reportReason1~5)
        this._reasonNodes = [];
        for (let i = 1; i <= 5; i++) {
            const node = this._dlgNode.getChildByName('reportReason' + i);
            if (!node) continue;
            this._reasonNodes.push(node);
            const idx = i - 1;
            node.on(cc.Node.EventType.TOUCH_END, () => this.click_reason(idx));
        }

        // 自定义原因输入框
        const customNode = this._dlgNode.getChildByName('customReport');
        if (customNode) {
            const editBoxNode = customNode.getChildByName('reasonEditbox');
            if (editBoxNode) {
                this._editBox = editBoxNode.getComponent(cc.EditBox);
                if (this._editBox) {
                    // Web 平台 z-index 修复（同 UIChatDlg）
                    this._editBox.node.on('editing-did-began', (editbox: cc.EditBox) => {
                        if (cc.sys.isBrowser && (editbox as any)._impl && (editbox as any)._impl._elem) {
                            ((editbox as any)._impl._elem as HTMLElement).style.zIndex = '20';
                        }
                    });
                }
            }
        }

        // 提交按钮
        this._submitBtn = this._dlgNode.getChildByName('submitBtn');
        if (this._submitBtn) {
            this.setButtonClick(this._submitBtn, this.click_submit);
        }
    }

    onShow(param?: any): void {
        super.onShow(param);
        if (!param) return;
        this._roomId = param._roomId || 0;
        this._userId = param._userId || 0;
        this._sendName = param._sendName || '';
        this._randomNum = param._randomNum || 0;
        this._type = param._type || 1;
        // 重置选中状态（全部设为未选中纹理，第一个默认选中）
        this._reasonSelected = [false, false, false, false, false];
        for (let i = 0; i < this._reasonNodes.length; i++) {
            const sprNode = this._reasonNodes[i].getChildByName('selectSpr');
            if (sprNode) {
                const sprite = sprNode.getComponent(cc.Sprite);
                if (sprite) sprite.spriteFrame = this.uncheckedFrame;
            }
        }
        if (this._reasonNodes.length > 0) {
            this._reasonSelected[0] = true;
            const sprNode = this._reasonNodes[0].getChildByName('selectSpr');
            if (sprNode) {
                const sprite = sprNode.getComponent(cc.Sprite);
                if (sprite) sprite.spriteFrame = this.checkedFrame;
            }
        }
        // 清空输入框
        if (this._editBox) this._editBox.string = '';
    }

    /** 点击举报原因行，切换选中状态（切换 selectSpr 纹理） */
    private click_reason(index: number): void {
        this._reasonSelected[index] = !this._reasonSelected[index];
        const sprNode = this._reasonNodes[index].getChildByName('selectSpr');
        if (sprNode) {
            const sprite = sprNode.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = this._reasonSelected[index] ? this.checkedFrame : this.uncheckedFrame;
            }
        }
    }

    /** 提交举报 */
    private click_submit(): void {
        // 收集选中的举报类型
        const selectedTypes: number[] = [];
        for (let i = 0; i < this._reasonSelected.length; i++) {
            if (this._reasonSelected[i]) selectedTypes.push(REPORT_TYPES[i]);
        }
        const customText = this._editBox ? this._editBox.string.trim() : '';

        // 至少选择一个原因或输入自定义原因
        if (selectedTypes.length === 0 && !customText) {
            UIComponent.Instance.Toast(i18nMgr.Get('UIMine_Setting109') || '请选择举报原因或输入描述');
            return;
        }

        const reportType = selectedTypes.join(',');

        if (this._type === 1) {
            // 举报用户（聊天举报接口）
            WWW.Instance.CommonAPI({
                web_class: WebChatMessageReport,
                body: WebChatMessageReport.Request({
                    room_id: this._roomId,
                    msg_user_rid: this._randomNum,
                    report_type: reportType,
                    other: customText
                })
            }).then((res: any) => {
                if (!cc.isValid(this.node)) return;
                if (res && res.code === 0) {
                    UIComponent.Instance.Toast(i18nMgr.Get('UIChatReport011') || '举报成功');
                    this.click_close();
                } else {
                    UIComponent.Instance.Toast((res && res.message) || '举报失败');
                }
            });
        } else {
            // 举报牌谱（投诉接口）
            WWW.Instance.CommonAPI({
                web_class: WebCmsExtUserComplaIntReport,
                body: WebCmsExtUserComplaIntReport.Request({
                    type: this._type,
                    room_id: this._roomId,
                    content: reportType + (customText ? '|' + customText : '')
                })
            }).then((res: any) => {
                if (!cc.isValid(this.node)) return;
                if (res && res.code === 0) {
                    UIComponent.Instance.Toast(i18nMgr.Get('UIChatReport011') || '举报成功');
                    this.click_close();
                } else {
                    UIComponent.Instance.Toast((res && res.message) || '举报失败');
                }
            });
        }
    }

    private click_close(): void {
        UIComponent.close(UIDefine.UIReport);
    }
}
