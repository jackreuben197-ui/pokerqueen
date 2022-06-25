/**
 *  触摸板基类
 */

import BoardManager from "../../manager/BoardManager";
import UIManager from "../../manager/UIManager";
import UIBase from "../UIBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseTouchBoard extends UIBase {

    mask: cc.Node = null;
    main: cc.Node = null;

    onLoad(): void {
        super.onLoad();
        this.mask = this.node.getChildByName("mask");
        this.main = this.node.getChildByName("main");
    }

    protected lateClose() {
        super.lateClose();
        UIManager.close(this.UIDefine);
    }
}
