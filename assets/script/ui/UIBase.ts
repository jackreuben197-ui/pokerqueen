import AdapterComponent from "../AdapterComponent";
import { IUIDefine } from "../define/EIDefine";
const { ccclass, property } = cc._decorator;

@ccclass

export default class UIBase extends cc.Component {

    protected param: any;

    private view: any = {};

    static load_all_objects_duration: number = 0;

    protected onLoad() {

        !this.UIDefine || this.UIDefine.DisAdaptScreen || this.node.addComponent(AdapterComponent);
        this.lateLoad();
        this.regiterTouchEvents();
    }

    onShow(param: any = null) {
        this.param = param;
        this.UIDefine && cc.log("::", this.UIDefine.Name, "onShow()", "param:", param);

    }

    onClose(param: any = null) {
        this.UIDefine && cc.log("::", this.UIDefine.Name, "onClose()");
        this.stopAllTweens();
        this.lateClose(param);
    }

    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {

    }

    protected lateLoad() {
        let start_time = new Date().getTime();
        this.load_all_object(this.node, "");
        UIBase.load_all_objects_duration += new Date().getTime() - start_time;
        cc.log("load_all_object 总消耗时间(s):", new Date().getTime(),UIBase.load_all_objects_duration);
    }

    protected lateClose(param: any = null) {

    }

    /**
     * 停止所有tweens
     */
    protected stopAllTweens() {

    }

    get UIDefine(): IUIDefine {
        return this.constructor["UIDefine"];
    }

    /**
     * 通过节点名字索引获取节点
     * @param name 
     * @returns 
     */
    public getChildNode(name: string): cc.Node {
        return this.view[name];
    }

    /**
     * 保证节点名字在根节点下唯一性
     * @param root 
     * @param path 
     */
    private load_all_object(root: cc.Node, path: string) {
        for (let i = 0; i < root.childrenCount; i++) {
            this.view[root.children[i].name] = root.children[i];
            this.load_all_object(root.children[i], path + root.children[i].name + "/");
        }
    }



}
