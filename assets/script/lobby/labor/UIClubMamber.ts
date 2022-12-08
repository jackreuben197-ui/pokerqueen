/*
 * @Author: xfj
 * @Date: 2022-10-26 14:02:25
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-08 17:47:59
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubMamber.ts
 */


import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIClubMamber')
export default class UIClubMamber extends UIBase {
    private lbl_Name: cc.Label = null;
    private img_head: cc.Sprite = null;
    private lbl_id: cc.Label = null;
    _data = null;
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
    }
    addCilck() {

        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `确定添加玩家昵称<color=#3BE1F5"> ${this._data.nick_name} </color>管理员身份？`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    let data: any = await UIClubModel.mInstance.APIOrgClubAddAdmin(this._data.user_id);
                    if (data.code == 0) {
                        UIComponent.Instance.Toast('添加成功');
                        this.post(EventName.refreshAdmin);
                    }
                },
                noAnimation: true,
            });
    }

    // update (dt) {}
}
