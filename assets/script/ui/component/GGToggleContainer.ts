
const { ccclass, property } = cc._decorator;

@ccclass
export default class GGToggleContainer extends cc.Component {


    @property
    _startIndex: number = 0;

    _toggles: cc.Toggle[] = [];

    eventHandlers: cc.Component.EventHandler[] = null;

    _checkedToggle: cc.Toggle = null;

    _onChecked: Function = null;

    onLoad() {

    }


    initEventHandlers() {
        let eventHandler = new cc.Toggle.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "GGToggleContainer"
        eventHandler.handler = "onCheckHandler";
        this.eventHandlers = [eventHandler];
    }


    addToggle(toggle: cc.Toggle) {
        this._toggles.push(toggle);
        if (!this.eventHandlers) this.initEventHandlers();
        toggle.checkEvents = this.eventHandlers;
        this.checkedIndex = this._startIndex;
    }


    setToggles(list: cc.Toggle[], startIndex: number = this._startIndex) {
        this._toggles = list;
        this.addHandler();
        this.checkToggle(this._toggles[startIndex]);
    }

    addHandler() {
        for (let toggle of this._toggles) {
            toggle.checkEvents = this.eventHandlers;
        }
    }
    checkToggle(toggle: cc.Toggle) {
        this.uncheckAll();
        this._checkedToggle = toggle;
        this._checkedToggle.check();
    }
    private onCheckHandler(toggle: cc.Toggle) {
        this.checkToggle(toggle);
        this._onChecked && this._onChecked(this.checkedIndex);
        //cc.log(this.checkedIndex);
    }
    //清空所有选中
    uncheckAll() {
        for (let i = 0; i < this._toggles.length; i++) {
            this._toggles[i].uncheck();
        }
    }
    //获取当前选中的组件
    get checkedToggle() {
        return this._checkedToggle;
    }

    get checkedIndex(): number {
        return this._toggles.indexOf(this.checkedToggle);
    }

    set checkedIndex(index: number) {
        this.checkToggle(this._toggles[index]);
    }
    //设置回调响应
    set onChecked(handler: Function) {
        this._onChecked = handler;
    }

}
