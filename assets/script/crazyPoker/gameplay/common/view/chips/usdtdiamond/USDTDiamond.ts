import { StringHelper } from '../../../../../../helper/StringHelper';
const { ccclass, property } = cc._decorator;

@ccclass
export default class USDTDiamond extends cc.Component {
    @property(cc.Label)
    private amount: cc.Label = null;
    @property(cc.Label)
    private intro: cc.Label = null;
    @property(cc.Label)
    private usdtAmount: cc.Label = null;
    @property(cc.Button)
    private buyButton: cc.Button = null;
    //专属标记
    @property(cc.Node)
    private sp: cc.Node = null;
    @property(cc.Label)
    private spLabel: cc.Label = null;
    @property(cc.Button)
    private spMark: cc.Button = null;
    @property(cc.Node)
    private spIntroNode: cc.Node = null;
    @property(cc.Label)
    private spIntroText: cc.Label = null;

    public initData(amount: number, usdtAmount: number, isSp: boolean) {
        this.amount.string = amount.toString();
        this.usdtAmount.string = StringHelper.GetLongStringLocale(usdtAmount);
    }
}
