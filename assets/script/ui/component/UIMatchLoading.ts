
import UIPromptComponent from "./UIPromptComponent";

const { ccclass } = cc._decorator;

@ccclass
export default class UIMatchLoading extends UIPromptComponent {
    protected mask_opacitys: number[] = [1, 255];
    protected lateLoad() {
        super.lateLoad();
        this.loading = this.getChildNodeOrComponent("loading_node");
    }
}
