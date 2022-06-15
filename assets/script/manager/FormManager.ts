import SampleForm from "../form/SampleForm";
import Main from "../Main";
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

    openForm(uiDefine: { Name: string, Bundle: string, Path: string, Title: string }, param: any = null) {

        if (this.currUI.UIDefine.Name == uiDefine.Name) {
            cc.log("当前面板已经存在!");
            return;
        }

        let newUI = this.uiMap[uiDefine.Name];

        if (newUI) {

            this._doForm(newUI, param);

        } else {

            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                    return;
                }
                let ui_node = cc.instantiate(asset);
                newUI = ui_node.getComponent(SampleForm);
                this._doForm(newUI, param);
                this.uiMap[uiDefine.Name] = newUI;
            });
        }
    }

    closeForm(uiDefine: { Bundle: string, Path: string, Title: string }) {



    }


    private _doForm(ui: SampleForm, param: any = null) {
        ui && (ui.node.parent = Main.Form);
        ui?.onShow(param);
        this.currUI = ui;
        this.showUIs.push(ui);
    }

}
