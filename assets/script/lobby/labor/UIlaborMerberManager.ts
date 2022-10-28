/*
 * @Author: xfj
 * @Date: 2022-09-21 13:56:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 18:19:52
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborMerberManager.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get, APIOrgClubGetJoinlList, APIOrgMemberList } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";
import { UIClubModel } from "./UIClubModel";
import TimeHelper from "../../helper/TimeHelper";
import GGEvent from "../../event/GGEvent";
import memberItem from "./memberItem";
import List from "../../common/List";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIlaborMerberManager')
export default class UIlaborMerberManager extends BaseForm {
    @property(cc.Node)
    topLabel: cc.Node = null;

    @property(cc.Node)
    item: cc.Node = null;

    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Node)
    nickName: cc.Node = null;

    @property(cc.Node)
    timeNode: cc.Node = null;

    @property(List)
    list: List = null;
    private _search = null;
    private _offset: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _list: Array<any> = [];
    private _total: number = 0


    nickNameSortType: 'up';
    timeSortType: 'up';
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
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
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(memberItem);
        item.initData(this._list[index]);
    }
    /**
    * 注册广播事件
    */
    protected regiterDispatchEvent() {
        this.listen(GGEvent.CLUB_DELE_USER, this.reqDataAgain);

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
        await UIClubModel.mInstance.APIOrgMemberList(data.random_id, this._offset, 10, this._search);
        let _data: any = APIOrgMemberList.Response.data
        this.initTop()

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

    examination() {
        UIComponent.open(UIDefine.UIlaborExaminatMerber);
    }

    async initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let current = this.topLabel.getChildByName('current').getComponent(cc.Label)
        let total = this.topLabel.getChildByName('total').getComponent(cc.Label)
        let _data: any = APIOrgMemberList.Response.data
        if (!_data.data) {
            _data.data = [];
        }
        current.string = '(' + (_data.data ? 1 : data.data.length)
        total.string = data.upper_limit + ')';
    }


    setNickNameBtn(event) {
        this.nickNameSortType = event.target.name
        for (let index = 1; index < this.nickName.childrenCount; index++) {
            const element = this.nickName.children[index];
            if (element.name == event.target.name) {
                element.opacity = 255;
            } else {
                element.opacity = 80
            }
        }
        this.sort('name');

    }
    setDateBtn(event) {
        this.timeSortType = event.target.name
        for (let index = 1; index < this.timeNode.childrenCount; index++) {
            const element = this.timeNode.children[index];
            if (element.name == event.target.name) {
                element.opacity = 255;
            } else {
                element.opacity = 80
            }
        }
        this.sort('time');
    }
    sort(type) {
        let data: any = APIOrgMemberList.Response.data;
        let sortData = data.data.sort((a, b) => {
            if (type == 'name') {
                if (this.nickNameSortType == 'up') {
                    return a.nick_name.localeCompare(b.nick_name, 'zh')
                } else {
                    return b.nick_name.localeCompare(a.nick_name, 'zh')
                }
            } else {
                if (this.timeSortType == 'up') {
                    return a.last_login_time - b.last_login_time
                } else {
                    return b.last_login_time - a.last_login_time
                }
            }

        })
        for (let index = 0; index < sortData.length; index++) {
            let _item = this.contentNode.children[index];
            _item.parent = this.contentNode
            _item.getChildByName('name').getComponent(cc.Label).string = sortData[index].nick_name
            _item.getChildByName('id').getComponent(cc.Label).string = sortData[index].random_num
            _item.getChildByName('data').getComponent(cc.Label).string = TimeHelper.ShowRemainingSemicolon2((new Date().getTime() / 1000 - data?.data[index].last_login_time)) + '前'
            let icon = cc.find('iconMask/icon', _item);
            _item.active = true;
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), sortData[index].avatar)
        }
    }

}
