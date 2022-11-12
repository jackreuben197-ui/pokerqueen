import { A } from "../../common/Singleton";
import { EventName } from "../../config/EventName";
import TimeHelper from "../../helper/TimeHelper";
import { APIOrgClubLevelBenefit, APIOrgClubLevelCost, APIOrgClubLevelInfo, APIOrgClubRoom, APIOrgGetTemplate, Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "./UIClubModel";

/*
 * @Author: xfj
 * @Date: 2022-11-08 12:28:52
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-11 18:55:55
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

    @property(cc.Node)
    tipLevelNode: cc.Node = null;

    @property(cc.Node)
    mid: cc.Node = null;

    @property(cc.Node)
    down: cc.Node = null;

    @property(cc.Button)
    uplevel: cc.Button;

    @property(cc.Node)
    lastNode: cc.Node = null;
    _currentLevel = 1;
    _tempLevel = 1;
    _maxLevel = 9;

    protected lateLoad(): void {
        super.lateLoad();
    }
    async onShow(param?: any) {
        super.onShow(param);
        this.getData();
    }
    async getData() {
        let _data: any = Web_Org_Club_Get.Response.data;
        this._currentLevel = _data.level
        this._tempLevel = this._currentLevel

        this.currentLevel.string = 'LV.' + this._currentLevel

        await UIClubModel.mInstance.APIOrgClubLevelBenefit({ club_id: _data.club_id })
        this.initTipNode();
        this.getCurrentLevel()

        this.setState();
    }

    async getCurrentLevel() {
        let _data: any = Web_Org_Club_Get.Response.data;


        let data: any = APIOrgClubLevelBenefit.Response.data
        let level_data = data.data[data.data.length - this._tempLevel]


        UIClubModel.mInstance.APIOrgClubLevelInfo({ club_id: _data.club_id }).then(() => {
            let data: any = APIOrgClubLevelInfo.Response.data;
            this.mid.children[0].getChildByName('lbl').getComponent(cc.Label).string = data.data.club_members + '/' + level_data.user_num
            this.mid.children[1].getChildByName('lbl').getComponent(cc.Label).string = data.data.admin_user_num + '/' + level_data.admin_num
            this.lastNode.getChildByName('lastData').getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(data.data.up_level_time)
        })
        UIClubModel.mInstance.APIOrgGetTemplate().then(() => {
            let data: any = APIOrgGetTemplate.Response.data;
            this.mid.children[2].getChildByName('lbl').getComponent(cc.Label).string = data.total + '/' + level_data.room_template_num
        })
        await UIClubModel.mInstance.APIOrgClubRoom().then(() => {
            let data: any = APIOrgClubRoom.Response.data;
            this.mid.children[3].getChildByName('lbl').getComponent(cc.Label).string = data.total + '/' + level_data.create_room

        })
        this.lastNode.active = this._currentLevel != 1
    }
    changeLevelData() {
        let data: any = APIOrgClubLevelBenefit.Response.data
        let level_data = data.data[data.data.length - this._tempLevel]
        this.down.children[1].getChildByName('lbl').getComponent(cc.Label).string = level_data.user_num + '人'
        this.down.children[2].getChildByName('lbl').getComponent(cc.Label).string = level_data.admin_num + '人'
        this.down.children[3].getChildByName('lbl').getComponent(cc.Label).string = level_data.room_template_num + '个'
        this.down.children[4].getChildByName('lbl').getComponent(cc.Label).string = level_data.create_room + '个'

    }

    async initTipNode() {
        let data: any = APIOrgClubLevelBenefit.Response.data
        for (let index = 0; index < this.tipLevelNode.childrenCount; index++) {
            const element = this.tipLevelNode.children[index];
            let level_data = data.data[data.data.length - index - 1]
            element.children[0].getComponent(cc.Label).string = level_data.level
            element.children[1].getComponent(cc.Label).string = level_data.user_num
            element.children[2].getComponent(cc.Label).string = level_data.admin_num
            element.children[3].getComponent(cc.Label).string = level_data.room_template_num
            element.children[4].getComponent(cc.Label).string = level_data.create_room
        }
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
            this.uplevel.interactable = false
            this.reduceButton.interactable = false
        } else {
            this.uplevel.interactable = true
            this.reduceButton.interactable = true
        }

        if (this._tempLevel >= this._maxLevel) {
            this.addButton.interactable = false
        } else {
            this.addButton.interactable = true
        }
        this.lbl_level.string = 'LV.' + this._tempLevel;
        this.changeLevelData()

    }
    async upLevelClick() {
        let _data: any = Web_Org_Club_Get.Response.data;
        await UIClubModel.mInstance.APIOrgClubLevelCost({ club_id: _data.club_id, level: this._tempLevel })
        let data: any = APIOrgClubLevelCost.Response.data

        let benefit_data: any = APIOrgClubLevelBenefit.Response.data
        let level_data = benefit_data.data[benefit_data.data.length - this._tempLevel]
        this.upLevelInd.getChildByName('node1').getChildByName('num').getComponent(cc.Label).string = 'LV.' + this._tempLevel
        this.upLevelInd.getChildByName('node2').getChildByName('num').getComponent(cc.Label).string = level_data.user_num
        this.upLevelInd.getChildByName('node3').getChildByName('num').getComponent(cc.Label).string = level_data.admin_num
        this.upLevelInd.getChildByName('node4').getChildByName('num').getComponent(cc.Label).string = level_data.room_template_num
        this.upLevelInd.getChildByName('node5').getChildByName('num').getComponent(cc.Label).string = level_data.create_room
        this.upLevelInd.getChildByName('node6').getChildByName('num').getComponent(cc.Label).string = level_data.level_duration
        this.upLevelInd.getChildByName('node7').getChildByName('num').getComponent(cc.Label).string = data.data
        this.upLevelInd.active = true;
    }
    cancleClick() {
        this.upLevelInd.active = false;
    }
    async sureClick() {
        let _data: any = Web_Org_Club_Get.Response.data;
        await UIClubModel.mInstance.APIOrgClubUpLevel({ club_id: _data.club_id, level: this._tempLevel })
        Web_Org_Club_Get.Response.data.level = this._tempLevel

        let benefit_data: any = APIOrgClubLevelBenefit.Response.data
        let level_data = benefit_data.data[benefit_data.data.length - this._tempLevel]
        Web_Org_Club_Get.Response.data.upper_limit = level_data.user_num

        this.getData();
        this.post(EventName.refreshClubLevel)
        this.upLevelInd.active = false;
    }

}
