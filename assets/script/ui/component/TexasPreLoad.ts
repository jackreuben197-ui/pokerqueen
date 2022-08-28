
import { LanguageCode } from "../../i18n/LanguageCode";
import { ResManager } from "../../manager/ResManager";
import ToastManager from "../../manager/ToastManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasPreLoad extends UIBase {
    mask: cc.Node = null;
    loading: cc.Node = null;
    progress_bar: cc.ProgressBar = null;
    progress_label: cc.Label = null;
    prevPercent: number = 0;

    //bundle加载尝试次数
    bundle_tryContentCount: number = 3;
    //bundle内部资源尝试次数
    bundleDir_tryContentCount: number = 3;

    bundleName: string = null;

    protected lateLoad() {
        super.lateLoad();
        this.mask = this.getChildNodeOrComponent("mask");
        this.loading = this.getChildNodeOrComponent("loading");
        this.progress_bar = this.getChildNodeOrComponent("progress_bar", cc.ProgressBar);
        this.progress_label = this.getChildNodeOrComponent("progress_label", cc.Label);
    }
    async onShow(param: any = null) {
        super.onShow(param);
        this.setProgress(0);
        this.bundleName = param?.bundleName;
        if (this.bundleName) {
            let loadBundle_result = await ResManager.LoadABs(this.bundleName, this.setProgress.bind(this)).catch(() => { });
            if (loadBundle_result) {
                console.log(`bundle => ${this.bundleName} 包体资源加载完成`);
                param.completeHandler();
            } else {
                ToastManager.ins.createToast(LanguageCode.LanguageDescription(10050))
                param.errorHandler();
            }
        } else {
            cc.log("bundleName is undefined");
        }
    }
    public reset(): void {

    }

    public setProgress(progress: number) {
        progress = Math.max(progress, this.prevPercent);
        this.progress_bar.progress = progress;
        this.setLabel(`${progress * 100 ^ 0}%`);
        this.prevPercent = progress;
    }
    public setLabel(content: string) {
        this.progress_label.string = content;
    }
}
