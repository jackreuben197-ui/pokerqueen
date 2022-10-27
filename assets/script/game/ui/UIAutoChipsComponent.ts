/**
 * 坐下弹出面板
 */

import GC from "../../frame/GameControl";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import { ClientMessageSeated } from "../../protobuf/holdem/req_seated_pb";
import { ClientMessageSetAutoOnTable } from "../../protobuf/holdem/req_set_auto_on_table_pb";
import GGSlider from "../../ui/component/GGSlider";
import UIBase from "../../ui/UIBase";
import { GameCache } from "../GameCache";
import { AddClipsData } from "./UIAddChipsComponent";


const { ccclass } = cc._decorator;

@ccclass
export default class UIAddChipsComponent extends UIBase {

    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */

    private Image_Mask: cc.Node = null;
    private imageDialog: cc.Node = null;
    private closeBtn: cc.Node = null;
    private sureBtn: cc.Node = null;

    private inNode: cc.Node = null;
    private slider: GGSlider = null;

    private maxInto: cc.Label = null;
    private minInto: cc.Label = null;
    private curInto: cc.Label = null;

    private addBtn: cc.Node = null;
    private reduceBtn: cc.Node = null;
    private autoNum: cc.Label = null;
    private gold: cc.Label = null;

    private autoToggle: cc.Toggle = null;
    private intoToggle: cc.Toggle = null;

    //开始倍数
    private _startRate: number = 0;
    private _curIntoValue: number = 0;
    private _curAutoValue: number = 0;

    private _fromSetting: boolean = false;
    protected lateLoad(): void {
        super.lateLoad();
        this.Image_Mask = this.getChildNodeOrComponent("Image_Mask");
        this.imageDialog = this.getChildNodeOrComponent("Image_Dialog");
        this.closeBtn = this.getChildNodeOrComponent("closeBtn");
        this.sureBtn = this.getChildNodeOrComponent("sureBtn");

        this.inNode = this.getChildNodeOrComponent("inNode");
        this.maxInto = this.getChildNodeOrComponent("maxInto", cc.Label);
        this.minInto = this.getChildNodeOrComponent("minInto", cc.Label);
        this.curInto = this.getChildNodeOrComponent("curInto", cc.Label);

        this.addBtn = this.getChildNodeOrComponent("addBtn");
        this.reduceBtn = this.getChildNodeOrComponent("reduceBtn");
        this.autoNum = this.getChildNodeOrComponent("autoNum", cc.Label);
        this.gold = this.getChildNodeOrComponent("gold", cc.Label);

        this.autoToggle = this.getChildNodeOrComponent("autoToggle", cc.Toggle);
        this.intoToggle = this.getChildNodeOrComponent("intoToggle", cc.Toggle);

        this.slider = this.getChildNodeOrComponent("slider", GGSlider);
        this.slider.onChange(this.onSliderChange.bind(this));
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.closeBtn, this.onClickClose);
        this.bindClick(this.sureBtn, this.onClickSure);
        this.bindClick(this.Image_Mask, this.onClickClose);

        this.bindClick(this.addBtn, this.clickAdd, null, true);
        this.bindClick(this.reduceBtn, this.clickReduce, null, true);
    }

    onShow(fromSetting?: boolean): void {
        super.onShow(fromSetting);
        this._fromSetting = fromSetting;
        this.animateDialog();

        this.initView();
    }

    initView() {
        let curGame = GameCache.Instance.CurGame;


        this.setActive(this.inNode, !this._fromSetting);
        this.setText(this.gold, GC.data.user.info.displayGold);

        this.setText(this.minInto, GameCache.Instance.carry_small * curGame.currentMinRate / 100);
        this.setText(this.maxInto, GameCache.Instance.carry_small * curGame.currentMaxRate / 100);

        this._startRate = curGame.currentMinRate;
        this._curAutoValue = this._startRate * GameCache.Instance.carry_small / 100;
        this.setText(this.autoNum, this._curAutoValue)
        this.slider.SetMinMax(curGame.currentMinRate, curGame.currentMaxRate);
        this.slider.onShow({ index: 0 });
        this.onSliderChange(0);

    }

    animateDialog() {
        this.imageDialog.scale = 0;
        cc.tween(this.imageDialog).to(.2, { scale: 1 }, cc.easeBackOut()).start();
    }
    /**
     * 滑动条改变触发
     */
    onSliderChange(rate: number) {
        this._curIntoValue = (this._startRate + rate) * GameCache.Instance.CurGame.bigBlind / 100;

        this.setText(this.curInto, this._curIntoValue);
        this.setTextColor(this.curInto, this._curIntoValue >= GC.data.user.info.displayGold ? "#B82B30" : "#3BE1F5");
    }

    onClickSure() {
        if (this._fromSetting) {
            GameCache.Instance.CurGame.SetAutoOnTableChips(this._curAutoValue * 100, this.intoToggle.isChecked);
        } else {
            GameCache.Instance.CurGame.AddChips(this._curIntoValue * 100, this._curAutoValue, this.intoToggle.isChecked);

        }
        this.hideUI();
    }

    clickAdd() {
        if (!this.autoToggle.isChecked) return;
        let curGame = GameCache.Instance.CurGame;
        if (this._curAutoValue + GameCache.Instance.carry_small <= curGame.currentMaxRate * GameCache.Instance.carry_small / 100) {
            this._curAutoValue += GameCache.Instance.carry_small;
        }

        this.setText(this.autoNum, this._curAutoValue);
    }

    clickReduce() {
        if (!this.autoToggle.isChecked) return;
        let curGame = GameCache.Instance.CurGame;
        if (this._curAutoValue - GameCache.Instance.carry_small >= curGame.currentMinRate * GameCache.Instance.carry_small / 100) {
            this._curAutoValue -= GameCache.Instance.carry_small;
        }
        this.setText(this.autoNum, this._curAutoValue);
    }

    /**
     * 隐藏界面
     */

    onClickClose() {
        this.hideUI();
    }

    public hideUI() {
        this.node.active = false;
    }
}
