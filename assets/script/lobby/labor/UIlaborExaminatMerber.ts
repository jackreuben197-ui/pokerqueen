/*
 * @Author: xfj
 * @Date: 2022-09-21 14:36:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-26 14:12:10
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIlaborExaminatMerber.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIlaborExaminatMerber extends BaseForm {

    @property(cc.Node)
    join: cc.Node = null
    @property(cc.Node)
    exit: cc.Node = null

    @property(cc.Node)
    joinList: cc.Node = null

    @property(cc.Node)
    exitList: cc.Node = null

    topBtnTye = ''
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.topBtnClick(null, 'join')
    }
    topBtnClick(event, customData) {
        if (this.topBtnTye == customData) return
        let joinLabel = this.join.getChildByName('TEXT_LABEL');
        let joinRectangle = this.join.getChildByName('Rectangle 14');
        let exitLabel = this.exit.getChildByName('TEXT_LABEL');
        let exitRectangle = this.exit.getChildByName('Rectangle 14');
        if (customData == 'join') {
            joinLabel.color = new cc.Color().fromHEX('#35A3B3')
            joinRectangle.active = true;
            exitLabel.color = new cc.Color().fromHEX('#FFFFFF')
            exitRectangle.active = false;
            this.initJoinList()
        } else {
            exitLabel.color = new cc.Color().fromHEX('#35A3B3')
            exitRectangle.active = true;
            joinLabel.color = new cc.Color().fromHEX('#FFFFFF')
            joinRectangle.active = false;
            this.exitJoinList()
        }
        this.topBtnTye = customData

    }

    async initJoinList() {
        this.joinList.active = true;
        this.exitList.active = false;
        await UIClubModel.mInstance.APIOrgClubGetJoinlList()

    }

    exitJoinList() {
        this.joinList.active = false;
        this.exitList.active = true;

    }



}
