import { i18nMgr } from "./i18nMgr";

// const {ccclass, property} = cc._decorator;
const { ccclass, property, executeInEditMode, disallowMultiple, requireComponent, menu } = cc._decorator;
@ccclass
@executeInEditMode
//@requireComponent(cc.Label)
@disallowMultiple
export class i18nLabel extends cc.Component {
    @property({ visible: false })
    private i18n_string: string = "";

    @property({ visible: false })
    private i18n_params: string[] = [];

    start() {
        i18nMgr._addOrDelLabel(this, true);
        this._resetValue();
    }

    @property({ type: cc.String })
    get string() {
        return this.i18n_string;
    }

    set string(value: string) {
        this.i18n_string = value;

        this.setEndValue()
    }

    @property({ type: [cc.String] })
    get params() {
        return this.i18n_params;
    }

    set params(value: string[]) {
        this.i18n_params = value;

        this.setEndValue()
    }

    init(string: string, params: string[]) {
        this.i18n_string = string;
        this.i18n_params = params;

        this.setEndValue()
    }

    private setEndValue() {
        let label: any = this.getComponent(cc.Label);
        if (cc.isValid(label)) {
            label.string = i18nMgr._getLabel(this.i18n_string);
        }
        label = this.getComponent(cc.RichText);
        if (cc.isValid(label)) {
            label.string = i18nMgr._getLabel(this.i18n_string);
        }
        label = this.getComponent(cc.EditBox);
        if (cc.isValid(label)) {
            label.placeholder = i18nMgr._getLabel(this.i18n_string);
        }
    }

    _resetValue() {
        this.string = this.i18n_string;
    }

    onDestroy() {
        i18nMgr._addOrDelLabel(this, false);
    }
}
