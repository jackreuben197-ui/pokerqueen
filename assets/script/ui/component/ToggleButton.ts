

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToggleButton extends cc.Component {

    @property(cc.Node)
    bg_node: cc.Node = null;

    @property(cc.Node)
    check_node: cc.Node = null;

    @property(cc.Label)
    content_label: cc.Label = null;


    onLoad() {
        this.bg_node.on("click", this.bgClick, this);
        this.check_node.on("click", this.checkClick, this);
    }
    onShow() {
        this.uncheck();
    }

    bgClick() {
        this.check();
    }
    checkClick() {
        this.uncheck();
    }
    check() {
        this.check_node.active = !(this.bg_node.active = false);
    }
    uncheck() {
        this.bg_node.active = !(this.check_node.active = false);
    }

    set content(value: string) {
        if (this.content_label) this.content_label.string = value;
    }

    get isCheck(): boolean {
        return this.check_node.active;
    }

    set isOn(boolean: boolean) {
        this.check_node.active = boolean;
    }
}
