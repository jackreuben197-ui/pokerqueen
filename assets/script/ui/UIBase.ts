
import BaseComponent from "../frame/base/BaseComponent";
import LanguageManager from "../frame/manager/LanguageManager";
import { i18nLabel } from "../i18n/i18nLabel";
import { ResManager } from "../manager/ResManager";
import CCTools from "../tools/CCTools";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends BaseComponent {
    // 索引
    public index: number = 0;

    public show_animation: boolean = false;
    public close_animation: boolean = false;

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
    protected setSpriteShowGray(sp: cc.Sprite | cc.Node | cc.Button | cc.Label | sp.Skeleton, showGray: boolean = true) {
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

        let flagId = CCTools.onceNotRepeatNum;
        sp.node["flagId"] = flagId;
        this.loadAsset(url, (spriteframe) => {
            if (this.nodeIsValid(sp)) {
                if (sp.node["flagId"] && sp.node["flagId"] == flagId) {
                    sp.spriteFrame = spriteframe;
                    Boolean(cb) && cb(spriteframe);
                }
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
            let text = LanguageManager.instance.getLocal(msg, ...params);
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

    protected setActive(node: cc.Node | cc.Component, act: any) {
        if (this.nodeIsValid(node)) {
            if (node instanceof cc.Node) {
                node.active = Boolean(act);
            } else if (node instanceof cc.Component) {
                node.node.active = Boolean(act);
            }
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
    //设置按钮点击
    protected setButtonClick(button: cc.Node, clickHandler: Function) {
        if (!button) return;
        let button_com = button.getComponent(cc.Button) || button.getChildByName("BtnArea")?.getComponent(cc.Button) || button.getChildByName("click")?.getComponent(cc.Button);
        if (button_com) {
            button_com.node.on("click", clickHandler, this);
        }
    }

    protected setChildButtonClick(node: cc.Node, path: string, clickHandler: Function) {
        let button = cc.find(path, node);
        this.setButtonClick(button, clickHandler);
    }

    //获取按钮节点是否可交互
    public getButtonInteractable(button: cc.Node) {
        if (!button) return;
        let button_com = button.getComponent(cc.Button) || button.getChildByName("BtnArea")?.getComponent(cc.Button) || button.getChildByName("click")?.getComponent(cc.Button);
        if (button_com) {
            return button_com.interactable;
        }
        return false;
    }
    //设置按钮节点是否可交互
    public setButtonInteractable(button: cc.Node, boo: boolean) {
        if (!button) return;
        let button_com = button.getComponent(cc.Button) || button.getChildByName("BtnArea")?.getComponent(cc.Button) || button.getChildByName("click")?.getComponent(cc.Button);
        if (button_com) {
            button_com.interactable = boo;
        }
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
                ResManager.instance.loadPrefab(url, (instance: cc.Node, res: cc.Prefab) => {
                    this._prefabs.set(url, instance.getComponent(UIBase));
                    cb && cb(instance, res);
                }, errorCb)
            } break;
            // case dragonBones.DragonBonesAsset: {
            //     ResManager.instance.loadRes(url + "_ske", (asset: dragonBones.DragonBonesAsset) => {
            //         ResManager.instance.loadRes(url + "_tex", (atlas: dragonBones.DragonBonesAtlasAsset) => {
            //             cb && cb(asset, atlas)
            //         }, dragonBones.DragonBonesAtlasAsset);
            //     }, dragonBones.DragonBonesAsset);
            // } break;
            case cc.Texture2D: {
                ResManager.instance.loadUrl(url, asset_type, (instance: cc.Texture2D) => {
                    cb && cb(new cc.SpriteFrame(instance))
                })
            } break;
            default: {
                ResManager.instance.loadRes(url, (instance: any) => {
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

    //从其他页面回退执行
    reback() {

    }
    //设置节点下的文本,包括子路径
    setChildLabel(node: cc.Node, path: string, text: string | number) {
        let label_node = cc.find(path, node);
        if (label_node) {
            let i18n = label_node.getComponent(i18nLabel);
            if (i18n) {
                i18n.i18NString = `${text}`;
            } else {
                let label = label_node.getComponent(cc.Label) || label_node.getComponent(cc.RichText);
                label.string = `${text}`;
            }
        } else {
            console.log("-----未找到node-----", path);
        }
    }
    //设置节点下的文本颜色
    setChildLabelColor(node: cc.Node, path: string, color: string) {
        cc.find(path, node).color = cc.Color.BLACK.fromHEX(color);
    }

    setChildVisible(node: cc.Node, path: string, visible: boolean) {
        cc.find(path, node).active = visible;
    }
    setChildSprite(node: cc.Node, path: string, spriteFrame: cc.SpriteFrame) {
        cc.find(path, node).getComponent(cc.Sprite).spriteFrame = spriteFrame;
    }

}
