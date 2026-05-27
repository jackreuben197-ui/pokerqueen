import GameUtil from "../../../../game/util/GameUtil";
import GameplayUtil from "../../common/util/GameplayUtil";

export class UserStore extends cc.EventTarget {
    // 不变的信息
    // 基础信息
    public userID: number;
    public userRID: number;
    
    public static readonly DIAMONDS_CHANGE = 'DIAMONDS_CHANGE';
    private _diamonds: number;
    public get diamonds() {return this._diamonds};
    public set diamonds(r: number) {
        if (this._diamonds == r) return;
        this._diamonds = r;
        this.emit('DIAMONDS_CHANGE', this._diamonds)
    }
    
    public static readonly NICKNAME_CHANGE = 'NICKNAME_CHANGE';
    private _name: string;

    public get name() {
        return this._name;
    }

    public set name(c: string) {
        if (this._name == c) return;
        this._name = c;
        this.emit(UserStore.NICKNAME_CHANGE, this._name);
    }

    public static readonly AVATAR_CHANGE = 'AVATAR_CHANGE';
    private _avatar: string;

    public get avatar() {
        return this._avatar;
    }

    public set avatar(c: string) {
        if (this._avatar == c) return;
        this._avatar = c;
        this.emit(UserStore.AVATAR_CHANGE, this._avatar);
    }

    public static readonly ClUB_DATA_CHANGE = 'ClUB_DATA_CHANGE';
    private _clubsData: ClubData[];
    public get clubsData() {return this._clubsData};
    public set clubsData(cds: ClubData[]) {
        if (GameplayUtil.isArraySame(this._clubsData, cds, false)) return;
        this._clubsData = cds;
        this.emit(UserStore.ClUB_DATA_CHANGE, this._clubsData);
    }

    public static readonly ClUB_WALLET_CHANGE = 'ClUB_WALLET_CHANGE';
    private _wallets: wallet[];
    public get wallets() {return this._wallets};
    public set wallets(cds: wallet[]) {
        if (GameplayUtil.isArraySame(this._wallets, cds, false)) return;
        this._wallets = cds;
        this.emit(UserStore.ClUB_DATA_CHANGE, this._wallets);
    }
}

export class ClubData {
    public id: number;
    public name: string;
    public icon: string;
    public tribeID: number;
}

export class wallet {
    /** 钱包状态 */
    status: number;
    /** 钱包联盟状态 */
    tribeSstatus: number;
    /** 钱包类型：1 联盟币 (gold)，2 USDT */
    goldType: number;
    /** 币种三字码 */
    goldCurrency: string;
    /** 钱包 ID */
    id: number;
    /** 钱包金额 */
    gold: number;
    /** 被锁定金额 */
    goldLock: number;
}

const userStore = new UserStore();
export default userStore;