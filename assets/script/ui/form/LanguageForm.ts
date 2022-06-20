import { FormEffect } from "../../define/GlobalEnum";
import FormManager from "../../manager/FormManager";
import LanguageFormItem from "../item/LanguageFormItem";
import SampleForm from "./SampleForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class $name extends SampleForm {
    /**
     * 绑定内容
     */

    ///////////////////////////////////
    /**
     * 声明内容
     */

    ///////////////////////////////////

    protected lateLoad() {
        let content = this.node.getChildByName("content - 内容填充");
        let item1 = cc.find("scrollView/view/content/item1", content);
        let item2 = cc.find("scrollView/view/content/item2", content);
        item1.getComponent(LanguageFormItem).toggle.toggleGroup = this.node.getComponent(cc.ToggleContainer);
        //item2.getComponent(LanguageFormItem).toggle.toggleGroup = this.node.getComponent(cc.ToggleContainer);
        //cc.log(item1.getComponent(LanguageFormItem).toggle);
        
    }

    protected lateClose() {
        FormManager.ins.closeForm(null, FormEffect.RightInOut);
    }

}
