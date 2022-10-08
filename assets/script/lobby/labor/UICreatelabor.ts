/*
 * @Author: xfj
 * @Date: 2022-09-14 19:01:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-30 16:25:30
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreatelabor.ts
 */

import { UIDefine } from "../../define/UIDefine";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
import LoginSession from "../../session/LoginSession";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import upLoadIcon from "../upLoadIcon";
import { UIClubModel } from "./UIClubModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreatelabor extends BaseForm {
    @property(cc.EditBox)
    editName: cc.EditBox = null;

    @property(cc.EditBox)
    editjieshao: cc.EditBox = null;

    @property(cc.EditBox)
    xinxi: cc.EditBox = null;

    @property(cc.Sprite)
    camera: cc.Sprite = null;
    iconUrl = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        this.editName.string = ''
        this.editjieshao.string = ''
        this.xinxi.string = ''

    }
    async commitClick() {
        this.editName.string = this.editName.string.trim()
        if (this.editName.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_4vH7wQnp'))
            return
        }
        if (this.editjieshao.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_W1qXZpQJ'))
            return
        }
        if (this.xinxi.string == '') {
            UIComponent.Instance.Toast('请填写联系方式：如微信/199999')//i18nMgr.Get('club_creat_7')
            return
        }

        let data: any = await UIClubModel.mInstance.APIOrgClubCreate(this.iconUrl || null, this.editName.string, this.editjieshao.string, this.xinxi.string)
        if (data.code == 0 && data?.data?.club_apply) {
            console.log('data===', data);
            UIComponent.Instance.Toast(i18nMgr.Get('club_creat_8'));
            this.close();
            // UIComponent.Instance.Toast(i18nMgr.Get('club_tribe_0'));
            // await UIClubModel.mInstance.APIOrgClubGet()
            // UIComponent.open(UIDefine.UILaborPlayViewForm)
            return;
        }
        else {
            UIComponent.Instance.Toast(data.code);
        }
    }
    async uploadIcon() {
        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        if (icon) {
            this.iconUrl = icon
            WebImageHelper.SetUrlImage(this.camera, icon);
        }
    }
}
