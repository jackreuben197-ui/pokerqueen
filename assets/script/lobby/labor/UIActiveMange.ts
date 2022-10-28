/*
 * @Author: xfj
 * @Date: 2022-10-28 11:00:04
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-28 11:45:07
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIActiveMange.ts
 */

import WebImageHelper from "../../helper/WebImageHelper";
import { APIOrgClubUploadIcon } from "../../net/https/WebRequest";
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

    iconUrl = null;
    activeType = 1;
    picType = 1
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
        this.picType = Number(customData)
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
    buttonCommitClick() {
        if (this.activeType == 1) {
            this.iconUrl
        }
        else if (this.activeType == 2) {
            this.picType
            this.editBox.string = '';
        }
    }
}
