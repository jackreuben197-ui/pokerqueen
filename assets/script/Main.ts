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
import { GameConfig } from './config/GameConfig';
// import GC from "./frame/GameControl";
import OrientationComponent from './funcomponent/OrientationComponent';
import ReconnectComponent from './funcomponent/ReconnectComponent';
// import { GM } from "./gm/GMAPI";
import ProcedureManager from './manager/ProcedureManager';
import SoundComponent from './sound/SoundComponent';
import CCTools from './tools/CCTools';
// import TelegramUtils from "./tools/TelegramUtils";
import UIComponent, { PrefabUI } from './ui/UIComponent';
import H5MsgMgr from './H5MsgMgr';
import * as MainUtils from './MainUtils';
import UpdateComponent from './funcomponent/UpdateComponent';
import DataManager from './frame/manager/DataManager';
import ProcedureInit from './procedure/ProcedureInit';
///////////////////////////////////////////////
cc.macro.ENABLE_TRANSPARENT_CANVAS = false;
const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    static instance: Main = null;
    static CacheUI: cc.Node = null;
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
    static ShowSeatID: number; //显示seat id
    /** resize 防抖定时器 */
    private _resizeTimer: number = 0;

    override async onLoad() {
        // 关闭左下角 FPS / DrawCall 统计信息
        cc.debug.setDisplayStats(false);
        // 初始化 Telegram WebApp SDK（必须在最开始）
        // TelegramUtils.Instance;
        // // 输出 Telegram 调试信息（在 log 被禁用之前）
        // if (TelegramUtils.Instance.isInTelegram) {
        //     TelegramUtils.Instance.printDebugInfo();
        // }
        if (!CCTools.getQueryString('log') && GameConfig.IS_PUBLISHED) {
            console.log = function () {};
        }
        console.log('游戏启动', cc.sys.os);
        DataManager.instance.init();
        // GC.localStore.keyPre = CCTools.getQueryString("player") || "";
        Main.instance = this;
        //设置是否代理模式(根据地址栏配置proxy字段)
        GameConfig.useProxy = !!CCTools.getQueryString('proxy');
        //设置各种开关
        Main.ShowSeatID = +CCTools.getQueryString('ShowSeatID');
        //设置调试开关
        // GM.SetDebugSwitch(CCTools.getQueryString("debug"));
        // UI 节点缓存
        Main.CacheUI = this.node.parent.getChildByName('Cache_UI - UI缓存');
        Main.Scene = this.node.parent.getChildByName('Scene - 场景');
        Main.Marquee = this.node.parent.getChildByName('Marquee - 场景上层');
        Main.Form = this.node.parent.getChildByName('Form - 窗体层');
        Main.Board = this.node.parent.getChildByName('Board - 遮挡浮窗层');
        Main.Dialog = this.node.parent.getChildByName('Dialog - 弹窗层');
        Main.Alert = this.node.parent.getChildByName('Alert - 提示框');
        Main.Block = this.node.parent.getChildByName('Block - 遮挡');
        Main.Prompt = this.node.parent.getChildByName('Prompt - 网络菊花层');
        Main.Toast = this.node.parent.getChildByName('Toast - 提示层');
        Main.UIPreloading = Main.Block.getChildByName('UIPreloading');
        Main.Toast_Node = Main.Toast.getChildByName('Toast_Node');
        Main.Orientation = this.node.parent.getChildByName('Orientation');
        Main.Reconnect = this.node.parent.getChildByName('Reconnect - 重连');
        Main.Diss = this.node.parent.getChildByName('Diss - 出界遮挡');
        UIComponent.Instance.SetPrefabNode(PrefabUI.UIPreloading, Main.UIPreloading);
        this.scheduleOnce(() => {
            console.log('[Main]屏幕分辨率:', cc.view.getFrameSize().toString());
            console.log('[Main]逻辑分辨率:', cc.view.getVisibleSize().toString());
            MainUtils.refreshDiss(Main.Diss);
        }, 1);
        UpdateComponent.Instance.AddComponent(new OrientationComponent());
        SoundComponent.Instance.initSound();
        ReconnectComponent.Instance.Start();
        // 监听 H5 层（Vue/Vite）通过 bridge.js 发来的消息
        H5MsgMgr.Instance.init();
        await MainUtils.registerH5Listeners();
        // 启动握手：设置 __CC_READY__，等待 H5 发来 h5Ready，回复 ccAck
        H5MsgMgr.Instance.startHandshake();
        // 监听窗口大小变化（F12 开关、窗口拖拽等）
        window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    /**
     * 窗口大小变化时重新适配（防抖 200ms）
     *
     * 不使用 resizeWithBrowserSize（会和 Canvas.fitCanvasToWindow 互相覆盖导致 _frameSize 过时），
     * 而是手动更新容器 DOM，直接设置 _frameSize 并调用 setDesignResolutionSize。
     */
    private _onWindowResize(): void {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = window.setTimeout(() => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            console.log('[Main] 窗口 resize，重新适配', w, h);
            // 更新容器 DOM（预览模式下容器不会自动跟随窗口）
            const content = document.getElementById('content');
            if (content) {
                content.style.width = w + 'px';
                content.style.height = h + 'px';
            }
            const gameDiv = document.getElementById('GameDiv');
            if (gameDiv) {
                gameDiv.style.width = w + 'px';
                gameDiv.style.height = h + 'px';
            }
            const wraps = document.getElementsByClassName('contentWrap');
            for (let i = 0; i < wraps.length; i++) {
                (wraps[i] as HTMLElement).style.width = w + 'px';
                (wraps[i] as HTMLElement).style.height = h + 'px';
            }
            // 等一帧让 DOM 重排完成，再更新引擎画布
            requestAnimationFrame(() => {
                ProcedureInit.updateFitMode();
                if (Main.Diss && Main.Diss.isValid) {
                    MainUtils.refreshDiss(Main.Diss);
                }
            });
        }, 200);
    }

    protected override update(dt: number): void {
        UpdateComponent.Instance.Update(dt);
    }

    override start() {
        ProcedureManager.Init();
    }
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};

(window as any).Main = Main;
