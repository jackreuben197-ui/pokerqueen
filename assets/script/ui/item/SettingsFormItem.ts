import { i18nLabel } from '../../i18n/i18nLabel';
import UIBase from '../UIBase';
const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingsFormItem extends UIBase {
    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    left_lab: i18nLabel = null;
    right_lab: i18nLabel = null;
    arrow: cc.Node = null;
    toggle_button: cc.Node = null;
    ///////////////////////////////////
    ///////////////////////////////////
    /**
     * 声明内容
     */
    label_colors = ['#FFFFFF', '#DDBA82'];

    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.left_lab = this.getChildNodeOrComponent('left_lab', i18nLabel);
        this.right_lab = this.getChildNodeOrComponent('right_lab', i18nLabel);
        this.arrow = this.getChildNodeOrComponent('arrow');
        this.toggle_button = this.getChildNodeOrComponent('toggle_button');
    }

    onShow(param?: { type: number; right_string: string; left_string: string }): void {
        super.onShow(param);
        this.left_lab.i18NString = param?.left_string;
        this.right_lab.i18NString = param?.right_string;
    }

    protected regiterTouchEvents(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchDown, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    //设置被选中
    onTouchDown() {
        let color = cc.Color.BLACK.fromHEX(this.label_colors[1]);
        this.left_lab.node.color = color;
        this.right_lab.node.color = color;
        this.arrow.color = color;
    }

    onTouchCancel() {
        let color = cc.Color.BLACK.fromHEX(this.label_colors[0]);
        this.left_lab.node.color = color;
        this.right_lab.node.color = color;
        this.arrow.color = color;
    }
}
