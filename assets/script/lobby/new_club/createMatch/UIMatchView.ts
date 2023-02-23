/*
 * @Author: xfj
 * @Date: 2022-12-25 15:08:19
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-23 15:53:40
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/createMatch/UIMatchView.ts
 */

import List from "../../../common/List";
import TabNode from "../../../common/tabNode";
import { ClubTabConfig } from "../../../frame/config/tabConfig";
import { dxmConfig } from "../../../frame/data/rate/RateConfig";
import GC from "../../../frame/GameControl";
import { GameType, Game_Type, Table_Type } from "../../../game/util/GameUtil";
import { APIOrgClubRoom } from "../../../net/https/WebRequest";
import UIBase from "../../../ui/UIBase";
import { UIClubModel } from "../../labor/UIClubModel";
import UIClubMatchItem from "./UIClubMatchItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIMatchView')

export default class UIMatchView extends UIBase {
    private _isClub: boolean = false;
    gameTypeNode: cc.Node = null;
    sbNode: cc.Node = null;
    sbTab: cc.Node = null;
    lbl_no: cc.Node = null;
    list: List = null;
    tabNode
    _gameType = null;
    _sbSelectType = null;
    _sbType = null;
    _sbData: Array<number> = null;

    _tableType = Table_Type.club
    _offset = 0;
    _total = 0
    _reqing = false
    _reqEnd = false
    _list = []
    protected lateLoad(): void {
        super.lateLoad()
        this.gameTypeNode = this.getChildNodeOrComponent('gameTypeNode')
        this.sbNode = this.getChildNodeOrComponent('sbNode')
        this.lbl_no = this.getChildNodeOrComponent('noDataTip')
        this.list = this.getChildNodeOrComponent('list', List)
        this.tabNode = this.getChildNodeOrComponent('tabNode', TabNode)
        this.sbTab = this.getChildNodeOrComponent('sbTab');
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.tabNode.initData(ClubTabConfig, this.titleNodeClick.bind(this), this)
        this.clickGameType(0);
        this.gameTypeNode.children.forEach((item, index) => {
            this.bindClick(item, this.clickGameType, index);
        })
    }

    /**
     * 微 小 中  大
     * @param index 
     */
    titleNodeClick(index) {
        this._sbSelectType = index
        this._sbData = dxmConfig[index].concat();
        this._sbData.unshift(0);
        this.initSbNode()
    }
    /**
     * @method 点击游戏类型
     * @param index 
     * @returns 
     */
    clickGameType(_index) {
        // if (this._gameType == index) return;
        this._gameType = _index
        this.gameTypeNode.children.forEach((item, index) => {
            item.getChildByName("title").color = this._gameType == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName("Rectangle").active = this._gameType == index
        })
        this.titleNodeClick(0);
    }
    /**
    * @method 点击sb
    * @param index 
    * @returns 
    */
    clickSb(index) {
        this._sbType = index
        this.sbNode.children.forEach((item, index) => {
            item.getChildByName("lbl").color = this._sbType == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
        })
        this.reqDataAgain();
    }

    initSbNode() {
        let sbNodes = this.sbNode.children;
        let sbs = this._sbData    //GC.data.lobby.roomBlinds.getSbs(this._isClub);
        sbs.forEach((sb, index) => {
            let sbNode = null;
            if (index < sbNodes.length) {
                sbNode = sbNodes[index];
            } else {
                sbNode = cc.instantiate(this.sbTab);
                sbNode.parent = this.sbNode;
            }
            sbNode.active = true;
            this.bindClick(sbNode, this.clickSb, index, true);
            let lblNode = sbNode.getChildByName("lbl");
            let sbLab = lblNode.getComponent(cc.Label);

            let str = "UIMatch_GtO8YEdb";
            if (sb != 0) {
                let a = sb   // sb / 100;
                str = `${a}/${a * 2}`;
            }

            this.setText(sbLab, str);
        })

        if (sbNodes.length > sbs.length) {
            for (let index = sbs.length; index < sbNodes.length; index++) {
                sbNodes[index].active = false;
            }
        }


        this.clickSb(0);
    }


    async reqDataAgain() {
        // let ob = this._roomList[this._tableType];
        this._offset = 0;
        this._total = 0;
        this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this.dealData()
    }
    async dealData() {
        // let ob = this._roomList[this._tableType];
        this._reqing = true


        let _data: any = null;
        let tempD = this.getGameType()
        let sb_min = this._sbData[this._sbType] * 100
        let sb_max = this._sbData[this._sbType] * 100

        if (this._sbType == 0) {
            sb_min = this._sbData[1] * 100
            sb_max = this._sbData[this._sbData.length - 1] * 100
        }

        if (this._tableType == Table_Type.club) {
            let parms = {
                name: "",
                ante_min: 0,
                ante_max: 0,
                sb_min: sb_min,
                sb_max: sb_max,
                tribe_id: 0,
                start_time_s: 0,
                start_time_e: 0,
                enter_time_s: 0,
                enter_time_e: 0,
                game_type: tempD.game_type,
                poker_type: tempD.poker_type,
                limit_bet_type: [],
                limit: 10,
                offset: this._offset,
                order: ["sb_asc"],

            }

            await UIClubModel.mInstance.APIOrgClubRoom(parms)
            _data = APIOrgClubRoom.Response.data;
        }
        else if (this._tableType == Table_Type.holl) {
            let params = {

            }
            await UIClubModel.mInstance.APIOrgMemberList(params);
            _data = []
        }
        this._reqing = false
        if (!_data.records) {
            _data.records = [];
        }
        this.lbl_no.active = _data.records.length == 0
        _data.records.forEach(element => {
            this._list.push(element);
        });  //分页的时候使用的
        this._total = _data.total
        this.list.numItems = this._list.length;
        this._offset = this._list.length;
        this._reqEnd = this._list.length == this._total;

    }
    getGameType() {
        // Holdem = 0,//德州
        // Omaha4 = 1,//奥马哈四张
        // Omaha5 = 2,//奥马哈五张
        // Omaha6 = 3,//奥马哈六张
        // Plus6 = 4, //6+
        // All = 5, //全部
        let data = { game_type: [], poker_type: [] }
        switch (this._gameType) {
            case Game_Type.All:
                data.game_type = []
                data.poker_type = [0, 2]
                break;
            case Game_Type.Holdem:
                data.game_type = [0]
                data.poker_type = [0]
                break;
            case Game_Type.Plo:
                data.game_type = [1, 2, 3]
                data.poker_type = [0]
                break;
            case Game_Type.Plus6:
                data.game_type = []
                data.poker_type = [2]
                break;

            default:
                break;
        }
        return data;
    }


    onRender(node: cc.Node, index: number) {
        // let ob = this._roomList[this._tableType];
        let item = node.getComponent(UIClubMatchItem);
        item.initData(this._list[index]);
    }



    scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData()
            }
        }
    }


}
