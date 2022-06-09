/**
 * 入口函数
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    onLoad() {

        this.fit();

        cc.log("游戏启动", cc.sys.os, cc.view.getVisibleSize());
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

    }

    // update (dt) {}
}
