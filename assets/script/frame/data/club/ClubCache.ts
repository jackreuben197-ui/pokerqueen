/*
 * @Author: xfj
 * @Date: 2022-12-21 12:38:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 17:16:42
 * @FilePath: /pokerqueen/assets/script/frame/data/club/ClubCache.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EventName } from "../../../config/EventName";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import GC from "../../GameControl";

const { ccclass, property } = cc._decorator;

@ccclass
export class ClubCache {
    static _msg = null;
    static _allCubData = null;

    static setClubData(data) {
        this._msg = data
    }
    static get club_table() {
        return this._msg?.tables;
    }

    static get club_id() {
        return this._msg?.club_id;
    }
    static get club_name() {
        return this._msg?.club_name;
    }
    static get logo() {
        return this._msg?.logo;
    }
    static get random_id() {
        return this._msg?.random_id;
    }
    static get upper_limit() {
        return this._msg?.upper_limit;
    }
    static get club_members() {
        return this._msg?.club_members;
    }
    static get area_id() {
        return this._msg?.area_id;
    }
    static get club_type() {
        return this._msg?.club_type;
    }
    static get create_time() {
        return this._msg?.create_time;
    }
    static get is_official() {
        return this._msg?.is_official;
    }
    static get club_status() {
        return this._msg?.club_status;
    }
    static get desc() {
        return this._msg?.desc;
    }
    static get contact_info() {
        return this._msg?.contact_info;
    }
    static get member_type() {
        return this._msg?.member_type;
    }
    static get more_contact() {
        return this._msg?.more_contact;
    }
    static get level() {
        return this._msg?.level;
    }
    static get search_switch() {
        return this._msg?.search_switch;
    }
    static get auto_audit_switch() {
        return this._msg?.auto_audit_switch;
    }
    static get show_contact_switch() {
        return this._msg?.show_contact_switch;
    }
    static get club_creator_random_id() {
        return this._msg?.club_creator_random_id;
    }
    static get club_creator_avatar() {
        return this._msg?.club_creator_avatar;
    }
    static get club_creator_nickname() {
        return this._msg?.club_creator_nickname;
    }
    static get tribe_name() {
        return this._msg?.tribe_name;
    }
    static get user_level() {
        return this._msg?.user_level;
    }
    static get players() {
        return this._msg?.players;
    }
    static refreshData(data: Object) {
        Object.keys(data).map((key) => {
            this._msg[key] = data[key];
        })
        GC.notify.post(EventName.refreshClubData)
    }
    static setRoleType(hg, type) {
        //0 普通 1会长 3管理员 4代理
        switch (type) {
            case 0:
                hg.active = false;
                break;
            case 1:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg03', AssetFold.texture_new_club)

                break;
            case 2:
                break;
            case 3:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg02', AssetFold.texture_new_club)
                break;
            case 4:
                hg.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset('hg01', AssetFold.texture_new_club)
                break;
            default:
                break;
        }
    }
}
(window as any).GameCache = ClubCache;
