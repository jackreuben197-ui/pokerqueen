
import { Tracing } from "trace_events";
import { IUIDefine, UIType } from "../define/EIDefine";
import { Param } from "../define/Types";
import { i18nMgr } from "../i18n/i18nMgr";
import ToastManager from "../manager/ToastManager";
import UIBase from "../ui/UIBase";
import { UIBoardMgr, UICommonMgr, UIDialogMgr, UIFormMgr, UIPromptMgr } from "./UIMgr";





const { ccclass } = cc._decorator;

export enum PrefabUI {
    UIPreloading = "UIPreloading",
    UITexasMenuComponent = "UITexasMenuComponent",
    UIAddChipsComponent = "UIAddChipsComponent",
    UIOutChipsComponent = "UIOutChipsComponent",
    UIOperationComponent = "UIOperationComponent",
    UIAutoOperationComponent = "UIAutoOperationComponent",
}

@ccclass
export default class UIComponent {

    prefab_node_map = new Map;

    static get Instance(): UIComponent {
        return (<any>this).instance ??= new UIComponent;
    }
    /**
     存储预制体节点
     */
    SetPrefabNode(prefab_name: string, node: cc.Node): void {
        this.prefab_node_map.set(prefab_name, node);
    }
    /**
     获取预制体节点
     */
    GetPrefabNode(prefab_name: string): cc.Node {
        return this.prefab_node_map.get(prefab_name);
    }


    Toast(content?: string) {
        if (content) {
            ToastManager.Instance.createToast(content);
        } else {
            //提示暂未开放
            ToastManager.Instance.createToast(i18nMgr.Get("adaptation10301"));
        }
    }

    //显示节点
    ShowUI<T>(com: PrefabUI, param?: T) {
        let node = this.GetPrefabNode(com);
        if (node) {
            node.active = true;
            let ui_component: UIBase = node.getComponent(UIBase);
            ui_component?.onShow(param);
            cc.log("PrefabUI_node", node);
        } else {
            cc.log("ShowUI ::: > 缺少相关的节点", com);
        }
    }
    //隐藏节点
    HideUI<T>(com: PrefabUI, param?: T) {
        let node = this.GetPrefabNode(com);
        if (node) {
            node.active = false;
            let ui_component: UIBase = node.getComponent(UIBase);
            ui_component?.onClose(param);
            cc.log("HideUI", com);
        }
    }


    static open<TParam extends unknown>(UIDefine: IUIDefine, param?: TParam, parent?: cc.Node ) {
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
            case UIType.Dialog:
                UIDialogMgr.Instance.open(UIDefine, param, false);
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
            case UIType.Dialog:
                UIDialogMgr.Instance.close(UIDefine, param, false);
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