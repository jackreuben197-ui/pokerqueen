/*
 * @Author: xfj
 * @Date: 2022-10-17 13:50:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-04 18:46:01
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatch.ts
 */

import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import GameUtil from "../../game/util/GameUtil";
import TimeHelper from "../../helper/TimeHelper";
import { APIOrgGetRoomConfig, Web_Org_Club_Get } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import { UIClubModel } from "./UIClubModel";
const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/labor/UICreateMatch')
export default class UICreateMatch extends BaseForm {
    @property(cc.ScrollView)
    ScrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    setSmallBig: cc.Prefab = null;

    @property(cc.Prefab)
    UISaveModel: cc.Prefab = null;

    @property(cc.Node)
    bxTipnNode: cc.Node = null;

    @property(cc.Node)
    save: cc.Node = null;


    tabBtnsParent: cc.Node = null;
    matchType: cc.Node = null;
    jfp: cc.Node = null;
    xzlx: cc.Node = null;
    fwfbl: cc.Node = null;
    fddm: cc.Node = null;
    fdxm: cc.Node = null;
    zwsl: cc.Node = null;
    zdks: cc.Node = null;
    qwsz: cc.Node = null;
    pjsc: cc.Node = null;
    jfpbs: cc.Node = null;
    zdcl: cc.Node = null;
    zxbljf: cc.Node = null;
    zss: cc.Node = null;
    sksj: cc.Node = null;
    ipdzxz: cc.Node = null;
    gpszx: cc.Node = null;
    yckp: cc.Node = null;
    bm: cc.Node = null;
    bx: cc.Node = null;
    Straddle: cc.Node = null;
    select: cc.Node = null;

    jslx: cc.Node = null;
    fddmHd: cc.Node = null;
    kzwjdr: cc.Node = null;
    etp: cc.Node = null;


    _curType = 0;
    ipState = false;
    gpsState = false;
    bmState = false;
    yckpState = false;
    kzwjdrState = false;
    bxState = false;
    etpState = false;
    // smallAndBigM = [];
    matchTypeNum = 0;
    jfpNum = 0;
    xzlxNum = 0;
    fwfbNum = 1;
    jslxNum = 1;
    straddleNum = 0;
    _btnType = 0;
    _fromUI = null;
    itemData = {
        fdxm: [0.1, 1, 2, 5, 10, 20, 25, 50, 100, 200, 300],
        zwsl: [2, 3, 4, 5, 6, 7, 8, 9],
        zdks: [2, 3, 4, 5, 6, 7, 8, 9],
        qwsz: [0, 1, 2, 4, 8, 18, 20, 30],
        pjsc: [0.5, 1, 2, 3, 4, 5, 6],
        jfpbs: [1, 2, 3, 4, 5, 6, 7, 8],
        jfpbs1: [1, 2, 3, 4, 5, 6, 7, 8],
        zdcl: ['不限', 25, 30, 35, 40, 45],
        zxbljf: [1, 2, 3, 4],
        zss: ['不限', 50, 100, 300, 1000],
        sksj: [10, 12, 15, 18, 20, 25, 30],
        jslx: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
        fddmHd: [0.5, 1, 2, 3, 5, 10, '不限']

    }
    itemDataIndex = {
        fdxm: 0,
        zwsl: 0,
        zdks: 0,
        qwsz: 0,
        pjsc: 0,
        jfpbs: 0,
        jfpbs1: 3,
        zdcl: 0,
        zxbljf: 0,
        zss: 0,
        sksj: 2,
        jslx: 0,
        fddmHd: 0,
    }
    qzshData = {
        '0.1': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 3, 4, 6, 8, 15, 30],
        '0.2': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 3, 4, 6, 8, 15, 30],
        '0.3': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 3, 4, 6, 8, 15, 30],
        '0.4': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 3, 4, 6, 8, 15, 30],
        '0.5': [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 3, 4, 6, 8, 15, 30],
        '1': [0, 2, 3, 4, 5, 6, 7, 8, 9],
        '2': [0, 1, 2, 4, 8, 16, 32, 40, 60],
        '3': [0, 1, 3, 6, 9, 15, 20, 30, 60],
        '4': [0, 1, 2, 4, 8, 16, 32, 40, 60],
        '5': [0, 1, 2, 5, 10, 20, 40, 80, 100, 150],
        '10': [0, 2, 5, 10, 20, 40, 80, 160, 200, 300],
        '15': [0, 5, 10, 15, 30, 40, 60, 90, 120, 150, 300],
        '20': [0, 5, 10, 20, 40, 80, 160, 320, 400, 600],
        '25': [0, 5, 10, 25, 50, 100, 200, 400, 500, 750],
        '30': [0, 5, 10, 25, 30, 50, 100, 200, 400, 500, 750],
        '50': [0, 10, 25, 50, 100, 200, 400, 800, 1000, 1500],
        '100': [0, 25, 50, 100, 200, 400, 800, 1600, 2000, 3000],
        '200': [0, 50, 100, 200, 400, 800, 1600, 3200, 4000, 6000],
        '300': [0, 75, 150, 300, 600, 1200, 2400, 4800, 6000, 9000],
        '500': [0, 125, 250, 500, 1000, 2000, 4000, 8000, 10000, 15000],
        '1000': [0, 250, 500, 1000, 2000, 4000, 8000, 16000, 20000, 30000],

    }
    _editModelData = null;

    _data: LobbyRoomListItem = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.tabBtnsParent = this.getChildNodeOrComponent("tabBtns");
        this.tabBtnsParent.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTabBtns, index);
        })
        this.matchType = this.getChildNodeOrComponent('matchType')
        this.jfp = this.getChildNodeOrComponent('jfp')
        this.xzlx = this.getChildNodeOrComponent('xzlx')
        this.fwfbl = this.getChildNodeOrComponent('fwfbl')
        this.fddm = this.getChildNodeOrComponent('fddm')
        this.fdxm = this.getChildNodeOrComponent('fdxm')
        this.zwsl = this.getChildNodeOrComponent('zwsl')
        this.zdks = this.getChildNodeOrComponent('zdks')
        this.qwsz = this.getChildNodeOrComponent('qwsz')
        this.pjsc = this.getChildNodeOrComponent('pjsc')
        this.jfpbs = this.getChildNodeOrComponent('jfpbs')
        this.zdcl = this.getChildNodeOrComponent('zdcl')
        this.zxbljf = this.getChildNodeOrComponent('zxbljf')
        this.zss = this.getChildNodeOrComponent('zss')
        this.sksj = this.getChildNodeOrComponent('sksj')
        this.ipdzxz = this.getChildNodeOrComponent('ipdzxz')
        this.gpszx = this.getChildNodeOrComponent('gpszx')
        this.yckp = this.getChildNodeOrComponent('yckp')
        this.bx = this.getChildNodeOrComponent('bx')

        this.bm = this.getChildNodeOrComponent('bm')
        this.Straddle = this.getChildNodeOrComponent('Straddle')
        this.select = this.getChildNodeOrComponent('select')

        this.jslx = this.getChildNodeOrComponent('jslx')
        this.fddmHd = this.getChildNodeOrComponent('fddmHd')
        this.kzwjdr = this.getChildNodeOrComponent('kzwjdr')
        this.etp = this.getChildNodeOrComponent('etp')
    }
    onShow(data?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(data, fromUI, sceneUI);
        this._fromUI = fromUI?.name;
        if (data) {
            this.editModel(data);
        } else {
            this._editModelData = null;
        }
        this.initUI();

    }

    private onClickTabBtns(index: number): void {
        this.switchTab(index);
    }
    switchTab = (type) => {
        if (this._curType != type) {
            this._curType = type;
            this.switchTabBtnState();

            this.switchTabView(type);
        }
        cc.find('ToggleContainer/toggle3', this.matchType).active = this._curType >= 2 ? false : true
        if (this._curType >= 2) {
            this.matchTypeNum = 0;
            cc.find('ToggleContainer/toggle1', this.matchType).getComponent(cc.Toggle).isChecked = true
        }

    }
    switchTabBtnState() {
        this.tabBtnsParent.children.forEach((item, index) => {
            let choose = item.getChildByName("choose");
            let normal = item.getChildByName("normal");
            choose.active = this._curType == index;
            normal.active = this._curType != index;
        })
    }

    switchTabView(type) {

    }

    editModel(data) {
        this._editModelData = data;
        this.onClickTabBtns(data.game_type);

        this.ipState = data.limit_ip;
        this.gpsState = data.limit_gps_distance > 0 ? true : false;
        this.bmState = data.post;
        this.yckpState = data.delay_view_card;

        this.bxState = data.insurance
        this.etpState = data.second_public_cards

        this.matchTypeNum = Number(data.poker_type);
        this.jfpNum = Number(data.retain_type)
        this.xzlxNum = Number(data.limit_bet_type);
        this.fwfbNum = Number(data.settlement_type);

        this.calculateIndex('fdxm', data.sb / 100)
        let _data: any = this.qzshData[data.sb / 100]
        this.itemData.qwsz = _data
        this.calculateIndex('zwsl', data.seat_count)
        this.calculateIndex('zdks', data.autostart_min_players)
        this.calculateIndex('qwsz', data.ante)
        this.calculateIndex('pjsc', data.play_duration / 3600)
        this.calculateIndex('jfpbs', data.min_rate)
        this.calculateIndex('jfpbs1', data.max_rate)

        if (data.limit_hc_total_hands == 0) {
            this.calculateIndex('zss', '不限')
        } else {
            this.calculateIndex('zss', data.limit_hc_total_hands)
        }

        if (data.limit_hc_pool_rate == 0) {
            this.calculateIndex('zdcl', '不限')
        } else {
            this.calculateIndex('zdcl', data.limit_hc_pool_rate)
        }
        this.calculateIndex('zxbljf', data.retain_min_rate)
        this.calculateIndex('sksj', data.op_duration)
        this.straddleNum = data.straddle_max
    }
    calculateIndex(key, value) {
        let flag = false;
        this.itemData[key].forEach((item, index) => {
            if (item == value) {
                flag = true
                this.itemDataIndex[key] = index
            }
        })
        if (!flag && key == 'fdxm') {
            this.itemData[key].push(value);
            this.itemData[key].sort((a, b) => a - b)
            this.itemData[key].forEach((item, index) => {
                if (item == value) {
                    this.itemDataIndex[key] = index
                }
            })
        }
    }
    initUI() {
        //复选框

        cc.find(`ToggleContainer/toggle${this.matchTypeNum + 1}`, this.matchType).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this.jfpNum + 1}`, this.jfp).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this.xzlxNum + 1}`, this.xzlx).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this.jslxNum + 1}`, this.jslx).getComponent(cc.Toggle).isChecked = true;

        if (this._fromUI == 'UICreateMatchHome') {
            this.save.active = true;
            this.fwfbl.active = true;
            this.jslx.active = false;
            this.fddmHd.active = false
            this.kzwjdr.active = false
            this.bx.active = true
            cc.find(`ToggleContainer/toggle${this.fwfbNum + 1}`, this.fwfbl).getComponent(cc.Toggle).isChecked = true;
            this.fwfbl.height = this.fwfbNum == 0 ? 300 : 200;
            this.fddm.active = this.fwfbNum == 0 ? true : false;
            this.fwfblLogic();
        } else {
            this.jslx.active = true;
            this.fddmHd.active = true
            this.kzwjdr.active = true
            this.fwfbl.active = false;
            this.save.active = false;
            this.bx.active = false
        }


        this.Straddle.getChildByName('Rectangle').getChildByName('num').getComponent(cc.Label).string = this.straddleNum + ""
        //滑动
        let fdxmItem: any = cc.find('item/Rectangle', this.fdxm).getComponent('slidewidght');
        fdxmItem._targetDe = this;

        fdxmItem.initUi(this.itemData.fdxm, this.itemDataIndex.fdxm)

        let zwslItem: any = cc.find('item/Rectangle', this.zwsl).getComponent('slidewidght');
        zwslItem._targetDe = this;
        zwslItem.initUi(this.itemData.zwsl, this.itemDataIndex.zwsl)


        let zdksItem: any = cc.find('item/Rectangle', this.zdks).getComponent('slidewidght');
        zdksItem._targetDe = this;
        zdksItem.initUi(this.itemData.zdks, this.itemDataIndex.zdks)


        let qwszItem: any = cc.find('item/Rectangle', this.qwsz).getComponent('slidewidght');
        qwszItem._targetDe = this;
        qwszItem.initUi(this.itemData.qwsz, this.itemDataIndex.qwsz)


        let pjscItem: any = cc.find('item/Rectangle', this.pjsc).getComponent('slidewidght');
        pjscItem._targetDe = this;

        pjscItem.initUi(this.itemData.pjsc, this.itemDataIndex.pjsc)

        let jfpbsItem: any = cc.find('item/Rectangle', this.jfpbs).getComponent('slidewidght1');
        jfpbsItem._targetDe = this;

        jfpbsItem.initUi(this.itemData.jfpbs, this.itemDataIndex.jfpbs, this.itemDataIndex.jfpbs1)

        let zdclItem: any = cc.find('item/Rectangle', this.zdcl).getComponent('slidewidght');
        zdclItem._targetDe = this;

        zdclItem.initUi(this.itemData.zdcl, this.itemDataIndex.zdcl)

        let zxbljfItem: any = cc.find('item/Rectangle', this.zxbljf).getComponent('slidewidght');
        zxbljfItem._targetDe = this;

        zxbljfItem.initUi(this.itemData.zxbljf, this.itemDataIndex.zxbljf)

        let zssItem: any = cc.find('item/Rectangle', this.zss).getComponent('slidewidght');
        zssItem._targetDe = this;

        zssItem.initUi(this.itemData.zss, this.itemDataIndex.zss)

        let sksjItem: any = cc.find('item/Rectangle', this.sksj).getComponent('slidewidght');
        sksjItem._targetDe = this;
        sksjItem.initUi(this.itemData.sksj, this.itemDataIndex.sksj)

        let jslxItem: any = cc.find('item/Rectangle', this.jslx).getComponent('slidewidght');
        jslxItem._targetDe = this;
        jslxItem.initUi(this.itemData.jslx, this.itemDataIndex.jslx)

        let fddmHdItem: any = cc.find('item/Rectangle', this.fddmHd).getComponent('slidewidght');
        fddmHdItem._targetDe = this;
        fddmHdItem.initUi(this.itemData.fddmHd, this.itemDataIndex.fddmHd)

        this.singleClick();

        let select = this.Straddle.getChildByName('select');
        let num = cc.find('Rectangle/num', this.Straddle).getComponent(cc.Label)
        for (let index = 0; index < select.childrenCount; index++) {
            const element = select.children[index];
            element.on(cc.Node.EventType.TOUCH_END, () => {
                num.string = element.name;
                select.active = false;
                // this.Straddle.height = 200;
            }, this)
        }

    }
    singleClick() {
        cc.find('btn_switch/open', this.ipdzxz).active = this.ipState;
        cc.find('btn_switch/close', this.ipdzxz).active = !this.ipState;
        cc.find('btn_switch/open', this.gpszx).active = this.gpsState;
        cc.find('btn_switch/close', this.gpszx).active = !this.gpsState;
        cc.find('btn_switch/open', this.bm).active = this.bmState;
        cc.find('btn_switch/close', this.bm).active = !this.bmState;

        cc.find('btn_switch/open', this.yckp).active = this.yckpState;
        cc.find('btn_switch/close', this.yckp).active = !this.yckpState;

        cc.find('btn_switch/open', this.bx).active = this.bxState;
        cc.find('btn_switch/close', this.bx).active = !this.bxState;
        cc.find('btn_switch/open', this.kzwjdr).active = this.kzwjdrState;
        cc.find('btn_switch/close', this.kzwjdr).active = !this.kzwjdrState;

        cc.find('btn_switch/open', this.etp).active = this.etpState;
        cc.find('btn_switch/close', this.etp).active = !this.etpState;
    }
    fwfblLogic() {
        let fwfConfig: any = APIOrgGetRoomConfig.Response?.data;
        if (!fwfConfig) return;
        this.fwfbl.getChildByName('lblNum').getComponent(cc.Label).string = fwfConfig?.data?.fee_permillage + '%'
        this.fwfbl.getChildByName('fddm').getChildByName('lblNum').getComponent(cc.Label).string = fwfConfig?.data?.max_per_hand
        let toggle1: cc.Toggle = cc.find(`ToggleContainer/toggle1`, this.fwfbl).getComponent(cc.Toggle)
        let toggle2: cc.Toggle = cc.find(`ToggleContainer/toggle2`, this.fwfbl).getComponent(cc.Toggle)
        toggle2.node['pos'] = toggle2.node.position;

        if (fwfConfig?.data?.settlement_type == 0) {
            toggle2.isChecked = true;
            toggle2.node.active = true;
            toggle2.node.position = toggle1.node.position;
            toggle1.node.active = false;
            toggle1.isChecked = false
            this.fddm.active = false
            this.fwfbl.height = 200;
        }
        else if (fwfConfig?.data?.settlement_type == 1) {
            toggle1.node.active = true;
            toggle1.isChecked = true
            this.fddm.active = true
            toggle2.isChecked = false;
            toggle2.node.active = false;
            toggle2.node.position = toggle2.node['pos']
            this.fwfbNum == 300
        }
        else {

        }
    }
    ipCilck() {
        this.ipState = !this.ipState
        cc.find('btn_switch/open', this.ipdzxz).active = this.ipState;
        cc.find('btn_switch/close', this.ipdzxz).active = !this.ipState;
    }
    gpsCilck() {
        this.gpsState = !this.gpsState
        cc.find('btn_switch/open', this.gpszx).active = this.gpsState;
        cc.find('btn_switch/close', this.gpszx).active = !this.gpsState;
    }
    kzwjdrCilck() {
        this.kzwjdrState = !this.kzwjdrState
        cc.find('btn_switch/open', this.kzwjdr).active = this.kzwjdrState;
        cc.find('btn_switch/close', this.kzwjdr).active = !this.kzwjdrState;
    }
    bxCilck() {
        this.bxState = !this.bxState
        cc.find('btn_switch/open', this.bx).active = this.bxState;
        cc.find('btn_switch/close', this.bx).active = !this.bxState;
    }
    yckpCilck() {
        this.yckpState = !this.yckpState
        cc.find('btn_switch/open', this.yckp).active = this.yckpState;
        cc.find('btn_switch/close', this.yckp).active = !this.yckpState;
    }
    bmCilck() {
        this.bmState = !this.bmState
        cc.find('btn_switch/open', this.bm).active = this.bmState;
        cc.find('btn_switch/close', this.bm).active = !this.bmState;
    }
    etpCilck() {
        this.etpState = !this.etpState
        cc.find('btn_switch/open', this.etp).active = this.etpState;
        cc.find('btn_switch/close', this.etp).active = !this.etpState;
    }
    matchTypeClick(event, customData) {
        this.matchTypeNum = Number(customData);
        cc.log('matchTypeClick===', customData)
    }
    jfpClick(event, customData) {
        this.jfpNum = Number(customData);
        cc.log('jfpClick===', customData)
    }
    xzlxClick(event, customData) {
        this.xzlxNum = Number(customData);
        cc.log('xzlxClick===', customData)
    }
    fwfblClick(event, customData) {
        this.fwfbNum = Number(customData);
        cc.log('fwfblClick===', customData)
        this.fwfbl.getChildByName('fddm').active = this.fwfbNum == 0 ? true : false
        this.fwfbl.height = this.fwfbNum == 0 ? 300 : 200;
        // cc.find('fddm/lblNum', this.fwfbl).active = 
    }

    jslxClick(event, customData) {
        this.jslxNum = Number(customData);
    }


    setttingClick() {
        if (this.node.getChildByName('UISetSmallM')) {
            this.node.getChildByName('UISetSmallM').active = true;
            this.node.getChildByName('UISetSmallM').getComponent('UISetSmallM').setSetSmallM(this.itemData.fdxm)
        } else {
            let _prefab = cc.instantiate(this.setSmallBig)
            _prefab.parent = this.node;
            _prefab.position = cc.v3(0, 0);
            _prefab.getComponent('UISetSmallM').delagate = this;
            _prefab.getComponent('UISetSmallM').setSetSmallM(this.itemData.fdxm)

        }

    }
    setSmallM(data) {
        this.itemData.fdxm = data;
        let fdxmItem: any = cc.find('item/Rectangle', this.fdxm).getComponent('slidewidght');
        fdxmItem.initUi(this.itemData.fdxm)
        this.changeQzsh(this.itemData.fdxm[0])
    }

    saveModel() {
        this._btnType = 0;
        this.fillName();
    }
    fillName() {
        if (this._editModelData) {
            this.upLoadData(this._editModelData.name)
            return;
        }
        let _UISaveModel = cc.instantiate(this.UISaveModel);
        _UISaveModel.parent = this.node
        _UISaveModel.position = cc.v3(0, 0);
        _UISaveModel.getComponent('UISaveModel').delagate = this;
    }
    async upLoadData(modelName) {
        cc.log('modelName==', modelName);
        let room_config: any = {}
        room_config.game_type = this._curType         //游戏类型： 0-常规桌，1-OMAHA4，2-OMAHA5，3-OMAHA6 ,必填
        room_config.poker_type = Number(this.matchTypeNum)    //牌类型：0-标准,长牌，2-短牌,必填
        room_config.limit_bet_type = Number(this.xzlxNum)      //底池限制类型：0-无底池限制，1-底池限制，2-AOF,必填
        room_config.settlement_type = Number(this.fwfbNum)    //0-每局结算 per game，1-每手结算 per hand,必填
        room_config.retain_type = Number(this.jfpNum)
        room_config.ante = Number(this.qwsz.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //前注筹码,必填

        room_config.sb = Number(this.fdxm.getChildByName('jfplbl').getComponent(cc.Label).string) / 2 //小盲注,必填
        room_config.op_duration = Number(this.sksj.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)//操作时间 15s
        room_config.min_rate = Number(this.jfpbs.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //最小带入倍率(BB的倍数),必填
        room_config.max_rate = Number(this.jfpbs.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string) //最小带入倍率(BB的倍数),必填//最大带入倍率,必填
        // room_config.min_players = '' //最小游戏人数


        if (this.zss.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
            room_config.limit_hc_total_hands = 0;      //总手数限制 手数
            room_config.hc_total_hands_lv = false;
        } else {
            room_config.hc_total_hands_lv = true;
            room_config.limit_hc_total_hands = Number(this.zss.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)          //总手数限制 手数
        }

        if (this.zdcl.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
            room_config.limit_hc_pool_rate = 0;      //总手数限制 手数
            room_config.hc_pool_rate_lv = false;
        } else {
            room_config.hc_pool_rate_lv = true;
            room_config.limit_hc_pool_rate = Number(this.zdcl.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)           //最低入池率 
        }

        room_config.play_duration = Number(this.pjsc.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) * 3600    //房间有效时长 秒,必填
        room_config.autostart_min_players = Number(this.zdks.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)//自动开始最小人数 <2 非自动开始 >= 2 自动开始,必填  是开桌的最小人数
        room_config.seat_count = Number(this.zwsl.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)   //座位数量,必填
        room_config.retain_min_rate = Number(this.zxbljf.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //最小倍率 最小保留记分牌倍数

        room_config.straddle_max = Number(this.Straddle.getChildByName('Rectangle').getChildByName('num').getComponent(cc.Label).string);//straddle值
        room_config.delay_view_card = this.yckpState //延迟看牌开关 
        room_config.post = this.bmState   //是否补盲
        room_config.limit_ip = this.ipState   //是否开启ip限制
        room_config.limit_gps = this.gpsState //是否开启gps限制
        room_config.second_public_cards = this.etpState  //是否开启第二套牌

        let params: any = { name: modelName, room_config: room_config }
        console.log('params===', params)
        //0 是模版
        if (this._btnType == 0) {
            room_config.insurance = this.bxState
            if (this._editModelData) {

                params.id = this._editModelData.id
                await UIClubModel.mInstance.APIOrgUpdateTemplate(params);
            } else {
                await UIClubModel.mInstance.APIOrgCreateTemplate(params);
            }
            this.post(EventName.matchModelChange)

        } else if (this._btnType == 1) {
            //公会牌桌
            if (this._fromUI == 'UICreateMatchHome') {
                room_config.insurance = this.bxState
                room_config.limit_friend_table = false
                room_config.limit_bring_in = false
                let data = await UIClubModel.mInstance.APIOrgRoomConfigCreate(params);
                this.post(EventName.updateChessView);
            }
            else {
                //朋友桌
                if (this.fddmHd.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
                    room_config.max_per_hand = 0 //服务费比例(0-100)

                } else {
                    room_config.max_per_hand = Number(this.fddmHd.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) * 100 //服务费比例(0-100)
                }


                room_config.fee_permillage = Number(this.jslx.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //服务费比例(0-100)
                room_config.limit_friend_table = true;
                room_config.limit_bring_in = this.kzwjdrState;
                let data: any = await UIClubModel.mInstance.APIOrgRoomConfigCreate(params);
                this.top_block.active = true;
                await TimeHelper.Sleep(1000);
                data = await UIClubModel.mInstance.APIOrgFriendRoomInfo(data.data.room_id);
                this.post(EventName.updateFriendChessView)
                this.top_block.active = false;
                this._data = new LobbyRoomListItem(data.data.data);
                GameUtil.EnterRoomAPI(this._data, UIDefine.UICreateMatch);
            }
        }
        this._editModelData = null;
        this.close();

    }
    straddleTip() {
        this.Straddle.getChildByName('Group').active = !this.Straddle.getChildByName('Group').active
    }
    straddleSelect() {
        let select = this.Straddle.getChildByName('select');
        select.active = !select.active;
        // if (select.active) {
        //     this.Straddle.height = 590
        // } else {
        //     this.Straddle.height = 200
        // }

    }
    changeQzsh(num) {
        let _data: any = this.qzshData[num]
        this.itemData.qwsz = _data
        let qwszItem: any = cc.find('item/Rectangle', this.qwsz).getComponent('slidewidght');
        qwszItem.initUi(this.itemData.qwsz, 0)
    }

    bxTip() {
        this.bxTipnNode.active = !this.bxTipnNode.active
    }


    baganGame() {
        this._btnType = 1;
        this.fillName();
    }

}
