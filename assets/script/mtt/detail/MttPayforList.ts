/*
 * @Author: xfj
 * @Date: 2023-01-16 10:33:59
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-31 15:29:51
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforList.ts
 */


import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { ClubCache } from "../../frame/data/club/ClubCache";
import GC from "../../frame/GameControl";
import { UIClubModel } from "../../lobby/labor/UIClubModel";
import { APIMttUserWallet, Web_Mtt } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import MttPayforItem from "./MttPayforItem";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttPayforList')
export default class MttPayforList extends BaseForm {

    _offset = 0;
    _total = 0
    _reqing = false
    _reqEnd = false
    _list = []
    @property(List)
    list: List = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.reqDataAgain();
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }
    async reqDataAgain() {
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.list.numItems = 0
        this.dealData()
    }
    async dealData() {
        this._reqing = true
        await UIClubModel.mInstance.APIMttUserWallet(GC.data.mtt.list.select.match_id, { club_id: ClubCache.club_id, offset: this._offset, limit: 20 })
        let _data: any = APIMttUserWallet.Response.data
        this._reqing = false
        if (!_data.wallet) {
            _data.wallet = [];
        }

        _data.wallet.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(MttPayforItem);
        item.initData(this._list[index], this); //this._list[index]
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
    itemClick() {
        this.post(EventName.selectMttWwllet);
        this.close();
    }
}
