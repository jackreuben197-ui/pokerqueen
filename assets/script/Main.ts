/*
 * @Author: xfj
 * @Date: 2022-11-02 10:22:02
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-03 15:59:34
 * @FilePath: /pokerqueen/assets/script/Main.ts
 */
/**
 * 入口函数
 */
import Common_Button_Ex from "./common/Common_Button_Ex";
import { GameConfig } from "./config/GameConfig";
import GC from "./frame/GameControl";
import OrientationComponent from "./funcomponent/OrientationComponent";
import ReconnectComponent from "./funcomponent/ReconnectComponent";
import { GM } from "./gm/GMAPI";
import ProcedureManager from "./manager/ProcedureManager";
import SoundComponent from "./sound/SoundComponent";
import CCTools from "./tools/CCTools";
import TelegramUtils from "./tools/TelegramUtils";
import UIComponent, { PrefabUI } from "./ui/UIComponent";
import AgoraManager from "./net/agora/AgoraManager";
///////////////////////////////////////////////
cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    static instance: Main = null;

    static Cache_UI: cc.Node = null;

    static Scene: cc.Node = null;
    static Marquee: cc.Node = null;
    static Form: cc.Node = null;
    static Board: cc.Node = null;
    static Dialog: cc.Node = null;
    static Alert: cc.Node = null;
    static Block: cc.Node = null;
    static Prompt: cc.Node = null;
    static Toast: cc.Node = null;
    static UIPreloading: cc.Node = null;
    static Toast_Node: cc.Node = null;
    //横屏提示
    static Orientation: cc.Node = null;
    //重连提示
    static Reconnect: cc.Node = null;

    static Diss: cc.Node = null;
    ////////////////////////////////////调试开关

    static ShowSeatID: number;//显示seat id

    async onLoad() {

        // 初始化 Telegram WebApp SDK（必须在最开始）
        TelegramUtils.Instance;
        
        // 输出 Telegram 调试信息（在 log 被禁用之前）
        if (TelegramUtils.Instance.isInTelegram) {
            TelegramUtils.Instance.printDebugInfo();
        }
        
        if (!CCTools.getQueryString("log") && GameConfig.publish) {
            console.log = function () { }
        }
        console.log("游戏启动", cc.sys.os);

        GC.init();

        GC.localStore.keyPre = CCTools.getQueryString("player") || "";

        Main.instance = this;
        //设置是否代理模式(根据地址栏配置proxy字段)
        GameConfig.useProxy = !!CCTools.getQueryString("proxy");
        //设置各种开关
        Main.ShowSeatID = + CCTools.getQueryString("ShowSeatID");
        //设置调试开关
        GM.SetDebugSwitch(CCTools.getQueryString("debug"));

        // UI 节点缓存
        Main.Cache_UI = this.node.parent.getChildByName("Cache_UI - UI缓存");
        Main.Scene = this.node.parent.getChildByName("Scene - 场景");
        Main.Marquee = this.node.parent.getChildByName("Marquee - 场景上层");
        Main.Form = this.node.parent.getChildByName("Form - 窗体层");
        Main.Board = this.node.parent.getChildByName("Board - 遮挡浮窗层");
        Main.Dialog = this.node.parent.getChildByName("Dialog - 弹窗层");
        Main.Alert = this.node.parent.getChildByName("Alert - 提示框");
        Main.Block = this.node.parent.getChildByName("Block - 遮挡");
        Main.Prompt = this.node.parent.getChildByName("Prompt - 网络菊花层");
        Main.Toast = this.node.parent.getChildByName("Toast - 提示层");
        Main.UIPreloading = Main.Block.getChildByName("UIPreloading");
        Main.Toast_Node = Main.Toast.getChildByName("Toast_Node");

        Main.Orientation = this.node.parent.getChildByName("Orientation");
        Main.Reconnect = this.node.parent.getChildByName("Reconnect - 重连");

        Main.Diss = this.node.parent.getChildByName("Diss - 出界遮挡");

        UIComponent.Instance.SetPrefabNode(PrefabUI.UIPreloading, Main.UIPreloading);

        this.scheduleOnce(() => {
            console.log("屏幕分辨率:", cc.view.getFrameSize().toString());
            console.log("逻辑分辨率:", cc.view.getVisibleSize().toString());
            this.refreshDiss();
        }, 1);

        GC.uc.AddComponent(new OrientationComponent);

        this.loadWebSDK();

        SoundComponent.Instance.initSound();

        ReconnectComponent.Instance.Start();

        // 监听 H5 层（Vue/Vite）通过 bridge.js 发来的消息
        this._initH5Bridge();
    }
    protected update(dt: number): void {
        GC.uc.Update(dt);
    }
    start() {
        console.log("start");
        ProcedureManager.Init();
    }

    /**
     * 动态加载 Web 层第三方 SDK
     * 预览和构建通用，不依赖 HTML 模板
     */
    private loadWebSDK(): void {
        const sdkList = [
            { name: 'AgoraRTC', src: 'https://download.agora.io/sdk/release/AgoraRTC_N.js' },
        ];

        sdkList.forEach(sdk => {
            // 已存在则跳过
            if ((window as any)[sdk.name]) {
                console.log(`[WebSDK] ${sdk.name} 已存在，跳过加载`);
                return;
            }
            const script = document.createElement('script');
            script.src = sdk.src;
            script.charset = 'utf-8';
            script.onload = () => {
                console.log(`[WebSDK] ${sdk.name} 声网sdk加载完成`);
                if (sdk.name === 'AgoraRTC') {
                    AgoraManager.Instance.init();
                }
            };
            script.onerror = () => {
                console.error(`[WebSDK] ${sdk.name} 声网sdk加载失败: ${sdk.src}`);
            };
            document.head.appendChild(script);
        });
    }

    //刷新遮挡
    private refreshDiss() {
        let l_mask = Main.Diss.getChildByName("l_mask");
        let r_mask = Main.Diss.getChildByName("r_mask");
        //let u_mask = Main.Diss.getChildByName("u_mask");
        //let b_mask = Main.Diss.getChildByName("b_mask");
        l_mask.width = cc.view.getVisibleSize().width;
        r_mask.width = cc.view.getVisibleSize().width;
        //u_mask.width = cc.view.getVisibleSize().height;
        //b_mask.width = cc.view.getVisibleSize().height;

    }

    /**
     * 初始化 H5 Bridge 消息监听
     * 接收上层 Vue/Vite H5 页面通过 bridge.js 发送的消息
     *
     * 注册 window.CocosBridge 让 bridge.js 第一优先级命中（直接函数调用）
     * 兼容 window.postMessage 和 cocos:// scheme
     */
    private _initH5Bridge(): void {
        // 注册 window.CocosBridge，bridge.js 检测到此对象后会直接调用，不走 scheme
        (window as any).CocosBridge = {
            postMessage: (jsonStr: string) => {
                this._onH5Message(jsonStr);
            }
        };
        console.log('[H5Bridge] window.CocosBridge 已注册');
        window.addEventListener('message', (e: MessageEvent) => {
            const data = e.data;
            if (!data) return;

            // 格式1: { source: 'cocos-game' | 'h5-game', payload: string }
            if (typeof data === 'object' && (data.source === 'cocos-game' || data.source === 'h5-game')) {
                const payload = data.payload;
                if (typeof payload === 'string') {
                    this._onH5Message(payload);
                }
                return;
            }

            // 格式2: 直接是 JSON 字符串
            if (typeof data === 'string' && data.includes('action')) {
                this._onH5Message(data);
            }
        });

        console.log('[H5Bridge] 消息监听已初始化');
    }

    /**
     * 处理从 H5 层收到的消息
     * 消息格式: { action: string, payload: any, requestId: string, timestamp: number }
     */
    private _onH5Message(rawData: string): void {
        try {
            // 兼容 cocos:// scheme 包裹
            let jsonStr = rawData;
            if (jsonStr.startsWith('cocos://')) {
                const match = jsonStr.match(/data=([^&]+)/);
                if (match) jsonStr = decodeURIComponent(match[1]);
            }

            const msg = JSON.parse(jsonStr);
            if (!msg.action) return;

            console.log('[H5Bridge] 收到消息:', msg.action, msg.payload);

            switch (msg.action) {
                case 'enterTable':
                    this._onEnterTable(msg.payload);
                    break;
                case 'exitTable':
                    this._onExitTable(msg.payload);
                    break;
                case 'syncUser':
                    this._onSyncUser(msg.payload);
                    break;
                default:
                    console.log('[H5Bridge] 未处理的消息类型:', msg.action);
                    break;
            }
        } catch (e) {
            console.warn('[H5Bridge] 消息解析失败:', rawData, e);
        }
    }

    /** 向 H5 层发送消息 */
    public static sendToH5(action: string, payload?: any): void {
        const msg = JSON.stringify({
            action,
            payload,
            requestId: `cocos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            timestamp: Date.now(),
        });
        const fn = (window as any).__H5_GAME_ON_COCOS_MESSAGE__;
        if (typeof fn === 'function') {
            fn(msg);
        } else {
            console.warn('[H5Bridge] H5 层未就绪，消息未发送:', action);
        }
    }

    // ==================== H5 消息处理回调 ====================

    private _onEnterTable(payload: any): void {
        console.log('[H5Bridge] 进入牌桌:', payload);
        // TODO: 调用进入牌桌的逻辑
    }

    private _onExitTable(payload: any): void {
        console.log('[H5Bridge] 离开牌桌:', payload);
        // TODO: 调用离开牌桌的逻辑
    }

    private _onSyncUser(payload: any): void {
        console.log('[H5Bridge] 同步用户信息:', payload);
        // TODO: 调用同步用户的逻辑
    }
}

// @ts-ignore
BigInt.prototype.toJSON = function() {
    return this.toString();
};


(window as any).Main = Main;

//http://localhost:7456/assets/resources/native/ff/ff223a1d-adf2-4ecd-a826-ca1e0628cb82.png
//http://localhost:7456/assets/resources/native/31/310952bf-e832-4f99-985f-7da18d2051bc.png