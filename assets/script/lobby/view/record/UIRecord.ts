import BaseForm from "../../../ui/form/BaseForm";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRecord extends BaseForm {


    ebx_name: cc.EditBox = null;

    isFixHead: boolean = false;
    isFixName: boolean = false;
    isCanFix: boolean = false;

    protected lateLoad() {
        super.lateLoad();
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: BaseForm): void {
        super.onShow(param, fromUI);
      
        this.refreshListView();
    }

    refreshListView() {
        let sv_down = this.getChildNodeOrComponent("sv_down", cc.Node);
    }

}
