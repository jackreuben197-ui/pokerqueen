

const { ccclass, property } = cc._decorator;

@ccclass
export default class LanguageFormItem extends cc.Component {

    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    start() {

    }

    // update (dt) {}
}
