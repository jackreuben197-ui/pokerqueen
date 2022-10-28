/*
 * @Author: xfj
 * @Date: 2022-10-28 11:00:04
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 20:15:28
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIActiveMange.ts
 */

import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubActivityCreate, APIOrgClubUploadIcon, Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "./UIClubModel";


const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIActiveMange')
export default class UIActiveMange extends BaseForm {

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(cc.Sprite)
    image: cc.Sprite = null;

    iconUrl = 0 + "";
    activeType = 2;
    picType = 1 + ''

    async onShow(param?: any) {
        super.onShow(param);

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }
    toggleClick(event, customData) {
        this.activeType = Number(customData)
    }

    selectPicToggle(event, customData) {
        this.picType = (customData)
    }

    async uploadIcon() {

        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
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
            description = ''
        }
        else if (this.activeType == 2) {
            this.iconUrl = this.picType
            description = this.editBox.string;
        }
        let data: any = Web_Org_Club_Get.Response.data;
        param = { club_id: data.club_id, activity_type: this.activeType, description: description, img_url: this.iconUrl };
        await UIClubModel.mInstance.APIOrgClubActivityCreate(param)

    }
}
