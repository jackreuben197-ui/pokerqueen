import { WWW, WebGetDiamondConfig } from "../net/https/WebRequest";

export default class DiamondModel {
    public static get Instance(): DiamondModel {
        return ((this as any).__Instance ??= new DiamondModel());
    }
    /////////////////////////////////////////////////////////////////

    //钻石配置表
    diamond_map: Map<number, any> = new Map();

    //获取钻石折扣配置 type:1 | 2 | 3 |4 |5 |6 |7 |8
    //结果正确返回配置数组
    public ReqDiamondConfig(type: number) {
        return new Promise((resolve, reject) => {
            let config = this.diamond_map.get(type);

            if (config) {
                return resolve(config);
            } else {
                WWW.Instance.CommonAPI({
                    web_class: WebGetDiamondConfig,
                    body: {
                        config_type: type,
                    },
                }).then(
                    (res: any) => {
                        this.diamond_map.set(type, res.data.data);
                        resolve(res.data.data);
                    },
                    (res: any) => {
                        reject(res);
                    },
                );
            }
        });
    }
    //获取具体的配置，依据 type_ext(先相应的获取方法取到这个值,4位数)
    public GetDiamondConfig(type_ext: number, config_type: number = 0): any {
        let data = this.diamond_map.get(config_type);

        if (data?.length) {
            for (let item of data) {
                if (item.type_ext == type_ext) return item;
            }
            return null;
        }
        return null;
    }
}
