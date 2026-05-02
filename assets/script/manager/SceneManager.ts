
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
    async switchScene<T>(scene: IUIDefine, currExitParams: any = null, newEnterParams: T = null) {
        // let sceneKey = scene.Bundle + scene.Path;
        // let newUI = this.sceneMap.get(sceneKey);
        // const asset = await ResManager.GetOrLoad<cc.Prefab>(scene.Bundle, scene.Path);
        // console.log('loaded', asset);
        // if (newUI) {
        //     this._doScene(newUI, currExitParams, newEnterParams);
        // } else {
        //     let r_assset = ResManager.LoadAsset(scene.Bundle, scene.Path) as cc.Prefab;
        //     if (r_assset) {
        //         newUI = cc.instantiate(r_assset);
        //         this._doScene(newUI, currExitParams, newEnterParams);
        //         this.sceneMap.set(sceneKey, newUI);
        //     } else {
        //         ResManager.Load(scene.Bundle, scene.Path, cc.Prefab, (err:Error, asset: cc.Prefab) => {
        //             if (err) {
        //                 console.log("加载场景", scene.Bundle, scene.Path, "发生错误", err);
        //                 return;
        //             }
        //             newUI = cc.instantiate(asset);
        //             this._doScene(newUI, currExitParams, newEnterParams);
        //             this.sceneMap.set(sceneKey, newUI);
        //         });
        //     }
        // }
        let sceneKey = scene.Bundle + scene.Path;
        let newUI = this.sceneMap.get(sceneKey);
        if (!newUI) {
            try {
                const asset = await ResManager.GetOrLoad<cc.Prefab>(scene.Bundle, scene.Path);
                newUI = cc.instantiate(asset);
                this.sceneMap.set(sceneKey, newUI);
            } catch(e) {
                console.log('switchScene, GetOrLoad error', e)
                return;
            }
        }
        this._doScene(newUI, currExitParams, newEnterParams);

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