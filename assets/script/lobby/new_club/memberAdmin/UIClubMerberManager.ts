/*
 * @Author: xfj
 * @Date: 2022-12-20 17:42:31
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-27 12:09:15
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/memberAdmin/UIClubMerberManager.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, menu } = cc._decorator;
import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import List from "../../../common/List";
import { APIOrgClubGetJoinlList, APIOrgMemberList, Web_Org_Club_Get } from "../../../net/https/WebRequest";
import { UIClubModel } from "../../labor/UIClubModel";
import MemberItem from "./MemberItem";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GGEvent from "../../../event/GGEvent";
import { EventName } from "../../../config/EventName";
import { memberAdminConfig, memberSortConfig } from "../../../frame/data/rate/RateConfig";
import TabNode from "../../../common/tabNode";
import { memberAdminTabConfig } from "../../../frame/config/tabConfig";
import GGSwitch from "../../../ui/component/GGSwitch";
import UIComponent from "../../../ui/UIComponent";
import { UIDefine } from "../../../define/UIDefine";

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
    dropNode_lbl: cc.Label

    sousuo: cc.Node
    sortNode: cc.Node
    applyNode: cc.Node = null;
    _search = null;
    _selectTitle = null;
    _selectRoleType = null;
    _offset: number = 0;
    _reqing: boolean = false;
    _reqEnd: boolean = false;
    _list: Array<any> = [];
    _total: number = 0
    _sort_type: number = 0
    _order_type: number = 1
    _rusp_st_state = 1
    @property(List)
    memberList: List = null;

    @property(cc.Node)
    applyList: cc.Node = null;

    @property(cc.Prefab)
    ApplyJoinClubItem: cc.Prefab = null;

    @property(cc.EditBox)
    EditBox: cc.EditBox = null;


    @property(GGSwitch)
    kqmsp_st: GGSwitch = null;


    tabNode: TabNode = null;
    ROLE_TYPE = {
        0: 0,
        1: 3,
        2: 4,
        3: 1
    }

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.memberListT = this.getChildNodeOrComponent("memberListT");
        this.applyListT = this.getChildNodeOrComponent("applyListT");
        this.tabNode = this.getChildNodeOrComponent("tabNode", TabNode);
        this.sousuo = this.getChildNodeOrComponent("sousuo");
        this.sortNode = this.getChildNodeOrComponent("sortNode");
        this.applyNode = this.getChildNodeOrComponent("applyNode");
        this.tabNode = this.getChildNodeOrComponent("tabNode", TabNode);
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);

    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_MemberManager"
        this.comFormTitle.initData(title, this);
        this.titleNodeClick(null, TITALtYPE.MEMBER)
        this.tabNode.initData(memberAdminTabConfig, this.switchTabBtnState.bind(this), this)
        this.initTop();
        this.kqmsp_st.setIsOn(ClubCache.auto_audit_switch == 1)
        this.kqmsp_st.clickObj = {
            click: () => {
                ClubCache._msg.auto_audit_switch = ClubCache.auto_audit_switch == 1 ? 2 : 1
                UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, auto_audit_switch: ClubCache.auto_audit_switch })

            }, self: this
        };

    }
    initTop() {
        this.sortNode.getChildByName('num').getComponent(cc.Label).string = ClubCache.club_members
        this.setText(this.dropNode_lbl, memberSortConfig[0].desc);
    }

    titleNodeClick(event, customData) {
        this._selectTitle = customData
        this.sousuo.active = this._selectTitle == TITALtYPE.MEMBER
        this.sortNode.active = this._selectTitle == TITALtYPE.MEMBER
        this.memberListT.getChildByName('block').active = this._selectTitle == TITALtYPE.MEMBER
        this.applyListT.getChildByName('block').active = this._selectTitle == TITALtYPE.APPLY
        this.tabNode.node.active = this._selectTitle == TITALtYPE.MEMBER
        this.memberListT.getChildByName('title').color = this._selectTitle == TITALtYPE.MEMBER ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
        this.applyListT.getChildByName('title').color = this._selectTitle == TITALtYPE.MEMBER ? cc.color().fromHEX('#757CAB') : cc.color().fromHEX('#EEF5FF')
        this.memberList.node.active = this._selectTitle == TITALtYPE.MEMBER
        this.applyNode.active = this._selectTitle == TITALtYPE.APPLY
        if (this._selectTitle == TITALtYPE.MEMBER) {
            this.reqDataAgain()
        } else {
            this.initJoinList()
        }
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }
    protected regiterDispatchEvent() {
        this.listen(EventName.requestClubMemList, this.reqDataAgain);

    }
    openDropDownBox() {

        UIComponent.open(UIDefine.dropDownBoxNew, { data: memberSortConfig, index: this._sort_type, cb: this.selectSort.bind(this) })
    }
    selectSort(data, index) {
        this._sort_type = index
        this.setText(this.dropNode_lbl, data.desc);
        // this._order_type = data.type
        this.reqDataAgain();
    }

    switchTabBtnState() {
        this._search = null;
        // if (this._selectRoleType == index) return;
        // this._selectRoleType = index
        // this.toggleNode.children.forEach((item, index) => {
        //     item.getChildByName("title").color = this._selectRoleType == index ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        // })
        // if (!isInit) {
        //     this.reqDataAgain()
        // }
        this.reqDataAgain()
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

        let params = {
            "club_random_id": ClubCache.random_id,
            "limit": 20,
            "offset": this._offset,
            "user_type": this.ROLE_TYPE[this._selectRoleType],
            "sort_type": this._sort_type + 1,  //1-输赢数;2-手数;3-服务费;4-最后登陆时间;
            "order_type": this._order_type, //1-顺序;2-倒叙;
            "club_id": ClubCache.club_id,
            'search': this._search,
        }
        await UIClubModel.mInstance.APIOrgMemberList(params);
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
        item.initData(this._list[index], index);
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
        await UIClubModel.mInstance.APIOrgClubGetJoinList(ClubCache.club_id)
        let data: any = APIOrgClubGetJoinlList.Response.data
        this.applyNode.getChildByName('noDataTip').active = data.length == 0
        for (let index = 0; index < data?.data.length; index++) {
            const element = data?.data[index];
            let item = cc.instantiate(this.ApplyJoinClubItem);
            item.parent = sv_content;
            item.getComponent('ApplyJoinClubItem').initData(element)

        }
    }

    async sousuoBtn() {
        let string = this.EditBox.string
        string.trim();
        if (string == '') {
            return;
        }
        this._search = string;
        this.reqDataAgain();
    }
    hideSearchNode() {
        let string = this.EditBox.string
        if (string == '') {
            this._search = null;
            this.reqDataAgain();
        }
    }
}
