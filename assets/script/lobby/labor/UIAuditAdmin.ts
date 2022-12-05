/*
 * @Author: xfj
 * @Date: 2022-10-26 13:55:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-05 13:20:20
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIAuditAdmin.ts
 */

import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import UIAdmin from "./UIAdmin";
import { UIClubModel } from "./UIClubModel";
import { APIOrgChangeClubData, APIOrgMangerList, Web_Org_Club_Get } from "../../net/https/WebRequest";
import ComFormTitle from "../../common/ComFormTitle";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIAuditAdmin')
export default class UIAuditAdmin extends BaseForm {
    @property(List)
    list: List = null;
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

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.comFormTitle.initData('UIClub_MangerAdmin', this);

        this.reqDataAgain();
        this.list.scrollingCB = this.scrollingCB;

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
        let data: any = Web_Org_Club_Get.Response.data;
        await UIClubModel.mInstance.APIOrgMangerList(data.random_id, 10, this._offset);
        let _data: any = APIOrgMangerList.Response.data
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }
        _data.data.forEach(element => {
            if (element.level != 1) {
                this._list.push(element);
            }
        });  //分页的时候使用的
        this._total = _data.total

        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }
    addAdminBtn() {
        UIComponent.open(UIDefine.UIAddAdmin)
    }
}
