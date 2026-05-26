import { BUNDLE_RESOURCES, PreloadParams, ResManager } from '../manager/ResManager';
import UIBase from './UIBase';
import UIComponent, { PrefabUI } from './UIComponent';
const { ccclass, property } = cc._decorator;
const LN = '[UIPreloadingComponent]';

@ccclass
export default class UIPreloadingComponent extends UIBase {
    /**
     * 节点|组件 定义
     */
    progress_bar: cc.ProgressBar = null;
    progress_label: cc.Label = null;
    progress_desc: cc.Label = null;
    //上一次进度
    private prevPercent: number = 0;
    private asset_count: number = 0;

    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.progress_bar = this.getChildNodeOrComponent('progress_bar', cc.ProgressBar);
        this.progress_label = this.getChildNodeOrComponent('progress_label', cc.Label);
        this.progress_desc = this.getChildNodeOrComponent('progress_desc', cc.Label);
    }

    setProgress(progress: number) {
        this.progress_bar.progress = progress;
        this.setLabel(`loading...${(progress * 100) ^ 0}%`);
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
        const parts = param.preloadDefinition.length;
        let part = Math.round(10000 / parts) / 10000;
        try {
            for (let i = 0; i < parts; i++) {
                const definition = param.preloadDefinition[i];
                await this.loadResources(definition.bundle, definition.dir, param.stopProgress, i * part, part);
            }
            param.complete?.();
        } catch (e) {
            param.error?.(e instanceof Error ? e : new Error(String(e)));
        }
    }

    private loadResources(bundleName: string, dir: string, stopProgress: boolean, pastProgress: number, totalPercent: number): Promise<void> {
        return new Promise((resovle, reject) => {
            if (bundleName == BUNDLE_RESOURCES) {
                cc.resources.loadDir(
                    dir,
                    (finish: number, total: number, item: cc.AssetManager.RequestItem) => {
                        if (stopProgress) return;
                        let percent = totalPercent * (finish / total) + pastProgress;
                        this.asset_count = total;
                        //纠错，保证当前进度不会小于上次进度
                        percent = Math.max(percent, this.prevPercent);
                        this.setProgress(percent);
                        //console.log(LN, "=====>", BUNDLE_RESOURCES, item.url);
                    },
                    (error: Error, assets: cc.Asset[]) => {
                        if (error) {
                            console.warn(LN, `资源加载失败:${bundleName}/${dir}`);
                            UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                            reject(error as Error);
                            return;
                        }
                        console.log(LN, `资源加载完成:${bundleName}/${dir}`, assets.length);
                        ResManager.AssetForeach(assets, BUNDLE_RESOURCES);
                        resovle();
                    }
                );
                return;
            }
            cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
                if (err) {
                    cc.log('load bundle error:', bundleName);
                    if (err) {
                        console.warn(LN, `资源加载失败:${bundleName}/${dir}`);
                        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                        reject(err);
                        return;
                    }
                    return;
                }
                bundle.loadDir(
                    dir,
                    (finish: number, total: number, item: cc.AssetManager.RequestItem) => {
                        if (stopProgress) return;
                        let percent = totalPercent * (finish / total) + pastProgress;
                        //纠错，保证当前进度不会小于上次进度
                        percent = Math.max(percent, this.prevPercent);
                        this.setProgress(percent);
                        // console.log(LN, "=====>", bundleName, item.url);
                    },
                    (error: Error, assets: cc.Asset[]) => {
                        if (error) {
                            console.warn(LN, `资源加载失败:${bundleName}/${dir}`);
                            UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                            reject(error);
                            return;
                        }
                        this.setProgress(1);
                        console.log(LN, `资源加载完成:${bundleName}/${dir}`, assets.length);
                        ResManager.AssetForeach(assets, bundleName);
                        resovle();
                    }
                );
            });
        });
    }
}
