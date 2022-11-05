/*
 * @Author: xfj
 * @Date: 2022-11-05 10:09:19
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-05 11:29:45
 * @FilePath: /pokerqueen/assets/script/lobby/view/UIMine_SafeAdmin.ts
 */

import { match } from "assert";
import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import { APIGetBlindStatus } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import BaseForm from "../../ui/form/BaseForm";
import LoginScene from "../../ui/scene/LoginScene";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_SafeAdmin extends BaseForm {
    @property(cc.Label)
    phone: cc.Label = null;
    @property(cc.Label)
    exmail: cc.Label = null;
    @property(cc.Label)
    third_status: cc.Label = null;


    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        let Layout: cc.Node = this.getChildNodeOrComponent("Layout");
        Layout.children.forEach((item, i) => {
            item["index"] = i;
            item.on(cc.Node.EventType.TOUCH_END, this.onItemClick, this)
        });
        await LoginSession.APIGetBlindStatus()
        this.initBlindStatue();
    }
    private onItemClick(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];
        if (index == 1) {
            UIComponent.open(UIDefine.LanguageForm);
        } else if (index == 2) {
            UIComponent.open(UIDefine.LanguageForm);
        } else if (index == 3) {
            UIComponent.open(UIDefine.UIMine_SafeAdmin);
        }
        else {
            this.changeSwitchStyle(target.getChildByName("btn_switch"));
        }
    }

    changeSwitchStyle(btn_switch: cc.Node) {
        let open = btn_switch.getChildByName("open");
        let close = btn_switch.getChildByName("close");
        open.active = !open.active;
        close.active = !close.active;
    }

    initBlindStatue() {
        let data: any = APIGetBlindStatus.Response?.data
        if (data.phone_status.status) {
            StringHelper
            this.phone.string = this.splitString(data.phone_status.phone)
        }
        if (data.email_status.status) {
            this.exmail.string = data.phone_status.email
        }
        if (data.third_party_user_status) {

        }

        console.log('aaaa===', data);
    }
    splitString(str: string) {
        str = str.substring(0, 4)
        return str + '...'
    }
}
