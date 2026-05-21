import { i18nLabel } from '../../i18n/i18nLabel';
import AssetContext, { AssetFold } from '../component/AssetContext';
import GGToggleChild from '../component/GGToggleChild';
import GGToggleContainer from '../component/GGToggleContainer';
import { ILanguageFormItem } from '../form/LanguageForm';
import UIBase from '../UIBase';
const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageFormItem extends UIBase {
    /**
     * 节点|组件 定义
     */
    toggle: GGToggleChild = null;
    s_language_label: i18nLabel = null;
    language_label: cc.Label = null;
    ///////////////////////////////////
    /**
     * 声明内容
     */
    _param: ILanguageFormItem;
    label_colors = ['#FFFFFF', '#35A3B3'];

    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.toggle = this.getChildNodeOrComponent('toggle', GGToggleChild);
        //this.flag_icon = this.getChildNodeOrComponent("flag_icon", cc.Sprite);
        this.s_language_label = this.getChildNodeOrComponent('s_language_label', i18nLabel);
        this.language_label = this.getChildNodeOrComponent('language_label', cc.Label);
    }

    addToToggleContainer(container: GGToggleContainer) {
        container.addToggle(this.toggle);
    }

    onShow(param: ILanguageFormItem = null) {
        super.onShow(param);
        this.s_language_label.i18NString = param.s_language;
        this.language_label.string = param.language;
        //this.flag_icon.spriteFrame = AssetContext.getAsset<cc.SpriteFrame>(param.flag, AssetFold.texture_flag);
    }

    check() {
        this.toggle.check();
    }

    uncheck() {
        this.toggle.uncheck();
    }

    //设置被选中
    setSelected(boo: boolean) {
        this.s_language_label.node.color = cc.Color.BLACK.fromHEX(this.label_colors[boo ? 1 : 0]);
        this.language_label.node.color = cc.Color.BLACK.fromHEX(this.label_colors[boo ? 1 : 0]);
    }
}
