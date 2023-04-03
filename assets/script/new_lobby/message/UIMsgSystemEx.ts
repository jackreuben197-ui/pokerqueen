import List from "../../common/List";
import ListEx from "../../common/ListEx";
import SimpleNodePool from "../../common/MyNodePool";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { APIMsgMessageList, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import UIComponent from "../../ui/UIComponent";
import ItemMsgSystem from "./ItemMsgSystem";
import { EnumMSG } from "./MyMessageModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMsgSystemEx extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    $content: cc.Node = null;
    $ItemMsgSystem: cc.Node = null;
    ////////////////////////////////////////////////////

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.title_label.i18NString = param.name;
        this.$ItemMsgSystem.getComponent(ItemMsgSystem).onShow(param);
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
}
