/*
 * @Author: xfj
 * @Date: 2022-12-21 12:38:03
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-22 15:38:28
 * @FilePath: /pokerqueen/assets/script/frame/data/club/ClubUserDataCache.ts
 */

import { EventName } from "../../../config/EventName";
import GC from "../../GameControl";

const { ccclass, property } = cc._decorator;

@ccclass
export class ClubUserDataCache {
    static _msg = null;
    static _allCubData = null;

    static setUserData(data) {
        this._msg = data
    }
    static get gold() {
        return this._msg?.user_info?.gold
    }
    static get usdt() {
        return this._msg?.user_info?.usdt
    }

    static refreshData(data: Object) {
        Object.keys(data).map((key) => {
            this._msg[key] = data[key];
        })
        // GC.notify.post(EventName.refreshClubData)
    }
}
(window as any).GameCache = ClubUserDataCache;
