import { CPErrorCode } from "../i18n/CPErrorCode";
import Main from "../Main";
import { Bundle_Resources, Bundle_Texas, Pre_Load, ResManager } from "../manager/ResManager";
import ToastManager from "../manager/ToastManager";
import AssetContext from "./component/AssetContext";
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
    async onShow(param?: Pre_Load) {
        super.onShow(param);
        this.setProgress(0);
        let bundle = param.pre_define.bundle;
        let dir = param.pre_define.dir;
        this.asset_count = 0;
        if (bundle == Bundle_Resources) {
            cc.resources.loadDir(dir,
                (finish: number, total: number, item: cc.AssetManager.RequestItem) => {
                    if (param.stopProgress) return;
                    let percent = finish / total;
                    //纠错，保证当前进度不会小于上次进度
                    percent = Math.max(percent, this.prevPercent);
                    this.setProgress(percent);
                }, (error: Error, assets) => {
                    if (error) {
                        console.warn(`资源加载失败:${bundle}/${dir}`);
                        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
                    } else {
                        console.log(`资源加载完成:${bundle}/${dir}`);

                        assets.forEach((item) => {
                            if (item instanceof cc.Prefab) {
                                AssetContext.setAsset(Bundle_Resources, item.name, item);
                                let ac = item.data?.getComponent(AssetContext);
                                if (ac) {
                                    this.asset_count++;
                                    //console.log("解析:", item, this.asset_count);
                                    item.data.children.forEach((item) => {
                                        let sprite = item.getComponent(cc.Sprite);
                                        if (sprite) {
                                            AssetContext.setAsset(ac.fold, item.name, sprite.spriteFrame);
                                        }
                                        let sound = item.getComponent(cc.AudioSource);
                                        if (sound) {
                                            AssetContext.setAsset(ac.fold, item.name, sound.clip);
                                        }
                                    })
                                }
                            }
                        }
                        )
                        param?.complete();
                    }
                })
        } else {
            let loadBundle_result = await ResManager.LoadABs(bundle, this.setProgress.bind(this)).catch(() => { });
            if (loadBundle_result) {
                console.log(`bundle => ${bundle} 包体资源加载完成`);
                param?.complete();
            } else {
                ToastManager.Instance.createToast(CPErrorCode.LanguageDescription(10050))
                param?.error();
            }

        }
    }
}