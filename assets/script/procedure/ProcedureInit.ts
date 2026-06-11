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
        await this.setNetwork();
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
    private async setNetwork() {
        this.tracelog.debug('set network');
        // 优先读取运行时 config.json 的 baseApi（与 h5 项目共用同一份配置）：
        // 改 config.json 的 baseApi 即可同时切换 Cocos 的 HTTP 与 WebSocket，
        // 无需为每个环境改 BUILD_TYPE 重新打包。读取失败时回落到下方旧逻辑。
        if (await this.setNetworkFromConfigJson()) {
            return;
        }
        // 生产环境：页面非已知测试域名时，与当前页面同域（反向代理）。
        // 一次构建多环境通用，无需为每个环境改 BUILD_TYPE 重新打包。
        // WSS 仍保留 {0} 占位符，运行时由 WebSocketClient.SetPort 替换为 :端口。
        const knownTestHosts = [
            GameConfig.Web_Host_Dev,
            GameConfig.Web_Host_Dev1,
            GameConfig.Web_Host_Dev2,
            GameConfig.Web_Host_Test1,
            'localhost',
            '127.0.0.1'
        ];
        const pageHost = typeof location !== 'undefined' ? location.hostname : '';
        if (pageHost && knownTestHosts.indexOf(pageHost) === -1) {
            const isHttps = location.protocol === 'https:';
            GameConfig.Network = {
                WebHost: location.origin,
                WSS: `${isHttps ? 'wss' : 'ws'}://${location.hostname}{0}`
            };
            this.tracelog.debug('set network (prod same-origin):', GameConfig.Network);
            return;
        }
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
            case 6:
                GameConfig.Network = {
                    WebHost: `https://${GameConfig.Web_Host_Dev2}`,
                    WSS: `wss://${GameConfig.Web_Host_Dev2}{0}`
                };
                break;
        }
    }

    /**
     * 从运行时 config.json 的 baseApi 推导 WebHost 与 WSS。
     * 成功（拿到合法的绝对地址 baseApi）返回 true，调用方据此跳过旧的 BUILD_TYPE 逻辑。
     * - WebHost：baseApi 去掉结尾的 /api（接口常量已自带 /api 前缀），避免出现 //api/api。
     * - WSS：取 baseApi 的 hostname，按协议拼 wss/ws，保留 {0} 占位符交给 WebSocketClient.SetPort。
     */
    private async setNetworkFromConfigJson(): Promise<boolean> {
        try {
            if (typeof fetch !== 'function' || typeof location === 'undefined') {
                return false;
            }
            // config.json 与 index.html 同级部署，按当前文档地址解析为同源绝对路径。
            const configUrl = new URL('config.json', location.href).href + `?_=${Date.now()}`;
            const res = await fetch(configUrl, { cache: 'no-store' });
            if (!res.ok) {
                return false;
            }
            const data = await res.json();
            const baseApi = (data && typeof data.baseApi === 'string' ? data.baseApi : '').trim();
            if (!/^https?:\/\//i.test(baseApi)) {
                return false;
            }
            const apiUrl = new URL(baseApi);
            // 去掉结尾的 /api 或 /api/，得到纯域名前缀作为 WebHost。
            const webHost = baseApi.replace(/\/+$/, '').replace(/\/api$/i, '');
            const wsProtocol = apiUrl.protocol === 'https:' ? 'wss' : 'ws';
            GameConfig.Network = {
                WebHost: webHost,
                WSS: `${wsProtocol}://${apiUrl.hostname}{0}`
            };
            this.tracelog.debug('set network (config.json baseApi):', GameConfig.Network);
            return true;
        } catch (e) {
            this.tracelog.debug('set network from config.json failed, fallback:', e);
            return false;
        }
    }
}
