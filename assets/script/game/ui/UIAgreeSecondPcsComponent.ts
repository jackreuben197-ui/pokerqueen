// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIBase from "../../ui/UIBase";


class AgreeSecondData {
    title: string;// = LanguageManager.Get("UIAgreeSecondPcs_title"),
    content: string;// = LanguageManager.Get("UIAgreeSecondPcs_agree"),
    contentCommit: string;// = LanguageManager.Get("adaptation20085"),
    contentCancel: string;// = LanguageManager.Get("adaptation10334"),
    SecondPcsTime: number;// = (int)Operator.LeftOpTime,
    actionCommit: Function;
    actionCancel: Function;
}


const { ccclass } = cc._decorator;

@ccclass
export default class UIAgreeSecondPcsComponent extends UIBase {

    public static AgreeSecondData: typeof AgreeSecondData = AgreeSecondData;


    Text_Title: cc.Label = null;
    Text_CountDown: cc.Label = null;

    Text_Reject: cc.Label = null;
    Text_Agree: cc.Label = null;

    Button_Reject: cc.Node = null;
    Button_Agree: cc.Node = null;

    curAgreeSecondData: AgreeSecondData = null;

    time: number = 0;

    protected lateLoad() {
        super.lateLoad();
        this.Text_Title = this.getChildNodeOrComponent("Text_Title", cc.Label);
        this.Text_CountDown = this.getChildNodeOrComponent("Text_CountDown", cc.Label);
        this.Text_Reject = this.getChildNodeOrComponent("Text_Reject", cc.Label);
        this.Text_Agree = this.getChildNodeOrComponent("Text_Agree", cc.Label);

        this.Button_Reject = this.getChildNodeOrComponent("Button_Reject");
        this.Button_Agree = this.getChildNodeOrComponent("Button_Agree");
    }

    onShow(param: AgreeSecondData): void {
        super.onShow(param);
        if (param != null) {
            this.curAgreeSecondData = param;
            //textCommit.text = string.IsNullOrEmpty(param.contentCommit) ? $"Commit" : param.contentCommit;
            //textCancel.text = string.IsNullOrEmpty(param.contentCancel) ? $"Cancel" : param.contentCancel;
            this.Text_Reject.string = param.contentCancel ?? "Cancel";
            this.Text_Agree.string = param.contentCommit ?? "Commit";

            this.Text_Title.string = param.title ?? "";

            this.time = param.SecondPcsTime;
            //this.UpdateSecondPcsUI();
            //AgreeNumText.text = $"{0}/{PlayerActionToggleList.Count}\t" + LanguageManager.mInstance.GetLanguageForKey("UIAgreeSecondPcs_AgreeDtail");
        }
    }
    protected regiterTouchEvents() {
        this.setButtonClick(this.Button_Reject, this.onClickReject);
        this.setButtonClick(this.Button_Agree, this.onClickAgree);
    }
    //拒绝点击
    onClickReject() {
        this.setButtonInteractable(this.Button_Reject, false);
        this.setButtonInteractable(this.Button_Agree, false);
        this.curAgreeSecondData?.actionCancel?.();
    }
    //同意点击
    onClickAgree() {
        this.setButtonInteractable(this.Button_Reject, false);
        this.setButtonInteractable(this.Button_Agree, false);
        this.curAgreeSecondData?.actionCommit?.();
    }
}
