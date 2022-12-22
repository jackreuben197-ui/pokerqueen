/*
 * @Author: xfj
 * @Date: 2022-12-22 13:13:05
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 17:51:45
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubMember.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import WebImageHelper from "../../helper/WebImageHelper";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { ClubCache } from "../../frame/data/club/ClubCache";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";
import { EventName } from "../../config/EventName";
const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIClubMember')
export default class UIClubMember extends BaseForm {
    @property(cc.EditBox)
    editName: cc.EditBox = null;
    @property(cc.EditBox)
    editjieshao: cc.EditBox = null;
    private comFormTitle: ComFormTitle = null;


    messNode: cc.Node = null;
    panel_up: cc.Node = null;
    panel_mid: cc.Node = null;
    panel_vip: cc.Node = null;
    panel_vipMan: cc.Node = null;
    panel_down: cc.Node = null;
    _info = null;
    _dataType = 0;
    _dateType = 0;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.messNode = this.getChildNodeOrComponent('messNode')
        this.panel_up = this.getChildNodeOrComponent('panel_up')
        this.panel_mid = this.getChildNodeOrComponent('panel_mid')
        this.panel_vip = this.getChildNodeOrComponent('panel_vip')
        this.panel_vipMan = this.getChildNodeOrComponent('panel_vipMan')
        this.panel_down = this.getChildNodeOrComponent('panel_down')
    }
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.comFormTitle.initData('UIClub_xxzl', this);
        this._info = param.info;
        if (this._info == null) {
            return;
        }
        this.initTop()
        this.initPanel_mid()
        this.initVip();
    }

    initTop() {

        let icon = cc.find('iconMask/icon', this.messNode)
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._info.avatar)
        cc.find('messLayout/nameNode/name', this.messNode).getComponent(cc.Label).string = this._info.user_info.nickname;
        cc.find('messLayout/id', this.messNode).getComponent(cc.Label).string = this._info.user_info.random_id;
        cc.find('messLayout/lbl_addTime', this.messNode).getComponent(cc.Label).string = "加入时间: " + TimeHelper.convertUTCTimeToLocalTime(this._info.user_info.user_join_club_time);

        cc.find('people/data', this.messNode).getComponent(cc.Label).string = StringHelper.GetLongString(this._info.user_info.gold);
        cc.find('table/data', this.messNode).getComponent(cc.Label).string = StringHelper.GetLongString(this._info.user_info.usdt);
        let hg = cc.find('messLayout/nameNode/hg', this.messNode)
        hg.active = true;
        ClubCache.setRoleType(hg, this._info.user_level);

        let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
        let btn_3: cc.Node = this.getChildNodeOrComponent("btn_3");
        if (this._info.user_info.forbidden) {
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
        this.editName.string = this._info.user_info.remark_name
        this.editjieshao.string = this._info.user_info.remark_desc
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
        this.onClickDateTabBtns(0);
        this.onClickTypeTabBtns(0);

    }
    onClickTypeTabBtns(index) {
        this._dataType = index
        let panel_type = this.panel_mid.getChildByName('panel_type')
        panel_type.children.forEach((item, _index) => {
            item.opacity = 76
            if (index == _index) {
                item.opacity = 255
            }
        })
    }
    onClickDateTabBtns(index) {
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
    onClickBtn(event) {
        let node = event.target;
        let index = node.index;

        let title = "";
        let content = "";
        if (index == 1) {
            // 冻结
            title = "冻结";
            content = "确定冻结 " + this._info.user_info.nickname + "?";
        } else if (index == 3) {
            // 解冻
            title = "解冻";
            content = "确定解冻 " + this._info.user_info.nickname + "?";
        } else if (index == 2) {
            // 删除
            title = "删除";
            content = "确定删除 " + this._info.user_info.nickname + "?";
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
                        user_id: this._info.user_info.user_id,
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
                        user_id: this._info.user_info.user_id,
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
                        user_id: this._info.user_info.user_id,
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
            "user_id": this._info.user_info.user_id,
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
            "user_id": this._info.user_info.user_id,
            "club_id": ClubCache.club_id,
            // "remark_name": this.editName.string,
            "remark_desc": this.editjieshao.string
        }

        await UIClubModel.mInstance.APIOrgClubUserRemarks(parms)
        this.post(EventName.requestClubMemList);
    }
    initVip() {
        if (this._info.user_level == 0) {
            this.panel_vip.active = true
            this.panel_vipMan.active = false
            this.initPanel_vip()
        } else if (this._info.user_level == 4) {
            this.panel_vip.active = false
            this.panel_vipMan.active = true
            this.initPanel_vipMan()
        }
    }

    initPanel_vip() {
        let noHave = this.panel_vip.getChildByName('noHave');
        let haveData = this.panel_vip.getChildByName('haveData');
        let vip_tip = haveData.getChildByName('vip_tip');
        //有没有上线
        if (1) {
            noHave.active = false
            haveData.active = true
            cc.find('messLayout/name', haveData).getComponent(cc.Label).string = ''
            cc.find('messLayout/id', haveData).getComponent(cc.Label).string = ''
            let icon = cc.find('iconRole/icon', haveData)
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), '');
        }
        else {
            noHave.active = true
            haveData.active = false
        }
        this.bindClick(vip_tip, () => {
            //解绑贵宾
        }, this)

        let vip_tip1 = noHave.getChildByName('vip_tip');
        this.bindClick(vip_tip1, () => {
            //绑定贵宾
        }, this)


    }
    initPanel_vipMan() {
        let Rectangle1 = this.panel_vipMan.getChildByName('Rectangle1');

        let vip_tip = cc.find('noHave/Group/vip_tip', Rectangle1)
        vip_tip.getComponent(cc.Label).string = 3 + '';
        this.bindClick(Rectangle1, () => {
            //下线成员
        }, this)
        let Rectangle2 = this.panel_vipMan.getChildByName('Rectangle2');
        this.bindClick(Rectangle2, () => {
            //贵宾统计
        }, this)
    }


}
