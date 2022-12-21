/*
 * @Author: xfj
 * @Date: 2022-12-21 11:16:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-21 12:12:37
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubList.ts
 */

import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "../labor/UIClubModel";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIClubList')
export default class UIClubList extends BaseForm {
    @property(cc.Prefab)
    clubListItem: cc.Prefab = null;
    @property(cc.Label)
    num: cc.Label = null;
    topNode: cc.Node
    pageNode: cc.Node
    listNode: cc.Node
    listType = 1;
    protected lateLoad(): void {
        super.lateLoad();
        this.topNode = this.getChildNodeOrComponent("topNode");
        this.pageNode = this.getChildNodeOrComponent("PageNode");
        this.listNode = this.getChildNodeOrComponent("listNode");
        this.pageNode.active = this.listType == 2
        this.listNode.active = this.listType == 1
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        await UIClubModel.mInstance.APIOrgClubGet()
        let data: any = Web_Org_Club_Get.Response.data
        this.num.string = data.length;
        this.initListNode(data)
    }
    initListNode(clubList) {
        let menberlist = this.listNode.getChildByName('menberlist');
        let sv_content = cc.find('view/sv_content', menberlist);
        sv_content.removeAllChildren();
        for (let index = 0; index < clubList.length; index++) {
            const element = clubList[index];
            let clubListItem = cc.instantiate(this.clubListItem);
            clubListItem.parent = sv_content;
            clubListItem.getComponent('clubListItem').initData(element);
        }
    }

}
