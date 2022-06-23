/**
 * 入口函数
 */

import ProcedureManager from "./manager/ProcedureManager";
import ToastManager from "./manager/ToastManager";
import { Web_Login } from "./net/https/WebRequest";
import { grace } from "./protobuf/command/proto";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    static instance: Main;

    static Cache_UI: cc.Node;

    static Scene: cc.Node;
    static Form: cc.Node;
    static Board: cc.Node;
    static Dialog: cc.Node;
    static Block: cc.Node;
    static Toast: cc.Node;

    onLoad() {
        cc.log("游戏启动", cc.sys.os, cc.view.getVisibleSize());
        //@ts-ignore
        window.Main = Main;
        Main.instance = this;

        // UI 节点缓存
        Main.Cache_UI = this.node.parent.getChildByName("Cache_UI - UI缓存");


        Main.Scene = this.node.parent.getChildByName("Scene - 场景");
        Main.Form = this.node.parent.getChildByName("Form - 窗体层");
        Main.Board = this.node.parent.getChildByName("Board - 遮挡浮窗层");
        Main.Dialog = this.node.parent.getChildByName("Dialog - 弹窗层");
        Main.Block = this.node.parent.getChildByName("Block - 遮挡");
        Main.Toast = this.node.parent.getChildByName("Toast - 提示层");
        ProcedureManager.Init();
        //测试protobuf
        let message = grace.proto.msg.Player.create({ name: "yechun", id: 123, enterTime: 111 })
        let buffer = grace.proto.msg.Player.encode(message).finish();
        cc.log(grace.proto.msg.Player.decode(buffer));

    }

    start() {
        ToastManager.ins.craeteToast("Alligator");
        new Web_Login();
    }

    // update (dt) {}
}
