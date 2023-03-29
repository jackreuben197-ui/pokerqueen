/*
 * @Author: xfj
 * @Date: 2023-03-29 15:32:01
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-29 16:11:17
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
import { APIOrgClubUploadIcon } from "../net/https/WebRequest";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { StringHelper } from "../helper/StringHelper";
import LobbySession from "../session/LobbySession";
import { Web_User_Info } from "../net/https/WebRequest";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/lobby/login/UIEditMess')
export default class UIEditMess extends UIBase {

    icon: cc.Sprite = null;
    tip1: cc.Label = null;
    editName: cc.EditBox = null;
    numTip: cc.Label = null;
    canClick: cc.Node = null;
    noClick: cc.Node = null;
    _callfunc: Function = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.icon = this.getChildNodeOrComponent('icon', cc.Sprite)
        this.canClick = this.getChildNodeOrComponent('canClick')
        this.noClick = this.getChildNodeOrComponent('noClick')
        this.tip1 = this.getChildNodeOrComponent('tip1', cc.Label)
        this.numTip = this.getChildNodeOrComponent('numTip', cc.Label)
        this.editName = this.getChildNodeOrComponent('editName', cc.EditBox)
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        // await LobbySession.APIUserInfo();
        this._callfunc = param.callfuc;
        this.tip1.string = StringHelper.Format(i18nMgr.Get('UIMine_UserInfoSettingNick_tips'), ['10']);
        WebImageHelper.SetHeadImage(this.icon, Web_User_Info.Response.data.user.avatar);
        this.editName.string = Web_User_Info.Response.data.user.nickname
        this.editBoxChange();
    }

    editBoxChange() {
        this.noClick.active = this.editName.string == ''
        this.canClick.active = !this.noClick.active
    }
    async uploadIcon() {

        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        if (icon) {
            WebImageHelper.SetHeadImage(this.icon, icon);
        }
    }
    sureClick() {
        if (this._callfunc) {
            this._callfunc();
        }
    }
}
