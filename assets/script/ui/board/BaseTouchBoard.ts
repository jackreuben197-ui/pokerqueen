/**
 *  触摸板基类
 */
import BoardManager from "../../manager/BoardManager";
import UIBase from "../UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseTouchBoard extends UIBase {

    mask: cc.Node = null;

    onLoad(): void {
        super.onLoad();
        this.mask = this.node.getChildByName("touchMask");
        this.lateLoad();
    }
    protected lateClose() {
        super.lateClose();
        BoardManager.ins.close();
    }
}
