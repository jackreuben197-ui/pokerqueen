import { FormEffect } from "../define/GlobalEnum";
import Main from "../Main";
import SampleForm from "../ui/form/SampleForm";
import { ResManager } from "./ResManager";
import SingleManager from "./SingleManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FormManager extends SingleManager {

    static ins: FormManager;

    uiMap = {};

    currUI: SampleForm = null;

    //已经打开的ui列表
    showUIs: SampleForm[] = [];

    /**
     * 打开一个窗体
     * @param param 携带的参数
     */

    openForm(uiDefine: { Name: string, Bundle: string, Path: string, Title: string }, effect: FormEffect = FormEffect.None, param: any = null) {

        if (this.currUI?.UIDefine.Name == uiDefine.Name) {
            cc.log("当前面板已经存在!");
            return;
        }

        let newUI = this.uiMap[uiDefine.Name];

        if (newUI) {

            this._doForm(newUI, effect, param);

        } else {

            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                    return;
                }
                let ui_node = cc.instantiate(asset);
                newUI = ui_node.getComponent(SampleForm);
                this._doForm(newUI, effect, param);
                this.uiMap[uiDefine.Name] = newUI;
            });
        }
    }

    async closeForm(uiDefine: { Name: string, Bundle: string, Path: string } = null, effect: FormEffect = FormEffect.None) {
        if (uiDefine) {
            for (let i = 0; i < this.showUIs.length; i++) {
                let ui = this.showUIs[i];
                if (ui.UIDefine.Name == uiDefine.Name) {
                    ui.node.parent = Main.Cache_Form;
                    this.showUIs.splice(i, 1);
                    this.currUI = this.showUIs[this.showUIs.length - 1];
                    break;
                }
            }
        } else {
            if (this.currUI) {
                await this.faceOut(this.currUI.node, effect);
                this.currUI.node.parent = Main.Cache_Form;
                this.showUIs.pop();
                this.currUI = this.showUIs[this.showUIs.length - 1];

            }
        }
    }


    private _doForm(ui: SampleForm, effect = FormEffect.None, param: any = null) {
        ui && (ui.node.parent = Main.Form);
        ui?.onShow(param);
        this.currUI = ui;
        this.showUIs.push(ui);
        this.fadeIn(ui?.node, effect);
    }

    fadeIn(node: cc.Node, effect = FormEffect.None) {
        if (node) {
            switch (effect) {
                case FormEffect.RightInOut:
                    node.x = node.width;
                    cc.tween(node).to(.2, { x: 0 }).start();
                    break;
            }
        }
    }

    faceOut(node: cc.Node, effect = FormEffect.None) {
        return new Promise((resolve, reject) => {
            cc.tween(node).to(.2, { x: node.width }).call(() => {
                resolve(0);
            }).start();
        })
    }
}
