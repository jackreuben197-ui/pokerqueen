/*
 * @Author: xfj
 * @Date: 2022-10-20 15:47:35
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-20 18:47:40
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateFriendMatchHome.ts
 */

import { UIDefine } from "../../define/UIDefine";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateFriendMatchHome extends UIBase {
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;

    @property(cc.Node)
    numNode: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any) {
        super.onShow(param);
        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
        }
    }
    createMatch() {
        UIComponent.open(UIDefine.UICreateMatch);
    }
    numNodeClick() {
        for (let index = 0; index < this.numNode.childrenCount; index++) {
            const element = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            element.string = '';
        }
        for (let index = 0; index < this.EditBox.string.length; index++) {
            const element = this.EditBox.string[index];
            const item = this.numNode.children[index].getChildByName('New Label').getComponent(cc.Label);
            item.string = element;
        }
    }

    // update (dt) {}
}
