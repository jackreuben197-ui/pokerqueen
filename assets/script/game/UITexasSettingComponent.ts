/*
 * @Author: xfj
 * @Date: 2022-08-25 16:13:45
 * @description:  个性设置界面
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-08-25 18:12:57
 * @FilePath: /pokerqueen/assets/script/game/UITexasSettingComponent.ts
 */

import UIBase from "../ui/UIBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasSettingComponent extends UIBase {

    DeskGroup: cc.Node = null;
    Toggle_CardType: cc.Node = null;
    QuickActionGroup: cc.Node = null;
    Content: cc.Node = null;
    Button_Close: cc.Node = null;

    _selectDesk: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.DeskGroup = this.getChildNodeOrComponent("DeskGroup");
        this.Button_Close = this.getChildNodeOrComponent("Button_Close");
        this.Button_Close.on("click", () => {
            this.node.active = false;
        }, this);
        this.initDeskClickListen();
        this.initCardClickListen();
    }

    initDeskClickListen() {
        for (let index = 0; index < this.DeskGroup.childrenCount; index++) {
            const element = this.DeskGroup.children[index];
            element.on("click", this.setDeskGroup.bind(this), this);
        }
    }

    setDeskGroup(event): void {
        if (this._selectDesk) {
            this._selectDesk
            let Checkmark = cc.find('Background/Checkmark')
            // Checkmark
        }
    }

    initCardClickListen() {

    }

    setCardGroup(index: number): void {


    }

    // setLabelString() {

    // }
}
