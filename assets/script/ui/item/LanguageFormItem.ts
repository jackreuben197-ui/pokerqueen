
import GGToggleContainer from "../component/GGToggleContainer";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageFormItem extends cc.Component {
    /**
     * 绑定内容
     */
    @property(cc.Toggle)
    toggle: cc.Toggle = null;
    @property(GGToggleContainer)
    toggleContainer: GGToggleContainer = null;

    @property(cc.Sprite)
    flag_sp: cc.Sprite = null;

    @property(cc.Label)
    s_language_label: cc.Label = null;
    @property(cc.Label)
    language_label: cc.Label = null;

    @property([cc.SpriteFrame])
    flag_sfs: cc.SpriteFrame[] = [];


    @property(cc.Node)
    bottom_line: cc.Node = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////

    onLoad() {
        this
        if (this.toggleContainer) {
            this.toggleContainer.addToggle(this.toggle);
        }
    }

    start() {

    }

    onShow(config: any) {
        this.s_language_label.string = config.s_language;
        this.language_label.string = config.language;
        this.flag_sp.spriteFrame = this.flag_sfs[config.flag];
    }

    showBottomLine() {
        this.bottom_line.active = true;
    }

    // update (dt) {}
}
