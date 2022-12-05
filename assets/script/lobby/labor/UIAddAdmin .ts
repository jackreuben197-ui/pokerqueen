/*
 * @Author: xfj
 * @Date: 2022-10-26 13:55:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-05 13:27:48
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIAddAdmin .ts
 */

import List from "../../common/List";
import BaseForm from "../../ui/form/BaseForm";
import UIClubMamber from "./UIClubMamber";
import { UIClubModel } from "./UIClubModel";
import { APIOrgClubGetJoinlList, APIOrgClubMember, APIOrgMangerList, Web_Org_Club_Get } from "../../net/https/WebRequest";
import { EventName } from "../../config/EventName";
import ComFormTitle from "../../common/ComFormTitle";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIAddAdmin')
export default class UIAddAdmin extends BaseForm {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;
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

    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }

    async onShow(param?: any) {

        super.onShow(param);
        this.comFormTitle.initData('UIClub_AddAdmin', this);
        this.reqDataAgain();
        this.list.scrollingCB = this.scrollingCB;
        this.EditBox.string = null;
        this._search = null;
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refreshAdmin, this.reqDataAgain);
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
        this._reqing = true

        let data: any = Web_Org_Club_Get.Response.data;

        await UIClubModel.mInstance.APIOrgClubMember(data.random_id, this._offset, 10, this._search);
        let _data: any = APIOrgClubMember.Response.data
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }

        _data.data.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }

    async sousuoBtn() {
        let string = this.EditBox.string
        string.trim();
        if (string == '') {
            return;
        }
        this._search = string;
        this.reqDataAgain();
    }

    hideSearchNode() {
        let string = this.EditBox.string
        if (string == '') {
            this._search = null;
            this.reqDataAgain();
        }
    }
}
