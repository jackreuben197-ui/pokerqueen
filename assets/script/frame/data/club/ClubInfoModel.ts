import { EventName } from '../../../config/EventName';
import { TClubInfo } from '../../../config/TTypeConfig';
import GC from '../../GameControl';
import { ClubCache } from './ClubCache';

export default class ClubInfoModel {
    private _msg: TClubInfo = null;
    private _gold: number = 0;
    private _gold_lock: number = 0;

    updateData(msg: TClubInfo) {
        ClubCache.setClubData(msg);
    }

    get club_id() {
        return ClubCache?.club_id;
    }

    get club_name() {
        return ClubCache?.club_name;
    }

    get logo() {
        return ClubCache?.logo;
    }

    get random_id() {
        return ClubCache?.random_id;
    }

    get upper_limit() {
        return ClubCache?.upper_limit;
    }

    get club_members() {
        return ClubCache?.club_members;
    }

    get area_id() {
        return ClubCache?.area_id;
    }

    get club_type() {
        return ClubCache?.club_type;
    }

    get create_time() {
        return ClubCache?.create_time;
    }

    get is_official() {
        return ClubCache?.is_official;
    }

    get club_status() {
        return ClubCache?.club_status;
    }

    get desc() {
        return ClubCache?.desc;
    }

    get contact_info() {
        return ClubCache?.contact_info;
    }

    get member_type() {
        return ClubCache?.member_type;
    }

    get more_contact() {
        return ClubCache?.more_contact;
    }

    get level() {
        return ClubCache?.level;
    }

    get search_switch() {
        return ClubCache?.search_switch;
    }

    get auto_audit_switch() {
        return ClubCache?.auto_audit_switch;
    }

    get show_contact_switch() {
        return ClubCache?.show_contact_switch;
    }

    get club_creator_random_id() {
        return ClubCache?.club_creator_random_id;
    }

    get club_creator_avatar() {
        return ClubCache?.club_creator_avatar;
    }

    get club_creator_nickname() {
        return ClubCache?.club_creator_nickname;
    }

    get tribe_name() {
        return ClubCache?.tribe_name;
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
