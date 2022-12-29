import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAgentUnlink extends UIBase {


    Back: cc.Node = null;
    Button_Cancel: cc.Node = null;
    Button_Commit: cc.Node = null;


    protected declare_list: [string, any?][] = [
        ["Back"],
        ["Button_Cancel"],
        ["Button_Commit"]
    ]
    protected lateLoad() {
        super.lateLoad();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.Back, this.backClick);
        this.setButtonClick(this.Button_Cancel, this.cancelClick);
        this.setButtonClick(this.Button_Commit, this.commitClick);
    }

    ///////////////////点击
    //背景点击
    private backClick() {
        UIComponent.close(this.UIDefine);
    }
    //取消点击
    private cancelClick() {
        UIComponent.close(this.UIDefine);
    }
    //提交点击
    private commitClick() {
        UIComponent.close(this.UIDefine);
        //发送请求
    }

}
