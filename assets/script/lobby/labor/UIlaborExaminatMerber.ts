/*
 * @Author: xfj
 * @Date: 2022-09-21 14:36:14
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 15:31:33
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
import { Web_Org_Club_Get, APIOrgClubGetJoinlList, } from "../../net/https/WebRequest";
import WebImageHelper from "../../helper/WebImageHelper";
import { LobbyControl } from "../control/LobbyControl";
import GGEvent from "../../event/GGEvent";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIlaborExaminatMerber')
export default class UIlaborExaminatMerber extends BaseForm {

    @property(cc.Node)
    join: cc.Node = null
    @property(cc.Node)
    exit: cc.Node = null

    @property(cc.Node)
    joinList: cc.Node = null

    @property(cc.Node)
    exitList: cc.Node = null

    @property(cc.Node)
    joinContent: cc.Node = null

    @property(cc.Node)
    exitContent: cc.Node = null

    @property(cc.Node)
    item: cc.Node = null

    @property(cc.Node)
    itemAgree: cc.Node = null


    topBtnTye = ''
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.topBtnClick(null, 'join')
    }

    topBtnClick(event, customData) {
        if (this.topBtnTye == customData) return
        this.topBtnTye = customData
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


    }
    async initJoinList() {
        this.joinList.active = true;
        this.exitList.active = false;
        this.joinContent.removeAllChildren();

        let data: any = APIOrgClubGetJoinlList.Response.data
        for (let index = 0; index < data?.data.length; index++) {
            const element = data?.data[index];
            let item = cc.instantiate(this.itemAgree);
            item.parent = this.joinContent;
            item.getChildByName('name').getComponent(cc.Label).string = element.nickname
            item.getChildByName('id').getComponent(cc.Label).string = element.user_random_id
            let icon = cc.find('iconMask/icon', item);
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), element.avatar)
            let refuse = cc.find('btnNode/refuse', item)
            refuse.on(cc.Node.EventType.TOUCH_END, () => {
                UIClubModel.mInstance.APIOrgClubApprovalJoin(element.id, 3);
                item.active = false
            }, this)

            let agree = cc.find('btnNode/agree', item)
            agree.on(cc.Node.EventType.TOUCH_END, () => {
                UIClubModel.mInstance.APIOrgClubApprovalJoin(element.id, 2);
                item.active = false
                this.post(GGEvent.CLUB_DELE_USER);
            }, this)
            item.active = true

        }

    }

    async exitJoinList() {
        this.joinList.active = false;
        this.exitList.active = true;

        this.joinContent.removeAllChildren();

        let info = {
            limit: 100,   
            offset: 0,
        }
        LobbyControl.getInstance().reqClubQuitList(info).then(
            (event: any) => {
                if (event.data == null) {
                    return;
                }
                let data = event.data.data;
                if (data == null) {
                    return;
                }
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    let item = cc.instantiate(this.itemAgree);
                    item.parent = this.joinContent;
                    item.getChildByName('name').getComponent(cc.Label).string = element.nickname
                    item.getChildByName('id').getComponent(cc.Label).string = element.user_random_id
                    let icon = cc.find('iconMask/icon', item);
                    WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), element.avatar)
                    let refuse = cc.find('btnNode/refuse', item)
                    refuse.on(cc.Node.EventType.TOUCH_END, () => {
                        UIClubModel.mInstance.APIOrgClubApprovalJoin(element.id, 3);
                        item.active = false
                    }, this)
        
                    let agree = cc.find('btnNode/agree', item)
                    agree.on(cc.Node.EventType.TOUCH_END, () => {
                        UIClubModel.mInstance.APIOrgClubApprovalJoin(element.id, 2);
                        item.active = false
                        this.post(GGEvent.CLUB_DELE_USER);
                    }, this)
                    item.active = true
        
                }
            },
            (res) => {
            }
        )
        

    }



}
