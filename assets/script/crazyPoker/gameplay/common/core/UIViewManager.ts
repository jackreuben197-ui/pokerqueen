import Main from "../../../../Main";
import { ResManager } from "../../../../manager/ResManager";
import UIComponentBase from "./UIComponentBase";
import { IUIConfigItem, UIPrefabDefinition, UIPrefabType } from "./UIPrefabDefinition";

export class UIViewManager {
    protected Name: string = 'UIViewManager';
    private _uiMap: Map<UIPrefabType, UIComponentBase<any>> = new Map();
    private _currUI: UIPrefabType = null;
    //已经打开的ui列表
    private _showUIs: UIPrefabType[] = [];
    //加载的UI层级
    protected UILayer: cc.Node = null;
    //缓存的UI层级
    protected CacheUILayer: cc.Node = null;

    constructor() {
        this.UILayer = Main.Form;
        this.CacheUILayer = Main.CacheUI;
    }

    public open<T>(key: UIPrefabType, param: T) {
        if (this._currUI == key) {
            console.warn(`[${this.Name}] open`, '当前面板已经存在:', key);
            return;
        }
        let ui = this._uiMap.get(key);
        if (ui) {
            this._open<T>(ui, param, key);
            return;
        }
        const uiprefab = UIPrefabDefinition[key] as IUIConfigItem;
        ResManager.GetOrLoad<cc.Prefab>(uiprefab.Bundle , uiprefab.Path)
            .then(asset => {
                let ui_node = cc.instantiate(asset);
                ui = ui_node.getComponent(uiprefab.UIType);
                if (!ui) {
                    console.log(`[${this.Name}] open`, uiprefab.Name, '缺少脚本');
                    return;
                }
                this._uiMap.set(key, ui);
                this._open<T>(ui, param, key);
            })
            .catch(e => {
                console.log(`[${this.Name}] open`, 'Get Resource Error', e);
            });
    }

    private _open<T>(ui: UIComponentBase<T>, param: T, key: UIPrefabType) {
        ui.node.active = true;
        ui.node.parent = this.UILayer;
        ui.initialize(param);
        this._currUI = key;
        this._showUIs.push(key);
        console.log(`[${this.Name}]`, 'lateOpen ui count:', this.Name, this._showUIs.length);
    }

    public close<T>(key: UIPrefabType, param: T) {
        for (let i = this._showUIs.length - 1; i >= 0; i--) {
            let uikey = this._showUIs[i];
            if (uikey == key) {
                const ui = this._uiMap.get(uikey);
                ui.onClose<T>(param);
                ui.node.parent = this.CacheUILayer;
                ui.node.active = false;
                this._showUIs.splice(i, 1);
                this._currUI = this._showUIs[this._showUIs.length - 1];
                console.log(`[${this.Name}]`, 'close ui left count:', this.Name, this._showUIs.length);
                break;
            }
        }
    }

    public closeCurrent<T>(param: T) {
        if (this._currUI) {
            const ui = this._uiMap.get(this._currUI);
            ui.onClose(param);
            ui.node.parent = this.CacheUILayer;
            this._showUIs.pop();
            if (this._showUIs.length > 1) {
                this._currUI = this._showUIs[this._showUIs.length - 1];
            }else{
                this._currUI = null;
            }
        }
    }

    // public async closeAll() {
    //     while (this._showUIs.length) {
    //         let ui = this.showUIs.shift();
    //         ui.node.parent = this.CacheUILayer;
    //     }
    //     this._showUIs = [];
    //     this._currUI = null;
    // }
}

const viewManager = new UIViewManager();
export default viewManager;