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
    '', // 0: 无操作
    'UISB', // 1: small blind → 小盲
    'UIBB', // 2: big blind → 大盲
    'UITexas_call', // 3: call → 跟注
    '', // 4: check → 过牌 (无专用key，直接写)
    '', // 5: straddle → 偷鸡 (直接写)
    'UITexas_Bet', // 6: bet → 下注
    'adaptation10045', // 7: raise → 加注
    '', // 8: 3Bet (组合显示)
    'adaptation30074', // 9: all in → 全下
    'UITexas_fold', // 10: fold → 弃牌
    '' // 11: insure → 保险 (直接写)
];
// ── 私牌排列锚点 (取自 prefab 中 cardS1 / cardS6 的初始 x) ──
const HAND_CARD_LEFT_X = -290.378; // cardS1 的 x 坐标 (最左锚点)
const HAND_CARD_RIGHT_X = -144.331; // cardS6 的 x 坐标 (最右边界)
const HAND_CARD_Y = 29; // 私牌 Y 坐标
const HAND_CARD_WIDTH = 84; // 单张牌宽
const HAND_CARD_VISIBLE_GAP = 4; // 牌间最小可见间隙 (px)
// ── 公牌位置常量 ──
const PUBLIC_CARD_SINGLE_Y = 29; // 单套公牌 Y (与私牌同行)
const PUBLIC_CARD_UPPER_Y = 65.531; // 双套公牌上排 Y
const PUBLIC_CARD_LOWER_Y = -72.164; // 双套公牌下排 Y

/**
 * 牌谱概览 - 单个玩家行数据接口
 */
export interface IPlayerCardData {
    /** 玩家名字 */
    userName: string;
    /** 头像URL */
    headPic: string;
    /** 手牌牌值数组 (2~6张) */
    handCards: number[];
    /** 公共牌牌值数组 - 第一套 (最多5张) */
    publicCards: number[];
    /** 公共牌牌值数组 - 第二套 (双套牌局, 可选) */
    publicCards2?: number[];
    /** 牌型数字 - 第一套 */
    cardType: number;
    /** 牌型数字 - 第二套 (双套牌局, 可选) */
    cardType2?: number;
    /** 最后操作动作名 ("all in" / "raise" / "bet" / "call" / "fold" 等) */
    actName: string;
    /** 最后操作筹码 */
    actChip: number;
    /** 加注次数 (用于 bet/raise 时显示 B/R/3B/4B...) */
    raiseTimes: number;
    /** 最终盈亏 */
    winAnte: number;
    /** 第二套盈亏 (双套牌局, 可选) */
    winAnte2?: number;
    /** 是否是自己 */
    isMine: boolean;
}

@ccclass
export default class playerCardNode extends UIBasePlus {
    // ── 节点引用 ──
    private playHeadImg: cc.Node = null;
    private playerName: cc.Label = null;
    // 私牌 (最多6张)
    private cardS1: cc.Node = null;
    private cardS2: cc.Node = null;
    private cardS3: cc.Node = null;
    private cardS4: cc.Node = null;
    private cardS5: cc.Node = null;
    private cardS6: cc.Node = null;
    // 公牌第一套 (上排)
    private cardP1: cc.Node = null;
    private cardP2: cc.Node = null;
    private cardP3: cc.Node = null;
    private cardP4: cc.Node = null;
    private cardP5: cc.Node = null;
    // 公牌第二套 (下排, 双套牌局)
    private cardP1_b: cc.Node = null;
    private cardP2_b: cc.Node = null;
    private cardP3_b: cc.Node = null;
    private cardP4_b: cc.Node = null;
    private cardP5_b: cc.Node = null;
    private ctLabel: cc.Label = null;
    private opAction: cc.Label = null;
    private opNum: cc.Label = null;
    private profit: cc.Label = null;
    private profit_b: cc.Label = null;
    // 缓存所有私牌 / 公牌节点数组, 方便遍历
    private handCardNodes: cc.Node[] = [];
    private publicCardNodes: cc.Node[] = [];
    private publicCardNodesB: cc.Node[] = [];

    onLoad() {
        this.initNodes();
    }

    private initNodes() {
        const node = this.node;
        this.playHeadImg = node.getChildByName('playHeadImg');
        this.playerName = cc.find('playHeadImg/playerName', node).getComponent(cc.Label);
        // 私牌 1~6
        this.cardS1 = node.getChildByName('cardS1');
        this.cardS2 = node.getChildByName('cardS2');
        this.cardS3 = node.getChildByName('cardS3');
        this.cardS4 = node.getChildByName('cardS4');
        this.cardS5 = node.getChildByName('cardS5');
        this.cardS6 = node.getChildByName('cardS6');
        this.handCardNodes = [this.cardS1, this.cardS2, this.cardS3, this.cardS4, this.cardS5, this.cardS6];
        // 公牌第一套
        this.cardP1 = node.getChildByName('cardP1');
        this.cardP2 = node.getChildByName('cardP2');
        this.cardP3 = node.getChildByName('cardP3');
        this.cardP4 = node.getChildByName('cardP4');
        this.cardP5 = node.getChildByName('cardP5');
        this.publicCardNodes = [this.cardP1, this.cardP2, this.cardP3, this.cardP4, this.cardP5];
        // 公牌第二套
        this.cardP1_b = node.getChildByName('cardP1_b');
        this.cardP2_b = node.getChildByName('cardP2_b');
        this.cardP3_b = node.getChildByName('cardP3_b');
        this.cardP4_b = node.getChildByName('cardP4_b');
        this.cardP5_b = node.getChildByName('cardP5_b');
        this.publicCardNodesB = [this.cardP1_b, this.cardP2_b, this.cardP3_b, this.cardP4_b, this.cardP5_b];
        this.ctLabel = cc.find('cardType/ctLabel', node).getComponent(cc.Label);
        this.opAction = node.getChildByName('opAction').getComponent(cc.Label);
        this.opNum = node.getChildByName('opNum').getComponent(cc.Label);
        this.profit = node.getChildByName('profit').getComponent(cc.Label);
        this.profit_b = node.getChildByName('profit_b').getComponent(cc.Label);
    }

    /**
     * 填充玩家数据到节点
     */
    setData(data: IPlayerCardData) {
        this.setName(data.userName);
        this.setHandCards(data.handCards);
        this.setPublicCards(data.publicCards, data.publicCards2);
        this.setCardType(data.cardType);
        this.setAction(data.actName, data.actChip, data.raiseTimes);
        this.setProfit(data.winAnte, data.isMine, data.publicCards2, data.winAnte2);
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

    /**
     * 设置手牌 (2~6张, 左对齐紧密排列)
     *
     * 算法:
     *   默认牌间距 = 牌宽 + 4px 可见间隙 (不重叠)
     *   若牌太多超出右边界, 则压缩间距以刚好填满 leftX~rightX
     *   spacing = min(牌宽+间隙, (rightX-leftX)/(count-1))
     *
     * 效果: 私牌在左侧紧密排列, 空间留给右侧与公牌的间隙
     */
    private setHandCards(cards: number[]) {
        const count = cards?.length || 0;
        if (count <= 0) {
            // 无手牌数据 → 显示牌背 (默认2张, 紧密排列)
            const spacing = HAND_CARD_WIDTH + HAND_CARD_VISIBLE_GAP;
            this.handCardNodes.forEach((card, i) => {
                if (i < 2) {
                    card.active = true;
                    card.x = HAND_CARD_LEFT_X + i * spacing;
                    card.y = HAND_CARD_Y;
                    card.zIndex = i;
                    card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(0), AssetFold.texture_SmallCard0);
                } else {
                    card.active = false;
                }
            });
            return;
        }
        // 紧密排列: 优先用不重叠间距, 牌多时压缩到右边界内
        const spacing = count > 1 ? Math.min(HAND_CARD_WIDTH + HAND_CARD_VISIBLE_GAP, (HAND_CARD_RIGHT_X - HAND_CARD_LEFT_X) / (count - 1)) : 0;
        for (let i = 0; i < this.handCardNodes.length; i++) {
            const card = this.handCardNodes[i];
            if (i < count) {
                card.active = true;
                card.x = count === 1 ? HAND_CARD_LEFT_X : HAND_CARD_LEFT_X + i * spacing;
                card.y = HAND_CARD_Y;
                card.zIndex = i; // 右侧牌在上层
                card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(cards[i] || 0), AssetFold.texture_SmallCard0);
            } else {
                card.active = false;
            }
        }
    }

    /**
     * 设置公共牌
     *
     * 单套牌局: 上排 (cardP1~P5) Y 移到与私牌相同位置, 下排隐藏
     * 双套牌局: 上排在原位 (y≈65), 下排在原位 (y≈-72)
     */
    private setPublicCards(publicCards: number[], publicCards2?: number[]) {
        const isDualBoard = publicCards2 && publicCards2.length > 0;
        const upperY = isDualBoard ? PUBLIC_CARD_UPPER_Y : PUBLIC_CARD_SINGLE_Y;
        // 单套牌局缩小容器高度, 双套牌局恢复原始高度
        this.node.height = isDualBoard ? 300 : 240;
        // 第一套公牌 (上排)
        this.publicCardNodes.forEach((card, index) => {
            if (publicCards && publicCards[index] > 0) {
                card.active = true;
                card.y = upperY;
                card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(publicCards[index]), AssetFold.texture_SmallCard0);
            } else {
                card.active = false;
            }
        });
        // 第二套公牌 (下排)
        if (isDualBoard) {
            this.publicCardNodesB.forEach((card, index) => {
                if (publicCards2[index] > 0) {
                    card.active = true;
                    card.y = PUBLIC_CARD_LOWER_Y;
                    card.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(publicCards2[index]),
                        AssetFold.texture_SmallCard0
                    );
                } else {
                    card.active = false;
                }
            });
        } else {
            // 单套牌局: 隐藏下排
            this.publicCardNodesB.forEach(card => {
                card.active = false;
            });
        }
    }

    /** 设置牌型名称 (根据 i18n 语言) */
    private setCardType(cardType: number) {
        let name = CardTypeUtil.GetCardTypeName(cardType);
        if (!name) {
            name = i18nMgr.Get('UITexas_fold') || '弃牌';
        }
        this.ctLabel.string = name;
    }

    /** 设置操作动作和金额 */
    private setAction(actName: string, actChip: number, raiseTimes: number) {
        const actNum = this.getActionNumByName(actName);
        let actionStr = '';
        if (actNum === 6 || actNum === 7) {
            if (raiseTimes <= 1) {
                actionStr = this.getActionI18N(actNum);
            } else if (raiseTimes === 2) {
                actionStr = this.getActionI18N(7);
            } else {
                actionStr = raiseTimes + this.getActionI18N(7);
            }
        } else {
            actionStr = this.getActionI18N(actNum);
        }
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
        switch (actNum) {
            case 4:
                return '过牌';
            case 5:
                return '偷鸡';
            case 8:
                return '3Bet';
            case 11:
                return '保险';
            default:
                return '';
        }
    }

    /**
     * 设置最终盈亏
     * 单套牌局: profit 显示, profit_b 隐藏
     * 双套牌局: profit 显示第一套盈亏, profit_b 显示第二套盈亏
     */
    private setProfit(winAnte: number, isMine: boolean, publicCards2?: number[], winAnte2?: number) {
        const isDualBoard = publicCards2 && publicCards2.length > 0;
        // 第一套盈亏
        this.profit.string = StringHelper.GetSignedLongString(winAnte);
        if (winAnte > 0) {
            this.profit.node.color = cc.color(250, 43, 75);
        } else if (winAnte < 0) {
            this.profit.node.color = cc.color(120, 228, 144);
        }
        // 第二套盈亏
        if (isDualBoard && winAnte2 != null) {
            this.profit_b.node.active = true;
            this.profit_b.string = StringHelper.GetSignedLongString(winAnte2);
            if (winAnte2 > 0) {
                this.profit_b.node.color = cc.color(250, 43, 75);
            } else if (winAnte2 < 0) {
                this.profit_b.node.color = cc.color(120, 228, 144);
            }
        } else {
            this.profit_b.node.active = false;
        }
        // 自己的金色高亮
        if (isMine) {
            this.playerName.node.color = cc.color(220, 186, 130);
            this.profit.node.color = cc.color(220, 186, 130);
            if (this.profit_b.node.active) {
                this.profit_b.node.color = cc.color(220, 186, 130);
            }
        }
    }

    /** 通过操作名字取得对应数组下标 */
    private getActionNumByName(actionName: string): number {
        switch (actionName) {
            case 'small blind':
                return 1;
            case 'big blind':
                return 2;
            case 'call':
                return 3;
            case 'check':
                return 4;
            case 'straddle':
                return 5;
            case 'bet':
                return 6;
            case 'raise':
                return 7;
            case 'all in':
                return 9;
            case 'fold':
                return 10;
            case 'insure':
                return 11;
            default:
                return 0;
        }
    }

    /** 重置节点数据 */
    resetData() {
        this.playerName.string = '';
        this.ctLabel.string = '';
        this.opAction.string = '';
        this.opNum.string = '';
        this.profit.string = '';
        this.profit_b.node.active = false;
        [...this.handCardNodes, ...this.publicCardNodes, ...this.publicCardNodesB].forEach(card => {
            card.active = false;
        });
    }
}
