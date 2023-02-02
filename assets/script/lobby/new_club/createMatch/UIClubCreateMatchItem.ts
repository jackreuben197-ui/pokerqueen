/*
 * @Author: xfj
 * @Date: 2022-12-24 11:05:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-02 11:41:31
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIClubCreateMatchItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { prototype } from "events";
import { UIDefine } from "../../../define/UIDefine";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubCreateMatchItem')
export default class UIClubCreateMatchItem extends UIBase {
    @property(cc.Node)
    item_choose: cc.Node = null;
    @property(cc.Node)
    labelNode: cc.Node = null;
    @property(cc.Node)
    btnNode: cc.Node = null;
    @property(cc.Toggle)
    Toggle: cc.Toggle = null;
    @property(cc.Node)
    Rectang: cc.Node = null;
    @property(cc.Button)
    reduceButton: cc.Button = null;
    @property(cc.Button)
    addButton: cc.Button = null;
    @property(cc.Label)
    lbl_level: cc.Label = null;

    _currentNum = 1;
    _maxNum = 10;
    _data = null;
    _delegate = null;

    protected lateLoad(): void {
        super.lateLoad();
        // UIClubModel.mInstance.APIOrgGetRoomConfig()

        // this.item_choose = this.getChildNodeOrComponent("item_choose");
        // this.labelNode = this.getChildNodeOrComponent("labelNode");
        // this.btnNode = this.getChildNodeOrComponent("btnNode");
        // this.Toggle = this.getChildNodeOrComponent("Toggle", cc.Toggle);
        // this.Rectang = this.getChildNodeOrComponent("Rectang");
        // this.reduceButton = this.getChildNodeOrComponent("reduce", cc.Button);
        // this.addButton = this.getChildNodeOrComponent("add", cc.Button);
        // this.lbl_level = this.getChildNodeOrComponent("lbl_level", cc.Label);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);

    }
    initData(data, target) {
        this._data = data;
        this._delegate = target;
        this._currentNum = 1;
        this.ToggleClick()
        this.setState();

        let lbl_center_left = this.labelNode.getChildByName('lbl_center_left').getComponent(cc.Label)
        let lbl_deskName = this.labelNode.getChildByName('lbl_deskName').getComponent(cc.Label)
        let lbl_time = cc.find('data_label/img_time/lbl_time', this.labelNode).getComponent(cc.Label)
        let lbl_num = cc.find('data_label/img_num/lbl_num', this.labelNode).getComponent(cc.Label)
        let sb = this._data.sb / 100;
        lbl_center_left.string = `${sb}/${sb * 2}（${this._data.ante}）`
        lbl_deskName.string = '模版名称: ' + this._data.name
        lbl_time.string = this._data.play_duration / 3600 + 'h'
        lbl_num.string = this._data.seat_count
        let lbl_gameType = cc.find('item_choose/lbl_gameType', this.node).getComponent(cc.Label);
        lbl_gameType.string = this.gameTypeName
        let Rectangle = cc.find('item_choose/Rectangle', this.node)
        Rectangle.active = this._data.share_table == 2
        let vector = lbl_center_left.node.getChildByName('Vector1');
        vector.active = this._data.private_room == 1

    }
    get gameTypeName() {
        let str = "NLH";
        if (this._data.game_type == 1) {
            str = "PLO4";
        } else if (this._data.game_type == 2) {
            str = "PLO5";
        } else if (this._data.game_type == 3) {
            str = "PLO6";
        } else if (this._data.poker_type == 2) {
            str = "6+";
        }
        return str;
    }
    ToggleClick() {
        this.btnNode.active = !this.Toggle.isChecked
        this.Rectang.active = this.Toggle.isChecked
        this._delegate.dealItemSelect()
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
        this.reduceButton.interactable = this._currentNum > 1
        this.addButton.interactable = this._currentNum < this._maxNum
        this.lbl_level.string = this._currentNum + '';
        this.node['_modelData'] = { template_id: this._data.id, count: this._currentNum }
        this._delegate.dealItemSelect()
    }
    editModel() {
        UIComponent.open(UIDefine.UIClubCreateMatch, this._data);
    }
    delateModel() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `确定删除模版 ${this._data.name} `,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    this.node.active = false;
                    await UIClubModel.mInstance.APIOrgTemplateDelete(this._data.id)


                },
                noAnimation: true,
            });
    }

}
