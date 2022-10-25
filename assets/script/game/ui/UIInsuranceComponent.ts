
import { OutsCard, UserOuts } from "../../protobuf/holdem/define_pb";
import UIBase from "../../ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIInsuranceComponent extends UIBase {

    protected lateLoad(): void {
        super.lateLoad();
    }

    onShow(obj?: InsuranceData): void {
        super.onShow(obj);
        if (null == obj) return;

    }
}
export class WrapTriggedInsuranceData {
    public outsCards: OutsCard.AsObject[];//所有玩家
    public subPot: number;
    public leastAmount: number;//最小限制购买
    public mostAmount: number;//最大限制购买
    public potAllowOutSelection: number;//是否允许部分选择outs。已经在本池投入的保费>0，不可选择
    public potTotalCost: number;//池中总投入
    public pot: number;//要购买的保险池大小
    public userNames: string[];//参与保险得玩家名字
    public outsPerUser: number[];//outs数量
    public playerCards: number[];//手牌
    public PotUserCount: number;//池内人数
    public PotLeaderCount: number;//池内领先人数
}
export class InsuranceData {
    public publicCards: number[];//公共牌
    public triggedDatas: WrapTriggedInsuranceData[];
    public timeLeft: number;//剩余时间
    public delayTimes: number;//已加时次数
}
