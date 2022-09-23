/*
 * @Author: xfj
 * @Date: 2022-09-19 18:39:47
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-23 11:07:38
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIPlayerLookLabor.ts
 */

import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPlayerLookLabor extends BaseForm {
    @property(cc.Node)
    mask_group: cc.Node = null;

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
        let dec = this.mask_group.parent.getChildByName('TEXT_LABEL').getComponent(cc.Label);
        dec.string = data.desc

        let icon = cc.find('iconMask/icon', this.mask_group).getComponent(cc.Sprite);
        WebImageHelper.SetUrlImage(icon, data.logo)
        let lbl_glod = cc.find('img_right_bg/lbl_glod', this.mask_group).getComponent(cc.Label);

    }
}
