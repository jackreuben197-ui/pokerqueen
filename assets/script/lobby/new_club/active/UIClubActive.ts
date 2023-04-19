/*
 * @Author: xfj
 * @Date: 2022-12-28 17:59:15
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-19 13:47:09
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/active/UIClubActive.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import UIComponent from "../../../ui/UIComponent";
import Data from "../../labor/script/Data";
import { UIDefine } from "../../../define/UIDefine";
import { EventName } from "../../../config/EventName";
import TimeHelper from "../../../helper/TimeHelper";
import { UIClubModel } from "../../labor/UIClubModel";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { APIOrgClubNoticeGet, APIOrgClubNotice } from "../../../net/https/WebRequest";
import { i18nMgr } from "../../../i18n/i18nMgr";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubActive')
export default class UIClubActive extends BaseForm {
    @property(cc.EditBox)
    titleEditBox: cc.EditBox = null;
    @property(cc.Label)
    title_Num: cc.Label = null;

    @property(cc.Label)
    text_Num: cc.Label = null;

    @property(cc.EditBox)
    textEditBox: cc.EditBox = null;
    btn_pd_4: cc.Label = null;
    btn_pd_5: cc.Label = null;
    _timeType = '1';
    _start_time: number = 0
    _end_time: number = 0
    // _clickDataItem = null;
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

        this.btn_pd_4 = this.getChildNodeOrComponent("btn_pd_4", cc.Label);
        this.btn_pd_5 = this.getChildNodeOrComponent("btn_pd_5", cc.Label);
        // let began = this.getChildNodeOrComponent("began",);
        // began['_data'] = Data.getInstance().selDate;
        // let end = this.getChildNodeOrComponent("end");
        // end['_data'] = Data.getInstance().selDate;


    }
    setDataLbl(began, end) {
        this._start_time = began;
        this._end_time = end;
        this.btn_pd_4.string = TimeHelper.getMDHMS(began)
        this.btn_pd_5.string = TimeHelper.getMDHMS(end)

    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.comFormTitle.initData('UIGuild_Notice', this);
        await UIClubModel.mInstance.APIOrgClubNoticeGet({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNoticeGet.Response.data;
        this.titleEditBox.string = data?.info?.title || ''
        this.textEditBox.string = data?.info?.content || ''
        if (data?.info?.id) {
            let time = new Date(data?.info.end_time).getTime()
            if (time < TimeHelper.toDayBaganTime) {
                this.setDataLbl(TimeHelper.toDayBaganTime, TimeHelper.toDayEndTime);
            }
            else {
                this.setDataLbl(new Date(data?.info.start_time).getTime(), time);
            }
        } else {
            this.setDataLbl(TimeHelper.toDayBaganTime, TimeHelper.toDayEndTime);
        }
        this.editChange();
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        // this.listen(EventName.refresh_Btn_Data, this.chaneData)
    }
    editChange() {
        this.title_Num.string = `${this.titleEditBox.string.length}/30`
        this.text_Num.string = `${this.textEditBox.string.length}/300`
    }

    chaneData(dayTime) {
        // let _d = Data.getInstance().selDate
        let _d1 = dayTime.getTime();
        if (this._timeType == '1') {
            if (_d1 < TimeHelper.toDayBaganTime) {
                this.setDataLbl(TimeHelper.toDayBaganTime, this._end_time)
            } else {
                this.setDataLbl(_d1, this._end_time)
            }
            if (_d1 > this._end_time) {
                this.setDataLbl(_d1, _d1 + 24 * 60 * 60 * 1000 - 1)
            }

        } else {
            // if (_d1 > TimeHelper.toDayEndTime) {
            //     this.setDataLbl(this._start_time, TimeHelper.toDayEndTime)
            // } else {
            //     this.setDataLbl(this._start_time, _d1 + 24 * 60 * 60 * 1000 - 1)
            // }
            if (_d1 > this._start_time && _d1 >= TimeHelper.toDayBaganTime) {
                this.setDataLbl(this._start_time, _d1 + 24 * 60 * 60 * 1000 - 1)
            }
        }
    }
    openCalendar(event, customData) {
        this._timeType = customData
        // this._clickDataItem = event.target
        // UIComponent.open(UIDefine.UICalendar)
        UIComponent.open(UIDefine.calendarCommpent, { cb: this.chaneData.bind(this) })

    }
    async saveClick() {
        let began = this.getChildNodeOrComponent("began",);
        let end = this.getChildNodeOrComponent("end");

        this.titleEditBox.string = this.titleEditBox.string.trim()
        if (this.titleEditBox.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIGuild_NoticeTitleInput'))
            return
        }
        this.textEditBox.string = this.textEditBox.string.trim()
        if (this.textEditBox.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIGuild_NoticeContentInput'))
            return
        }
        // let now = new Date();
        // let year = now.getFullYear();
        // let month = now.getMonth();
        // let day = now.getDate();
        // let currenTime = new Date(year, month, day).getTime();
        // if (began['_data'].getTime() < currenTime) {
        //     UIComponent.Instance.Toast('开始时间不得小于当前时间')
        //     return;
        // }
        // if (began['_data'].getTime() > end['_data'].getTime()) {
        //     UIComponent.Instance.Toast('开始时间不得大于结束时间')
        //     return;
        // }
        // await UIClubModel.mInstance.APIOrgClubNotice({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNoticeGet.Response.data;

        let parms = {
            "club_id": ClubCache.club_id,

            "title": this.titleEditBox.string,

            "content": this.textEditBox.string,

            "start_time": Math.ceil(this._start_time / 1000),

            "end_time": Math.ceil(this._end_time / 1000)
        }
        if (data?.info?.id) {
            parms['id'] = data?.info?.id
        }

        await UIClubModel.mInstance.APIOrgClubNotice_update(parms)
        this.close();
    }
}
