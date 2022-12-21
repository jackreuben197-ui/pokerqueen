/*
 * @Author: xfj
 * @Date: 2022-12-21 12:49:12
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-21 13:01:19
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubHome.ts
 */

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIClubHome')
export default class UIClubHome extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "UIClub_Home"
        this.comFormTitle.initData(title, this);
    }

}
