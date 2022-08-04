// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIBase from "../UIBase";

const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
@requireComponent(cc.Button)
export default class GGToggleChild extends UIBase {

    checkmark: cc.Node = null;

    protected lateLoad() {
        super.lateLoad();
        this.checkmark = this.getChildNodeOrComponent("checkmark");
    }
    public check(): void {
        this.checkmark.active = true;
    }
    public uncheck(): void {
        this.checkmark.active = false;
    }
    public isCheck(): boolean {
        return this.checkmark.active;
    }
}
