/*
 * @Author: xfj
 * @Date: 2022-12-28 17:59:15
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-23 20:16:09
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
import { APIOrgClubNotice } from "../../../net/https/WebRequest";
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

    _clickDataItem = null;
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

        let btn_pd_1: cc.Node = this.getChildNodeOrComponent("btn_pd_4");
        btn_pd_1.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', true, false)

        let btn_pd_2: cc.Node = this.getChildNodeOrComponent("btn_pd_5");
        btn_pd_2.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', true, false)
        let began = this.getChildNodeOrComponent("began",);
        began['_data'] = Data.getInstance().selDate;
        let end = this.getChildNodeOrComponent("end");
        end['_data'] = Data.getInstance().selDate;

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.comFormTitle.initData('UIGuild_Notice', this);
        await UIClubModel.mInstance.APIOrgClubNotice({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNotice.Response.data;
        this.titleEditBox.string = data?.info?.title
        this.textEditBox.string = data?.info?.content
        this.editChange();
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refresh_Btn_Data, this.chaneData)
    }
    editChange() {
        this.title_Num.string = `${this.titleEditBox.string.length}/30`
        this.text_Num.string = `${this.textEditBox.string.length}/300`
    }

    chaneData() {
        this._clickDataItem['_data'] = Data.getInstance().selDate;
        this._clickDataItem.children[1].getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', true, false)
    }
    openCalendar(event, customData) {
        this._clickDataItem = event.target
        UIComponent.open(UIDefine.UICalendar)
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
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let currenTime = new Date(year, month, day).getTime();
        if (began['_data'].getTime() < currenTime) {
            UIComponent.Instance.Toast('开始时间不得小于当前时间')
            return;
        }
        if (began['_data'].getTime() > end['_data'].getTime()) {
            UIComponent.Instance.Toast('开始时间不得大于结束时间')
            return;
        }
        // await UIClubModel.mInstance.APIOrgClubNotice({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNotice.Response.data;

        let parms = {
            "club_id": ClubCache.club_id,

            "title": this.titleEditBox.string,

            "content": this.textEditBox.string,

            "start_time": end['_data'].getTime() / 1000,

            "end_time": end['_data'].getTime() / 1000
        }
        if (data?.info?.id) {
            parms['id'] = data?.info?.id
        }

        await UIClubModel.mInstance.APIOrgClubNotice_update(parms)
        this.close();
    }
}
