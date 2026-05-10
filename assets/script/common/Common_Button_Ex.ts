const { ccclass, property } = cc._decorator;

@ccclass
export default class Common_Button_Ex extends cc.Component {
    text_opacity = [52, 255];

    set interactable(boo: boolean) {
        let label = this.node.getChildByName('label');
        if (label) {
            label.opacity = this.text_opacity[+boo];
        }
    }
}
