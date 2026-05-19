import { IUIDefine } from '../define/EIDefine';
import Main from '../Main';
import { ResManager } from '../manager/ResManager';
import BaseForm from './form/BaseForm';
import UIBase from './UIBase';
import { Close_Obj, Open_Obj } from './UIComponent';

export class UIFormMgr {
    protected Name: string = 'UIFormMgr';
    uiMap: Record<string, UIBase> = {};
    currUI: UIBase = null;
    //已经打开的ui列表
    showUIs: UIBase[] = [];
    //加载的UI层级
    protected UILayer: cc.Node = null;
    //缓存的UI层级
    protected CacheUILayer: cc.Node = null;

    static get Instance(): UIFormMgr {
        return ((<any>this).instance ??= new UIFormMgr());
    }

    constructor() {
        this.UILayer = Main.Form;
        this.CacheUILayer = Main.CacheUI;
    }

    find(uiDefine: IUIDefine): UIBase {
        return this.uiMap[uiDefine.Name];
    }

    /**
     * 打开一个窗体
     * @param param 携带的参数
     */
    open(uiDefine: IUIDefine, param: any = null, obj: Open_Obj) {
        if (this.currUI?.UIDefine.Name == uiDefine.Name) {
            console.warn(`[${this.Name}] open`, '当前面板已经存在:', uiDefine.Name);
            return;
        }
        let newUI = this.find(uiDefine);
        if (newUI) {
            this.lateOpen(newUI, param, obj);
            return;
        }
        ResManager.GetOrLoad<cc.Prefab>(uiDefine.Bundle, uiDefine.Path)
            .then(asset => {
                let ui_node = cc.instantiate(asset);
                newUI = ui_node.getComponent(UIBase);
                if (!newUI) {
                    console.log(`[${this.Name}] open`, uiDefine.Name, '缺少脚本');
                    return;
                }
                this.uiMap[uiDefine.Name] = newUI;
                this.lateOpen(newUI, param, obj);
            })
            .catch(e => {
                console.log(`[${this.Name}] open`, 'Get Resource Error', e);
            });
    }

    close(uiDefine: { Name: string; Bundle: string; Path: string } = null, param: any = null, obj: Close_Obj) {
        if (uiDefine) {
            for (let i = this.showUIs.length - 1; i >= 0; i--) {
                let ui = this.showUIs[i];
                if (ui.UIDefine.Name == uiDefine.Name) {
                    ui.close_animation = obj?.animation == null ? true : obj?.animation;
                    if (ui.close_animation) {
                        this.currUI.onClose(param);
                    } else {
                        this.currUI.onClose(param);
                    }
                    ui.node.parent = this.CacheUILayer;
                    this.showUIs.splice(i, 1);
                    this.currUI = this.showUIs[this.showUIs.length - 1];
                    console.log(`[${this.Name}]`, 'close ui left count:', this.Name, this.showUIs.length);
                    break;
                }
            }
        } else {
            if (this.currUI) {
                this.currUI.close_animation = obj?.animation == null ? true : obj?.animation;
                this.currUI.onClose(param);
                this.currUI.node.parent = this.CacheUILayer;
                this.showUIs.pop();
                this.currUI = this.showUIs[this.showUIs.length - 1];
            }
        }
    }

    protected lateOpen(ui: UIBase, param: any = null, obj: Open_Obj = null) {
        if (ui) {
            ui.node.active = true;
            ui.node.parent = this.UILayer;
            ui.show_animation = obj?.animation == null ? true : obj?.animation;
            ui.obj = obj;
            if (obj?.animation == false) ui.show_animation = false;
            if (obj?.jumpShow) {
                ui.node.x = 0;
                ui.node.y = 0;
            } else {
                // if (ui instanceof BaseForm) {
                //     ui.onShow(param, this.currUI?.node, obj?.SceneUI);
                // } else {
                    ui.onShow(param);
                //}
            }
            this.currUI = ui;
            this.showUIs.push(ui);
            console.log(`[${this.Name}]`, 'lateOpen ui count:', this.Name, this.showUIs.length);
        }
    }

    public async closeAll() {
        while (this.showUIs.length) {
            let ui = this.showUIs.shift();
            ui.node.parent = this.CacheUILayer;
        }
        this.showUIs = [];
        this.currUI = null;
    }
}

export class UIBoardMgr extends UIFormMgr {
    protected Name: string = 'UIBoardMgr';

    static get Instance(): UIBoardMgr {
        return ((<any>this).instance ??= new UIBoardMgr());
    }

    constructor() {
        super();
        this.UILayer = Main.Board;
        this.CacheUILayer = Main.CacheUI;
    }
}

export class UIDialogMgr extends UIFormMgr {
    protected Name: string = 'UIDialogMgr';

    static get Instance(): UIDialogMgr {
        return ((<any>this).instance ??= new UIDialogMgr());
    }

    constructor() {
        super();
        this.UILayer = Main.Dialog;
        this.CacheUILayer = Main.CacheUI;
    }
}

export class UIPromptMgr extends UIFormMgr {
    protected Name: string = 'UIPromptMgr';

    static get Instance(): UIPromptMgr {
        return ((<any>this).instance ??= new UIPromptMgr());
    }

    constructor() {
        super();
        this.UILayer = Main.Prompt;
        this.CacheUILayer = Main.CacheUI;
    }
}

export class UICommonMgr {
    protected Name: string = 'UICommonMgr';
    private uiMap = new Map<IUIDefine, cc.Node>();

    static get Instance(): UICommonMgr {
        return ((<any>this).instance ??= new UICommonMgr());
    }

    constructor() {}

    find(uiDefine: IUIDefine): UIBase {
        const node = this.uiMap.get(uiDefine);
        if (!node) return null;
        return node.getComponent(UIBase);
    }

    open(uiDefine: IUIDefine, param: any = null, obj: Open_Obj) {
        let node: cc.Node = this.uiMap.get(uiDefine);
        if (!node) {
            let bundle = cc.assetManager.getBundle(uiDefine.Bundle);
            let prefab: cc.Prefab = (bundle || cc.resources).get(uiDefine.Path, cc.Prefab);
            if (!prefab) {
                console.warn('[UICommonMgr]', '缺少预制体资源:', uiDefine.Path);
                return;
            }
            node = cc.instantiate(prefab);
            this.uiMap.set(uiDefine, node);
        }
        node.active = true;
        if (node.activeInHierarchy) {
            let ui = node.getComponent(UIBase);
            if (ui) {
                ui.show_animation = obj?.animation == null ? true : obj?.animation;
                ui.onShow(param);
            }
            return console.log('[UICommonMgr]', 'ui已经开启');
        }
        node.parent = obj?.parentUI || Main.Dialog;
        let ui = node.getComponent(UIBase);
        if (ui) {
            ui.show_animation = obj?.animation == null ? true : obj?.animation;
            ui.onShow(param);
        }
    }

    close(uiDefine: IUIDefine, param: any = null, obj: Close_Obj) {
        let node: cc.Node = this.uiMap.get(uiDefine);
        if (node && node.activeInHierarchy) {
            let ui = node.getComponent(UIBase);
            if (ui) {
                ui.close_animation = obj?.animation == null ? true : obj?.animation;
                ui.onClose(param);
            }
            node.parent = null;
        }
    }
}
