import { StringHelper } from '../../../../../helper/StringHelper';
import { i18nMgr } from '../../../../../i18n/i18nMgr';
import UIBase from '../../../../../ui/UIBase';
import UIComponent from '../../../../../ui/UIComponent';
import CountDownLabel from './usdtdiamond/CountDownLabel';
import RemoteSprite from './usdtdiamond/RemoteSprite';
const { ccclass, property, menu } = cc._decorator;

export interface UIRechargeDiamondParam {
    exchangeRate: number; // 兑换比例（1钻石=多少USDT)
    amount: number; // 付款金额
    qrcode: string; // 二维码地址
    address: string; // 钱包地址
    addressType: string; // 地址类型

    onConfirm: () => void; // 点击确认的回调
}
const LN = '[UIRechargeDiamond]';

@ccclass
@menu('脚本分组/crazypoke/chips/UIRechargeDiamond')
export default class UIRechargeDiamond extends UIBase {
    @property(cc.Label)
    private exchangeRateLabel: cc.Label = null;
    @property(cc.Label)
    private amountLabel: cc.Label = null;
    @property(RemoteSprite)
    private icon: RemoteSprite = null;
    @property(cc.Button)
    private closeButton: cc.Button = null;
    @property(cc.Button)
    private backgroundButton: cc.Button = null;
    @property(cc.RichText)
    private introText: cc.RichText = null;
    @property(cc.Button)
    private copyButton: cc.Button = null;
    @property(CountDownLabel)
    private countdownLabel: CountDownLabel = null;

    public onLoad() {
        this.closeButton.node.on('click', this.onCloseClicked, this);
        this.backgroundButton.node.on('click', this.onCloseClicked, this);
        this.copyButton.node.on('click', this.onCopyClicked, this);
    }

    public onShow(param?: UIRechargeDiamondParam): void {
        this.exchangeRateLabel.string = StringHelper.FormatString(
            i18nMgr.Get('UIBuyDiamondExchangeRateReverse'),
            StringHelper.GetLongString(1 / param.exchangeRate, 1, 4)
        );
        this.amountLabel.string = param.amount.toString();
        this.icon.url = param.qrcode;
        this.introText.string = i18nMgr.Get('UIMineMallUSDTShopPayDialogCopyAddress') + '\n' + param.addressType + ': ' + param.address;
        this.countdownLabel.startCountDown(900); // 启动倒计时
        this.countdownLabel.onTimeUpCallback = () => {
            UIComponent.Instance.Toast(i18nMgr.Get('roomError148_2'));
        };
    }

    private onCloseClicked() {
        UIComponent.close(this.UIDefine);
    }

    private onCopyClicked() {
        console.log(LN, 'Copy address:', this.introText.string);
    }
}
