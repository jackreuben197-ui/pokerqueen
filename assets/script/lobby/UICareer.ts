/*
 * @Author: xfj
 * @Date: 2022-08-22 00:32:52
 * @description: 
 * @LastEditors: 
 * @LastEditTime: 2022-09-19 13:28:55
 * @FilePath: /pokerqueen/assets/script/lobby/UICareer.ts
 */
const { ccclass, property } = cc._decorator;
import UIBase from "../../../assets/script/ui/UIBase";
@ccclass
export default class UICareer extends UIBase {
    onLoad(): void {
        super.onLoad();
        let widget: cc.Widget = this.node.getComponent(cc.Widget);
        widget.target = cc.find("Canvas");
    }
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param?: any): void {

    }
}
