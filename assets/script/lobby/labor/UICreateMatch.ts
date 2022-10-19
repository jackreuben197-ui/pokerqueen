/*
 * @Author: xfj
 * @Date: 2022-10-17 13:50:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-19 11:28:12
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatch.ts
 */

import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { UIClubModel } from "./UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateMatch extends BaseForm {
    @property(cc.ScrollView)
    ScrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    setSmallBig: cc.Prefab = null;

    @property(cc.Prefab)
    UISaveModel: cc.Prefab = null;


    _curType = 0;
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
    Straddle: cc.Node = null;
    select: cc.Node = null;
    ipState = false;
    gpsState = false;
    bmState = false;
    yckpState = false;
    smallAndBigM = [];
    matchTypeNum = 0;
    jfpNum = 0;
    xzlxNum = 0;
    fwfbNum = 0;
    itemData = {
        fdxm: [0.1, 0.2],
        zwsl: [2, 3, 4, 5, 6, 7, 8, 9],
        zdks: [2, 3, 4, 5, 6, 7, 8, 9],
        qwsz: [0, 1, 2, 4, 8, 18, 20, 30],
        pjsc: [0.5, 1, 2, 3, 4, 5, 6],
        jfpbs: [1, 2, 3, 4, 5, 6, 7, 8],
        zdcl: ['不限', 25, 30, 35, 40, 45],
        zxbljf: [1, 2, 3, 4],
        zss: ['不限', 50, 100, 300, 1000],
        sksj: [10, 12, 15, 18, 20, 25, 30],
    }
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

        this.bm = this.getChildNodeOrComponent('bm')
        this.Straddle = this.getChildNodeOrComponent('Straddle')
        this.select = this.getChildNodeOrComponent('select')

        this.initUI()
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
        cc.find('ToggleContainer/toggle2', this.matchType).active = this._curType >= 2 ? false : true

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

    onShow(data?: any, fromUI?: BaseForm) {
        super.onShow(data, fromUI);
    }
    initUI() {
        //
        let fdxmItem: any = cc.find('item/Rectangle', this.fdxm).getComponent('slidewidght');
        fdxmItem.initUi(this.itemData.fdxm)
        fdxmItem._targetDe = this;

        let zwslItem: any = cc.find('item/Rectangle', this.zwsl).getComponent('slidewidght');
        zwslItem.initUi(this.itemData.zwsl)
        zwslItem._targetDe = this;

        let zdksItem: any = cc.find('item/Rectangle', this.zdks).getComponent('slidewidght');
        zdksItem.initUi(this.itemData.zdks)
        zdksItem._targetDe = this;

        let qwszItem: any = cc.find('item/Rectangle', this.qwsz).getComponent('slidewidght');
        qwszItem.initUi(this.itemData.qwsz)
        qwszItem._targetDe = this;

        let pjscItem: any = cc.find('item/Rectangle', this.pjsc).getComponent('slidewidght');
        pjscItem.initUi(this.itemData.pjsc)
        pjscItem._targetDe = this;

        let jfpbsItem: any = cc.find('item/Rectangle', this.jfpbs).getComponent('slidewidght');
        jfpbsItem.initUi(this.itemData.jfpbs)
        jfpbsItem._targetDe = this;

        let zdclItem: any = cc.find('item/Rectangle', this.zdcl).getComponent('slidewidght');
        zdclItem.initUi(this.itemData.zdcl)
        zdclItem._targetDe = this;

        let zxbljfItem: any = cc.find('item/Rectangle', this.zxbljf).getComponent('slidewidght');
        zxbljfItem.initUi(this.itemData.zxbljf)
        zxbljfItem._targetDe = this;

        let zssItem: any = cc.find('item/Rectangle', this.zss).getComponent('slidewidght');
        zssItem.initUi(this.itemData.zss)
        zssItem._targetDe = this;

        let sksjItem: any = cc.find('item/Rectangle', this.sksj).getComponent('slidewidght');
        sksjItem.initUi(this.itemData.sksj, 2)
        sksjItem._targetDe = this;

        cc.find('btn_switch/open', this.ipdzxz).active = this.ipState;
        cc.find('btn_switch/close', this.ipdzxz).active = !this.ipState;
        cc.find('btn_switch/open', this.gpszx).active = this.gpsState;
        cc.find('btn_switch/close', this.gpszx).active = !this.gpsState;
        cc.find('btn_switch/open', this.bm).active = this.bmState;
        cc.find('btn_switch/close', this.bm).active = !this.bmState;

        cc.find('btn_switch/open', this.yckp).active = this.yckpState;
        cc.find('btn_switch/close', this.yckp).active = !this.yckpState;

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
    matchTypeClick(event, customData) {
        this.matchTypeNum = customData;
        cc.log('matchTypeClick===', customData)
    }
    jfpClick(event, customData) {
        this.jfpNum = customData;
        cc.log('jfpClick===', customData)
    }
    xzlxClick(event, customData) {
        this.xzlxNum = customData;
        cc.log('xzlxClick===', customData)
    }
    fwfblClick(event, customData) {
        this.fwfbNum = customData;
        cc.log('fwfblClick===', customData)
        this.fwfbl.getChildByName('fddm').active = this.fwfbNum == 0 ? true : false
        this.fwfbl.height = this.fwfbNum == 0 ? 400 : 300;
        // cc.find('fddm/lblNum', this.fwfbl).active = 
    }
    setttingClick() {
        if (this.node.getChildByName('UISetSmallM')) {
            this.node.getChildByName('UISetSmallM').active = true;
        } else {
            let _prefab = cc.instantiate(this.setSmallBig)
            _prefab.parent = this.node;
            _prefab.position = cc.v3(0, 0);
            _prefab.getComponent('UISetSmallM').delagate = this;
        }

    }
    setSmallM(data) {
        this.smallAndBigM = data;
        let fdxmItem: any = cc.find('item/Rectangle', this.fdxm).getComponent('slidewidght');
        fdxmItem.initUi(this.smallAndBigM)
    }

    saveModel() {
        let _UISaveModel = cc.instantiate(this.UISaveModel);
        _UISaveModel.parent = this.node
        _UISaveModel.position = cc.v3(0, 0);
        _UISaveModel.getComponent('UISaveModel').delagate = this;
    }
    async upLoadData(modelName) {
        cc.log('modelName==', modelName);
        let room_config: any = {}

        room_config.game_type = this._curType         //游戏类型： 0-常规桌，1-OMAHA4，2-OMAHA5，3-OMAHA6 ,必填
        room_config.poker_type = this.matchTypeNum    //牌类型：0-标准,长牌，2-短牌,必填
        room_config.limit_bet_type = this.xzlxNum     //底池限制类型：0-无底池限制，1-底池限制，2-AOF,必填
        room_config.settlement_type = this.fwfbNum    //0-每局结算 per game，1-每手结算 per hand,必填

        room_config.ante = Number(this.qwsz.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //前注筹码,必填

        room_config.sb = Number(this.fdxm.getChildByName('jfplbl').getComponent(cc.Label).string) / 200 //小盲注,必填
        room_config.op_duration = Number(this.sksj.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)//操作时间 15s
        room_config.min_rate = Number(this.jfpbs.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //最小带入倍率(BB的倍数),必填
        // room_config.max_rate = ''//最大带入倍率,必填
        // room_config.min_players = '' //最小游戏人数

        if (this.zss.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
            room_config.limit_hc_total_hands = 0;      //总手数限制 手数
        } else {
            room_config.limit_hc_total_hands = Number(this.zss.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)          //总手数限制 手数
        }
        if (this.zdcl.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
            room_config.limit_hc_pool_rate = 0;      //总手数限制 手数
        } else {
            room_config.limit_hc_pool_rate = Number(this.zdcl.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)           //最低入池率 
        }

        room_config.play_duration = Number(this.pjsc.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) * 7200    //房间有效时长 秒,必填
        room_config.autostart_min_players = Number(this.zdks.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)//自动开始最小人数 <2 非自动开始 >= 2 自动开始,必填  是开桌的最小人数
        room_config.seat_count = Number(this.zwsl.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string)   //座位数量,必填
        room_config.retain_min_rate = Number(this.zxbljf.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //最小倍率 最小保留记分牌倍数

        room_config.straddle_max = Number(this.Straddle.getChildByName('Rectangle').getChildByName('num').getComponent(cc.Label).string);//straddle值
        room_config.delay_view_card = this.yckpState //延迟看牌开关 
        room_config.post = this.bmState   //是否补盲
        room_config.limit_ip = this.ipState   //是否开启ip限制
        room_config.limit_gps = this.gpsState //是否开启gps限制

        let params = { name: modelName, room_config: room_config }
        console.log('params===', params)
        await UIClubModel.mInstance.APIOrgCreateTemplate(params)
        this.close();
    }
    straddleTip() {

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



    baganGame() {

    }

}
