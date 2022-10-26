/*
 * @Author: xfj
 * @Date: 2022-10-26 13:55:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-26 14:07:09
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIAuditAdmin.ts
 */

import List from "../../common/List";
import { EventName } from "../../config/EventName";
import BaseForm from "../../ui/form/BaseForm";
import UIAdmin from "./UIAdmin";
import { UIClubModel } from "./UIClubModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAuditAdmin extends BaseForm {
    @property(List)
    list: List = null;
    private _offset: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
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
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.updateFrendApplyList, this.dealData);
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
        let item = node.getComponent(UIAdmin);
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
        let _data: any = [];

        this._reqing = false
        _data.data.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this.list.numItems = 4 //this._list.length;
        this._total = _data.total
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;
    }
}
