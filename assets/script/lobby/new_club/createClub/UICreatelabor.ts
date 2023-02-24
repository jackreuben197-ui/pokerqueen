/*
 * @Author: xfj
 * @Date: 2022-09-14 19:01:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 19:09:03
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createClub/UICreatelabor.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import WebImageHelper from "../../../helper/WebImageHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { APIOrgClubUploadIcon } from "../../../net/https/WebRequest";
import LoginSession from "../../../session/LoginSession";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import upLoadIcon from "../../upLoadIcon";
import { UIClubModel } from "../../labor/UIClubModel";
import ComFormTitle from "../../../common/ComFormTitle";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";



const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/createClub/UICreatelabor')
export default class UICreatelabor extends BaseForm {
    @property(cc.EditBox)
    editName: cc.EditBox = null;

    @property(cc.EditBox)
    editjieshao: cc.EditBox = null;

    @property(cc.EditBox)
    xinxi: cc.EditBox = null;
    @property(cc.Label)
    labelNum: cc.Label = null;
    @property(cc.Sprite)
    camera: cc.Sprite = null;
    @property(cc.Sprite)
    Round: cc.Sprite = null;
    iconUrl = null;
    private comFormTitle: ComFormTitle = null;
    commit: cc.Button = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.commit = this.getChildNodeOrComponent("commit", cc.Button);
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.editName.string = ''
        this.editjieshao.string = ''
        this.xinxi.string = ''
        this.comFormTitle.initData('club_2', this);
        this.camera.node.active = true
        this.Round.node.active = false
        this.clubNamechange()
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
        if (data.code == 0) {
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
    clubNamechange() {
        this.editName.string = this.editName.string.trim()
        this.labelNum.string = this.editjieshao.string.length + '/50'
        if (this.editName.string == '' || this.editjieshao.string == '' || this.xinxi.string == '') {
            this.commit.interactable = false
        } else {
            this.commit.interactable = true;
        }
    }
    changeIntroduce() {
    }
    async uploadIcon() {
        await UIClubModel.mInstance.APIOrgClubUploadIcon();
        let icon: any = APIOrgClubUploadIcon.Response.data
        if (icon) {
            this.iconUrl = icon
            WebImageHelper.SetHeadImage(this.Round, icon);
            this.camera.node.active = false
            this.Round.node.active = true
        }
    }
}
