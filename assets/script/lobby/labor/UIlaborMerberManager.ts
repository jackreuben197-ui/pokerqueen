/*
 * @Author: xfj
 * @Date: 2022-09-21 13:56:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-29 17:23:06
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborMerberManager.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get, APIOrgClubGetJoinlList, APIOrgMemberList } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";
import { UIClubModel } from "./UIClubModel";
import TimeHelper from "../../helper/TimeHelper";

const { ccclass, property } = cc._decorator;

@ccclass
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


    nickNameSortType: 'up';
    timeSortType: 'up';
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.initTop()
        await UIClubModel.mInstance.APIOrgClubGetJoinlList()
        this.initMemberList();
        // this.initAudit()
    }
    initAudit() {
        //为了显示审批的红点
        let data: any = APIOrgClubGetJoinlList.Response.data
        if (data?.data.length > 0) {

        }
    }

    examination() {
        UIComponent.open(UIDefine.UIlaborExaminatMerber);
    }
    async initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let current = this.topLabel.getChildByName('current').getComponent(cc.Label)
        let total = this.topLabel.getChildByName('total').getComponent(cc.Label)
        current.string = '(' + data.club_members
        total.string = data.upper_limit + ')';
    }
    async initMemberList() {
        this.contentNode.removeAllChildren();
        let data: any = APIOrgMemberList.Response.data;
        if (data == null) {
            return;
        }
        for (let index = 0; index < data?.data.length; index++) {
            let _item = cc.instantiate(this.item);
            _item.parent = this.contentNode
            _item.getChildByName('name').getComponent(cc.Label).string = data?.data[index].nick_name
            _item.getChildByName('id').getComponent(cc.Label).string = data?.data[index].random_num
            _item.getChildByName('data').getComponent(cc.Label).string = TimeHelper.ShowRemainingSemicolon2((new Date().getTime() / 1000 - data?.data[index].last_login_time))
            _item['last_login_time'] = data?.data[index].last_login_time
            let icon = cc.find('iconMask/icon', _item);
            WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), data?.data[index].avatar)
            _item.active = true;
            _item['info'] = data[index];
            _item.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        }
    }

    onClickItem(event) {
        let target = event.target;
        let info = target.info;
        UIComponent.open(UIDefine.UIMember, {info : info});
    }

    async sousuoBtn() {
        let string = this.EditBox.string
        if (string == '') {
            // UIComponent.Instance.Toast(i18nMgr.Get('club_creat_7'))
        }
        for (let index = 0; index < this.contentNode.childrenCount; index++) {
            const element = this.contentNode.children[index];
            let str = element.getChildByName('id').getComponent(cc.Label).string
            if (str != string) {
                element.active = false;
            } else {
                element.active = true;
            }
        }
    }



    hideSearchNode() {
        let string = this.EditBox.string
        if (string == '') {
            for (let index = 0; index < this.contentNode.childrenCount; index++) {
                const element = this.contentNode.children[index];
                element.active = true;
            }
        }
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
            WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), sortData[index].avatar)
        }
    }

}
