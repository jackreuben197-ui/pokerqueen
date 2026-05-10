import UIBase from '../UIBase';
import UIBasePlus from '../UIBasePlus';
const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends UIBase {

    Enter(param: any = null) {
        console.log('[UI][UIScene]', this.UIDefine.Name, 'Enter()', 'param:', param);
        // this.regiterDispatchEvent();
        this.lateEnter(param);
    }

    Exit(param: any = null) {
        console.log('[UI][UIScene]', this.UIDefine.Name, 'Exit()', 'param:', param);
        this.stopAllThings();
        // this.unregiterAllDispatchEvent();
        this.lateExit();
    }

    protected lateEnter(param: any = null) {}

    protected lateExit(param: any = null) {}

    protected lateLoad() {
        super.lateLoad();
    }
}
