import Singleton from "../common/Singleton";
import { IUIDefine } from "../define/EIDefine";
import Main from "../Main";
import BaseScene from "../ui/scene/BaseScene";
import { ResManager } from "./ResManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends Singleton {

    static Name: string = "SceneManager";

    static ins: SceneManager;

    uiMap = {};
    currUI: cc.Node;


    //加载的UI层级
    protected UILayer: cc.Node;
    //缓存的UI层级
    protected CacheUILayer: cc.Node;

    protected lateLoad() {

        this.UILayer = Main.Scene;

        this.CacheUILayer = Main.Cache_UI;

    }


    /**
     * 场景切换
     * currExitParams 当前场景退出的参数
     * newEnterParams 新场景进入的参数
     */
    switchScene(uiDefine: { Bundle: string, Path: string }, currExitParams: any = null, newEnterParams: any = null) {

        let bundleName = uiDefine.Bundle + uiDefine.Path;

        let newUI = this.uiMap[bundleName];

        if (newUI) {

            this._doScene(newUI, currExitParams, newEnterParams);

        } else {

            let r_assset = ResManager.LoadAsset(uiDefine.Bundle, uiDefine.Path);

            if (r_assset) {
                newUI = cc.instantiate(r_assset);
                this._doScene(newUI, currExitParams, newEnterParams);
                this.uiMap[bundleName] = newUI;
            } else {
                ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                    if (err) {
                        console.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                        return;
                    }
                    newUI = cc.instantiate(asset);
                    this._doScene(newUI, currExitParams, newEnterParams);
                    this.uiMap[bundleName] = newUI;
                });
            }

        }
    }
    private _doScene(newUI: cc.Node, currExitParams: any = null, newEnterParams: any = null) {

        if (this.currUI) {
            this.currUI.parent = this.CacheUILayer;
            this.currUI.getComponent(BaseScene)?.Exit(currExitParams);
        }
        if (newUI) {
            newUI.parent = this.UILayer;
            newUI.getComponent(BaseScene)?.Enter(newEnterParams);
            this.currUI = newUI;
        }
    }

    /**
     * 获取当前 UIDefine
     */
    public getCurrUIDefine(): IUIDefine {
        return this.currUI?.getComponent(BaseScene)?.UIDefine;
    }

}
