import BaseForm from "../../../ui/form/BaseForm";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBagTicket extends BaseForm {

    _allInfo = [];
    _useInfo = [];

    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        Text_title.string = "门票";
      
        this.resetUI();

    }


    resetUI() {
       
        // let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        // scrollView.content.removeAllChildren();
    }

}
