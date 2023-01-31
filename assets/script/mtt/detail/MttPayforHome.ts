/*
 * @Author: xfj
 * @Date: 2023-01-16 10:33:59
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-30 21:07:03
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforHome.ts
 */


import List from "../../common/List";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttPayforHome')
export default class MttPayforHome extends BaseForm {

    payNode: cc.Node = null;
    select_lbl: cc.Label = null;
    sure: cc.Node = null;
    _data: any = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.payNode = this.getChildNodeOrComponent('payNode')
        this.select_lbl = this.getChildNodeOrComponent('select_lbl', cc.Label);
        this.sure = this.getChildNodeOrComponent('sure');

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {

        super.onShow(param, fromUI, sceneUI);
        this._data = param;

        if (ClubCache.mttPayWallat == 0) {
            this.sure.active = true
            this.setText(this.select_lbl, 'UILogin_Select')
        } else {
            this.sure.active = false;
            this.setText(this.select_lbl, ClubCache.mttPayWallat)
        }

        this.bindClick(this.payNode, () => {
            UIComponent.open(UIDefine.MttPayforList)
        })
    }

}
