/*
 * @Author: xfj
 * @Date: 2022-12-21 12:49:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 11:37:00
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubHome.ts
 */

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";
import ClubData from "../../frame/data/club/ClubData";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import WebImageHelper from "../../helper/WebImageHelper";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIClubHome')
export default class UIClubHome extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    toggleType = 1
    layout: cc.Node = null;
    @property(cc.Node)
    menu: cc.Node = null;

    @property(cc.Node)
    menuShow: cc.Node = null;
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
        this.initTabBnts()
    }
    initTop() {
        let club_introduce = this.layout.getChildByName('club_introduce');
        club_introduce.getComponent(cc.Label).string = ClubCache.desc;
        let messNode = this.layout.getChildByName('messNode');

        let icon = cc.find('iconMask/icon', messNode)
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), ClubCache.logo)
        cc.find('messLayout/nameNode/name', messNode).getComponent(cc.Label).string = ClubCache.club_name;
        cc.find('messLayout/id', messNode).getComponent(cc.Label).string = ClubCache.random_id;
        cc.find('people/data', messNode).getComponent(cc.Label).string = ClubCache.club_members;
        cc.find('table/data', messNode).getComponent(cc.Label).string = ClubCache.club_table;
        let hg = cc.find('messLayout/nameNode/hg', messNode)

        //0 普通 1会长 3管理员 4代理
        switch (ClubCache.user_level) {
            case 0:
                hg.active = false;
                break;
            case 1:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg03', AssetFold.texture_new_club)

                break;
            case 2:
                break;
            case 3:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg02', AssetFold.texture_new_club)
                break;
            case 4:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg01', AssetFold.texture_new_club)
                break;
            default:
                break;
        }

        this.menuShow.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTabBtns, index);
        })
        let topNode: cc.Node = this.getChildNodeOrComponent("topNode");
        let joinTrip = topNode.getChildByName('joinTrip');
        let coinNode = topNode.getChildByName('coinNode');
        if (ClubCache.tribe_name) {
            joinTrip.active = false
            coinNode.active = true
        }
        else {
            coinNode.active = false
            if (ClubCache.user_level == 1) {
                joinTrip.active = true
            } else {
                joinTrip.active = false
            }
        }
    }
    initTabBnts() {
        return;
        for (let index = 1; index < this.menuShow.childrenCount; index++) {
            const element = this.menuShow.children[index];
            element.active = true
        }
        //0 普通 1会长 3管理员 4代理
        switch (ClubCache.user_level) {
            case 0:
                this.menuShow.children[2].active = false
                this.menuShow.children[3].active = false
                this.menuShow.children[4].active = false
                this.menuShow.children[5].active = false
                break;
            case 1:
            case 3:
                this.menuShow.children[1].active = false
                break;
            case 2:
                break;
            case 4:
                this.menuShow.children[4].active = false
                this.menuShow.children[2].active = false
                break;
            default:
                break;
        }
        if (!ClubCache.tribe_name) this.menuShow.children[4].active = false
    }
    onClickTabBtns(index: number) {
        switch (index) {
            case 0:
                this.menuClick()
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                UIComponent.open(UIDefine.UIClubMerberManager)
                break;
            case 4:
                break;
            case 4:
                break;
            default:
                break;
        }

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
    menuClick() {
        this.menu.active = !this.menu.active
        this.menuShow.active = !this.menu.active
    }
}
