import AdapterComponent from "../AdapterComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends AdapterComponent {
    
    public UIDefine: { Name: string, Bundle: string, Path: string } = null;

    Enter(param) {
        cc.log("::", this.UIDefine.Name, "Enter()", "param:", param);
    }
    Exit(param) {
        cc.log("::", this.UIDefine.Name, "Exit()", "param:", param);
    }
}
