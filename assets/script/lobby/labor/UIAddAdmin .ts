/*
 * @Author: xfj
 * @Date: 2022-10-26 13:55:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-26 14:52:46
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIAddAdmin .ts
 */

import List from "../../common/List";
import { EventName } from "../../config/EventName";
import BaseForm from "../../ui/form/BaseForm";
import UIClubMamber from "./UIClubMamber";
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
        let item = node.getComponent(UIClubMamber);
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

    }
    addAdminBtn() {

    }
}
