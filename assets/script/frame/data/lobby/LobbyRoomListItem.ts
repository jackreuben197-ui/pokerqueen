/*
 * @Author: xfj
 * @Date: 2022-10-24 16:03:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-26 11:25:53
 * @FilePath: /pokerqueen/assets/script/frame/data/lobby/LobbyRoomListItem.ts
 */
import { TRoomListItem } from "../../../config/TTypeConfig";
import { RoomType } from "../../../game/util/GameUtil";
import GC from "../../GameControl";

export default class LobbyRoomListItem {
    private _data: TRoomListItem = null;
    constructor(data) {
        this._data = data;
    }
    set rid(rid) {
        this._data.rid = rid
    }
    get rid() {
        return this._data.rid;
    }
    get name() {
        // return this._data.name;
        return GC.data.languageTemp.temp.getName(this._data.name);
    }
    get room_type() {
        return this._data.room_type;
    }
    get room_type_is_legal() {
        return RoomType[this.room_type];
    }

    get game_type() {
        return this._data.game_type;
    }
    get poker_type() {
        return this._data.poker_type;
    }
    get limit_bet_type() {
        return this._data.limit_bet_type;
    }
    get status() {
        return this._data.status;
    }
    get ante() {
        return this._data.ante;
    }
    get sb() {
        return this._data.sb;
    }
    get straddle_on() {
        return this._data.straddle_on;
    }
    get insurance_on() {
        return this._data.insurance_on;
    }
    get muck_on() {
        return this._data.muck_on;
    }
    get seat_count() {
        return this._data.seat_count;
    }
    get empty_seat() {
        return this._data.empty_seat;
    }
    get play_duration() {
        return this._data.play_duration;
    }
    get service_id() {
        return this._data.service_id;
    }
    get voiceprint_verify_on() {
        return this._data.voiceprint_verify_on;
    }
    get voiceprint_verify_duration() {
        return this._data.voiceprint_verify_duration;
    }
    get participation_status() {
        return this._data.participation_status;
    }
    get tablecloth_tag() {
        return this._data.tablecloth_tag;
    }

    get start_time() {
        return this._data.start_time;
    }
    get limit_bring_in() {
        return this._data.limit_bring_in;
    }
    get origin_type() {
        return this._data.origin_type;
    }
    get invitation_code() {
        return this._data.invitation_code;
    }
    get gold_type() {
        return this._data.gold_type;
    }
    get share_table(){
        return this._data.share_table;
    }

}