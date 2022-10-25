import ListItem from "../../common/ListItem";
import { TMttRoomsDeskItem, TMttRoomsDeskPlayer } from "../../config/TTypeConfig";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeTableItem')
export default class MttRealTimeTableItem extends ListItem {
    private deskNum: cc.Label = null;
    private playerNum: cc.Label = null;
    private scoreNum: cc.Label = null;
    lateLoad() {
        super.lateLoad();

        this.deskNum = this.getChildNodeOrComponent("deskNum", cc.Label)
        this.playerNum = this.getChildNodeOrComponent("playerNum", cc.Label)
        this.scoreNum = this.getChildNodeOrComponent("scoreNum", cc.Label)
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: TMttRoomsDeskItem) {
        this.setText(this.deskNum, data.rid)
        this.setText(this.playerNum, data.roomers.length)
        let [min, max] = this.getMaxMinScore(data.roomers);
        this.setText(this.scoreNum, `${max}/${min}`);
    }

    getMaxMinScore(players: Array<TMttRoomsDeskPlayer>) {
        if (players.length == 0) {
            return [0, 0];
        }
        let scores = players.map(p => Math.floor(p.chip) / 100)
        scores.sort((a, b) => a - b)
        return [scores[0], scores[scores.length - 1]];
    }
}