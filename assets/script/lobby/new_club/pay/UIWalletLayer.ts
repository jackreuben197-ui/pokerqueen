import SimpleNodePool from "../../../common/MyNodePool";
import { Tabs_Status, Text_Colors } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import { WWW, Web_Club_Fund_ApplyList, Web_Club_Fund_OrderList, Web_Club_Player_Order_Record, Web_Club_Fund_Audit } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import Data from "../../labor/script/Data";
import { UIClubModel } from "../../labor/UIClubModel";
import UIWalletApplyItem from "./UIWalletApplyItem";
import WalletModel from "./WalletModel";

//钱包类型
export enum WalletType {
    Personal = 0,//个人钱包
    Club = 1,//公会钱包
    Fund = 2,//公会基金
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIWalletLayer extends BaseFormPlus {

    protected _param: { wallet_type: number } = null;


    ///////////////////////////////////////
    $Pages: cc.Node = null;
    $Page0: cc.Node = null;
    $Page1: cc.Node = null;
    $Page2: cc.Node = null;


    //金币和USDT显示
    $Gold_Show: cc.Node = null;
    $USDT_Show: cc.Node = null;

    //记录和详情 滚动列表容器
    $record_content: cc.Node = null;
    $changelog_content: cc.Node = null;
    $apply_content: cc.Node = null;


    $record_item: cc.Node = null;
    $changelog_item: cc.Node = null;
    $apply_item: cc.Node = null;//UIWalletApplyItem

    //充值,提现,转换 按钮
    $Recharge: cc.Node = null;
    $WithDraw: cc.Node = null;
    $Exchange: cc.Node = null;

    //0:充值记录 1:提现记录 2:转换记录
    record_type: number = 0;

    record_item_pool: SimpleNodePool = null;
    changelog_item_pool: SimpleNodePool = null;
    apply_item_pool: SimpleNodePool = null;


    $TopTabs: cc.Node = null;
    $OpTabs: cc.Node = null;
    $RecordTabs: cc.Node = null;


    //顶层页签位置（"账户", "记录", "申请"）
    _TopIndex: number = -8;
    //操作页签位置（"充 值", "提 现", "转 换"）
    _OpIndex: number = -8;
    //记录页签位置（"充值记录", "提现记录", "转换记录"）
    _RecordIndex: number = -8;

    main_request_quene = [];

    //记录数据
    record_datas = [];

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


    protected lateLoad(): void {
        super.lateLoad();

        this.$TopTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = WalletModel.Instance.Top_Tab_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.topTabClick);
        })

        this.$OpTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = WalletModel.Instance.Op_Tab_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.opTabClick);
        })
        this.$RecordTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = WalletModel.Instance.Record_Tab_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.recordTabClick);
        })

        this.record_item_pool = new SimpleNodePool(this.$record_item);
        this.changelog_item_pool = new SimpleNodePool(this.$changelog_item);
        this.apply_item_pool = new SimpleNodePool(this.$apply_item);
    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
    }
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
                this.$TopTabs.getComponent(cc.Layout).spacingX = 90;
                break;
        }

        this.resetTabsIndexs();
        this.Top_Index = 0;
        //this.Op_Index = -1;
    }
    resetTabsIndexs() {
        this._TopIndex = -8;
        this._OpIndex = -8;
        this._RecordIndex = -8;
    }

    //请求公会玩家充值记录 order_type 1,2,4
    reqClubRecord(order_type: number) {

        WWW.Instance.CommonAPI(
            0, {
            "order_type": order_type,
            "limit": 100,
            "offset": 0
        }, Web_Club_Player_Order_Record).then(
            (res: any) => {
                this.record_datas[order_type] = res;
                this.refreshRecord(res);
            },
            err => {

            }
        )
    }
    //请求公会基金充值记录 order_type 1,2,4
    reqFundRecord(order_type: number) {

        WWW.Instance.CommonAPI(
            ClubCache.club_id,
            {
                "order_type": order_type,
                "limit": 100,
                "offset": 0
            },
            Web_Club_Fund_OrderList).then(
                (res: any) => {
                    this.record_datas[order_type] = res;
                    this.refreshRecord(res);
                },
                err => {

                }
            );
    }

    //刷新金币和USDT
    refreshGold() {
        this.$Gold_Show.getChildByName("lbl_gold").getComponent(cc.Label).string = StringHelper.GetLongString(GC.wallet.Gold);
        this.$USDT_Show.getChildByName("lbl_gold").getComponent(cc.Label).string = StringHelper.GetLongString(GC.wallet.USDT);
    }
    //刷新change列表
    refreshChangeList(res) {

        let list = res?.data?.list || [];

        let list_len: number = list.length;

        this.clearChangeLogItems();

        this.$Page0.getChildByName("Des_Null").active = list_len == 0;

        for (let i = 0; i < list_len; i++) {
            let data = list[i];
            let item = this.changelog_item_pool.GetNode();
            item.parent = this.$changelog_content;
            changeItem.init(data);
            this.setChildLabel(item, "item_up/lbl_date", changeItem.create_time_MD);
            this.setChildLabel(item, "item_down/lbl_name", changeItem.opName);
            this.setChildLabel(item, "item_down/lbl_amount", changeItem.gold_after);
            this.setChildLabel(item, "item_down/lbl_time", changeItem.create_time_HM);
            this.setChildLabel(item, "item_down/lbl_change", changeItem.changeNum);
            this.setChildLabelColor(item, "item_down/lbl_change", changeItem.changeNumColor);
            this.setChildVisible(item, "item_down/img_gold1", changeItem.gold_type == 1);
            this.setChildVisible(item, "item_down/img_gold2", changeItem.gold_type == 2);
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

        this.$Page1.getChildByName("Des_Null").active = list_len == 0;

        for (let i = 0; i < list_len; i++) {
            let info = list[i];
            let gold_type: number = info.gold_type;//金币类型 1-金币 2-USDT
            let gold_num: number = info.gold_num;//数量
            let order_type: number = info.order_type;//充提转 订单类型 1，2，3
            let apply_type: number = info.apply_type;//充提 状态
            let order_no: string = info.order_no;//订单号
            let create_time: string = info.create_time;//时间
            let status = info.status;// 1 充值|提现中 2 充值|提现完成 3 充值|提现失败
            let item = this.record_item_pool.GetNode();
            item.parent = this.$record_content;
            item.active = true;

            let status_des = null;
            let status_num = null;

            let gold_ext = gold_type == 1 ? "" : "USDT";
            let gold_op = order_type < 3 ? "+" : "-";

            switch (order_type) {
                case 1:
                    status_des = WalletModel.Instance.Record_Recharge_Status[status];
                    status_num = "";
                    break;
                case 2:
                    status_des = WalletModel.Instance.Record_Withdraw_Status[status];
                    status_num = "";
                    break;
                case 4:
                    status_des = WalletModel.Instance.Record_Exchange_Status[status];
                    status_num = "";
                    break;
            }
            this.setChildLabel(item, "lbl_name", order_no);
            this.setChildLabel(item, "lbl_dec", WalletModel.Instance.Record_Dec[order_type]);
            this.setChildLabel(item, "lbl_gold", `${gold_op}${StringHelper.GetLongString(gold_num)} ${gold_ext}`);
            this.setChildLabel(item, "lbl_time", TimeHelper.UTCToLocal(create_time));
            this.setChildLabel(item, "status/lbl_status", status_des);
            this.setChildLabel(item, "status/lbl_status_num", status_num);


        }
    }
    //刷新申请列表
    refreshApplyList(res) {

        let list = res?.data?.list || [];

        let list_len: number = list.length;

        this.clearApplyItems();

        this.$Page2.getChildByName("Des_Null").active = list_len == 0;

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
        this.$Page0.getChildByName("Des_Null").active = false;
    }

    //清理记录 item
    clearRecordItems() {
        this.$record_content.children.forEach(item => {
            this.record_item_pool.BackNode(item);
        })
        this.$record_content.removeAllChildren();
        this.$Page1.getChildByName("Des_Null").active = false;
    }

    //清理Apply item
    clearApplyItems() {
        this.$apply_content.children.forEach(item => {
            this.apply_item_pool.BackNode(item);
        })
        this.$apply_content.removeAllChildren();
        this.$Page2.getChildByName("Des_Null").active = false;
    }
    ////////////////////////////////////////////////////
    //请求公会钱包
    reqClubUserWallet(next) {
        let info = {

        }
        LobbyControl.getInstance().reqClubUserWallet(ClubCache.club_id, info).then(
            (res: any) => {
                let data = res.data;
                GC.wallet.Gold = data?.golds || 0;
                GC.wallet.USDT = data?.usdt || 0;

                GC.wallet.gold_to_usdt_rate = res.data.gold_to_usdt_rate;
                GC.wallet.usdt_to_gold_rate = res.data.usdt_to_gold_rate;

                this.refreshGold();
                next.call(this);
            },
            (res) => {
            }
        )
    }
    //请求公会钱包变动
    reqGoldChangeLog(next) {
        let info = {
            limit: 100,
            offset: 0
        }
        LobbyControl.getInstance().reqGoldChangeLog(ClubCache.club_id, info).then(
            (res) => {
                this.refreshChangeList(res);
                next.call(this);
            },
            (res) => {
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
                next.call(this);
            },
            (res) => {
            }
        )
    }
    //请求公会基金变动
    reqClubFundChangeLog(next) {
        let param = {
            limit: 100,
            offset: 0,
            club_random_id: ClubCache.random_id
        }
        UIClubModel.mInstance.reqClubFundChangeLog(ClubCache.club_id, param).then(
            (res) => {
                this.refreshChangeList(res);
                next.call(this);
            },
            (res) => {
            }
        )
    }
    //请求账户
    reqAccount() {
        this.main_request_quene = this.ReqAccountBean[this.param.wallet_type].concat();
        this.executeQuene();
    }
    //请求公积金申请列表
    reqApplyList() {
        WWW.Instance.CommonAPI(
            ClubCache.club_id,
            {
                "order_type": 0, //0-全部;1-充豆;2-提豆;3-转换
                "limit": 100,
                "offset": 0
            },
            Web_Club_Fund_ApplyList).then(
                (res: any) => {
                    this.refreshApplyList(res);
                },
                err => {

                }
            );
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

    set Top_Index(index: number) {
        if (this._TopIndex == index) return;
        this._TopIndex = index;
        let status = Tabs_Status[index];
        this.$TopTabs.children.forEach((item, index) => {
            item.children[0].color = cc.Color.BLACK.fromHEX(Text_Colors[status[index]]);
            item.children[0].children[0].color = cc.Color.BLACK.fromHEX(Text_Colors[status[index]]);
        })
        this.$Pages.children.forEach((item, index) => {
            item.active = !!status[index];
        })
        switch (index) {
            case 0:
                this.Op_Index = -1;
                //this.clearChangeLogItems();
                this.reqAccount();
                break;
            case 1:
                this.clearRecordItems();
                this.record_datas = [];
                this._RecordIndex = -8;
                this.Record_Index = 0;
                break;
            case 2:
                this.clearApplyItems();
                this.reqApplyList();
                break;
        }
    }
    get Top_Index(): number {
        return this._TopIndex;
    }

    set Op_Index(index: number) {
        //if (this._OpIndex == index) return;
        this._OpIndex = index;
        let status = Tabs_Status[index];
        this.$OpTabs.children.forEach((item, index) => {
            item.children[0].active = !!status[index];
            item.children[1].active = !!!status[index];
            item.children[2].color = cc.Color.BLACK.fromHEX(Text_Colors[status[index] ? 0 : 1]);
        })
        let order_type = this.transformOrderType(index);
        switch (index) {
            case 0:
            case 1:
                UIComponent.open(UIDefine.UIPayLayer, { type: order_type, walletType: this._param.wallet_type });
                break;
            case 2:
                UIComponent.open(UIDefine.UIChangeLayer);
                break;
        }
    }
    get Record_Index(): number {
        return this._RecordIndex;
    }
    set Record_Index(index: number) {
        if (this._RecordIndex == index) return;
        this._RecordIndex = index;
        let status = Tabs_Status[index];
        this.$RecordTabs.children.forEach((item, index) => {
            item.children[0].opacity = status[index] ? 255 : 76;
            item.children[0].getComponent(cc.Label).fontSize = status[index] ? 46 : 40;
        })
        this.reqRecord(index);
    }
    get Op_Index(): number {
        return this._OpIndex;
    }

    //topTabs 点击
    topTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.Top_Index = index;
    }
    opTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.Op_Index = index;
    }
    recordTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.Record_Index = index;
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
            ClubCache.club_id,
            obj,
            Web_Club_Fund_Audit).then(
                res => {
                    this.reqApplyList();
                },
                res => {
                }
            )
    }
    // ordet_type转换 1充值 2提取 4转换
    transformOrderType(index: number): number {
        if (index == 0) return 1;
        if (index == 1) return 2;
        if (index == 2) return 4;
        return 0;
    }
    //从其他页面回退执行
    reback() {
        this._TopIndex = -8;
        this.Top_Index = 0;
    }
}
///////////////////////////

let changeItem = {
    data: null,
    init(data) {
        changeItem.data = data;
    },
    get opName() {
        let str = GC.language.getLocal(`OpCodeString_${changeItem.data.op_code}`);
        if (changeItem.data.src_type != 0) {
            str += ` ${changeItem.data.name}`
        }
        return str;
    },
    get changeNum() {
        return StringHelper.GetLongString(changeItem.data.gold_change || changeItem.data.gold_lock_change);
    },
    get changeNumColor() {
        return changeItem.data.changeNum > 0 ? "#3BE1F5" : "#FFCC00";
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
