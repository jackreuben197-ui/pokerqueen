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


    protected lateLoad(): void {
        super.lateLoad();
        this.mask = this.node.getChildByName("mask");
        this.main = this.node.getChildByName("main");
        this.mask.on("click", this.onCloseClick, this);
    }

    protected lateClose() {
        super.lateClose();
    }
    protected onCloseClick() {
        UIManager.close(this.UIDefine);
    }
}
