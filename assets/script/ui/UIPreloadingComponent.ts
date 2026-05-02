import { CPErrorCode } from "../i18n/CPErrorCode";
import { BUNDLE_RESOURCES, PreloadParams, ResManager } from "../manager/ResManager";
import UIBase from "./UIBase";
import UIComponent, { PrefabUI } from "./UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPreloadingComponent extends UIBase {
    /**
     * 节点|组件 定义
     */
    progress_bar: cc.ProgressBar = null;
    progress_label: cc.Label = null;
    progress_desc: cc.Label = null;
    ///////////////////////////////////

    /**
     * 声明内容
     */
    //上一次进度
    private prevPercent: number = 0;

    private asset_count: number = 0;
    ///////////////////////////////////
    protected lateLoad(): void {

        super.lateLoad();

        this.progress_bar = this.getChildNodeOrComponent("progress_bar", cc.ProgressBar);
        this.progress_label = this.getChildNodeOrComponent("progress_label", cc.Label);
        this.progress_desc = this.getChildNodeOrComponent("progress_desc", cc.Label);
    }

    setProgress(progress: number) {
        this.progress_bar.progress = progress;
        this.setLabel(`loading...${progress * 100 ^ 0}%`);
        this.prevPercent = progress;
    }
    setLabel(content: string) {
        this.progress_label.string = content;
    }

    setDesc(content: string) {
        this.progress_desc.string = content;
    }
    async onShow(param?: PreloadParams) {
        super.onShow(param);
        this.setProgress(0);
        let bundleName = param.preloadDefinition.bundle;
        let dir = param.preloadDefinition.dir;
        this.asset_count = 0;
        await new Promise((resolve, reject) => {
             if (bundleName == BUNDLE_RESOURCES) {
                cc.resources.loadDir(dir,
                    (finish: number, total: number, item: cc.AssetManager.RequestItem) => {
                        if (param.stopProgress) return;
                        let percent = finish / total;
                        //纠错，保证当前进度不会小于上次进度
                        percent = Math.max(percent, this.prevPercent);
                        this.setProgress(percent);

                        //console.log("=====>", BUNDLE_RESOURCES, item.url);

                    }, (error: Error, assets: cc.Asset[]) => {
                        if (error) {
                            console.warn(`资源加载失败:${bundleName}/${dir}`);
                            UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                            param?.error?.(error);
                            reject(0);
                            return;
                        }
                        console.log(`资源加载完成:${bundleName}/${dir}`, assets.length);
                        ResManager.AssetForeach(assets, BUNDLE_RESOURCES);
                        param?.complete?.();
                        resolve(1);
                    });
                return;
            } 
            
            cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
                if (err) {
                    cc.log("load bundle error:", bundleName);
                    if (err) {
                        console.warn(`资源加载失败:${bundleName}/${dir}`);
                        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                        param?.error?.(err);
                        reject(0);
                        return;
                    }
                    return;
                }
                bundle.loadDir(
                    dir,
                    (finish: number, total: number, item: cc.AssetManager.RequestItem) => {
                    if (param.stopProgress) return;
                        let percent = finish / total;
                        //纠错，保证当前进度不会小于上次进度
                        percent = Math.max(percent, this.prevPercent);
                        this.setProgress(percent);
                        // console.log("=====>", bundleName, item.url);
                    }, (error: Error, assets: cc.Asset[]) => {
                        if (error) {
                            console.warn(`资源加载失败:${bundleName}/${dir}`);
                            UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                            param?.error?.(error);
                            reject(0);
                            return;
                        }
                        console.log(`资源加载完成:${bundleName}/${dir}`, assets.length);
                        ResManager.AssetForeach(assets, bundleName);
                        param?.complete?.();
                        resolve(1);
                    });
            })
  
        })
       
        // let loadBundle_result = await ResManager.LoadABs(bundleName, this.setProgress.bind(this)).catch(() => { });
        // if (loadBundle_result) {
        //     console.log(`bundle => ${bundleName} 包体资源加载完成`);
        //     param?.complete();
        // } else {
        //     ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10050))
        //     param?.error();
        // }
        
    }
}