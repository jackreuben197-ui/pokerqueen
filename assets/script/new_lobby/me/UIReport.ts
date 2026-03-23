import { UIDefine } from "../../define/UIDefine";
import { WebMiscReportFeedbackQuestIon, WebWww } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIReport extends BaseFormPlus {

    cc_EditBox$report: cc.EditBox = null;

    $submit: cc.Node = null;


    lateLoad() {
        super.lateLoad();
        this.setButtonClick(this.$submit, this.click_submit);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node): void {
        super.onShow(param, fromUI, sceneUI);
    }

    click_submit() {

        if (this.cc_EditBox$report.string.length <= 0) {
            UIComponent.Instance.ToastLanguage("UIMine_Setting109");//Toast("请先输入内容");
            return;
        }
        WebWww.Instance.CommonAPI(
            {
                web_class: WebMiscReportFeedbackQuestIon,
                body: {
                    description: this.cc_EditBox$report.string
                }
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.ToastLanguage("Uiwithdrawsuccessfully");
                UIComponent.close(UIDefine.UIReport);
            },
            (res: any) => {

            }
        )
    }

}
