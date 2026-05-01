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
import { GameConfig } from "./config/GameConfig";
import GC from "./frame/GameControl";
import OrientationComponent from "./funcomponent/OrientationComponent";
import ReconnectComponent from "./funcomponent/ReconnectComponent";
// import { GM } from "./gm/GMAPI";
import ProcedureManager from "./manager/ProcedureManager";
import SoundComponent from "./sound/SoundComponent";
import CCTools from "./tools/CCTools";
import TelegramUtils from "./tools/TelegramUtils";
import UIComponent, { PrefabUI } from "./ui/UIComponent";
import H5MsgMgr from "./H5MsgMgr";
import * as MainUtils from "./MainUtils";
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

    static ShowSeatID: number;//显示seat id

    async onLoad() {

        // 关闭左下角 FPS / DrawCall 统计信息
        cc.debug.setDisplayStats(false);

        // 初始化 Telegram WebApp SDK（必须在最开始）
        TelegramUtils.Instance;

        // 输出 Telegram 调试信息（在 log 被禁用之前）
        if (TelegramUtils.Instance.isInTelegram) {
            TelegramUtils.Instance.printDebugInfo();
        }

        if (!CCTools.getQueryString("log") && GameConfig.IS_PUBLISHED) {
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
        // GM.SetDebugSwitch(CCTools.getQueryString("debug"));

        // UI 节点缓存
        Main.CacheUI = this.node.parent.getChildByName("Cache_UI - UI缓存");
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
            MainUtils.refreshDiss(Main.Diss);
        }, 1);

        GC.uc.AddComponent(new OrientationComponent);

        SoundComponent.Instance.initSound();

        ReconnectComponent.Instance.Start();

        // 监听 H5 层（Vue/Vite）通过 bridge.js 发来的消息
        H5MsgMgr.Instance.init();
        await MainUtils.registerH5Listeners();

        // 启动握手：设置 __CC_READY__，等待 H5 发来 h5Ready，回复 ccAck
        H5MsgMgr.Instance.startHandshake();
    }
    protected update(dt: number): void {
        GC.uc.Update(dt);
    }
    start() {
        console.log("start test");
        ProcedureManager.Init();
    }
}

// @ts-ignore
BigInt.prototype.toJSON = function() {
    return this.toString();
};


(window as any).Main = Main;
