/*
 * @Author: xfj
 * @Date: 2022-09-21 13:56:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-27 18:52:35
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborMerberManager.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get, APIOrgClubGetJoinlList, APIOrgMemberList } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlaborMerberManager extends BaseForm {
    @property(cc.Node)
    topLabel: cc.Node = null;

    @property(cc.Node)
    item: cc.Node = null;

    @property(cc.Node)
    contentNode: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.initTop()
        this.initMemberList();
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
}
