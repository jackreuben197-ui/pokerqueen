/**
 * PublicCacheReader —— CC 端只读访问 H5 创建的 `public_cache` IndexedDB。
 *
 * 背景：
 *  - H5 层（../h5-game/src/utils/indexedDB.ts）创建了 `public_cache` 库（version 3），
 *    包含 multi_language_template / app_config / diamond_config / banner_lobby 4 个 store。
 *  - BridgeStorage 走 H5MsgMgr → H5 白名单只接受 user_cache_${userId} 库的 3 个 store，
 *    `public_cache` 完全不在白名单，无法通过 bridge 访问。
 *  - CC 在 web 平台运行，跟 H5 同源同进程，共用浏览器 IndexedDB；
 *    直接用 window.indexedDB.open('public_cache') 即可读取 H5 写入的数据。
 *
 * 风格对齐项目里的 CCTools / MyLog：纯 static 方法类，无状态、无实例。
 *
 * 设计原则：
 *  - **只读**：CC 永远不创建/修改 public_cache 的 schema 或数据，所有 onupgradeneeded
 *    交给 H5 处理。CC 调 open 时如果库不存在，会触发 onupgradeneeded 但本类不做任何事，
 *    等 H5 真正初始化好再读。
 *  - **健壮降级**：库不存在 / store 不存在 / 数据格式不符 / 解析异常，全部返回 null/空，
 *    让调用方按"读不到就不显示"策略处理。
 *  - **不在非 web 平台工作**：cc.sys.isBrowser 为 false 时直接返回 null。
 */
const PUBLIC_CACHE_DB_NAME = 'public_cache';
const PUBLIC_CACHE_DB_VERSION = 3;
const PUBLIC_STORE_APP_CONFIG = 'app_config';

/** app_config store 里快捷语配置的 key（H5 写入时用字段名作为 key） */
const APP_CONFIG_KEY_QUICK_MESSAGE = 'game_quick_message_config';

/**
 * 多语言模板记录结构（对齐 h5-game/src/api/models/config.ts MultiLanguageTemplateRecord）。
 * 实际数据可能还有其它语言字段（如 br_name / ar_name），用 [key: string] 兜底。
 *
 * ⚠️ 实测服务端返回数据是嵌套结构：多语言字段包在 multi_language 子对象里：
 *   { template_id, multi_language: { cn_name, us_name, br_name, template_type, ... } }
 * 同时兼容扁平结构：{ cn_name, us_name, ... }（pickLocalizedText 自动识别）。
 */
export interface MultiLanguageTemplateRecord {
    template_id?: string;
    cn_name?: string;   // 中文（扁平结构用）
    us_name?: string;   // 英文（必填，作为 fallback）
    br_name?: string;   // 巴西葡语
    ar_name?: string;   // 阿语
    /** 嵌套结构：实际数据可能把多语言字段包在 multi_language 子对象里 */
    multi_language?: MultiLanguageTemplateRecord;
    /** 模板类型（实测数据里出现 template_type=16 = MTT 标题，可能还有其它类型） */
    template_type?: number;
    [key: string]: unknown;
}

/** 支持的语言代码 → MultiLanguageTemplateRecord 字段名映射 */
const LANG_FIELD_MAP: Record<string, keyof MultiLanguageTemplateRecord> = {
    zh: 'cn_name',
    cn: 'cn_name',
    'zh-cn': 'cn_name',
    en: 'us_name',
    us: 'us_name',
    'en-us': 'us_name',
    br: 'br_name',
    pt: 'br_name',
    ar: 'ar_name',
};

export default class PublicCacheReader {
    /**
     * 读取 app_config store 里某个 key 的值。
     * 如果库 / store / key 不存在，返回 null（不抛错）。
     */
    public static async readAppConfigField<T = unknown>(key: string): Promise<T | null> {
        if (!cc.sys.isBrowser) return null;
        try {
            const db = await PublicCacheReader.openPublicCache();
            if (!db.objectStoreNames.contains(PUBLIC_STORE_APP_CONFIG)) {
                return null;
            }
            return await new Promise<T | null>((resolve, reject) => {
                const req = db
                    .transaction(PUBLIC_STORE_APP_CONFIG, 'readonly')
                    .objectStore(PUBLIC_STORE_APP_CONFIG)
                    .get(key);
                req.onsuccess = () => resolve((req.result as T) ?? null);
                req.onerror = () => reject(req.error);
            });
        } catch (e) {
            console.warn('[PublicCacheReader] readAppConfigField error:', e);
            return null;
        }
    }

    /**
     * 读取快捷语列表，按指定语言解析为已展开的字符串数组。
     *
     * 解析策略（对多种可能的数据格式健壮）：
     *  1. 数据是 MultiLanguageTemplateRecord[] → 对每条 pickLocalizedText
     *  2. 数据是字符串 → 先 JSON.parse，再按 1/3 处理
     *  3. 数据是 { data: [...] } 或 { list: [...] } → 取内层数组再按 1 处理
     *  4. 数据是 { zh: [...], en: [...] } 这种按语言 key 直接给数组的格式 → 取当前语言数组
     *  5. 数据是 string[]（直接是当前语言的文案数组）→ 原样返回
     *
     * 任何一步失败 / 拿不到有效字符串，对应位置跳过（不返回空字符串占位）。
     *
     * @param lang 语言代码，默认 'zh'（中文）
     */
    public static async readQuickMessages(lang: string = 'zh'): Promise<string[]> {
        const raw = await PublicCacheReader.readAppConfigField<unknown>(APP_CONFIG_KEY_QUICK_MESSAGE);
        if (raw == null) return [];
        return PublicCacheReader.parseQuickMessages(raw, lang);
    }

    /**
     * 从一条多语言模板记录里按语言取出文案。
     * 空字符串 / undefined / null 一律 fallback 到 us_name（英文必填）。
     * 如果连 us_name 都没有，返回空字符串。
     *
     * @param record 多语言模板记录
     * @param lang   语言代码（'zh' / 'en' / 'br' / 'ar' ...），不区分大小写
     */
    public static pickLocalizedText(
        record: MultiLanguageTemplateRecord | null | undefined,
        lang: string,
    ): string {
        if (!record) return '';
        // 兼容两种结构：
        //   1. 扁平：{ cn_name: "你好", us_name: "Hi", ... }
        //   2. 嵌套：{ template_id, multi_language: { cn_name, us_name, ... } }
        const source: MultiLanguageTemplateRecord =
            (record.multi_language && typeof record.multi_language === 'object')
                ? record.multi_language as MultiLanguageTemplateRecord
                : record;
        const fieldName = LANG_FIELD_MAP[(lang || '').toLowerCase()] || 'us_name';
        const raw = source[fieldName];
        // 空字符串 / null / undefined 都视为"没填"，fallback us_name
        if (typeof raw === 'string' && raw.trim().length > 0) return raw;
        const fallback = source.us_name;
        return typeof fallback === 'string' ? fallback : '';
    }

    /** 内部：把任意格式的 raw 解析为字符串数组（导出主要是为了好测试） */
    public static parseQuickMessages(raw: unknown, lang: string): string[] {
        if (raw == null) return [];

        // 1. 字符串先 JSON.parse
        let data: unknown = raw;
        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (trimmed.length === 0) return [];
            try {
                data = JSON.parse(trimmed);
            } catch {
                // 不是合法 JSON，把整个字符串当一条文案
                return [trimmed];
            }
        }

        // 2. 数组：判断元素类型
        if (Array.isArray(data)) {
            // 2a. 如果数组里全是 string，直接当文案列表返回
            if (data.length > 0 && data.every((it) => typeof it === 'string')) {
                return data.filter((s): s is string => typeof s === 'string' && s.length > 0);
            }
            // 2b. 否则当作 MultiLanguageTemplateRecord[]，逐条取本地化文案
            const records = data as MultiLanguageTemplateRecord[];
            const result: string[] = [];
            for (const rec of records) {
                const text = PublicCacheReader.pickLocalizedText(rec, lang);
                if (text) result.push(text);
            }
            return result;
        }

        // 3. 对象：可能是 { data: [...] } / { list: [...] } / { zh: [...], en: [...] }
        if (typeof data === 'object') {
            const obj = data as Record<string, unknown>;
            // 3a. 按当前语言直接给数组（如 { zh: ["你好", "赞"], en: ["Hi", "GG"] }）
            const langKey = (lang || '').toLowerCase();
            const directArr = obj[langKey] ?? obj[lang] ?? obj[langKey.replace('-', '_')];
            if (Array.isArray(directArr)) {
                return directArr.filter((s): s is string => typeof s === 'string' && s.length > 0);
            }
            // 3b. 嵌套 { data: [...] } / { list: [...] } / { records: [...] }
            const innerArr = obj.data ?? obj.list ?? obj.records ?? obj.items;
            if (Array.isArray(innerArr)) {
                return PublicCacheReader.parseQuickMessages(innerArr, lang);
            }
        }

        return [];
    }

    /**
     * 打开 H5 创建的 public_cache 库。
     * ⚠️ CC 是只读方，不在 onupgradeneeded 里建 store —— 即使浏览器触发回调（库首次创建时），
     *    也让 H5 负责 schema。CC 这里只 resolve 已打开的 db。
     */
    private static openPublicCache(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (!cc.sys.isBrowser) {
                reject(new Error('[PublicCacheReader] not web platform'));
                return;
            }
            const indexedDB = (window as any).indexedDB;
            if (!indexedDB) {
                reject(new Error('[PublicCacheReader] window.indexedDB unavailable'));
                return;
            }
            const req = indexedDB.open(PUBLIC_CACHE_DB_NAME, PUBLIC_CACHE_DB_VERSION);
            // 注意：即使触发了 onupgradeneeded（H5 还没初始化好，浏览器自动建库），
            // CC 也不要在回调里建 store，让 H5 来做。
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
}
