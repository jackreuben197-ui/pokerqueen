/*
 * @Author: xfj
 * @Date: 2023-02-02 11:32:22
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-10 14:13:10
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/career/UICareer.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import { careerConfig } from "../../../frame/data/rate/RateConfig";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import { api_stats_user_stats_all } from "../../../net/https/WebRequest";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UICareerModel } from "../../career/UICareerModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UICareer')

export default class UICareer extends UIBase {
    @property(cc.Node)
    contentNode: cc.Node = null;
    // @property(cc.Prefab)
    // dropDownBoxNew: cc.Prefab = null;

    comFormTitle: cc.Label = null;
    lbl_number_1: cc.Label = null;
    lbl_number_2: cc.Label = null;
    lbl_number_3: cc.Label = null;
    lbl_number_4: cc.Label = null;
    lbl_profit_1: cc.Label = null;
    lbl_profit_2: cc.Label = null;
    lbl_profit_3: cc.Label = null;
    lbl_profit_4: cc.Label = null;
    _selectIndex = 0;
    dropNode_lbl: cc.Label = null;
    // _dropDownBox = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", cc.Label);
        this.lbl_number_1 = this.getChildNodeOrComponent("lbl_number_1", cc.Label);
        this.lbl_number_2 = this.getChildNodeOrComponent("lbl_number_2", cc.Label);
        this.lbl_number_3 = this.getChildNodeOrComponent("lbl_number_3", cc.Label);
        this.lbl_number_4 = this.getChildNodeOrComponent("lbl_number_4", cc.Label);
        this.lbl_profit_1 = this.getChildNodeOrComponent("lbl_profit_1", cc.Label);
        this.lbl_profit_2 = this.getChildNodeOrComponent("lbl_profit_2", cc.Label);
        this.lbl_profit_3 = this.getChildNodeOrComponent("lbl_profit_3", cc.Label);
        this.lbl_profit_4 = this.getChildNodeOrComponent("lbl_profit_4", cc.Label);
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);
    }
    openDropDownBox() {
        UIComponent.open(UIDefine.dropDownBoxNew, { data: careerConfig, index: this._selectIndex, cb: this.selectSort.bind(this) })
    }
    selectSort(data, index) {
        this._selectIndex = index;
        this.setText(this.dropNode_lbl, data.desc);
        this.initMiddleData();
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIMine_VIP_dataAll"
        this.setText(this.comFormTitle, title)
        this.setText(this.dropNode_lbl, careerConfig[this._selectIndex].desc);
        this.initMiddleData()
    }
    async initMiddleData() {
        let parm = {
            "game_type": 0,
            "time_type": 0,
            "time_long": TimeHelper.Now,
            filter_type: this._selectIndex + 1
        }
        UICareerModel.mInstance._coinType = this._selectIndex + 1
        await UICareerModel.mInstance.api_stats_user_stats_all(parm);
        let _data = api_stats_user_stats_all.Response.data
        let room_data_total = _data?.room_data_total
        if (!room_data_total) return

        this.lbl_number_1.string = room_data_total?.one_day?.total_game_cnt || 0
        this.lbl_number_2.string = room_data_total?.week_day?.total_game_cnt || 0
        this.lbl_number_3.string = room_data_total?.mon_day?.total_game_cnt || 0
        this.lbl_number_4.string = room_data_total?.all_day?.total_game_cnt || 0



        this.lbl_profit_1.string = (room_data_total?.one_day?.total_earn < 0 ? '' : '+') + StringHelper.GetLongString(room_data_total?.one_day?.total_earn || 0)
        this.setTextColor(this.lbl_profit_1, room_data_total?.one_day?.total_earn < 0 ? '#FF7C7C' : '#B0FFAE')

        this.lbl_profit_2.string = (room_data_total?.week_day?.total_earn < 0 ? '' : '+') + StringHelper.GetLongString(room_data_total?.week_day?.total_earn || 0)
        this.setTextColor(this.lbl_profit_2, room_data_total?.week_day?.total_earn < 0 ? '#FF7C7C' : '#B0FFAE')


        this.lbl_profit_3.string = (room_data_total?.mon_day?.total_earn < 0 ? '' : '+') + StringHelper.GetLongString(room_data_total?.mon_day?.total_earn || 0)
        this.setTextColor(this.lbl_profit_3, room_data_total?.mon_day?.total_earn < 0 ? '#FF7C7C' : '#B0FFAE')

        this.lbl_profit_4.string = (room_data_total?.all_day?.total_earn < 0 ? '' : '+') + StringHelper.GetLongString(room_data_total?.all_day?.total_earn || 0)
        this.setTextColor(this.lbl_profit_4, room_data_total?.all_day?.total_earn < 0 ? '#FF7C7C' : '#B0FFAE')
        this.initScrow(_data.mtt_room_data)
    }
    initScrow(mtt_room_data) {
        for (let index = 0; index < this.contentNode.childrenCount; index++) {
            const element = this.contentNode.children[index];
            let lbl_1 = element.getChildByName('lbl_1').getComponent(cc.Label)
            switch (index) {
                case 0:
                    lbl_1.string = mtt_room_data.play_times
                    break;
                case 1:
                    lbl_1.string = mtt_room_data.win_times
                    break;
                case 2:
                    lbl_1.string = mtt_room_data.frist_times
                    break;
                case 3:
                    lbl_1.string = mtt_room_data.second_times
                    break;
                case 4:
                    lbl_1.string = mtt_room_data.third_times
                    break;
                default:
                    break;
            }
        }

    }
    recordClick() {
        UIComponent.open(UIDefine.UICareerRecord, { coinType: this._selectIndex + 1, type: 0 })
    }
    cardScoreClick() {
        UIComponent.open(UIDefine.UIRecordHands, { type: 1 })
    }

    // update (dt) {}
}
