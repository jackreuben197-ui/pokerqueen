import BaseForm from "../ui/form/BaseForm";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineSetting extends BaseForm {
    ///public view = {};
    // onLoad() {
    //     this.load_all_object(this.node);
    //     this.registerEvent();
    // }
    // load_all_object(root: cc.Node): void {
    //     for (let i = 0; i < root.childrenCount; i++) {
    //         let child: cc.Node = root.children[i];
    //         this.view[root.children[i].name] = child;
    //         this.load_all_object(root.children[i]);
    //     }
    // }

    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        cc.log("UIMineSetting - regiterTouchEvents")
        // let backBtn: cc.Node = this.getChildNodeOrComponent("Back_Btn");
        // backBtn.on(cc.Node.EventType.TOUCH_END, this.touchBackBtn, this);

        // let childs = this.getChildNodeOrComponent<cc.Node>("Layout").children;
        // childs.forEach((element: cc.Node) => {
        //     element.on(cc.Node.EventType.TOUCH_START, this.itemTouchStart, this);
        //     element.on(cc.Node.EventType.TOUCH_END, this.itemTouchEnd, this);
        // })
    }

    // private registerEvent(): void {
    //     let backBtn: cc.Node = this.view["Back_Btn"];
    //     backBtn.on(cc.Node.EventType.TOUCH_END, this.touchBackBtn, this);

    //     let childs = this.view["Layout"].children;
    //     childs.forEach((element: cc.Node) => {
    //         element.on(cc.Node.EventType.TOUCH_START, this.itemTouchStart, this);
    //         element.on(cc.Node.EventType.TOUCH_END, this.itemTouchEnd, this);
    //     })
    // }
    protected touchBackBtn(e: cc.Event.EventTouch): void {

    }
    protected itemTouchStart(e: cc.Event.EventTouch): void {

        let item: cc.Node = e.target
        //点击item的时候将 Text_Left  Text_Right arrow 节点变成 #DDBA82
        let left: cc.Node = item.getChildByName("Text_Left");
        let right: cc.Node = item.getChildByName("Text_Right");
        let arrow: cc.Node = item.getChildByName("arrow");
        left.color = new cc.Color().fromHEX("#DDBA82");
        right.color = new cc.Color().fromHEX("#DDBA82");
        arrow.color = new cc.Color().fromHEX("#DDBA82");
    }
    protected itemTouchEnd(e: cc.Event.EventTouch): void {
        let item: cc.Node = e.target
        let left: cc.Node = item.getChildByName("Text_Left");
        let right: cc.Node = item.getChildByName("Text_Right");
        let arrow: cc.Node = item.getChildByName("arrow");
        left.color = new cc.Color().fromHEX("#FFFFFF");
        right.color = new cc.Color().fromHEX("#FFFFFF");
        arrow.color = new cc.Color().fromHEX("#FFFFFF");
    }
}
