
import AssetContext from "../component/AssetContext";
import GGToggleContainer from "../component/GGToggleContainer";
import UIBase from "../UIBase";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageFormItem extends UIBase {
    /**
     * 绑定内容
     */

    /////////////////////////////////////////////
    /**
     * 节点|组件 定义
     */

    toggle: cc.Toggle = null;

    flag_icon: cc.Sprite = null;

    s_language_label: cc.Label = null;

    language_label: cc.Label = null;

    bottom_line: cc.Node = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////

    protected lateLoad(): void {
        super.lateLoad();
        this.toggle = this.getChildNode("toggle")?.getComponent(cc.Toggle);
        this.flag_icon = this.getChildNode("flag_icon")?.getComponent(cc.Sprite);
        this.s_language_label = this.getChildNode("s_language_label")?.getComponent(cc.Label);
        this.language_label = this.getChildNode("language_label")?.getComponent(cc.Label);
        this.bottom_line = this.getChildNode("bottom_line");

    }


    addToToggleContainer(container: GGToggleContainer) {
        container.addToggle(this.toggle);
    }

    onShow(param: any = null) {
        super.onShow(param);
        this.s_language_label.string = param.s_language;
        this.language_label.string = param.language;
        this.flag_icon.spriteFrame = AssetContext.getAsset<cc.SpriteFrame>(param.flag);

    }

    showBottomLine() {
        this.bottom_line.active = true;
    }

    // update (dt) {}
}
