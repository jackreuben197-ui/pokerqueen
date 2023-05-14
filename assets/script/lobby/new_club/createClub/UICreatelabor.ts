/*
 * @Author: xfj
 * @Date: 2022-09-14 19:01:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-11 17:07:32
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
    // @property(cc.EditBox)
    // editName: cc.EditBox = null;

    // @property(cc.EditBox)
    // editjieshao: cc.EditBox = null;

    @property(cc.EditBox)
    xinxi: cc.EditBox = null;

    @property(cc.Sprite)
    camera: cc.Sprite = null;
    @property(cc.Sprite)
    Round: cc.Sprite = null;



    editName_label: cc.EditBox = null;
    editjieshao_label: cc.EditBox = null;

    editName_count_label: cc.Label = null;
    editjieshao_count_label: cc.Label = null;

    // @property(cc.Node)
    // canClick: cc.Node = null;
    // @property(cc.Node)
    // noClick: cc.Node = null;
    // @property(cc.Label)
    // btnTip: cc.Label = null;

    @property(cc.Label)
    tip: cc.Label = null;


    iconUrl = null;
    private comFormTitle: ComFormTitle = null;
    commit: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.commit = this.getChildNodeOrComponent("commit");

        this.editName_label = this.getChildNodeOrComponent("editName_label", cc.EditBox);
        this.editjieshao_label = this.getChildNodeOrComponent("editjieshao_label", cc.EditBox);
        this.editName_count_label = this.getChildNodeOrComponent("editName_count_label", cc.Label);
        this.editjieshao_count_label = this.getChildNodeOrComponent("editjieshao_count_label", cc.Label);

        this.setNameChangeHandler();
        this.setIntroduceChangeHandler();
    }

    setNameChangeHandler() {
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "UICreatelabor";
        handler.handler = "clubNamechange"
        this.editName_label.textChanged = [handler];
    }
    setIntroduceChangeHandler() {
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "UICreatelabor";
        handler.handler = "changeIntroduce"
        this.editjieshao_label.textChanged = [handler];
    }


    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);

        this.editName_label.string = "";
        this.editjieshao_label.string = "";
        this.xinxi.string = ''
        this.comFormTitle.initData('club_2', this);
        this.camera.node.active = true
        this.Round.node.active = false
        this.tip.string = i18nMgr.Get('UIMine_XHZS') + 10
        this.clubNamechange();
        this.changeIntroduce();

    }
    async commitClick() {



        this.editName_label.string = this.editName_label.string.trim();


        if (this.editName_label.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_4vH7wQnp'))
            return
        }
        if (this.editjieshao_label.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIClub_Creat_W1qXZpQJ'))
            return
        }
        if (this.xinxi.string == '') {
            UIComponent.Instance.Toast(i18nMgr.Get('UIGuild_InputContactInformation'))//
            return
        }

        let data: any = await UIClubModel.mInstance.APIOrgClubCreate(this.iconUrl || null, this.editName_label.string, this.editjieshao_label.string, this.xinxi.string)
        if (data.code == 0) {
            console.log('data===', data);
            UIComponent.Instance.Toast(i18nMgr.Get('club_creat_8'));
            this.iconUrl = null;
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
        this.editName_label.string = this.editName_label.string.trim();
        this.editName_count_label.string = this.editName_label.string.length + '/20';

        this.refreshCommitBtn();
    }
    changeIntroduce() {
        this.editjieshao_label.string = this.editjieshao_label.string.trim();
        this.editjieshao_count_label.string = this.editjieshao_label.string.length + '/160';

        this.refreshCommitBtn();
    }

    refreshCommitBtn() {

        if (this.editName_label.string == '' || this.editjieshao_label.string == '') {

            this.setButtonInteractable(this.commit, false);
        } else {

            this.setButtonInteractable(this.commit, true);
        }
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
