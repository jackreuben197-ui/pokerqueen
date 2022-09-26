
import { Tracing } from "trace_events";
import { IUIDefine, UIType } from "../define/EIDefine";
import { Param } from "../define/Types";
import ToastManager from "../manager/ToastManager";
import UIBase from "../ui/UIBase";
import { UIBoardMgr, UICommonMgr, UIDialogMgr, UIFormMgr, UIPromptMgr } from "./UIMgr";

const { ccclass } = cc._decorator;

@ccclass
export default class UIComponent {

    static get Instance(): UIComponent {
        return (<any>this).instance ??= new UIComponent;
    }

    Toast(content: string) {
        ToastManager.Instance.createToast(content);
    }
    //界面内UIBase的显示
    ShowNoAnimation<T>(node: cc.Node, param?: T) {
        node.active = true;
        let ui_component: UIBase = node.getComponent(UIBase);
        ui_component?.onShow(param);
    }
    //界面内UI的隐藏
    HideNoAnimation<T>(node: cc.Node, param?: T) {
        node.active = false;
        let ui_component: UIBase = node.getComponent(UIBase);
        ui_component?.onClose(param);
    }

    static open<TParam extends unknown>(UIDefine: IUIDefine, param: TParam = null, parent: cc.Node = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.open(UIDefine, param);
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.open(UIDefine, param);
                break;
            case UIType.Board:
                UIBoardMgr.Instance.open(UIDefine, param);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:

                UIPromptMgr.Instance.open(UIDefine, param);

                break;
            case UIType.CommonUI:
                UICommonMgr.Instance.open(UIDefine, param, parent);
                break;
        }
    }

    static close<TParam extends unknown>(UIDefine: IUIDefine = null, param: TParam = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.close(UIDefine, param);
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.close(UIDefine, param);
                break;
            case UIType.Board:
                UIBoardMgr.Instance.close(UIDefine, param);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:

                UIPromptMgr.Instance.close(UIDefine, param);
                break;
            case UIType.CommonUI:
                UICommonMgr.Instance.close(UIDefine, param);
                break;
        }
    }

    static find(UIDefine: IUIDefine): UIBase {

        let ui: UIBase = null;

        switch (UIDefine.UIType) {
            case UIType.Form:
                ui = UIFormMgr.Instance.find(UIDefine);
                break;
            case UIType.Dialog:
                ui = UIDialogMgr.Instance.find(UIDefine);
                break;
            case UIType.Board:
                ui = UIBoardMgr.Instance.find(UIDefine);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                ui = UIPromptMgr.Instance.find(UIDefine);
                break;
            default:
                break;
        }
        return ui;
    }


    //无动画开启UI(暂未处理)
    OpenNoAnimation(UIDefine: IUIDefine, param: any = null, parent: cc.Node = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.open(UIDefine, param, false);
                break;
        }
    }
    //无动画关闭UI
    CloseNoAnimation(UIDefine: IUIDefine, param: any = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.close(UIDefine, param, false);
                break;
        }
    }

    static closeAll() {
        UIFormMgr.Instance.closeAll();
        UIDialogMgr.Instance.closeAll();
        UIBoardMgr.Instance.closeAll();
        UIPromptMgr.Instance.closeAll();
    }
}
(window as any).UIComponent = UIComponent;