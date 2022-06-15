import { ProcedureEnum } from "../define/GlobalEnum";
import { UIDefine } from "../define/UIDefine";
import ProcedureManager from "../manager/ProcedureManager";
import BaseScene from "./BaseScene";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PreloadingScene extends BaseScene {

    public UIDefine: { Name: string, Bundle: string, Path: string } = UIDefine.PreloadingScene;



    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    label: cc.Label = null;

    onLoad(): void {
        super.onLoad();
        this.setProgress(0);
        this.setLabel("0 %");
    }

    setProgress(progress: number) {
        this.progressBar.progress = progress;
    }
    setLabel(content: string) {
        this.label.string = content;
    }

    Enter(param: any): void {
        super.Enter(param);
        cc.resources.loadDir("/", (finish: number, total: number) => {
            let percent = finish / total;
            this.setProgress(percent);
            this.setLabel((percent * 100 ^ 0) + " %");
        }, (error: Error, assets) => {
            cc.log("预加载资源加载完成");
            ProcedureManager.StartProcedure(ProcedureEnum.Login);
        })
    }
    Exit(param) {
        super.Exit(param);
    }
}
