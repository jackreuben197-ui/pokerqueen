import { WWW, WebGetDiamondConfig } from '../net/https/WebRequest';
// 存储格式：config_type → { type_ext → item }，与 H5 侧 DiamondConfigMap 规范对齐。
type DiamondTypeMap = Record<number, any>;

export default class DiamondModel {

    public static get Instance(): DiamondModel {
        return ((this as any).__Instance ??= new DiamondModel());
    }

    // 钻石配置表：主键 config_type，值为以 type_ext 为键的对象。
    diamond_map: Map<number, DiamondTypeMap> = new Map();

    // 将原始数组（API / H5 同步）按 type_ext 索引后写入指定 config_type。
    private storeItems(configType: number, items: any[]): void {
        if (!Array.isArray(items) || items.length === 0) return;
        const typeMap: DiamondTypeMap = {};
        for (const item of items) {
            const typeExt = item?.type_ext;
            if (typeExt != null) {
                typeMap[typeExt] = item;
            }
        }
        this.diamond_map.set(configType, typeMap);
    }

    // H5 bridge 预填：直接接收已转换的 typeMap（{[type_ext]: item}），无需再做分组。
    // 仅在本地尚无该 config_type 数据时写入，避免覆盖已有缓存。
    public setFromH5Sync(configType: number, typeMap: DiamondTypeMap): void {
        if (this.diamond_map.has(configType)) return;
        this.diamond_map.set(configType, typeMap);
    }

    // 按需拉取指定 config_type 的配置；已有缓存时直接 resolve，不发网络请求。
    public ReqDiamondConfig(type: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.diamond_map.has(type)) {
                return resolve();
            }
            WWW.Instance.CommonAPI({
                web_class: WebGetDiamondConfig,
                body: { config_type: type }
            }).then(
                (res: any) => {
                    this.storeItems(type, res.data.data);
                    resolve();
                },
                (res: any) => {
                    reject(res);
                }
            );
        });
    }

    // 查找指定 config_type + type_ext 的配置项。
    public GetDiamondConfig(type_ext: number, config_type: number = 0): any {
        const typeMap = this.diamond_map.get(config_type);
        if (!typeMap) return null;
        return typeMap[type_ext] ?? null;
    }
}
