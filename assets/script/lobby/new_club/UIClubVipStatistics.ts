import BaseForm from "../../ui/form/BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipStatistics extends BaseForm {

    protected lateLoad() {
        super.lateLoad();
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        console.log("完成");
    }
}
