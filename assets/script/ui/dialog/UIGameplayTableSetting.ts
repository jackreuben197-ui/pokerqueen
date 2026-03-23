import { UIDefine } from "../../define/UIDefine";
import BaseTouchBoard from "../board/BaseTouchBoard";
import UIComponent from "../UIComponent";

export type UIGameplayTableSettingParam = {
    isFromBringIn?: boolean;
    bringInAct?: () => void;
    roomPermissions?: any;
    noAnimation?: boolean;
};

const { ccclass } = cc._decorator;

@ccclass
export default class UIGameplayTableSetting extends BaseTouchBoard {
    private Button_Commit: cc.Node = null;
    private Button_Close: cc.Node = null;

    private isFromBringIn = false;
    private bringInAct: (() => void) | null = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.Button_Commit = this.getChildNodeOrComponent("Button_Commit");
        this.Button_Close = this.getChildNodeOrComponent("Button_Close");
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.Button_Commit, this.OnClickCommit);
        this.setButtonClick(this.Button_Close, this.OnClickClose);
    }

    protected lateShow(param?: UIGameplayTableSettingParam): void {
        super.lateShow(param);
        this.isFromBringIn = !!param?.isFromBringIn;
        this.bringInAct = param?.bringInAct || null;
    }

    private OnClickClose(): void {
        UIComponent.close(UIDefine.UIGameplayTableSetting);
    }

    private OnClickCommit(): void {
        UIComponent.close(UIDefine.UIGameplayTableSetting);
        if (this.isFromBringIn) {
            this.bringInAct?.();
        }
    }
}
