import { IUIDefine } from '../define/EIDefine';
import Main from '../Main';
import { ResManager } from '../manager/ResManager';
import BaseForm from './form/BaseForm';
import UIBase from './UIBase';
import { Close_Obj, Open_Obj } from './UIComponent';

export class UIFormMgr {
    protected Name: string = 'UIFormMgr';
    uiMap: Record<string, UIBase> = {};
    currUI: UIBase = null;
    //已经打开的ui列表
    showUIs: UIBase[] = [];
    //加载的UI层级
    protected UILayer: cc.Node = null;
    //缓存的UI层级
    protected CacheUILayer: cc.Node = null;

    static get Instance(): UIFormMgr {
        return ((<any>this).instance ??= new UIFormMgr());
    }

    constructor() {
        this.UILayer = Main.Form;
        this.CacheUILayer = Main.CacheUI;
    }

    find(uiDefine: IUIDefine): UIBase {
        return this.uiMap[uiDefine.Name];
    }

    /**
     * 打开一个窗体
     * @param param 携带的参数
     */
    open(uiDefine: IUIDefine, param: any = null, obj: Open_Obj) {
        if (this.currUI?.UIDefine.Name == uiDefine.Name) {
            console.warn(`[${this.Name}] open`, '当前面板已经存在:', uiDefine.Name);
            return;
        }
        let newUI = this.find(uiDefine);
        if (newUI) {
            this.lateOpen(newUI, param, obj);
            return;
        }
        ResManager.GetOrLoad<cc.Prefab>(uiDefine.Bundle, uiDefine.Path)
            .then(asset => {
                let ui_node = cc.instantiate(asset);
                newUI = ui_node.getComponent(UIBase);
                if (!newUI) {
                    console.log(`[${this.Name}] open`, uiDefine.Name, '缺少脚本');
                    return;
                }
                this.uiMap[uiDefine.Name] = newUI;
                this.lateOpen(newUI, param, obj);
            })
            .catch(e => {
                console.log(`[${this.Name}] open`, 'Get Resource Error', e);
            });
    }

    close(uiDefine: { Name: string; Bundle: string; Path: string } = null, param: any = null, obj: Close_Obj) {
        if (uiDefine) {
            for (let i = this.showUIs.length - 1; i >= 0; i--) {
                let ui = this.showUIs[i];
                if (ui.UIDefine.Name == uiDefine.Name) {
                    ui.close_animation = obj?.animation == null ? true : obj?.animation;
                    if (ui.close_animation) {
                        this.currUI.onClose(param);
                    } else {
                        this.currUI.onClose(param);
                    }
                    ui.node.parent = this.CacheUILayer;
                    this.showUIs.splice(i, 1);
                    this.currUI = this.showUIs[this.showUIs.length - 1];
                    console.log(`[${this.Name}]`, 'close ui left count:', this.Name, this.showUIs.length);
                    break;
                }
            }
        } else {
            if (this.currUI) {
                this.currUI.close_animation = obj?.animation == null ? true : obj?.animation;
                this.currUI.onClose(param);
                this.currUI.node.parent = this.CacheUILayer;
                this.showUIs.pop();
                this.currUI = this.showUIs[this.showUIs.length - 1];
            }
        }
    }

    protected lateOpen(ui: UIBase, param: any = null, obj: Open_Obj = null) {
        if (ui) {
            ui.node.active = true;
            ui.node.parent = this.UILayer;
            ui.show_animation = obj?.animation == null ? true : obj?.animation;
            ui.obj = obj;
            if (obj?.animation == false) ui.show_animation = false;
            if (obj?.jumpShow) {
                ui.node.x = 0;
                ui.node.y = 0;
            } else {
                // if (ui instanceof BaseForm) {
                //     ui.onShow(param, this.currUI?.node, obj?.SceneUI);
                // } else {
                ui.onShow(param);
                //}
            }
            this.currUI = ui;
            this.showUIs.push(ui);
            console.log(`[${this.Name}]`, 'lateOpen ui count:', this.Name, this.showUIs.length);
        }
    }

    public async closeAll() {
        while (this.showUIs.length) {
            let ui = this.showUIs.shift();
            ui.node.parent = this.CacheUILayer;
        }
        this.showUIs = [];
        this.currUI = null;
    }
}

export class UIBoardMgr extends UIFormMgr {
    protected Name: string = 'UIBoardMgr';

    static get Instance(): UIBoardMgr {
        return ((<any>this).instance ??= new UIBoardMgr());
    }

    constructor() {
        super();
        this.UILayer = Main.Board;
        this.CacheUILayer = Main.CacheUI;
    }
}

export class UIDialogMgr extends UIFormMgr {
    protected Name: string = 'UIDialogMgr';

    static get Instance(): UIDialogMgr {
        return ((<any>this).instance ??= new UIDialogMgr());
    }

    constructor() {
        super();
        this.UILayer = Main.Dialog;
        this.CacheUILayer = Main.CacheUI;
    }
}

export class UIPromptMgr extends UIFormMgr {
    protected Name: string = 'UIPromptMgr';

    static get Instance(): UIPromptMgr {
        return ((<any>this).instance ??= new UIPromptMgr());
    }

    constructor() {
        super();
        this.UILayer = Main.Prompt;
        this.CacheUILayer = Main.CacheUI;
    }
}

export class UICommonMgr {
    protected Name: string = 'UICommonMgr';
    private uiMap = new Map<IUIDefine, cc.Node>();
    // 弹窗背景遮罩：所有标记 Backdrop 的 CommonUI 共用一个，置于最上层弹窗的正下方。
    // 优先用“模糊截图”（render-to-texture 降采样），失败则回退为纯暗色遮罩。
    private _backdrop: cc.Node = null;
    private _backdropDim: cc.Node = null;   // 兜底纯色暗层
    private _backdropBlur: cc.Node = null;  // 模糊截图层
    private _blurTex: cc.RenderTexture = null;
    // 当前打开且需要遮罩的弹窗（按打开顺序）
    private _backdropStack: cc.Node[] = [];
    /** 兜底暗色遮罩不透明度（0-255，截图失败时使用）*/
    private static readonly BACKDROP_OPACITY = 200;
    /** 截图降采样倍数（越大越模糊、越省）*/
    private static readonly BLUR_DOWNSAMPLE = 18;

    static get Instance(): UICommonMgr {
        return ((<any>this).instance ??= new UICommonMgr());
    }

    constructor() {}

    find(uiDefine: IUIDefine): UIBase {
        const node = this.uiMap.get(uiDefine);
        if (!node) return null;
        return node.getComponent(UIBase);
    }

    open(uiDefine: IUIDefine, param: any = null, obj: Open_Obj) {
        let node: cc.Node = this.uiMap.get(uiDefine);
        if (!node) {
            let bundle = cc.assetManager.getBundle(uiDefine.Bundle);
            let prefab: cc.Prefab = (bundle || cc.resources).get(uiDefine.Path, cc.Prefab);
            if (!prefab) {
                console.warn('[UICommonMgr]', '缺少预制体资源:', uiDefine.Path);
                return;
            }
            node = cc.instantiate(prefab);
            this.uiMap.set(uiDefine, node);
        }
        node.active = true;
        if (node.activeInHierarchy) {
            let ui = node.getComponent(UIBase);
            if (ui) {
                ui.show_animation = obj?.animation == null ? true : obj?.animation;
                ui.onShow(param);
            }
            if (uiDefine.Backdrop) this._pushBackdrop(node);
            console.log('[UICommonMgr]', 'ui已经开启');
            return;
        }
        node.parent = obj?.parentUI || Main.Dialog;
        let ui = node.getComponent(UIBase);
        if (ui) {
            ui.show_animation = obj?.animation == null ? true : obj?.animation;
            ui.onShow(param);
        }
        if (uiDefine.Backdrop) this._pushBackdrop(node);
    }

    close(uiDefine: IUIDefine, param: any = null, obj: Close_Obj) {
        let node: cc.Node = this.uiMap.get(uiDefine);
        if (node && node.activeInHierarchy) {
            let ui = node.getComponent(UIBase);
            if (ui) {
                ui.close_animation = obj?.animation == null ? true : obj?.animation;
                ui.onClose(param);
            }
            node.parent = null;
        }
        this._popBackdrop(node);
    }

    /** 懒创建遮罩节点：包含 Dim（兜底纯色）与 Blur（模糊截图）两层，纯代码无需资源 */
    private _ensureBackdrop(): cc.Node {
        if (this._backdrop && cc.isValid(this._backdrop)) return this._backdrop;
        const node = new cc.Node('CommonUIBackdrop');
        node.addComponent(cc.BlockInputEvents); // 屏蔽点击穿透到下层（牌桌）
        const base = Math.max(cc.winSize.width || 1242, cc.winSize.height || 2688) * 3;
        // 兜底纯色暗层
        const dim = new cc.Node('Dim');
        dim.parent = node;
        dim.setContentSize(base, base);
        const g = dim.addComponent(cc.Graphics);
        g.fillColor = cc.color(0, 0, 0, UICommonMgr.BACKDROP_OPACITY);
        g.rect(-base / 2, -base / 2, base, base);
        g.fill();
        // 模糊截图层（默认隐藏，截图成功时启用）
        const blur = new cc.Node('Blur');
        blur.parent = node;
        const sp = blur.addComponent(cc.Sprite);
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.type = cc.Sprite.Type.SIMPLE;
        blur.active = false;
        this._backdrop = node;
        this._backdropDim = dim;
        this._backdropBlur = blur;
        return node;
    }

    /** 截取当前画面（排除弹窗与遮罩自身），降采样得到模糊背景；失败返回 null */
    private _captureBlur(exclude: cc.Node[]): cc.RenderTexture {
        try {
            const canvas = cc.Canvas.instance && cc.Canvas.instance.node;
            if (!canvas) return null;
            const ds = UICommonMgr.BLUR_DOWNSAMPLE;
            const w = Math.max(8, Math.floor((cc.winSize.width || 1242) / ds));
            const h = Math.max(8, Math.floor((cc.winSize.height || 2688) / ds));
            const tex = new cc.RenderTexture();
            tex.initWithSize(w, h);
            // 线性过滤 + 边缘钳制：放大后是平滑模糊而非马赛克
            if ((tex as any).setFilters) tex.setFilters(cc.Texture2D.Filter.LINEAR, cc.Texture2D.Filter.LINEAR);
            if ((tex as any).setWrapMode) tex.setWrapMode(cc.Texture2D.WrapMode.CLAMP_TO_EDGE, cc.Texture2D.WrapMode.CLAMP_TO_EDGE);
            const camNode = new cc.Node('BlurCam');
            camNode.parent = canvas;
            const cam = camNode.addComponent(cc.Camera);
            cam.clearFlags = cc.Camera.ClearFlags.COLOR | cc.Camera.ClearFlags.DEPTH | cc.Camera.ClearFlags.STENCIL;
            cam.backgroundColor = cc.color(15, 25, 20, 255);
            cam.cullingMask = 0xffffffff;
            cam.alignWithScreen = true;
            cam.targetTexture = tex;
            const states = exclude.map(n => ({ n, a: n && n.active }));
            states.forEach(s => { if (s.n && cc.isValid(s.n)) s.n.active = false; });
            cam.render(canvas);
            states.forEach(s => { if (s.n && cc.isValid(s.n)) s.n.active = s.a; });
            camNode.destroy();
            return tex;
        } catch (e) {
            console.warn('[UICommonMgr] blur capture failed, fallback to dim:', e);
            return null;
        }
    }

    /**
     * 统一纯色暗层：所有弹窗背景完全一致。
     * 不再实时截图（截图会因每个弹窗背后内容不同而出现“有时模糊牌桌、有时全黑、有时绿色”的不一致），
     * 改为恒定暗色遮罩，保证每个弹窗背景看起来都一样。
     */
    private _applyBlur(): void {
        const blur = this._backdropBlur;
        const dim = this._backdropDim;
        if (blur) blur.active = false;
        if (dim) dim.active = true;
    }

    private _pushBackdrop(node: cc.Node): void {
        if (!node) return;
        const idx = this._backdropStack.indexOf(node);
        if (idx >= 0) this._backdropStack.splice(idx, 1);
        this._backdropStack.push(node);
        this._updateBackdrop();
    }

    private _popBackdrop(node: cc.Node): void {
        if (node) {
            const idx = this._backdropStack.indexOf(node);
            if (idx >= 0) this._backdropStack.splice(idx, 1);
        }
        this._updateBackdrop();
    }

    /** 把遮罩放到最上层弹窗的正下方；无弹窗时隐藏 */
    private _updateBackdrop(): void {
        let top: cc.Node = null;
        for (let i = this._backdropStack.length - 1; i >= 0; i--) {
            const n = this._backdropStack[i];
            if (n && cc.isValid(n) && n.parent && n.activeInHierarchy) {
                top = n;
                break;
            }
            this._backdropStack.splice(i, 1); // 清理失效项
        }
        if (!top) {
            if (this._backdrop && cc.isValid(this._backdrop)) this._backdrop.active = false;
            return;
        }
        const bd = this._ensureBackdrop();
        bd.active = true;
        bd.parent = top.parent;
        // 让遮罩紧贴在最上层弹窗的下面
        bd.setSiblingIndex(top.parent.childrenCount - 1);
        top.setSiblingIndex(top.parent.childrenCount - 1);
        // 将遮罩对齐到真实屏幕中心（弹窗层原点不一定在屏幕中心，否则会露出真实背景）
        this._centerBackdrop(bd);
        // 抓取当前画面生成模糊背景（失败自动回退为暗色）
        this._applyBlur();
    }

    /** 把遮罩节点定位到屏幕中心（不依赖所在层级的原点位置）*/
    private _centerBackdrop(bd: cc.Node): void {
        try {
            const canvasNode = cc.Canvas.instance && cc.Canvas.instance.node;
            if (!canvasNode || !bd.parent) {
                bd.setPosition(0, 0);
                return;
            }
            const world = canvasNode.convertToWorldSpaceAR(cc.v2(0, 0));
            const local = bd.parent.convertToNodeSpaceAR(world);
            bd.setPosition(local);
        } catch (e) {
            bd.setPosition(0, 0);
        }
    }
}
