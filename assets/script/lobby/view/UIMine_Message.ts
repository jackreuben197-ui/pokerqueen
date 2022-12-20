import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import { MessageSubType } from "../../config/TTypeConfig";
import GC from "../../frame/GameControl";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";
import UIMessageItem from "./UIMessageItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Message extends BaseForm {

    // @property(cc.Node)
    // contentNode: cc.Node = null;
    @property(List)
    list: List = null;
    private _search = null;
    private _offset: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _list: Array<any> = [];
    private _total: number = 0

    _oldIndex: number = null;

    _searchData: any = null;

    _index: number = 1;

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
       
        if (param.index) {
            this._index = param.index;
        }
        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "消息";

        this.reqDataAgain(this._index);
    }

    changeType(chooseType) {
        if (chooseType == 1) {
            return 4;
        } else if (chooseType == 2) {
            return 2;
        } else if (chooseType == 3) {
            return 5;
        } 
    }


    async reqDataAgain(index) {
        let curSV: cc.Node = this.getChildNodeOrComponent("sv_down" + 1);
        let scrollView = curSV.getComponent(cc.ScrollView);
        scrollView.scrollToTop();
        this._offset = 0;
        this._total = 0;
        this._list = [];
        // this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this._oldIndex = index;
        this.dealData(index)
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMessageItem);
        item.initData(this._list[index]);
    }
    scrollingCB = async (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData(this._oldIndex)
            }
        }
    }

    async dealData(index) {
        this._reqing = true

        this.reqUpInfo(index, (_data)=> {
            this._reqing = false
            let info = _data.data.list;
            if (!info) {
                info = [];
            }

            let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_notShow");
            let len = info.length;
            if (len == 0) {
                lbl_noshow.active = true;
            } else {
                lbl_noshow.active = false;
            }
    
            info.forEach(element => {
                this._list.push(element);
            });  //分页的时候使用的
            this._total = _data.data.total
    
            this.list.numItems = this._list.length;
            this._offset = this._list.length;
            this._reqEnd = this._list.length == this._total;
    
            this.list.numItems = this._list.length;
            this._offset = this._list.length;
            this._reqEnd = this._list.length == this._total;
        });
        // await UIClubModel.mInstance.APIOrgClubMember(data.random_id, this._offset, 10, this._search);
        // let _data: any = APIOrgClubMember.Response.data
        
    }

    

    reqUpInfo(index, cb) {
        let info = {
            msg_type: this.changeType(index),//消息类型:1-bag,2-club,3-money,4-system,5-tribe
            limit: 10,//条目
            offset: this._offset,//开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().reqMessageList(info).then(
            (res) => {
                // this.SetItemInfo(res);
                // this.refreshListView(index, res);
                if (cb) {
                    cb(res);
                }
            },
            (res) => {
            }
        )
    }
    

}
