/*
 * @Author: xfj
 * @Date: 2023-01-16 10:33:59
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-16 11:00:21
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforHome.ts
 */


import List from "../../common/List";
import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttPayforHome')
export default class MttPayforHome extends BaseForm {

    payNode: cc.Node = null;
    select_lbl: cc.Label = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.payNode = this.getChildNodeOrComponent('payNode')
        this.select_lbl = this.getChildNodeOrComponent('select_lbl', cc.Label)
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.bindClick(this.payNode, () => {
            // if (this.select_lbl) 
            UIComponent.open(UIDefine.MttPayforList)
        })
    }

}
