
import BaseComponent from "../frame/base/BaseComponent";
import LanguageManager from "../frame/manager/LanguageManager";
import { ResManager } from "../manager/ResManager";
import CCTools from "../tools/CCTools";
import UIBase from "./UIBase";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBasePlus extends UIBase {

    /**
    * 需要声明的节点的命名规则 cc_Node$ABC cc_Sprite$ABC GG$ABC
    */
    protected load_all_object(root: cc.Node): void {
        root.children.forEach(child => {
            if (~child.name.indexOf("$")) {
                let cls = child.name.split("$")[0].replace("_", ".");
                if (cls == "") {
                    this[child.name] = child;
                } else {
                    this[child.name] = child.getComponent(cls);
                }
            }
            this.load_all_object(child);
        })
    }
}
