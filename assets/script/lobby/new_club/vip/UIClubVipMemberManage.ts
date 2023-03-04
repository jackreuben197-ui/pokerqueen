import SimpleNodePool from "../../../common/MyNodePool";
import { Member_Order_List, TextColor } from "../../../config/GameConfig";
import ItemVipOffline from "../../../new_lobby/vip/link/ItemVipOffline";

import GGCombobox from "../../../ui/component/GGCombobox";

import BaseFormPlus from "../../../ui/form/BaseFormPlus";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipMemberManage extends BaseFormPlus {
    //文本


    ///////////////////////引用声明////////////////////////
    $ComBack: cc.Node = null;
    $ItemVipOffline: cc.Node = null;
    $Searcher1: cc.Node = null;


    cc_ScrollView$Scroller1: cc.ScrollView = null;
    cc_ScrollView$Scroller2: cc.ScrollView = null;
    GGCombobox$Order: GGCombobox = null;
    cc_Label$Switch: cc.Label = null;
    cc_Label$NullTip: cc.Label = null;

    cc_Label$Save: cc.Label = null;

    ////////////////////////////////////////////////////
    select_indexs = [];

    item_member_pool: SimpleNodePool = null;

    members = [
        { nick: "a1", id: 12, time: "2022-12-27T10:01:02Z", timeOrder: 1 },
        { nick: "b2", id: 34, time: "2022-12-27T10:02:02Z", timeOrder: 2 },
        { nick: "b3", id: 124, time: "2022-12-27T10:03:02Z", timeOrder: 3 },
        { nick: "b4", id: 84, time: "2022-12-27T10:04:02Z", timeOrder: 4 },
        { nick: "b5", id: 1129, time: "2022-12-27T10:05:02Z", timeOrder: 5 },
        { nick: "b6", id: 8, time: "2022-12-27T10:06:02Z", timeOrder: 6 },
        { nick: "b7", id: 722, time: "2022-12-27T10:07:02Z", timeOrder: 7 },
        { nick: "b8", id: 107, time: "2022-12-27T10:08:02Z", timeOrder: 8 },
        { nick: "b9", id: 44, time: "2022-12-27T10:09:02Z", timeOrder: 9 },
    ];
    _title_status: number = -1;

    protected lateLoad() {
        super.lateLoad();
        this.GGCombobox$Order.onOpen = this.Order_ComOpen.bind(this);
        this.GGCombobox$Order.onClose = this.Order_ComClose.bind(this);
        this.GGCombobox$Order.onSelect = this.Order_ComSelect.bind(this);
        this.item_member_pool = new SimpleNodePool(this.$ItemVipOffline);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$ComBack, this.comBackClick);
        this.setButtonClick(this.$Searcher1.getChildByName("Btn_Search"), this.searchClick1);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        this.refreshTexts();
        this.refreshMemberList(this.members);
        this.GGCombobox$Order.closeBox();
        this.GGCombobox$Order.bindList(Member_Order_List);
        this.Order_ComSelect(0);
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
    refreshMemberList(list: { nick: string, id: number, time: string, timeOrder: number }[]) {
        this.clearScroller(this.cc_ScrollView$Scroller1, this.item_member_pool);
        list.forEach((data, index) => {
            let item = this.item_member_pool.GetNode();
            item.parent = this.cc_ScrollView$Scroller1.content;
            //item.getComponent(ItemVipOffline).onShow({ data: data, index: index, switch: 1, parent: this });

            item.getComponent(ItemVipOffline).onShow({ data: data, index: index, sort_type: 1, parent: this });

            //data: data, index: index, sort_type: 0, hide_follow: this.GGSwitch$Follow.isOn, parent: this
        })
    }
    clearScroller(scroller: cc.ScrollView, pool: SimpleNodePool) {
        scroller.content.children.forEach(item => {
            pool.BackNode(item);
        })
        scroller.content.removeAllChildren();
    }
    private refreshTexts() {

    }
    //底层点击触发combobox组件关闭
    comBackClick() {
        this.GGCombobox$Order.closeBox();
        this.$ComBack.active = false;
    }
    //顶部页签切换
    tab_select(tab: cc.Node, on: number) {
        let color = on ? TextColor.Color2 : TextColor.Color1;
        tab.getChildByName("Label").color = cc.Color.BLACK.fromHEX(color);
        tab.getChildByName("Line").active = Boolean(on);
    }

    //排序面板打开
    Order_ComOpen() {
        this.$ComBack.active = true;
    }
    //排序面板关闭
    Order_ComClose() {
        this.$ComBack.active = false;
    }
    //排序面板选择
    Order_ComSelect(index: number) {
        this.$ComBack.active = false;
        //console.log(index);
        let item: any = Member_Order_List[index];
        if (item.order) {
            this.members.sort((a, b) => {
                return a.timeOrder - b.timeOrder;
            })
        } else {
            this.members.sort((a, b) => {
                return b.timeOrder - a.timeOrder;
            })
        }
        this.cc_ScrollView$Scroller1.scrollToTop();
        this.refreshMemberList(this.members);
    }

    searchClick1() {
        let search_value = this.$Searcher1.getChildByName("EditBox").getComponent(cc.EditBox).string;
        let temp = [];
        for (let member of this.members) {
            if (~member.id.toString().indexOf(search_value)) {
                temp.push(member);
            }
        }

        if (temp.length) {
            this.refreshMemberList(temp);
        } else {
            this.refreshMemberList(this.members);
        }
    }
    //条目点击的回调
    public onItemClick(index: number, switch_on: boolean) {
        if (switch_on) {
            this.select_indexs.push(index);
        } else {
            let r_index = this.select_indexs.indexOf(index);
            if (r_index > -1) this.select_indexs.splice(r_index, 1);
        }
        console.log("this.select_indexs:", this.select_indexs);
    }


}
