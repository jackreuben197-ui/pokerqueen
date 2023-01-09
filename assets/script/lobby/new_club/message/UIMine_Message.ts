import ComFormTitle from "../../../common/ComFormTitle";
import List from "../../../common/List";
import GC from "../../../frame/GameControl";
import { i18nMgr } from "../../../i18n/i18nMgr";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import { LobbyControl } from "../../control/LobbyControl";
import UIMessageItem from "./UIMessageItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Message extends BaseFormPlus {

    @property(List)
    list: List = null;
    private _search = null;
    private _offset: number = 0;
    private _reqing: boolean = false;
    private _reqEnd: boolean = false;
    private _list: Array<any> = [];
    private _total: number = 0

    _oldIndex: number = null;

    _searchData: any = null;

    //消息来源的序列
    index: number = 0;

    ComFormTitle$title: ComFormTitle = null;
    $lbl_notShow: cc.Node = null;
    cc_ScrollView$Scroller: cc.ScrollView = null;


    protected lateLoad(): void {
        super.lateLoad();
    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        this.index = param?.index ?? 0;

        this.ComFormTitle$title.title_label.string = i18nMgr.Get(GC.message.Option_Text[this.index]);

        this.reqDataAgain(this.index);
    }

    async reqDataAgain(index) {
        this.cc_ScrollView$Scroller.scrollToTop();
        this._offset = 0;
        this._total = 0;
        this._list = [];
        // this._list.length = 0;
        this._reqing = false;
        this._reqEnd = false;
        this._oldIndex = index;
        this.dealData(index)
    }
    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(UIMessageItem);
        item.initData(this._list[index]);
    }
    scrollingCB = async (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset()
            let isDown = cur.y >= max.y;
            if (isDown && !this._reqing && !this._reqEnd) {
                this.dealData(this._oldIndex)
            }
        }
    }

    async dealData(index) {
        this._reqing = true;
        this.reqUpInfo(index, (res) => {
            this._reqing = false;

            let info_list = res.data?.list || [];

            this.$lbl_notShow.active = info_list.length == 0;

            info_list.forEach(element => {
                this._list.push(element);
            });  //分页的时候使用的
            //总条目
            this._total = res.data.total;

            this.list.numItems = this._list.length;
            this._offset = this._list.length;
            this._reqEnd = this._list.length == this._total;

            // this.list.numItems = this._list.length;
            // this._offset = this._list.length;
            // this._reqEnd = this._list.length == this._total;
        });
        // await UIClubModel.mInstance.APIOrgClubMember(data.random_id, this._offset, 10, this._search);
        // let _data: any = APIOrgClubMember.Response.data
    }

    reqUpInfo(index, cb) {
        let info = {
            msg_type: GC.message.MessageType[index],//消息类型:1-bag,2-club,3-money,4-system,5-tribe
            limit: 10,//条目
            offset: this._offset,//开始下标。例子（offset=0，limit=10，0-9。）
        }
        LobbyControl.getInstance().reqMessageList(info).then(
            (res) => {
                // this.SetItemInfo(res);
                // this.refreshListView(index, res);
                cb?.(res);
            },
            (res) => {
            }
        )
    }


}
