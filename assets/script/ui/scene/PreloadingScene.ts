
import { ProcedureEnum } from "../../define/EIDefine";
import ProcedureManager from "../../manager/ProcedureManager";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PreloadingScene extends BaseScene {

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
    ///////////////////////////////////
    protected lateLoad(): void {

        super.lateLoad();

        this.progress_bar = this.getChildNodeOrComponent("progress_bar", cc.ProgressBar);
        this.progress_label = this.getChildNodeOrComponent("progress_label", cc.Label);
        this.progress_desc = this.getChildNodeOrComponent("progress_desc", cc.Label);

        this.setProgress(0);
        this.setLabel("加载中...0%");
    }

    setProgress(progress: number) {
        this.progress_bar.progress = progress;
    }
    setLabel(content: string) {
        this.progress_label.string = content;
    }

    setDesc(content: string) {
        this.progress_desc.string = content;
    }
    Enter(param: any): void {
        super.Enter(param);
        cc.resources.loadDir("/",
            (finish: number, total: number) => {
                let percent = finish / total;
                //纠错，保证当前进度不会小于上次进度
                percent = Math.max(percent, this.prevPercent);
                this.setProgress(percent);
                this.setLabel(`loading...${percent * 100 ^ 0}%`);
                this.prevPercent = percent;
            }, (error: Error, assets) => {
                cc.log("预加载资源加载完成");
                ProcedureManager.StartProcedure(ProcedureEnum.Config);
            })
    }
    Exit(param) {
        super.Exit(param);
    }
}
