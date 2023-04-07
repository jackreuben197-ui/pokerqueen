import ComFormTitle from "../../../common/ComFormTitle";
import List from "../../../common/List";
import { EventName } from "../../../config/EventName";
import { UIDefine } from "../../../define/UIDefine";
import TimeHelper from "../../../helper/TimeHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import dataItem from "./dataItem";
import Data from "../../labor/script/Data";
import { StringHelper } from "../../../helper/StringHelper";
import { dataDetailSortConfig } from "../../../frame/data/rate/RateConfig";
import dataDetailItem from "./dataDetailItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/dataManger/UIFriendDataDetail')
export default class UIFriendDataDetail extends BaseForm {
    private comFormTitle: ComFormTitle = null;

    lbl_4: cc.Label = null;
    lbl_5: cc.Label = null;
    lbl_6: cc.Label = null;
    lbl_44: cc.Label = null;
    lbl_55: cc.Label = null;
    lbl_66: cc.Label = null;

    lbl_staus: cc.Label = null;
    lbl_id: cc.Label = null;
    lbl_create: cc.Label = null;
    noDataTip: cc.Node
    dropNode_lbl: cc.Label = null;
    dataList: List = null;
    _offset: number = 0;
    _reqing: boolean = false;
    _reqEnd: boolean = false;
    _list: Array<any> = [];
    _total: number = 0
    _roomId: number = 0
    _selectIndex: number = 0
    _order_by: string = 'fee'
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.lbl_4 = this.getChildNodeOrComponent("lbl_4", cc.Label);
        this.lbl_5 = this.getChildNodeOrComponent("lbl_5", cc.Label);
        this.lbl_6 = this.getChildNodeOrComponent("lbl_6", cc.Label);
        this.lbl_44 = this.getChildNodeOrComponent("lbl_44", cc.Label);
        this.lbl_55 = this.getChildNodeOrComponent("lbl_55", cc.Label);
        this.lbl_66 = this.getChildNodeOrComponent("lbl_66", cc.Label);

        this.lbl_staus = this.getChildNodeOrComponent("lbl_staus", cc.Label);
        this.lbl_id = this.getChildNodeOrComponent("lbl_id", cc.Label);
        this.lbl_create = this.getChildNodeOrComponent("lbl_create", cc.Label);
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);
        this.noDataTip = this.getChildNodeOrComponent("noDataTip");
        this.dataList = this.getChildNodeOrComponent("sv_scrow", List);

    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this._roomId = param
        this.dataList.scrollingCB = this.scrollingCB;
        let title = "UIClub_DataManager"
        this.comFormTitle.initData(title, this)
        this.initUI()
        this.setText(this.dropNode_lbl, dataDetailSortConfig[this._selectIndex].desc);
        this.reqDataAgain()
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }
    openDropDownBox() {
        UIComponent.open(UIDefine.dropDownBoxNew, { data: dataDetailSortConfig, index: this._selectIndex, cb: this.selectSort.bind(this) })
    }
    selectSort(data, index) {
        this._selectIndex = index;
        this._order_by = data.model
        this.setText(this.dropNode_lbl, data.desc);
        this.reqDataAgain();
    }

    async reqDataAgain() {
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.reqData()
    }
    async reqData() {

        this._reqing = true
        let _data: any = [];

        let parms = {
            'room_id': this._roomId,
            'order_by': this._order_by,
            'limit': 20,
            'offset': this._offset
        }
        _data = await UIClubModel.mInstance.web_api_friend_room_stats_data_detail(parms)
        this._reqing = false
        if (!_data.data) {
            _data.data = [];
        }

        _data.data.list.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.data.total
        this.noDataTip.active = this._list.length == 0
        this.dataList.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;


    }
    initUI() {
        let parms = {
            'room_id': this._roomId,
        }
        UIClubModel.mInstance.web_api_friend_room_stats_data_detail_info(parms).then((res: any) => {
            this.lbl_4.string = `${StringHelper.getStringDiv100(res.data.info.min_buy_in)}-${StringHelper.getStringDiv100(res.data.info.max_buy_in)}`
            this.lbl_5.string = `${StringHelper.getStringDiv100(res.data.info.sb)}/${StringHelper.getStringDiv100(res.data.info.sb * 2)}`
            this.lbl_6.string = res.data.info.fee_ratio / 10 + '%'
            this.lbl_44.string = res.data.info.player_num
            this.lbl_55.string = res.data.info.insurance
            this.lbl_66.string = StringHelper.GetLongString(res.data.info.total_fee)
            this.lbl_staus.string = i18nMgr.Get(this.getStaus(res.data.info.game_status))
            this.lbl_id.string = i18nMgr.Get('UIData_GameID') + this._roomId
            res.data.info.creator_id
            this.lbl_create.string = `${i18nMgr.Get('UIClub_PlanRomList_Creator')}${res.data.info.creator_name}（ID:${res.data.info.creator_id}）`
        })
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(dataDetailItem);
        item.initData(this._list[index], this._order_by);
    }
    scrollingCB = async (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.reqData()
            }
        }
    }
    getStaus(type) {
        let string = ''
        switch (type) {
            case 1:
                string = 'MTT_State_NotStart'
                break;
            case 2:
                string = 'adaptation10186'
                break;
            case 3:
                string = 'Mtt_Complete'
                break;

            default:
                break;
        }
        return string
    }


}
