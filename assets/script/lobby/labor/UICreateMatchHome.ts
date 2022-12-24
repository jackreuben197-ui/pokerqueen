/*
 * @Author: xfj
 * @Date: 2022-10-17 11:27:50
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-24 12:51:52
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatchHome.ts
 */

import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { APIOrgGetTemplate } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";
import ComFormTitle from "../../common/ComFormTitle";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UICreateMatchHome')
export default class UICreateMatchHome extends BaseForm {

    @property(cc.Prefab)
    modelItem: cc.Prefab = null;

    @property(cc.Label)
    lbModel: cc.Label = null;

    @property(cc.Node)
    contentModel: cc.Node = null;
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        UIClubModel.mInstance.APIOrgGetRoomConfig()
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    regiterDispatchEvent() {
        super.regiterDispatchEvent();
        this.listen(EventName.matchModelChange, this.refreshModel)
    }
    async refreshModel() {
        await UIClubModel.mInstance.APIOrgGetTemplate({});
        let data: any = APIOrgGetTemplate.Response.data;

        let length = data?.data?.length || 0
        this.lbModel.string = `(${length}/${data.club_template_limit} )`;

        this.contentModel.removeAllChildren();
        for (let index = 0; index < length; index++) {
            const element = cc.instantiate(this.modelItem);
            element.position.x = 0;
            element.parent = this.contentModel
            element['index'] = index;
            element.getComponent('UICreateMatchItem').initData(data.data[index])
        }
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.refreshModel();
        let title = "UIClub_MatchTable"
        this.comFormTitle.initData(title, this);
    }
    createMatch() {
        UIComponent.open(UIDefine.UICreateMatch);

    }
}
