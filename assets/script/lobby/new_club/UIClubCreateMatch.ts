/*
 * @Author: xfj
 * @Date: 2022-10-17 13:50:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-24 13:20:06
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubCreateMatch.ts
 */
import BaseForm from "../../ui/form/BaseForm";

import ComFormTitle from "../../common/ComFormTitle";
import { i18nMgr } from "../../i18n/i18nMgr";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UIClubCreateMatch')
export default class UIClubCreateMatch extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
    }
    onShow(data?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(data, fromUI, sceneUI);
        let title = "UIClub_MatchTable"
        this.comFormTitle.initData(title, this);
    }

}
