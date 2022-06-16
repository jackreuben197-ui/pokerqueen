
const { ccclass, property } = cc._decorator;

@ccclass
export default class CCToggle extends cc.Component {

    @property(cc.Node)
    black: cc.Node = null;

    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    onLoad() {
        this.updateBlack();
    }

    updateBlack() {
        this.black.active = this.toggle.isChecked;
    }

    onClick() {
        this.updateBlack();
    }

}
