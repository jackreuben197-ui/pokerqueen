/*
 * @Author: xfj
 * @Date: 2022-10-25 17:12:38
 * @description:
 * @LastEditors:
 * @LastEditTime: 2023-03-22 13:12:01
 * @FilePath: /pokerqueen/assets/script/mtt/realTime/MttRealTimeTableItem.ts
 */
import ListItem from '../../common/ListItem';
import { TMttRoomsDeskItem, TMttRoomsDeskPlayer } from '../../config/TTypeConfig';
import GC from '../../frame/GameControl';
import { GameCache } from '../../game/GameCache';
import MTTGameUtil from '../../game/util/MTTGameUtil';
import { StringHelper } from '../../helper/StringHelper';
import { UIMTTModel } from '../../new_mtt/UIMTTModel';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeTableItem')
export default class MttRealTimeTableItem extends ListItem {
    private deskNum: cc.Label = null;
    private playerNum: cc.Label = null;
    private scoreNum: cc.Label = null;
    private scoreNum1: cc.Label = null;

    lateLoad() {
        super.lateLoad();
        this.deskNum = this.getChildNodeOrComponent('deskNum', cc.Label);
        this.playerNum = this.getChildNodeOrComponent('playerNum', cc.Label);
        this.scoreNum = this.getChildNodeOrComponent('scoreNum', cc.Label);
        this.scoreNum1 = this.getChildNodeOrComponent('scoreNum', cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: TMttRoomsDeskItem) {
        this.setText(this.deskNum, data.rid);
        this.setText(this.playerNum, data.roomers.length);
        let [min, max] = this.getMaxMinScore(data.roomers);
        this.setText(this.scoreNum, GameCache.Instance.bb_on ? max[1] + 'BB' : max[0]);
        this.setText(this.scoreNum1, GameCache.Instance.bb_on ? min[1] + 'BB' : min[0]);
    }

    getMaxMinScore(players: Array<TMttRoomsDeskPlayer>) {
        if (players.length == 0) {
            return [0, 0];
        }
        //大盲 计算BB
        let bigBlind = GameCache.Instance.carry_small;
        let scores = players.map(p => [Math.floor(p.chip) / 100, StringHelper.GetDecimalN(p.chip / bigBlind)]);
        scores.sort((a: any, b: any) => a[0] - b[0]);
        return [scores[0], scores[scores.length - 1]];
    }
}
