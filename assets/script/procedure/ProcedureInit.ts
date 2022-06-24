
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import Main from "../Main";
import BoardManager from "../manager/BoardManager";
import DialogManager from "../manager/DialogManager";
import FormManager from "../manager/FormManager";
import I18NManager from "../manager/I18NManager";
import ProcedureManager from "../manager/ProcedureManager";
import SceneManager from "../manager/SceneManager";
import SingleManager from "../manager/SingleManager";
import ToastManager from "../manager/ToastManager";
import UIManager from "../manager/UIManager";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureInit extends ProcedureBase {



    managers: typeof SingleManager[] = [
        I18NManager,
        ToastManager,
        SceneManager,
        FormManager,
        BoardManager,
        DialogManager,
        UIManager,
    ];


    Enter(param: any) {
        super.Enter(param);
        this.setCCC();
        this.setToWin();
        this.setFit();
        this.bindManagers();
        ProcedureManager.StartProcedure(ProcedureEnum.Preloading);
    }
    Leave() {
        super.Leave();
    }
    /**
     * 设置适配
     */
    setFit(): void {
        let framesize = cc.view.getFrameSize();
        if (framesize.width > framesize.height) {
            cc.Canvas.instance.fitWidth = true;
            cc.Canvas.instance.fitHeight = true;
        } else {
            cc.Canvas.instance.fitWidth = true;
        }
    }
    /**
     * 引擎设置
     */
    setCCC() {
        cc.game.setFrameRate(60); // FPS 设置 30
        cc.macro.ENABLE_MULTI_TOUCH = false; // 禁止多点触摸
    }
    /**
     * 设置到全局引用
     */
    setToWin() {
        //@ts-ignore
        window.UIDefine = UIDefine;
    }


    bindManagers() {
        for (let manager of this.managers) {
            Main.instance.node.addComponent(manager);
            cc.log("manager.name : ", manager.name);
            window[manager.name] = manager;
        }

    }
}
