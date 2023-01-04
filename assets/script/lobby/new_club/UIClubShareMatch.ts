/*
 * @Author: xfj
 * @Date: 2023-01-03 11:28:55
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-04 20:32:32
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubShareMatch.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import UIClubShareMatchItem from "./UIClubShareMatchItem";
import List from "../../common/List";
import { UIClubModel } from "../labor/UIClubModel";
import { APIOrgClubShareApplyList, APIOrgClubShareApproveList, APIOrgClubSharePendingList } from "../../net/https/WebRequest";
import { EventName } from "../../config/EventName";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubShareMatch')
export default class UIClubShareMatch extends BaseForm {
    _selectTitle = 0
    _offset: number = 0;
    _reqing: boolean = false;
    _reqEnd: boolean = false;
    _list: Array<any> = [];
    _total: number = 0
    memberListT: cc.Node
    applyListT: cc.Node
    private comFormTitle: ComFormTitle = null;
    @property(List)
    memberList: List = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.memberListT = this.getChildNodeOrComponent("memberListT");
        this.applyListT = this.getChildNodeOrComponent("applyListT");
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_shareMatch"
        this.comFormTitle.initData(title, this);
        this.titleNodeClick(null, 0)
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refreshShareMatch, this.reqDataAgain);
    }

    titleNodeClick(event, customData) {
        // if (this._selectTitle == customData) return
        this._selectTitle = customData
        this.memberListT.getChildByName('block').active = this._selectTitle == 0
        this.applyListT.getChildByName('block').active = this._selectTitle == 1

        this.memberListT.getChildByName('title').color = this._selectTitle == 0 ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.applyListT.getChildByName('title').color = this._selectTitle == 1 ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.reqDataAgain();
    }
    async reqDataAgain() {
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.dealData()
    }
    async dealData() {
        this._reqing = true
        let _data: any = [];

        if (this._selectTitle == 1) {
            await UIClubModel.mInstance.APIOrgClubSharePendingList({ limit: 10, offset: this._offset })
            _data = APIOrgClubSharePendingList.Response.data
        } else if (this._selectTitle == 0) {
            await UIClubModel.mInstance.APIOrgClubShareApproveList({ limit: 10, offset: this._offset })
            _data = APIOrgClubShareApproveList.Response.data
        }
        // let params = {
        //     "club_random_id": ClubCache.random_id,
        //     "limit": 20,
        //     "offset": this._offset,
        //     "user_type": this.ROLE_TYPE[this._selectRoleType],
        //     "sort_type": this._sort_type,  //1-输赢数;2-手数;3-服务费;4-最后登陆时间;
        //     "order_type": this._order_type, //1-顺序;2-倒叙;
        //     "club_id": ClubCache.club_id,
        //     'search': this._search,
        // }
        // await UIClubModel.mInstance.APIOrgMemberList(params);
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }

        _data.data.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total

        this.memberList.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIClubShareMatchItem);
        item.initData(this._list[index], this._selectTitle);
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

}
