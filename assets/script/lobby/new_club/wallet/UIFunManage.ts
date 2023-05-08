
import List from "../../../common/List";
import ListEx from "../../../common/ListEx";
import TabsGroup from "../../../common/TabsGroup";
import { Tabs_Status, TextColor } from "../../../config/GameConfig";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { WWW } from "../../../net/https/WebRequest";
import { APIOrgMemberList } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import FunMemberItem from "./FunMemberItem";


//跳转充值界面
const { ccclass } = cc._decorator;

@ccclass
export default class UIFunManage extends BaseFormPlus {

    $top_tabs: cc.Node = null;

    $rank_tabs: cc.Node = null;

    $balance: cc.Node = null;

    cc_Label$members: cc.Label = null;

    cc_Label$sort_label: cc.Label = null;

    $sort_box: cc.Node = null;
    $sort_arrow: cc.Node = null;


    $btn_recycle: cc.Node = null;
    $btn_give: cc.Node = null;


    cc_EditBox$searcher: cc.EditBox = null;

    $search_click: cc.Node = null;

    $null: cc.Node = null;

    top_tabs_group: TabsGroup = null;
    user_type_tabs_group: TabsGroup = null;

    sort_texts = ["", "UIClub_UCSort", "UIClub_GCSort"];
    sort_arrow_scale = [-1, -1, 1];

    sort_index: number;


    user_type: number = 0;//0-所有;1-普通;3-管理员;4-代理;

    sort_type: number = 5;//1-输赢数;2-手数;3-服务费;4-最后登陆时间;5-按金币

    order_type: number = 2;//1-顺序;2-倒叙

    data: { club_id: number, random_id: number, club_members: number } = null;

    templateInfos: any[] = null;

    ////////////////////////////////////

    protected lateLoad(): void {
        super.lateLoad();
        this.activeBack = false;
        this.top_tabs_group = new TabsGroup(this.$top_tabs.children, this.top_tabs_click, this);
        this.user_type_tabs_group = new TabsGroup(this.$rank_tabs.children, this.user_type_tabs_click, this);
        this.initEX();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.$sort_box, this.onClickSortBox);
        this.setButtonClick(this.$search_click, this.onClickSearch);

        this.setButtonClick(this.$btn_recycle, this.onClickRecycle);
        this.setButtonClick(this.$btn_give, this.onClickGive);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node): void {

        super.onShow(param, fromUI, sceneUI);
        this.data = param;
        this.top_tabs_group.reset();
        this.user_type_tabs_group.reset();
        //this.refreshSortBox(0);
        this.cc_Label$members.string = `${param?.club_members}`;

        this.templateInfos = [];
        this.clearList();
        this.listEx.reset();

        this.refreshGiveRecycleBtn();
    }

    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        this.listEx.dropRequest();
    }

    private refreshGiveRecycleBtn() {

        this.setButtonInteractable(this.$btn_recycle, this.templateInfos.length > 0);
        this.setButtonInteractable(this.$btn_give, this.templateInfos.length > 0);
        this.setChildColor(this.$btn_recycle, "label", this.templateInfos.length > 0 ? TextColor.Color1 : TextColor.Color3);
        this.setChildColor(this.$btn_give, "label", this.templateInfos.length > 0 ? TextColor.Color1 : TextColor.Color3);

    }

    //刷新排序文本
    private refreshSortBox(gold_type: number, order_type: number) {

        this.order_type = order_type;

        this.cc_Label$sort_label.string = i18nMgr.Get(this.sort_texts[gold_type]);

        this.$sort_arrow.scaleY = this.sort_arrow_scale[order_type];

    }

    private reqMemberList(offset: number = 0) {

        WWW.Instance.CommonAPI(
            {
                web_class: APIOrgMemberList,
                body: {
                    club_random_id: this.data.random_id,
                    club_id: this.data.club_id,
                    search: this.cc_EditBox$searcher.string,
                    user_type: this.user_type_tabs_group.select > 1 ? this.user_type_tabs_group.select + 1 : this.user_type_tabs_group.select,
                    sort_type: this.sort_type,
                    order_type: this.order_type,
                    gold_type: this.top_tabs_group.select + 1,
                    limit: 10,
                    offset: offset,
                }
            }
        ).then(
            (res: any) => {

                if (offset == 0) {
                    this.clearList();
                }

                this.listEx.refresh(res.data.data, res.data.total);

            },
            (res: any) => {

            }
        )

    }

    private showNull(boo: boolean) {
        this.$null.active = boo;
    }
    //顶部标题点击
    private top_tabs_click(items: cc.Node[], index: number) {

        let status = Tabs_Status[index];
        items.forEach((item, index) => {
            let opacity = status[index] ? 255 : 102;
            item.children[0].opacity = opacity;
            item.children[0].children[0].active = !!status[index];
        })
        // this.$Pages.children.forEach((item, index) => {
        //     item.active = !!status[index];
        // })
        switch (index) {
            case 0:
                this.refreshBalance(1);
                this.refreshSortBox(1, 2);
                break;
            case 1:
                this.refreshBalance(2);
                this.refreshSortBox(2, 2);
                break;
        }

        if (this.top_block.active) {

        } else {
            this.resetRequest();
        }
    }

    //身份级别点击
    private user_type_tabs_click(items: cc.Node[], index: number) {

        let status = Tabs_Status[index];
        items.forEach((item, index) => {
            let opacity = status[index] ? 255 : 102;
            item.children[0].opacity = opacity;
            item.getComponent(cc.Sprite).enabled = !!status[index];
        })

        if (this.top_block.active) {

        } else {
            this.resetRequest();
        }
    }

    //刷新Balance
    private refreshBalance(gold_type: number) {
        this.setChildVisible(this.$balance, "icon/uc", gold_type == 1);
        this.setChildVisible(this.$balance, "icon/gc", gold_type == 2);
        this.setChildLabel(this.$balance, "coin", StringHelper.GetLongString(gold_type == 1 ? GC.wallet.Gold : GC.wallet.USDT));
    }


    //排序盒点击
    onClickSortBox() {
        this.refreshSortBox(this.top_tabs_group.select + 1, +!(this.order_type - 1) + 1);
        this.resetRequest();
    }
    //搜索点击
    onClickSearch() {
        this.resetRequest();
    }

    resetRequest() {
        this.templateInfos = [];
        this.listEx.reset();
        this.listEx.dropRequest();
        this.refreshGiveRecycleBtn();
    }

    //回收点击
    onClickRecycle() {

    }
    //发放点击
    onClickGive() {

    }

    //////////////////////////////////

    private List$member: List = null;

    private listEx: ListEx = null;


    private clearList() {

        this.List$member.content.removeAllChildren();

        this.showNull(false);
    }

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.List$member,
            nullNode: this.$null,
            this: this,
            request: this.reqMemberList
        });
    }
    //////////////////////////////////滚动节点渲染///////////////////////
    render_item(node: cc.Node, index: number) {

        let item_data = this.listEx.data[index];

        let check = this.isCheckByIndex(index);

        node.getComponent(FunMemberItem).onShow({ data: item_data, index: index, check: check, handler: this });

    }

    isCheckByIndex(index: number) {
        return this.templateInfos.indexOf(index) > -1;
    }


    item_click(index: number, check: boolean) {

        //console.log(index, check);

        if (check) {
            this.templateInfos.push(index);
        } else {
            this.templateInfos.splice(this.templateInfos.indexOf(index), 1);
        }

        console.log(this.templateInfos);

        this.refreshGiveRecycleBtn();
    }

}
