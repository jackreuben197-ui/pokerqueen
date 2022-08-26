/*
 * @Author: xfj
 * @Date: 2022-08-25 16:13:45
 * @description:  个性设置界面
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-08-26 13:14:25
 * @FilePath: /pokerqueen/assets/script/game/UITexasSettingComponent.ts
 */

import UIBase from "../ui/UIBase";
import GameCache from "./GameCache";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasSettingComponent extends UIBase {

    DeskGroup: cc.Node = null;
    CardGroup: cc.Node = null;
    QuickActionGroup: cc.Node = null;
    Content: cc.Node = null;
    Button_Close: cc.Node = null;

    _selectDesk: cc.Node = null;
    _selectCardType: cc.Node = null;
    _selectQuickAction: cc.Node = null;

    curQuickActionIndex = 2;

    protected lateLoad(): void {
        super.lateLoad();
        this.DeskGroup = this.getChildNodeOrComponent("DeskGroup");
        this.CardGroup = this.getChildNodeOrComponent("CardGroup");
        this.QuickActionGroup = this.getChildNodeOrComponent("QuickActionGroup");

        this.Button_Close = this.getChildNodeOrComponent("Button_Close");
        this.Button_Close.on("click", () => {
            this.node.active = false;
        }, this);
        this.initDeskClickListen();
        this.initCardClickListen();
        this.initQuickActionListen();

    }
    /**
     * @method  牌桌背景
     */
    initDeskClickListen() {
        let index = GameCache.Instance.CurGame.deskType
        this._selectDesk = this.DeskGroup.children[index];
        let Checkmark = cc.find('Background/Checkmark', this._selectDesk)
        Checkmark.active = true;
        for (let index = 0; index < this.DeskGroup.childrenCount; index++) {
            const element = this.DeskGroup.children[index];
            element.on("click", this.setCheckmarkState, this);
            element['index'] = index
        }
    }
    setCheckmarkState(event): void {
        if (this._selectDesk) {
            let checkmark = cc.find('Background/Checkmark', this._selectDesk)
            checkmark.active = false;
        }
        this._selectDesk = event.node;
        let checkmark = cc.find('Background/Checkmark', this._selectDesk)
        checkmark.active = true;
        GameCache.Instance.CurGame.setDeskType(this._selectDesk['index'])
    }
    /**
    * @method  牌的样式
    */
    initCardClickListen() {
        this._selectCardType = this.CardGroup.children[0];
        let Checkmark = cc.find('Background/Checkmark', this._selectCardType)
        Checkmark.active = false;
        for (let index = 0; index < this.CardGroup.childrenCount; index++) {
            const element = this.CardGroup.children[index];
            element.on("click", this.setCardState, this);
            element['index'] = index
        }
    }

    setCardState(event): void {
        this._selectCardType = event.node;
        for (let index = 0; index < this.CardGroup.childrenCount; index++) {
            const element = this.CardGroup.children[index];
            let checkmark = cc.find('Background/Checkmark', element)
            checkmark.active = true;
        }
        let checkmark = cc.find('Background/Checkmark', this._selectCardType)
        checkmark.active = false;

    }

    initQuickActionListen() {
        this._selectQuickAction = this.QuickActionGroup.children[this.curQuickActionIndex];
        let Checkmark = cc.find('Background/Checkmark', this._selectDesk)
        Checkmark.active = true;
        for (let index = 0; index < this.QuickActionGroup.childrenCount; index++) {
            const element = this.QuickActionGroup.children[index];
            element.on("click", this.setQuickActionState, this);
            element['index'] = index
            let textCallPot = element.getChildByName('Text_CallPot').getComponent(cc.Label);
            let numStr = this.getCurQuickActionNum(index)
            if (numStr == "0") {
                numStr = "+";
                textCallPot.fontSize = 70;
            } else {
                textCallPot.fontSize = 40;
            }
            textCallPot.string = numStr;
        }
    }

    setQuickActionState(event) {
        if (this._selectQuickAction) {
            let checkmark = cc.find('Background/Checkmark', this._selectQuickAction)
            checkmark.active = false;
        }
        this._selectQuickAction = event.node;
        let checkmark = cc.find('Background/Checkmark', this._selectQuickAction)
        checkmark.active = true;
    }
    getCurQuickActionNum(index) {
        let defaultActionNums = ["0", "1/2", "2/3", "1x", "0"];
        let numStr = defaultActionNums[index] // PlayerPrefs.GetString(kQuickActionIndexKEY + $"{index}", defaultActionNums[index]);
        return numStr;
    }


    // public static GetCurQuickActionNumValue(index) {
    //     let defaultActionNums = [0f, 1.0f / 2, 2.0f / 3, 1.0f, 0f];
    //         float numValue = PlayerPrefs.GetFloat(kQuickActionIndexValueKEY + $"{index}", defaultActionNums[index]);
    //     return numValue;
    // }


}

