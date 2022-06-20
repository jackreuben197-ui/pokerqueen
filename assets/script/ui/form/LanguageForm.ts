import { FormEffect } from "../../define/GlobalEnum";
import FormManager from "../../manager/FormManager";
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

    }

    protected lateClose() {
        FormManager.ins.closeForm(null, FormEffect.RightInOut);
    }

}
