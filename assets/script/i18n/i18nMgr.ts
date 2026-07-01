import { EventName } from '../config/EventName';
import GC from '../frame/GameControl';
import StorageKey from '../session/StorageKey';
import i18n from '@silenthill/h5-cc-i18n';
import * as i18nLabel from './i18nLabel';
import * as i18nSprite from './i18nSprite';

/**
 * 多语言管理器（Cocos 侧）。
 *
 * 翻译数据由 h5-cc-i18n 提供：H5 层 index.html 以 <script> 加载 h5-cc-i18n.min.js，
 * 挂到 window.__H5_CC_I18N__；本模块 import 的是 proxy，运行时从该全局单例取数据。
 * 语言代码对外沿用历史 cn/zh/en/pt（与 H5 层、服务端协议、本地存储保持一致），
 * 内部映射到包的 LANG_ZH_CN / LANG_ZH_TW / LANG_EN / LANG_PT。
 */
const LEGACY_TO_PACKAGE: Record<string, string> = {
    cn: i18n.LANG_ZH_CN,
    zh: i18n.LANG_ZH_TW,
    en: i18n.LANG_EN,
    pt: i18n.LANG_PT
};

export class i18nMgr {
    public static language = 'cn'; // 当前语言（cn/zh/en/pt）
    private static labelArr: i18nLabel.i18nLabel[] = []; // i18nLabel 列表
    private static spriteArr: i18nSprite.i18nSprite[] = []; // i18nSprite 列表

    /** 是否简体中文（历史调用方按属性使用：i18nMgr.isCN，勿改成方法） */
    public static get isCN(): boolean {
        return this.language === 'cn';
    }

    public static initLanguage() {
        // 强制简体中文，忽略本地缓存（与历史行为一致）
        this.setLanguage('cn');
    }

    /**
     * 设置语言（cn/zh/en/pt）
     */
    public static setLanguage(language: string) {
        if (this.language === language) {
            return;
        }
        this.language = language;
        GC.localStore.setItem(StorageKey.LANGUAGE, this.language);
        const pkg = LEGACY_TO_PACKAGE[language];
        if (pkg) {
            try {
                i18n.setLocale(pkg);
            } catch (e) {
                console.warn('[i18nMgr] setLocale failed:', e);
            }
        }
        this.refreshAllLabel();
        this.reloadSprite();
    }

    /**
     * 添加或移除 i18nLabel
     */
    public static _addOrDelLabel(label: i18nLabel.i18nLabel, isAdd: boolean) {
        if (isAdd) {
            this.labelArr.push(label);
        } else {
            let index = this.labelArr.indexOf(label);
            if (index !== -1) {
                this.labelArr.splice(index, 1);
            }
        }
    }

    public static _getLabel(opt: string): string {
        return this.Get(opt);
    }

    /**
     * 取翻译文本，委托 h5-cc-i18n；缺失时回退到 key 本身。
     */
    public static Get(opt: string): string {
        return i18n.get(opt, opt) || opt;
    }

    /**
     * 添加或移除 i18nSprite
     */
    public static _addOrDelSprite(sprite: i18nSprite.i18nSprite, isAdd: boolean) {
        if (isAdd) {
            this.spriteArr.push(sprite);
        } else {
            let index = this.spriteArr.indexOf(sprite);
            if (index !== -1) {
                this.spriteArr.splice(index, 1);
            }
        }
    }

    public static _getSprite(path: string, cb: (spriteFrame: cc.SpriteFrame) => void) {
        cc.resources.load('main/i18n/sprite/' + this.language + '/' + path, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                return cb(null);
            }
            cb(spriteFrame);
        });
    }

    /**
     * @description: 刷新所有 i18nLabel，并广播语言切换事件
     */
    private static refreshAllLabel() {
        for (let one of this.labelArr) {
            one._resetValue();
        }
        GC.notify.post(EventName.switchLanguages);
    }

    /**
     * 初始化后刷新一次所有 i18nLabel（i18n 数据已由 h5-cc-i18n 提供，无需加载）。
     */
    public static refresh() {
        this.refreshAllLabel();
    }

    private static reloadSprite() {
        for (let one of this.spriteArr) {
            one._resetValue();
        }
    }
}

//@ts-ignore
window.i18nMgr = i18nMgr;
