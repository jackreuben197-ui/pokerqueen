import { GameConfig } from '../config/GameConfig';
import { traceClass } from '../crazyPoker/gameplay/common/core/LogTrace';
import GC from '../frame/GameControl';
import H5MsgMgr from '../H5MsgMgr';
import { i18nMgr } from '../i18n/i18nMgr';
import * as MainUtils from '../MainUtils';
import { PreloadDefinitionGame, PreloadDefinitionSound, PreloadDefinitionTexas, PreloadParams } from '../manager/ResManager';
import StorageKey from '../session/StorageKey';
import UIComponent, { PrefabUI } from '../ui/UIComponent';
import ProcedureBase from './ProcedureBase';

@traceClass()
export default class ProcedureInit extends ProcedureBase {
    Name: string = 'ProcedureInit';

    private _resolveDone: (v: any) => void;
    private _waitLoadingCompletePromise = new Promise(resolve => (this._resolveDone = resolve));

    async lateEnter(param?: any) {
        super.lateEnter(param);
        this.setCCC();
        this.setFit();
        //解析 语言配置
        this.setNetwork();
        i18nMgr.initLanguage();
        await i18nMgr.loadAndRefreshConfig();
        // 已加载过牌桌资源则隐藏首次加载提示
        if (GC.localStore.getItem(StorageKey.TextureResourceLoaded) === 1) {
            const firstloadLabel = cc.find('Canvas/Block - 遮挡/UIPreloading/progress_node/firstload_label');
            if (firstloadLabel) firstloadLabel.active = false;
        }
        MainUtils.loadWebSDK();
        // 引擎设置完成，等待 H5 层发送消息驱动后续流程
        this.tracelog.debug('等待 H5 层指令...');
        //显示房间进入loading
        UIComponent.Instance.ShowUI<PreloadParams>(PrefabUI.UIPreloading, {
            preloadDefinition: [PreloadDefinitionGame, PreloadDefinitionSound, PreloadDefinitionTexas],
            complete: () => {
                this.tracelog.debug('ProcedureInit 结束，资源加载完全');
                this._resolveDone(true);
            },
            error: () => {
                this.tracelog.error('ProcedureInit show preloading error');
            }
        });
    }

    async Leave() {
        H5MsgMgr.sendToH5('h5Hide', 1);
        await this._waitLoadingCompletePromise;
        super.Leave();
    }

    /**
     * 设置适配
     */
    private setFit(): void {
        ProcedureInit.updateFitMode();
    }

    /**
     * 根据当前窗口宽高比重新计算适配模式并直接应用
     */
    static updateFitMode(): void {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const w_h_r = w / h;
        this.tracelog.debug('窗口实际分辨率', w, h);
        const view = cc.view as any;
        view._frameSize.width = w;
        view._frameSize.height = h;
        const canvas = cc.Canvas.instance;
        const designW = canvas.designResolution.width;
        const designH = canvas.designResolution.height;
        if (w_h_r > 0.63) {
            cc.view.setDesignResolutionSize(designW, designH, cc.ResolutionPolicy.FIXED_HEIGHT);
        } else {
            cc.view.setDesignResolutionSize(designW, designH, cc.ResolutionPolicy.FIXED_WIDTH);
        }
        // 触发 Widget 重新对齐：
        // setDesignResolutionSize 只发出 "design-resolution-changed"，
        // 而 CCWidgetManager 监听的是 "canvas-resize"，需要手动补发
        cc.view.emit('canvas-resize');
    }

    /**
     * 引擎设置
     */
    private setCCC() {
        this.tracelog.debug('set frame rate');
        cc.game.setFrameRate(GameConfig.FRAME_RATE); // FPS 设置
        cc.macro.ENABLE_MULTI_RATIO = GameConfig.ENABLE_MULTI_TOUCH; // 禁止多点触摸
        // 禁用引擎内置 resize 监听
        cc.view.resizeWithBrowserSize(false);
        // 替换引擎内部的 _initFrameSize，确保始终读取窗口实际尺寸
        const view = cc.view as any;
        view._initFrameSize = function () {
            this._frameSize.width = window.innerWidth;
            this._frameSize.height = window.innerHeight;
            this._isRotated = false;
        };
    }

    //初始化网络配置（static 供其他 Procedure 在 H5 桥接模式下兜底调用）
    private setNetwork() {
        this.tracelog.debug('set network');
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
