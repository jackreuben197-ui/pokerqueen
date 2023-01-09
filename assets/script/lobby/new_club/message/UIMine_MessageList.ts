import { UIDefine } from "../../../define/UIDefine";
import GC from "../../../frame/GameControl";
import { i18nMgr } from "../../../i18n/i18nMgr";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";




const { ccclass, property } = cc._decorator;

/**
 * 公会消息
 */

@ccclass
export default class UIMine_MessageList extends BaseFormPlus {

    $Options: cc.Node = null;

    protected _param: { enterType: number } = null;

    _oldIndex: number = null;

    _searchData: any = null;

    //根据进入类型显示选项状态 隐藏还是显示 1显示 0隐藏
    ShowStatus = {
        0: [0, 0, 0, 1],
        1: [1, 1, 1, 1],
        2: [1, 1, 1, 1]
    }
    protected lateLoad(): void {
        super.lateLoad();
        this.$Options.children.forEach((item, index) => {
            item["index"] = index;
            item.getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get(GC.message.Option_Text[index]);
            this.setButtonClick(item, this.optionClick);
        })
    }

    /**
     * 每次打开面板处理的内容 
     */
    onShow(param?: { enterType: number }, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        GC.message.enterType = param.enterType;
        this.refreshOption();
    }
    refreshOption() {
        let status = this.ShowStatus[this._param.enterType];
        this.$Options.children.forEach((item, index) => {
            item.active = !!status[index];
        })
    }

    optionClick(button: cc.Button) {
        let index = button.node["index"];
        switch (index) {
            case 0:
            case 1:
            case 2:
                UIComponent.open(UIDefine.UIMine_Message, { index: index });
                break;
            case 3:
                UIComponent.open(UIDefine.UIMsgIntoList, {});
                break;
        }
    }
}
