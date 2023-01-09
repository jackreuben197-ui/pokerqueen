import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import UIBasePlus from "../../../ui/UIBasePlus";
import UIComponent from "../../../ui/UIComponent";
import { UICommonMgr } from "../../../ui/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemAgentUnlink extends UIBasePlus {


    cc_Label$Nick: cc.Label = null;
    cc_Label$ID: cc.Label = null;

    cc_Sprite$Head: cc.Sprite = null;

    // protected declare_list: [string, any?][] = [
    //     ["Label_Nick", cc.Label],
    //     ["Label_ID", cc.Label],
    //     ["Head", cc.Sprite],
    // ]
    protected lateLoad() {
        super.lateLoad();
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI();
    }

    private refreshUI() {
        this.cc_Label$Nick.string = this._param.nick;
        this.cc_Label$ID.string = `ID:  ${this._param.id}`;
        WebImageHelper.SetHeadImage(this.cc_Sprite$Head, "");
    }
}   
