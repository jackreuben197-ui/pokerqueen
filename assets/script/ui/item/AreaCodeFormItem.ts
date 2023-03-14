
import UIBasePlus from "../UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AreaCodeFormItem extends UIBasePlus {
    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */
    country_label: cc.Label = null;
    code_label: cc.Label = null;
    button: cc.Button = null;
    ///////////////////////////////////

    ///////////////////////////////////
    /**
     * 声明内容
     */
    //label_colors = ["#FFFFFF", "#DDBA82"];
    ///////////////////////////////////
    protected lateLoad(): void {
        super.lateLoad();
        this.country_label = this.getChildNodeOrComponent("country_label", cc.Label);
        this.code_label = this.getChildNodeOrComponent("code_label", cc.Label);
        this.button = this.node.getComponent(cc.Button);
    }

    onShow(param?: { country: string, code: string }): void {
        super.onShow(param);
        this.country_label.string = param?.country;
        this.code_label.string = param?.code;
    }
    //设置被选中
    setSelected(boo: boolean) {
        //this.country_label.node.color = cc.Color.BLACK.fromHEX(this.label_colors[boo ? 1 : 0]);
        //this.button.normalColor = cc.Color.BLACK.fromHEX(this.label_colors[boo ? 1 : 0]);
    }
}
