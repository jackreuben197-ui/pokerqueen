/*
 * @Author: xfj
 * @Date: 2022-12-25 15:08:19
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-25 16:52:48
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIMatchView.ts
 */

import List from "../../common/List";
import { dxmConfig } from "../../frame/data/rate/RateConfig";
import GC from "../../frame/GameControl";
import { GameType } from "../../game/util/GameUtil";
import UIBase from "../../ui/UIBase";
import UIClubMatchItem from "./UIClubMatchItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/new_club/UIMatchView')

export default class UIMatchView extends UIBase {
    private _isClub: boolean = false;
    gameTypeNode: cc.Node = null;
    sbSelect: cc.Node = null;
    sbNode: cc.Node = null;
    sbTab: cc.Node = null;
    list: List = null;
    _gameType = null;
    _sbSelectType = null;
    _sbType = null;
    _sbData: Array<number> = null;;;
    async onShow(type?: GameType, isClub: boolean = false) {
        super.onShow(type, isClub);
        this._isClub = isClub;
        this._roomList = GC.data.lobby.roomList;
        // this._curGameType = null;
        this.clickGameType(type);
        this.clickSbSelect(0);
    }

    protected lateLoad(): void {
        super.lateLoad();

        this.list = this.getChildNodeOrComponent("list", List);
        this.gameTypeNode = this.getChildNodeOrComponent("gameTypeNode");
        this.sbSelect = this.getChildNodeOrComponent("sbSelect");
        this.sbNode = this.getChildNodeOrComponent("sbNode");
        this.sbTab = this.sbNode.children[0];
        this.list.scrollingCB = this.scrollingCB;

        this.gameTypeNode.children.forEach((item, index) => {
            this.bindClick(item, this.clickGameType, index);
        })

        this.sbSelect.children.forEach((item, index) => {
            this.bindClick(item, this.clickSbSelect, index);
        })

        // this.sbNode.children.forEach((item, index) => {
        //     this.bindClick(item, this.clickSb, index);
        // })

    }
    /**
     * @method 点击游戏类型
     * @param index 
     * @returns 
     */
    clickGameType(index) {
        if (this._gameType == index) return;
        this._gameType = index
        this.gameTypeNode.children.forEach((item, index) => {
            item.getChildByName("title").color = this._gameType == index ? cc.color().fromHEX('#35A3B3') : cc.color().fromHEX('#FFFFFF')
        })
        // if (!isInit) {
        //     this.reqDataAgain()
        // }
    }
    /**
     * @method 点击微小中大
     * @param index 
     * @returns 
     */
    clickSbSelect(index) {
        if (this._sbSelectType == index) return;
        this._sbSelectType = index
        this.sbSelect.children.forEach((item, index) => {
            item.getChildByName("title").opacity = this._sbSelectType == index ? 255 : 75
        })
        this._sbData = dxmConfig[index].concat();
        this._sbData.unshift(0);
        this.initSbNode()

    }
    /**
    * @method 点击sb
    * @param index 
    * @returns 
    */
    clickSb(index) {
        this._sbType = index
        this.sbNode.children.forEach((item, index) => {
            item.getChildByName("lbl").opacity = this._sbType == index ? 255 : 75
        })

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

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIClubMatchItem);
        item.initData(this._roomList.getList(this._isClub)[index]);
    }

    scrollingCB = (scrollView: cc.ScrollView) => {
        // if (scrollView) {
        //     let cur = scrollView.getScrollOffset();
        //     let max = scrollView.getMaxScrollOffset()
        //     let isDown = cur.y >= max.y;
        //     if (isDown && this._roomList.canReq) {
        //         this._roomList.dropDownReq(true, this._isClub);
        //     }
        // }
    }


}
