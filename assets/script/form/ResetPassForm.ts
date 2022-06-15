
import { UIDefine } from "../define/UIDefine";
import SampleForm from "./SampleForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResetPassForm extends SampleForm {


    public Name: string = "ResetPassForm";
    
    public UIDefine: { Bundle: string, Path: string, Title: string } = UIDefine.ResetPassForm;


    onShow(param: any = null) {
        super.onShow(param);
    }
}
