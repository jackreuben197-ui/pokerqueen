import { stringify } from "querystring";
import SimpleNodePool from "../../../common/MyNodePool";
import TabsGroup from "../../../common/TabsGroup";
import { UIDownSelectorParam } from "../../../common/UIDownSelector";
import { GameConfig, Member_Order_List, Tabs_Status, TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { WebOrgMemberList, WebClubAgentUserList, WebClubAgentUserListCover, WebWww } from "../../../net/https/WebRequest";
import ItemVipOffline from "../../../new_lobby/vip/link/ItemVipOffline";

import GGCombobox from "../../../ui/component/GGCombobox";
import GGSwitch from "../../../ui/component/GGSwitch";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { UIClubModel } from "../../labor/UIClubModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipOffline extends BaseFormPlus {
    //文本
    //private Text_Switch: string = "Hide current offline players";
    ///////////////////////引用声明////////////////////////

    $Top: cc.Node = null;

    $down_list: cc.Node = null;

    cc_Label$total_people: cc.Label = null;

    cc_Label$down_list: cc.Label = null;

    $TopTabs: cc.Node = null;
    $Btn_Searcher1: cc.Node = null;
    $Btn_Searcher2: cc.Node = null;
    $Page0: cc.Node = null;
    $Page1: cc.Node = null;
    cc_ScrollView$Scroller1: cc.ScrollView = null;
    cc_ScrollView$Scroller2: cc.ScrollView = null;

    cc_Label$Switch: cc.Label = null;
    cc_Label$Save: cc.Label = null;

    cc_EditBox$Searcher1: cc.Label = null;
    cc_EditBox$Searcher2: cc.Label = null;
    $Save: cc.Node = null;

    GGSwitch$Follow: GGSwitch = null;

    $ItemVipOffline: cc.Node = null;

    ////////////////////////////////////////////////////

    item_member_pool: SimpleNodePool = null;

    protected _param: { user_id: number };

    //combox index
    downSelectIndex: number = 0;

    //显示的成员列表
    show_member_list = null;

    //勾选列表
    select_indexs = [];

    top_tabs_group: TabsGroup;

    //记录当前线下成员
    current_offlines: any = null;

    ids: any = null;

    protected lateLoad() {
        super.lateLoad();
        this.item_member_pool = new SimpleNodePool(this.$ItemVipOffline);
        this.top_tabs_group = new TabsGroup(this.$TopTabs.children, this.onTopTabClick, this);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$down_list, this.onClickDownlist);
        this.setButtonClick(this.$Btn_Searcher1, this.searchClick1);
        this.setButtonClick(this.$Btn_Searcher2, this.searchClick2);
        this.setButtonClick(this.$Save, this.saveClick);
        this.GGSwitch$Follow.clickObj = { click: this.followClick, self: this };
    }

    //param from 样式
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.downSelectIndex = -1;
        this.$Top.active = param.from == 0;
        this.cc_Label$total_people.string = "-";
        this.$Page0.getComponent(cc.Widget).top = param.from == 0 ? 202 : 0;
        this.top_tabs_group.reset();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }
    refreshOfflineMemberList(list: any[] = null) {
        this.clearScroller(this.cc_ScrollView$Scroller1, this.item_member_pool);
        if (!list) return;
        list.forEach((data, index) => {
            let item = this.item_member_pool.GetNode();
            item.parent = this.cc_ScrollView$Scroller1.content;
            item.getComponent(ItemVipOffline).index = index;
            item.getComponent(ItemVipOffline).onShow({ data: data });
        })
    }
    refreshMemberEditList(list: any[] = null) {
        this.clearScroller(this.cc_ScrollView$Scroller2, this.item_member_pool);
        if (!list) return;
        let count = 0;
        list.forEach((data, index) => {
            let checked = this.checkUserInOfflines(data.user_id);
            if (this.GGSwitch$Follow.isOn && checked) {
                return true;
            }
            count++;
            let item = this.item_member_pool.GetNode();
            item.parent = this.cc_ScrollView$Scroller2.content;
            //item.getComponent(ItemVipOffline).onShow({ data: data, index: index, sort_type: 0, hide_follow: this.GGSwitch$Follow.isOn, parent: this });
            item.getComponent(ItemVipOffline).index = index;
            item.getComponent(ItemVipOffline).onShow(
                {
                    data: data,
                    edit_obj: {
                        checked: checked,
                        own: this
                    }
                }
            )
        })

        this.$Save.active = count > 0;
    }

    checkUserInOfflines(id: number) {
        if (this.current_offlines?.length) {
            for (let user of this.current_offlines) {
                if (user.user_id == id) return true;
            }
        }
        return false;
    }


    searchClick1() {
        this.reqVipOfflineMemberList(this.downSelectIndex, this.cc_EditBox$Searcher1.string);
    }
    searchClick2() {
        this.reqMemberList(this.cc_EditBox$Searcher2.string);
    }



    //////////////////////////////////////////////请求

    //请求公会内所有普通成员列表
    reqMemberList(search: string = "") {

        WebWww.Instance.CommonAPI(
            {
                web_class: WebOrgMemberList,
                body: {
                    "club_random_id": ClubCache.random_id,
                    "club_id": ClubCache.club_id,
                    "search": search,
                    "user_type": 1,
                    "sort_type": 4,
                    "order_type": 2,
                    "limit": 20,
                    "offset": 0,
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {

                this.refreshMemberEditList(res.data?.data);
            },
            (res: any) => {

            }
        )
    }

    // -> 请求贵宾下线成员列表
    reqVipOfflineMemberList(index: number, search: string = "") {
        //sort_type 排序类别(sort_type):1-输赢数;2-手数;3-服务费;4-最后登录时间
        //order_type 顺序类别(order_type):1-顺序;2-倒叙;
        let order_obj = Member_Order_List[index];
        WebWww.Instance.CommonAPI(
            {
                web_class: WebClubAgentUserList,
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

                this.cc_Label$total_people.string = res.data?.data?.length || 0;
                this.refreshOfflineMemberList(res.data?.data);
                if (search == "") {
                    this.current_offlines = res.data?.data || [];
                    this.ids = [];
                    this.current_offlines.forEach(item => {
                        this.ids.push(item.user_id);
                    })
                }
                //this.show_member_list = res.data?.data;
                //this.select_indexs = [];
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
            "user_ids": this.ids
        }

        WebWww.Instance.CommonAPI(
            {
                web_class: WebClubAgentUserListCover,
                body: body,
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                UIComponent.Instance.Toast("save success");
                //this.reqMemberList(Member_Order_List[0], this.cc_EditBox$Searcher2.string, true);
            },
            (res: any) => {

            }
        )

    }

    //顶部标签点击切换响应
    onTopTabClick(items: cc.Node[], index: number) {
        let status_list = Tabs_Status[index];
        items.forEach((item, index) => {
            let status = status_list[index];
            item.getChildByName("lbl_show").color = status ? cc.Color.BLACK.fromHEX(TextColor.Color7) : cc.Color.BLACK.fromHEX(TextColor.Color3);
            item.getChildByName("line").active = status == 1;
        })
        //////////////////////////////////
        if (index == 0) {
            this.$Page0.active = true;
            this.$Page1.active = false;
            this.cc_EditBox$Searcher1.string = "";
            this.downSelectIndex = -8;
            this.downListSelect(0);
        } else {
            this.$Page0.active = false;
            this.$Page1.active = true;
            this.cc_EditBox$Searcher2.string = "";
            this.clearScroller(this.cc_ScrollView$Scroller2, this.item_member_pool);
            this.reqMemberList();
        }
    }
    //排序面板选择
    downListSelect(index: number) {
        if (this.downSelectIndex == index) return;
        this.downSelectIndex = index;
        this.cc_ScrollView$Scroller1.scrollToTop();
        //this.setDownListLabel(this.downList_contents[index]);
        this.cc_Label$down_list.string = i18nMgr.Get(Member_Order_List[index].show);
        this.clearScroller(this.cc_ScrollView$Scroller1, this.item_member_pool);
        this.reqVipOfflineMemberList(index);
    }

    clearScroller(scroller: cc.ScrollView, pool: SimpleNodePool) {
        scroller.content.children.forEach(item => {
            pool.BackNode(item);
        })
        scroller.content.removeAllChildren();
        this.$Save.active = false;
    }
    //排序种类选择
    onSortSelect(index: number) {
        this.downListSelect(index);
    }
    //选择器点击
    onClickDownlist() {
        UIComponent.open<UIDownSelectorParam>(UIDefine.UIDownSelector, {
            this: this,
            select_texts: Member_Order_List,
            confirm_text: "CommitOK",
            confirm_click: this.onSortSelect,
            select: this.downSelectIndex
        })
    }

    // 编辑项选中和取消
    public onToggleCheck(checked: boolean, user_id: number) {
        //this.select_indexs[index] = switch_on;
        this.ids?.length || (this.ids = []);
        if (checked) {
            this.ids.push(user_id);
        } else {
            this.ids.splice(this.ids.indexOf(user_id), 1);
        }
    }
    //保存点击
    private saveClick() {
        this.reqMemberSave();
    }
    private followClick() {
        this.refreshMemberEditList(WebOrgMemberList.Response.data?.data);
    }
}
