/*
 * @Author: xfj
 * @Date: 2023-02-24 13:22:46
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-05 11:41:37
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/lookClub/UIClubDigitalWallet.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseForm from "../../../ui/form/BaseForm";
import { UIClubModel } from "../../labor/UIClubModel";
import ComFormTitle from "../../../common/ComFormTitle";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { EventName } from "../../../config/EventName";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/lookClub/UIClubDigitalWallet')
export default class UIClubDigitalWallet extends BaseForm {
    @property(cc.EditBox)
    erc: cc.EditBox = null;

    @property(cc.EditBox)
    tpc: cc.EditBox = null;

    @property(cc.Button)
    sure_btn: cc.Button = null

    @property(cc.Node)
    canClick: cc.Node = null;

    @property(cc.Node)
    noClick: cc.Node = null;

    @property(cc.Label)
    btn_lbl: cc.Label = null;

    private comFormTitle: ComFormTitle = null;
    _type = 0
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.erc.string = ClubCache?.digital_wallet_erc || ''
        this.tpc.string = ClubCache?.digital_wallet_trc || ''
        this.editChange()
    }
    editChange() {
        this.sure_btn.interactable = this.erc.string != '' && this.tpc.string != ''
        this.setBtnState()
    }
    setBtnState() {
        this.canClick.active = this.sure_btn.interactable
        this.noClick.active = !this.sure_btn.interactable
        this.btn_lbl.node.color = this.sure_btn.interactable ? cc.color().fromHEX('#FFFFFF') : cc.color().fromHEX('#393956')
    }

    async sureClick() {
        ClubCache._msg.digital_wallet_erc = this.erc.string;
        ClubCache._msg.digital_wallet_trc = this.tpc.string;
        await UIClubModel.mInstance.modify_digital_wallet_address({ club_id: ClubCache.club_id, digital_wallet_erc: this.erc.string, digital_wallet_trc: this.tpc.string })
        this.close();
    }

}
