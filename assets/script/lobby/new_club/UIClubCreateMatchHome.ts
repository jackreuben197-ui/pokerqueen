/*
 * @Author: xfj
 * @Date: 2022-12-24 10:33:15
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-26 17:29:06
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubCreateMatchHome.ts
 */
enum TITALTYPE {
    GAME_TYPE = 0,
    MODEL = 1,
}
import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { APIOrgGetTemplate } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "../labor/UIClubModel";
import UIClubCreateMatchItem from "./UIClubCreateMatchItem";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubCreateMatchHome')
export default class UIClubCreateMatchHome extends BaseForm {
    @property(cc.Node)
    contentModel: cc.Node = null;
    @property(cc.Button)
    createBtn: cc.Button = null;


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
        // UIClubModel.mInstance.APIOrgGetRoomConfig()
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
        let title = "UIClub_MatchTable"
        this.comFormTitle.initData(title, this);
        this._selectRoleType = 0;
        this.titleNodeClick(null, TITALTYPE.GAME_TYPE)
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
        if (this._selectRoleType == index) return;
        this._selectRoleType = index
        this.toggleNode.children.forEach((item, index) => {
            item.getChildByName("title").opacity = this._selectRoleType == index ? 255 : 75
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
        this.memberListT.getChildByName('title').color = this._selectTitle == TITALTYPE.GAME_TYPE ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.applyListT.getChildByName('title').color = this._selectTitle == TITALTYPE.MODEL ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')

        if (this._selectTitle == TITALTYPE.MODEL) {
            this.reqDataAgain()
        }
    }
    // async refreshModel() {
    //     await UIClubModel.mInstance.APIOrgGetTemplate({ game_play_type: this._selectRoleType });
    //     let data: any = APIOrgGetTemplate.Response.data;
    //     let length = data?.data?.length
    //     this.matchModel.getChildByName('tip').active = length == 0
    //     // this.lbModel.string = `(${length}/${data.club_template_limit} )`;
    //     this.contentModel.removeAllChildren();
    //     for (let index = 0; index < length; index++) {
    //         const element = cc.instantiate(this.UIClubCreateMatchItem);
    //         element.position.x = 0;
    //         element.getComponent('UIClubCreateMatchItem')._delegate = this
    //         element.parent = this.contentModel
    //         element['index'] = index;
    //         element.getComponent('UIClubCreateMatchItem').initData(data.data[index])
    //     }
    // }

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
            this.createBtn.interactable = false;
        } else {
            this.createBtn.interactable = true;
        }

    }
    async createBtnClick() {
        await UIClubModel.mInstance.APIOrgRoomBatchCreate({ data: this._modelData });
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

        await UIClubModel.mInstance.APIOrgGetTemplate({ game_play_type: this._selectRoleType });
        let _data: any = APIOrgGetTemplate.Response.data;
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }
        this.matchModel.getChildByName('tip').active = _data?.data?.length == 0

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
