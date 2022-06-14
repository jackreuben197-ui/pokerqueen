
const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseScene extends cc.Component {
    public Name: string = "BaseScene";
    public UIDeine: { Bundle: string, Path: string } = null;

    Enter(param) {
        cc.log("::", this.Name, "Enter()", "param:", param);
    }
    Exit(param) {
        cc.log("::", this.Name, "Exit()","param:", param);
    }
}
