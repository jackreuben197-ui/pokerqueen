/*
 * @Author: xfj
 * @Date: 2023-02-24 13:22:46
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-24 13:57:02
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/lookClub/UIClubEdit.ts
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

@menu('脚本分组/new_club/lookClub/UIClubEdit')
export default class UIClubEdit extends BaseForm {
    @property(cc.EditBox)
    introduce: cc.EditBox = null;

    @property(cc.EditBox)
    more_contect: cc.EditBox = null;

    @property(cc.Button)
    sure_btn: cc.Button = null;

    private comFormTitle: ComFormTitle = null;
    _type = 0
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this._type = param.type
        let title = this._type == 0 ? 'UIClub_EditIntro' : "UIClub_InfoContact"
        this.introduce.node.parent.active = this._type == 0
        this.more_contect.node.parent.active = this._type == 1
        this.comFormTitle.initData(title, this);
        this.introduce.string = ClubCache.desc
        this.more_contect.string = ClubCache.more_contact
    }
    editChange() {
        if (this._type == 0) {
            this.sure_btn.interactable = this.introduce.string != ''
        } else {
            this.sure_btn.interactable = this.more_contect.string != ''
        }
    }
    async sureClick() {
        if (this._type == 0) {
            ClubCache._msg.desc = this.introduce.string;
            await UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, desc: this.introduce.string })

        } else {
            ClubCache._msg.more_contact = this.more_contect.string
            await UIClubModel.mInstance.APIOrgChangeClubData({ club_id: ClubCache.club_id, more_contact: this.more_contect.string })

        }
        this.post(EventName.refreshMess)
        this.close();
    }

}
