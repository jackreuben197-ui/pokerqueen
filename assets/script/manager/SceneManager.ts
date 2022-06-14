import Main from "../Main";
import BaseScene from "../scene/BaseScene";
import { ResManager } from "./ResManager";
import SingleManager from "./SingleManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends SingleManager {

    static ins: SceneManager;
    sceneMap = {};
    currScene: cc.Node;
    /**
     * 场景切换
     * currEnterParams 进入当前场景的参数
     * preExitParams 退出前一个场景的参数
     */
    switchScene(uiDefine: { Bundle: string, Path: string }, currExitParams: any = null, newEnterParams: any = null) {


        let bundleName = uiDefine.Bundle + uiDefine.Path;

        let newScene = this.sceneMap[bundleName];

        if (newScene) {

            this._doScene(this.currScene, newScene, currExitParams, newEnterParams);

        } else {

            ResManager.Load(uiDefine.Bundle, uiDefine.Path, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.log("加载场景", uiDefine.Bundle, uiDefine.Path, "发生错误", err);
                    return;
                }
                newScene = cc.instantiate(asset);
                this._doScene(this.currScene, newScene, currExitParams, newEnterParams);
                this.currScene = newScene;
                this.sceneMap[bundleName] = newScene;
            });

            // cc.resources.load("prefab/scene/PreloadingScene",cc.Prefab,(err)=>{
            //     cc.log("加载成功")
            // })



        }

    }

    private _doScene(currScene: cc.Node, newScene: cc.Node, currExitParams: any = null, newEnterParams: any = null) {
        currScene?.getComponent(BaseScene)?.Exit(currExitParams);
        newScene?.getComponent(BaseScene)?.Enter(newEnterParams);
        currScene && (currScene.parent = Main.Cache_Scene);
        newScene.parent = Main.Scene;
    }


}
