/*
 * @Author: xfj
 * @Date: 2022-10-17 13:50:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-05-06 11:48:09
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIClubCreateMatch.ts
 */
enum TITALTYPE {
    GAME_TYPE = 0,
    MODEL = 1,
}
import BaseForm from "../../../ui/form/BaseForm";

import ComFormTitle from "../../../common/ComFormTitle";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { dxmConfig, } from "../../../frame/data/rate/RateConfig";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { UIClubModel } from "../../labor/UIClubModel";
import { EventName } from "../../../config/EventName";
import TimeHelper from "../../../helper/TimeHelper";
import LobbyRoomListItem from "../../../frame/data/lobby/LobbyRoomListItem";
import { UIDefine } from "../../../define/UIDefine";
import GameUtil, { GameEnterType } from "../../../game/util/GameUtil";
import { APIUserDiamondsWallet } from "../../../net/https/WebRequest";
import TabNode from "../../../common/tabNode";
import { createMatchTabConfig, dxmTabConfig, gameChangeTypeTabConfig, fzbTabConfig, bcTabConfig } from "../../../frame/config/tabConfig";
import GGSlider from "../../../ui/component/GGSlider";
import GGSwitch from "../../../ui/component/GGSwitch";
import UIComponent from "../../../ui/UIComponent";
import { StringHelper } from "../../../helper/StringHelper";
import DiamondModel from "../../../diamond/DiamondModel";

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
    @property(cc.Node)
    saveBtn: cc.Node = null;

    private comFormTitle: ComFormTitle = null;
    tabNode: TabNode
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
    yxbz: cc.Node = null;
    etp: cc.Node = null;
    yxjz: cc.Node = null;
    coinNode: cc.Node = null;
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
    deal_delayNum = 1;

    room_config = null;

    itemData = {
        qwsz: [0, 1, 2, 4, 8, 18, 20, 30],
        pjsc: [0.5, 1, 2, 3, 4, 5, 6],
        zdcl: ['UIClub_CreateRoom23', 25, 30, 35, 40, 45],
        zss: ['UIClub_CreateRoom23', 50, 100, 300, 1000],
        fddm: ['UIClub_CreateRoom23', 0.1, 0.2, 0.3, 0.4, 0.5, 1, 1.5, 2, 2.5, 3],
        fwfbl: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],//5+
        dxm: [0.1, 0.2, 0.3, 0.4, 0.5],
    }

    itemDataIndex = {
        qwsz: 0,
        pjsc: 0,
        jfpbs: 2,
        jfpbs1: 16,
        zdcl: 0,
        zss: 0,
        fddm: 0,
        dxm: 0,
        fwfbl: 10
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


    sryxSwitch: GGSwitch = null;
    aofSwitch: GGSwitch = null;
    toggleNode: cc.Node = null;

    yxbzTabNode: TabNode = null;
    dxmTabNode: TabNode = null;
    fzbTabNode: TabNode = null;
    drsqSwitch: GGSwitch = null;
    yckpSwitch: GGSwitch = null;
    bmSwitch: GGSwitch = null;
    bxSwitch: GGSwitch = null;
    sr_zw: cc.Node = null;
    clubNode: cc.Node = null;
    friendNode: cc.Node = null;
    bcNode: cc.Node = null;
    bcTabNode: TabNode = null;
    ffrs: cc.Node = null;
    ffrsItem: cc.Node = null;
    // etpSwitch: GGSwitch = null;
    _isFromModel = false
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

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
        this.coinNode = this.getChildNodeOrComponent("coinNode");

        this.zxblbs['levelData'] = { min: 1, total: 4, level: 1 }
        this.zwrs['levelData'] = { min: 2, total: 9, level: 2 }
        this.zdks['levelData'] = { min: 2, total: 9, level: 2 }
        this.Straddle['levelData'] = { min: 0, total: 6, level: 2 }

        this.tabNode = this.getChildNodeOrComponent("tabNode", TabNode);
        this.sryxSwitch = this.getChildNodeOrComponent("sryxSwitch", GGSwitch);
        this.aofSwitch = this.getChildNodeOrComponent("aofSwitch", GGSwitch);
        this.yxbzTabNode = this.getChildNodeOrComponent("yxbzTabNode", TabNode);
        this.dxmTabNode = this.getChildNodeOrComponent("dxmTabNode", TabNode);
        this.drsqSwitch = this.getChildNodeOrComponent("drsqSwitch", GGSwitch);
        this.bmSwitch = this.getChildNodeOrComponent("bmSwitch", GGSwitch);
        this.bxSwitch = this.getChildNodeOrComponent("bxSwitch", GGSwitch);
        this.yckpSwitch = this.getChildNodeOrComponent("yckpSwitch", GGSwitch);
        this.fzbTabNode = this.getChildNodeOrComponent("fzbTabNode", TabNode);
        this.sr_zw = this.getChildNodeOrComponent("sr_zw");
        this.friendNode = this.getChildNodeOrComponent("friendNode");
        this.clubNode = this.getChildNodeOrComponent("clubNode");
        this.bcNode = this.getChildNodeOrComponent("bcNode");
        this.bcTabNode = this.getChildNodeOrComponent("bcTabNode", TabNode);
        this.ffrs = this.getChildNodeOrComponent("ffrs");
        this.yxjz = this.getChildNodeOrComponent("yxjz");
        this.ffrsItem = this.getChildNodeOrComponent("Item");
    }
    async onShow(data?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(data, fromUI, sceneUI);
        let title = "UIGuild_CreateTable"
        let _title = i18nMgr.Get(title)
        //获取钻石配置
        DiamondModel.Instance.ReqDiamondConfig(1)
        _title = _title + this.getMatchType()
        this.comFormTitle.initData(_title, this);
        if (data) {
            this._isFromModel = true;
            this.editModel(data);
        } else {
            this._isFromModel = false;
            this.room_config = null;
        }
        this.initUI()
        await UIClubModel.mInstance.APIUserDiamondsWallet();
        let wallet = APIUserDiamondsWallet.Response.data;
        ClubCache._diamonds_wallet = wallet?.diamonds_wallet
        let own = cc.find('own/num', this.coinNode).getComponent(cc.Label)
        own.string = ClubCache._diamonds_wallet?.diamonds || 0 + '';
        let tip = cc.find('dynamicPay/tip', this.coinNode)
        let pricTip = this.node.getChildByName('pricTip')
        this.bindClick(tip, () => {
            pricTip.active = true;
        })

    }
    async initDiamond() {
        if (ClubCache.joinCreateMatchType == 1) {
            this._selectTitle = 0
        }
        let diamondConfig = DiamondModel.Instance.GetDiamondConfig(this.GetDiamondTypeText(1), 1);
        if (diamondConfig == null) {
            return;
        }
        let own = cc.find('own/num', this.coinNode).getComponent(cc.Label)
        own.string = ClubCache._diamonds_wallet?.diamonds || 0 + '';

        let pay = cc.find('dynamicPay/pay/num', this.coinNode).getComponent(cc.Label)
        let pay1 = cc.find('dynamicPay/pay1/num', this.coinNode).getComponent(cc.Label)
        let noPay = cc.find('dynamicPay/noPay', this.coinNode)

        let element = this.getPriceBySb(diamondConfig.setting)
        if (element.discount_price == 0) {
            pay.node.parent.active = false
            noPay.active = true
            pay1.node.parent.active = true
        }
        else if (element.price == element.discount_price) {
            pay.node.parent.active = true
            noPay.active = false
            pay1.node.parent.active = false

        } else {
            pay.node.parent.active = true
            noPay.active = false
            pay1.node.parent.active = true
        }
        pay.string = element.discount_price
        pay1.string = element.price
        pay1._forceUpdateRenderData()
        let Rectangle = cc.find('dynamicPay/pay1/zs/Rectangle', this.coinNode)
        Rectangle.width = pay1.node.width + 50
        let PricTipScript = this.node.getChildByName('pricTip').getComponent('pricTip')
        PricTipScript.price.string = element.discount_price + i18nMgr.Get('UIMine_VIP_diamond')

        // this.friendNode.active = this._selectTitle == 1 && ClubCache.joinCreateMatchType == 0
        // this.clubNode.active = this._selectTitle == 0 || ClubCache.joinCreateMatchType == 1

    }
    getPriceBySb(diamondConfig) {
        let sb = this.dxm.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'] * 100
        let data = null
        diamondConfig.forEach(element => {
            if (element.sb == sb) {
                data = element
            }
        });
        return data
    }
    GetDiamondTypeText(config_type) {
        let typeText = 0;
        let hundred = 0;//百位数 ：1 平台，2 联盟，3 公会 4 个人（朋友桌）
        let ten = 0;//十位数：是否共享牌桌 1 不共享 2 共享 （如果再区分币种，预留 2 USDT桌 3 联盟币）
        let one = 0;//个位数：是否比赛 0 不是， 1 是
        if (config_type == 1) {

            hundred = ClubCache.joinCreateMatchType == 0 ? 300 : 400
            ten = this._selectTitle == 1 ? 20 : 10;
        }

        // switch (config_type) {
        //     case 2:
        //         thousand = Thousand * 1000;
        //         break;
        //     case 8:
        //         thousand = Thousand * 1000;
        //         break;
        //     default:
        //         thousand = 0;
        //         break;
        // }
        typeText = hundred + ten + one;
        return typeText;
    }
    getMatchType() {
        let _string = 'NLH'
        switch (ClubCache.CreateGameType) {
            case 1:
                _string = 'NLH'
                break;
            case 2:
                _string = 'PLO'
                break;
            case 3:
                _string = '6+'
                break;
                break;

            default:
                break;
        }
        return '-' + _string
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
        this._kzwjdrState = room_config.limit_bring_in == 1
        this._aofState = room_config.bettype_aof_on == 1
        this._sryxState = room_config.private_room == 1
        // if (room_config.origin_type == 5) {
        //     this._selectTitle = 0
        // } else if (room_config.origin_type == 3) {
        //     this._selectTitle = 1
        // }
        this._selectTitle = room_config.share_table == 1 ? 0 : 1;
        this.zxblbs['levelData'] = { min: 1, total: 4, level: room_config.retain_min_rate }
        this.zwrs['levelData'] = { min: 2, total: 9, level: room_config.seat_count }
        this.zdks['levelData'] = { min: 2, total: 9, level: room_config.autostart_min_players }
        this.Straddle['levelData'] = { min: 0, total: 6, level: room_config.straddle_max }
        this._yxbzNum = room_config.plo_game_type
        this._dcjfpNum = room_config.retain_type
        this._jslxNum = room_config.settlement_type
        this._sksjNum = room_config.op_duration
        this.deal_delayNum = room_config.deal_delay
        this._selectRoleType = room_config.blind_type - 1;
        //牌局时长
        this.calculateIndex('pjsc', room_config.play_duration / 3600)
        //最低池率
        if (room_config.limit_hc_pool_rate == 0) {
            this.calculateIndex('zdcl', 'UIClub_CreateRoom23')
        } else {
            this.calculateIndex('zdcl', room_config.limit_hc_pool_rate)
        }
        //总手数
        if (room_config.limit_hc_total_hands == 0) {
            this.calculateIndex('zss', 'UIClub_CreateRoom23')
        } else {
            this.calculateIndex('zss', room_config.limit_hc_total_hands)
        }
        //大小盲
        this.itemData.dxm = dxmConfig[this._selectRoleType];
        this.calculateIndex('dxm', room_config.sb / 100)
        //前注
        this.itemData.qwsz = this.qzshData[room_config.sb / 100]
        this.calculateIndex('qwsz', room_config.ante / 100)

        //服务费比例
        this.calculateIndex('fwfbl', room_config.fee_permillage)

        this.passNodeEd.string = room_config.room_password;
        this.shareClubIdEd.string = room_config.share_clubs


        // let small = room_config.sb / 2 
        // this.itemDataIndex.jfpbs = room_config.min_rate / 100 / small
        // this.itemDataIndex.jfpbs1 = room_config.max_rate / small

        this.itemDataIndex.jfpbs = room_config.min_rate / 100 * (room_config.sb * 2)
        this.itemDataIndex.jfpbs1 = room_config.max_rate / 100 * (room_config.sb * 2)
        ClubCache.CreateGameType = room_config.game_play_type
    }
    initUI() {
        this.initSlideNode()
        this.setState(this.zxblbs)
        this.setState(this.zwrs)
        this.setState(this.zdks)
        this.setState(this.Straddle)

        cc.find(`ToggleContainer/toggle${this._jslxNum}`, this.jslx).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this._dcjfpNum}`, this.dcjfp).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this._sksjNum}`, this.sksj).getComponent(cc.Toggle).isChecked = true;
        cc.find(`ToggleContainer/toggle${this.deal_delayNum}`, this.yxjz).getComponent(cc.Toggle).isChecked = true;
        this.saveBtn.active = ClubCache.joinCreateMatchType == 0
        this.bcNode.active = this._jslxNum == 1
        if (this._selectTitle == 0 || ClubCache.joinCreateMatchType == 1) {
            this.drsq.active = true
        } else {
            this.drsq.active = false
        }
        this.initSwitch();
        this.initTabNode();
    }
    /**************** */
    initSwitch() {
        //私人游戏
        this.sryxSwitch.setIsOn(this._sryxState)
        this.sryxSwitch.clickObj = {
            click: () => {
                this._sryxState = !this._sryxState
                this.passNode.active = this._sryxState
            }, self: this
        };
        this.passNode.active = this._sryxState

        //aof
        this.aofSwitch.setIsOn(this._aofState)
        this.aofSwitch.clickObj = {
            click: () => {
                this._aofState = !this._aofState
                this.dcjfp.active = this._aofState
                this.zxblbs.active = this._aofState
            }, self: this
        };
        this.dcjfp.active = this._aofState
        this.zxblbs.active = this._aofState


        this.drsqSwitch.setIsOn(this._kzwjdrState)
        this.drsqSwitch.clickObj = {
            click: () => {
                this._kzwjdrState = !this._kzwjdrState
            }, self: this
        };


        this.bmSwitch.setIsOn(this._bmState)
        this.bmSwitch.clickObj = {
            click: () => {
                this._bmState = !this._bmState
            }, self: this
        };


        this.yckpSwitch.setIsOn(this._yckpState)
        this.yckpSwitch.clickObj = {
            click: () => {
                this._yckpState = !this._yckpState
            }, self: this
        };

        this.bxSwitch.setIsOn(this._bxState)
        this.bxSwitch.clickObj = {
            click: () => {
                this._bxState = !this._bxState
            }, self: this
        };


    }
    initTabNode() {
        this.sr_zw.active = ClubCache.joinCreateMatchType == 2
        this.sryy.active = true
        createMatchTabConfig.defaultIndex = this._selectTitle;
        this.tabNode.initData(createMatchTabConfig, (customData) => {
            this._selectTitle = customData
            this.initDiamond();
            if (ClubCache.joinCreateMatchType == 1) {
                this.tabNode.node.active = false
                this.clubIdNode.active = false
                this.passNode.active = false
                this.sryy.active = false

            } else {
                this.clubIdNode.active = this._selectTitle == 1
                this.tabNode.node.active = ClubCache.tribe_name ? true : false;
            }
            if (this._selectTitle == 0 || ClubCache.joinCreateMatchType == 1) {
                this.drsq.active = true
            } else {
                this.drsq.active = false
            }
        }, this)

        gameChangeTypeTabConfig.defaultIndex = this._yxbzNum - 4 < 0 ? 0 : this._yxbzNum - 4;
        this.yxbzTabNode.initData(gameChangeTypeTabConfig, (customData) => {
            this._yxbzNum = Number(customData) + 4;
        }, this)

        this.yxbz.active = ClubCache.CreateGameType == 2
        dxmTabConfig.defaultIndex = this._selectRoleType
        this.dxmTabNode.initData(dxmTabConfig, (customData) => {
            this._selectRoleType = customData
            this.itemData.dxm = dxmConfig[this._selectRoleType]
            let dxm: any = cc.find('slideItem/Rectangle', this.dxm).getComponent('slidewidght');
            dxm._targetDe = this;
            dxm.initUi(this.itemData.dxm, this.itemDataIndex.dxm)

            this.resetDrjfp();
            this._isFromModel = false
            this.changeQzsh(this.itemData.dxm[this.itemDataIndex.dxm])
        }, this)


        // this.fzbTabNode.initData(fzbTabConfig, (customData) => {
        // }, this)

        this.bcTabNode.initData(bcTabConfig, (customData) => {
            // if (customData == 1) {
            //     UIComponent.Instance.Toast(i18nMgr.Get('adaptation10113'))
            //     return
            // }
            this.fddm.active = customData == 0
            this.ffrs.active = customData == 1
        }, this)
    }
    fdrsButton(event, customData) {
        if (customData == '1') {
            let item = cc.instantiate(this.ffrsItem);
            item.getChildByName('nomalItem').active = false
            item.getChildByName('cloneItem').active = true

            item.parent = this.ffrs;
        } else {
            event.target.parent.parent.removeFromParent()
        }
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

    addClick(event, customData) {

        let node = this.getLevelParent(customData);
        this.correlationTableAndPeople(1, node)

    }
    reduceClick(event, customData) {
        let node = this.getLevelParent(customData)
        this.correlationTableAndPeople(0, node)
        // node['levelData'].level -= 1;
        // this.setState(node);
    }
    setState(node) {
        let reduceButton = cc.find('Rectang/reduce', node).getComponent(cc.Button);
        reduceButton.interactable = node['levelData'].level > node['levelData'].min

        let addButton = cc.find('Rectang/add', node).getComponent(cc.Button);
        addButton.interactable = node['levelData'].level < node['levelData'].total

        let lbl_level = cc.find('Rectang/lbl_level', node).getComponent(cc.Label);
        lbl_level.string = node['levelData'].level;

    }

    //
    correlationTableAndPeople(type, node) {
        // if (node.name == 'zdks' && type == 1 && node['levelData'].level >= this.zwrs['levelData'].level) {

        // }
        // if (node.name == 'zwrs') {
        //     if (this.zdks['levelData'].level >= this.zwrs['levelData'].level) {
        //         this.zdks['levelData'].level = this.zwrs['levelData'].level
        //     }
        // }


        if (type == 1) {
            if (node['levelData'].level < node['levelData'].total) {
                node['levelData'].level += 1;
            }

        } else {
            if (node['levelData'].level > node['levelData'].min) {
                node['levelData'].level -= 1;
            }
        }
        if (node.name == 'zdks' || node.name == 'zwrs') {
            if (this.zdks['levelData'].level >= this.zwrs['levelData'].level) {
                this.zdks['levelData'].level = this.zwrs['levelData'].level
                let lbl_level = cc.find('Rectang/lbl_level', this.zdks).getComponent(cc.Label);
                lbl_level.string = node['levelData'].level;
            }
        }
        this.setState(node);
    }

    etpClick() {
        this._etpState = !this._etpState
        cc.find('btn_switch/open', this.etp).active = this._etpState;
        cc.find('btn_switch/close', this.etp).active = !this._etpState;
    }

    /**************** */



    resetDrjfp() {
        let sb = Number(this.dxm.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'])
        let drjfp: any = cc.find('item/Rectangle', this.drjfp).getComponent('slidewidght1');
        drjfp._targetDe = this;
        let small = sb * 20;
        let big = small * 30
        if (!this._isFromModel) {
            let _offNum = (big - small) / 29
            this.itemDataIndex.jfpbs = small
            this.itemDataIndex.jfpbs1 = small + _offNum * 7
        }

        drjfp.initUi(small, big, this.itemDataIndex.jfpbs, this.itemDataIndex.jfpbs1)
        this.initDiamond();
    }
    initSlideNode() {
        let dxm: any = cc.find('slideItem/Rectangle', this.dxm).getComponent('slidewidght');
        dxm._targetDe = this;
        dxm.initUi(this.itemData.dxm, this.itemDataIndex.dxm)



        let fwfbl: any = cc.find('slideItem/Rectangle', this.fwfbl).getComponent('slidewidght');
        fwfbl._targetDe = this;
        fwfbl.initUi(this.itemData.fwfbl, this.itemDataIndex.fwfbl)


        let fddm: any = cc.find('slideItem/Rectangle', this.fddm).getComponent('slidewidght');
        fddm._targetDe = this;
        fddm.initUi(this.itemData.fddm, this.itemDataIndex.fddm)


        let pjsc: any = cc.find('slideItem/Rectangle', this.pjsc).getComponent('slidewidght');
        pjsc._targetDe = this;
        pjsc.initUi(this.itemData.pjsc, this.itemDataIndex.pjsc)

        let zdrcl: any = cc.find('slideItem/Rectangle', this.zdrcl).getComponent('slidewidght');
        zdrcl._targetDe = this;
        zdrcl.initUi(this.itemData.zdcl, this.itemDataIndex.zdcl)

        let zssxz: any = cc.find('slideItem/Rectangle', this.zssxz).getComponent('slidewidght');
        zssxz._targetDe = this;
        zssxz.initUi(this.itemData.zss, this.itemDataIndex.zss)
    }

    changeQzsh(num) {
        let _data: any = this.qzshData[num]
        this.itemData.qwsz = _data
        let qz: any = cc.find('slideItem/Rectangle', this.qz).getComponent('slidewidght');
        qz._targetDe = this;
        qz.initUi(this.itemData.qwsz, 0)
    }



    getLevelParent(num) {
        switch (Number(num)) {
            case 1:
                return this.zwrs

            case 2:
                return this.zdks
            case 3:
                return this.zxblbs
            case 4:
                return this.Straddle
            default:
                break;
        }
    }
    dcjfpToggle(event, customData) {
        this._dcjfpNum = Number(customData);

    }
    jsblToggle(event, customData) {
        this._jslxNum = Number(customData);
        this.bcNode.active = this._jslxNum == 1
    }
    sksjToggle(event, customData) {
        this._sksjNum = Number(customData);
    }
    yxbzToggle(event, customData) {
        this._yxbzNum = Number(customData);
    }
    yxjzToggle(event, customData) {
        this.deal_delayNum = Number(customData)
    }

    saveModel(event, customData) {
        this._btnType = Number(customData)

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
        // this.upLoadData(' ')

    }
    creatMatch() {
        if (this._jslxNum == 1) {
            let arr = []
            for (let index = 1; index < this.ffrs.childrenCount; index++) {
                const element = this.ffrs.children[index];
                let _arr = []
                let cloneItem = element.getChildByName('cloneItem')
                let edit = cc.find('fuwu/fuwuBox', cloneItem).getComponent(cc.EditBox);
                let leftBox = cc.find('left/leftBox', cloneItem).getComponent(cc.EditBox);
                let rightBox = cc.find('right/rightBox', cloneItem).getComponent(cc.EditBox);
                if (Number(rightBox.string) <= Number(leftBox.string) || Number(edit.string) > 9999.99) {
                    UIComponent.Instance.Toast(i18nMgr.Get('UIRoom_FDIncorrect'))
                    return
                }
                _arr[0] = Number(leftBox.string)
                _arr[1] = Number(rightBox.string)
                arr.push(_arr)
            }
            let min = arr[0][0];
            let max = arr[0][1];
            for (let index = 1; index < arr.length; index++) {
                min = Math.min(min, arr[index][0])
                max = Math.max(max, arr[index][0])
            }
            if (min > 2 || max < this.zwrs['levelData'].level) {
                UIComponent.Instance.Toast(StringHelper.Format(i18nMgr.Get('UIRoom_FDIncorrectNo'), [this.zwrs['levelData'].level]))
                return;
            }

            let result = this.checkIfArrayIntervalOverLap(arr);
            switch (result) {
                case 0:
                    this._btnType = 1
                    this.upLoadData()
                    break;
                case 1:
                    UIComponent.Instance.Toast(i18nMgr.Get('UIRoom_FDIncorrectPeople'))
                    break;
                case 2:
                    UIComponent.Instance.Toast(i18nMgr.Get('UIRoom_FDIncorrect'))
                    break;
                case 3:
                    UIComponent.Instance.Toast(StringHelper.Format(i18nMgr.Get('UIRoom_FDIncorrectNo'), [this.zwrs['levelData'].level]))
                    break;
            }
        } else {
            this._btnType = 1
            this.upLoadData()
        }

    }

    /**
    * 多区间判断
    * @param area
    * @returns {number}   错误类型(0正常 1区间重合 2最小值大于最大值 3区间没有连续)
    */
    checkIfArrayIntervalOverLap(area) {
        let result = 0
        let areaLength = area.length
        if (areaLength > 0) {
            let maxStartArr = []
            let minEndArr = []
            let minStart1 = 0
            let minStart2 = 0
            let maxEnd1 = 0
            let maxEnd2 = 0
            let secondResult = false
            let seriesNumber = 0
            let newMaxEnd = 0
            for (let i = 0; i < areaLength; i++) {
                minStart1 = area[i][0]
                maxEnd1 = area[i][1]
                secondResult = false
                seriesNumber = 0
                // 判断最小值是否大于最大值
                if (minStart1 > maxEnd1 && maxEnd1 !== 0) {
                    result = 2
                    break;
                }
                for (let t = 0; t < areaLength; t++) {
                    minStart2 = area[t][0]
                    maxEnd2 = area[t][1]
                    if (i !== t) { // 不与自身比  
                        maxStartArr = [minStart1, minStart2];// 开始课时数组
                        minEndArr = [maxEnd1, maxEnd2];// 结束课时数组
                        newMaxEnd = Number(maxEnd1 + 1);
                        // 判断数字是否连续
                        if (newMaxEnd === minStart2) {
                            seriesNumber = seriesNumber + 1;
                        }
                        // 判断是否有重合区间
                        if (Math.max(...maxStartArr) <= Math.min(...minEndArr)) {
                            secondResult = true
                            result = 1
                            break;
                        }
                    }
                }
                // 判断是否有重合区间返回结果
                if (secondResult === true) {
                    break;
                }
                // 判断区间是否连续
                if (seriesNumber !== 1 && i !== areaLength - 1) {
                    result = 3
                    break;
                }

            }
        }
        return result
    }


    async upLoadData(modelName = ' ') {
        cc.log('modelName==', modelName);
        let room_config: any = {}
        room_config.game_play_type = ClubCache.CreateGameType;
        // nlh plo=2 6+  plo ---4,5,6
        if (ClubCache.CreateGameType == 2) {
            room_config.plo_game_type = this._yxbzNum
        }
        // 0-俱乐部  1 朋友桌
        if (ClubCache.joinCreateMatchType == 0) {
            room_config.origin_type = this._selectTitle == 0 ? 5 : 3
        } else {
            room_config.origin_type = 4
        }
        room_config.private_room = this._sryxState ? 1 : 0
        room_config.room_password = this.passNodeEd.string;
        room_config.blind_type = this._selectRoleType + 1;
        room_config.share_clubs = this.shareClubIdEd.string;
        room_config.bettype_aof_on = this._aofState ? 1 : 0
        room_config.ante = Number(this.qz.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) * 100 //前注筹码,必填
        room_config.sb = Number(this.dxm.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) * 100 //小盲注,必填
        room_config.min_rate = Number(this.drjfp.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) * 100 / (room_config.sb * 2);
        room_config.max_rate = Number(this.drjfp.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string) * 100 / (room_config.sb * 2);
        room_config.op_duration = this._sksjNum;
        //功能为实现
        room_config.share_table = this._selectTitle == 1 ? 2 : 1
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


        //封顶服务费人数



        // room_config.tribe_id = ClubCache.tribe_id;

        if (this.zssxz.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'] == 'UIClub_CreateRoom23') {
            room_config.limit_hc_total_hands = 0;
            room_config.hc_total_hands_lv = false;
        } else {
            room_config.hc_total_hands_lv = true;
            room_config.limit_hc_total_hands = Number(this.zssxz.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'])          //总手数限制 手数
        }

        if (this.zdrcl.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'] == 'UIClub_CreateRoom23') {
            room_config.limit_hc_pool_rate = 0;
            room_config.hc_pool_rate_lv = false;
        } else {
            room_config.hc_pool_rate_lv = true;
            room_config.limit_hc_pool_rate = Number(this.zdrcl.getChildByName('labelNode').getChildByName('lblNum')['_dataNum'])           //最低入池率 
        }
        room_config.retain_type = Number(this._dcjfpNum)
        room_config.settlement_type = this._jslxNum
        if (this._jslxNum == 0) {
            room_config.cap_type = 1
        } else {
            room_config.cap_type = 2
            let arr = []
            for (let index = 1; index < this.ffrs.childrenCount; index++) {
                const element = this.ffrs.children[index];
                let _arr = {}
                let cloneItem = element.getChildByName('cloneItem')
                let edit = cc.find('fuwu/fuwuBox', cloneItem).getComponent(cc.EditBox);
                let leftBox = cc.find('left/leftBox', cloneItem).getComponent(cc.EditBox);
                let rightBox = cc.find('right/rightBox', cloneItem).getComponent(cc.EditBox);
                _arr['min'] = Number(leftBox.string)
                _arr['max'] = Number(rightBox.string)
                _arr['cap'] = Number(edit.string)
                arr.push(_arr)
            }
            room_config.sec_cap_list = arr
        }
        room_config.fee_permillage = Number(this.fwfbl.getChildByName('labelNode').getChildByName('lblNum')['_dataNum']) //服务费比例(0-100)
        room_config.second_public_cards = this._etpState;
        room_config.limit_bet_type = ClubCache.CreateGameType == 2 ? 1 : 0
        room_config.anti_cheat_type = this.deal_delayNum;

        room_config.deal_delay = 1

        let params: any = { name: modelName, room_config: room_config }

        room_config.limit_bring_in = this._kzwjdrState ? 1 : 0


        if (this.fddm.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string == '不限') {
            room_config.max_per_hand = 0 //封顶大盲

        } else {
            room_config.max_per_hand = Number(this.fddm.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string) * 100 //封顶大盲
        }

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
        else {
            if (ClubCache.joinCreateMatchType == 0) {
                //公会牌桌
                room_config.limit_friend_table = false
                await UIClubModel.mInstance.APIOrgRoomClubCreate(params);
                // TimeHelper.Sleep(3000);
                this.post(EventName.matchModelChange)
            }
            else if (ClubCache.joinCreateMatchType == 1) {
                // //朋友桌
                room_config.limit_friend_table = true
                let data: any = await UIClubModel.mInstance.APIOrgRoomConfigCreate(params);
                this.top_block.active = true;
                // await TimeHelper.Sleep(1000);
                data = await UIClubModel.mInstance.APIOrgFriendRoomInfo(data.data.room_id);
                this.post(EventName.updateFriendChessView)
                this.top_block.active = false;
                let _data = new LobbyRoomListItem(data.data.data);
                //GameUtil.EnterRoomAPI(_data, [UIDefine.UIClubCreateMatch, UIDefine.UIClubCreateMatchHome]);
                GameUtil.EnterRoomAPI(_data, { game_enter_type: GameEnterType.Friend });
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
