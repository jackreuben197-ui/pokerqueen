/*
 * @Author: xfj
 * @Date: 2022-11-05 10:09:19
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-24 11:35:40
 * @FilePath: /pokerqueen/assets/script/new_lobby/me/UIAccountManagement.ts
 */

import { match } from "assert";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import { APIGetBlindStatus } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import BaseForm from "../../ui/form/BaseForm";
import LoginScene from "../../ui/scene/LoginScene";
import UIComponent from "../../ui/UIComponent";
import ComFormTitle from "../../common/ComFormTitle";
import { i18nMgr } from "../../i18n/i18nMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAccountManagement extends BaseForm {
    @property(cc.Label)
    phone: cc.Label = null;

    @property(cc.Label)
    exmail: cc.Label = null;

    content: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();

        this.content = this.getChildNodeOrComponent("content");
    }

    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);

        this.content.children.forEach((item, i) => {
            item["index"] = i;
            item.on(cc.Node.EventType.TOUCH_END, this.onItemClick, this)
        });
        await LoginSession.APIGetBlindStatus()
        this.initBlindStatue();
    }
    /**
   * 注册广播事件
   */
    protected regiterDispatchEvent() {
        this.listen(EventName.refresh_bind, this.initBlindStatue);

    }
    private onItemClick(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];
        if (index == 0) {
            UIComponent.open(UIDefine.UIChangeAccount, 1);
        } else if (index == 1) {
            UIComponent.open(UIDefine.UIChangeAccount, 2);
        } else if (index == 2) {
            UIComponent.open(UIDefine.UIResetPassword);
        }
    }
    initBlindStatue() {
        let data: any = APIGetBlindStatus.Response?.data
        if (data.phone_status.status) {
            this.phone.string = this.splitString(data.phone_status.phone)
        } else {
            this.phone.string = i18nMgr.Get('UISetting_SecurityBindNo')
        }
        if (data.email_status.status) {
            this.exmail.string = this.splitString(data.email_status.email)
        } else {
            this.exmail.string = i18nMgr.Get('UISetting_SecurityBindNo')
        }
    }
    splitString(str: string) {
        str = str.substring(0, 4)
        return str + '...'
    }
}
