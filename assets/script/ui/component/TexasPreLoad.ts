
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

    bundleName: string;

    protected lateLoad() {
        super.lateLoad();
        this.mask = this.getChildNodeOrComponent("mask");
        this.loading = this.getChildNodeOrComponent("loading");
        this.progress_bar = this.getChildNodeOrComponent("progress_bar", cc.ProgressBar);
        this.progress_label = this.getChildNodeOrComponent("progress_label", cc.Label);
    }
    onShow(param: any = null) {
        super.onShow(param);
        this.setProgress(0);
        this.bundleName = param?.bundleName;
        this.wsEnterRoom();
        this.loadBundle();
    }

    loadBundle() {
        if (this.bundleName) {
            //加载包
            cc.assetManager.loadBundle(this.bundleName, (err, bundle) => {
                if (err) {
                    cc.log("load bundle error:", this.bundleName);
                } else {
                    bundle.loadDir("/",
                        (finish: number, total: number) => {
                            let percent = finish / total;
                            //纠错，保证当前进度不会小于上次进度
                            percent = Math.max(percent, this.prevPercent);
                            this.setProgress(percent);
                        }, (error: Error, assets) => {
                            //cc.log("预加载资源加载完成");
                            //ProcedureManager.StartProcedure(ProcedureEnum.Config);
                            if (error) {
                                cc.log("load dir error:", error);
                            } else {

                            }
                        })
                }
            })
        }
    }

    public reset(): void {

    }

    public setProgress(progress: number) {
        this.progress_bar.progress = progress;
        this.setLabel(`${progress * 100 ^ 0}%`);
        this.prevPercent = progress;
    }
    public setLabel(content: string) {
        this.progress_label.string = content;
    }

    private wsEnterRoom() {
        
    }
}
