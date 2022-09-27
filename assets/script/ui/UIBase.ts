
import BaseComponent from "../frame/base/BaseComponent";
import GC from "../frame/GameControl";
import CCTools from "../tools/CCTools";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends BaseComponent {
    static load_all_objects_duration: number = 0;
    show_animation: boolean = false;
    close_animation: boolean = false;

    private _prefabs: Map<string, UIBase> = new Map();

    protected setSprite(sp: cc.Sprite | cc.Mask, url?: string, cb: Function = null) {
        if (CCTools.isNull(url)) {
            sp.spriteFrame = null;
            return;
        }

        //防止连续两次赋值，由于加载速度不同，导致图片为第一次的图片
        let flagId = CCTools.onceNotRepeatNum;
        sp.node["flagId"] = flagId;
        this.loadAsset(url, (spriteframe) => {
            if (this.nodeIsValid(sp)) {
                if (sp.node["flagId"] && sp.node["flagId"] == flagId) {
                    sp.spriteFrame = spriteframe;
                    cb && cb(spriteframe);
                }
            }
        }, cc.SpriteFrame);
    }

    protected setSpriteShowGray(sp: cc.Sprite | cc.Node | cc.Button | cc.Label | dragonBones.ArmatureDisplay, showGray: boolean = true) {
        if (this.nodeIsValid(sp)) {
            let material = null;
            if (showGray) {
                material = cc.Material.getBuiltinMaterial("2d-gray-sprite");
            } else {
                material = cc.Material.getBuiltinMaterial("2d-sprite");
            }
            if (sp instanceof cc.Button) {
                sp.normalMaterial = material;
                return
            } else if (sp instanceof cc.Node) {
                sp = sp.getComponent(cc.Sprite)
            }
            sp.setMaterial(0, material);
        }
    }

    protected setTexture(sp: cc.Sprite, url: string, cb: Function = null) {
        if (CCTools.isNull(url)) {
            sp.spriteFrame = null;
            return;
        }
        this.loadAsset(url, (spriteframe) => {
            if (this.nodeIsValid(sp)) {
                sp.spriteFrame = spriteframe;
                Boolean(cb) && cb(spriteframe);
            }
        }, cc.Texture2D);
    }

    protected loadPrefab(url: string, cb: Function = null, errorCb: Function = null) {
        this.loadAsset(url, (instant, res) => {
            if (Boolean(this)) {
                cb && cb(instant, res);
            }
        }, cc.Prefab, errorCb);
    }

    protected setText(label: cc.Label | cc.RichText | cc.EditBox, msg: string | number, ...params) {
        if (this.nodeIsValid(label)) {
            if (CCTools.isNull(msg)) {
                label.string = "";
                return
            }
            let text = GC.language.getLocal(msg, ...params);
            if (!text.startsWith("缺少字段")) {
                msg = text;
            }
            label.string = String(msg);
        }
    }

    protected setTextColor(label: cc.Label | cc.RichText, textColor: cc.Color | string) {
        if (this.nodeIsValid(label) && textColor) {
            let color: cc.Color = (textColor instanceof cc.Color) ? textColor : new cc.Color().fromHEX(textColor);
            label.node.color = color;
        }
    }

    protected nodeIsValid(node: cc.Node | cc.Component) {
        if (Boolean(this) && Boolean(node)) {
            if (node instanceof cc.Node) {
                return node.isValid;
            } else if (node instanceof cc.Component) {
                return node.node && node.node.isValid;
            }
        }
        return false;
    }

    /**
    * 生成对象
    * @param url
    * @param type
    * @param handle
    */
    protected loadAsset(url: string, cb: Function, asset_type: typeof cc.Asset, errorCb: Function = null) {
        switch (asset_type) {
            case cc.Prefab: {
                GC.res.loadPrefab(url, (instance: cc.Node, res: cc.Prefab) => {
                    this._prefabs.set(url, instance.getComponent(UIBase));
                    cb && cb(instance, res);
                }, errorCb)
            } break;
            case dragonBones.DragonBonesAsset: {
                GC.res.loadRes(url + "_ske", (asset: dragonBones.DragonBonesAsset) => {
                    GC.res.loadRes(url + "_tex", (atlas: dragonBones.DragonBonesAtlasAsset) => {
                        cb && cb(asset, atlas)
                    }, dragonBones.DragonBonesAtlasAsset);
                }, dragonBones.DragonBonesAsset);
            } break;
            case cc.Texture2D: {
                GC.res.loadUrl(url, asset_type, (instance: cc.Texture2D) => {
                    cb && cb(new cc.SpriteFrame(instance))
                })
            } break;
            default: {
                GC.res.loadRes(url, (instance: any) => {
                    cb && cb(instance);
                }, asset_type);
            } break;
        }
    }

    lateClose(params?: any) {
        this._prefabs.forEach(prefab => {
            prefab.lateClose();
        })
    }

    onBeforeDestory() {
        this._prefabs.forEach(prefab => {
            prefab.onBeforeDestory();
        })
    }

    onDestroy(release: boolean = false) {
        super.onDestroy();
        this._prefabs.clear();
    }

}
