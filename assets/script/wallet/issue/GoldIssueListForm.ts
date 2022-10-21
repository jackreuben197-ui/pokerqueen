import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import GC from "../../frame/GameControl";
import { APIOrgClubGold, Web_Club_Issue_Gold } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import GoldIssueListItem from "./GoldIssueListItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/issue/GoldIssueListForm')
export default class GoldIssueListForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private list: List = null;

    private goldNum: cc.Label = null;
    private searchEdit: cc.EditBox = null;
    private searchFlag: cc.Node = null;

    lateLoad() {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.list = this.getChildNodeOrComponent("list", List);
        this.goldNum = this.getChildNodeOrComponent("goldNum", cc.Label);
        this.searchEdit = this.getChildNodeOrComponent("searchEdit", cc.EditBox);
        this.searchFlag = this.getChildNodeOrComponent("searchFlag");
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.searchFlag, this.clickSearch);
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Club_Issue_Gold.USER_LIST: {
                this.updateList();
            } break;
        }
    }

    onShow(param?: any): void {
        super.onShow(param);
        this.comFormTitle.initData("UITitle_jijin_fafang", this);

        this.initView();
        GC.data.wallet.issue.reqUsers();
    }

    initView() {
        this.searchEdit.string = ""
        this.updateGold();
    }

    updateGold() {
        this.setText(this.goldNum, Math.floor(APIOrgClubGold.Response.data.gold) / 100)
    }

    updateList() {
        this.list.numItems = GC.data.wallet.issue.list.length
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(GoldIssueListItem);
        item.initData(GC.data.wallet.issue.list[index])
    }

    clickSearch() {
        let str = this.searchEdit.string.trim();
        if (str) {
            GC.data.wallet.issue.searchUser(str);
        }
    }
}