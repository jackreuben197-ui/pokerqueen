import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UICommonMgr } from "../../../ui/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemAgentUnlink extends UIBase {


    Label_Nick: cc.Label = null;
    Label_ID: cc.Label = null;

    Head: cc.Sprite = null;

    protected declare_list: [string, any?][] = [
        ["Label_Nick", cc.Label],
        ["Label_ID", cc.Label],
        ["Head", cc.Sprite],
    ]
    protected lateLoad() {
        super.lateLoad();
    }
    onShow(param?: any): void {
        super.onShow(param);
        this.refreshUI();
    }

    private refreshUI() {
        this.Label_Nick.string = this._param.nick;
        this.Label_ID.string = `ID:  ${this._param.id}`;
        WebImageHelper.SetHeadImage(this.Head, "");
    }
}   
