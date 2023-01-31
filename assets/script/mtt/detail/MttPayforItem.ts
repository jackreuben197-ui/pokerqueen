/*
 * @Author: xfj
 * @Date: 2023-01-16 10:38:30
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-31 15:32:44
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforItem.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ClubCache } from "../../frame/data/club/ClubCache";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import MttPayforHome from "./MttPayforHome";
import MttPayforList from "./MttPayforList";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttPayforItem')
export default class MttPayforItem extends UIBase {
    @property(cc.Label)
    nick_name: cc.Label = null;
    @property(cc.Label)
    id: cc.Label = null;
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Node)
    uc: cc.Node = null;
    @property(cc.Node)
    usdt: cc.Node = null;

    @property(cc.Label)
    num: cc.Label = null;

    @property(cc.Node)
    agree: cc.Node = null;

    _data: any = null;
    _target: MttPayforList = null;
    // {"user_id":6702,"club_id":28,"tribe_id":1,"gold":0,"gold_type":1,"club_name":"xfj-------","club_random_id":906776}
    initData(data, target) {
        this._data = data;
        this._target = target
        this.initUI()
    }
    protected lateLoad(): void {
        super.lateLoad();
    }
    initUI() {
        // 币种类型 0 未知 1 联盟币 2 USDT
        this.usdt.active = this._data.gold_type == 2
        this.uc.active = this._data.gold_type == 1
        this.setText(this.num, this._data.gold)
        this.setText(this.nick_name, this._data.club_name);
        this.setText(this.id, this._data.club_random_id);
        if (ClubCache.mttPayWallat && ClubCache.mttPayWallat.club_random_id == this._data.club_random_id) {
            this.agree.active = true
        } else {
            this.agree.active = false;
        }

    }
    onShow(...param: any): void {

    }
    clickCb() {
        ClubCache.mttPayWallat = this._data
        this._target.itemClick()
    }
}
