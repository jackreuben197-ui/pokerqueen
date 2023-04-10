import List from "../../../common/List";
import ListEx from "../../../common/ListEx";
import SimpleNodePool from "../../../common/MyNodePool";
import TabsGroup from "../../../common/TabsGroup";
import { Tabs_Status, TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { WWW, Web_Club_Fund_ApplyList, Web_Club_Fund_OrderList, Web_Club_Player_Order_Record, Web_Club_Fund_Audit, API_CLUB_USER_WALLET, APIMessageRed_num } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";
import UIWalletApplyItem from "./UIWalletApplyItem";
import WalletModel from "./WalletModel";

//钱包类型
export enum WalletType {
    Personal = 0,//个人钱包
    Club = 1,//公会钱包
    Fund = 2,//公会基金
}
const { ccclass } = cc._decorator;

@ccclass
export default class UIWallet extends BaseFormPlus {

    protected _param: { wallet_type: number } = null;

    ///////////////////////////////////////
    $Pages: cc.Node = null;
    $Page0: cc.Node = null;
    $Page1: cc.Node = null;
    $Page2: cc.Node = null;


    //联盟币和USDT显示
    cc_Label$gc: cc.Label = null;
    cc_Label$us: cc.Label = null;

    //记录和详情 滚动列表容器
    $record_content: cc.Node = null;
    $changelog_content: cc.Node = null;
    $apply_content: cc.Node = null;


    $record_item: cc.Node = null;
    $changelog_item: cc.Node = null;
    $apply_item: cc.Node = null;//UIWalletApplyItem

    //0:充值记录 1:提现记录 2:转换记录
    record_type: number = 0;

    record_item_pool: SimpleNodePool = null;
    changelog_item_pool: SimpleNodePool = null;
    apply_item_pool: SimpleNodePool = null;


    $TopTabs: cc.Node = null;
    $OpTabs: cc.Node = null;
    $RecordTabs: cc.Node = null;

    $record_tags: cc.Node = null;

    main_request_quene = [];

    //记录数据
    record_datas = [];

    recharge_tags = null;
    exchange_tags = null;


    $red: cc.Node = null;

    //APIMessageRed_num

    //请求账户配置
    ReqAccountBean = {
        [WalletType.Personal]: [],
        [WalletType.Club]: [this.reqClubUserWallet, this.reqGoldChangeLog],
        [WalletType.Fund]: [this.reqClubFund, this.reqClubFundChangeLog],
    }
    //请求记录配置
    ReqRecordBean = {
        [WalletType.Personal]: null,
        [WalletType.Club]: this.reqClubRecord,
        [WalletType.Fund]: this.reqFundRecord,
    }


    top_tabs_group: TabsGroup = null;
    //op_tabs_group: TabsGroup = null;
    record_tabs_group: TabsGroup = null;


    protected lateLoad(): void {
        super.lateLoad();

        this.top_tabs_group = new TabsGroup(this.$TopTabs.children, this.top_tabs_click, this);
        this.record_tabs_group = new TabsGroup(this.$RecordTabs.children, this.record_tabs_click, this);

        this.$OpTabs.children.forEach((item, index) => {
            item["index"] = index;
            this.setButtonClick(item, this.op_tabs_click);
        })

        this.record_item_pool = new SimpleNodePool(this.$record_item);
        this.changelog_item_pool = new SimpleNodePool(this.$changelog_item);
        this.apply_item_pool = new SimpleNodePool(this.$apply_item);

        this.initEX();
    }

    //顶部标题点击
    private top_tabs_click(items: cc.Node[], index: number) {

        let status = Tabs_Status[index];
        items.forEach((item, index) => {
            let color = status[index] ? TextColor.Color1 : TextColor.Color3;
            item.children[0].color = cc.Color.BLACK.fromHEX(color);
            item.children[0].children[0].active = !!status[index];
        })
        this.$Pages.children.forEach((item, index) => {
            item.active = !!status[index];
        })
        switch (index) {
            case 0:
                //this.Op_Index = -1;
                this.change_log_list_ex.reset();
                this.reqAccount();
                break;
            case 1:
                this.clearRecordItems();
                this.record_datas = [];
                this.record_tabs_group.reset(0);
                break;
            case 2:
                this.clearApplyItems();
                this.reqApplyList();
                break;
        }

    }
    //充值和转换点击
    private op_tabs_click(button: cc.Button) {
        switch (button.node["index"]) {
            case 0://充值
                UIComponent.open(UIDefine.UIToRecharge,
                    {
                        type: 1,
                        walletType: this._param.wallet_type,
                        club_id: ClubCache.club_id,
                        club_name: ClubCache.club_name,
                        tribe_name: ClubCache.tribe_name,
                    });
                break;
            case 1://转换
                UIComponent.open(UIDefine.UIExchange, {
                    club_id: ClubCache.club_id,
                    club_name: ClubCache.club_name,
                    tribe_name: ClubCache.tribe_name,
                });
                break;
        }
    }
    //各种记录点击
    private record_tabs_click(items: cc.Node[], index: number) {

        let status = Tabs_Status[index];
        items.forEach((item, index) => {
            let on = status[index];
            item.getComponent(cc.Sprite).enabled = !!on;
            item.getChildByName("label").color = cc.Color.BLACK.fromHEX(on ? TextColor.Color7 : TextColor.Color3);
        })
        switch (index) {
            case 0:
                this.$record_tags.children.forEach((item, index) => {
                    item.getComponent(cc.Label).string = this.recharge_tags[index];
                })
                break;
            case 1:
                this.$record_tags.children.forEach((item, index) => {
                    item.getComponent(cc.Label).string = this.exchange_tags[index];
                })
                break;
        }
        this.reqRecord(index);
    }

    club_id: number;
    /**
     * 每次打开面板处理的内容
     * param {type: 0:个人钱包 1:公会钱包 2:公会基金}
     */
    onShow(param?: { wallet_type: WalletType }, fromUI?: cc.Node): void {

        super.onShow(param, fromUI);

        console.log("当前钱包类型:", param.wallet_type);

        GC.wallet.wallet_type = param.wallet_type;


        //根据类型判断哪种钱包
        switch (param.wallet_type) {
            case 0:
                this.ComFormTitle$title.setTitle("UIMine_WalletMy");
                this.$TopTabs.children[0].active = true;
                this.$TopTabs.children[1].active = true;
                this.$TopTabs.children[2].active = false;
                this.$TopTabs.getComponent(cc.Layout).spacingX = 220;
                break;
            case 1:
                this.ComFormTitle$title.setTitle("UIMine_WalletMy");
                this.$TopTabs.children[0].active = true;
                this.$TopTabs.children[1].active = true;
                this.$TopTabs.children[2].active = false;
                this.$TopTabs.getComponent(cc.Layout).spacingX = 220;
                break;
            case 2:
                this.ComFormTitle$title.setTitle("UIClub_FundDetail");
                this.$TopTabs.children[0].active = true;
                this.$TopTabs.children[1].active = true;
                this.$TopTabs.children[2].active = true;
                //this.root_layout.spacingX = 220;
                this.$TopTabs.getComponent(cc.Layout).spacingX = 0;
                break;
        }

        this.resetData();

        this.refreshRed()

        this.clearChangeLogItems();

        //this.Top_Index = 0;

        this.top_tabs_group.reset(0);

        this.showEX();

        //刷红点位置
        this.scheduleOnce(() => { this.$red.getComponent(cc.Widget).updateAlignment(); }, 0);

    }
    //刷新红点
    private refreshRed() {
        let data = APIMessageRed_num.Response.data;
        let hasRed: boolean = false;
        if (data) {
            data.forEach(obj => {
                if (obj.type == 2 && obj.num > 0) {
                    hasRed = true;
                }
            })
        }
        this.$red.active = hasRed;
    }
    private resetData() {
        this.recharge_tags = WalletModel.Instance.getTags(0);
        this.exchange_tags = WalletModel.Instance.getTags(1);
    }
    //请求公会玩家充值记录 order_type 1,2,4
    reqClubRecord(order_type: number) {

        WWW.Instance.CommonAPI(
            {
                body: {
                    "order_type": order_type,
                    "limit": 100,
                    "offset": 0
                },
                web_class: Web_Club_Player_Order_Record,
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.record_datas[order_type] = res;
                this.refreshRecord(res);
            },
            (res: any) => {

            }
        )
    }
    //请求公会基金充值记录 order_type 1,2,4
    reqFundRecord(order_type: number) {
        WWW.Instance.CommonAPI(
            {

                web_class: Web_Club_Fund_OrderList,

                body: {
                    "order_type": order_type,
                    "limit": 100,
                    "offset": 0
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.record_datas[order_type] = res;
                this.refreshRecord(res);
            },
            (res: any) => {

            }
        )
    }

    //刷新金币和USDT
    refreshGold() {
        //this.$Gold_Show.getChildByName("lbl_gold").getComponent(cc.Label).string = StringHelper.GetLongString(GC.wallet.Gold);
        //this.$USDT_Show.getChildByName("lbl_gold").getComponent(cc.Label).string = StringHelper.GetLongString(GC.wallet.USDT);
        this.cc_Label$gc.string = StringHelper.GetLongString(GC.wallet.Gold);
        this.cc_Label$us.string = StringHelper.GetLongString(GC.wallet.USDT);
    }
    //刷新change列表
    refreshChangeList(res) {

        let list = res?.data?.list || [];

        let list_len: number = list.length;

        this.clearChangeLogItems();

        this.$Page0.getChildByName("Null").active = list_len == 0;

        for (let i = 0; i < list_len; i++) {
            let data = list[i];
            let item = this.changelog_item_pool.GetNode();
            item.parent = this.$changelog_content;
            changeItem.init(data);
            this.setChildLabel(item, "bg/lbl_date", changeItem.create_time_MD);
            this.setChildLabel(item, "bg/lbl_content", changeItem.opName);
            this.setChildLabel(item, "bg/lbl_amount", changeItem.gold_after);
            this.setChildLabel(item, "bg/lbl_time", changeItem.create_time_HM);
            this.setChildLabel(item, "bg/lbl_change", changeItem.changeNum);
            this.setChildColor(item, "bg/lbl_change", changeItem.changeNumColor);
            this.setChildVisible(item, "bg/gc_icon", changeItem.gold_type == 1);
            this.setChildVisible(item, "bg/us_icon", changeItem.gold_type == 2);
        }
    }
    // src_type 来源 0-普通非游戏，1-来源德州玩法房间，2-来源MTT，3-来源牛仔
    getOpName(src_type, name, op_code) {
        let str = GC.language.getLocal(`OpCodeString_${op_code}`);
        if (src_type != 0) {
            str += ` ${name}`
        }
        return str;
    }


    //刷新记录列表
    refreshRecord(res) {

        let list = res?.data?.list || []

        let list_len: number = list.length;

        this.clearRecordItems();

        this.$Page1.getChildByName("Null").active = list_len == 0;

        for (let i = 0; i < list_len; i++) {
            let info = list[i];
            let gold_type: number = info.gold_type;//金币类型 1-金币 2-USDT
            let gold_num: number = info.gold_num;//数量
            let order_type: number = info.order_type;//充提转 订单类型 1，2，3
            //let apply_type: number = info.apply_type;//充提 状态
            let order_no: string = info.order_no;//订单号
            let create_time: string = info.create_time;//时间
            let status = info.status;// 1 充值|提现中 2 充值|提现完成 3 充值|提现失败
            let item = this.record_item_pool.GetNode();
            item.parent = this.$record_content;
            item.active = true;

            let status_des = null;
            //let status_num = null;
            let gold_op = order_type < 3 ? "+" : "-";
            switch (order_type) {
                case 1:
                    status_des = WalletModel.Instance.getRechargeStatusText(status);
                    break;
                case 2:
                    break;
                case 4:
                    status_des = WalletModel.Instance.Record_Exchange_Status[status];

                    break;
            }
            this.setChildLabel(item, "lbl_name", StringHelper.LengthNick(order_no, 8));
            this.setChildLabel(item, "lbl_gold", `${gold_op}${StringHelper.GetLongString(gold_num)}`);
            this.setChildLabel(item, "lbl_time", TimeHelper.UTCToLocal(create_time));
            this.setChildLabel(item, "lbl_status", status_des);
            this.setChildVisible(item, "icon_gc", gold_type == 1);
            this.setChildVisible(item, "icon_us", gold_type == 2);
            this.setChildVisible(item, "bg", i % 2 == 0);
        }
    }
    //刷新申请列表
    refreshApplyList(res) {

        let list = res?.data?.list || [];

        let list_len: number = list.length;

        this.clearApplyItems();

        this.$Page2.getChildByName("Null").active = list_len == 0;

        for (let i = 0; i < list_len; i++) {
            let data = list[i];
            let item = this.apply_item_pool.GetNode();
            item.parent = this.$apply_content;
            item.getComponent(UIWalletApplyItem).index = i;
            item.getComponent(UIWalletApplyItem).onShow({ data: data, own: this });
        }
    }

    ////////////////////////////////////////////////////
    //清理ChangeLog item
    clearChangeLogItems() {
        this.$changelog_content.children.forEach(item => {
            this.changelog_item_pool.BackNode(item);
        })
        this.$changelog_content.removeAllChildren();
        this.$Page0.getChildByName("Null").active = false;
    }

    //清理记录 item
    clearRecordItems() {
        this.$record_content.children.forEach(item => {
            this.record_item_pool.BackNode(item);
        })
        this.$record_content.removeAllChildren();
        this.$Page1.getChildByName("Null").active = false;
    }
    //清理Apply item
    clearApplyItems() {
        this.$apply_content.children.forEach(item => {
            this.apply_item_pool.BackNode(item);
        })
        this.$apply_content.removeAllChildren();
        this.$Page2.getChildByName("Null").active = false;
    }
    ////////////////////////////////////////////////////
    //请求公会钱包
    reqClubUserWallet(next) {
        WWW.Instance.CommonAPI(
            {
                web_class: API_CLUB_USER_WALLET,
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                let data = res.data;
                GC.wallet.Gold = data?.golds || 0;
                GC.wallet.USDT = data?.usdt || 0;

                GC.wallet.gold_to_usdt_rate = res.data.gold_to_usdt_rate;
                GC.wallet.usdt_to_gold_rate = res.data.usdt_to_gold_rate;

                this.refreshGold();
                //next?.call(this);
                this.change_log_list_ex.dropRequest();
            },
            (res: any) => {

            }
        )
    }
    //请求公会钱包变动
    reqGoldChangeLog(offset: number = 0) {
        let info = {
            limit: 10,
            offset: offset
        }
        LobbyControl.getInstance().reqGoldChangeLog(ClubCache.club_id, info).then(
            (res: any) => {
                //this.refreshChangeList(res);
                this.change_log_list_ex.refresh(res.data.list, res.data.total);

                //this.List$change_log.numItems = this.change_log_list_ex.offset;

            },
            (res) => {
                this.change_log_list_ex.error();
            }
        )
    }
    //请求公会基金
    reqClubFund(next) {
        let param = {
            club_random_id: ClubCache.random_id
        }
        UIClubModel.mInstance.reqClubFund(ClubCache.club_id, param).then(
            (res: any) => {
                let data = res.data;
                GC.wallet.Gold = data?.gold || 0;
                GC.wallet.USDT = data?.usdt || 0;
                this.refreshGold();
                //next.call(this);
                //this.reqClubFundChangeLog(0);
                this.change_log_list_ex.dropRequest();
            },
            (res) => {
            }
        )
    }
    //请求公会基金变动
    reqClubFundChangeLog(offset: number = 0) {
        let param = {
            limit: 10,
            offset: offset,
            club_random_id: ClubCache.random_id
        }
        UIClubModel.mInstance.reqClubFundChangeLog(ClubCache.club_id, param).then(
            (res: any) => {
                //this.refreshChangeList(res);
                this.change_log_list_ex.refresh(res.data.list, res.data.total);

                this.List$change_log.numItems = this.change_log_list_ex.offset;
            },
            (res) => {
                this.change_log_list_ex.error();
            }
        )
    }
    //请求账户
    reqAccount() {
        this.main_request_quene = this.ReqAccountBean[this.param.wallet_type].concat();
        this.executeQuene();
    }
    //请求公积金申请列表
    reqApplyList(next: Function = null) {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Club_Fund_ApplyList,

                body: {
                    "order_type": 0, //0-全部;1-充豆;2-提豆;4-转换
                    "limit": 100,
                    "offset": 0
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.refreshApplyList(res);
                next?.call(this);
            },
            (res: any) => {

            }
        )
    }

    //请求充提转换记录
    reqRecord(index: number) {
        let order_type = this.transformOrderType(index);
        if (this.record_datas[order_type]) {
            this.refreshRecord(this.record_datas[order_type]);
            return;
        }
        this.ReqRecordBean[this.param.wallet_type]?.call(this, order_type);
    }
    ///////////////////////////////////////////
    executeQuene() {
        if (this.main_request_quene.length) {
            let request = this.main_request_quene.shift();
            request.call(this, this.executeQuene);
        }
    }

    refuseClick(index: number) {
        console.log("refuseClick", index);
        let obj = {
            "order_no": Web_Club_Fund_ApplyList.Response.data.list[index].order_no,//订单号
            "audit_type": 2,//审计类型(audit_type):1-同意;2-拒绝
        }
        this.reqAudit(obj);
    }
    agreeClick(index: number) {
        console.log("agreeClick", index);
        let obj = {
            "order_no": Web_Club_Fund_ApplyList.Response.data.list[index].order_no,//订单号
            "audit_type": 1,//审计类型(audit_type):1-同意;2-拒绝
        }
        this.reqAudit(obj);
    }
    //审核同意和拒绝
    reqAudit(obj) {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Club_Fund_Audit,

                body: obj,

                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.reqApplyList(this.reqApplyReddot);
            },
            (res: any) => {

            }
        )
    }
    //请求申请红点
    reqApplyReddot() {
        WWW.Instance.CommonAPI(
            {
                web_class: APIMessageRed_num,

                body: { club_id: ClubCache.club_id },

                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                this.refreshRed();
            },
            (res: any) => {

            }
        )
    }

    // ordet_type转换 1充值 2提取 4转换
    transformOrderType(index: number): number {
        if (index == 0) return 1;
        if (index == 1) return 4;
        return 0;
    }
    //从其他页面回退执行
    reback() {
        // this._TopIndex = -8;
        // this.Top_Index = 0;
        this.top_tabs_group.reset(0);
    }

    /////////////////////////////////list///////////////////////////////
    private List$change_log: List = null;

    private change_log_list_ex: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.change_log_list_ex = new ListEx;
    }
    private showEX() {
        this.change_log_list_ex.init({
            list: this.List$change_log,
            nullNode: this.$Page0.getChildByName("Null"),
            this: this,
            request: this.ReqAccountBean[this.param.wallet_type][1]
        });
    }

    //////////////////////////////////滚动节点渲染///////////////////////
    render_changelog(node: cc.Node, index: number) {

        //console.log("index:>>>", index);
        let item_data = this.change_log_list_ex.data[index];
        changeItem.init(item_data);
        this.setChildLabel(node, "bg/lbl_date", changeItem.create_time_MD);
        this.setChildLabel(node, "bg/lbl_content", changeItem.opName);
        this.setChildLabel(node, "bg/lbl_amount", changeItem.gold_after);
        this.setChildLabel(node, "bg/lbl_time", changeItem.create_time_HM);
        this.setChildLabel(node, "bg/lbl_change", changeItem.changeNum);
        this.setChildColor(node, "bg/lbl_change", changeItem.changeNumColor);
        this.setChildVisible(node, "bg/gc_icon", changeItem.gold_type == 1);
        this.setChildVisible(node, "bg/us_icon", changeItem.gold_type == 2);
    }

}

let changeItem = {
    data: null,
    init(data) {
        changeItem.data = data;
    },
    get opName() {

        let str = "";
        //暂时纠错一下
        if (changeItem.data.op_code == "EXCHLOCK") {
            let r = i18nMgr.Get("OpCodeString_EXCHLOCK");
            if (r == "OpCodeString_EXCHLOCK") {
                r = i18nMgr.Get("OpCodeString_EXCHUNLOCK");
            }
            str = r;
        } else {
            str = GC.language.getLocal(`OpCodeString_${changeItem.data.op_code}`);
        }

        let after = changeItem.data.src_room_id > 0 ? ` · ${changeItem.data.src_room_id}` : "";

        switch (changeItem.data.src_type) {
            case 0:
                //desc.gameObject.SetActive(false);
                break;
            case 1:
                str += ` ${i18nMgr.Get("UITexasInfo_Texas")}${after}`;
                break;
            case 2:
                str += ` ${i18nMgr.Get("UITexasInfo_mtt")}${after}`;
                break;
            case 3:
                str += ` ${i18nMgr.Get("UIData_YGvXd5iXr_011")}${after}`;
                break;
        }
        return str;
    },
    get changeNum() {
        let change = changeItem.data.gold_change || changeItem.data.gold_lock_change;
        let op = change > 0 ? "+" : "";
        return op + StringHelper.GetLongString(changeItem.data.gold_change || changeItem.data.gold_lock_change);
    },
    get changeNumColor() {
        let change = changeItem.data.gold_change || changeItem.data.gold_lock_change;
        return change >= 0 ? TextColor.Color5 : TextColor.Color6;
    },
    get gold_after() {
        return StringHelper.GetLongString(changeItem.data.gold_after);
    },
    get create_time_HM() {
        return TimeHelper.getHM(new Date(changeItem.data.create_time).getTime() / 1000, ":");
    },
    get create_time_MD() {
        return TimeHelper.getMD(new Date(changeItem.data.create_time).getTime() / 1000);
    },
    get gold_type() {
        return changeItem.data.gold_type;
    }

}
