
import { IUIDefine } from "../define/EIDefine";
import Main from "../Main";
import BaseScene from "../ui/scene/BaseScene";
import { ResManager } from "./ResManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager {

    sceneMap = new Map<string, cc.Node>();
    currUI: cc.Node = null;

    //加载的UI层级
    protected UILayer: cc.Node = null;
    //缓存的UI层级
    protected CacheUILayer: cc.Node = null;

    static get Instance(): SceneManager {
        return (<any>this).instance ??= new SceneManager();
    }
    constructor() {
        this.UILayer = Main.Scene;
        this.CacheUILayer = Main.CacheUI;
    }

    /**
     * 场景切换
     * currExitParams 当前场景退出的参数
     * newEnterParams 新场景进入的参数
     */
    switchScene<T>(scene: IUIDefine, currExitParams: any = null, newEnterParams: T = null) {
        let sceneKey = scene.Bundle + scene.Path;
        let newUI = this.sceneMap.get(sceneKey);
        if (newUI) {
            this._doScene(newUI, currExitParams, newEnterParams);
            return;
        }
        ResManager.GetOrLoad<cc.Prefab>(scene.Bundle, scene.Path).then( asset => {
            newUI = cc.instantiate(asset);
            this.sceneMap.set(sceneKey, newUI);
            this._doScene(newUI, currExitParams, newEnterParams);
        }).catch( e => {
             console.log('switchScene, GetOrLoad error', e)
        });
    }

    private _doScene(newUI: cc.Node, currExitParams: any = null, newEnterParams: any = null) {

        if (this.currUI) {
            this.currUI.parent = this.CacheUILayer;
            this.currUI.getComponent(BaseScene)?.Exit(currExitParams);
        }
        if (newUI) {
            newUI.active = true;
            newUI.parent = this.UILayer;
            newUI.getComponent(BaseScene)?.Enter(newEnterParams);
            this.currUI = newUI;
        }
    }

    //移除场景记录
    public removeScene(uiDefine: { Bundle: string, Path: string }) {
        let bundleName = uiDefine.Bundle + uiDefine.Path;
        this.sceneMap.delete(bundleName);
    }

    /**
     * 获取当前 UIDefine
     */
    public getCurrUIDefine(): IUIDefine {
        return this.currUI?.getComponent(BaseScene)?.UIDefine;
    }

}
(window as any).SceneManager = SceneManager;