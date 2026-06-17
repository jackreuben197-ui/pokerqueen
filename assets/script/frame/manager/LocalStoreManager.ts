import CCTools from '../../tools/CCTools';
import { BridgeStorage } from '../BridgeStorage';

/**
 * Cocos 端的 localStorage 入口。
 *
 * 历史实现是直接走 cc.sys.localStorage 并自带 'dzpk_' 前缀；现在已经收编到 bridge：
 *   - 读：从 BridgeStorage 的内存镜像里同步取，握手完成后 H5 会推 ccStorageSnapshot
 *     回灌 dzpk_cc_* 命名空间下的全部键值，确保镜像与 H5 端 localStorage 一致。
 *   - 写：BridgeStorage.localStorageSet 先更新镜像，再 fire-and-forget 发到 H5 落盘。
 *
 * keyPre 默认空串：H5 端已统一加 'dzpk_cc_' 前缀做 cocos 命名空间隔离，
 * 本层不再叠 'dzpk_'，避免最终 key 长成 dzpk_cc_dzpk_xxx。需要再细分命名空间
 * （如按 player 拆 key）时，调用方可以通过 keyPre setter 自行设置。
 */
export default class LocalStoreManager {
    private static _instance: LocalStoreManager = null;

    static get instance() {
        if (!LocalStoreManager._instance) {
            LocalStoreManager._instance = new LocalStoreManager();
        }
        return LocalStoreManager._instance;
    }

    private _keyPre = '';

    get keyPre() {
        return this._keyPre;
    }

    set keyPre(value: string) {
        value && (this._keyPre = value);
    }

    setItem(key: string, value: any) {
        if (CCTools.isNull(value)) {
            value = null;
        }
        BridgeStorage.localStorageSet(this.keyPre + key, this.encryptData(value));
    }

    getItem(key: string, df: any = null) {
        let value = BridgeStorage.localStorageGet(this.keyPre + key);
        if (Boolean(value)) {
            df = this.decodeData(value);
        }
        return df;
    }

    removeItem(key: string) {
        BridgeStorage.localStorageRemove(this.keyPre + key);
    }

    clear() {
        BridgeStorage.localStorageClear();
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
