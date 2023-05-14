/*
 * @Author: xfj
 * @Date: 2023-03-29 15:32:01
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-11 15:50:32
 * @FilePath: /pokerqueen/assets/script/login/UIEditMess.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import UIBase from "../ui/UIBase";
import { UIClubModel } from "../lobby/labor/UIClubModel";
import { APIOrgClubUploadIcon, Web_Config_Global_Config, Web_User_Modify_User_Info, WWW } from "../net/https/WebRequest";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { StringHelper } from "../helper/StringHelper";
import LobbySession from "../session/LobbySession";
import { Web_User_Info } from "../net/https/WebRequest";
import UIComponent from "../ui/UIComponent";
import { UIDefine } from "../define/UIDefine";
import { EventName } from "../config/EventName";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/lobby/login/UIEditMess')
export default class UIEditMess extends UIBase {

    icon: cc.Sprite = null;
    tip1: cc.Label = null;
    editName: cc.EditBox = null;
    numTip: cc.Label = null;
    commit: cc.Node = null;
    // canClick: cc.Node = null;
    // noClick: cc.Node = null;
    iconData = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent('icon', cc.Sprite)
        // this.canClick = this.getChildNodeOrComponent('canClick')
        // this.noClick = this.getChildNodeOrComponent('noClick')
        this.tip1 = this.getChildNodeOrComponent('tip1', cc.Label)
        this.numTip = this.getChildNodeOrComponent('numTip', cc.Label)
        this.editName = this.getChildNodeOrComponent('New EditBox', cc.EditBox);
        this.commit = this.getChildNodeOrComponent('commit');
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.iconData = null;
        await LobbySession.APIUserInfo();

        let priceData = JSON.parse(Web_Config_Global_Config.Response.data.user_modify_name_price);
        this.tip1.string = StringHelper.Format(i18nMgr.Get('UIMine_ChangeNameTipsZS'), [priceData.raw_price]);
        WebImageHelper.SetHeadImage(this.icon, Web_User_Info.Response.data.user.avatar);
        this.editName.string = Web_User_Info.Response.data.user.nickname
        this.editBoxChange();
    }

    editBoxChange() {
        //this.noClick.active = this.editName.string == '' || this.editName.string.toLowerCase() == 'player'


        console.log(this.editName.string != '', this.editName.string.toLowerCase() != 'player');

        this.setButtonInteractable(this.commit, (this.editName.string != '') && (this.editName.string.toLowerCase() != 'player'));

        //this.canClick.active = !this.noClick.active
        this.numTip.string = this.editName.string.length + '/10';
    }
    async uploadIcon() {

        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        this.iconData = icon;
        if (icon) {
            WebImageHelper.SetHeadImage(this.icon, icon);
        }
    }
    sureClick() {
        let parms = { nick_name: this.editName.string }
        if (this.iconData) {
            parms['avatar'] = this.iconData
        }
        WWW.Instance.CommonAPI(
            {
                web_class: Web_User_Modify_User_Info,
                body: parms
            }
        ).then(() => {
            Web_User_Info.Response.data.user.avatar = this.iconData
            Web_User_Info.Response.data.user.nickname = this.editName.string
            this.post(EventName.refreshUserData);
            UIComponent.close(UIDefine.UIEditMess)
        })
    }
}
