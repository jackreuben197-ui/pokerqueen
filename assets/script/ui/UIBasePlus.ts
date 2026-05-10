import BaseComponent from '../frame/base/BaseComponent';
import LanguageManager from '../frame/manager/LanguageManager';
import { ResManager } from '../manager/ResManager';
import CCTools from '../tools/CCTools';
import UIBase from './UIBase';
import UIComponent from './UIComponent';
import { UICommonMgr } from './UIMgr';
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBasePlus extends UIBase {
    [key: string]: any;

    /**
     * 需要声明的节点的命名规则 cc_Node$ABC cc_Sprite$ABC GG$ABC
     */
    protected override load_all_object(root: cc.Node): void {
        root.children.forEach(child => {
            if (~child.name.indexOf('$')) {
                let cls = child.name.split('$')[0].replace('_', '.');
                if (cls == '') {
                    this[child.name] = child;
                } else {
                    this[child.name] = child.getComponent(cls);
                }
            }
            this.load_all_object(child);
        });
    }

    protected override lateLoad(): void {
        super.lateLoad();
        if (this.name) UIComponent.Instance.setComponent(this);
    }
}
