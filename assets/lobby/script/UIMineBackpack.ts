//avatar:http://static.awanptesting.com/image-normal/20220310094704-gzJFs.png
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineBackpack extends cc.Component {
    public view = {};
    onLoad() {
        this.load_all_object(this.node);
        cc.log(this.view);
        this.setBackPack();
    }
    load_all_object(root: cc.Node): void {
        for (let i = 0; i < root.childrenCount; i++) {
            let child: cc.Node = root.children[i];
            this.view[root.children[i].name] = child;
            this.load_all_object(root.children[i]);
        }
    }
    setBackPack():void{
        let layout:cc.Node = this.view["Backpack_Layout"];
        let prefab:cc.Node = this.view["Backpack_Info"];
        let item:cc.Node = cc.instantiate(prefab);
        item.active = true;
        layout.addChild(item);
        layout.getComponent(cc.Layout).updateLayout();
        this.scheduleOnce(()=>{
            this.setScrollTop();
        })
    }
       /**
     * @description: 主要用来设置 下拉刷新--
     * @return {void}
     */    
        private setScrollTop():void{
            let Scrollheight = this.view["Backpack_Scrollview"].height;
            let contentHeight = this.view["Content"].height;
            cc.log("Scrollheight=", Scrollheight);
            cc.log("contentHeight=", contentHeight);
            if (contentHeight < Scrollheight) {
                let padding = this.view["Padding"];
                padding.height = Scrollheight - contentHeight + 10;
                cc.log("paddingHeight=", padding.height);
            }

            // //监听一下scroll事件
            let ItemPrefab0: cc.Node = this.view["ItemPrefab0"];
            let root: cc.Node = ItemPrefab0.getChildByName("root");
            this.view["Backpack_Scrollview"].on("scrolling", (e) => {
                let y = this.view["Content"].y;
                if (y < -100) {
                    //向上拉取 显示
                    ItemPrefab0.active = true;
                    root.getChildByName("arrow").active = true;
                    root.getChildByName("Text_1").active = true;
                    root.getChildByName("waiticon").active = false;
                }
                if (ItemPrefab0.active === true) {
                    if ((y ^ 0) === 0) {
                        root.getChildByName("arrow").active = false;
                        root.getChildByName("Text_1").active = false;
                        root.getChildByName("waiticon").active = true;
                        cc.tween(root.getChildByName("waiticon")).to(0.5,{angle:-360}).start();
                        this.scheduleOnce(() => {
                            root.getChildByName("waiticon").stopAllActions();
                            ItemPrefab0.active = false;
                        }, 0.5)
                    }
                }
            }, this)
        }
}
