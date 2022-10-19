/*
 * @Author: xfj
 * @Date: 2022-10-17 11:27:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-19 11:37:38
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatchHome.ts
 */

import { UIDefine } from "../../define/UIDefine";
import { APIOrgGetTemplate } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateMatchHome extends BaseForm {

    @property(cc.Prefab)
    modelItem: cc.Prefab = null;

    @property(cc.Label)
    lbModel: cc.Label = null;

    @property(cc.Node)
    contentModel: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        await UIClubModel.mInstance.APIOrgGetTemplate();
        let data: any = APIOrgGetTemplate.Response.data;
        this.lbModel.string = `(${data.length}/4)`
        this.contentModel.removeAllChildren();
        for (let index = 0; index < data.length; index++) {
            const element = cc.instantiate(this.modelItem);
            element.position.x = 0;
            element.parent = this.contentModel
        }
    }
    createMatch() {
        UIComponent.open(UIDefine.UICreateMatch);

    }
}
