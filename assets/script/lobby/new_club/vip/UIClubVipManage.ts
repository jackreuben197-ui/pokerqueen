import SimpleNodePool from "../../../common/MyNodePool";
import { Member_Order_List, TextColor } from "../../../config/GameConfig";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Club_Agent_UserList, Web_Club_Agent_UserListCover, WWW } from "../../../net/https/WebRequest";
import ItemVipManage from "../../../new_lobby/vip/link/ItemVipManage";
import GGCombobox from "../../../ui/component/GGCombobox";
import GGSwitch from "../../../ui/component/GGSwitch";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipManage extends BaseFormPlus {
    //文本
    private Text_Switch: string = "隐藏当前线下玩家";
    private Text_NullTip: string = "暂无申请数据";
    private Text_Save: string = "保 存";
    ///////////////////////引用声明////////////////////////
    $ComBack: cc.Node = null;
    $TabsNode: cc.Node = null;
    $ItemVipManage: cc.Node = null;
    $ItemVipManageEdit: cc.Node = null;
    $Searcher1: cc.Node = null;
    $Searcher2: cc.Node = null;
    $Page0: cc.Node = null;
    $Page1: cc.Node = null;
    cc_ScrollView$Scroller1: cc.ScrollView = null;
    cc_ScrollView$Scroller2: cc.ScrollView = null;
    GGCombobox$Order: GGCombobox = null;
    cc_Label$Switch: cc.Label = null;
    cc_Label$NullTip1: cc.Label = null;
    cc_Label$Save: cc.Label = null;
    cc_Label$Total_Pl: cc.Label = null;
    cc_EditBox$Searcher1: cc.Label = null;
    cc_EditBox$Searcher2: cc.Label = null;
    $Save: cc.Node = null;

    GGSwitch$Follow: GGSwitch = null;

    ////////////////////////////////////////////////////

    item_member_pool: SimpleNodePool = null;
    item_member_edit_pool: SimpleNodePool = null;

    protected _param: { user_id: number };

    Tabs = ["下线成员", "编辑下线"];


    _title_status: number = -1;

    //combox index
    comSelectIndex: number = 0;

    //显示的成员列表
    show_member_list = null;

    //勾选列表
    select_indexs = [];

    protected lateLoad() {
        super.lateLoad();
        this.GGCombobox$Order.onOpen = this.Order_ComOpen.bind(this);
        this.GGCombobox$Order.onClose = this.Order_ComClose.bind(this);
        this.GGCombobox$Order.onSelect = this.Order_ComSelect.bind(this);
        this.item_member_pool = new SimpleNodePool(this.$ItemVipManage);
        this.item_member_edit_pool = new SimpleNodePool(this.$ItemVipManageEdit);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$ComBack, this.comBackClick);
        this.setButtonClick(this.$Searcher1.getChildByName("Btn_Search"), this.searchClick1);
        this.setButtonClick(this.$Searcher2.getChildByName("Btn_Search"), this.searchClick2);
        this.setButtonClick(this.$Save, this.saveClick);
        this.GGSwitch$Follow.clickObj = { click: this.followClick, self: this };
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        this.setTabs();
        this.refreshTexts();
        this.resetStatus();
        this.GGCombobox$Order.closeBox();
        this.GGCombobox$Order.bindList(Member_Order_List);
        this.cc_EditBox$Searcher1.string = "";
        this.refreshMemberList();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
    resetStatus() {
        this._title_status = -1;
        this.title_status = 0;
    }
    refreshMemberList(list: any[] = null, sort_type: number = 1) {
        this.clearScroller(this.cc_ScrollView$Scroller1, this.item_member_pool);
        if (!list) return;
        list.forEach((data, index) => {
            let item = this.item_member_pool.GetNode();
            item.parent = this.cc_ScrollView$Scroller1.content;
            item.getComponent(ItemVipManage).onShow({ data: data, index: index, sort_type: sort_type, parent: this });
        })
    }
    refreshMemberEditList(list: any[] = null) {
        this.clearScroller(this.cc_ScrollView$Scroller2, this.item_member_pool);
        if (!list) return;
        this.cc_Label$NullTip1.node.active = list.length == 0;
        this.$Save.active = !(list.length == 0);
        list.forEach((data, index) => {
            let item = this.item_member_pool.GetNode();
            item.parent = this.cc_ScrollView$Scroller2.content;
            item.getComponent(ItemVipManage).onShow({ data: data, index: index, sort_type: 0, hide_follow: this.GGSwitch$Follow.isOn, parent: this });
        })
    }
    clearScroller(scroller: cc.ScrollView, pool: SimpleNodePool) {
        scroller.content.children.forEach(item => {
            pool.BackNode(item);
        })
        scroller.content.removeAllChildren();
        //this.cc_Label$NullTip0.node.active = false;
        this.cc_Label$NullTip1.node.active = false;
        this.$Save.active = false;
    }
    private setTabs() {
        this.$TabsNode.children.forEach((item, index) => {
            item.getChildByName("Label").getComponent(cc.Label).string = i18nMgr.Get(this.Tabs[index]);
            item["index"] = index;
            this.setButtonClick(item, this.tabClick);
        })
    }
    private refreshTexts() {
        this.cc_Label$Switch.string = i18nMgr.Get(this.Text_Switch);
        this.cc_Label$NullTip1.string = i18nMgr.Get(this.Text_NullTip);
        this.cc_Label$Save.string = i18nMgr.Get(this.Text_Save);
    }
    //底层点击触发combobox组件关闭
    comBackClick() {
        this.GGCombobox$Order.closeBox();
        this.$ComBack.active = false;
    }

    tabClick(button: cc.Button) {
        let index = button.node["index"];
        this.title_status = index;
    }
    set title_status(value: number) {
        if (this._title_status == value) return;
        this._title_status = value;
        this.$TabsNode.children.forEach((item, index) => {
            this.tab_select(item, 0);
        });
        this.tab_select(this.$TabsNode.children[value], 1);
        //切换界面
        if (value == 0) {
            this.$Page0.active = true;
            this.$Page1.active = false;
            this.Order_ComSelect(0);
        } else {
            this.$Page0.active = false;
            this.$Page1.active = true;
            this.cc_EditBox$Searcher2.string = "";
            this.clearScroller(this.cc_ScrollView$Scroller2, this.item_member_pool);
            this.reqMemberList(Member_Order_List[0], this.cc_EditBox$Searcher2.string, true);
        }
    }
    get title_status(): number {
        return this._title_status;
    }
    //顶部页签切换
    tab_select(tab: cc.Node, on: number) {
        tab.getChildByName("Label").color = cc.Color.BLACK.fromHEX(on == 0 ? TextColor.Color1 : TextColor.Color2);
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
        this.comSelectIndex = index;
        this.$ComBack.active = false;
        let order_obj = Member_Order_List[index];
        this.cc_ScrollView$Scroller1.scrollToTop();
        this.reqMemberList(order_obj, this.cc_EditBox$Searcher1.string);
    }
    searchClick1() {
        this.Order_ComSelect(this.comSelectIndex);
    }
    searchClick2() {
        this.reqMemberList(Member_Order_List[0], this.cc_EditBox$Searcher2.string, true);
    }
    //条目点击的回调
    public onItemClick(index: number, switch_on: boolean) {
        this.select_indexs[index] = switch_on;
    }
    //保存点击
    private saveClick() {
        this.reqMemberSave();
    }
    private followClick() {
        let visible = !this.GGSwitch$Follow.isOn;
        this.cc_ScrollView$Scroller2.content.children.forEach(item => {
            item.getComponent(ItemVipManage).vislbleFollow(visible);
        });
    }

    //////////////////////////////////////////////请求
    // -> 请求成员列表
    reqMemberList(order_obj: any, search: string = "", edit: boolean = false) {
        //sort_type 排序类别(sort_type):1-输赢数;2-手数;3-服务费;4-最后登录时间
        //order_type 顺序类别(order_type):1-顺序;2-倒叙;
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Club_Agent_UserList,
                body: {
                    "club_random_id": ClubCache.random_id,
                    "club_id": ClubCache.club_id,
                    "search": search,
                    "user_id": this._param.user_id,
                    "sort_type": order_obj.sort_type,
                    "order_type": order_obj.order_type,
                    "limit": 20,
                    "offset": 0,
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                if (edit) {
                    this.refreshMemberEditList(res.data?.data);
                } else {
                    this.cc_Label$Total_Pl.string = res.data?.data?.length || 0;
                    this.refreshMemberList(res.data?.data, order_obj.sort_type);
                }
                this.show_member_list = res.data?.data;
                this.select_indexs = [];
            },
            (res: any) => {

            }
        )
    }

    // -> 请求保存
    reqMemberSave() {

        let body = {
            "club_id": ClubCache.club_id,
            "agent_id": this._param.user_id,
            "user_ids": []
        }
        this.select_indexs.forEach((boo: boolean, index: number) => {
            if (boo) {
                let member = this.show_member_list[index];
                body.user_ids.push(member.user_id);
            }
        })
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Club_Agent_UserListCover,
                body: body,
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.Toast("save success");
                this.reqMemberList(Member_Order_List[0], this.cc_EditBox$Searcher2.string, true);
            },
            (res: any) => {

            }
        )

    }



}
