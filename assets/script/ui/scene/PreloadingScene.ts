
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
    ///////////////////////////////////
    protected lateLoad(): void {

        super.lateLoad();

        this.progress_bar = this.getChildNode("progress_bar")?.getComponent(cc.ProgressBar);
        this.progress_label = this.getChildNode("progress_label")?.getComponent(cc.Label);
        this.progress_desc = this.getChildNode("progress_desc")?.getComponent(cc.Label);

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
                this.setProgress(percent);
                this.setLabel(`加载中...${percent * 100 ^ 0}%`);
            }, (error: Error, assets) => {
                cc.log("预加载资源加载完成");
                ProcedureManager.StartProcedure(ProcedureEnum.Login);
            })
    }
    Exit(param) {
        super.Exit(param);
    }
}
