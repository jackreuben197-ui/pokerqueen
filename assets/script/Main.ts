/**
 * 入口函数
 */
import { GameConfig } from "./config/GameConfig";
import ProcedureManager from "./manager/ProcedureManager";
import HttpClient from "./net/https/HttpClient";
import WebSocketClient from "./net/websocket/WebSocketClient";
import CCTools from "./tools/CCTools";

const { ccclass, property } = cc._decorator;

console.log("游戏入口函数");

@ccclass
export default class Main extends cc.Component {

    static instance: Main;

    static Cache_UI: cc.Node;

    static Scene: cc.Node;
    static Form: cc.Node;
    static Board: cc.Node;
    static Dialog: cc.Node;
    static Alert: cc.Node;
    static Block: cc.Node;
    static Prompt: cc.Node;
    static Toast: cc.Node;

    onLoad() {

        console.log("游戏启动", cc.sys.os);

        Main.instance = this;
        //设置是否代理模式(根据地址栏配置proxy字段)
        GameConfig.useProxy = !!CCTools.getQueryString("proxy");

        // UI 节点缓存
        Main.Cache_UI = this.node.parent.getChildByName("Cache_UI - UI缓存");


        Main.Scene = this.node.parent.getChildByName("Scene - 场景");
        Main.Form = this.node.parent.getChildByName("Form - 窗体层");
        Main.Board = this.node.parent.getChildByName("Board - 遮挡浮窗层");
        Main.Dialog = this.node.parent.getChildByName("Dialog - 弹窗层");
        Main.Alert = this.node.parent.getChildByName("Alert - 提示框");
        Main.Block = this.node.parent.getChildByName("Block - 遮挡");
        Main.Prompt = this.node.parent.getChildByName("Prompt - 网络菊花层");
        Main.Toast = this.node.parent.getChildByName("Toast - 提示层");

        //测试protobuf
        // let message = grace.proto.msg.Player.create({ name: "yechun", id: 123, enterTime: 111 })
        // let buffer = grace.proto.msg.Player.encode(message).finish();
        // cc.log(grace.proto.msg.Player.decode(buffer));
        //WebSocketClient.connect();
        
    }

    protected onEnable(): void {
        console.log("屏幕分辨率:", cc.view.getFrameSize().toString());
        console.log("逻辑分辨率:", cc.view.getVisibleSize().toString());
    }

    start() {
        ProcedureManager.Init();
    }
}
