import { EventName } from "../config/EventName";
import { i18nLabel } from "../i18n/i18nLabel";
import UIBase from "../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;

export type TTabToggleData = {
    title?: Array<string>,
    params?: Array<any>
}

export enum ETabToggle {
    text,
    sprite
}

@ccclass
@menu('common/ComTabToggles')
export default class ComTabToggles extends UIBase {
    @property([cc.Node])
    tabToggles: cc.Node[] = [];

    private _onToggle: (index, data) => boolean = null;
    private _tabIndex: number = -1;
    private _type: ETabToggle = ETabToggle.sprite;
    private _params: Array<any> = null;
    private _titles: Array<string> = [];
    onLoad() {
        super.onLoad();
        this.initView();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    initView() {
        this._tabIndex = -1;
        this.tabToggles.forEach((node, index) => {
            this.bindClick(node, this._onTabClick, index);
        })
    }

    initData(toggles: any, type: ETabToggle = ETabToggle.sprite, data?: TTabToggleData) {
        this.type = type;
        this.data = data;
        this.onToggle = toggles;
    }

    get toggles() {
        return this.tabToggles;
    }

    get tabIndex() {
        return this._tabIndex;
    }
    set tabIndex(index: number) {
        this._tabIndex = index;
    }
    set onToggle(t) {
        this._onToggle = t;
    }
    set type(t) {
        this._type = t;
    }

    set data(data: TTabToggleData) {
        if (data) {
            this.setParams(data.params);
            this.setTitles(data.title);
        }
    }

    setParams(params: Array<any>) {
        this._params = params || null;
    }

    setTitles(titles: Array<string>) {
        if (titles) {
            this._titles = titles;
            this.tabToggles.forEach((node, index) => {
                this.setActive(node, index < titles.length);
                if (node.active) {
                    if (this._type == ETabToggle.text) {
                        this.setTesti18(node.getChildByName("text"), titles[index])
                    } else {
                        this.setTesti18(node.getChildByName('normal').getChildByName("text"), titles[index])
                        this.setTesti18(node.getChildByName('selected').getChildByName("text"), titles[index])
                    }
                }
            })
        }
    }

    setTesti18(testNode: cc.Node, key) {
        if (testNode) {
            let i18 = testNode.getComponent(i18nLabel);
            if (i18) {
                i18.i18NString = key;
            } else {
                this.setText(testNode.getComponent(cc.Label), key)
            }
        }
    }

    clickTab(index: number = 0, data: any = null, farce: boolean = false) {
        farce && (this._tabIndex = -1);
        this._onTabClick(index, data);
    }

    setTabTo(index) {
        this._tabIndex = index;
        this._changeTabStatus();
    }

    private async _onTabClick(index: number, data?: any) {
        if (index != this._tabIndex) {
            let param = data ? data : (this._params ? this._params[index] : null);
            let suc = await this._onToggle(index, param);
            if (suc || suc == undefined) {
                this.setTabTo(index);
            }
        }
    }

    private _changeTabStatus() {
        this.tabToggles.forEach((node, index) => {
            if (this._type == ETabToggle.text) {
                let text = node.getChildByName('text').getComponent(cc.Label);
                let line = node.getChildByName('line');
                line.active = this._tabIndex == index;
                this.setTextColor(text, "#EEF5FF");
                node.opacity = this._tabIndex == index ? 255 : 100
            } else {
                let textNormal = node.getChildByName('normal');
                let textSelected = node.getChildByName('selected');
                textNormal.active = this._tabIndex != index;
                textSelected.active = this._tabIndex == index;
            }
        })
    }
}
