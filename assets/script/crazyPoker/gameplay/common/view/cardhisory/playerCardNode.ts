import UIBasePlus from '../../../../../ui/UIBasePlus';
import { StringHelper } from '../../../../../helper/StringHelper';
import AssetContext, { AssetFold } from '../../../../../ui/component/AssetContext';
import { CardTypeUtil } from '../../../../../game/CardTypeUtil';
import GameUtil from '../../../../../game/util/GameUtil';
import { i18nMgr } from '../../../../../i18n/i18nMgr';
import WebImageHelper from '../../../../../helper/WebImageHelper';

const { ccclass, property } = cc._decorator;

/**
 * 操作动作 i18n key 映射
 * 下标对应 getActionNumByName 的返回值
 */
const PlayerActionI18NKeys = [
    '',                  // 0: 无操作
    'UISB',              // 1: small blind → 小盲
    'UIBB',              // 2: big blind → 大盲
    'UITexas_call',      // 3: call → 跟注
    '',                  // 4: check → 过牌 (无专用key，直接写)
    '',                  // 5: straddle → 偷鸡 (直接写)
    'UITexas_Bet',       // 6: bet → 下注
    'adaptation10045',   // 7: raise → 加注
    '',                  // 8: 3Bet (组合显示)
    'adaptation30074',   // 9: all in → 全下
    'UITexas_fold',      // 10: fold → 弃牌
    '',                  // 11: insure → 保险 (直接写)
];

/**
 * 牌谱概览 - 单个玩家行数据接口
 */
export interface IPlayerCardData {
    /** 玩家名字 */
    userName: string;
    /** 头像URL */
    headPic: string;
    /** 手牌牌值数组 */
    handCards: number[];
    /** 公共牌牌值数组 (5张) */
    publicCards: number[];
    /** 牌型数字 */
    cardType: number;
    /** 最后操作动作名 ("all in" / "raise" / "bet" / "call" / "fold" 等) */
    actName: string;
    /** 最后操作筹码 */
    actChip: number;
    /** 加注次数 (用于 bet/raise 时显示 B/R/3B/4B...) */
    raiseTimes: number;
    /** 最终盈亏 */
    winAnte: number;
    /** 是否是自己 */
    isMine: boolean;
}

@ccclass
export default class playerCardNode extends UIBasePlus {

    // 节点引用
    private playHeadImg: cc.Node = null;
    private playerName: cc.Label = null;
    private cardS1: cc.Node = null;
    private cardS2: cc.Node = null;
    private cardP1: cc.Node = null;
    private cardP2: cc.Node = null;
    private cardP3: cc.Node = null;
    private cardP4: cc.Node = null;
    private cardP5: cc.Node = null;
    private ctLabel: cc.Label = null;
    private opAction: cc.Label = null;
    private opNum: cc.Label = null;
    private profit: cc.Label = null;

    onLoad() {
        this.initNodes();
    }

    private initNodes() {
        const node = this.node;
        this.playHeadImg = node.getChildByName('playHeadImg');
        this.playerName = cc.find('playHeadImg/playerName', node).getComponent(cc.Label);

        this.cardS1 = node.getChildByName('cardS1');
        this.cardS2 = node.getChildByName('cardS2');
        this.cardP1 = node.getChildByName('cardP1');
        this.cardP2 = node.getChildByName('cardP2');
        this.cardP3 = node.getChildByName('cardP3');
        this.cardP4 = node.getChildByName('cardP4');
        this.cardP5 = node.getChildByName('cardP5');

        this.ctLabel = cc.find('cardType/ctLabel', node).getComponent(cc.Label);
        this.opAction = node.getChildByName('opAction').getComponent(cc.Label);
        this.opNum = node.getChildByName('opNum').getComponent(cc.Label);
        this.profit = node.getChildByName('profit').getComponent(cc.Label);
    }

    /**
     * 填充玩家数据到节点
     */
    setData(data: IPlayerCardData) {
        this.setName(data.userName);
        this.setHandCards(data.handCards);
        this.setPublicCards(data.publicCards);
        this.setCardType(data.cardType);
        this.setAction(data.actName, data.actChip, data.raiseTimes);
        this.setProfit(data.winAnte, data.isMine);
        this.setHeadImg(data.headPic);
    }

    /** 设置玩家名字 */
    private setName(name: string) {
        this.playerName.string = StringHelper.LengthNick(name);
    }

    /** 设置头像 (URL异步加载) */
    private setHeadImg(url: string) {
        WebImageHelper.SetHeadImage(this.playHeadImg.getComponent(cc.Sprite), url);
    }

    /** 设置手牌 */
    private setHandCards(cards: number[]) {
        const handCardNodes = [this.cardS1, this.cardS2];
        if (!cards || cards.length <= 0) {
            // 没有手牌数据，显示牌背
            handCardNodes.forEach(card => {
                card.active = true;
                card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(0),
                    AssetFold.texture_SmallCard0
                );
            });
        } else {
            handCardNodes.forEach((card, index) => {
                let cardVal = cards[index] || 0;
                card.active = true;
                card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(cardVal),
                    AssetFold.texture_SmallCard0
                );
            });
        }
    }

    /** 设置公共牌 */
    private setPublicCards(cards: number[]) {
        const publicCardNodes = [this.cardP1, this.cardP2, this.cardP3, this.cardP4, this.cardP5];
        publicCardNodes.forEach((card, index) => {
            if (cards && cards[index] > 0) {
                card.active = true;
                card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(cards[index]),
                    AssetFold.texture_SmallCard0
                );
            } else {
                card.active = false;
            }
        });
    }

    /** 设置牌型名称 (根据 i18n 语言) */
    private setCardType(cardType: number) {
        let name = CardTypeUtil.GetCardTypeName(cardType);
        if (!name) {
            // 弃牌玩家没有牌型数据，显示"弃牌"
            name = i18nMgr.Get('UITexas_fold') || '弃牌';
        }
        this.ctLabel.string = name;
    }

    /** 设置操作动作和金额 */
    private setAction(actName: string, actChip: number, raiseTimes: number) {
        const actNum = this.getActionNumByName(actName);
        let actionStr = '';

        if (actNum === 6 || actNum === 7) {
            // bet 或 raise
            if (raiseTimes <= 1) {
                actionStr = this.getActionI18N(actNum);
            } else if (raiseTimes === 2) {
                // 再加注
                let raiseStr = this.getActionI18N(7);
                actionStr = raiseStr;
            } else {
                // 3加注, 4加注...
                let raiseStr = this.getActionI18N(7);
                actionStr = raiseTimes + raiseStr;
            }
        } else {
            actionStr = this.getActionI18N(actNum);
        }

        // 弃牌不显示动作标签，左侧牌型已显示"弃牌"
        if (actNum === 10) {
            this.opAction.node.active = false;
            this.opNum.node.active = false;
        } else {
            this.opAction.node.active = true;
            this.opNum.node.active = true;
            this.opAction.string = actionStr;
            this.opNum.string = actChip > 0 ? StringHelper.GetLongString(actChip) : '';
        }
    }

    /** 获取操作动作的本地化名称 */
    private getActionI18N(actNum: number): string {
        let key = PlayerActionI18NKeys[actNum];
        if (key) {
            return i18nMgr.Get(key) || '';
        }
        // 没有专用 i18n key 的，直接返回中文
        switch (actNum) {
            case 4: return '过牌';
            case 5: return '偷鸡';
            case 8: return '3Bet';
            case 11: return '保险';
            default: return '';
        }
    }

    /** 设置最终盈亏 */
    private setProfit(winAnte: number, isMine: boolean) {
        this.profit.string = StringHelper.GetSignedLongString(winAnte);

        if (winAnte > 0) {
            // 赢了 - 红色
            this.profit.node.color = cc.color(255, 80, 80);
        } else if (winAnte < 0) {
            // 输了 - 蓝色
            this.profit.node.color = cc.color(80, 160, 255);
        }

        // 如果是自己，名字和盈亏用金色
        if (isMine) {
            this.playerName.node.color = cc.color(220, 186, 130);
            this.profit.node.color = cc.color(220, 186, 130);
        }
    }

    /** 通过操作名字取得对应数组下标 */
    private getActionNumByName(actionName: string): number {
        switch (actionName) {
            case 'small blind': return 1;
            case 'big blind': return 2;
            case 'call': return 3;
            case 'check': return 4;
            case 'straddle': return 5;
            case 'bet': return 6;
            case 'raise': return 7;
            case 'all in': return 9;
            case 'fold': return 10;
            case 'insure': return 11;
            default: return 0;
        }
    }

    /** 重置节点数据 */
    resetData() {
        this.playerName.string = '';
        this.ctLabel.string = '';
        this.opAction.string = '';
        this.opNum.string = '';
        this.profit.string = '';

        [this.cardS1, this.cardS2, this.cardP1, this.cardP2, this.cardP3, this.cardP4, this.cardP5].forEach(card => {
            card.active = false;
        });
    }
}
