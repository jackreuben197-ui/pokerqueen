import { EventName } from "../../../config/EventName";
import { TClubInfo } from "../../../config/TTypeConfig";
import GC from "../../GameControl";

export default class ClubInfoModel {
    private _msg: TClubInfo = null;
    private _gold: number = 0;
    private _gold_lock: number = 0;

    updateData(msg: TClubInfo) {
        this._msg = msg;
    }

    get club_id() {
        return this._msg.club_id;
    }
    get club_name() {
        return this._msg.club_name;
    }
    get logo() {
        return this._msg.logo;
    }
    get random_id() {
        return this._msg.random_id;
    }
    get upper_limit() {
        return this._msg.upper_limit;
    }
    get club_members() {
        return this._msg.club_members;
    }
    get area_id() {
        return this._msg.area_id;
    }
    get club_type() {
        return this._msg.club_type;
    }
    get create_time() {
        return this._msg.create_time;
    }
    get is_official() {
        return this._msg.is_official;
    }
    get club_status() {
        return this._msg.club_status;
    }
    get desc() {
        return this._msg.desc;
    }
    get contact_info() {
        return this._msg.contact_info;
    }
    get member_type() {
        return this._msg.member_type;
    }
    get more_contact() {
        return this._msg.more_contact;
    }
    get level() {
        return this._msg.level;
    }
    get search_switch() {
        return this._msg.search_switch;
    }
    get auto_audit_switch() {
        return this._msg.auto_audit_switch;
    }
    get show_contact_switch() {
        return this._msg.show_contact_switch;
    }
    get club_creator_random_id() {
        return this._msg.club_creator_random_id;
    }
    get club_creator_avatar() {
        return this._msg.club_creator_avatar;
    }
    get club_creator_nickname() {
        return this._msg.club_creator_nickname;
    }
    get tribe_name() {
        return this._msg.tribe_name;
    }

    // {"org_id":20,"gold":200,"gold_lock":100,"forbidden":false}
    updateGold(data: any) {
        this.gold = data.gold;
        this.gold_lock = data.gold_lock;
    }

    get gold_lock() {
        return this._gold_lock;
    }
    set gold_lock(g) {
        this._gold_lock = g;
    }

    //后端返回的金币，是*100后的值
    get displayGold() {
        return Math.floor(this.gold) / 100;
    }
    get gold() {
        return this._gold;
    }
    set gold(g) {
        this._gold = g;
        GC.notify.post(EventName.clubGoldChange);
    }

    //{"flow_id":1835678,"wallet":{"gold":100,"gold_lock":200,"forbidden":false}}
    goldTiquApplySuc(msg: any) {
        this.gold = msg.wallet.gold;
        this.gold_lock = msg.wallet.gold_lock;
    }

    // {"info":{"club_id":20,"random_id":976776,"club_name":"xyh","creator":6650,"club_type":1,"Forbidden":false,"gold":100,"gold_lock":100,"wallet_forbidden":false,"tribe_id":0}}
    goldIssueSuc(msg: any) {
        this.gold = msg.info.gold;
        this.gold_lock = msg.info.gold_lock;
    }
}