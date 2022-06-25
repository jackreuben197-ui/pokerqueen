import BaseTouchBoard from "./BaseTouchBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestTouchBoard extends BaseTouchBoard {

    content: cc.Node = null;


    protected lateLoad() {
        super.lateLoad();
        //this.content = this.main.getChildByName("content");
    }
    onShow(param: { data?: any } = null) {
        super.onShow(param);
    }
    protected lateClose() {
        super.lateClose();
    }
}
