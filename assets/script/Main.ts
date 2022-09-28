/**
 * 入口函数
 */
import { GameConfig } from "./config/GameConfig";
import ProcedureManager from "./manager/ProcedureManager";
import CCTools from "./tools/CCTools";

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


    async onLoad() {

        console.log("游戏启动", cc.sys.os);

        Main.instance = this;
        //设置是否代理模式(根据地址栏配置proxy字段)
        GameConfig.useProxy = !!CCTools.getQueryString("proxy");

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

        this.scheduleOnce(() => {
            console.log("屏幕分辨率:", cc.view.getFrameSize().toString());
            console.log("逻辑分辨率:", cc.view.getVisibleSize().toString());
        }, 1);
    }
    start() {
        console.log("start");
        ProcedureManager.Init();
    }
}
