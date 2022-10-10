
import { i18nMgr } from "../i18n/i18nMgr";
import UIBase from "../ui/UIBase";
import UIComponent from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import { GameType, PokerType } from "./GameUtil";

/*
 * @Author: xfj
 * @Date: 2022-08-30 17:02:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-01 10:39:02
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
    protected lateLoad(): void {
        super.lateLoad();
        this.ScrollView = this.getChildNodeOrComponent('ScrollView');
        this.CardType = this.getChildNodeOrComponent('CardType');
        this.RulerText = this.getChildNodeOrComponent('RulerText').getComponent(cc.RichText);
        this.ImageMaskClose = this.getChildNodeOrComponent('ImageMaskClose')
        this.ImageMaskClose.on("click", () => {
            //this.node.active = false
            UIComponent.close(this.UIDefine);
        }, this)
        this.titelGroup = this.getChildNodeOrComponent('ToggleGroup')
        this.initTitle();
        this.setWidgetState();

    }
    initTitle() {

        for (let index = 0; index < this.titelGroup.childrenCount; index++) {
            const element = this.titelGroup.children[index];
            element.on("click", this.titleClick, this);
            element['index'] = index;
        }
    }
    titleClick(event) {
        for (let index = 0; index < this.titelGroup.childrenCount; index++) {
            const element = this.titelGroup.children[index];

            let text = element.getChildByName('text');
            text.color = new cc.Color().fromHEX("#FFFFFF");
            let Checkmark = text.getChildByName('Checkmark');
            Checkmark.active = false;
        }
        event.node.getChildByName('text').getChildByName('Checkmark').active = true
        event.node.getChildByName('text').color = new cc.Color().fromHEX("#35A3B3");
        this.setWidgetState(event.node['index'])
    }
    setWidgetState(index = 0) {
        this.RulerText.node.active = false;
        this.CardType.active = false;
        if (index == 0) {
            this.RulerText.node.active = true;
            let rulerStr = "";
            if (GameCache.Instance.game_type == GameType.Holdem) {
                rulerStr = i18nMgr.Get("UITexasRule_Introduce");
            }
            else if (GameCache.Instance.game_type == GameType.Omaha4) {
                rulerStr = i18nMgr.Get("UIPlO4Rule_Introduce");
            }
            else if (GameCache.Instance.game_type == GameType.Omaha5) {
                rulerStr = i18nMgr.Get("UIPlO5Rule_Introduce");
            }
            else if (GameCache.Instance.game_type == GameType.Omaha6) {
                rulerStr = i18nMgr.Get("UIPlO6Rule_Introduce");
            }
            if (GameCache.Instance.poker_type == PokerType.SixPlus) {
                rulerStr += i18nMgr.Get("UI6Plus_Introduce");
            }
            rulerStr = rulerStr.replace(/\\n/g, '<br/>')
            this.RulerText.string = rulerStr;

        } else if (index == 1) {
            this.CardType.active = true;
        }

    }

}
