/*
 * @Author: xfj
 * @Date: 2022-10-26 14:02:25
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-27 16:34:17
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIAdmin.ts
 */


import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAdmin extends UIBase {
    @property(cc.Node)
    btn_audit: cc.Node = null;

    private lbl_Name: cc.Label = null;
    private img_head: cc.Sprite = null;
    private lbl_id: cc.Label = null;
    _data = null;
    qxState = true;
    initData(data) {
        this._data = data
        this.initView();
    }
    lateLoad() {
        super.lateLoad();
        this.lbl_Name = this.getChildNodeOrComponent("name", cc.Label);
        this.lbl_id = this.getChildNodeOrComponent("id", cc.Label);
        this.img_head = this.getChildNodeOrComponent("icon", cc.Sprite);
    }
    initView() {
        this.setText(this.lbl_Name, this._data.nick_name)
        this.setText(this.lbl_id, 'ID: ' + this._data.random_num)
        WebImageHelper.SetHeadImage(this.img_head, this._data.avatar)
        this.qxState = this._data.create_room == 1 ? true : false
        this.btn_audit.getChildByName('open').active = this.qxState;
        this.btn_audit.getChildByName('close').active = !this.qxState;
    }
    auditCilck() {
        this.qxState = !this.qxState
        this.btn_audit.getChildByName('open').active = this.qxState;
        this.btn_audit.getChildByName('close').active = !this.qxState;

        UIClubModel.mInstance.APIOrgClubCreateRoomChange(this._data.user_id, this.qxState ? 1 : 2);

    }
    delCilck() {

        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "",
                content: `确定删除玩家昵称<color=#3BE1F5"> ${this._data.nick_name} </color>管理员身份？`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    let data: any = await UIClubModel.mInstance.APIOrgClubDelAdmin(this._data.user_id);
                    if (data.code == 0) {
                        this.post(EventName.refreshAdmin)
                    }
                },
                noAnimation: true,
            });
    }

    // update (dt) {}
}
