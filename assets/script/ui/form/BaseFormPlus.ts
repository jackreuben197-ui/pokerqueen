

import ComFormTitle from "../../common/ComFormTitle";
import { i18nLabel } from "../../i18n/i18nLabel";
import BaseForm from "./BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseFormPlus extends BaseForm {

    protected ComFormTitle$title: ComFormTitle = null;

    protected lateLoad() {
        super.lateLoad();
        this.move_node = this.node.getChildByName("main");
        if (this.ComFormTitle$title) {
            this.title_label = cc.find("comTopUI/title_label", this.ComFormTitle$title.node).getComponent(i18nLabel);
            this.back_click = cc.find("comTopUI/back_click", this.ComFormTitle$title.node)
        } else {
            this.title_label = cc.find("comFormTitle/comTopUI/title_label", this.move_node).getComponent(i18nLabel);
            this.back_click = cc.find("comFormTitle/comTopUI/back_click", this.move_node)
        }
        this.content = this.move_node.getChildByName("content - 内容填充");
        this.top_block = this.move_node.getChildByName("top_block");;
        if (this.title_label) {
            this.title_label.i18NString = this.UIDefine?.Title || "";
        }
    }

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
