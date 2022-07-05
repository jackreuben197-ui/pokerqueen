
import GGToggleContainer from "../component/GGToggleContainer";
import LanguageFormItem from "../item/LanguageFormItem";
import BaseForm from "./BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageForm extends BaseForm {


    /**
     * 节点|组件 定义
     */

    languageItem: LanguageFormItem = null;

    scrollContent: cc.Node = null;

    toggleContainer: GGToggleContainer = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    config = [
        { s_language: "English", language: "English", flag: "Flag_USA" },
        { s_language: "China", language: "中文", flag: "Flag_CHN" },
        { s_language: "Bra", language: "Bra", flag: "Flag_BRA" },
    ]

    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.languageItem = this.getChildNodeOrComponent("languageItem", LanguageFormItem);
        this.scrollContent = this.getChildNodeOrComponent("scrollContent");
        this.toggleContainer = this.getChildNodeOrComponent("toggleContainer", GGToggleContainer);

        this.languageItem.node.active = false;
        let languageItem, languageItem_script;
        for (let i = 0; i < this.config.length; i++) {
            languageItem = cc.instantiate(this.languageItem.node);
            languageItem_script = languageItem.getComponent(LanguageFormItem);
            languageItem.parent = this.scrollContent;
            languageItem.active = true;
            languageItem_script.onShow(this.config[i]);
            languageItem_script.addToToggleContainer(this.toggleContainer);
        }
        this.toggleContainer.onChecked = this.onCheckedHandler;
        languageItem_script.showBottomLine();
    }

    protected lateClose(param: any = null) {
        super.lateClose(param);
    }

    onShow(param: any = null) {
        super.onShow(param);
        this.toggleContainer.checkedIndex = param?.language_id || 0;
    }

    //选择回调，参数为序号
    private onCheckedHandler(index: number) {

    }

}
