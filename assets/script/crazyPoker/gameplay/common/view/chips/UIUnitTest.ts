// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import BaseTouchBoard from '../../../../../ui/board/BaseTouchBoard';
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIUnitTest extends BaseTouchBoard {
    @property(cc.Label)
    label: cc.Label = null;
    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}
    start() {}
    // update (dt) {}
}
