/*
 * @Author: xfj
 * @Date: 2022-10-17 13:50:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-25 21:24:30
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubCreateMatch.ts
 */
enum TITALTYPE {
    GAME_TYPE = 0,
    MODEL = 1,
}
import BaseForm from "../../ui/form/BaseForm";

import ComFormTitle from "../../common/ComFormTitle";
import { i18nMgr } from "../../i18n/i18nMgr";
import { dcjfpConfig, dxmConfig, jslxConfig, zwslConfig, zxbljfpbsConfig } from "../../frame/data/rate/RateConfig";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { UIClubModel } from "../labor/UIClubModel";
import { EventName } from "../../config/EventName";
import TimeHelper from "../../helper/TimeHelper";
import LobbyRoomListItem from "../../frame/data/lobby/LobbyRoomListItem";
import { UIDefine } from "../../define/UIDefine";
import GameUtil from "../../game/util/GameUtil";

const { ccclass, property, menu } = cc._decorator;
@ccclass

@menu('脚本分组/new_club/UIClubCreateMatch')
export default class UIClubCreateMatch extends BaseForm {
    @property(cc.Prefab)
    dropDownBox: cc.Prefab = null;
    @property(cc.ScrollView)
    ScrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    UISaveModel: cc.Prefab = null;

    @property(cc.EditBox)
    passNodeEd: cc.EditBox = null;

    @property(cc.EditBox)
    shareClubIdEd: cc.EditBox = null;


    private comFormTitle: ComFormTitle = null;

    titleNode: cc.Node = null;
    memberListT: cc.Node = null;
    applyListT: cc.Node = null;
    clubIdNode: cc.Node = null;
    sryy: cc.Node = null;
    passNode: cc.Node = null;
    dxm: cc.Node = null;
    drjfp: cc.Node = null;
    qz: cc.Node = null;
    aof: cc.Node = null;
    dcjfp: cc.Node = null;
    zxblbs: cc.Node = null;
    jslx: cc.Node = null;
    fwfbl: cc.Node = null;
    fddm: cc.Node = null;
    zwrs: cc.Node = null;
    zdks: cc.Node = null;
    sksj: cc.Node = null;
    pjsc: cc.Node = null;
    yyxz: cc.Node = null;
    zdrcl: cc.Node = null;
    zssxz: cc.Node = null;
    drsq: cc.Node = null;
    bx: cc.Node = null;
    yckp: cc.Node = null;
    bm: cc.Node = null;
    Straddle: cc.Node = null;
    toggleNode: cc.Node = null;
    yxbz: cc.Node = null;
    etp: cc.Node = null;

    _bmState = false;
    _yckpState = false;
    _kzwjdrState = false;
    _bxState = false;
    _etpState = false;
    _sryxState = false;
    _aofState = false
    _ipState = false;
    _gpsState = false;
    _jslxNum = 0;
    _dcjfpNum = 0;
    _sksjNum = 15;
    _yxbzNum = 4;
    _selectRoleType = 0;
    _btnType = 0;
    _selectTitle = 0;

    room_config = null;

    itemData = {
        qwsz: [0, 1, 2, 4, 8, 18, 20, 30],
        pjsc: [0.5, 1, 2, 3, 4, 5, 6],
        zdcl: ['不限', 25, 30, 35, 40, 45],
        zss: ['不限', 50, 100, 300, 1000],
        fddm: ['不限', 0.1, 0.2, 0.3, 0.4, 0.5, 1, 1.5, 2, 2.5, 3],
        fwfbl: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],//5+
        dxm: [0.1, 0.2, 0.3, 0.4, 0.5],
    }

    itemDataIndex = {
        qwsz: 0,
        pjsc: 0,
        jfpbs: 0,
        zdcl: 0,
        zss: 0,
        fddm: 0,
        dxm: 0,
        fwfbl: 0
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

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.memberListT = this.getChildNodeOrComponent("memberListT");
        this.applyListT = this.getChildNodeOrComponent("applyListT");
        this.titleNode = this.getChildNodeOrComponent("titleNode");
        this.clubIdNode = this.getChildNodeOrComponent("clubIdNode");
        this.sryy = this.getChildNodeOrComponent("sryy");
        this.passNode = this.getChildNodeOrComponent("passNode");
        this.dxm = this.getChildNodeOrComponent("dxm");
        this.drjfp = this.getChildNodeOrComponent("drjfp");
        this.qz = this.getChildNodeOrComponent("qz");
        this.aof = this.getChildNodeOrComponent("aof");
        this.dcjfp = this.getChildNodeOrComponent("dcjfp");
        this.zxblbs = this.getChildNodeOrComponent("zxblbs");
        this.jslx = this.getChildNodeOrComponent("jslx");
        this.fwfbl = this.getChildNodeOrComponent("fwfbl");
        this.fddm = this.getChildNodeOrComponent("fddm");
        this.zwrs = this.getChildNodeOrComponent("zwrs");
        this.zdks = this.getChildNodeOrComponent("zdks");
        this.sksj = this.getChildNodeOrComponent("sksj");
        this.pjsc = this.getChildNodeOrComponent("pjsc");
        this.yyxz = this.getChildNodeOrComponent("yyxz");
        this.zdrcl = this.getChildNodeOrComponent("zdrcl");
        this.zssxz = this.getChildNodeOrComponent("zssxz");
        this.drsq = this.getChildNodeOrComponent("drsq");
        this.bx = this.getChildNodeOrComponent("bx");
        this.yckp = this.getChildNodeOrComponent("yckp");
        this.bm = this.getChildNodeOrComponent("bm");
        this.Straddle = this.getChildNodeOrComponent("Straddle");
        this.toggleNode = this.getChildNodeOrComponent("toggleNode");
        this.yxbz = this.getChildNodeOrComponent("yxbz");
        this.etp = this.getChildNodeOrComponent("etp");

        this.zxblbs['levelData'] = { min: 1, total: 4, level: 1 }
        this.zwrs['levelData'] = { min: 2, total: 9, level: 2 }
        this.zdks['levelData'] = { min: 2, total: 9, level: 2 }
        this.Straddle['levelData'] = { min: 0, total: 6, level: 2 }

    }
    onShow(data?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(data, fromUI, sceneUI);
        let title = "UIClub_MatchTable"
        this.comFormTitle.initData(title, this);
        if (data) {
            this.editModel(data);
        } else {
            this.room_config = null;
        }

        this.initUI()


    }
    calculateIndex(key, value) {
        let flag = false;
        this.itemData[key].forEach((item, index) => {
            if (item == value) {
                flag = true
                this.itemDataIndex[key] = index
            }
        })
        // if (!flag && key == 'fdxm') {
        //     this.itemData[key].push(value);
        //     this.itemData[key].sort((a, b) => a - b)
        //     this.itemData[key].forEach((item, index) => {
        //         if (item == value) {
        //             this.itemDataIndex[key] = index
        //         }
        //     })
        // }
    }

    editModel(room_config) {
        this.room_config = room_config;
        this._bxState = room_config.insurance;
        this._yckpState = room_config.delay_view_card;
        this._bmState = room_config.post
        this._ipState = room_config.limit_ip
        this._gpsState = room_config.limit_gps
        this._etpState = room_config.second_public_cards
        // this._kzwjdrState = room_config.limit_bring_in
        this._aofState = room_config.bettype_aof_on == 1
        this._sryxState = room_config.private_room == 1
        if (room_config.origin_type == 5) {
            this._selectTitle = 0
        } else if (room_config.origin_type == 3) {
            this._selectTitle = 1
        }

        this.zxblbs['levelData'] = { min: 1, total: 4, level: room_config.retain_min_rate }
        this.zwrs['levelData'] = { min: 2, total: 9, level: room_config.seat_count }
        this.zdks['levelData'] = { min: 2, total: 9, level: room_config.autostart_min_players }
        this.Straddle['levelData'] = { min: 0, total: 6, level: room_config.straddle_max }
        this._yxbzNum = room_config.plo_game_type
        this._dcjfpNum = room_config.retain_type
        this._jslxNum = room_config.settlement_type
        this._sksjNum = room_config.op_duration
        this._selectRoleType = room_config.blind_type - 1;
        //牌局时长
        this.calculateIndex('pjsc', room_config.play_duration / 3600)
        //最低池率
        if (room_config.limit_hc_pool_rate == 0) {
            this.calculateIndex('zdcl', '不限')
        } else {
            this.calculateIndex('zdcl', room_config.limit_hc_pool_rate)
        }
        //总手数
        if (room_config.limit_hc_total_hands == 0) {
            this.calculateIndex('zss', '不限')
        } else {
            this.calculateIndex('zss', room_config.limit_hc_total_hands)
        }
        //大小盲
        this.itemData.dxm = dxmConfig[this._selectRoleType];
        this.calculateIndex('dxm', room_config.sb / 100)
        //前注
        this.itemData.qwsz = this.qzshData[room_config.sb / 100]
        this.calculateIndex('qwsz', room_config.ante)

        //服务费比例
        this.calculateIndex('fwfbl', room_config.fee_permillage)

        this.passNodeEd.string = room_config.room_password;
        this.shareClubIdEd.string = room_config.share_clubs


        // //最小记分牌比例
        // this.calculateIndex('jfpbs', room_config.min_rate / 100)
        // this.calculateIndex('fddm', room_config.sb / 100)


        ClubCache.CreateGameType = room_config.game_play_type



    }
    initUI() {
        this.titleNodeClick(null, this._selectTitle)
        this.initdxmToggleNode();
        this.initSlideNode()
        this.initSelect();

        // this.initDropBoX();

        this.setState(this.zxblbs)
        this.setState(this.zwrs)
        this.setState(this.zdks)
        this.setState(this.Straddle)

        cc.find(`ToggleContainer/toggle${this._jslxNum}`, this.jslx).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this._dcjfpNum}`, this.dcjfp).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this._sksjNum}`, this.sksj).getComponent(cc.Toggle).isChecked = true;
        this.titleNode.active = ClubCache.tribe_name ? true : false;
        this.yxbz.active = ClubCache.CreateGameType == 2
        if (this.yxbz.active) {
            cc.find(`ToggleContainer/toggle${this._yxbzNum}`, this.yxbz).getComponent(cc.Toggle).isChecked = true;

        }
    }
    initdxmToggleNode() {
        this.toggleNode.children.forEach((item, index) => {
            this.bindClick(item, this.switchTabBtnState, index);
        })
        this.switchTabBtnState(0);
    }
    switchTabBtnState(index: number) {
        if (this._selectRoleType == index) return;
        this._selectRoleType = index
        this.itemData.dxm = dxmConfig[this._selectRoleType]
        this.toggleNode.children.forEach((item, index) => {
            item.getChildByName("title").opacity = this._selectRoleType == index ? 255 : 75
        })
        let dxm: any = cc.find('item/Rectangle', this.dxm).getComponent('slidewidght');
        dxm._targetDe = this;
        dxm.initUi(this.itemData.dxm, this.itemDataIndex.dxm)

    }
    initSlideNode() {
        let dxm: any = cc.find('item/Rectangle', this.dxm).getComponent('slidewidght');
        dxm._targetDe = this;
        dxm.initUi(this.itemData.dxm, this.itemDataIndex.dxm)

        let drjfp: any = cc.find('item/Rectangle', this.drjfp).getComponent('slidewidght');
        drjfp._targetDe = this;
        drjfp.initUi(this.itemData.dxm, this.itemDataIndex.jfpbs)

        let qz: any = cc.find('item/Rectangle', this.qz).getComponent('slidewidght');
        qz._targetDe = this;
        qz.initUi(this.itemData.qwsz, this.itemDataIndex.qwsz)


        let fwfbl: any = cc.find('item/Rectangle', this.fwfbl).getComponent('slidewidght');
        fwfbl._targetDe = this;
        fwfbl.initUi(this.itemData.fwfbl, this.itemDataIndex.fwfbl)


        let fddm: any = cc.find('item/Rectangle', this.fddm).getComponent('slidewidght');
        fddm._targetDe = this;
        fddm.initUi(this.itemData.fddm, this.itemDataIndex.fddm)


        let pjsc: any = cc.find('item/Rectangle', this.pjsc).getComponent('slidewidght');
        pjsc._targetDe = this;
        pjsc.initUi(this.itemData.pjsc, this.itemDataIndex.pjsc)

        let zdrcl: any = cc.find('item/Rectangle', this.zdrcl).getComponent('slidewidght');
        zdrcl._targetDe = this;
        zdrcl.initUi(this.itemData.zdcl, this.itemDataIndex.zdcl)

        let zssxz: any = cc.find('item/Rectangle', this.zssxz).getComponent('slidewidght');
        zssxz._targetDe = this;
        zssxz.initUi(this.itemData.zss, this.itemDataIndex.zss)
    }

    changeQzsh(num) {
        let _data: any = this.qzshData[num]
        this.itemData.qwsz = _data
        let qz: any = cc.find('item/Rectangle', this.qz).getComponent('slidewidght');
        qz.initUi(this.itemData.qwsz, 0)
    }

    addClick(event, customData) {
        let node = this.getLevelParent(customData);
        node['levelData'].level += 1;
        this.setState(node);
    }
    reduceClick(event, customData) {
        let node = this.getLevelParent(customData)
        node['levelData'].level -= 1;
        this.setState(node);
    }
    setState(node) {
        let reduceButton = cc.find('Rectang/reduce', node).getComponent(cc.Button);
        reduceButton.interactable = node['levelData'].level > node['levelData'].min

        let addButton = cc.find('Rectang/add', node).getComponent(cc.Button);
        addButton.interactable = node['levelData'].level < node['levelData'].total

        let lbl_level = cc.find('Rectang/lbl_level', node).getComponent(cc.Label);
        lbl_level.string = node['levelData'].level;

    }
    getLevelParent(num) {
        switch (Number(num)) {
            case 1:
                return this.zxblbs
            case 2:
                return this.zwrs
                break;
            case 3:
                return this.zdks
            case 4:
                return this.Straddle
                break;

            default:
                break;
        }
    }
    dcjfpToggle(event, customData) {
        this._dcjfpNum = Number(customData);

    }
    jsblToggle(event, customData) {
        this._jslxNum = Number(customData);
        this.fddm.active = this._jslxNum == 0
    }
    sksjToggle(event, customData) {
        this._sksjNum = Number(customData);
    }
    yxbzToggle(event, customData) {
        this._yxbzNum = Number(customData);
    }


    titleNodeClick(event, customData) {
        this._selectTitle = customData
        this.memberListT.getChildByName('block').active = this._selectTitle == TITALTYPE.GAME_TYPE
        this.applyListT.getChildByName('block').active = this._selectTitle == TITALTYPE.MODEL
        this.memberListT.getChildByName('title').color = this._selectTitle == TITALTYPE.GAME_TYPE ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.applyListT.getChildByName('title').color = this._selectTitle == TITALTYPE.MODEL ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        this.clubIdNode.active = this._selectTitle == TITALTYPE.MODEL
    }
    initSelect() {
        cc.find('btn_switch/open', this.yckp).active = this._yckpState;
        cc.find('btn_switch/close', this.yckp).active = !this._yckpState;
        cc.find('btn_switch/open', this.bm).active = this._bmState;
        cc.find('btn_switch/close', this.bm).active = !this._bmState;

        cc.find('btn_switch/open', this.drsq).active = this._kzwjdrState;
        cc.find('btn_switch/close', this.drsq).active = !this._kzwjdrState;

        cc.find('btn_switch/open', this.bx).active = this._bxState;
        cc.find('btn_switch/close', this.bx).active = !this._bxState;

        cc.find('btn_switch/open', this.sryy).active = this._sryxState;
        cc.find('btn_switch/close', this.sryy).active = !this._sryxState;

        cc.find('btn_switch/open', this.aof).active = this._aofState;
        cc.find('btn_switch/close', this.aof).active = !this._aofState;


        cc.find('btn_switch/open', this.etp).active = this._etpState;
        cc.find('btn_switch/close', this.etp).active = !this._etpState;

        this.passNode.active = this._sryxState
        this.dcjfp.active = this._aofState
        this.zxblbs.active = this._aofState
    }
    yckpCilck() {
        this._yckpState = !this._yckpState
        cc.find('btn_switch/open', this.yckp).active = this._yckpState;
        cc.find('btn_switch/close', this.yckp).active = !this._yckpState;
    }
    bmCilck() {
        this._bmState = !this._bmState
        cc.find('btn_switch/open', this.bm).active = this._bmState;
        cc.find('btn_switch/close', this.bm).active = !this._bmState;
    }
    kzwjdrCilck() {
        this._kzwjdrState = !this._kzwjdrState
        cc.find('btn_switch/open', this.drsq).active = this._kzwjdrState;
        cc.find('btn_switch/close', this.drsq).active = !this._kzwjdrState;
    }
    bxCilck() {
        this._bxState = !this._bxState
        cc.find('btn_switch/open', this.bx).active = this._bxState;
        cc.find('btn_switch/close', this.bx).active = !this._bxState;
    }
    sryxClick() {
        this._sryxState = !this._sryxState
        cc.find('btn_switch/open', this.sryy).active = this._sryxState;
        cc.find('btn_switch/close', this.sryy).active = !this._sryxState;
        this.passNode.active = this._sryxState
    }

    etpClick() {
        this._etpState = !this._etpState
        cc.find('btn_switch/open', this.etp).active = this._etpState;
        cc.find('btn_switch/close', this.etp).active = !this._etpState;
    }

    aofClick() {
        this._aofState = !this._aofState
        cc.find('btn_switch/open', this.aof).active = this._aofState;
        cc.find('btn_switch/close', this.aof).active = !this._aofState;
        this.dcjfp.active = this._aofState
        this.zxblbs.active = this._aofState

    }
    ipCilck() {
        this._ipState = !this._ipState
        let block = cc.find('slectNode/1/block', this.yyxz);
        block.active = this._ipState
    }
    gpsCilck() {
        this._gpsState = !this._gpsState
        let block = cc.find('slectNode/2/block', this.yyxz);
        block.active = this._gpsState
    }
    initDropBoX() {
        // let dcjfp_dropDownBox = cc.instantiate(this.dropDownBox);
        // dcjfp_dropDownBox.parent = this.dcjfp
        // dcjfp_dropDownBox.position = cc.v3(367, -5, 0);
        // dcjfp_dropDownBox.width = 320
        // dcjfp_dropDownBox.getComponent('dropDownBox').initData(dcjfpConfig, () => {

        // })

        // let zzbljfp_dropDownBox = cc.instantiate(this.dropDownBox);
        // zzbljfp_dropDownBox.parent = this.zxblbs
        // zzbljfp_dropDownBox.position = cc.v3(367, -5, 0);
        // zzbljfp_dropDownBox.width = 320
        // zzbljfp_dropDownBox.getComponent('dropDownBox').initData(zxbljfpbsConfig, () => {

        // })

        // let jslx_dropDownBox = cc.instantiate(this.dropDownBox);
        // jslx_dropDownBox.parent = this.jslx
        // jslx_dropDownBox.position = cc.v3(310, -5, 0);
        // jslx_dropDownBox.width = 450
        // jslx_dropDownBox.getComponent('dropDownBox').initData(jslxConfig, () => {

        // })

        // let zwsl_dropDownBox = cc.instantiate(this.dropDownBox);
        // zwsl_dropDownBox.parent = this.zwrs
        // zwsl_dropDownBox.position = cc.v3(367, -5, 0);
        // zwsl_dropDownBox.width = 320
        // zwsl_dropDownBox.getComponent('dropDownBox').initData(zwslConfig, () => {

        // })

        // let zdks_dropDownBox = cc.instantiate(this.dropDownBox);
        // zdks_dropDownBox.parent = this.zdks
        // zdks_dropDownBox.position = cc.v3(367, -5, 0);
        // zdks_dropDownBox.width = 320
        // zdks_dropDownBox.getComponent('dropDownBox').initData(zwslConfig, () => {

        // })

        // let Straddle_dropDownBox = cc.instantiate(this.dropDownBox);
        // Straddle_dropDownBox.parent = this.Straddle
        // Straddle_dropDownBox.position = cc.v3(367, -5, 0);
        // Straddle_dropDownBox.width = 320
        // Straddle_dropDownBox.getComponent('dropDownBox').initData(zwslConfig, () => {

        // })


    }


    saveModel(event, customData) {
        this._btnType == Number(customData)

        this.fillName();
    }
    fillName() {
        if (this.room_config) {
            this.upLoadData(this.room_config.name)
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
        room_config.game_play_type = ClubCache.CreateGameType;
        if (ClubCache.CreateGameType == 2) {
            room_config.plo_game_type = this._yxbzNum
        }
        if (ClubCache.joinCreateMatchType == 0) {
            room_config.origin_type = this._selectTitle == 0 ? 5 : 3
        }
        room_config.private_room = this._sryxState ? 1 : 0
        room_config.room_password = this.passNodeEd.string;
        room_config.blind_type = this._selectRoleType + 1;
        room_config.share_clubs = this.shareClubIdEd.string;
        room_config.bettype_aof_on = this._aofState ? 1 : 0
        room_config.ante = Number(this.qz.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) * 100 //前注筹码,必填
        room_config.sb = Number(this.dxm.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) * 100 //小盲注,必填
        room_config.op_duration = this._sksjNum;
        //功能为实现
        room_config.min_rate = 1;
        room_config.max_rate = 4;
        room_config.autostart_min_players = this.zdks['levelData'].level
        // room_config.min_players = this.zdks['levelData'].level
        room_config.straddle_max = this.Straddle['levelData'].level;
        room_config.insurance = this._bxState;
        room_config.delay_view_card = this._yckpState;
        room_config.post = this._bmState;
        room_config.limit_ip = this._ipState
        room_config.limit_gps = this._gpsState
        room_config.seat_count = this.zwrs['levelData'].level;
        room_config.play_duration = Number(this.pjsc.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) * 3600    //房间有效时长 秒,必填
        room_config.retain_min_rate = this.zxblbs['levelData'].level;//最小倍率 最小保留记分牌倍数
        // room_config.tribe_id = ClubCache.tribe_id;

        if (this.zssxz.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'] == '不限') {
            room_config.limit_hc_total_hands = 0;
            room_config.hc_total_hands_lv = false;
        } else {
            room_config.hc_total_hands_lv = true;
            room_config.limit_hc_total_hands = Number(this.zssxz.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'])          //总手数限制 手数
        }

        if (this.zdrcl.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'] == '不限') {
            room_config.limit_hc_pool_rate = 0;
            room_config.hc_pool_rate_lv = false;
        } else {
            room_config.hc_pool_rate_lv = true;
            room_config.limit_hc_pool_rate = Number(this.zdrcl.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'])           //最低入池率 
        }
        room_config.retain_type = Number(this._dcjfpNum)
        room_config.settlement_type = this._jslxNum
        room_config.fee_permillage = Number(this.fwfbl.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) //服务费比例(0-100)
        room_config.second_public_cards = this._etpState;
        room_config.limit_bet_type = ClubCache.CreateGameType == 2 ? 1 : 0
        let params: any = { name: modelName, room_config: room_config }

        // room_config.limit_bring_in = this._kzwjdrState
        //模版
        if (this._btnType == 0) {
            if (this.room_config) {
                params.id = this.room_config.id
                await UIClubModel.mInstance.APIOrgUpdateTemplate(params);
            } else {
                await UIClubModel.mInstance.APIOrgCreateTemplate(params);

            }
            this.post(EventName.matchModelChange)

        }
        else if (this._btnType == 1) {
            //公会牌桌
            if (ClubCache.joinCreateMatchType == 0) {
                // room_config.insurance = this._bxState
                // room_config.limit_friend_table = false
                // room_config.limit_bring_in = false
                let data = await UIClubModel.mInstance.APIOrgRoomConfigCreate(params);
                // this.post(EventName.updateChessView);
            }
            else {
                // //朋友桌
                // if (this.fddmHd.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
                //     room_config.max_per_hand = 0 //服务费比例(0-100)

                // } else {
                //     room_config.max_per_hand = Number(this.fddmHd.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) * 100 //服务费比例(0-100)
                // }


                // room_config.fee_permillage = Number(this.jslx.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) //服务费比例(0-100)
                // room_config.limit_friend_table = true;
                // room_config.limit_bring_in = this.kzwjdrState;
                let data: any = await UIClubModel.mInstance.APIOrgRoomConfigCreate(params);
                this.top_block.active = true;
                await TimeHelper.Sleep(1000);
                data = await UIClubModel.mInstance.APIOrgFriendRoomInfo(data.data.room_id);
                this.post(EventName.updateFriendChessView)
                this.top_block.active = false;
                let _data = new LobbyRoomListItem(data.data.data);
                GameUtil.EnterRoomAPI(_data, [UIDefine.UIClubCreateMatch]);
            }
        }
        this.close();
        this.room_config = null;

        // let _room_config: any = {
        //     "limit_bet_type": 0, //底池限制类型：0-无底池限制，1-底池限制，2-AOF,必填
        // }

    }
    straddleClick() {
        this.Straddle.getChildByName('Group').active = !this.Straddle.getChildByName('Group').active
    }

}
