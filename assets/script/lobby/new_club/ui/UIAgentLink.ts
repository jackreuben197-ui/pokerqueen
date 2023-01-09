import UIBase from "../../../ui/UIBase";
import UIBasePlus from "../../../ui/UIBasePlus";
import UIComponent from "../../../ui/UIComponent";
import ItemAgentLink from "./ItemAgentLink";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIAgentLink extends UIBasePlus {
    ///////////////////////////////////
    $Back: cc.Node = null;
    $Button_Cancel: cc.Node = null;
    $Button_Commit: cc.Node = null;
    $ItemAgentLink: cc.Node = null;
    cc_ScrollView$Scroller: cc.ScrollView = null;
    ///////////////////////////////////
    Item_Pool: cc.Node[] = [];

    //选中的条目索引
    private select_indexs = [];

    testList = [
        { nick: "a" },
        { nick: "b" },
        { nick: "b" },
        { nick: "b" },
        { nick: "b" },
        { nick: "b" },
        { nick: "b" },
        { nick: "b" },
        { nick: "b" },
    ];


    protected lateLoad() {
        super.lateLoad();
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$Back, this.backClick);
        this.setButtonClick(this.$Button_Cancel, this.cancelClick);
        this.setButtonClick(this.$Button_Commit, this.commitClick);
    }

    onShow() {

        super.onShow();
        this.cc_ScrollView$Scroller.scrollToTop();
        this.refreshList();

    }
    refreshList() {
        this.select_indexs = [];
        this.clearList();
        this.testList.forEach((data, index) => {
            let item = this.getItem();
            item.parent = this.cc_ScrollView$Scroller.content;
            item.getComponent(ItemAgentLink).onShow({ data: data, index: index, parent: this });
        })
    }
    clearList() {
        this.cc_ScrollView$Scroller.content.children.forEach(item => {
            this.backItem(item);
        })
        this.cc_ScrollView$Scroller.content.removeAllChildren();
    }

    //取出item
    private getItem() {
        if (this.Item_Pool.length) return this.Item_Pool.shift();
        return cc.instantiate(this.$ItemAgentLink);
    }
    //放回item
    private backItem(item) {
        this.Item_Pool.push(item);
    }

    ///////////////////点击
    //背景点击
    private backClick() {
        UIComponent.close(this.UIDefine);
    }
    //取消点击
    private cancelClick() {
        UIComponent.close(this.UIDefine);
    }
    //提交点击
    private commitClick() {
        UIComponent.close(this.UIDefine);
        //发送请求
        console.log("select_index:", this.select_indexs);
    }
    //条目点击的回调
    public onItemClick(index: number, switch_on: boolean) {
        if (switch_on) {
            if (this.select_indexs.length) {
                let pre_index = this.select_indexs.shift();
                this.cc_ScrollView$Scroller.content.children[pre_index].getComponent(ItemAgentLink).switch = false;
            }
            this.select_indexs.push(index);
        } else {
            this.select_indexs = [];
        }
    }
}
