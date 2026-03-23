/*
 * @Author: xfj
 * @Date: 2022-10-28 11:00:04
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-05 13:21:12
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIActiveMange.ts
 */

import { EventName } from "../../config/EventName";
import WebImageHelper from "../../helper/WebImageHelper";
import { WebOrgClubActivityCreate, WebOrgClubUploadIcon, WebOrgClubGet } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";
import ComFormTitle from "../../common/ComFormTitle";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIActiveMange')
export default class UIActiveMange extends BaseForm {

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(cc.Sprite)
    image: cc.Sprite = null;
    @property(cc.Node)
    tipNode: cc.Node = null;

    iconUrl = 'active0';
    activeType = 2;
    picType = 'activeB1';
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.comFormTitle.initData('UIClub_ActiveAdmin', this);
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }
    toggleClick(event, customData) {
        this.activeType = Number(customData)
    }

    selectPicToggle(event, customData) {
        this.picType = 'activeB' + (customData)
    }

    async uploadIcon() {

        await UIClubModel.mInstance.WebOrgClubUploadIcon();
        let icon: any = WebOrgClubUploadIcon.Response.data
        if (icon) {
            this.iconUrl = icon
            await WebImageHelper.loadRemoteSprite(icon, this.image);
            WebImageHelper.setImageSize(this.image, 779, 308)
        }
    }
    async buttonCommitClick() {
        let param = {}
        let description = ''
        if (this.activeType == 1) {
            description = ' '
        }
        else if (this.activeType == 2) {
            this.iconUrl = this.picType
            description = this.editBox.string;
        }
        let data: any = WebOrgClubGet.Response.data;
        param = { club_id: data.club_id, activity_type: this.activeType, description: description, img_url: this.iconUrl };
        let _data: any = await UIClubModel.mInstance.WebOrgClubActivityCreate(param)
        if (_data.code == 0) {
            this.post(EventName.refreshActive);
            UIComponent.Instance.Toast("发布成功")
        }
    }
    tipNodeClick() {
        this.tipNode.active = !this.tipNode.active
    }
}
