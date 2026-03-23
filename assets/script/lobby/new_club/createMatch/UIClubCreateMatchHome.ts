/*
 * @Author: xfj
 * @Date: 2022-12-24 10:33:15
 * @description: 创建牌桌类型
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-16 11:11:56
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIClubCreateMatchHome.ts
 */
enum TITALTYPE {
    GAME_TYPE = 0,
    MODEL = 1,
}
import ComFormTitle from "../../../common/ComFormTitle";
import List from "../../../common/List";
import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { WebOrggetTemplate } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import UIClubCreateMatchItem from "./UIClubCreateMatchItem";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubCreateMatchHome')
export default class UIClubCreateMatchHome extends BaseForm {
    @property(cc.Node)
    contentModel: cc.Node = null;
    @property(cc.Node)
    createBtn: cc.Node = null;

    // @property(cc.Node)
    // canClick: cc.Node = null;
    // @property(cc.Node)
    // noClick: cc.Node = null;
    // @property(cc.Label)
    // btnTip: cc.Label = null;


    @property(cc.Prefab)
    UIClubCreateMatchItem: cc.Prefab = null;

    private comFormTitle: ComFormTitle = null;
    titleNode: cc.Node = null;
    matchTypeNode: cc.Node = null;
    matchModel: cc.Node = null;
    memberListT: cc.Node = null;
    applyListT: cc.Node = null;
    toggleNode: cc.Node = null;

    _selectTitle = null;
    _selectRoleType = null;
    _modelData = []

    _offset = 0;
    _total = 0
    _reqing = false
    _reqEnd = false
    _list = []
    list: List = null;

    protected lateLoad(): void {
        super.lateLoad();
        // UIClubModel.mInstance.WebOrggetRoomConfig()
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.titleNode = this.getChildNodeOrComponent("titleNode");
        this.matchTypeNode = this.getChildNodeOrComponent("matchTypeNode");
        this.matchModel = this.getChildNodeOrComponent("matchModel");
        this.memberListT = this.getChildNodeOrComponent("memberListT");
        this.applyListT = this.getChildNodeOrComponent("applyListT");
        this.toggleNode = this.getChildNodeOrComponent("toggleNode");
        this.list = this.getChildNodeOrComponent("list", List);
        this.list.scrollingCB = this.scrollingCB;
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        // this.refreshModel();
        ClubCache.joinCreateMatchType = param
        let title = "UIGuild_CreateTable"
        this.comFormTitle.initData(title, this);
        this._selectRoleType = 0;
        this.titleNodeClick(null, TITALTYPE.GAME_TYPE)
        this.titleNode.active = ClubCache.joinCreateMatchType == 0
    }

    regiterDispatchEvent() {
        super.regiterDispatchEvent();
        this.listen(EventName.matchModelChange, this.reqDataAgain)
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.toggleNode.children.forEach((item, index) => {
            this.bindClick(item, this.switchTabBtnState, index);
        })
        this.matchTypeNode.children.forEach((item, index) => {
            this.bindClick(item, this.openMatchCreate, index);
        })

    }
    openMatchCreate(index) {
        ClubCache.CreateGameType = index + 1;
        UIComponent.open(UIDefine.UIClubCreateMatch);
    }

    switchTabBtnState(index: number, isInit = false) {
        this._selectRoleType = index
        this.toggleNode.children.forEach((item, index) => {
            item.getChildByName("title").opacity = this._selectRoleType == index ? 255 : 100
            item.getChildByName("Rectangle").active = this._selectRoleType == index
        })
        if (!isInit) {
            this.reqDataAgain()
        }
    }

    titleNodeClick(event, customData) {
        this._selectTitle = customData
        this.matchTypeNode.active = this._selectTitle == TITALTYPE.GAME_TYPE
        this.matchModel.active = this._selectTitle == TITALTYPE.MODEL
        this.memberListT.getChildByName('block').active = this._selectTitle == TITALTYPE.GAME_TYPE
        this.applyListT.getChildByName('block').active = this._selectTitle == TITALTYPE.MODEL

        this.memberListT.getChildByName('title').color = this._selectTitle == 0 ? cc.color().fromHEX('#FFFFFF') : cc.color().fromHEX('#E6E8EC')
        this.applyListT.getChildByName('title').color = this._selectTitle == 1 ? cc.color().fromHEX('#FFFFFF') : cc.color().fromHEX('#E6E8EC')

        if (this._selectTitle == TITALTYPE.MODEL) {
            this.switchTabBtnState(this._selectRoleType)
        }
    }
    dealItemSelect() {
        let modelNum = 0
        this._modelData = [];
        for (let index = 0; index < this.contentModel.childrenCount; index++) {
            const element = this.contentModel.children[index];
            let flag = element.getChildByName('Toggle').getComponent(cc.Toggle).isChecked;
            if (flag) {
                modelNum++
                this._modelData.push(element['_modelData'])
            }
        }
        if (modelNum <= 0 || modelNum > 5) {

            this.setButtonInteractable(this.createBtn, false);
        } else {

            this.setButtonInteractable(this.createBtn, true);
        }
        this.setBtnState()


    }
    setBtnState() {
        // this.canClick.active = this.createBtn.interactable
        // this.noClick.active = !this.createBtn.interactable
        // this.btnTip.node.color = this.createBtn.interactable ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#515774')

    }
    async createBtnClick() {
        await UIClubModel.mInstance.WebOrgRoomBatchCreate({ data: this._modelData });
        UIComponent.Instance.Toast(i18nMgr.Get('UIClub_CreateSuccess'))
        this.close();
        // this.refreshModel()
    }
    async reqDataAgain() {
        // let ob = this._roomList[this._tableType];
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.dealData()
    }
    async dealData() {
        this._reqing = true

        await UIClubModel.mInstance.WebOrggetTemplate({ game_play_type: this._selectRoleType });
        let _data: any = WebOrggetTemplate.Response.data;
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }
        this.matchModel.getChildByName('noDataTip').active = _data?.data?.length == 0

        _data.data.forEach(element => {
            this._list.push(element);
        });
        this._total = _data.total
        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }
    onRender(node: cc.Node, index: number) {
        // let ob = this._roomList[this._tableType];
        let item = node.getComponent(UIClubCreateMatchItem);
        item.initData(this._list[index], this);
    }

    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData()
            }
        }
    }


}
