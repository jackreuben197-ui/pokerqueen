//avatar:http://static.awanptesting.com/image-normal/20220310094704-gzJFs.png
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineSetting extends cc.Component {
    public view = {};
    onLoad() {
        this.load_all_object(this.node);
        cc.log(this.view);
        //绑定事件
        this.registerEvent();
    }
    load_all_object(root: cc.Node): void {
        for (let i = 0; i < root.childrenCount; i++) {
            let child: cc.Node = root.children[i];
            this.view[root.children[i].name] = child;
            this.load_all_object(root.children[i]);
        }
    }
    private registerEvent():void{
        let backBtn:cc.Node = this.view["Back_Btn"];
        backBtn.on(cc.Node.EventType.TOUCH_END,this.touchBackBtn,this);

        let childs = this.view["Layout"].children;
        childs.forEach((element:cc.Node)=>{
            element.on(cc.Node.EventType.TOUCH_START,this.itemTouchStart,this);
            element.on(cc.Node.EventType.TOUCH_END,this.itemTouchEnd,this);
        })
    }
    protected touchBackBtn(e:cc.Event.EventTouch): void {
        cc.log("touch "+e.target.name);
    }
    protected itemTouchStart(e:cc.Event.EventTouch): void {
        cc.log("touch "+e.target.name);
        let item:cc.Node = e.target
        //点击item的时候将 Text_Left  Text_Right arrow 节点变成 #DDBA82
        let left:cc.Node = item.getChildByName("Text_Left");
        let right:cc.Node = item.getChildByName("Text_Right");
        let arrow:cc.Node = item.getChildByName("arrow");
        left.color = new cc.Color().fromHEX("#DDBA82");
        right.color = new cc.Color().fromHEX("#DDBA82");
        arrow.color = new cc.Color().fromHEX("#DDBA82");
    }
    protected itemTouchEnd(e:cc.Event.EventTouch): void {
        cc.log("touch "+e.target.name);
        let item:cc.Node = e.target
        let left:cc.Node = item.getChildByName("Text_Left");
        let right:cc.Node = item.getChildByName("Text_Right");
        let arrow:cc.Node = item.getChildByName("arrow");
        left.color = new cc.Color().fromHEX("#FFFFFF");
        right.color = new cc.Color().fromHEX("#FFFFFF");
        arrow.color = new cc.Color().fromHEX("#FFFFFF");
    }
}
