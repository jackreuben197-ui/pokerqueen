import BaseForm from "../../ui/form/BaseForm";

/*
 * @Author: xfj
 * @Date: 2022-11-08 12:28:52
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-08 17:56:32
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UIClubLevel.ts
 */
const { ccclass, property, menu } = cc._decorator;

@ccclass

@menu('脚本分组/labor/UIClubLevel')
export default class UIClubLevel extends BaseForm {

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property(cc.Button)
    addButton: cc.Button = null;

    @property(cc.Button)
    reduceButton: cc.Button = null;

    @property(cc.Label)
    lbl_level: cc.Label = null;

    @property(cc.Label)
    currentLevel: cc.Label = null;

    @property(cc.Node)
    upLevelInd: cc.Node = null;


    _currentLevel = 1;
    _tempLevel = 1;
    _maxLevel = 9;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any) {
        super.onShow(param);
        this._tempLevel = this._currentLevel
        this.currentLevel.string = 'LV.' + this._currentLevel
        this.setState();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }
    tipClick() {
        this.tipNode.active = !this.tipNode.active
    }
    addClick() {
        this._tempLevel++
        this.setState();
    }
    reduceClick() {
        this._tempLevel--;
        this.setState();
    }
    setState() {
        if (this._tempLevel <= this._currentLevel) {
            this.reduceButton.interactable = false
        } else {
            this.reduceButton.interactable = true
        }

        if (this._tempLevel >= this._maxLevel) {
            this.addButton.interactable = false
        } else {
            this.addButton.interactable = true
        }
        this.lbl_level.string = 'LV.' + this._tempLevel;



    }
    upLevelClick() {
        this.upLevelInd.active = true;
    }
    cancleClick() {
        this.upLevelInd.active = false;
    }
    sureClick() {

    }

}
