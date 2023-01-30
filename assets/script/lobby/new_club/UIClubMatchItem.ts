/*
 * @Author: xfj
 * @Date: 2022-12-24 11:05:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-30 09:51:16
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubMatchItem.ts
 */


import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import GameUtil from "../../game/util/GameUtil";
import { GM } from "../../gm/GMAPI";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import UIDialogEditComponent from "../../ui/dialog/UIDialogEditComponent";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import PlayViewItem from "../view/PlayViewItem";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubMatchItem')
export default class UIClubMatchItem extends UIBase {

    @property(cc.Node)
    item_choose: cc.Node = null;

    @property(cc.Node)
    item_nomal: cc.Node = null;

    @property(cc.Node)
    labelNode: cc.Node = null;

    @property(cc.Label)
    lbl_num: cc.Label = null;

    @property(cc.Label)
    lbl_status: cc.Label = null;
    _data = null;

    protected lateLoad(): void {
        super.lateLoad();
        // UIClubModel.mInstance.APIOrgGetRoomConfig()
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
    }
    initData(data) {
        this._data = data;

        let lbl_center_left = this.labelNode.getChildByName('lbl_center_left').getComponent(cc.Label)
        let sb = this._data.sb / 100;
        lbl_center_left.string = `${sb}/${sb * 2}（${this._data.ante}）`

        let lbl_deskName = this.labelNode.getChildByName('lbl_deskName').getComponent(cc.Label)
        lbl_deskName.string = this._data.name + (GM.switch_roomid_show ? `[${this._data.rid}]` : "")

        this.lbl_num.string = `${this._data.seat_count - this._data.empty_seat}/${this._data.seat_count}`

        this.setText(this.lbl_status, `UIChessItemStatus_${this._data.status}`);
        let vector = lbl_center_left.node.getChildByName('Vector1');
        vector.active = this._data.private_room == 1


        let isJoin = this._data.participation_status == 1;
        this.item_choose.active = isJoin;
        this.item_nomal.active = !isJoin;

        let lbl_gameType = isJoin ? cc.find('item_choose/lbl_gameType', this.node).getComponent(cc.Label) : cc.find('item_nomal/lbl_gameType', this.node).getComponent(cc.Label)
        lbl_gameType.string = this.gameTypeName

        let lbl_time = cc.find('data_label/img_time/lbl_time', this.labelNode).getComponent(cc.Label)

        let playView = lbl_time.getComponent(PlayViewItem)
        if (isJoin) {
            playView.updateItemInfo(this._data);
        } else {
            playView.updateNormalItem(this._data.play_duration);
        }

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

    baganClick() {
        let cb = () => {
            let isFriendDesk = false;
            if (this._data && this._data.origin_type == 4) {
                isFriendDesk = true;
            }
            if (ClubCache._msg && ClubCache.club_id || isFriendDesk) {
                GameUtil.EnterRoomAPI(this._data, [UIDefine.UIClubHome]);
            } else {

                ToastManager.Instance.createToast(i18nMgr.Get("error2005"));
            }
        }
        if (this._data.private_room == 0) {
            cb();
            return;
        }
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogEditComponent,
            {
                type: UIDialogEditComponent.DialogType.CommitCancel,
                title: "加入牌桌",
                content: '',
                contentCommit: "确定",
                contentCancel: "取消",
                passWord: '123456',
                actionCommit: async () => {
                    cb()
                },
                noAnimation: true,
            });
    }

}

