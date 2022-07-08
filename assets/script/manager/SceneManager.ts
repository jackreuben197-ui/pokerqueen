import Singleton from "../common/Singleton";
import Main from "../Main";
import BaseScene from "../ui/scene/BaseScene";
import { ResManager } from "./ResManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends Singleton {

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
     * currEnterParams 进入当前场景的参数
     * preExitParams 退出前一个场景的参数
     */
    switchScene(uiDefine: { Bundle: string, Path: string }, currExitParams: any = null, newEnterParams: any = null) {


        let bundleName = uiDefine.Bundle + uiDefine.Path;

        let newUI = this.uiMap[bundleName];

        if (newUI) {

            this._doScene(this.currUI, newUI, currExitParams, newEnterParams);

        } else {

            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                    return;
                }
                newUI = cc.instantiate(asset);
                this._doScene(this.currUI, newUI, currExitParams, newEnterParams);
                this.currUI = newUI;
                this.uiMap[bundleName] = newUI;
            });
        }
    }
    private _doScene(currUI: cc.Node, newUI: cc.Node, currExitParams: any = null, newEnterParams: any = null) {
        newUI && (newUI.parent = this.UILayer);
        currUI && (currUI.parent = this.CacheUILayer);
        currUI?.getComponent(BaseScene)?.Exit(currExitParams);
        newUI?.getComponent(BaseScene)?.Enter(newEnterParams);
    }

}
