const {ccclass, property} = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";
@ccclass
export default class UIChat extends UIBase {
    onLoad(): void {
        super.onLoad();
        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
    }
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param?: any): void {
        
    }
    start () {

    }
}
