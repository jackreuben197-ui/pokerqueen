import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import { MessageSubType } from "../../config/TTypeConfig";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";
import UIMessageItem from "./UIMessageItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_MessageList extends BaseForm {

    // @property(cc.Node)
    // contentNode: cc.Node = null;
    private _search = null;
    private _offset: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _list: Array<any> = [];
    private _total: number = 0

    _oldIndex: number = null;

    _searchData: any = null;

    //private comFormTitle: ComFormTitle = null;

     protected lateLoad(): void {
         super.lateLoad();
         //this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
 
     }

    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
       
        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "消息";

        for (let i=1; i<5; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            btn_pt_1["index"] = i;
            btn_pt_1.on(cc.Node.EventType.TOUCH_END, this.onClickNLH, this)
        }

    }

    // changeType(chooseType) {
    //     if (chooseType == 1) {
    //         return 4;
    //     } else if (chooseType == 2) {
    //         return 2;
    //     } else if (chooseType == 3) {
    //         return 5;
    //     }
    // }


    onClickNLH(event) {
        let node = event.target;
        let index = node.index;

        if (index == 4) {
            // 带入界面
            UIComponent.open(UIDefine.UIMsgIntoList);
            return;
        }
        UIComponent.open(UIDefine.UIMine_Message, {index : index});

        // this.refreshChooseNLH(index);
        // this.reqDataAgain(index);
    }



}
