/*
 * @Author: xfj
 * @Date: 2022-12-22 13:13:05
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-10 10:41:55
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/memberAdmin/UIClubMember.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../../ui/form/BaseForm";
import ComFormTitle from "../../../common/ComFormTitle";
import WebImageHelper from "../../../helper/WebImageHelper";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import UIComponent from "../../../ui/UIComponent";
import { UIDefine } from "../../../define/UIDefine";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";
import { EventName } from "../../../config/EventName";
import { memberRoleConfig, roleSortConfig } from "../../../frame/data/rate/RateConfig";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import { APIOrgClubUserInfo, APIOrgClubUserRole_change, Web_User_Info } from "../../../net/https/WebRequest";
import { ClubUserDataCache } from "../../../frame/data/club/ClubUserDataCache";
import Data from "../../labor/script/Data";
import { UISuperDialogType } from "../../../ui/dialog/UISuperDialog";
import { CPErrorCode } from "../../../i18n/CPErrorCode";
import { i18nMgr } from "../../../i18n/i18nMgr";
const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIClubMember')
export default class UIClubMember extends BaseForm {
    @property(cc.EditBox)
    editName: cc.EditBox = null;
    @property(cc.EditBox)
    editjieshao: cc.EditBox = null;
    private comFormTitle: ComFormTitle = null;
    @property(cc.Prefab)
    dropDownBox: cc.Prefab = null;

    messNode: cc.Node = null;
    panel_up: cc.Node = null;
    panel_mid: cc.Node = null;
    panel_vip: cc.Node = null;
    panel_vipMan: cc.Node = null;
    caulate: cc.Node = null;
    panel_down: cc.Node = null;
    dropNode_lbl: cc.Label
    btn_pd_4: cc.Label = null;
    btn_pd_5: cc.Label = null;
    _info = null;
    _gameType = 0;
    _dateType = 0;

    _sort_type: number = 1
    _order_type: number = 1
    _flag = true;  //会长或者是本人
    // _agent_random_id = 0; //贵宾
    _selectType = 0;
    _clickDataItem = null;
    _start_time: number = 0
    _end_time: number = 0
    _timeType = '1';
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.messNode = this.getChildNodeOrComponent('messNode')
        this.panel_up = this.getChildNodeOrComponent('panel_up')
        this.panel_mid = this.getChildNodeOrComponent('panel_mid')
        this.panel_vip = this.getChildNodeOrComponent('panel_vip')
        this.panel_vipMan = this.getChildNodeOrComponent('panel_vipMan')
        this.panel_down = this.getChildNodeOrComponent('panel_down')
        this.dropNode_lbl = this.getChildNodeOrComponent("dropNode_lbl", cc.Label);
        this.caulate = this.getChildNodeOrComponent('caulate')
        this.btn_pd_4 = this.getChildNodeOrComponent("btn_pd_4", cc.Label);
        this.btn_pd_5 = this.getChildNodeOrComponent("btn_pd_5", cc.Label);
    }
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.comFormTitle.initData('UIClub_MlistInfo', this);
        this._info = param;
        if (this._info == null) {
            return;
        }
        this._selectType = this.getMemberRole()
        this.initTop()
        this.setDataLbl(TimeHelper.toDayBaganTime, TimeHelper.toDayEndTime);
        this.initPanel_mid()
        this.initVip();
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        // this.listen(EventName.refresh_Btn_Data, this.chaneData)
        this.listen(EventName.refresh_vip_ui, this.requestData)
    }

    openDropDownBox() {
        if (this._flag) {
            UIComponent.open(UIDefine.dropDownBoxNew, { data: roleSortConfig, index: this._selectType, cb: this.selectSort.bind(this) })
        }
    }
    selectSort(data, index) {
        this._sort_type = data.model
        this._selectType = index
        this.setText(this.dropNode_lbl, data.desc);
        this.requestData();
    }
    initTop() {
        let icon = cc.find('icon', this.messNode)
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._info.info.user_info.avatar)
        cc.find('messLayout/nameNode/name', this.messNode).getComponent(cc.Label).string = this._info.info.user_info.nickname;
        cc.find('messLayout/id', this.messNode).getComponent(cc.Label).string = 'ID:' + this._info.info.user_info.random_id;
        cc.find('lbl_addTime', this.messNode).getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(this._info.info.create_time);
        let hg = cc.find('messLayout/nameNode/hg', this.messNode)
        hg.active = true;
        ClubCache.setRoleType(hg, this._info.info.user_level);
        let name = ClubCache.getRoleName(this._info.info.user_level)
        this.setText(this.dropNode_lbl, name);
        let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
        let btn_3: cc.Node = this.getChildNodeOrComponent("btn_3");
        if (this._info.info.user_info.forbidden) {
            //冻结
            btn_1.active = false;
            btn_3.active = true;
        } else {
            btn_1.active = true;
            btn_3.active = false;
        }
        for (let i = 1; i < 4; i++) {
            let btn_1: cc.Node = this.getChildNodeOrComponent("btn_" + i);
            btn_1["index"] = i;
            btn_1.on(cc.Node.EventType.TOUCH_END, this.onClickBtn, this)
        }
        this.editName.string = this._info.info.remark_name
        this.editjieshao.string = this._info.info.remark_desc
    }


    async requestData() {
        let parms = {
            club_id: ClubCache.club_id,
            user_id: this._info.info.user_info.user_id,
            "user_level": this._sort_type  //用户等级 0 普通 1会长  3管理员 4代理
        }
        await UIClubModel.mInstance.APIOrgClubUserRole_change(parms);
        await UIClubModel.mInstance.APIOrgClubUserInfo({
            "user_id": this._info.info.user_info.user_id,
            "club_id": ClubCache.club_id,
        })
        this.post(EventName.requestClubMemList);
        let data: any = APIOrgClubUserInfo.Response.data
        ClubUserDataCache.setUserData(data);
        this._info = { info: data };
        this.initTop()
        this.initPanel_mid()
        this.initVip();
    }
    getMemberRole() {
        for (let index = 0; index < roleSortConfig.length; index++) {
            const element = roleSortConfig[index];
            if (element.model == this._info.info.user_level) {
                return index
            }
        }
    }

    initPanel_mid() {
        let panel_type = this.panel_mid.getChildByName('panel_type')
        panel_type.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTypeTabBtns, index);
        })
        let panel_date = this.panel_mid.getChildByName('panel_date')
        panel_date.children.forEach((item, index) => {
            this.bindClick(item, this.onClickDateTabBtns, index);
        })
        this.initDateTabBtns(0);
        this.initTypeTabBtns(0);
        this.reqDataInfo();
        // this.initCaulate();
    }
    // initCaulate() {
    //     let btn_pd_1: cc.Node = this.getChildNodeOrComponent("btn_pd_4");
    //     btn_pd_1.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', true, false)

    //     let btn_pd_2: cc.Node = this.getChildNodeOrComponent("btn_pd_5");
    //     btn_pd_2.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', true, false)
    //     let began = this.getChildNodeOrComponent("began",);
    //     began['_data'] = Data.getInstance().selDate;
    //     let end = this.getChildNodeOrComponent("end");
    //     end['_data'] = Data.getInstance().selDate;

    // }
    // chaneData() {
    //     this._clickDataItem['_data'] = Data.getInstance().selDate;
    //     this._clickDataItem.children[1].getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(Data.getInstance().selDate, '/', true, false)
    //     this.reqDataInfo()
    // }
    // openCalendar(event, customData) {
    //     this._clickDataItem = event.target
    //     UIComponent.open(UIDefine.UICalendar)

    // }

    setDataLbl(began, end) {
        this._start_time = began;
        this._end_time = end;
        this.btn_pd_4.string = TimeHelper.getMDHMS(began)
        this.btn_pd_5.string = TimeHelper.getMDHMS(end)
        this.reqDataInfo()

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



    initTypeTabBtns(index) {
        this._gameType = index
        let panel_type = this.panel_mid.getChildByName('panel_type')
        panel_type.children.forEach((item, _index) => {
            item.getChildByName('lbl').color = cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = false
            if (index == _index) {
                item.getChildByName('lbl').color = cc.color().fromHEX('#EEF5FF')
                item.getChildByName('block').active = true
            }
        })
    }
    initDateTabBtns(index) {
        this._dateType = index
        let panel_date = this.panel_mid.getChildByName('panel_date')
        panel_date.children.forEach((item, _index) => {
            item.getChildByName('btn_pd_1').color = cc.color().fromHEX('#757CAB')
            item.getChildByName('Rectangle').active = false
            if (index == _index) {
                item.getChildByName('btn_pd_1').color = cc.color().fromHEX('#EEF5FF')
                item.getChildByName('Rectangle').active = true
            }
        })
    }
    onClickTypeTabBtns(index) {
        this.initTypeTabBtns(index)
        this.reqDataInfo()
    }
    onClickDateTabBtns(index) {
        this.initDateTabBtns(index)
        if (index == 2) {
            this._dateType = 4
            this.caulate.active = true
        } else {
            this.caulate.active = false
            this.reqDataInfo()
        }
    }
    reqDataInfo() {
        let info: any = {
            club_id: ClubCache.club_id,
            user_id: this._info.info.user_info.user_id,
            game_type: this._gameType,       //游戏类型0-all,1-NLH，2-PLO，3-6+
            time_type: (this._dateType + 1),      //时间类型1-今日, 2-7天, 3-30天, 4-生涯,5-选择时间
            time_long: new Date().getTime(),       //客户端时间戳
        }
        if (this._dateType == 4) {
            // let began = this.getChildNodeOrComponent("began",);
            // let end = this.getChildNodeOrComponent("end");
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
            info["start_time"] = Math.ceil(this._start_time / 1000);
            info["end_time"] = Math.ceil(this._end_time / 1000)
        }

        UIClubModel.mInstance.APIOrgClubUserGameInfo(info).then(
            (res) => {
                this.refreshUpUI(res);
            },
            (res) => {
            }
        )
    }
    refreshUpUI(data) {
        for (let i = 1; i < 5; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let label = btn_pt_1.getComponent(cc.Label);
            let room_data = data?.data?.data;
            if (!room_data) return
            //普通
            if (i == 1) {
                label.string = room_data.total_game_cnt
            } else if (i == 3) {
                label.string = room_data.total_hand
            } else if (i == 2) {
                label.string = StringHelper.DivFloat(room_data.recharge_gold_total);
            }
            else if (i == 4) {
                label.string = StringHelper.DivFloat(room_data.withdraw_gold_total);
            }
        }
    }

    onClickBtn(event) {
        let node = event.target;
        let index = node.index;

        let title = "";
        let content = "";
        let id = `( ID:${this._info.info.user_info.random_id} )`
        if (index == 1) {
            // 冻结
            title = i18nMgr.Get("OpCodeString_LOCK")
            //content = "确定冻结 " + this._info.info.user_info.nickname + "?";
            content = StringHelper.Format(i18nMgr.Get("UIClub_DJTip6"), [this._info.info.user_info.nickname, id])

        } else if (index == 3) {
            // 解冻
            title = i18nMgr.Get("OpCodeString_UNLOCK")
            content = StringHelper.Format(i18nMgr.Get("UIClub_DJTip7"), [this._info.info.user_info.nickname, id])
        } else if (index == 2) {
            // 删除
            title = i18nMgr.Get("UIClub_DeleteSomeone")
            content = StringHelper.Format(i18nMgr.Get("UIGuild_MemberDetails_Delete"), [this._info.info.user_info.nickname])
        }

        UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
            this: this,
            title: title,
            content: content,
            commit: CPErrorCode.LanguageDescription(10012),
            cancel: CPErrorCode.LanguageDescription(10013),
            commit_click: () => {
                let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
                let btn_3: cc.Node = this.getChildNodeOrComponent("btn_3");
                if (index == 1) {
                    // 冻结
                    let info = {
                        user_id: this._info.info.user_info.user_id,
                        club_id: ClubCache.club_id,
                    }
                    LobbyControl.getInstance().reqClubLockUser(info).then(
                        (res) => {
                            //冻结
                            this.post(EventName.requestClubMemList);
                            btn_1.active = false;
                            btn_3.active = true;
                        },
                        (res) => {
                        }
                    )
                } else if (index == 3) {
                    // 解冻
                    let info = {
                        user_id: this._info.info.user_info.user_id,
                        club_id: ClubCache.club_id,
                    }
                    LobbyControl.getInstance().reqClubUnlockUser(info).then(
                        (res) => {
                            //解冻
                            this.post(EventName.requestClubMemList);
                            btn_1.active = true;
                            btn_3.active = false;
                        },
                        (res) => {
                        }
                    )
                } else if (index == 2) {
                    // 删除
                    let info = {
                        user_id: this._info.info.user_info.user_id,
                        club_id: ClubCache.club_id,
                    }
                    LobbyControl.getInstance().reqClubDeleleUser(info).then(
                        (res) => {
                            this.post(EventName.requestClubMemList);
                            this.close();
                        },
                        (res) => {
                        }
                    )
                }
            },
        });
    }
    async editNameCb() {
        this.editName.string = this.editName.string.trim()
        if (this.editName.string == '') return
        let parms = {
            "user_id": this._info.info.user_info.user_id,
            "club_id": ClubCache.club_id,
            "remark_name": this.editName.string,
        }

        await UIClubModel.mInstance.APIOrgClubUserRemarks(parms)
        this.post(EventName.requestClubMemList);
    }
    async editjieshaoCb() {
        this.editjieshao.string = this.editjieshao.string.trim()
        if (this.editjieshao.string == '') return
        let parms = {
            "user_id": this._info.info.user_info.user_id,
            "club_id": ClubCache.club_id,
            // "remark_name": this.editName.string,
            "remark_desc": this.editjieshao.string
        }

        await UIClubModel.mInstance.APIOrgClubUserRemarks(parms)
        this.post(EventName.requestClubMemList);
    }


    initVip() {
        // this.panel_vip.active = false
        // this.panel_vipMan.active = false
        this.panel_down.active = this._flag;
        if (this._info.info.user_level == 4) {
            this.panel_vip.active = false
            this.panel_vipMan.active = true
            this.initPanel_vipMan()
        } else {
            this.panel_vip.active = true
            this.panel_vipMan.active = false
            this.initPanel_vip()
        }
    }

    initPanel_vip() {
        let noHave = this.panel_vip.getChildByName('noHave');
        let haveData = this.panel_vip.getChildByName('haveData');
        //有没有上线
        // invitation_code

        if (this._info.info.agent_user_id > 0) {
            noHave.active = false
            haveData.active = true
            UIClubModel.mInstance.APIOrgClubUserInfo({
                "user_id": this._info.info.agent_user_id,
                "club_id": ClubCache.club_id
            }).then(
                (res: any) => {
                    cc.find('messLayout/name', haveData).getComponent(cc.Label).string = res.data.user_info.nickname
                    cc.find('messLayout/id', haveData).getComponent(cc.Label).string = 'ID: ' + res.data.user_info.random_id //this._info.info.agent_user_id
                    let icon = cc.find('icon', haveData)
                    WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), res.data.user_info.avatar);
                },
                (res) => {

                }
            )


        }
        else {
            noHave.active = true
            haveData.active = false
        }
    }
    async initPanel_vipMan() {
        let Rectangle1 = this.panel_vipMan.getChildByName('Rectangle1');
        let vip_tip = cc.find('noHave/Group/vip_tip', Rectangle1)
        vip_tip.getComponent(cc.Label).string = 3 + '';

    }


    //按钮点击事件

    btnclick(event, customdata) {
        let key = Number(customdata)
        switch (key) {
            case 1:
                //绑定贵宾
                UIComponent.open(UIDefine.UIAgentLink, { user_id: this._info.info.user_info.user_id });
                break;
            case 2:
                //解绑贵宾
                if (this._info.info.agent_user_id > 0) {
                    UIComponent.open(UIDefine.UIAgentUnlink, { user: this._info.info.user_info, agent_id: this._info.info.agent_user_id });
                } else {
                    //用户不存在
                    UIComponent.Instance.ToastLanguage("error1107");
                }
                break;
            case 3:
                //下线成员总数
                UIComponent.open(UIDefine.UIClubVipOffline, { user_id: this._info.info.user_info.user_id, from: 0 });
                break;
            case 4:
                //贵宾统计
                UIComponent.open(UIDefine.UIClubVipStatistics, { user: this._info.info.user_info, user_level: this._info.info.user_level });
                break;


            default:
                break;
        }
    }

}
