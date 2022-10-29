/*
 * @Author: xfj
 * @Date: 2021-03-31 16:44:09
 * @LastEditTime: 2022-10-29 14:06:47
 * @LastEditors: Please set LastEditors
 * @Description: 悬浮框触摸移动
 * @FilePath: /pokerqueen/assets/script/lobby/labor/script/FloatingTouchMove.ts
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class FloatingTouchMove extends cc.Component {
    private startPos: cc.Vec2;

    start() {
        // 节点初始位置,每次触摸结束更新
        this.startPos = this.node.getPosition();
    }

    onEnable() {
        // 触摸节点移动
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        // 非触摸节点可移动
        // this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.node.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDisable() {
        // 触摸节点移动
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        // 非触摸节点可移动
        // this.node.parent.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.node.parent.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.node.parent.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchMove(event: cc.Event.EventTouch) {
        let pos = this.node.getPosition();

        // 触摸刚开始的位置
        let oldPos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(event.getTouches()[0].getStartLocation());
        // 触摸时不断变更的位置
        let newPos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(event.getTouches()[0].getLocation());

        // 1.x 版本使用 cc.pSub
        // let subPos = cc.pSub(oldPos,newPos);
        // 2.x 版本使用 p1.sub(p2);
        let subPos = oldPos.sub(newPos);

        pos.x = this.startPos.x - subPos.x;
        pos.y = this.startPos.y - subPos.y;

        // 控制节点移不出父节点;
        let minX = -this.node.parent.width / 2 + this.node.width / 2; //最小X坐标；
        let maxX = Math.abs(minX);
        let minY = -this.node.parent.height / 2 + this.node.height / 2; //最小Y坐标；
        let maxY = Math.abs(minY);

        if (pos.x < minX) {
            pos.x = minX;
        } else if (pos.x > maxX) {
            pos.x = maxX;
        }
        if (pos.y < minY) {
            pos.y = minY;
        } else if (pos.y > maxY) {
            pos.y = maxY;
        }

        this.node.setPosition(pos);
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.startPos = this.node.getPosition(); // 更新获取触摸结束之后的node坐标；
    }

    onTouchCancel(event: cc.Event.EventTouch) {
        this.startPos = this.node.getPosition(); // 更新获取触摸结束之后的node坐标；
    }
}
