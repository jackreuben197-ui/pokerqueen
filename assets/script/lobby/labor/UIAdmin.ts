/*
 * @Author: xfj
 * @Date: 2022-10-26 14:02:25
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-26 15:30:35
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIAdmin.ts
 */


import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

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
        WebImageHelper.SetUrlImage(this.img_head, this._data.avatar)
    }
    auditCilck() {
        this.qxState = !this.qxState
        this.btn_audit.getChildByName('open').active = this.qxState;
        this.btn_audit.getChildByName('close').active = !this.qxState;
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

                },
                noAnimation: true,
            });
    }

    // update (dt) {}
}
