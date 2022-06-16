import Main from "../Main";
import BaseScene from "../ui/scene/BaseScene";
import { ResManager } from "./ResManager";
import SingleManager from "./SingleManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends SingleManager {

    static ins: SceneManager;
    uiMap = {};
    currUI: cc.Node;
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
        newUI && (newUI.parent = Main.Scene);
        currUI && (currUI.parent = Main.Cache_Scene);
        currUI?.getComponent(BaseScene)?.Exit(currExitParams);
        newUI?.getComponent(BaseScene)?.Enter(newEnterParams);
    }

}
