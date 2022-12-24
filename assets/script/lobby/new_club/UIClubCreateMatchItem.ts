/*
 * @Author: xfj
 * @Date: 2022-12-24 11:05:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-24 12:27:19
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubCreateMatchItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "../labor/UIClubModel";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubCreateMatchItem')
export default class UIClubCreateMatchItem extends UIBase {
    item_choose: cc.Node
    labelNode: cc.Node
    btnNode: cc.Node
    Toggle: cc.Toggle
    Rectang: cc.Node
    reduceButton: cc.Button
    addButton: cc.Button
    lbl_level: cc.Label

    _currentNum = 0;
    _maxNum = 10;
    _data = null;

    protected lateLoad(): void {
        super.lateLoad();
        // UIClubModel.mInstance.APIOrgGetRoomConfig()

        this.item_choose = this.getChildNodeOrComponent("item_choose");
        this.labelNode = this.getChildNodeOrComponent("labelNode");
        this.btnNode = this.getChildNodeOrComponent("btnNode");
        this.Toggle = this.getChildNodeOrComponent("Toggle", cc.Toggle);
        this.Rectang = this.getChildNodeOrComponent("Rectang");
        this.reduceButton = this.getChildNodeOrComponent("reduce", cc.Button);
        this.addButton = this.getChildNodeOrComponent("add", cc.Button);
        this.lbl_level = this.getChildNodeOrComponent("lbl_level", cc.Label);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);

    }
    initData(data) {
        this._data = data;
        this._currentNum = 0;
        this.ToggleClick()
        this.setState();
    }
    ToggleClick() {
        this.btnNode.active = !this.Toggle.isChecked
        this.Rectang.active = this.Toggle.isChecked
    }
    addClick() {
        this._currentNum++
        this.setState();
    }
    reduceClick() {
        this._currentNum--;
        this.setState();
    }
    setState() {
        this.reduceButton.interactable = this._currentNum > 0
        this.addButton.interactable = this._currentNum < this._maxNum
        this.lbl_level.string = this._currentNum + '';

    }
    editModel() {
        UIComponent
        UIDefine
        UIComponent.open(UIDefine.UICreateMatch, this._data);
    }
    delateModel() {
        UIDialogComponent
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `确定删除模版 ${this._data.name} `,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    await UIClubModel.mInstance.APIOrgTemplateDelete(this._data.id)

                },
                noAnimation: true,
            });
    }

}
