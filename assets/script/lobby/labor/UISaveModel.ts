/*
 * @Author: xfj
 * @Date: 2022-10-18 15:16:01
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-18 15:23:38
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UISaveModel.ts
 */

import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UISaveModel extends cc.Component {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;
    delagate = null;
    cancelClick() {
        this.node.destroy();
    }
    sureClick() {
        this.EditBox.string.trim();
        if (this.EditBox.string == '') {
            UIComponent.Instance.Toast('模版名称不能为空');
        } else {
            this.node.destroy();
            this.delagate.upLoadData(this.EditBox.string)
        }
    }

    // update (dt) {}
}
