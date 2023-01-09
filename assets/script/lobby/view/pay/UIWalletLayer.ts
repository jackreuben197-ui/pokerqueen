import ComFormTitle from "../../../common/ComFormTitle";
import { Tabs_Status, Text_Colors } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import { Web_Club_Fund_ApplyList, Web_Club_Fund_OrderList, Web_Club_Player_Order_Record } from "../../../net/https/WebRequest";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";
import UIWalletApplyItem from "./UIWalletApplyItem";

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

    //panel_accout: cc.Node = null;
    //panel_record: cc.Node = null;

    lbl_no: cc.Node = null;//无记录
    lbl_no2: cc.Node = null;//无数据

    //let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item1");
    //panel_item1: cc.Node = this.getChildNodeOrComponent("panel_item1");
    //panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item2");

    //金币 货币 
    //panel_gold_up: cc.Node = null;
    //USDT 货币
    //panel_gold_down: cc.Node = null;



    // record_content: cc.Node = null;
    // detail_content: cc.Node = null;


    ///////////////////////////////////////
    $Pages: cc.Node = null;
    $Page1: cc.Node = null;
    $Page2: cc.Node = null;


    //金币和USDT显示
    $Gold_Show: cc.Node = null;
    $USDT_Show: cc.Node = null;

    //记录和详情 滚动列表容器
    $record_content: cc.Node = null;
    $detail_content: cc.Node = null;


    $record_item: cc.Node = null;
    $detail_item: cc.Node = null;
    UIWalletApplyItem$Item: UIWalletApplyItem = null;

    //充值,提现,转换 按钮
    $Recharge: cc.Node = null;
    $WithDraw: cc.Node = null;
    $Exchange: cc.Node = null;

    //0:充值记录 1:提现记录 2:转换记录
    record_type: number = 0;

    record_item_pool = [];
    detail_item_pool = [];

    record_dec = ["", "充值数量", "提现数量", "兑换数量"];
    record_recharge_status = ["", "充值中", "充值成功", "充值失败"];
    record_withdraw_status = ["", "提现中", "提现成功", "提现失败"];
    record_exchange_status = ["获取数量", "获取数量", "获取数量", "获取数量"];

    $TopTabs: cc.Node = null;
    $OpTabs: cc.Node = null;
    $RecordTabs: cc.Node = null;


    Top_Tab_Text = ["账户", "记录", "申请"];
    Op_Tab_Text = ["充 值", "提 现", "转 换"];
    Record_Tab_Text = ["充值记录", "提现记录", "转换记录"];

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
            item.getChildByName("lbl_show").getComponent(cc.Label).string = this.Top_Tab_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.topTabClick);
        })

        this.$OpTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = this.Op_Tab_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.opTabClick);
        })
        this.$RecordTabs.children.forEach((item, index) => {
            item.getChildByName("lbl_show").getComponent(cc.Label).string = this.Record_Tab_Text[index];
            item["index"] = index;
            this.setButtonClick(item, this.recordTabClick);
        })
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
        this.Op_Index = -1;
    }
    resetTabsIndexs() {
        this._TopIndex = -8;
        this._OpIndex = -8;
        this._RecordIndex = -8;
    }

    //请求公会玩家充值记录 order_type 1,2,4
    reqClubRecord(order_type: number) {

        UIClubModel.mInstance.CommonAPI(
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

        UIClubModel.mInstance.CommonAPI(
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
    //刷新记录列表
    refreshRecord(res) {

        let list = res?.data?.list || []

        let list_len: number = list.length;

        this.$Page1.getChildByName("Des_Null").active = list_len == 0;

        this.clearRecordItems();

        for (let i = 0; i < list_len; i++) {
            let info = list[i];
            let gold_type: number = info.gold_type;//金币类型 1-金币 2-USDT
            let gold_num: number = info.gold_num;//数量
            let order_type: number = info.order_type;//充提转 订单类型 1，2，3
            let apply_type: number = info.apply_type;//充提 状态
            let order_no: string = info.order_no;//订单号
            let create_time: string = info.create_time;//时间
            let status = info.status;// 1 充值|提现中 2 充值|提现完成 3 充值|提现失败
            let item = this.getRecordItem();
            item.parent = this.$record_content;
            item.active = true;

            let status_des = null;
            let status_num = null;

            let gold_ext = gold_type == 1 ? "" : "USDT";
            let gold_op = order_type < 3 ? "+" : "-";

            switch (order_type) {
                case 1:
                    status_des = this.record_recharge_status[status];
                    status_num = "";
                    break;
                case 2:
                    status_des = this.record_withdraw_status[status];
                    status_num = "";
                    break;
                case 3:
                    status_des = this.record_exchange_status[status];
                    status_num = "";
                    break;
            }
            this.setChildLabel(item, "lbl_name", order_no);
            this.setChildLabel(item, "lbl_dec", this.record_dec[order_type]);
            this.setChildLabel(item, "lbl_gold", `${gold_op}${gold_num}${gold_ext}`);
            this.setChildLabel(item, "lbl_time", TimeHelper.UTCToLocal(create_time));
            this.setChildLabel(item, "status/lbl_status", status_des);
            this.setChildLabel(item, "status/lbl_status_num", status_num);
        }
    }

    setChildLabel(node: cc.Node, label: string, text: string) {
        cc.find(label, node).getComponent(cc.Label).string = text;
    }
    //清理记录
    clearRecordItems() {
        this.$record_content.children.forEach(item => {
            this.backRecordItem(item);
        })
        this.$record_content.removeAllChildren();
        console.log("清理所有记录");
    }

    // refreshListView(data) {
    //     let records = data.data.list;
    //     let len = records.length;
    //     let lbl_no: cc.Node = this.getChildNodeOrComponent("lbl_no");
    //     lbl_no.active = len == 0;
    //     // 有数据 刷新列表
    //     let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item1");
    //     let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
    //     scrollView.content.removeAllChildren();
    //     for (let i = 0; i < len; i++) {
    //         let _cloneNode = cc.instantiate(panel_item);
    //         _cloneNode.x = 0;
    //         _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
    //         _cloneNode.parent = scrollView.content;

    //         let info = records[i];

    //         // let nameStr = GC.data.languageTemp.temp.getName(info.name);
    //         // _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
    //         // _cloneNode.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
    //         // let score = info.change;
    //         // let scLbl = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
    //         // LobbyControl.getInstance().setWinColor(scLbl, score, true);

    //         // _cloneNode["index"] = i;
    //         // _cloneNode["info"] = {
    //         //     data: data,
    //         //     info: info
    //         // };
    //         // _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
    //     }
    //     scrollView.content.height = panel_item.height * (len + 2);
    // }

    onClickItem(event) {
        let node = event.target;
        let info = node.info;
        UIComponent.open(UIDefine.UIMine_Poker, { info: info });
    }


    ////////////////////////////////////////////////////
    getRecordItem(): cc.Node {
        console.log("getRecordItem", this.record_item_pool.length);
        if (this.record_item_pool.length) return this.record_item_pool.shift();
        return cc.instantiate(this.$record_item);
    }
    getDetailItem(): cc.Node {
        if (this.detail_item_pool.length) return this.detail_item_pool.shift();
        return cc.instantiate(this.$detail_item);
    }
    backRecordItem(item: cc.Node) {
        this.record_item_pool.push(item);
    }
    backDetailItem(item: cc.Node) {
        this.detail_item_pool.push(item);
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
                //this.refreshListView(res);
                next.call(this);
            },
            (res) => {
            }
        )
    }
    //请求公会基金
    reqClubFund() {
        let param = {
            club_random_id: ClubCache.random_id
        }
        UIClubModel.mInstance.reqClubFund(ClubCache.club_id, param).then(
            (res: any) => {
                let data = res.data;
                GC.wallet.Gold = data?.gold || 0;
                GC.wallet.USDT = data?.usdt || 0;
                this.refreshGold();
            },
            (res) => {
            }
        )
    }
    //请求公会基金变动
    reqClubFundChangeLog() {
        let param = {
            limit: 100,
            offset: 0,
            club_random_id: ClubCache.random_id
        }
        UIClubModel.mInstance.reqClubFundChangeLog(ClubCache.club_id, param).then(
            (res) => {
                //this.refreshListView(res);
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
    //请求申请列表
    reqApplyList() {
        UIClubModel.mInstance.CommonAPI(
            ClubCache.club_id,
            {
                "order_type": 1,
                "limit": 100,
                "offset": 0
            },
            Web_Club_Fund_ApplyList).then(
                (res: any) => {

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
                this.reqAccount();
                break;
            case 1:
                this.clearRecordItems();
                this.record_datas = [];
                this._RecordIndex = -8;
                this.Record_Index = 0;
                break;
            case 2:
                //Web_Club_Fund_ApplyList
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
    }
    agreeClick(index: number) {
        console.log("agreeClick", index);
    }

    // ordet_type转换 1充值 2提取 4转换
    transformOrderType(index: number): number {
        if (index == 0) return 1;
        if (index == 1) return 2;
        if (index == 2) return 4;
        return 0;
    }
}
