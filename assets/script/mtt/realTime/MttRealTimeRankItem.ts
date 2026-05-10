/*
 * @Author: xfj
 * @Date: 2022-10-25 17:12:38
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-22 13:33:28
 * @FilePath: /pokerqueen/assets/script/mtt/realTime/MttRealTimeRankItem.ts
 */
import ListItem from '../../common/ListItem';
import MttRealTimeRankItemModel from '../../frame/data/mtt/realTime/MttRealTimeRankItemModel';
import { GameCache } from '../../game/GameCache';
import { StringHelper } from '../../helper/StringHelper';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeRankItem')
export default class MttRealTimeRankItem extends ListItem {
    private myselfFlag: cc.Node = null;
    private rank: cc.Label = null;
    private desk: cc.Label = null;
    private score: cc.Label = null;
    private _data: MttRealTimeRankItemModel = null;

    lateLoad() {
        super.lateLoad();
        this.myselfFlag = this.getChildNodeOrComponent('myselfFlag');
        this.rank = this.getChildNodeOrComponent('rank', cc.Label);
        this.desk = this.getChildNodeOrComponent('desk', cc.Label);
        this.score = this.getChildNodeOrComponent('score', cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: MttRealTimeRankItemModel) {
        this._data = data;
        let color = '#757CAB';
        let op = 180;
        if (this._data.isMySelf) {
            color = '#7187FF';
            op = 255;
        }
        this.setTextColor(this.rank, color);
        this.setTextColor(this.desk, color);
        this.setTextColor(this.score, color);
        this.rank.node.opacity = op;
        this.desk.node.opacity = op;
        this.score.node.opacity = op;
        this.setActive(this.myselfFlag, this._data.isMySelf);
        this.rank.string = `${this._data.rank} ${this._data.name}`;
        this.desk.string = this._data.rid + '';
        this.score.string = `${StringHelper.GetDecimalN(this._data.chip / 100)}(${StringHelper.GetDecimalN(this._data.chip / GameCache.Instance.carry_small)}BB)`;
        //StringHelper.GetLongString(this._data.chip)
        // this.setText(this.rank, `${this._data.rank} ${this._data.name}`);
        // this.setText(this.desk, this._data.rid);
        // this.setText(this.score, this._data.chip);
        StringHelper.GetDecimalN;
    }
}
