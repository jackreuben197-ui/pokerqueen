
import { GameConfig } from "../config/GameConfig";
import { ProcedureEnum } from "../define/EIDefine";
import ProcedureManager from "../manager/ProcedureManager";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureInit extends ProcedureBase {


    Name: string = "ProcedureInit";

    lateEnter(param?: any) {
        super.lateEnter(param);
        this.setCCC();
        this.setFit();
        ProcedureManager.StartProcedure(ProcedureEnum.Config);
    }
    Leave() {
        super.Leave();
    }
    /**
     * 设置适配
     */
    setFit(): void {
        let framesize = cc.view.getFrameSize();
        let w_h_r = framesize.width / framesize.height;

        console.log("屏幕实际分辨率", framesize.width, framesize.height);

        if (w_h_r > 0.63) {
            cc.Canvas.instance.fitHeight = true;
        } else {
            cc.Canvas.instance.fitWidth = true;
        }
    }
    /**
     * 引擎设置
     */
    setCCC() {
        cc.game.setFrameRate(GameConfig.FrameRate); // FPS 设置
        cc.macro.ENABLE_MULTI_TOUCH = GameConfig.ENABLE_MULTI_TOUCH; // 禁止多点触摸
    }
}
