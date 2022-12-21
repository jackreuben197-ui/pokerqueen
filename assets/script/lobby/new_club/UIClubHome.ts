/*
 * @Author: xfj
 * @Date: 2022-12-21 12:49:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-21 18:37:21
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubHome.ts
 */

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";
import ClubData from "../../frame/data/club/ClubData";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIClubHome')
export default class UIClubHome extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    toggleType = 1
    layout: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.layout = this.getChildNodeOrComponent("layout");
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Home"
        this.comFormTitle.initData(title, this);
        this.initToggle();
        this.initTop();
    }
    initTop() {
        let club_introduce = this.layout.getChildByName('club_introduce');
        club_introduce.getComponent(cc.Label).string = ClubCache.desc;
        let messNode = this.layout.getChildByName('messNode');

        cc.find('messLayout/nameNode/name', messNode).getComponent(cc.Label).string = ClubCache.club_name;
        cc.find('messLayout/id', messNode).getComponent(cc.Label).string = ClubCache.random_id;
        cc.find('people/data', messNode).getComponent(cc.Label).string = ClubCache.club_members;
        cc.find('table/data', messNode).getComponent(cc.Label).string = ClubCache.club_table;


    }
    initToggle() {
        let table = cc.find('toggleNode/Rectangle/table', this.layout)
        let chet = cc.find('toggleNode/Rectangle/chet', this.layout)
        table.getChildByName('Rectangle').active = this.toggleType == 1;
        chet.getChildByName('Rectangle').active = this.toggleType == 2;
        cc.find('labelNode/lbl_1', table).opacity = this.toggleType == 1 ? 255 : 75
        cc.find('labelNode/lbl_2', table).opacity = this.toggleType == 1 ? 255 : 75
        cc.find('labelNode/lbl_1', chet).opacity = this.toggleType == 2 ? 255 : 75
        cc.find('labelNode/lbl_2', chet).opacity = this.toggleType == 2 ? 255 : 75
    }
    toggleClick() {
        this.toggleType = this.toggleType == 1 ? 2 : 1
        this.initToggle()
    }

}
