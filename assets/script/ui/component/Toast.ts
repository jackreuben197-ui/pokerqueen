import LabelI18N from "../../i18n/LabelI18N";



const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends cc.Component {

    @property(LabelI18N)
    labelI18N: LabelI18N = null;

    setLabel(content: string) {
        this.labelI18N.key = content;
        this.labelI18N.translate();
    }

}
