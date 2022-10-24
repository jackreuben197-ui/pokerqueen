/*
 * @Author: xfj
 * @Date: 2022-10-21 21:48:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-24 15:48:22
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIApplyJoin.ts
 */


import { timeStamp } from "console";
import List from "../../common/List";
import { APIOrgFriendApplyList } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import JoinitemNode from "./JoinitemNode";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIApplyJoin extends BaseForm {

    @property(List)
    list: List = null;
    @property(cc.Node)
    lb: cc.Node = null;

    private _reqing: boolean = false;
    private _reqEnd: boolean = false;

    private _offset: number = 0;

    private _list: Array<any> = [];
    private _total: number = 0
    protected lateLoad(): void {
        super.lateLoad();
    }

    async onShow(param?: any) {
        super.onShow(param);
        this.reqDataAgain();
        this.list.scrollingCB = this.scrollingCB;

    }
    async reqDataAgain() {
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.dealData()
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(JoinitemNode);
        item.initData(this._list[index]);
    }

    scrollingCB = async (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData()
            }
        }
    }

    async dealData() {
        this._reqing = true
        await UIClubModel.mInstance.APIOrgFriendApplyList(this._offset);
        // let _data: any = APIOrgFriendApplyList.Response.data
        // this._reqing = false
        // _data.data.forEach(element => {
        //     this._list.push(element);
        // });
        // this.lb.active = this._list.length == 0;
        // this.list.numItems = this._list.length;
        // this._total = _data.total
        // this._offset = this._list.length;
        // this._reqEnd = this._list.length == this._total;
    }

}
