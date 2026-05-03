
import { GameConfig } from "../config/GameConfig";
import { i18nMgr } from "../i18n/i18nMgr";
import * as MainUtils from "../MainUtils";
import ProcedureBase from "./ProcedureBase";

export default class ProcedureInit extends ProcedureBase {
    Name: string = "ProcedureInit";
    async lateEnter(param?: any) {
        super.lateEnter(param);
        this.setCCC();
        this.setFit();
        //解析 语言配置
        this.setNetwork();
        await i18nMgr.loadAndRefreshConfig();
        i18nMgr.initLanguage();
        MainUtils.loadWebSDK();
        // 引擎设置完成，等待 H5 层发送消息驱动后续流程
        console.log('[Procedure]',"ProcedureInit 完成，等待 H5 层指令...");
    }
    Leave() {
        super.Leave();
    }
    /**
     * 设置适配
     */
    private setFit(): void {
        let framesize = cc.view.getFrameSize();
        let w_h_r = framesize.width / framesize.height;

        console.log('[Procedure]',"屏幕实际分辨率", framesize.width, framesize.height);

        if (w_h_r > 0.63) {
            cc.Canvas.instance.fitHeight = true;
        } else {
            cc.Canvas.instance.fitWidth = true;
        }
    }
    /**
     * 引擎设置
     */
    private setCCC() {
        console.log('[Procedure]','set frame rate')
        cc.game.setFrameRate(GameConfig.FRAME_RATE); // FPS 设置
        cc.macro.ENABLE_MULTI_TOUCH = GameConfig.ENABLE_MULTI_TOUCH; // 禁止多点触摸
    }


     //初始化网络配置（static 供其他 Procedure 在 H5 桥接模式下兜底调用）
    private setNetwork() {
        console.log('[Procedure]','set network')
        switch (GameConfig.BUILD_TYPE) {
            case 0:
                GameConfig.Network = {
                    WebHost: `http://${GameConfig.Web_Host_Dev}`,
                    WSS: `ws://${GameConfig.Web_Host_Dev}{0}`
                };
                break;
            case 1:
                GameConfig.Network = {
                    WebHost: `http://${GameConfig.Web_Host_Test1}`,
                    WSS: `ws://${GameConfig.Web_Host_Test1}{0}`
                };
                break;
            case 2:
                GameConfig.Network = {
                    WebHost: `http://${GameConfig.Web_Host_Dev1}`,
                    WSS: `ws://${GameConfig.Web_Host_Dev1}/api/channel/`
                };
                break;
            case 3:
                GameConfig.Network = {
                    WebHost: `https://${GameConfig.Web_Host_Test1}`,
                    WSS: `wss://${GameConfig.Web_Host_Test1}/api/channel/`
                };

                break;
            case 4:
                GameConfig.Network = {
                    WebHost: `https://${GameConfig.Web_Host_Dev1}`,
                    WSS: `wss://${GameConfig.Web_Host_Dev1}/api/channel/`
                };
                break;
            case 5:
                GameConfig.Network = {
                    WebHost: `https://${GameConfig.Web_Host_Test1}`,
                    WSS: `wss://${GameConfig.Web_Host_Test1}{0}`
                };
                break;
        }
    }
}
