import { userInfo } from "os";
import SimpleNodePool from "../../../common/MyNodePool";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import UserInfoData from "../../../frame/data/user/UserInfoData";
import GC from "../../../frame/GameControl";
import { WebClubAgentAdd, WebClubAgentList, WebWww } from "../../../net/https/WebRequest";
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
    $Center: cc.Node = null;
    //cc_Label$Des_Null: cc.Label = null;
    $null: cc.Node = null;
    ///////////////////////////////////
    Item_Pool: SimpleNodePool = null;
    //选中的条目索引
    private select_index = -1;

    private list: any[] = null;


    protected _param: { user_id: number };

    protected lateLoad() {
        super.lateLoad();
        this.Item_Pool = new SimpleNodePool(this.$ItemAgentLink);
    }
    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$Back, this.backClick);
        this.setButtonClick(this.$Button_Cancel, this.cancelClick);
        this.setButtonClick(this.$Button_Commit, this.commitClick);
    }

    onShow(param: any) {
        super.onShow(param);
        this.cc_ScrollView$Scroller.scrollToTop();
        this.select_index = -1;
        this.clearList();
        this.reqAgentList();
    }

    refreshList(res) {

        this.list = res.data?.data;

        this.$null.active = !this.list?.length;

        if (this.list?.length) {
            this.list.forEach((child, index) => {
                let item = this.Item_Pool.GetNode();
                item.parent = this.cc_ScrollView$Scroller.content;
                item.getComponent(ItemAgentLink).onShow({ data: child, index: index, own: this });
            });
        }

        // this.select_indexs = [];
        // this.clearList();
        // this.testList.forEach((data, index) => {
        //     let item = this.getItem();
        //     item.parent = this.cc_ScrollView$Scroller.content;
        //     item.getComponent(ItemAgentLink).onShow({ data: data, index: index, parent: this });
        // })
    }
    clearList() {
        this.cc_ScrollView$Scroller.content.children.forEach(item => {
            this.Item_Pool.BackNode(item);
        })
        this.cc_ScrollView$Scroller.content.removeAllChildren();
    }

    //取出item
    private getItem() {
        //if (this.Item_Pool.length) return this.Item_Pool.shift();
        //return cc.instantiate(this.$ItemAgentLink);
    }

    //////////////////////////////////////////////点击
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

        if (this.select_index == -1) {

            return;
        }

        UIComponent.close(this.UIDefine);

        this.reqAgentAdd();

    }
    //条目点击的回调
    public onItemClick(index: number, switch_on: boolean) {
        if (switch_on) {

            if (this.select_index > -1) {
                this.cc_ScrollView$Scroller.content.children[this.select_index].getComponent(ItemAgentLink).switch = false;
            }
            this.select_index = index;
        } else {
            this.select_index = -1;
        }
    }
    //////////////////////////////////////////////请求
    // -> 请求贵宾列表
    reqAgentList() {
        WebWww.Instance.CommonAPI(
            {
                web_class: WebClubAgentList,
                body: {
                    "club_random_id": ClubCache.random_id,
                    "search": "",
                    "limit": 20,
                    "offset": 0
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.refreshList(res);
            },
            (res: any) => {

            }
        )
    }
    // -> 请求绑定贵宾
    reqAgentAdd() {

        let user: any = this.list[this.select_index];
        WebWww.Instance.CommonAPI(
            {
                web_class: WebClubAgentAdd,
                body: {
                    "user_id": this._param.user_id,
                    "club_id": ClubCache.club_id,
                    "agent_id": user.user_id
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                //this.refreshList(res);
                this.post('refresh_vip_ui')
                UIComponent.Instance.Toast("成功绑定贵宾");
            },
            (res: any) => {

            }
        )
    }
}
