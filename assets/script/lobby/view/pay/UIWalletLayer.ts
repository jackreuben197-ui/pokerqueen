import ComFormTitle from "../../../common/ComFormTitle";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import ClubInfoModel from "../../../frame/data/club/ClubInfoModel";
import GC from "../../../frame/GameControl";
import { GameCache } from "../../../game/GameCache";
import { HistoryInfoData } from "../../../game/UITexasHistoryComponent";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";
import { UIClubModel } from "../../labor/UIClubModel";

//钱包类型
export enum WalletType {
    Personal = 0,//个人钱包
    Club = 1,//公会钱包
    Fund = 2,//公会基金
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIWalletLayer extends BaseForm {


    private comFormTitle: ComFormTitle = null;

    protected _param: { wallet_type: number } = null;

    panel_accout: cc.Node = null;
    panel_record: cc.Node = null;

    lbl_no: cc.Node = null;//无记录
    lbl_no2: cc.Node = null;//无数据

    //let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item1");
    panel_item1: cc.Node = this.getChildNodeOrComponent("panel_item1");
    panel_item2: cc.Node = this.getChildNodeOrComponent("panel_item2");

    //金币 货币
    panel_gold_up: cc.Node = null;
    //USDT 货币
    panel_gold_down: cc.Node = null;

    record_item: cc.Node = null;
    detail_item: cc.Node = null;

    record_content: cc.Node = null;
    detail_content: cc.Node = null;


    btn_accout: cc.Node = null;
    btn_record: cc.Node = null;
    btn_apply: cc.Node = null;

    root_layout: cc.Layout = null;

    //0:充值记录 1:提现记录 2:转换记录
    record_type: number = 0;

    record_item_pool = [];
    detail_item_pool = [];

    record_dec = ["", "充值数量", "提现数量", "兑换数量"];
    record_recharge_status = ["", "充值中", "充值成功", "充值失败"];
    record_withdraw_status = ["", "提现中", "提现成功", "提现失败"];
    record_exchange_status = ["获取数量", "获取数量", "获取数量", "获取数量"];

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.panel_gold_up = this.getChildNodeOrComponent("panel_gold_up");
        this.panel_gold_down = this.getChildNodeOrComponent("panel_gold_down");
        this.lbl_no = this.getChildNodeOrComponent("lbl_no");
        this.lbl_no2 = this.getChildNodeOrComponent("lbl_no2");
        this.record_item = this.getChildNodeOrComponent("record_item");
        this.detail_item = this.getChildNodeOrComponent("detail_item");

        this.record_content = this.getChildNodeOrComponent("record_content");
        this.detail_content = this.getChildNodeOrComponent("detail_content");

        this.root_layout = this.getChildNodeOrComponent("root_layout", cc.Layout);

        this.record_item.active = false;
        this.detail_item.active = false;

    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     * param {type: 0:个人钱包 1:公会钱包 2:公会基金}
     */
    onShow(param?: { wallet_type: WalletType }, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        console.log("当前钱包类型:",);

        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "本局牌谱";

        // if (param && param.info) {
        //     this.reqInfo(param.info);
        // }

        // this.refreshListView(res);

        let btn_buy: cc.Node = this.getChildNodeOrComponent("btn_buy");
        btn_buy["type"] = "buy";
        btn_buy["index"] = 1;
        btn_buy.on(cc.Node.EventType.TOUCH_END, this.onClickBuy, this)

        let btn_get: cc.Node = this.getChildNodeOrComponent("btn_get");
        btn_get["type"] = "get";
        btn_get["index"] = 2;
        btn_get.on(cc.Node.EventType.TOUCH_END, this.onClickBuy, this)

        let btn_change: cc.Node = this.getChildNodeOrComponent("btn_change");
        btn_change["index"] = 3;
        btn_change.on(cc.Node.EventType.TOUCH_END, this.onClickChange, this)


        this.btn_accout = this.getChildNodeOrComponent("btn_accout");
        this.btn_accout.on(cc.Node.EventType.TOUCH_END, this.onClickAccout, this)

        this.btn_record = this.getChildNodeOrComponent("btn_record");
        this.btn_record.on(cc.Node.EventType.TOUCH_END, this.onClickRecord, this)

        this.btn_apply = this.getChildNodeOrComponent("btn_apply");
        this.btn_apply.on(cc.Node.EventType.TOUCH_END, this.onClickApply, this)


        this.panel_accout = this.getChildNodeOrComponent("panel_accout");
        this.panel_record = this.getChildNodeOrComponent("panel_record");


        this.changeTopThreeBtn(0);

        let panel_record: cc.Node = this.getChildNodeOrComponent("panel_record");
        panel_record.children.forEach((v, i) => {
            if (i < 3) {
                v["index"] = i;
                v.on(cc.Node.EventType.TOUCH_END, this.onClickTopRecord, this);
            }
        })
        //this.refreshTopRecord(0);
        this.refreshAccout();

        //根据类型判断哪种钱包
        switch (param.wallet_type) {

            case 0:
                this.comFormTitle.setTitle("UIMine_WalletMy");
                this.btn_accout.active = true;
                this.btn_record.active = true;
                this.btn_apply.active = false;
                this.root_layout.spacingX = 220;
                break;
            case 1:
                this.comFormTitle.setTitle("UIMine_WalletMy");
                this.reqClubUserWallet();
                this.reqGoldChangeLog();
                this.btn_accout.active = true;
                this.btn_record.active = true;
                this.btn_apply.active = false;
                this.root_layout.spacingX = 220;
                break;
            case 2:
                this.comFormTitle.setTitle("UIClub_FundDetail");
                this.reqClubFund();
                this.reqClubFundChangeLog();
                this.btn_accout.active = true;
                this.btn_record.active = true;
                this.btn_apply.active = false;
                this.root_layout.spacingX = 220;
                //this.root_layout.spacingX = 10;
                break;
        }
    }

    refreshTopRecord(index) {
        let panel_record: cc.Node = this.getChildNodeOrComponent("panel_record");
        this.record_type = index;
        panel_record.children.forEach((v, i) => {
            if (i < 3) {
                if (index == i) {
                    v.getChildByName("lbl").opacity = 255;
                    v.getChildByName("lbl").getComponent(cc.Label).fontSize = 46;
                    this.reqRecord(i);
                } else {
                    v.getChildByName("lbl").opacity = 76.5;
                    v.getChildByName("lbl").getComponent(cc.Label).fontSize = 40;
                }
            }
        })
    }

    onClickTopRecord(event) {
        let node = event.target;
        //let index = node.index;
        this.refreshTopRecord(node.index);
    }

    // 刷新上方三个按钮样式 index 1-3
    changeTopThreeBtn(index) {
        let btn_buy: cc.Node = this.getChildNodeOrComponent("btn_buy");
        let btn_get: cc.Node = this.getChildNodeOrComponent("btn_get");
        let btn_change: cc.Node = this.getChildNodeOrComponent("btn_change");
        let chooseFun = function (baseNode: cc.Node) {
            let img_full = baseNode.getChildByName("img_full");
            let img_null = baseNode.getChildByName("img_null");
            let lbl_show = baseNode.getChildByName("lbl_show");
            lbl_show.color = cc.color(255, 255, 255)
            img_full.active = true;
            img_null.active = false;
        }
        let normalFun = function (baseNode: cc.Node) {
            let img_full = baseNode.getChildByName("img_full");
            let img_null = baseNode.getChildByName("img_null");
            let lbl_show = baseNode.getChildByName("lbl_show");
            lbl_show.color = cc.color(53, 163, 179)
            img_full.active = false;
            img_null.active = true;
        }
        if (index == 1) {
            chooseFun(btn_buy);
            normalFun(btn_get);
            normalFun(btn_change);
        } else if (index == 2) {
            chooseFun(btn_get);
            normalFun(btn_buy);
            normalFun(btn_change);
        } else if (index == 3) {
            chooseFun(btn_change);
            normalFun(btn_get);
            normalFun(btn_buy);
        } else {
            normalFun(btn_change);
            normalFun(btn_get);
            normalFun(btn_buy);
        }
    }

    onClickBuy(event) {
        let node = event.target;
        let type = node.type;//充值还是提取
        this.changeTopThreeBtn(node.index);
        UIComponent.open(UIDefine.UIPayLayer, { type: type, walletType: this._param.wallet_type });
    }

    onClickChange(event) {
        let node = event.target;
        this.changeTopThreeBtn(node.index);
        UIComponent.open(UIDefine.UIChangeLayer);
    }

    refreshAccout() {
        this.btn_accout.getChildByName("img_line").active = true;
        this.btn_record.getChildByName("img_line").active = false;
        this.btn_accout.getChildByName("lbl_show").color = cc.color(53, 163, 179);
        this.btn_record.getChildByName("lbl_show").color = cc.color(255, 255, 255);
        this.panel_accout.active = true;
        this.panel_record.active = false;
        this.lbl_no.active = true;
        this.lbl_no2.active = false;
    }

    onClickAccout(event) {
        let node = event.target;
        this.refreshAccout();
    }

    onClickRecord(event) {
        let node = event.target;
        let btn_accout: cc.Node = this.getChildNodeOrComponent("btn_accout");
        let btn_record: cc.Node = this.getChildNodeOrComponent("btn_record");
        btn_accout.getChildByName("img_line").active = false;
        btn_record.getChildByName("img_line").active = true;
        btn_record.getChildByName("lbl_show").color = cc.color(53, 163, 179);
        btn_accout.getChildByName("lbl_show").color = cc.color(255, 255, 255);
        this.panel_accout.active = false;
        this.panel_record.active = true;

        this.lbl_no.active = false;
        this.lbl_no2.active = true;
        //请求充值记录
        this.refreshTopRecord(0);
    }

    onClickApply() {

    }


    //设置记录状态
    reqRecord(type: number) {
        switch (type) {
            case 0:
                this.reqRechargeRecord();
                break;
            case 1:
                this.reqWithDrawRecord();
                break;
            case 2:
                this.reqExchangeRecord();
                break;
        }
    }

    //请求充值记录
    reqRechargeRecord() {
        UIClubModel.mInstance.reqClubFundOrderList(
            ClubCache.club_id,
            {
                "order_type": 1,
                "limit": 10,
                "offset": 0
            }
        ).then(
            (res: any) => {
                this.refreshRecord(res?.data?.list || []);
            },
            err => {

            }
        );
    }
    //请求提现记录
    reqWithDrawRecord() {
        UIClubModel.mInstance.reqClubFundOrderList(
            ClubCache.club_id,
            {
                "order_type": 2,
                "limit": 10,
                "offset": 0
            }
        ).then(
            (res: any) => {
                this.refreshRecord(res?.data?.list || []);
            },
            err => {

            }
        );
    }
    //请求转换记录
    reqExchangeRecord() {
        UIClubModel.mInstance.reqClubFundOrderList(
            ClubCache.club_id,
            {
                "order_type": 3,
                "limit": 10,
                "offset": 0
            }
        ).then(
            (res: any) => {
                this.refreshRecord(res?.data?.list || []);
            },
            err => {

            }
        );
    }



    //设置金币
    setGold(value: number) {
        this.panel_gold_up.getChildByName("lbl_gold").getComponent(cc.Label).string = `${value}`;
    }
    //设置USDT
    setUSDT(value: number) {
        this.panel_gold_down.getChildByName("lbl_gold").getComponent(cc.Label).string = `${value}`;
    }

    //刷新记录列表
    refreshRecord(list) {

        let list_len: number = list.length;

        this.lbl_no.active = list_len == 0;

        this.clearRecordItems();

        for (let i = 0; i < list_len; i++) {
            let info = list[i];
            let gold_type: number = info.gold_type;//金币类型
            let gold_num: number = info.gold_num;//数量
            let order_type: number = info.order_type;//充提转 订单类型 1，2，3
            let apply_type: number = info.apply_type;//充提 状态
            let order_no: string = info.order_no;//订单号
            let create_time: string = info.create_time;//时间
            let status = info.status;// 1 充值|提现中 2 充值|提现完成 3 充值|提现失败
            let item = this.getRecordItem();
            item.parent = this.record_content;
            item.active = true;

            let status_des = null;
            let status_num = null;
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
            this.setChildLabel(item, "lbl_gold", `${order_type < 3 ? "+" : "-"}${gold_num}`);
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
        // while (this.record_content.childrenCount) {
        //     let child = this.record_content.children.shift();
        //     //child.parent = null;
        //     this.backRecordItem(child);
        //     console.log("clear child");
        // }
        this.record_content.children.forEach(item => {
            this.backRecordItem(item);
        })
        this.record_content.removeAllChildren();
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
        return cc.instantiate(this.record_item);
    }
    getDetailItem(): cc.Node {
        if (this.detail_item_pool.length) return this.detail_item_pool.shift();
        return cc.instantiate(this.detail_item);
    }
    backRecordItem(item: cc.Node) {
        this.record_item_pool.push(item);
    }
    backDetailItem(item: cc.Node) {
        this.detail_item_pool.push(item);
    }

    ////////////////////////////////////////////////////

    //请求公会钱包
    reqClubUserWallet() {
        let info = {

        }
        LobbyControl.getInstance().reqClubUserWallet(ClubCache.club_id, info).then(
            (res: any) => {
                let data = res.data;
                this.setGold(data?.golds || 0);
                this.setUSDT(data?.usdt || 0);
            },
            (res) => {
            }
        )
    }
    //请求公会钱包变动
    reqGoldChangeLog() {
        let info = {
            limit: 100,
            offset: 0
        }
        LobbyControl.getInstance().reqGoldChangeLog(ClubCache.club_id, info).then(
            (res) => {
                //this.refreshListView(res);
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
                this.setGold(data?.gold || 0);
                this.setUSDT(data?.usdt || 0);
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
}
