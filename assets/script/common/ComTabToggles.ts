import UIBase from "../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;

export type TTabToggleData = {
    title?: Array<string>,
    data?: Array<any>
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
    private _data: TTabToggleData = null;
    private _type: ETabToggle = ETabToggle.sprite;
    onLoad() {
        super.onLoad();
        this.initView();
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
    get data() {
        return this._data;
    }

    set data(data: TTabToggleData) {
        this._data = data;
        if (data) {
            this.tabToggles.forEach((node, index) => {
                if (data?.title && index < data.title.length) {
                    if (this._type == ETabToggle.text) {
                        let text = node.getChildByName("text").getComponent(cc.Label);
                        text && this.setText(text, this._data.title[index]);
                    } else {
                        let textNormal = node.getChildByName('normal').getChildByName("text").getComponent(cc.Label);
                        let textSelected = node.getChildByName('selected').getChildByName("text").getComponent(cc.Label);
                        textNormal && this.setText(textNormal, this._data.title[index]);
                        textSelected && this.setText(textNormal, this._data.title[index]);
                    }
                }
                if (data?.data?.length) {
                    this.setActive(node, index < data.data.length);
                }
            })
        }

    }

    clickTab(index: number, data: any = null, farce: boolean = false) {
        farce && (this._tabIndex = -1);
        this._onTabClick(index, data);
    }

    setTabTo(index) {
        this._tabIndex = index;
        this._changeTabStatus();
    }

    private async _onTabClick(index: number, data?: any) {
        if (index != this._tabIndex) {
            let param = data ? data : (this._data?.data ? this._data?.data[index] : null);
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
                this.setTextColor(text, this._tabIndex == index ? "#35A3B3" : "#FFFFFF");
            } else {
                let textNormal = node.getChildByName('normal');
                let textSelected = node.getChildByName('selected');
                textNormal.active = this._tabIndex != index;
                textSelected.active = this._tabIndex == index;
            }
        })
    }
}
