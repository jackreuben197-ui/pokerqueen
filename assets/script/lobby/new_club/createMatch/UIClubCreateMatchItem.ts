/*
 * @Author: xfj
 * @Date: 2022-12-24 11:05:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-26 11:07:12
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
import UINewDialogComponent from "../../../ui/dialog/UINewDialogComponent";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";
import PlayViewItem from "../../view/PlayViewItem";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { StringHelper } from "../../../helper/StringHelper";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubCreateMatchItem')
export default class UIClubCreateMatchItem extends UIBase {
    @property(cc.Node)
    labelNode: cc.Node = null;

    @property(cc.Label)
    lbl_num: cc.Label = null;

    @property(cc.Node)
    Rectangle: cc.Node = null;

    @property(cc.Label)
    gameType: cc.Label = null;

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
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);

    }
    initData(data, target) {
        this._data = data;
        this._delegate = target;
        this._currentNum = 1;
        this.Toggle.isChecked = false
        this.ToggleClick()
        this.setState();

        this.labelNode.getChildByName('lbl_1').getComponent(cc.Label).string = this._data.apply_club_name
        this.labelNode.getChildByName('lbl_4').getComponent(cc.Label).string = 'ID:' + this._data.apply_club_random_id

        let sb = this._data.sb / 100;
        this.labelNode.getChildByName('lbl_1').getComponent(cc.Label).string = `${sb}/${sb * 2}（${this._data.ante}）`
        let lbl_time = this.labelNode.getChildByName('lbl_2')
        this.labelNode.getChildByName('lbl_4').getComponent(cc.Label).string = this._data.name

        let playView = lbl_time.getComponent(PlayViewItem)
        playView.updateNormalItem(this._data.play_duration);


        this.lbl_num.string = this._data.seat_count
        this.setGameType()

        let lock = this.node.getChildByName('lock');
        lock.active = this._data.private_room == 1
        let beSide = this.node.getChildByName('beSide')
        beSide.active = this._data.share_table == 2
        this.labelNode.getChildByName('lbl_1').getComponent(cc.Label)._forceUpdateRenderData()
        let bx = this.labelNode.getChildByName('lbl_1').getChildByName('bx');
        bx.active = this._data.insurance

    }
    setGameType() {
        this.Rectangle.color = cc.color().fromHEX('#57CDDD')
        if (this._data.poker_type == 0) {
            switch (this._data.game_type) {
                case 0:
                    this.gameType.string = 'NLH'
                    this.Rectangle.color = cc.color().fromHEX('#F1BD02')
                    break;
                case 1:
                    this.gameType.string = 'PLO4'
                    break;
                case 2:
                    this.gameType.string = 'PLO5'
                    break;
                case 3:
                    this.gameType.string = 'PLO6'
                    break;

                default:
                    break;
            }
        } else {
            this.gameType.string = '6+'
            this.Rectangle.color = cc.color().fromHEX('#DD5778')
        }

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
        UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent,
            {
                type: UINewDialogComponent.DialogType.CommitCancel,
                title: "UIGuild_TipsTitle",
                content: StringHelper.Format(i18nMgr.Get("UIGuild_DeleteTemplateTips"),[this._data.name]),
                //UIGuild_DeleteTemplateTips
                //`确定删除模版 ${this._data.name} `,
                contentCommit: "adaptation10012",
                contentCancel: "adaptation10013",
                actionCommit: async () => {
                    // this.node.active = false;
                    await UIClubModel.mInstance.APIOrgTemplateDelete(this._data.id)
                    this.post('matchModelChange')

                },
                noAnimation: true,
            });
    }

}
