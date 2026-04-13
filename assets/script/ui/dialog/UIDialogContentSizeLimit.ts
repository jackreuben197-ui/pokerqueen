import GlobalSession from "../../session/GlobalSession";
import BaseTouchBoard from "../board/BaseTouchBoard";
import UIComponent from "../UIComponent";

export type UIDialogContentSizeLimitParam = {
    type?: number;
    title?: string;
    content?: string;
    contentCommit?: string;
    contentCancel?: string;
    actionCommit?: (noPrompt: boolean) => void;
    actionCancel?: () => void;
    actionClose?: () => void;
    isActiveCloseBtn?: boolean;
    isClose?: boolean;
    showTitleBg?: boolean;
    isCenter?: boolean;
    promptKey?: string;
    cantClickMask?: boolean;
    noAnimation?: boolean;
};

const { ccclass } = cc._decorator;

@ccclass
export default class UIDialogContentSizeLimit extends BaseTouchBoard {
    static DialogType = cc.Enum({
        Commit: 1,
        CommitCancel: 2,
    });

    Button_Commit: cc.Node = null;
    Button_Cancel: cc.Node = null;
    Button_Close: cc.Node = null;
    Text_Commit: cc.Label | cc.RichText = null;
    Text_Cancel: cc.Label | cc.RichText = null;
    Text_Title: cc.Label = null;
    Text_Content_Rich: cc.RichText = null;
    Text_Content_Label: cc.Label = null;
    Image_Frame0: cc.Node = null;
    NoToggle: cc.Toggle = null;

    private _actionCommit: ((noPrompt: boolean) => void) = null;
    private _actionCancel: (() => void) = null;
    private _actionClose: (() => void) = null;
    private _buttonCommitPos: cc.Vec3 = null;
    private _buttonCancelPos: cc.Vec3 = null;
    private _buttonCommitWidth = 0;
    private _buttonCancelWidth = 0;
    private _buttonCommitHeight = 0;
    private _buttonCommitBg: cc.Node = null;
    private _buttonCancelBg: cc.Node = null;
    private _buttonCommitBgWidth = 0;
    private _buttonCancelBgWidth = 0;
    private _buttonCommitTextNode: cc.Node = null;
    private _buttonCancelTextNode: cc.Node = null;
    private _buttonCommitTextWidth = 0;
    private _buttonCancelTextWidth = 0;

    protected lateLoad(): void {
        super.lateLoad();

        this.Button_Commit = this.getChildNodeOrComponent("Button_Commit");
        this.Button_Cancel = this.getChildNodeOrComponent("Button_Cancel");
        this.Button_Close = this.getChildNodeOrComponent("Button_Close");
        const commitNode = this.getChildNodeOrComponent("Text_Commit");
        this.Text_Commit = commitNode?.getComponent(cc.Label) || commitNode?.getComponent(cc.RichText) || null;
        const cancelNode = this.getChildNodeOrComponent("Text_Cancel");
        this.Text_Cancel = cancelNode?.getComponent(cc.Label) || cancelNode?.getComponent(cc.RichText) || null;
        this.Text_Title = this.getChildNodeOrComponent("Text_Title", cc.Label);
        this.Image_Frame0 = this.getChildNodeOrComponent("Image_Frame0");
        this.NoToggle = this.getChildNodeOrComponent("NoToggle", cc.Toggle);

        const contentNode = this.getChildNodeOrComponent("Text_Content");
        this.Text_Content_Rich = contentNode?.getComponent(cc.RichText) || null;
        this.Text_Content_Label = contentNode?.getComponent(cc.Label) || null;

        if (this.Button_Commit) {
            this._buttonCommitPos = this.Button_Commit.position.clone();
            this._buttonCommitWidth = this.Button_Commit.width;
            this._buttonCommitHeight = this.Button_Commit.height;
            this._buttonCommitBg = this.Button_Commit.getChildByName("Commit_Bg");
            this._buttonCommitBgWidth = this._buttonCommitBg?.width || 0;
            this._buttonCommitTextNode = this.Button_Commit.getChildByName("Text_Commit");
            this._buttonCommitTextWidth = this._buttonCommitTextNode?.width || 0;
        }
        if (this.Button_Cancel) {
            this._buttonCancelPos = this.Button_Cancel.position.clone();
            this._buttonCancelWidth = this.Button_Cancel.width;
            this._buttonCancelBg = this.Button_Cancel.getChildByName("Cancel_Bg");
            this._buttonCancelBgWidth = this._buttonCancelBg?.width || 0;
            this._buttonCancelTextNode = this.Button_Cancel.getChildByName("Text_Cancel");
            this._buttonCancelTextWidth = this._buttonCancelTextNode?.width || 0;
        }
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.Button_Commit, this.onCommitClick);
        this.setButtonClick(this.Button_Cancel, this.onCancelClick);
        this.setButtonClick(this.Button_Close, this.onCloseClick);
        this.setButtonClick(this.mask, this.onCloseClick);
    }

    protected lateShow(param?: UIDialogContentSizeLimitParam): void {
        super.lateShow(param);

        const data = param || {};
        const dialogType = data.type || UIDialogContentSizeLimit.DialogType.Commit;
        const isCommitCancel = dialogType === UIDialogContentSizeLimit.DialogType.CommitCancel;

        this.Button_Cancel && (this.Button_Cancel.active = isCommitCancel);
        this.refreshButtonLayout(isCommitCancel);
        this.Button_Close && (this.Button_Close.active = !!data.isActiveCloseBtn);
        this.Image_Frame0 && (this.Image_Frame0.active = !!data.showTitleBg);

        this.setText(this.Text_Title, data.title || "");
        this.setText(this.Text_Commit, data.contentCommit || "Commit");
        this.setText(this.Text_Cancel, data.contentCancel || "Cancel");
        this.setContentText(data.content || "", !!data.isCenter);

        if (this.NoToggle) {
            this.NoToggle.node.active = !!data.promptKey;
            this.NoToggle.isChecked = true;
        }

        this._actionCommit = data.actionCommit || null;
        this._actionCancel = data.actionCancel || null;
        this._actionClose = data.actionClose || null;
    }

    private refreshButtonLayout(isCommitCancel: boolean): void {
        if (!this.Button_Commit) return;

        const parent = this.Button_Commit.parent;
        const layout = parent?.getComponent(cc.Layout);
        const commitWidget = this.Button_Commit.getComponent(cc.Widget);
        const cancelWidget = this.Button_Cancel?.getComponent(cc.Widget);

        if (isCommitCancel) {
            if (this._buttonCommitWidth > 0) {
                this.Button_Commit.setContentSize(this._buttonCommitWidth, this._buttonCommitHeight || this.Button_Commit.height);
            }
            if (this._buttonCommitPos) {
                this.Button_Commit.setPosition(this._buttonCommitPos);
            }
            if (this.Button_Cancel && this._buttonCancelPos) {
                if (this._buttonCancelWidth > 0) {
                    this.Button_Cancel.width = this._buttonCancelWidth;
                }
                this.Button_Cancel.setPosition(this._buttonCancelPos);
            }
            if (this._buttonCommitBg && this._buttonCommitBgWidth > 0) {
                this._buttonCommitBg.width = this._buttonCommitBgWidth;
            }
            if (this._buttonCancelBg && this._buttonCancelBgWidth > 0) {
                this._buttonCancelBg.width = this._buttonCancelBgWidth;
            }
            if (this._buttonCommitTextNode && this._buttonCommitTextWidth > 0) {
                this._buttonCommitTextNode.width = this._buttonCommitTextWidth;
            }
            if (this._buttonCancelTextNode && this._buttonCancelTextWidth > 0) {
                this._buttonCancelTextNode.width = this._buttonCancelTextWidth;
            }
            if (commitWidget) {
                commitWidget.enabled = true;
                commitWidget.updateAlignment();
            }
            if (cancelWidget) {
                cancelWidget.enabled = true;
                cancelWidget.updateAlignment();
            }
            if (layout) {
                layout.enabled = true;
                layout.updateLayout();
            }
            return;
        }

        if (layout) {
            // 单按钮时关闭自动布局，使用手动宽度和居中位置
            layout.enabled = false;
        }
        if (commitWidget) {
            commitWidget.enabled = false;
        }
        if (cancelWidget) {
            cancelWidget.enabled = false;
        }

        let singleWidth = this._buttonCommitWidth;
        if (this.Button_Cancel && this._buttonCancelPos && this._buttonCommitPos) {
            const centerDistance = this._buttonCommitPos.x - this._buttonCancelPos.x;
            const gap = centerDistance - (this._buttonCommitWidth + this._buttonCancelWidth) / 2;
            singleWidth = this._buttonCommitWidth + this._buttonCancelWidth + Math.max(0, gap);
        }
        // 单按钮不占满双按钮总宽，适当收窄
        singleWidth = Math.max(this._buttonCommitWidth, Math.floor(singleWidth * 0.9));
        this.Button_Commit.setContentSize(singleWidth, this._buttonCommitHeight || this.Button_Commit.height);
        if (this._buttonCommitBg) {
            const sidePadding = Math.max(0, this._buttonCommitWidth - this._buttonCommitBgWidth);
            this._buttonCommitBg.width = Math.max(0, singleWidth - sidePadding);
        }
        if (this._buttonCommitTextNode) {
            const sidePadding = Math.max(0, this._buttonCommitWidth - this._buttonCommitTextWidth);
            this._buttonCommitTextNode.width = Math.max(0, singleWidth - sidePadding);
        }
        const centerX = (this._buttonCommitPos && this._buttonCancelPos)
            ? (this._buttonCommitPos.x + this._buttonCancelPos.x) * 0.5
            : 0;
        this.Button_Commit.setPosition(cc.v3(centerX, this.Button_Commit.y, this.Button_Commit.z));
    }

    private setContentText(content: string, forceCenter: boolean): void {
        if (this.Text_Content_Rich) {
            this.Text_Content_Rich.string = content;
            this.Text_Content_Rich.node.active = true;
            if (this.Text_Content_Label) {
                this.Text_Content_Label.node.active = false;
            }
            this.Text_Content_Rich.horizontalAlign = forceCenter ? cc.macro.TextAlignment.CENTER : cc.macro.TextAlignment.LEFT;
            return;
        }
        if (this.Text_Content_Label) {
            this.Text_Content_Label.string = content;
            this.Text_Content_Label.horizontalAlign = forceCenter ? cc.Label.HorizontalAlign.CENTER : cc.Label.HorizontalAlign.LEFT;
        }
    }

    private onCancelClick(): void {
        this._actionCancel?.();
        this.goClose();
    }

    private onCloseClick(): void {
        const data = (this.param || {}) as UIDialogContentSizeLimitParam;
        if (data?.cantClickMask) {
            return;
        }

        if (data?.isClose) {
            GlobalSession.Logout();
        }
        this._actionClose?.();
        this.goClose();
    }

    private onCommitClick(): void {
        const data = (this.param || {}) as UIDialogContentSizeLimitParam;
        const promptKey = data?.promptKey || "";
        const noPrompt = !!this.NoToggle?.isChecked;
        console.log('noPrompt', noPrompt);

        if (promptKey) {
            if (noPrompt) {
                cc.sys.localStorage.setItem(promptKey, new Date().toISOString());
            } else {
                cc.sys.localStorage.setItem(promptKey, "");
            }
        }

        this._actionCommit?.(noPrompt);
        this.goClose();
    }

    protected goClose(): void {
        UIComponent.close(this.UIDefine);
    }

    public static IsOverDayLastUpload(key: string): boolean {
        const lastUploadTimeStr = cc.sys.localStorage.getItem(key) || "";
        if (!lastUploadTimeStr) {
            return true;
        }
        const lastUploadTime = new Date(lastUploadTimeStr);
        if (Number.isNaN(lastUploadTime.getTime())) {
            return true;
        }
        return (Date.now() - lastUploadTime.getTime()) >= 24 * 60 * 60 * 1000;
    }
}
