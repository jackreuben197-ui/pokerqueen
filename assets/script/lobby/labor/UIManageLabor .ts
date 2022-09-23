/*
 * @Author: xfj
 * @Date: 2022-09-21 13:59:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-23 12:04:37
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIManageLabor .ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";
@ccclass
export default class UIManageLabor extends BaseForm {

    @property(cc.Node)
    mask_group: cc.Node = null;
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;
    @property(cc.Label)
    lbl_glod: cc.Label = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.initTop();
    }
    initTop() {
        let data: any = Web_Org_Club_Get.Response.data;
        let name = this.mask_group.getChildByName('name').getComponent(cc.Label);
        name.string = data.club_name
        let id = this.mask_group.getChildByName('id').getComponent(cc.Label);
        id.string = 'ID:' + data.random_id
        this.EditBox.string = data.desc

        let icon = cc.find('iconMask/icon', this.mask_group);
        WebImageHelper.SetUrlImage(icon.getComponent(cc.Sprite), data.logo)

    }
    managementMember() {
        UIComponent.open(UIDefine.UIlaborExaminatMerber);
    }
}
