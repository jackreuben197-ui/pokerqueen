import ComFormTitle from "../../../common/ComFormTitle";
import BaseForm from "../../../ui/form/BaseForm";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/dataManger/UIFriendDataMange')
export default class UIFriendDataMange extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);


    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_DataManager"
        this.comFormTitle.initData(title, this)
    }
}
