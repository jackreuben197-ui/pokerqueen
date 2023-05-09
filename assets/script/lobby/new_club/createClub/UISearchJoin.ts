/*
 * @Author: xfj
 * @Date: 2022-09-14 19:02:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-09 09:55:50
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createClub/UISearchJoin.ts
 */

import WebImageHelper from "../../../helper/WebImageHelper";
import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import TabNode from "../../../common/tabNode";
import { UIClubModel } from "../../labor/UIClubModel";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import EventEmitter = require("events");
import { EventName } from "../../../config/EventName";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/createClub/UISearchJoin')
export default class UISearchJoin extends BaseForm {
    @property(cc.Sprite)
    Round: cc.Sprite = null;
    @property(cc.Node)
    union: cc.Node = null;
    @property(cc.Node)
    club: cc.Node = null;


    @property(cc.Label)
    nickName: cc.Label = null;
    @property(cc.RichText)
    id: cc.RichText = null;
    @property(cc.Label)
    memberNum = null;
    @property(cc.EditBox)
    contentEdit: cc.EditBox = null;

    private comFormTitle: ComFormTitle = null;
    tabNode: TabNode = null;
    list: cc.Node = null;
    searchNode: cc.Node = null;

    @property(cc.Label)
    btn_lbl: cc.Label = null;

    @property(cc.Button)
    sousuo: cc.Button = null;

    @property(cc.Node)
    canClick: cc.Node = null;

    @property(cc.Node)
    noClick: cc.Node = null;



    type = 0;
    _data = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.type = param.type;
        this._data = param.data;
        let title = this.type == 0 ? "club_3" : "UIClub_TribeJoin"
        this.comFormTitle.initData(title, this);
        WebImageHelper.SetHeadImage(this.Round, this._data.logo)
        this.nickName.string = this._data.club_name || this._data.name;
        this.id.string = `<color=#757CAB>ID:</color><color=#FEEC8E>${this._data.random_id}</color>`
        this.club.active = this.type == 0
        this.union.active = this.type == 1
        this.sousuo.interactable = false;

        if (this.type == 0) {
            this.sousuo.interactable = true;
            this.memberNum.string = this._data.club_members
        }
        this.setBtnState()
    }
    setBtnState() {
        this.canClick.active = this.sousuo.interactable
        this.noClick.active = !this.sousuo.interactable
        this.btn_lbl.node.color = this.sousuo.interactable ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#515774')

    }
    editBoxChange() {
        this.sousuo.interactable = this.contentEdit.string != ''
        this.setBtnState()
    }
    async sousuoBtn() {
        if (this.type == 0) {
            await UIClubModel.mInstance.APIOrgClubJoinClub(this._data.club_id);
            this.post(EventName.refreshApplyList)
        } else {
            let parms: any = { tribe_random_id: this._data.random_id, contact: this.contentEdit.string, club_id: ClubCache.club_id };
            await UIClubModel.mInstance.APIOrgJoinTrip(parms)
            this.post(EventName.refreshApplyList)
        }
        this.close()
    }
    // update (dt) {}
}
