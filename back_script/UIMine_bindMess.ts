/*
 * @Author: xfj
 * @Date: 2022-11-05 11:55:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-04-24 11:44:10
 * @FilePath: /pokerqueen/assets/script/new_lobby/me/UIChangeAccount.ts
 */
import ComFormTitle from "../../common/ComFormTitle";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIGetBlindStatus } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIChangeAccount extends BaseForm {
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.Node)
    phone: cc.Node = null;
    @property(cc.Node)
    email: cc.Node = null;
    @property(cc.Label)
    sureBtnLab: cc.Label = null;

    type = null;
    private comFormTitle: ComFormTitle = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node) {
        super.onShow(param, fromUI);
        this.type = param;
        this.initUI()
    }
    /**
    * 注册广播事件
    */
    protected regiterDispatchEvent() {
        this.listen(EventName.refresh_bind, this.initUI);

    }
    initUI() {
        let data: any = APIGetBlindStatus.Response?.data

        this.setBindStatue(this.phone, data.phone_status.status, this.type)
        this.setBindStatue(this.email, data.email_status.status, this.type)

        console.log('aaaa===', data);
        this.phone.active = this.type == 1
        this.email.active = this.type == 2
        let title = this.type == 1 ? 'UIMine_BindPhone' : 'UIMine_BindEmail'

        if (this.type == 1) {
            if (data.phone_status.status) {
                this.sureBtnLab.string = i18nMgr.Get('UISetting_SecurityBindChange') + i18nMgr.Get('UISetting_SecurityBindTelNum')
            } else {
                this.sureBtnLab.string = i18nMgr.Get('UISetting_SecurityBindTel')
            }
        } else {
            if (data.email_status.status) {
                this.sureBtnLab.string = i18nMgr.Get('UISetting_SecurityBindChange') + i18nMgr.Get('UISetting_SecurityBindEmailNum')
            } else {
                this.sureBtnLab.string = i18nMgr.Get('UISetting_SecurityBindEmail')
            }
        }
        this.comFormTitle.initData(this.sureBtnLab.string, this);

    }
    setBindStatue(node, flag, type) {
        node.getChildByName('haveBind').active = flag
        node.getChildByName('noBind').active = !flag
        let data: any = APIGetBlindStatus.Response?.data
        if (flag && type == 1) {
            let lbl_phone: cc.Node = node.getChildByName('haveBind').getChildByName('Text_title')
            lbl_phone.getComponent(cc.Label).string = '你的手机号: ' + data.phone_status.phone
        } else {
            let lbl_phone: cc.Node = node.getChildByName('haveBind').getChildByName('Text_title')
            lbl_phone.getComponent(cc.Label).string = '你的邮箱号: ' + data.email_status.email
        }
    }
    btnClick() {
        UIComponent.open(UIDefine.UIMineChangeBind, this.type);
    }
}
