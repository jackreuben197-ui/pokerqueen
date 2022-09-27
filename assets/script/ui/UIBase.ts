
import { IUIDefine } from "../define/EIDefine";
import AdapterComponent from "../funcomponent/AdapterComponent";
const { ccclass, property } = cc._decorator;

@ccclass

export default class UIBase extends cc.Component {

    public param: any;

    private view: any = {};

    static load_all_objects_duration: number = 0;

    show_animation: boolean = false;

    close_animation: boolean = false;

    protected onLoad() {
        !this.UIDefine || this.UIDefine.DisAdaptScreen || this.node.addComponent(AdapterComponent);
        if (this.UIDefine) window[this.UIDefine.Name] = this;
        this.lateLoad();
        this.regiterTouchEvents();
    }

    onShow(param?: any) {
        this.param = param;
        this.UIDefine && cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);
        this.regiterDispatchEvent();
    }

    onClose(param?: any) {
        this.UIDefine && cc.log("::", this.UIDefine.Name, "onClose()");
        this.stopAllThings();
        this.unregiterDispatchEvent();
        this.lateClose(param);
    }

    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {

    }
    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
        //Dispatcher.on();
    }
    /**
     * 注销广播事件
     */
    protected unregiterDispatchEvent() {
        //Dispatcher.off();
    }

    protected lateLoad() {
        this.load_all_object(this.node);
    }

    protected lateClose(param?: any) {

    }

    /**
     * 停止所有 动作，包括 tween ,update，等
     */
    protected stopAllThings() {

    }

    get UIDefine(): IUIDefine {
        return this.constructor["UIDefine"];
    }

    /**
     * 通过节点名字获取节点 或者 通过 节点名字 + 组件类型 获取节点上的组件
     * @param name 
     * @component 组件类型
     * @returns 
     */
    public getChildNodeOrComponent<T extends cc.Component | cc.Node>(name: string, component?: { prototype: T }): T {
        let node = this.view[name];
        return component ? (node?.getComponent(component)) : node;
    }

    /**
     * 保证节点名字在根节点下唯一性 最好不要取名view
     * @param root 
     * @param path 
     * @param 获取节点下的组件的方式 root.$Sprite--->root.$Button---直接获取
     */
    load_all_object(root: cc.Node): void {
        // root.children.forEach(child => {
        //     this.view[child.name] = child;
        //     this.load_all_object(child);
        // })
        for (let i = 0; i < root.childrenCount; i++) {
            let child: cc.Node = root.children[i];
            //console.log("child", child);
            //@ts-ignore
            // child._components.forEach(nodeComponent => {
            //     let name = this._getComponentName(nodeComponent);
            //     if (name !== "Widget") {
            //         name = `$${name}`;
            //         child[name] = nodeComponent;
            //     }
            // });
            this.view[root.children[i].name] = child;
            this.load_all_object(root.children[i]);
        }
    }
    /**
     * 获取组件名字
     * @param {cc.Component} component 
     */
    _getComponentName(component: any): string {
        return component.name.match(/<.*>$/)[0].slice(1, -1);
    }

}
