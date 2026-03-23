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
import { careerConfig } from "../../../frame/data/rate/RateConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/dataManger/UIFriendDataMange')
export default class UIFriendDataMange extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    // _dataType: number = 1
    time_range: cc.Node = null;
    timeNode: cc.Node = null;
    btn_pd_4: cc.Label = null;
    btn_pd_5: cc.Label = null;
    dropNode: cc.Node = null;
    dropNode_lbl: cc.Label = null;
    lbl_1: cc.Label = null;
    lbl_4: cc.Label = null;
    lbl_5: cc.Label = null;
    lbl_6: cc.Label = null;
    dataList: List = null;
    _start_time: number = 0
    _end_time: number = 0
    _offset: number = 0;
    _reqing: boolean = false;
    _reqEnd: boolean = false;
    _list: Array<any> = [];
    _total: number = 0
    _timeType = '1';
    noDataTip: cc.Node
    _roomType: number = 1;
    _selectIndex: number = 0;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.time_range = this.getChildNodeOrComponent("time_range");
        this.btn_pd_4 = this.getChildNodeOrComponent("btn_pd_4", cc.Label);
        this.btn_pd_5 = this.getChildNodeOrComponent("btn_pd_5", cc.Label);
        this.lbl_1 = this.getChildNodeOrComponent("lbl_1", cc.Label);
        this.lbl_4 = this.getChildNodeOrComponent("lbl_4", cc.Label);
        this.lbl_5 = this.getChildNodeOrComponent("lbl_5", cc.Label);
        this.lbl_6 = this.getChildNodeOrComponent("lbl_6", cc.Label);
        this.noDataTip = this.getChildNodeOrComponent("noDataTip");
        this.dataList = this.getChildNodeOrComponent("sv_scrow", List);
        this.timeNode = this.getChildNodeOrComponent("timeNode");
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);
        this.dropNode = this.getChildNodeOrComponent("dropNode");


    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.dataList.scrollingCB = this.scrollingCB;
        this.lbl_1.string = i18nMgr.Get('UITexasReport_hand') + '/' + i18nMgr.Get('UIData_YGvXd5iXr_003')
        let title = "UIClub_DataManager"
        this.comFormTitle.initData(title, this)
        this.time_range.position = this.timeNode.getChildByName('time_4').position
        this._roomType = param.type;
        this.dropNode.active = param.type == 2
        this.setText(this.dropNode_lbl, careerConfig[this._selectIndex].desc);
        this.setDataLbl(TimeHelper.toDayBaganTime, TimeHelper.toDayEndTime);

    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        // this.listen(EventName.refresh_Btn_Data, this.chaneData)
    }
    openDropDownBox() {
        UIComponent.open(UIDefine.dropDownBoxNew, { data: careerConfig, index: this._selectIndex, cb: this.selectSort.bind(this) })
    }
    selectSort(data, index) {
        this._selectIndex = index;
        this.setText(this.dropNode_lbl, data.desc);
        this.initUI()
        this.reqDataAgain();
    }

    setDataLbl(began, end) {
        this._start_time = began;
        this._end_time = end;
        this.btn_pd_4.string = TimeHelper.getMDHMS(began)
        this.btn_pd_5.string = TimeHelper.getMDHMS(end)
        this.initUI()
        this.reqDataAgain();

    }
    caucateClick(event, customData) {
        this._timeType = customData
        // UIComponent.open(UIDefine.UICalendar)
        UIComponent.open(UIDefine.calendarCommpent, { cb: this.chaneData.bind(this) })

    }
    chaneData(dayTime) {
        // let _d = Data.getInstance().selDate
        let _d1 = dayTime.getTime();
        if (this._timeType == '1') {
            if (_d1 > this._end_time) {
                this.setDataLbl(this._end_time - 24 * 60 * 60 * 1000 + 1, this._end_time)
            } else {
                this.setDataLbl(_d1, this._end_time)
            }

        } else {
            if (_d1 > TimeHelper.toDayEndTime) {
                this.setDataLbl(this._start_time, TimeHelper.toDayEndTime)
            } else {
                this.setDataLbl(this._start_time, _d1 + 24 * 60 * 60 * 1000 - 1)
            }
            if (_d1 < this._start_time) {
                this.setDataLbl(_d1, _d1 + 24 * 60 * 60 * 1000 - 1)
            }
        }
    }

    dataTypeClick(event, customData) {
        this.time_range.position = event.target.position
        let startTme = TimeHelper.toDayBaganTime
        startTme = TimeHelper.toDayEndTime - Number(customData) * 24 * 60 * 60 * 1000 + 1;
        this.setDataLbl(startTme, TimeHelper.toDayEndTime)
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
            'start_time': this._start_time,
            'end_time': this._end_time,
            'time_long': TimeHelper.Now,
            'limit': 20,
            'offset': this._offset
        }
        if (this._roomType == 1) {
            _data = await UIClubModel.mInstance.WebFriendRoomStatsData(parms)

        } else if (this._roomType == 2) {
            parms['filter_type'] = this._selectIndex + 1
            _data = await UIClubModel.mInstance.WebClubDataStatsData(parms)

        }
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
            'start_time': this._start_time,
            'end_time': this._end_time,
            'time_long': TimeHelper.Now,
        }
        if (this._roomType == 1) {
            UIClubModel.mInstance.WebFriendRoomStatsDataInfo(parms).then((res: any) => {
                this.lbl_4.string = `${res.data.info.hand_num}/${res.data.info.game_num}`
                this.lbl_5.string = StringHelper.GetLongString(res.data.info.profit)
                this.lbl_6.string = StringHelper.GetLongString(res.data.info.fee)
            })
        }
        else if (this._roomType == 2) {
            parms['filter_type'] = this._selectIndex + 1
            UIClubModel.mInstance.WebClubDataStatsDataInfo(parms).then((res: any) => {
                this.lbl_4.string = `${res.data.info.hand_num}/${res.data.info.game_num}`
                this.lbl_5.string = StringHelper.GetLongString(res.data.info.profit)
                this.lbl_6.string = StringHelper.GetLongString(res.data.info.fee)
            })
        }


    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(dataItem);
        item.initData(this._list[index], this._roomType);
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
    initData() { }

}
