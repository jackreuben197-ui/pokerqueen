/*
 * @Author: xfj
 * @Date: 2022-11-05 10:09:19
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-06 10:43:52
 * @FilePath: /pokerqueen/assets/script/lobby/view/UIMine_SafeAdmin.ts
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

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_SafeAdmin extends BaseForm {
    @property(cc.Label)
    phone: cc.Label = null;

    @property(cc.Label)
    exmail: cc.Label = null;

    @property(cc.Node)
    google: cc.Node = null;

    @property(cc.Node)
    ins: cc.Node = null;

    @property(cc.Node)
    face: cc.Node = null;

    @property(cc.Label)
    Text_Right: cc.Label = null;


    @property(cc.Label)
    third_status: cc.Label = null;
    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }

    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.comFormTitle.initData('UIMine_SafeAdmin', this);

        let Layout: cc.Node = this.getChildNodeOrComponent("Layout");
        Layout.children.forEach((item, i) => {
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
            UIComponent.open(UIDefine.UIMine_bindMess, 1);
        } else if (index == 1) {
            UIComponent.open(UIDefine.UIMine_bindMess, 2);
        } else if (index == 2) {
            UIComponent.open(UIDefine.UIMineThridBind);
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
            this.phone.string = this.splitString(data.phone_status.phone)
        } else {
            this.phone.string = '未绑定'
        }
        if (data.email_status.status) {
            this.exmail.string = this.splitString(data.email_status.email)
        } else {
            this.exmail.string = '未绑定'
        }
        let flag = false
        if (data.third_party_user_status.facebook.status) {
            this.face.active = true;
            flag = true
        }
        if (data.third_party_user_status.instagram.status) {
            this.ins.active = true
            flag = true
        }
        if (data.third_party_user_status.google.status) {
            this.google.active = true;
            flag = true
        }
        this.Text_Right.string = flag ? '已绑定' : '未绑定'
        console.log('aaaa===', data);
    }
    splitString(str: string) {
        str = str.substring(0, 4)
        return str + '...'
    }
}
