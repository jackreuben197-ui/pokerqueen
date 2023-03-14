import { i18nMgr } from "../../i18n/i18nMgr";
import BaseFormPlus from "../../ui/form/BaseFormPlus";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UILanguage extends BaseFormPlus {

    $content: cc.Node = null;

    config = [
        { lan: "en" },
        { lan: "pt" },
        { lan: "cn" }
    ]

    protected lateLoad(): void {
        super.lateLoad();
        this.$content.children.forEach((item, index) => {
            item["index"] = index;
            this.setButtonClick(item, this.click_item);
        })
    }

    /**
    * 每次打开面板处理的内容
    */
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.refreshChecks(param.lan)
    }

    refreshChecks(lan: string) {
        this.$content.children.forEach((item, index) => {
            this.setChildVisible(item, "button/check", this.config[index].lan == lan);
            this.setChildVisible(item, "button/uncheck", this.config[index].lan != lan);
        })
    }

    click_item(button: cc.Button) {
        let index = button.node["index"];
        let lan = this.config[index].lan;
        this.refreshChecks(lan);
        i18nMgr.setLanguage(lan);
        this._param.onChange?.();
    }
}
