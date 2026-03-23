/*
 * @Author: xfj
 * @Date: 2022-12-24 11:05:34
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-26 11:06:48
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIFriendMatchItem.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
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
@menu("脚本分组/new_club/UIFriendMatchItem")
export default class UIFriendMatchItem extends UIBase {
    @property(cc.Node)
    labelNode: cc.Node = null;

    @property(cc.Label)
    gameType: cc.Label = null;

    lbl_status: cc.Label = null;

    _data = null;

    protected lateLoad(): void {
        super.lateLoad();
        // UIClubModel.mInstance.WebOrggetRoomConfig()
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
    }
    initData(data) {
        this._data = data;

        let lbl_center_left = this.labelNode
            .getChildByName("lbl_1")
            .getComponent(cc.Label);
        let sb = this._data.sb / 100;
        lbl_center_left.string = `${sb}/${sb * 2}（${this._data.ante}）`;
        (lbl_center_left as any)._forceUpdateRenderData?.();
        let bx = lbl_center_left.node.getChildByName("bx");
        bx.active = this._data.insurance_on;

        let lbl_time = cc.find("lbl_2", this.labelNode).getComponent(cc.Label);
        let isJoin = this._data.participation_status == 1;
        let playView = lbl_time.getComponent(PlayViewItem);
        if (isJoin) {
            playView.updateItemInfo(this._data);
        } else {
            playView.updateNormalItem(this._data.play_duration);
        }
        this.lbl_status = this.labelNode
            .getChildByName("lbl_3")
            .getComponent(cc.Label);
        this.setText(
            this.lbl_status,
            this._data.status == 1 ? "adaptation10177" : "adaptation10186",
        );

        let lbl_num = this.labelNode
            .getChildByName("lbl_num")
            .getComponent(cc.Label);
        lbl_num.string = `${this._data.seat_count - this._data.empty_seat}/${this._data.seat_count}`;

        let lock = this.node.getChildByName("lock");
        lock.active = this._data.private_room == 1;

        this.setGameType();
    }
    setGameType() {
        if (this._data.poker_type == 0) {
            switch (this._data.game_type) {
                case 0:
                    this.gameType.string = "NLH";
                    this.gameType.node.color = cc.color().fromHEX("#83B518");
                    break;
                case 1:
                case 2:
                case 3:
                    this.gameType.string = "PLO";
                    this.gameType.node.color = cc.color().fromHEX("#5096FF");
                    break;
                default:
                    break;
            }
        } else {
            this.gameType.string = "6+";
            this.gameType.node.color = cc.color().fromHEX("#DE5C5C");
        }
    }

    baganClick() {
        let cb = () => {
            let isFriendDesk = false;
            if (this._data && this._data.origin_type == 4) {
                isFriendDesk = true;
            }
            if ((ClubCache._msg && ClubCache.club_id) || isFriendDesk) {
                //GameUtil.EnterRoomAPI(this._data, [UIDefine.UIClubHome]);
                if (isFriendDesk) {
                    GameUtil.EnterRoomAPI(this._data, {
                        game_enter_type: GameEnterType.Friend,
                    });
                } else {
                    GameUtil.EnterRoomAPI(this._data, {
                        game_enter_type: GameEnterType.Club,
                    });
                }
            } else {
                ToastManager.Instance.createToast(i18nMgr.Get("error2005"));
            }
        };
        cb();
        // if (this._data.private_room == 0) {
        //     cb();
        //     return;
        // }
        // UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogEditComponent,
        //     {
        //         type: UIDialogEditComponent.DialogType.CommitCancel,
        //         title: "加入牌桌",
        //         content: '',
        //         contentCommit: "确定",
        //         contentCancel: "取消",
        //         passWord: '123456',
        //         actionCommit: async () => {
        //             cb()
        //         },
        //         noAnimation: true,
        //     });
    }
}
