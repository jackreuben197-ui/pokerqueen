import { i18nMgr } from '../i18n/i18nMgr';
import UIBase from '../ui/UIBase';
import UIComponent from '../ui/UIComponent';
import AssetContext, { AssetFold } from '../ui/component/AssetContext';
import { GameCache } from './GameCache';
import GameUtil, { GameType, PokerType } from './util/GameUtil';
/*
 * @Author: xfj
 * @Date: 2022-08-30 17:02:35
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-23 10:20:08
 * @FilePath: /pokerqueen/assets/script/game/UITexasRule.ts
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasRule extends UIBase {
    titelGroup: cc.Node = null;
    ImageMaskClose: cc.Node = null;
    ScrollView: cc.Node = null;
    RulerText: cc.RichText = null;
    CardType: cc.Node = null;
    list = [
        [9, 10, 11, 12, 0], //皇家同花顺
        [19, 20, 21, 22, 23], //同花顺
        [0, 13, 26, 39, 37], //四条
        [38, 51, 12, 35, 48], //葫芦
        [17, 18, 20, 21, 23], //同花
        [18, 32, 33, 21, 22], //顺子
        [24, 37, 11, 35, 0], //三条
        [19, 24, 50, 0, 13], //两对
        [6, 19, 33, 44, 48], //一对
        [7, 24, 0, 48, 29] //高牌
    ];

    protected lateLoad(): void {
        super.lateLoad();
        this.ScrollView = this.getChildNodeOrComponent('ScrollView');
        this.CardType = this.getChildNodeOrComponent('CardType');
        this.RulerText = this.getChildNodeOrComponent('RulerText').getComponent(cc.RichText);
        this.ImageMaskClose = this.getChildNodeOrComponent('ImageMaskClose');
        this.ImageMaskClose.on(
            'click',
            () => {
                //this.node.active = false
                UIComponent.close(this.UIDefine);
            },
            this
        );
        this.titelGroup = this.getChildNodeOrComponent('ToggleGroup');
        this.initTitle();
        this.setWidgetState();
        this.initPoker();
    }

    initPoker() {
        this.CardType.children.forEach((item, index) => {
            //this.setChildSprite()
            for (let i = 0; i < 5; i++) {
                item.children[i].getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(`p_${this.list[index][i]}`, AssetFold.texture_BigCard0);
            }
        });
    }

    initTitle() {
        for (let index = 0; index < this.titelGroup.childrenCount; index++) {
            const element = this.titelGroup.children[index];
            element.on('click', this.titleClick, this);
            element['index'] = index;
        }
    }

    titleClick(event) {
        for (let index = 0; index < this.titelGroup.childrenCount; index++) {
            const element = this.titelGroup.children[index];
            let text = element.getChildByName('text');
            text.color = new cc.Color().fromHEX('#757CAB');
            let Checkmark = text.getChildByName('Checkmark');
            Checkmark.active = false;
        }
        event.node.getChildByName('text').getChildByName('Checkmark').active = true;
        event.node.getChildByName('text').color = new cc.Color().fromHEX('#EEF5FF');
        this.setWidgetState(event.node['index']);
        this.scrollReset();
    }

    //滚动重置
    scrollReset() {
        let scroll = this.ScrollView.getComponent(cc.ScrollView);
        scroll.stopAutoScroll();
        scroll.scrollToTop();
    }

    setWidgetState(index = 0) {
        this.RulerText.node.active = false;
        this.CardType.active = false;
        if (index == 0) {
            this.RulerText.node.active = true;
            let rulerStr = '';
            if (GameCache.Instance.game_type == GameType.Holdem) {
                rulerStr = i18nMgr.Get('UITexasRule_Introduce');
            } else if (GameCache.Instance.game_type == GameType.Omaha4) {
                rulerStr = i18nMgr.Get('UIPlO4Rule_Introduce');
            } else if (GameCache.Instance.game_type == GameType.Omaha5) {
                rulerStr = i18nMgr.Get('UIPlO5Rule_Introduce');
            } else if (GameCache.Instance.game_type == GameType.Omaha6) {
                rulerStr = i18nMgr.Get('UIPlO6Rule_Introduce');
            }
            if (GameCache.Instance.poker_type == PokerType.SixPlus) {
                rulerStr += i18nMgr.Get('UI6Plus_Introduce');
            }
            const curGameAny = GameCache.Instance.CurGame as any;
            const isCriticalHitEnable = !!curGameAny?.criticalHitEnabled || Number((GameCache.Instance as any).room_critical_hit || 0) === 1;
            if (isCriticalHitEnable) {
                rulerStr += i18nMgr.Get('UICriticalHit_GameRuleTips').replace(/ /g, '\u00A0');
            }
            rulerStr = rulerStr.replace(/\\n/g, '<br/>');
            this.RulerText.string = rulerStr;
        } else if (index == 1) {
            this.CardType.active = true;
        }
    }
}
