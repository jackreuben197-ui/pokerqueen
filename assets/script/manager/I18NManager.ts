import Singleton from "../common/Singleton";
import LabelI18N from "../i18n/LabelI18N";


const { ccclass, property } = cc._decorator;

@ccclass
export default class I18NManager extends Singleton {

    static ins: I18NManager = null;

    cn_json = {
        "Please enter phone number": "请输入手机号码",
        "Please enter password": "请输入密码",
        "Log in": "登 录",
        "Alligator": "鳄鱼",
        "Reset Password": "重置密码",
    };
    en_json = {
        "Please enter phone number": "Please enter phone number",
        "Please enter password": "Please enter password",
        "Log in": "Log in",
        "Alligator": "Alligator",
        "Reset Password": "Reset Password"
    };

    language_json: {};

    labels: LabelI18N[] = [];

    languageType: number;

    // onLoad() {
    //     if (!I18NManager.ins) {
    //         I18NManager.ins = this;
    //     } else {
    //         this.destroy();
    //         return;
    //     }
    // }

    start(): void {
        this.transLanguage(0);
    }

    registerLabel(label: LabelI18N) {
        this.labels.push(label);
    }

    /**
     * 转换语言
     */
    transLanguage(type: number) {

        this.languageType = type;

        if (type == 0) {
            this.language_json = this.en_json;
        }
        if (type == 1) {
            this.language_json = this.cn_json;
        }

        for (let label of this.labels) {
            label.node.activeInHierarchy && label.translate();
        }

    }
    getValue(key: string) {
        return this.language_json?.[key] || key;
    }

}
