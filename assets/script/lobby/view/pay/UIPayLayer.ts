import ComFormTitle from "../../../common/ComFormTitle";
import { UIDefine } from "../../../define/UIDefine";
import GC from "../../../frame/GameControl";
import { GameCache } from "../../../game/GameCache";
import { HistoryInfoData } from "../../../game/UITexasHistoryComponent";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPayLayer extends BaseForm {


    private comFormTitle: ComFormTitle = null;

    isUSDT: boolean = false;

    ebx_num: cc.EditBox = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }


    lateClose(param: any = null) {
        super.lateClose(param);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);

        if (param.type) {
            if (param.type == "buy") {
                this.comFormTitle.title_label.string = "充值";
            } else {
                this.comFormTitle.title_label.string = "提现";
            }
        }

        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "本局牌谱";

        // if (param && param.info) {
        //     this.reqInfo(param.info);
        // }

        // this.refreshListView(res);


        let btn_next: cc.Node = this.getChildNodeOrComponent("btn_next");
        btn_next.on(cc.Node.EventType.TOUCH_END, this.onClickBottomBtn, this)

        let btn_gold: cc.Node = this.getChildNodeOrComponent("btn_gold");
        btn_gold.on(cc.Node.EventType.TOUCH_END, this.onClickGold, this)

        let btn_usdt: cc.Node = this.getChildNodeOrComponent("btn_usdt");
        btn_usdt.on(cc.Node.EventType.TOUCH_END, this.onClickUSDT, this)

        this.ebx_num = this.getChildNodeOrComponent("ebx_num", cc.EditBox);

        this.isUSDT = false;
        this.refreshCenterGoldIcon();

        let panel_usdt: cc.Node = this.getChildNodeOrComponent("panel_usdt");
        panel_usdt.children.forEach((v, i) => {
            v["index"] = i;
            v.on(cc.Node.EventType.TOUCH_END, this.onClickCenterChoose, this)
        })
        this.ebx_num.string = "";
    }

    onClickCenterChoose(event) {
        let node = event.target;
        let index = node.index;
        this.ebx_num.string = "500";
    }

    refreshCenterGoldIcon() {
        let panel_usdt: cc.Node = this.getChildNodeOrComponent("panel_usdt");
        panel_usdt.children.forEach((v) => {
            let img_gold = v.getChildByName("img_gold");
            let img_gold2 = v.getChildByName("img_gold2");
            img_gold.active = this.isUSDT;
            img_gold2.active = !this.isUSDT;
        })
        this.refreshTopUI();
        this.ebx_num.string = "";
    }

    refreshTopUI() {
        let btn_usdt: cc.Node = this.getChildNodeOrComponent("btn_usdt");
        let btn_gold: cc.Node = this.getChildNodeOrComponent("btn_gold");
        btn_usdt.getChildByName("img_line").active = this.isUSDT;
        btn_usdt.getChildByName("lbl_show").color = this.isUSDT ? 
            cc.color(53, 163, 179) : cc.color(255, 255, 255);
        btn_gold.getChildByName("img_line").active = !this.isUSDT;
        btn_gold.getChildByName("lbl_show").color = !this.isUSDT ? 
            cc.color(53, 163, 179) : cc.color(255, 255, 255);
    }

    onClickGold(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = false;
        this.refreshCenterGoldIcon();
    }

    onClickUSDT(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = true;
        this.refreshCenterGoldIcon();
    }

    reqInfo(data) {
        let roomData = data.data.room_data;
        let info = {
            room_id: roomData.room_id,         
            match_id: 0,     
            limit: roomData.limit,   
            offset: roomData.offset,
            type: 0,   
            gametype: roomData.game_type,   
        }
        LobbyControl.getInstance().getRecordHandInfo(info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
        let records = data.data.records;
        let len = records.length;
        this.getChildNodeOrComponent("lbl_total", cc.Label).string = "共计" + len + "手";
        let lbl_no : cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = len == 0;
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            let info = records[i];

            let nameStr = GC.data.languageTemp.temp.getName(info.name);
            _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
            _cloneNode.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
            let score = info.change;
            let scLbl = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
            LobbyControl.getInstance().setWinColor(scLbl, score, true);

            _cloneNode["index"] = i;
            _cloneNode["info"] = {
                data: data,
                info: info
            };
            _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        }
        scrollView.content.height = panel_item.height * (len+5);
    }

    onClickItem(event) {
        let node = event.target;
        let info = node.info;
        UIComponent.open(UIDefine.UIMine_Poker, {info : info});
    }

    onClickBottomBtn() {
        let str = '确定给<color=#3BE1F5>此账号</color>提出<color=#3BE1F5>500</color>金豆？ 折合泰铢<color=#3BE1F5>10000</color>$'
        str = '确定向<color=#3BE1F5>公会名称</color>申请提取<color=#3BE1F5>500</color>金豆？ 收款金额<color=#3BE1F5>1000</color>$'
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent, {
            type: UIDialogComponent.DialogType.CommitCancel,
            title: "提示",
            content: str,
            contentCommit: "确定",
            contentCancel: "取消",
            actionCommit: () => {

            },
            noAnimation: true,
        });
    }


}
