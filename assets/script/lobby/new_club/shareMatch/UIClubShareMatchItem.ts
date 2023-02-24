/*
 * @Author: xfj
 * @Date: 2022-10-28 17:58:45
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 19:03:13
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/shareMatch/UIClubShareMatchItem.ts
 */

import { EventName } from "../../../config/EventName";
import GGEvent from "../../../event/GGEvent";
import WebImageHelper from "../../../helper/WebImageHelper";
import UIBase from "../../../ui/UIBase";
import { UIClubModel } from "../../labor/UIClubModel";
import PlayViewItem from "../../view/PlayViewItem";


const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIClubShareMatchItem')
export default class UIClubShareMatchItem extends UIBase {
    @property(cc.Node)
    labelNode: cc.Node = null;

    @property(cc.Label)
    lbl_num: cc.Label = null;

    @property(cc.Node)
    Rectangle: cc.Node = null;
    @property(cc.Label)
    gameType: cc.Label = null;


    lbl_status: cc.Label = null;
    _data = null;
    _type = 0
    initData(data, type, index) {
        this._data = data
        this._type = type;
        this.initView();

    }
    initView() {
        this.labelNode.getChildByName('lbl_1').getComponent(cc.Label).string = this._data.apply_club_name
        this.labelNode.getChildByName('lbl_4').getComponent(cc.Label).string = 'ID:' + this._data.apply_club_random_id

        let sb = this._data.sb / 100;
        this.labelNode.getChildByName('lbl_2').getComponent(cc.Label).string = `${sb}/${sb * 2}（${this._data.ante}）`
        this.lbl_num.string = this._data.seat_count

        let icon = cc.find('Round', this.node);
        WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), this._data.share_club_logo)
        this.setGameType()

        let lock = this.node.getChildByName('lock');
        lock.active = this._data.private_room == 1
        let lbl_time = this.labelNode.getChildByName('lbl_3')
        let playView = lbl_time.getComponent(PlayViewItem)
        playView.updateNormalItem(this._data.play_duration);

        let btnNode = this.node.getChildByName("btnNode")
        btnNode.active = this._type == 1
        let canclebtnNode = this.node.getChildByName("canclebtnNode")
        canclebtnNode.active = this._type == 0
    }
    async sendRequest(event, customData) {
        await UIClubModel.mInstance.APIOrgClubShareAudit({
            "apply_id": this._data.id,
            "audit_op": Number(customData)
        });
        this.post(EventName.refreshShareMatch);
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
}

