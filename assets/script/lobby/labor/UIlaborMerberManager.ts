/*
 * @Author: xfj
 * @Date: 2022-09-21 13:56:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-28 10:43:32
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborMerberManager.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get, APIOrgClubGetJoinlList, APIOrgMemberList } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";
import { UIClubModel } from "./UIClubModel";

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
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.initTop()
        this.initMemberList();
        await UIClubModel.mInstance.APIOrgClubGetJoinlList()
        this.initAudit()
    }
    initAudit() {
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
        let data: any = APIOrgMemberList.Response.data;
        for (let index = 0; index < data?.data.length; index++) {
            let _item = cc.instantiate(this.item);
            _item.parent = this.contentNode
            _item.getChildByName('name').getComponent(cc.Label).string = data?.data[index].nick_name
            _item.getChildByName('id').getComponent(cc.Label).string = data?.data[index].random_num
            let icon = cc.find('iconMask/icon', _item);
            WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), data?.data[index].avatar)
            _item.active = true;
        }
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
        this.nickNameSort();

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
        this.dateSort();

    }
    nickNameSort() {

    }
    dateSort() {

    }

}
