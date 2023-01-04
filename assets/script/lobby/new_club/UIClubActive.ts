/*
 * @Author: xfj
 * @Date: 2022-12-28 17:59:15
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-04 17:11:28
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubActive.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import UIComponent from "../../ui/UIComponent";
import Data from "../labor/script/Data";
import { UIDefine } from "../../define/UIDefine";
import { EventName } from "../../config/EventName";
import TimeHelper from "../../helper/TimeHelper";
import { UIClubModel } from "../labor/UIClubModel";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { APIOrgClubNotice } from "../../net/https/WebRequest";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubActive')
export default class UIClubActive extends BaseForm {
    @property(cc.EditBox)
    titleEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    textEditBox: cc.EditBox = null;
    _clickDataItem = null;
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

        let btn_pd_1: cc.Node = this.getChildNodeOrComponent("btn_pd_4");
        btn_pd_1["index"] = 1
        btn_pd_1.getComponent(cc.Label).string = '开始时间'
        btn_pd_1.on(cc.Node.EventType.TOUCH_END, this.openCalendar, this)

        let btn_pd_2: cc.Node = this.getChildNodeOrComponent("btn_pd_5");
        btn_pd_2["index"] = 1
        btn_pd_2.getComponent(cc.Label).string = '结束时间'
        btn_pd_2.on(cc.Node.EventType.TOUCH_END, this.openCalendar, this)

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.comFormTitle.initData('UIClub_ActiveAdmin', this);
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(EventName.refresh_Btn_Data, this.chaneData)
    }

    chaneData() {
        this._clickDataItem['_data'] = Data.getInstance().selDate;
        this._clickDataItem.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', false)
    }
    openCalendar(event, customData) {
        this._clickDataItem = event.target
        UIComponent.open(UIDefine.UICalendar)
    }
    async saveClick() {
        let btn_pd_4 = this.getChildNodeOrComponent("btn_pd_4", cc.Label);
        let btn_pd_5 = this.getChildNodeOrComponent("btn_pd_5", cc.Label);

        this.titleEditBox.string = this.titleEditBox.string.trim()
        if (this.titleEditBox.string == '') {
            UIComponent.Instance.Toast('请输入标题')
            return
        }
        this.textEditBox.string = this.textEditBox.string.trim()
        if (this.textEditBox.string == '') {
            UIComponent.Instance.Toast('请输入正文')
            return
        }
        if (btn_pd_4.string == '开始时间') {
            UIComponent.Instance.Toast('请选择开始时间')
            return;
        }
        if (btn_pd_5.string == '结束时间') {
            UIComponent.Instance.Toast('请选择结束时间')
            return;
        }
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let currenTime = new Date(year, month, day).getTime();
        if (btn_pd_4.node['_data'].getTime() < currenTime) {
            UIComponent.Instance.Toast('开始时间不得小于当前时间')
            return;
        }
        if (btn_pd_4.node['_data'].getTime() > btn_pd_5.node['_data'].getTime()) {
            UIComponent.Instance.Toast('开始时间不得大于结束时间')
            return;
        }
        await UIClubModel.mInstance.APIOrgClubNotice({ "club_id": ClubCache.club_id })
        let data: any = APIOrgClubNotice.Response.data;

        let parms = {
            "club_id": ClubCache.club_id,

            "title": this.titleEditBox.string,

            "content": this.textEditBox.string,

            "start_time": btn_pd_4.node['_data'].getTime() / 1000,

            "end_time": btn_pd_5.node['_data'].getTime() / 1000
        }
        if (data?.info?.id) {
            parms['id'] = data?.info?.id
        }

        await UIClubModel.mInstance.APIOrgClubNotice_update(parms)
        this.close();
    }
}
