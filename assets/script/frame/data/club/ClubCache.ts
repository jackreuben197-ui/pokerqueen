/*
 * @Author: xfj
 * @Date: 2022-12-21 12:38:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-21 18:35:17
 * @FilePath: /pokerqueen/assets/script/frame/data/club/ClubCache.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class ClubCache {
    static _msg = null;
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
    get level() {
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
}
(window as any).GameCache = ClubCache;
