/*
 * @Author: xfj
 * @Date: 2023-03-07 11:56:39
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-15 18:54:05
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIKeyNode.ts
 */

import { UIDefine } from "../../../define/UIDefine";
import BaseForm from "../../../ui/form/BaseForm";
import UIBase from "../../../ui/UIBase";
import UIComponent from "../../../ui/UIComponent";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIKeyNode')
export default class UIKeyNode extends UIBase {

    private cb: Function = null;
    protected lateLoad(): void {
        super.lateLoad();

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.cb = param.cb
    }
    keyNodeClick(event, customData) {
        this.cb(customData)
    }
    closeLayer() {
        UIComponent.close(UIDefine.UIKeyNode)
    }
}
