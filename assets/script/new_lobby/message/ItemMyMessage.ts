
import UIBasePlus from "../../ui/UIBasePlus";

const { ccclass, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1)
export default class ItemMyMessage extends UIBasePlus {
    //名称
    cc_Label$name: cc.Label = null;
    //提示
    cc_Label$content: cc.Label = null;
    //图标
    cc_Sprite$icon: cc.Sprite = null;

    //////////////////////////////////
    unread: boolean = false;

    protected lateLoad(): void {
        super.lateLoad();
    }
    //刷新消息图标
    refreshIcon(spriteFrame: cc.SpriteFrame) {
        this.cc_Sprite$icon.spriteFrame = spriteFrame;
    }
    //刷新消息名称
    refreshName(name: string) {
        this.cc_Label$name.string = name;
    }
    //刷新消息状态
    refreshContent(unread: boolean, text: string, color = "#0") {
        this.unread = unread;
        this.cc_Label$content.string = text;
        this.cc_Label$content.node.color = cc.Color.BLACK.fromHEX(color);
    }
}
