/**
 * 入口函数
 */

import ProcedureManager from "./manager/ProcedureManager";
import ToastManager from "./manager/ToastManager";
import { grace } from "./protobuf/command/proto";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    static instance: Main;

    static Scene: cc.Node;
    static UI: cc.Node;
    static Block: cc.Node;
    static Toast: cc.Node;

    onLoad() {
        cc.log("游戏启动", cc.sys.os, cc.view.getVisibleSize());
        //@ts-ignore
        window.Main = Main;
        Main.instance = this;
        Main.Scene = this.node.parent.getChildByName("Scene - 场景");
        Main.UI = this.node.parent.getChildByName("UI - 面板层");
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
    }

    // update (dt) {}
}
