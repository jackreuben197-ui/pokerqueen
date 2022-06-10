/**
 * 入口函数
 */

import ToastManager from "./manager/ToastManager";
import { grace } from "./protobuf/command/proto";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    static Scene: cc.Node;
    static UI: cc.Node;
    static Toast: cc.Node;


    onLoad() {
        this.fit();
        cc.log("游戏启动", cc.sys.os, cc.view.getVisibleSize());
        Main.Scene = this.node.parent.getChildByName("Toast");
        Main.UI = this.node.parent.getChildByName("UI");
        Main.Toast = this.node.parent.getChildByName("Toast");


        //测试protobuf
        let message = grace.proto.msg.Player.create({name:"yechun",id:123,enterTime:111})
        let buffer = grace.proto.msg.Player.encode(message).finish();
        cc.log(grace.proto.msg.Player.decode(buffer));


    }

    protected fit(): void {
        let framesize = cc.view.getFrameSize();
        if (framesize.width > framesize.height) {
            cc.Canvas.instance.fitWidth = true;
            cc.Canvas.instance.fitHeight = true;
        } else {
            cc.Canvas.instance.fitWidth = true;
        }
    }

    start() {
        ToastManager.ins.craeteToast("Alligator");
    }

    // update (dt) {}
}
