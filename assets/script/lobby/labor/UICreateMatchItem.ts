/*
 * @Author: xfj
 * @Date: 2022-10-17 11:45:09
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-17 12:00:16
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatchItem.ts
 */

import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateMatchItem extends cc.Component {
    _target = null;
    initData(data, target) {
        this._target = target
    }
    benganMatch() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: '使用模版某某某开局',
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                },
                noAnimation: true,
            });
    }
    editModel() {

    }
    delateModel() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: '确定删除模版某某某',
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    this._target.refreshModelNum()
                    this.node.removeFromParent();
                },
                noAnimation: true,
            });
    }


    // update (dt) {}
}
