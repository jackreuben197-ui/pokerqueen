/*
 * @Author: xfj
 * @Date: 2022-12-20 17:42:31
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-20 20:49:19
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubMerberManager.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, menu } = cc._decorator;
import { UIDefine } from "../../define/UIDefine";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import { APIOrgClubGetJoinlList, APIOrgMemberList, Web_Org_Club_Get } from "../../net/https/WebRequest";
import { UIClubModel } from "../labor/UIClubModel";
import MemberItem from "./MemberItem";
import ApplyJoinClubItem from "./applyJoinClubItem";

enum TITALtYPE {
    MEMBER = 0,
    APPLY = 1,
}
@ccclass
@menu('脚本分组/new_club/UIlaborMerberManager')
export default class UIClubMerberManager extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    memberListT: cc.Node
    applyListT: cc.Node
    sousuo: cc.Node
    toggleNode: cc.Node
    sortNode: cc.Node
    _search = null;
    _selectTitle = null;
    _selectRoleType = null;
    _offset: number = 0;
    _reqing: boolean = false;
    _reqEnd: boolean = false;
    _list: Array<any> = [];
    _total: number = 0

    @property(List)
    memberList: List = null;

    @property(cc.Node)
    applyList: cc.Node = null;

    @property(cc.Prefab)
    ApplyJoinClubItem: cc.Prefab

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.memberListT = this.getChildNodeOrComponent("memberListT");
        this.applyListT = this.getChildNodeOrComponent("applyListT");
        this.sousuo = this.getChildNodeOrComponent("sousuo");
        this.toggleNode = this.getChildNodeOrComponent("toggleNode");
        this.sortNode = this.getChildNodeOrComponent("sortNode");

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_MemberManage"
        this.comFormTitle.initData(title, this);
        this.titleNodeClick(null, TITALtYPE.MEMBER)
        this.switchTabBtnState(0)

    }
    titleNodeClick(event, customData) {
        if (this._selectTitle == customData) return
        this._selectTitle = customData
        this.sousuo.active = this._selectTitle == TITALtYPE.MEMBER
        this.toggleNode.active = this._selectTitle == TITALtYPE.MEMBER
        this.sortNode.active = this._selectTitle == TITALtYPE.MEMBER
        this.memberListT.getChildByName('block').active = this._selectTitle == TITALtYPE.MEMBER
        this.applyListT.getChildByName('block').active = this._selectTitle == TITALtYPE.APPLY

        this.memberListT.getChildByName('title').color = this._selectTitle == TITALtYPE.MEMBER ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.applyListT.getChildByName('title').color = this._selectTitle == TITALtYPE.APPLY ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.memberList.node.active = this._selectTitle == TITALtYPE.MEMBER
        this.applyList.active = this._selectTitle == TITALtYPE.APPLY
        if (this._selectTitle == TITALtYPE.MEMBER) {
            this.reqDataAgain()
        } else {
            this.initJoinList()
        }
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.toggleNode.children.forEach((item, index) => {
            this.bindClick(item, this.switchTabBtnState, index);
        })
    }
    switchTabBtnState(index: number) {
        if (this._selectRoleType == index) return;
        this._selectRoleType = index
        this.toggleNode.children.forEach((item, index) => {
            item.getChildByName("title").color = this._selectRoleType == index ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        })
    }
    async reqDataAgain() {
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.dealData()
    }
    async dealData() {
        this._reqing = true

        let data: any = Web_Org_Club_Get.Response.data;

        await UIClubModel.mInstance.APIOrgMemberList(data.random_id, this._offset, 10, this._search);
        let _data: any = APIOrgMemberList.Response.data
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }

        _data.data.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total

        this.memberList.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(MemberItem);
        item.initData(this._list[index]);
    }
    scrollingCB = async (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData()
            }
        }
    }
    async initJoinList() {
        let sv_content = cc.find('view/sv_content', this.applyList)
        sv_content.removeAllChildren();
        await UIClubModel.mInstance.APIOrgClubGetJoinList()
        let data: any = APIOrgClubGetJoinlList.Response.data
        for (let index = 0; index < data?.data.length; index++) {
            const element = data?.data[index];
            let item = cc.instantiate(this.ApplyJoinClubItem);
            item.parent = sv_content;
            item.getComponent('ApplyJoinClubItem').initData(element)

        }

    }
}
