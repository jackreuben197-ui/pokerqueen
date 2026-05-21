import List from '../../common/List';
import GC from '../../frame/GameControl';
import { WebMtt } from '../../net/https/WebRequest';
import UIBase from '../../ui/UIBase';
import MttRealTimeRewardItem from './MttRealTimeRewardItem';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeRewardNode')
export default class MttRealTimeRewardNode extends UIBase {
    private reward: cc.Label = null;
    private rank: cc.Label = null;
    private rewardList: List = null;

    lateLoad() {
        super.lateLoad();
        this.reward = this.getChildNodeOrComponent('reward', cc.Label);
        this.rank = this.getChildNodeOrComponent('rank', cc.Label);
        this.rewardList = this.getChildNodeOrComponent('rewardList', List);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        GC.notify.register(WebMtt.REAL_PRIZE, this.updateView, this);
    }

    // protected notify(id: any, msg: any, sendInfo?: any): void {
    //     //id = id.replace(/(?<=mtt\/)\d+/g, "{0}");
    //     switch (id) {
    //         case WebMtt.REAL_PRIZE: {
    //             this.updateView();
    //         } break;
    //     }
    // }
    initData() {
        GC.data.mtt.reqRealTimeRealPrize();
    }

    updateView() {
        let info = GC.data.mtt.realTime.realPrize;
        this.setText(this.reward, info.award);
        this.setText(this.rank, 'UITexasReport_Text_RewardReward', info.award_num);
        this.rewardList.numItems = info.prizes.length;
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(MttRealTimeRewardItem);
        item.initData(GC.data.mtt.realTime.realPrize.prizes[index]);
    }
}
