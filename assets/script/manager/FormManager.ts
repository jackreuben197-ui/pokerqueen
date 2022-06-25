
import { UIFadeStyleEnum } from "../define/EIDefine";
import Main from "../Main";
import UIBase from "../ui/UIBase";
import { ResManager } from "./ResManager";
import SingleManager from "./SingleManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FormManager extends SingleManager {

    static ins: FormManager;

    uiMap = {};

    currUI: UIBase = null;

    //已经打开的ui列表
    showUIs: UIBase[] = [];


    //加载的UI层级
    protected UILayer: cc.Node;
    //缓存的UI层级
    protected CacheUILayer: cc.Node;

    protected lateLoad() {

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

    open(uiDefine: { Name: string, Bundle: string, Path: string, UIFadeStyle?: UIFadeStyleEnum }, param: any = null) {

        if (this.currUI?.UIDefine.Name == uiDefine.Name) {
            cc.log("当前面板已经存在!");
            return;
        }

        let newUI = this.find(uiDefine);

        if (newUI) {

            this.lateOpen(newUI, uiDefine.UIFadeStyle, param);

        } else {

            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                    return;
                }
                let ui_node = cc.instantiate(asset);
                newUI = ui_node.getComponent(UIBase);
                this.uiMap[uiDefine.Name] = newUI;
                this.lateOpen(newUI, uiDefine.UIFadeStyle, param);
            });
        }
    }

    async close(uiDefine: { Name: string, Bundle: string, Path: string } = null, param: any = null) {

        if (uiDefine) {
            for (let i = 0; i < this.showUIs.length; i++) {
                let ui = this.showUIs[i];
                if (ui.UIDefine.Name == uiDefine.Name) {
                    let fadeEffect = param?.fadeEffect || this.currUI.UIDefine.UIFadeStyle;
                    await this.faceOut(this.currUI.node, fadeEffect);
                    this.currUI.onClose();
                    ui.node.parent = this.CacheUILayer;
                    this.showUIs.splice(i, 1);
                    this.currUI = this.showUIs[this.showUIs.length - 1];
                    cc.log("关闭面板:", this.currUI);
                    break;
                }
            }
        } else {
            if (this.currUI) {
                let fadeEffect = param?.fadeEffect || this.currUI.UIDefine.UIFadeStyle;
                await this.faceOut(this.currUI.node, fadeEffect);
                this.currUI.onClose();
                this.currUI.node.parent = this.CacheUILayer;
                this.showUIs.pop();
                this.currUI = this.showUIs[this.showUIs.length - 1];
            }
        }
    }

    protected lateOpen(ui: UIBase, style: UIFadeStyleEnum = UIFadeStyleEnum.None, param: any = null) {
        ui && (ui.node.parent = this.UILayer);
        ui?.onShow(param);
        this.fadeIn(ui, style, param);
        this.currUI = ui;
        this.showUIs.push(ui);

    }

    fadeIn(ui: UIBase, effect = UIFadeStyleEnum.None, param: any = null) {
        if (ui.node) {
            switch (effect) {
                case UIFadeStyleEnum.RightInOut:
                    ui.node.x = ui.node.width;
                    cc.tween(ui.node).to(.2, { x: 0 }).start();
                    break;
            }
        }
    }

    faceOut(node: cc.Node, effect = UIFadeStyleEnum.None) {
        return new Promise((resolve, reject) => {
            switch (effect) {
                case UIFadeStyleEnum.RightInOut:
                    cc.tween(node).to(.2, { x: node.width }).call(() => {
                        resolve(0);
                    }).start();
                    break;
                default:
                    resolve(0);
                    break;
            }
        })
    }
}
