import BaseFormPlus from "../../ui/form/BaseFormPlus";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIVersion extends BaseFormPlus {

    cc_Label$version: cc.Label = null;
    /**
    * 每次打开面板处理的内容
    */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.cc_Label$version.string = param.version;
    }

}
