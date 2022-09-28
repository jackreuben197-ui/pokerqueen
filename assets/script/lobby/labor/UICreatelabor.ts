/*
 * @Author: xfj
 * @Date: 2022-09-14 19:01:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-28 16:23:16
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreatelabor.ts
 */

import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
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
        if (this.editName.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_4vH7wQnp'))
            return
        }
        if (this.editjieshao.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_W1qXZpQJ'))
            return
        }
        if (this.xinxi.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('club_creat_7'))
            return
        }
        let data: any = await UIClubModel.mInstance.APIOrgClubCreate('http://static.awanptesting.com/awanptesting-dev/image-normal/20220816022147-IDFhc.jpg', this.editName.string, this.editjieshao.string, this.xinxi.string)
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
        let _data: any = await upLoadIcon.openFile(this.camera);
        console.log('_data===', _data);
        let data = new FormData()
        data.append("file", _data, _data.name);
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log('this.responseText====', this.responseText);
            }
        });
        xhr.open("POST", 'http://dev.k8s.awanptesting.com/api/oss/upload/image');
        xhr.setRequestHeader("md5at", LoginSession.Token);

        xhr.send(data);

    }
}
