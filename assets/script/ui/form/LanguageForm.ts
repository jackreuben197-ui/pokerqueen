
import GGToggleContainer from "../component/GGToggleContainer";
import LanguageFormItem from "../item/LanguageFormItem";
import BaseForm from "./BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageForm extends BaseForm {


    /**
     * 节点|组件 定义
     */

    LanguageFormItem: cc.Node = null;

    scrollContent: cc.Node = null;

    toggleContainer: GGToggleContainer = null;

    ///////////////////////////////////
    /**
     * 声明内容
     */
    config = [
        { s_language: "sl_K8cPNvxU", language: "English", flag: "icon_flag_US" },
        { s_language: "sl_ptyyPutao", language: "Portuguese", flag: "icon_flag_PT" },
        { s_language: "tc_MHoYsIbY", language: "Simplified Chinese", flag: "icon_flag_CN" },
    ]

    ///////////////////////////////////

    protected lateLoad() {
        super.lateLoad();
        this.LanguageFormItem = this.getChildNodeOrComponent("LanguageFormItem");
        this.scrollContent = this.getChildNodeOrComponent("scrollContent");
        this.toggleContainer = this.getChildNodeOrComponent("toggleContainer", GGToggleContainer);
        this.LanguageFormItem.active = false;
        let languageItem, languageItem_script:LanguageFormItem;
        for (let i = 0; i < this.config.length; i++) {
            languageItem = cc.instantiate(this.LanguageFormItem);
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
