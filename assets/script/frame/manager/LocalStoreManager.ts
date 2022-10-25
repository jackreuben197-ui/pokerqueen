import CCTools from "../../tools/CCTools";
import GC from "../GameControl";

export default class LocalStoreManager {
    private static _instance: LocalStoreManager = null;
    static get instance() {
        if (!LocalStoreManager._instance) {
            LocalStoreManager._instance = new LocalStoreManager();
        }
        return LocalStoreManager._instance;
    }

    private _keyPre = 'dzpk_'
    get keyPre() {
        // let userId = GC?.data?.user?.info?.user_id || "";
        let userId = "";
        return `${this._keyPre}${userId}`;
    }
    set keyPre(value: string) {
        value && (this._keyPre = value);
    }

    setItem(key: string, value: any) {
        if (CCTools.isNull(value)) {
            value = null;
        }
        cc.sys.localStorage.setItem(this.keyPre + key, this.encryptData(value));
    }

    getItem(key: string, df: any = null) {
        let value = cc.sys.localStorage.getItem(this.keyPre + key);
        if (Boolean(value)) {
            df = this.decodeData(value);
        }
        return df;
    }

    removeItem(key: string) {
        cc.sys.localStorage.removeItem(this.keyPre + key);
    }

    clear() {
        cc.sys.localStorage.clear();
    }

    //加密压缩
    private encryptData(value) {
        let str = JSON.stringify(value);
        return str;

    }

    //解密 解压缩
    private decodeData(value) {
        value = JSON.parse(value);
        return value;
    }
}