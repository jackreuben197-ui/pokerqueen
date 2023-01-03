/*
 * @Author: xfj
 * @Date: 2022-10-18 15:16:01
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-03 09:55:20
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UISaveModel.ts
 */

import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UISaveModel')
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
