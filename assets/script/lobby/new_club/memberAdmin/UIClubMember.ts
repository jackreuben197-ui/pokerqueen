/*
 * @Author: xfj
 * @Date: 2022-12-22 13:13:05
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-15 11:50:01
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
import { memberRoleConfig } from "../../../frame/data/rate/RateConfig";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import { APIOrgClubUserInfo, APIOrgClubUserRole_change, Web_User_Info } from "../../../net/https/WebRequest";
import { ClubUserDataCache } from "../../../frame/data/club/ClubUserDataCache";
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
    panel_down: cc.Node = null;
    _info = null;
    _dataType = 0;
    _dateType = 0;

    _sort_type: number = 1
    _order_type: number = 1
    _dropDownBox: cc.Node = null;
    _flag = true;  //会长或者是本人
    _agent_random_id = 0; //贵宾
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.messNode = this.getChildNodeOrComponent('messNode')
        this.panel_up = this.getChildNodeOrComponent('panel_up')
        this.panel_mid = this.getChildNodeOrComponent('panel_mid')
        this.panel_vip = this.getChildNodeOrComponent('panel_vip')
        this.panel_vipMan = this.getChildNodeOrComponent('panel_vipMan')
        this.panel_down = this.getChildNodeOrComponent('panel_down')

        this._dropDownBox = cc.instantiate(this.dropDownBox);
        let Rectangle = this.panel_mid.getChildByName('panel_role')
        this._dropDownBox.parent = Rectangle
        this._dropDownBox.position = cc.v3(352, 50, 0);
        this._dropDownBox.width = 400
    }
    selectSort(data) {
        this._sort_type = data.model
        // this._order_type = data.type
        // if (this._sort_type == this._info.info.user_level) return
        this.requestData();
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
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.comFormTitle.initData('UIClub_xxzl', this);
        this._info = param;
        if (this._info == null) {
            return;
        }
        this._agent_random_id = param.agent_random_id
        this._flag = this._info.info.user_level != 1 || this._info.info.user_info.random_id != Web_User_Info.Response.data.user.un_id
        this._dropDownBox.getComponent('dropDownBox').initData(memberRoleConfig, this.selectSort.bind(this), this._flag)
        this.initTop()
        this.initPanel_mid()
        this.initVip();
    }

    initTop() {

        let icon = cc.find('iconMask/icon', this.messNode)
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._info.info.user_info.avatar)
        cc.find('messLayout/nameNode/name', this.messNode).getComponent(cc.Label).string = this._info.info.user_info.nickname;
        cc.find('messLayout/id', this.messNode).getComponent(cc.Label).string = 'ID:' + this._info.info.user_info.random_id;
        cc.find('messLayout/lbl_addTime', this.messNode).getComponent(cc.Label).string = "加入时间: " + TimeHelper.convertUTCTimeToLocalTime(this._info.info.create_time);

        cc.find('people/data', this.messNode).getComponent(cc.Label).string = StringHelper.GetLongString(this._info.info.user_info.gold);
        cc.find('table/data', this.messNode).getComponent(cc.Label).string = StringHelper.GetLongString(this._info.info.user_info.usdt);
        let hg = cc.find('messLayout/nameNode/hg', this.messNode)
        hg.active = true;
        ClubCache.setRoleType(hg, this._info.info.user_level);
        let name = ClubCache.getRoleName(this._info.info.user_level)
        this._dropDownBox.getComponent('dropDownBox').initSortData({ type: 0, desc: name })

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

    }
    initTypeTabBtns(index) {
        this._dataType = index
        let panel_type = this.panel_mid.getChildByName('panel_type')
        panel_type.children.forEach((item, _index) => {
            item.opacity = 76
            if (index == _index) {
                item.opacity = 255
            }
        })
    }
    initDateTabBtns(index) {
        this._dateType = index
        let panel_date = this.panel_mid.getChildByName('panel_date')
        panel_date.children.forEach((item, _index) => {
            item.color = cc.color().fromHEX('#FFFFFF')
            item.getChildByName('img_line').active = false
            if (index == _index) {
                item.color = cc.color().fromHEX('#35A3B3')
                item.getChildByName('img_line').active = true
            }
        })
    }
    onClickTypeTabBtns(index) {
        this.initTypeTabBtns(index)
        this.reqDataInfo()
    }
    onClickDateTabBtns(index) {
        this.initDateTabBtns(index)
        this.reqDataInfo()
    }
    reqDataInfo() {
        let info: any = {
            club_id: ClubCache.club_id,
            user_id: this._info.info.user_info.user_id,
            game_type: this._dateType,       //游戏类型0-all,1-NLH，2-PLO，3-6+
            time_type: (this._dateType + 1),      //时间类型1-今日, 2-7天, 3-30天, 4-生涯,5-选择时间
            time_long: new Date().getTime(),       //客户端时间戳
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
        for (let i = 1; i < 7; i++) {
            let btn_pt_1: cc.Node = this.getChildNodeOrComponent("pi_" + i);
            let lbl = btn_pt_1.getChildByName("lbl").getComponent(cc.Label);
            let label = btn_pt_1.getComponent(cc.Label);
            let room_data = data?.data?.data;
            if (!room_data) return
            //普通
            if (i == 1) {
                label.string = room_data.total_game_cnt
            } else if (i == 2) {
                label.string = room_data.total_hand
            } else if (i == 3) {
                label.string = StringHelper.DivFloat(room_data.recharge_gold_total);
            }
            else if (i == 4) {
                label.string = StringHelper.DivFloat(room_data.recharge_gold_total);
            } else if (i == 5) {
                label.string = StringHelper.DivFloat(room_data.withdraw_gold_total);
            } else if (i == 6) {
                label.string = StringHelper.DivFloat(room_data.withdraw_gold_total);
            }
        }
    }

    onClickBtn(event) {
        let node = event.target;
        let index = node.index;

        let title = "";
        let content = "";
        if (index == 1) {
            // 冻结
            title = "冻结";
            content = "确定冻结 " + this._info.info.user_info.nickname + "?";
        } else if (index == 3) {
            // 解冻
            title = "解冻";
            content = "确定解冻 " + this._info.info.user_info.nickname + "?";
        } else if (index == 2) {
            // 删除
            title = "删除";
            content = "确定删除 " + this._info.info.user_info.nickname + "?";
        }
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: title,
            content: content,
            contentCommit: "确定",
            contentCancel: "取消",
            actionCommit: () => {
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
            noAnimation: true,
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
        // this._info.info.agent_user_id
        if (this._agent_random_id > 0) {
            noHave.active = false
            haveData.active = true
            cc.find('messLayout/name', haveData).getComponent(cc.Label).string = ''
            cc.find('messLayout/id', haveData).getComponent(cc.Label).string = 'ID: ' + this._agent_random_id //this._info.info.agent_user_id
            let icon = cc.find('iconRole/icon', haveData)
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), '');
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
                UIComponent.open(UIDefine.UIClubVipManage, { user_id: this._info.info.user_info.user_id });
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
