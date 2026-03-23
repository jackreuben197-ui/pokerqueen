import ComFormTitle from "../../../common/ComFormTitle";
import List from "../../../common/List";
import { TSendInfo } from "../../../config/TTypeConfig";
import { HttpLink } from "../../../net/https/HttpLink";
import { WebGoldChangeInsureLog } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIRecordBXListItem from "./UIRecordBXListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/lobby/view/record/UIRecordBXList')
export default class UIRecordBXList extends BaseForm {
    //DATA
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _offset: number = 0;
    private _list: Array<any> = [];

    private _detail: any = null;
    get canReq() {
        return !this._reqEnd && !this._reqing;
    }

    resetData() {
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this._offset = 0;
    }

    dropDownReq(isClub: boolean = false) {
        if (!this._reqing && !this._reqEnd) {
            this.reqList(this._offset);
        }
    }

    reqList(offset: number = 0) {
        this._reqing = true;
        if (offset == 0) {
            this.resetData();
        }

        let sendInfo: TSendInfo = {
            api: WebGoldChangeInsureLog.API,
            body: { src_room_id: this._detail.info.data.room_data.room_id, limit: 15, offset: offset },
            isGet: false,
        }

        HttpLink.instance.reqServe(sendInfo);
    }


    updateData(msg: any) {
        this._reqing = false;

        msg.list.forEach(item => {
            this._list.push(item)
        })

        this._offset = this._list.length
        this._reqEnd = this._list.length >= msg.total;
    }


    //UI
    private comFormTitle: ComFormTitle = null;
    private list: List = null;
    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case WebGoldChangeInsureLog.API: {
                this.updateData(msg);
                this.updateList();
            } break;
        }
    }

    onShow(data?: any, fromUI?: any): void {
        super.onShow(data, fromUI);

        this._detail = data;

        this.comFormTitle.initData("UIMine_InsurancesItems", this);

        // this.comFormTitle.title.string = "保险";
        this.list.scrollingCB = this.scrollingCB;
        this.reqList();
    }

    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset();
            let isDown = cur.y >= max.y;
            if (isDown && this.canReq) {
                this.dropDownReq();
            }
        }
    }

    updateList() {
        this.list.numItems = this._list.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIRecordBXListItem);
        item.initData(this._list[index], index, index == this._list.length - 1);
    }
}