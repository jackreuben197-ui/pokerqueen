/*
 * @Author: xfj
 * @Date: 2022-12-24 11:05:34
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-29 20:05:09
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIClubMatchItem.ts
 */


import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import GameUtil, { GameEnterType } from "../../../game/util/GameUtil";
import { GM } from "../../../gm/GMAPI";
import { i18nMgr } from "../../../i18n/i18nMgr";
import ToastManager from "../../../manager/ToastManager";
import UIDialogEditComponent from "../../../ui/dialog/UIDialogEditComponent";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";
import PlayViewItem from "../../view/PlayViewItem";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubMatchItem')
export default class UIClubMatchItem extends UIBase {


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

    protected lateLoad(): void {
        super.lateLoad();
        // UIClubModel.mInstance.APIOrgGetRoomConfig()
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
    }
    initData(data) {
        this._data = data;

        let lbl_center_left = this.labelNode.getChildByName('lbl_1').getComponent(cc.Label)
        let sb = this._data.sb / 100;
        lbl_center_left.string = `${sb}/${sb * 2}（${this._data.ante}）`



        this.lbl_num.string = `${this._data.seat_count - this._data.empty_seat}/${this._data.seat_count}`
        this.lbl_status = this.labelNode.getChildByName('lbl_3').getComponent(cc.Label)
        this.setText(this.lbl_status, this._data.status == 1 ? 'MTT_State_NotStart' : 'adaptation10186');

        let lock = this.node.getChildByName('lock');
        lock.active = this._data.private_room == 1

        let isJoin = this._data.participation_status == 1;

        let lbl_time = cc.find('lbl_2', this.labelNode).getComponent(cc.Label)

        let playView = lbl_time.getComponent(PlayViewItem)
        if (isJoin) {
            playView.updateItemInfo(this._data);
        } else {
            playView.updateNormalItem(this._data.play_duration);
        }
        this.setGameType();
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

    baganClick() {
        let cb = () => {
            let isFriendDesk = false;
            if (this._data && this._data.origin_type == 4) {
                isFriendDesk = true;
            }
            if (ClubCache._msg && ClubCache.club_id || isFriendDesk) {
                //GameUtil.EnterRoomAPI(this._data, [UIDefine.UIClubHome]);
                //朋友桌進入
                if (isFriendDesk) {
                    GameUtil.EnterRoomAPI(this._data, { game_enter_type: GameEnterType.Friend });
                }
                //公會内部桌進入 
                else {
                    GameUtil.EnterRoomAPI(this._data, { game_enter_type: GameEnterType.Club });
                }

            } else {

                ToastManager.Instance.createToast(i18nMgr.Get("error2005"));
            }
        }
        if (this._data.private_room == 1 && localStorage.getItem(this._data.id + '_' + GC.data.user.info.un_id) == this._data.room_password) {
            cb();
            return
        }
        if (this._data.private_room == 0 || ClubCache.user_level == 1 || ClubCache.user_level == 3) {
            cb();
            return;
        }
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogEditComponent,
            {
                type: UIDialogEditComponent.DialogType.CommitCancel,
                title: "UIGuild_JoinGameTitle",
                content: '',
                contentCommit: "adaptation10012",
                contentCancel: "adaptation10013",
                passWord: this._data.room_password,
                actionCommit: async () => {
                    localStorage.setItem(this._data.id + '_' + GC.data.user.info.un_id, this._data.room_password)
                    cb()
                },
                noAnimation: true,
            });
    }

}

