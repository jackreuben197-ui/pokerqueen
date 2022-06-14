

export var ResManager = {

    bundleMap: {},

    Load(bundleName: string, ...args: any[]) {
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
}
