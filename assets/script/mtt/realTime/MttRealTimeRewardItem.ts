import ListItem from '../../common/ListItem';
import { TMttRealPrizeItem } from '../../config/TTypeConfig';
import GC from '../../frame/GameControl';
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeRewardItem')
export default class MttRealTimeRewardItem extends ListItem {
    private rank: cc.Label = null;
    private reward: cc.Label = null;

    lateLoad() {
        super.lateLoad();
        this.rank = this.getChildNodeOrComponent('rank', cc.Label);
        this.reward = this.getChildNodeOrComponent('reward', cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: TMttRealPrizeItem) {
        this.setText(this.rank, data.min == data.max ? data.min : `${data.min}-${data.max}`);
        let award = Math.floor(data.award) / 100;
        if (data.goods != null) {
            let rewardStr = '';
            data.goods.forEach((g, index) => {
                let itemName = GC.data.languageTemp.temp.getName(data.goods[index].na);
                let itemDesc = `${itemName}x${g.n}`;
                if (index != 0 || data.award != 0) {
                    rewardStr += '+';
                }
                rewardStr += itemDesc;
            });
            if (data.award == 0) {
                this.setText(this.reward, rewardStr);
            } else {
                this.setText(this.reward, `${award}${rewardStr}`);
            }
        } else {
            this.setText(this.reward, award);
        }
    }
}
