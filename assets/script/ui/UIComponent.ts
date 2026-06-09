import { traceClass } from '../crazyPoker/gameplay/common/core/LogTrace';
import { UIPrefabType } from '../crazyPoker/gameplay/common/core/UIPrefabDefinition';
import { IUIDefine, UIType } from '../define/EIDefine';
import { i18nMgr } from '../i18n/i18nMgr';
import Main from '../Main';
import ToastManager from '../manager/ToastManager';
import UIBase from '../ui/UIBase';
import { UIBoardMgr, UICommonMgr, UIDialogMgr, UIFormMgr, UIPromptMgr } from './UIMgr';
const { ccclass } = cc._decorator;

export enum PrefabUI {
    UIPreloading = 'UIPreloading',
    //UITexasMenuComponent = "UITexasMenuComponent",
    UITexasMenu = 'UITexasMenu',
    //UIAddChipsComponent = "UIAddChipsComponent",
    UIOutChipsComponent = 'UIOutChipsComponent',
    UIOperationComponent = 'UIOperationComponent',
    UIAutoOperationComponent = 'UIAutoOperationComponent',
    //UIInsuranceComponent = "UIInsuranceComponent",
    UIAutoChipsComponent = 'UIAutoChipsComponent',
    UIMTTTimeComponent = 'UIMTTTimeComponent',
    UIOutChipsTipComponent = 'UIOutChipsTipComponent',
    UIAgreeSecondPcsComponent = 'UIAgreeSecondPcsComponent', //第二套公共牌的同意拒绝面板
    UIMttSignDialogComponent = 'UIMttSignDialogComponent', //牌桌上的比赛重购面板
    MttAgainBuy = 'MttAgainBuy', //牌桌上的比赛重购面板
    MttPayforHome = 'MttPayforHome',
    //////////////
    UIBringIn = 'UIBringIn', //带入记分牌
    UIAutoBringIn = 'UIAutoBringIn', //自动记分牌
    UIBringOut = 'UIBringOut', //带出记分牌
    UIInsuranceNewPanel = 'UIInsuranceNewPanel' //新版保险面板
}

export function isPrefabUI(value: any): value is PrefabUI {
    return typeof value === 'number'; // 或者更严谨地检查是否在 Enum 范围内
}

(window as any).PrefabUI = PrefabUI;

//打开面板追加参数
export interface Open_Obj {
    parentUI?: cc.Node; //父节点
    SceneUI?: cc.Node; //场景节点
    animation?: boolean;
    jumpShow?: boolean; //跳過執行onShow
    fromComponent?: any; //来自组件
}

//关闭面板追加参数
export interface Close_Obj {
    animation?: boolean;
}

@ccclass
@traceClass()
export default class UIComponent {
    [key: string]: any;
    prefab_node_map = new Map();

    static get Instance(): UIComponent {
        return ((<any>this).__instance ??= new UIComponent());
    }

    /**
     存储预制体节点

     */
    SetPrefabNode(prefab_name: string, node: cc.Node): void {
        this.prefab_node_map.set(prefab_name, node);
    }

    /**
     获取预制体节点

     */
    GetPrefabNode(prefab_name: string): cc.Node {
        return this.prefab_node_map.get(prefab_name);
    }

    /**
     * 获取预制体节点绑定的类
     */
    GetPrefabNodeCom(prefab_name: string): any {
        this.prefab_node_map.get(prefab_name)?.getComponent(prefab_name);
    }

    Toast(content?: string, cb?: () => void) {
        const msg = content || i18nMgr.Get('adaptation10301');
        ToastManager.Instance.showToast(msg, undefined, cb);
    }

    ToastLanguage(content?: string) {
        const msg = content ? i18nMgr.Get(content) : i18nMgr.Get('adaptation10301');
        ToastManager.Instance.showToast(msg);
    }

    //显示节点
    ShowUI<T>(com: PrefabUI, param?: T) {
        let node = this.GetPrefabNode(com);
        if (node) {
            node.active = true;
            let ui_component: UIBase = node.getComponent(UIBase);
            ui_component?.onShow(param);
            this.tracelog.debug('PrefabUI_node', node.name);
        } else {
            this.tracelog.debug('> 缺少相关的节点', com);
        }
    }

    //隐藏节点
    HideUI<T>(com: PrefabUI, param?: T) {
        let node = this.GetPrefabNode(com);
        if (node && node.active) {
            node.active = false;
            let ui_component: UIBase = node.getComponent(UIBase);
            ui_component?.onClose(param);
            console.log('[HideUI]', com);
        }
    }

    static open<T>(UIDefine: IUIDefine, param?: T, obj?: Open_Obj) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.open(UIDefine, param, obj);
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.open(UIDefine, param, obj);
                break;
            case UIType.Board:
                UIBoardMgr.Instance.open(UIDefine, param, obj);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                UIPromptMgr.Instance.open(UIDefine, param, obj);
                break;
            case UIType.CommonUI:
                UICommonMgr.Instance.open(UIDefine, param, obj);
                break;
        }
    }

    static close<T>(UIDefine: IUIDefine = null, param: T = null, obj?: Close_Obj) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.close(UIDefine, param, obj);
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.close(UIDefine, param, obj);
                break;
            case UIType.Board:
                UIBoardMgr.Instance.close(UIDefine, param, obj);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                UIPromptMgr.Instance.close(UIDefine, param, obj);
                break;
            case UIType.CommonUI:
                UICommonMgr.Instance.close(UIDefine, param, obj);
                break;
        }
    }

    static find(UIDefine: IUIDefine): UIBase {
        let ui: UIBase = null;
        switch (UIDefine.UIType) {
            case UIType.Form:
                ui = UIFormMgr.Instance.find(UIDefine);
                break;
            case UIType.Dialog:
                ui = UIDialogMgr.Instance.find(UIDefine);
                break;
            case UIType.Board:
                ui = UIBoardMgr.Instance.find(UIDefine);
                break;
            case UIType.Prompt:
            case UIType.TexasPreLoad:
                ui = UIPromptMgr.Instance.find(UIDefine);
                break;
            case UIType.CommonUI:
                ui = UICommonMgr.Instance.find(UIDefine);
                break;
            default:
                break;
        }
        return ui;
    }

    //无动画开启UI(暂未处理)
    OpenNoAnimation(UIDefine: IUIDefine, param: any = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.open(UIDefine, param, { animation: false });
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.open(UIDefine, param, { animation: false });
                break;
        }
    }

    //无动画关闭UI
    CloseNoAnimation(UIDefine: IUIDefine, param: any = null) {
        if (!UIDefine) return;
        switch (UIDefine.UIType) {
            case UIType.Form:
                UIFormMgr.Instance.close(UIDefine, param, { animation: false });
                break;
            case UIType.Dialog:
                UIDialogMgr.Instance.close(UIDefine, param, { animation: false });
                break;
        }
    }

    static closeAll() {
        UIFormMgr.Instance.closeAll();
        UIDialogMgr.Instance.closeAll();
        UIBoardMgr.Instance.closeAll();
        UIPromptMgr.Instance.closeAll();
        this.closeDialog();
    }

    static closeDialog() {
        if (Main.Dialog.childrenCount) {
            Main.Dialog.children[0].parent = Main.CacheUI;
        }
    }

    //////////////////////////////
    setComponent(component: UIBase) {
        if (~component.name.indexOf('<')) return;
        console.log('setComponent : ', component.name);
        this[component.name] = component;
    }

    getComponent<T>(component_name: string): T {
        return this[component_name] as T;
    }

    setComponentByName(name: string, component: cc.Component) {
        this[name] = component;
    }

    /////////////////////////////
}

(window as any).UIComponent = UIComponent;
//(window as any).UIFormMgr = UIFormMgr;
