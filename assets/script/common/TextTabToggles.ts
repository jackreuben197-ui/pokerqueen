import UIBase from "../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('common/TextTabToggles')
export default class TextTabToggles extends UIBase {
    @property([cc.Node])
    tabToggles: cc.Node[] = [];

    private _onToggle: (index, data) => boolean = null;
    private _tabIndex: number = -1;
    private _data: TTabToggleData = null;
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
    get data() {
        return this._data;
    }
    set data(data: TTabToggleData) {
        this._data = data;
        this.tabToggles.forEach((node, index) => {
            if (data?.title && index < data.title.length) {
                let text = node.getChildByName('text').getComponent(cc.Label);
                text && this.setText(text, this._data.title[index]);
            }
            if (data?.data?.length) {
                this.setActive(node, index < data.data.length);
            }
        })

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
            let param = data ? data : this._data?.data[index];
            let suc = await this._onToggle(index, param);
            if (suc || suc == undefined) {
                this.setTabTo(index);
            }
        }
    }

    private _changeTabStatus() {
        this.tabToggles.forEach((node, index) => {
            let text = node.getChildByName('text').getComponent(cc.Label);
            let line = node.getChildByName('line');
            line.active = this._tabIndex == index;
            this.setTextColor(text, this._tabIndex == index ? "#35A3B3" : "#FFFFFF");
        })
    }
}


export type TTabToggleData = {
    title?: Array<string>,
    data?: Array<any>
}