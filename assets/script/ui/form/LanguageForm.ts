import { FormEffect } from "../../define/GlobalEnum";
import FormManager from "../../manager/FormManager";
import GGToggleContainer from "../component/GGToggleContainer";
import LanguageFormItem from "../item/LanguageFormItem";
import SampleForm from "./SampleForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageForm extends SampleForm {
    /**
     * 绑定内容
     */
    @property(cc.Node)
    scrollContent: cc.Node = null;

    @property(LanguageFormItem)
    languageItem: LanguageFormItem = null;

    @property(GGToggleContainer)
    toggleContainer: GGToggleContainer = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    config = [
        { s_language: "English", language: "English", flag: 0 },
        { s_language: "China", language: "中文", flag: 1 },
        { s_language: "Bra", language: "Bra", flag: 2 },
        { s_language: "English", language: "English", flag: 0 },
        { s_language: "China", language: "中文", flag: 1 },
        { s_language: "Bra", language: "Bra", flag: 2 },
        { s_language: "English", language: "English", flag: 0 },
        { s_language: "China", language: "中文", flag: 1 },
        { s_language: "Bra", language: "Bra", flag: 2 },
        { s_language: "English", language: "English", flag: 0 },
        { s_language: "China", language: "中文", flag: 1 },
        { s_language: "Bra", language: "Bra", flag: 2 },
        { s_language: "China", language: "中文", flag: 1 },
        { s_language: "Bra", language: "Bra", flag: 2 },
    ]

    ///////////////////////////////////

    protected lateLoad() {
        this.languageItem.node.active = false;
        let languageItem;
        for (let i = 0; i < this.config.length; i++) {
            languageItem = cc.instantiate(this.languageItem.node);
            languageItem.parent = this.scrollContent;
            languageItem.active = true;
            languageItem.getComponent(LanguageFormItem).onShow(this.config[i]);
        }
        this.toggleContainer.onChecked = this.onCheckedHandler;
        languageItem.getComponent(LanguageFormItem).showBottomLine();
    }

    protected lateClose() {
        FormManager.ins.closeForm(null, FormEffect.RightInOut);
    }


    onShow(param: any = null) {
        //cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);
        super.onShow(param);
        this.toggleContainer.checkedIndex = param.language_id;
    }





    //选择回调，参数为序号
    private onCheckedHandler(index: number) {

    }

}
