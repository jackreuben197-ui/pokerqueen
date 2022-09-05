

export class ResManager {

    static bundleMap: { [key: string]: cc.AssetManager.Bundle } = {};


    static LoadAsset(bundleName: string, assetPath: string) {

        let bundle = bundleName == null ? cc.resources : this.bundleMap[bundleName];

        return bundle?.get(assetPath);

    }
    static Load(bundleName: string, ...args: any[]) {
        //默认读取内置包 resources 资源
        if (bundleName == null) {
            cc.resources.load.apply(cc.resources, args);
        } else {
            let bundle = this.bundleMap[bundleName];
            if (bundle == undefined) {
                cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
                    if (err) {
                        cc.log("bundle load error:", bundleName);
                        return;
                    }
                    this.bundleMap[bundleName] = bundle;
                    bundle.load.apply(bundle, args);
                })
            } else {
                bundle.load.apply(bundle, args);
            }
        }
    }
    //读取整个bundle包内资源
    static LoadABs(bundleName: string, progressHandler?: Function) {

        return new Promise((resolve, reject) => {

            cc.assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    cc.log("load bundle error:", bundleName);
                    reject(0);
                } else {

                    this.bundleMap[bundleName] = bundle;

                    bundle.loadDir("/",
                        (finish: number, total: number) => {
                            let percent = finish / total;
                            if (progressHandler) progressHandler(percent);
                        }, (error: Error, assets) => {
                            //cc.log("预加载资源加载完成");
                            //ProcedureManager.StartProcedure(ProcedureEnum.Config);
                            if (error) {
                                cc.log("load dir error:", error);
                                reject(0);
                            } else {
                                resolve(1);
                            }
                        })
                }
            })
        });
    }

    static async LoadBundleAsset(bundleName: string, assetPath: string) {
        let asset;
        //读取内置包 resources
        if (bundleName == null) {

            return cc.resources.get(assetPath);
        }

        let bundle: cc.AssetManager.Bundle = this.bundleMap[bundleName];

        if (!bundle) {

            bundle = await this.LoadBundle(bundleName).catch(() => { }) as cc.AssetManager.Bundle;
        }
        if (bundle) {

            let asset = bundle.get(assetPath);

            if (asset) return asset;

            await this.LoadBundleAssets(bundle);

            return bundle.get(assetPath);

        } else {

            return null;
        }

    }


    static LoadBundle(bundleName) {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    cc.log("LoadBundle error:", bundleName);
                    reject(0);
                } else {
                    resolve(bundle);
                }
            });
        })
    }

    static LoadBundleAssets(bundle) {
        return new Promise((resolve, reject) => {
            bundle.loadDir("/", (err, assets) => {
                if (err) {
                    cc.log("LoadBundleAssets error");
                    reject(0);
                } else {
                    resolve(assets);
                }
            });
        })
    }
}

(window as any).ResManager = ResManager;