import { StringHelper } from '../../../helper/StringHelper';
import WebImageHelper from '../../../helper/WebImageHelper';
import { i18nMgr } from '../../../i18n/i18nMgr';
import AssetContext from '../../../ui/component/AssetContext';
import UIBase from '../../../ui/UIBase';

export interface UISquidEndItemShowData {
    userID: number;
    nick: string;
    avatar: string;
    money: number;
    squidNum: number;
    rate: number;
    isPunish: boolean;
}
const { ccclass } = cc._decorator;

@ccclass
export default class UISquidEndItem extends UIBase {
    private memberIcon: cc.Sprite = null;
    private memberNameTxt: cc.Label = null;
    private memberIDTxt: cc.Label = null;
    private memberScoreTxt: cc.RichText = null;
    private squidLose: cc.Node = null;
    private rewardBg: cc.Node = null;
    private rateLabel: cc.RichText = null;

    public Refresh(data: UISquidEndItemShowData): void {
        this.CacheRefs();
        if (this.memberNameTxt) {
            this.memberNameTxt.string = StringHelper.LengthNick(data.nick || '-');
        }
        if (this.memberIDTxt) {
            this.memberIDTxt.string = `ID:${data.userID || 0}`;
        }
        if (this.memberScoreTxt) {
            const scoreColor = data.money > 0 ? '#B0FFAE' : data.money < 0 ? '#FF7C7C' : '#EEF5FF';
            this.memberScoreTxt.string = `<color=${scoreColor}>${StringHelper.GetSignedLongString(data.money || 0)}</color>`;
        }
        if (this.squidLose) {
            // 隐藏失败触手装饰（按需求：此部分直接隐藏）
            this.squidLose.active = false;
        }
        const showRate = !data.isPunish && (data.rate || 0) > 0;
        console.log(666, showRate, data.rate, data.isPunish);
        if (this.rewardBg) {
            this.rewardBg.active = showRate;
        }
        if (this.rateLabel && showRate) {
            this.rateLabel.string = `<color=#FFFC5F>${data.rate}x</color> <color=#FFFFFF>${i18nMgr.Get('UISquidEndReward')}</color>`;
        }
        if (this.memberIcon) {
            WebImageHelper.SetHeadImage(this.memberIcon, data.avatar, AssetContext.getAsset('RadHead'));
        }
    }

    private CacheRefs(): void {
        if (this.memberIcon) {
            return;
        }
        this.memberIcon = cc.find('MemberIcon', this.node)?.getComponent(cc.Sprite);
        this.memberNameTxt = cc.find('MemberNameTxt', this.node)?.getComponent(cc.Label);
        this.memberIDTxt = cc.find('MemberIDTxt', this.node)?.getComponent(cc.Label);
        this.memberScoreTxt = cc.find('MemberScoreTxt', this.node)?.getComponent(cc.RichText);
        this.squidLose = cc.find('squid_lose', this.node);
        this.rewardBg = cc.find('squid_reward_bg', this.node);
        this.rateLabel = cc.find('squid_reward_bg/rateLabel', this.node)?.getComponent(cc.RichText);
    }
}
