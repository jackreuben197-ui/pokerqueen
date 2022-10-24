import ListItem from "../../common/ListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeRankItem')
export default class MttRealTimeRankItem extends ListItem {
    private myselfFlag: cc.Node = null;
    private rank: cc.Label = null;
    private desk: cc.Label = null;
    private score: cc.Label = null;
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

    initData(data: any) {

    }
}