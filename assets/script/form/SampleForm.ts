

import AdapterComponent from "../AdapterComponent";

const { ccclass } = cc._decorator;

@ccclass
export default class SampleForm extends AdapterComponent {

    public UIDefine: { Name?: string, Bundle: string, Path: string, Title: string } = null;

    title_label: cc.Label = null;

    onLoad(): void {
        super.onLoad();
        cc.find("top/title", this.node).getComponent(cc.Label).string = this.UIDefine?.Title || "Title";
    }

    onShow(param: any = null) {
        cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);
    }

    onClose() {
        cc.log("::", this.UIDefine.Name, "onClose()");
    }

}
