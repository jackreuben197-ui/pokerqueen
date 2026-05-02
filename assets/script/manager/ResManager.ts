import { bundleRes, bundleSpriteRes } from "../config/PathConfig";
import MyLog from "../tools/MyLog";
import AssetContext from "../ui/component/AssetContext";
import UIBase from "../ui/UIBase";

export const BUNDLE_RESOURCES: string = "resources";
export const BUNDLE_TEXAS: string = "texas";

export type PreloadDefinition = { bundle: string, dir: string };
export type PreloadParams = { preloadDefinition: PreloadDefinition, complete?: ()=>void, stopProgress?: boolean, error?: (err:Error) => void };

// export const Pre_Config_Define: Pre_Define = {
//     bundle: BUNDLE_RESOURCES,
//     dir: "config",
// }
// export const Pre_Login_Define: Pre_Define = {
//     bundle: BUNDLE_RESOURCES,
//     dir: "login"
// }
// export const Pre_Main_Define: Pre_Define = {
//     bundle: BUNDLE_RESOURCES,
//     dir: "main"
// }
// export const Pre_Login_Main_Define: Pre_Define = {
//     bundle: BUNDLE_RESOURCES,
//     dir: "/"
// }
export const PreloadDefinitionTexas: PreloadDefinition = {
    bundle: BUNDLE_TEXAS,
    dir: "/"
}

//bundle字典
export const Bundle_Map: Map<string, cc.AssetManager.Bundle> = new Map<string, cc.AssetManager.Bundle>();

export class ResManager {
    private static _instance: ResManager = null;
    public static get instance() {
        if (!ResManager._instance) {
            ResManager._instance = new ResManager();
        }
        return ResManager._instance;
    }
    // PrefabMap: any = {};
    // // static bundleMap: { [key: string]: cc.AssetManager.Bundle } = {};

    // //关联预制体
    // SetPrefab(bundle: string, prefab: cc.Prefab) {
    //     this.PrefabMap[bundle] || (this.PrefabMap[bundle] = {});
    //     this.PrefabMap[bundle][prefab.name] = prefab;
    // }
    // GetPrefab(bundle: string, prefab_name: string) {
    //     return this.PrefabMap[bundle][prefab_name];
    // }

    static async GetOrLoad<T extends cc.Asset>(bundleName: string, assetPath: string): Promise<T> {
        let bundle = bundleName == BUNDLE_RESOURCES ? cc.resources : cc.assetManager.getBundle(bundleName);
        // check it is loaded
        if (!bundle) {
            return new Promise((resovle, reject) => {
                cc.assetManager.loadBundle(bundleName, (err: Error, loadedBundle: cc.AssetManager.Bundle) => {
                    if (err) {
                        cc.log("bundle load error:", bundleName);
                        reject(err)
                        return;
                    }
                    loadedBundle.load(assetPath, (err:Error, asset: T) => {
                         if (err) {
                            cc.log("bundle path load error:", bundleName, assetPath);
                            reject(err)
                            return;
                        }
                        resovle(asset)
                    });
                })
            });
        }
        const asset =  bundle.get<T>(assetPath);
        if (asset) {
            return asset;
        }
        return new Promise((resovle, reject) => {
            bundle.load(assetPath, (err:Error, asset: T) => {
                    if (err) {
                    cc.log("bundle path load error:", bundleName, assetPath);
                    reject(err)
                    return;
                }
                resovle(asset)
            });
        })

    }


    // static LoadAsset(bundleName: string, assetPath: string) {
    //     let bundle = bundleName == null ? cc.resources : cc.assetManager.getBundle(bundleName);
    //     return bundle?.get(assetPath);
    // }

    // static Load(bundleName: string, ...args: any[]) {
    //     //默认读取内置包 resources 资源
    //     if (bundleName == null) {
    //         cc.resources.load.apply(cc.resources, args);
    //     } else {
    //         let bundle = cc.assetManager.getBundle(bundleName);
    //         if (bundle == undefined) {
    //             cc.assetManager.loadBundle(bundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
    //                 if (err) {
    //                     cc.log("bundle load error:", bundleName);
    //                     return;
    //                 }
    //                 bundle.load.apply(bundle, args);
    //             })
    //         } else {
    //             bundle.load.apply(bundle, args);
    //         }
    //     }
    // }


    static AssetForeach(assets: cc.Asset[], bundleName: string) {
        assets.forEach((item) => {
            if (item instanceof cc.Prefab) {
                AssetContext.setAsset(bundleName, item.name, item);
                let ac = item.data?.getComponent(AssetContext);
                if (ac) {
                    item.data.children.forEach((item) => {
                        let sprite = item.getComponent(cc.Sprite);
                        if (sprite) {
                            AssetContext.setAsset(ac.fold, item.name, sprite.spriteFrame);

                        }
                        let sound = item.getComponent(cc.AudioSource);
                        if (sound) {
                            AssetContext.setAsset(ac.fold, item.name, sound.clip);
                        }
                    })
                }
            }
        }
        )
    }
    // //读取整个bundle包内资源
    // static LoadABs(bundleName: string, progressHandler?: Function) {
    //     let percent = 0;
    //     return new Promise((resolve, reject) => {
    //         cc.assetManager.loadBundle(bundleName, (err, bundle) => {
    //             if (err) {
    //                 cc.log("load bundle error:", bundleName);
    //                 reject(0);
    //             } else {
    //                 Bundle_Map.set(bundleName, bundle);
    //                 bundle.loadDir("/",
    //                     (finish: number, total: number, item: cc.AssetManager.RequestItem) => {
    //                         percent = Math.max(percent, finish / total);
    //                         if (progressHandler) progressHandler(percent);
    //                         //console.log("=====>", bundleName, item.url);
    //                     }, (error: Error, assets) => {
    //                         if (error) {
    //                             cc.log("load dir error:", error);
    //                             reject(0);
    //                         } else {
    //                             this.AssetForeach(assets, bundleName);
    //                             resolve(1);
    //                         }
    //                     })
    //             }
    //         })
    //     });
    // }

    // static async LoadBundleAsset(bundleName: string, assetPath: string) {
    //     let asset;
    //     //读取内置包 resources
    //     if (bundleName == null) {
    //         return cc.resources.get(assetPath);
    //     }

    //     let bundle: cc.AssetManager.Bundle = cc.assetManager.getBundle(bundleName);
    //     if (!bundle) {
    //         bundle = await this.LoadBundle(bundleName).catch(() => { }) as cc.AssetManager.Bundle;
    //     }

    //     if (bundle) {
    //         let asset = bundle.get(assetPath);
    //         if (asset) return asset;

    //         await this.LoadBundleAssets(bundle);
    //         return bundle.get(assetPath);
    //     } else {
    //         return null;
    //     }

    // }


    // static LoadBundle(bundleName) {
    //     return new Promise((resolve, reject) => {
    //         cc.assetManager.loadBundle(bundleName, (err, bundle) => {
    //             if (err) {
    //                 cc.log("LoadBundle error:", bundleName);
    //                 reject(0);
    //             } else {
    //                 resolve(bundle);
    //             }
    //         });
    //     })
    // }

    // static LoadBundleAssets(bundle) {
    //     return new Promise((resolve, reject) => {
    //         bundle.loadDir("/", (err, assets) => {
    //             if (err) {
    //                 cc.log("LoadBundleAssets error");
    //                 reject(0);
    //             } else {
    //                 resolve(assets);
    //             }
    //         });
    //     })
    // }



    /// ****   xyh   ***** ///
    //获取加载过的资源
    // getRes(path: string, asset_type?: typeof cc.Asset) {
    //     let res: any = cc.resources.get(path, asset_type);
    //     return res;
    // }

    // // 在网络断获取资源
    // loadUrl(url: string, type: typeof cc.Asset, cb: Function) {
    //     let res = this.getRes(url);
    //     if (res) {
    //         cb && cb(res);
    //         return;
    //     }

    //     let endStr = this.getUrlEnd(url, type);
    //     cc.assetManager.loadRemote(url, { ext: endStr }, (err: Error, res: any) => {
    //         if (err) {
    //             MyLog.worn("ResourceMgr load error : ", url, err);
    //             return;
    //         }
    //         try {
    //             cb && cb(res);
    //         } catch (e) {
    //             MyLog.worn(e.stack);
    //         }
    //     });
    // }

    // private getUrlEnd(url: string, type: typeof cc.Asset) {
    //     let end = type == cc.Texture2D ? ".png" : (type == cc.AudioClip ? ".mp3" : ".txt");
    //     end = url.match(".jpg") ? ".jpg" : (url.match(".jpeg") ? ".jpeg" : end);
    //     end = url.match(".wav") ? ".wav" : end;
    //     return end;
    // }

    // loadPrefab(path: string, cb: Function, errorCb: Function = null) {
    //     let nameStrs = path.split('/');
    //     let prefabName = nameStrs[nameStrs.length - 1];
    //     if (bundleRes[prefabName]) {
    //         //有依赖的分包资源
    //         this.loadBundle(bundleRes[prefabName], () => {
    //             this.loadRes(path, (res1: any, res2: any) => {
    //                 cb && cb(res1, res2);
    //             }, cc.Prefab, errorCb);
    //         }, errorCb);
    //     } else {
    //         this.loadRes(path, (res1: any, res2: any) => {
    //             cb && cb(res1, res2);
    //         }, cc.Prefab, errorCb);
    //     }

    // }

    // //加载本地资源
    // loadRes(path: string, cb: Function = null, asset_type: typeof cc.Asset = cc.SpriteFrame, errorCb: Function = null): void {
    //     let isPrefab = asset_type == cc.Prefab;

    //     if (!isPrefab) {
    //         let index = path.indexOf('/');
    //         let bundleName = path.substring(0, index);
    //         let urlName = path.substring(index + 1);
    //         if (bundleSpriteRes[bundleName]) {
    //             //读取的分包资源
    //             this.loadResFromBundleName(bundleName, urlName, asset_type, (instance: any) => {
    //                 cb && cb(instance);
    //             }, errorCb);
    //             return;
    //         }
    //     }

    //     let res: any = cc.resources.get(path, asset_type);
    //     if (res) {
    //         this.checkAssetIsPrefab(path, res, asset_type, cb, false);
    //         return;
    //     }

    //     cc.resources.load(path, asset_type, (err: Error, res: any): void => {
    //         if (err) {
    //             MyLog.worn("ResourceMgr loadRes error : ", path, err);
    //             errorCb && errorCb();
    //             return;
    //         }
    //         try {
    //             this.checkAssetIsPrefab(path, res, asset_type, cb, true);
    //         } catch (e) {
    //             MyLog.worn(e.stack);
    //         }
    //     });
    // }

    /***  
     * Asset Bundle
     * 加载分包资源 
     ***/
    /***
     * nameOrUrl: 传入包名  或者url路径（如果是复用其他项目的包，则只能使用url）
    //  ***/
    // loadBundle(nameOrUrl: string, callBack?: Function, errorCb: Function = null) {
    //     let bundle = cc.assetManager.getBundle(nameOrUrl);
    //     if (bundle) {
    //         callBack && callBack(bundle)
    //         return;
    //     }
    //     cc.assetManager.loadBundle(nameOrUrl, null, (err: Error, bundle: cc.AssetManager.Bundle) => {
    //         if (err) {
    //             MyLog.worn("ResourceMgr loadBundle error : ", nameOrUrl, err);
    //             errorCb && errorCb();
    //             return;
    //         }
    //         callBack && callBack(bundle)
    //     })
    // }

    // loadResFromBundleName(bundleName: string, path: string, asset: typeof cc.Asset, callBack?: Function, errorCb: Function = null) {
    //     this.loadBundle(bundleName, (bundle: cc.AssetManager.Bundle) => {
    //         this.loadResFromBundle(bundle, path, asset, callBack, errorCb);
    //     }, errorCb)
    // }

    // loadResFromBundle(bundle: cc.AssetManager.Bundle, path: string, asset: typeof cc.Asset, callBack?: Function, errorCb: Function = null) {
    //     let res = bundle.get(path, asset);
    //     if (res) {
    //         this.checkAssetIsPrefab(path, res, asset, callBack, false);
    //         callBack && callBack(res);
    //         return
    //     }

    //     bundle.load(path, asset, (error: Error, res: any) => {
    //         if (error) {
    //             MyLog.worn("ResourceMgr loadResFromBundle error : ", error);
    //             errorCb && errorCb();
    //             return;
    //         }
    //         this.checkAssetIsPrefab(path, res, asset, callBack, true);
    //     })
    // }

    // releaseBundleByName(name: string) {
    //     let bundle = cc.assetManager.getBundle(name);
    //     this.releaseBundle(bundle);
    // }

    // releaseBundle(bundle: cc.AssetManager.Bundle) {
    //     if (bundle) {
    //         cc.assetManager.removeBundle(bundle);
    //     }
    // }

    // private checkAssetIsPrefab(path, res, asset_type, cb, isLoad) {
    //     let isPrefab = asset_type == cc.Prefab;
    //     // isLoad && res.addRef();
    //     if (isPrefab) {
    //         this.setPrefab(path, res, cb)
    //     } else {
    //         cb && cb(res);
    //     }
    // }

    // private setPrefab(path: string, res: cc.Prefab, cb: Function) {
    //     let node = cc.instantiate(res);
    //     node.setPosition(cc.Vec2.ZERO);
    //     let prefab = node.getComponent(UIBase);
    //     if (!Boolean(prefab)) {
    //         prefab = node.addComponent(UIBase);
    //     }
    //     if (!Boolean(prefab.path)) {
    //         prefab.path = path;
    //     }
    //     cb && cb(node, res);
    // }
    // //通过md5图片找到原始图片
    // public getOriginImage(code: string) {

    //     let textture_id = cc.assetManager.assets.get(code)["_id"];

    //     console.log(textture_id)

    //     let result = null;

    //     for (var key in cc.assetManager.assets["_map"]) {

    //         let item = cc.assetManager.assets["_map"][key];

    //         if (item?.["_texture"]?.["_id"] == textture_id) {

    //             result = key;

    //             break;
    //         }
    //     }
    //     return result
    // }
}

(window as any).ResManager = ResManager;