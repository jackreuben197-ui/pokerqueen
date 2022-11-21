/*
 * @Author: xfj
 * @Date: 2022-11-05 14:31:49
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-21 17:49:45
 * @FilePath: /pokerqueen/assets/script/lobby/view/UIMineThridBind.ts
 */

import { EventName } from "../../config/EventName";
import GC from "../../frame/GameControl";
import { APIGetBlindStatus } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineThridBind extends BaseForm {
    @property(cc.Node)
    google: cc.Node = null

    @property(cc.Node)
    facebook: cc.Node = null

    @property(cc.Node)
    instragram: cc.Node = null

    @property(cc.Label)
    googleStatus: cc.Label = null

    @property(cc.Label)
    facebookStatus: cc.Label = null

    @property(cc.Label)
    instragramStatus: cc.Label = null

    protected lateLoad(): void {
        super.lateLoad();
    }

    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.initUI()
    }
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
    }

    initUI() {

        let data: any = APIGetBlindStatus.Response?.data
        this.facebookStatus.string = data.third_party_user_status.facebook.status ? '已绑定' : '未绑定'
        this.instragramStatus.string = data.third_party_user_status.instagram.status ? '已绑定' : '未绑定'
        this.googleStatus.string = data.third_party_user_status.google.status ? '已绑定' : '未绑定'


        if (!data.third_party_user_status.facebook.status) {
            this.bindClick(this.facebook, this.clickFaceBook, null, true);

        }
        if (!data.third_party_user_status.instagram.status) {

            this.bindClick(this.instragram, this.clickInstagram, null, true);
        }
        if (!data.third_party_user_status.google.status) {
            this.bindClick(this.google, this.clickGoogle, null, true);

        }

    }
    async thridFunc(parms) {
        console.log('-------', parms)

        let data = await LoginSession.APIBindThrid(parms)
        await LoginSession.APIGetBlindStatus()
        this.post(EventName.refresh_bind)
        console.log('-------', data)

        this.initUI()
    }
    /*** 第三方登录 ***/
    clickGoogle() {
        GC.sdk.googleLogin(this.thridFunc)
    }
    clickFaceBook() {
        GC.sdk.faceBookLogin(this.thridFunc);
    }
    clickInstagram() {
        GC.sdk.instagramLogin(this.thridFunc);
    }

}
