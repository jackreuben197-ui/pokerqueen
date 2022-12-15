/*
 * @Author: xfj
 * @Date: 2022-10-25 17:12:38
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-12-15 16:15:15
 * @FilePath: /pokerqueen/assets/script/mtt/realTime/MttRealTimeRankItem.ts
 */
import ListItem from "../../common/ListItem";
import MttRealTimeRankItemModel from "../../frame/data/mtt/realTime/MttRealTimeRankItemModel";

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
        this.myselfFlag = this.getChildNodeOrComponent("myselfFlag");
        this.rank = this.getChildNodeOrComponent("rank", cc.Label);
        this.desk = this.getChildNodeOrComponent("desk", cc.Label);
        this.score = this.getChildNodeOrComponent("score", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: MttRealTimeRankItemModel) {
        this._data = data;

        this.setActive(this.myselfFlag, this._data.isMySelf);
        this.rank.string = `${this._data.rank} ${this._data.name}`
        this.desk.string = this._data.rid + ''
        this.score.string = this._data.chip + ''
        // this.setText(this.rank, `${this._data.rank} ${this._data.name}`);
        // this.setText(this.desk, this._data.rid);
        // this.setText(this.score, this._data.chip);
    }
}