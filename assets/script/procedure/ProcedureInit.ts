
import Singleton from "../common/Singleton";
import { AreaCodeConfig } from "../config/AreaCodeConfig";
import { GameConfig } from "../config/GameConfig";
import { ProcedureEnum } from "../define/EIDefine";
import { UIDefine } from "../define/UIDefine";
import CPMessageDispatherComponent from "../event/CPMessageDispatherComponent";
import Main from "../Main";
import AlertManager from "../manager/AlertManager";
import BoardManager from "../manager/BoardManager";
import DialogManager from "../manager/DialogManager";
import FormManager from "../manager/FormManager";

import ProcedureManager from "../manager/ProcedureManager";
import PromptManager from "../manager/PromptManager";
import SceneManager from "../manager/SceneManager";
import ToastManager from "../manager/ToastManager";
import UIManager from "../manager/UIManager";
import HttpClient from "../net/https/HttpClient";

import AssetContext from "../ui/component/AssetContext";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureInit extends ProcedureBase {


    Name: string = "ProcedureInit";

    managers: typeof Singleton[] = [
        AlertManager,
        ToastManager,
        SceneManager,
        FormManager,
        BoardManager,
        DialogManager,
        PromptManager,
        UIManager,
    ];
    lateEnter(param?: any) {
        super.lateEnter(param);
        this.setCCC();
        this.setToWin();
        this.setFit();
        this.bindManagers();
        this.bindComponents();
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
        // if (framesize.width > framesize.height) {
        //     cc.Canvas.instance.fitWidth = true;
        //     cc.Canvas.instance.fitHeight = true;
        // } else {
        //     cc.Canvas.instance.fitWidth = true;
        // }
        let w_h_r = framesize.width / framesize.height;

        if (w_h_r > 0.6) {
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
    /**
     * 设置到全局引用 (方便浏览器F12控制台可以直接输入)
     */
    setToWin() {
        let classes = {
            UIDefine,
            Main,
            ProcedureManager,
            AssetContext,
            GameConfig,
            HttpClient,
            AreaCodeConfig,
        }

        for (let key in classes) {
            cc.log(`[window class.name : ${key}]`)
            window[key] = classes[key];
        }
    }
    bindManagers() {
        for (let manager of this.managers) {
            Main.instance.node.addComponent(manager);
            let name: string = (manager as any)?.Name;
            cc.log(`[window manager.name : ${name}]`);
            window[name] = manager;
        }

    }
    bindComponents() {
        Main.instance.node.addComponent(CPMessageDispatherComponent);
    }
}
