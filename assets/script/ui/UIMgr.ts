import { IUIDefine } from "../define/EIDefine";
import Main from "../Main";
import { ResManager } from "../manager/ResManager";
import BaseForm from "./form/BaseForm";
import UIBase from "./UIBase";

export class UIFormMgr {

    protected Name: string = "UIFormMgr";

    uiMap = {};

    currUI: UIBase = null;
    //已经打开的ui列表
    showUIs: UIBase[] = [];
    //加载的UI层级
    protected UILayer: cc.Node = null;
    //缓存的UI层级
    protected CacheUILayer: cc.Node = null;

    static get Instance(): UIFormMgr {
        return (<any>this).instance ??= new UIFormMgr();
    }

    constructor() {

        this.UILayer = Main.Form;

        this.CacheUILayer = Main.Cache_UI;
    }

    find(uiDefine: { Name: string, Bundle: string, Path: string }): UIBase {
        return this.uiMap[uiDefine.Name];
    }

    /**
     * 打开一个窗体
     * @param param 携带的参数
     */

    open(uiDefine: { Name: string, Bundle: string, Path: string }, param: any = null) {

        if (this.currUI?.UIDefine.Name == uiDefine.Name) {
            cc.log("当前面板已经存在:", uiDefine.Name);
            return;
        }

        let newUI = this.find(uiDefine);

        if (newUI) {

            this.lateOpen(newUI, param);

        } else {

            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                    return;
                }
                let ui_node = cc.instantiate(asset);
                newUI = ui_node.getComponent(UIBase);
                this.uiMap[uiDefine.Name] = newUI;
                this.lateOpen(newUI, param);
            });
        }
    }

    async close(uiDefine: { Name: string, Bundle: string, Path: string } = null, param: any = null) {

        if (uiDefine) {
            for (let i = this.showUIs.length - 1; i >= 0; i--) {
                let ui = this.showUIs[i];
                if (ui.UIDefine.Name == uiDefine.Name) {
                    await this.currUI.onClose(param);
                    ui.node.parent = this.CacheUILayer;
                    this.showUIs.splice(i, 1);
                    this.currUI = this.showUIs[this.showUIs.length - 1];
                    cc.log("close ui left count:", this.Name, this.showUIs.length);
                    break;
                }
            }
        } else {
            if (this.currUI) {
                this.currUI.onClose(param);
                this.currUI.node.parent = this.CacheUILayer;
                this.showUIs.pop();
                this.currUI = this.showUIs[this.showUIs.length - 1];
            }
        }
    }
    protected lateOpen(ui: UIBase, param: any = null) {
        if (ui) {
            //ui.node.active = true;
            ui.node.parent = this.UILayer
            if (ui instanceof BaseForm) {
                ui.onShow(param, this.currUI as BaseForm);
                cc.log("ui.main.x onShow >> ", ui.node.x);
            } else {
                ui.onShow(param);
            }
            this.currUI = ui;
            this.showUIs.push(ui);
            cc.log("open ui count:", this.Name, this.showUIs.length);
        }
    }

    public async closeAll() {

        while (this.showUIs.length) {
            let ui = this.showUIs[this.showUIs.length - 1];
            await this.close(ui.UIDefine, { style: { main_fadeOut_active: false } })
        }

        this.showUIs = [];

        this.currUI = null;
    }

}

export class UIBoardMgr extends UIFormMgr {

    protected Name: string = "UIBoardMgr";

    static get Instance(): UIBoardMgr {
        return (<any>this).instance ??= new UIBoardMgr();
    }

    constructor() {
        super();
        this.UILayer = Main.Board;
        this.CacheUILayer = Main.Cache_UI;
    }
}
export class UIDialogMgr extends UIFormMgr {

    protected Name: string = "UIDialogMgr";

    static get Instance(): UIDialogMgr {
        return (<any>this).instance ??= new UIDialogMgr();
    }
    constructor() {
        super();
        this.UILayer = Main.Dialog;
        this.CacheUILayer = Main.Cache_UI;
    }
}
export class UIPromptMgr extends UIFormMgr {

    protected Name: string = "UIPromptMgr";

    static get Instance(): UIPromptMgr {
        return (<any>this).instance ??= new UIPromptMgr();
    }
    constructor() {
        super();
        this.UILayer = Main.Prompt;
        this.CacheUILayer = Main.Cache_UI;
    }
}


export class UICommonMgr {

    protected Name: string = "UICommonMgr";

    private uiMap = new Map<IUIDefine, cc.Node>();

    static get Instance(): UICommonMgr {
        return (<any>this).instance ??= new UICommonMgr();
    }
    constructor() {

    }
    open(uiDefine: IUIDefine, param: any = null, parent: cc.Node = null) {
        let node: cc.Node = this.uiMap.get(uiDefine);
        if (!node) {
            let bundle = cc.assetManager.getBundle(uiDefine.Bundle);
            let prefab: cc.Prefab = (bundle || cc.resources).get(uiDefine.Path, cc.Prefab);
            if (!prefab) {
                cc.warn("缺少预制体资源:", uiDefine.Path);
                return;
            }
            node = cc.instantiate(prefab);
            this.uiMap.set(uiDefine, node);
        }
        if (node.activeInHierarchy) {
            return cc.log("ui已经开启");
        }
        node.parent = parent;
        node.getComponent(UIBase)?.onShow(param);
    }
    close(uiDefine: IUIDefine, param: any = null) {
        let node: cc.Node = this.uiMap.get(uiDefine);
        if (node && node.activeInHierarchy) {
            node.getComponent(UIBase)?.onClose(param);
            node.parent = null;
        }
    }
}
