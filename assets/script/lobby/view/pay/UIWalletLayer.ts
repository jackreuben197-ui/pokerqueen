import ComFormTitle from "../../../common/ComFormTitle";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import GC from "../../../frame/GameControl";
import { GameCache } from "../../../game/GameCache";
import { HistoryInfoData } from "../../../game/UITexasHistoryComponent";
import { StringHelper } from "../../../helper/StringHelper";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Stats_User_Stats } from "../../../net/https/WebRequest";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIWalletLayer extends BaseForm {


    private comFormTitle: ComFormTitle = null;

    panel_accout: cc.Node = null;
    panel_record: cc.Node = null;

    lbl_no: cc.Node = null;
    lbl_no2: cc.Node = null;

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

        let btn_accout: cc.Node = this.getChildNodeOrComponent("btn_accout");
        btn_accout.on(cc.Node.EventType.TOUCH_END, this.onClickAccout, this)

        let btn_record: cc.Node = this.getChildNodeOrComponent("btn_record");
        btn_record.on(cc.Node.EventType.TOUCH_END, this.onClickRecord, this)

        this.panel_accout = this.getChildNodeOrComponent("panel_accout");
        this.panel_record = this.getChildNodeOrComponent("panel_record");

        this.lbl_no = this.getChildNodeOrComponent("lbl_no");
        this.lbl_no2 = this.getChildNodeOrComponent("lbl_no2");

        this.changeTopThreeBtn(0);

        let panel_record: cc.Node = this.getChildNodeOrComponent("panel_record");
        panel_record.children.forEach((v, i) => {
            if (i < 3) {
                v["index"] = i;
                v.on(cc.Node.EventType.TOUCH_END, this.onClickTopRecord, this);
            }
        })

        this.refreshTopRecord(0);

        this.refreshAccout();
    }

    refreshTopRecord(index) {
        let panel_record: cc.Node = this.getChildNodeOrComponent("panel_record");
        panel_record.children.forEach((v,i) => {
            if (i < 3) {
                if (index == i) {
                    v.getChildByName("lbl").opacity = 255;
                    v.getChildByName("lbl").getComponent(cc.Label).fontSize = 46;
                } else {
                    v.getChildByName("lbl").opacity = 76.5;
                    v.getChildByName("lbl").getComponent(cc.Label).fontSize = 40;
                }
            }
        })
    }

    onClickTopRecord(event) {
        let node = event.target;
        let index = node.index;
        this.refreshTopRecord(index);
    }

    // 刷新上方三个按钮样式 index 1-3
    changeTopThreeBtn(index) {
        let btn_buy: cc.Node = this.getChildNodeOrComponent("btn_buy");
        let btn_get: cc.Node = this.getChildNodeOrComponent("btn_get");
        let btn_change: cc.Node = this.getChildNodeOrComponent("btn_change");
        let chooseFun = function(baseNode: cc.Node) {
            let img_full = baseNode.getChildByName("img_full");
            let img_null = baseNode.getChildByName("img_null");
            let lbl_show = baseNode.getChildByName("lbl_show");
            lbl_show.color = cc.color(255, 255, 255)
            img_full.active = true;
            img_null.active = false;
        }
        let normalFun = function(baseNode: cc.Node) {
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
        let type = node.type;
        this.changeTopThreeBtn(node.index);
        UIComponent.open(UIDefine.UIPayLayer, {type: type});
    }

    onClickChange(event) {
        let node = event.target;
        this.changeTopThreeBtn(node.index);
        UIComponent.open(UIDefine.UIChangeLayer);
    }

    refreshAccout() {
        let btn_accout: cc.Node = this.getChildNodeOrComponent("btn_accout");
        let btn_record: cc.Node = this.getChildNodeOrComponent("btn_record");
        btn_accout.getChildByName("img_line").active = true;
        btn_record.getChildByName("img_line").active = false;
        btn_accout.getChildByName("lbl_show").color = cc.color(53, 163, 179);
        btn_record.getChildByName("lbl_show").color = cc.color(255, 255, 255);
        this.panel_accout.active = true;
        this.panel_record.active = false;
        this.lbl_no.active = true;
        this.lbl_no2.active = false;

        this.reqListInfo();
        this.reqBaseInfo();
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
    }

    reqBaseInfo() {
        let info = {
           
        }
        LobbyControl.getInstance().reqClubUserWallet(ClubCache.club_id, info).then(
            (res: any) => {
                let data = res.data;
                let panel_gold_up: cc.Node = this.getChildNodeOrComponent("panel_gold_up");
                panel_gold_up.getChildByName("lbl_gold").getComponent(cc.Label).string = data.golds.toString();
                let panel_gold_down: cc.Node = this.getChildNodeOrComponent("panel_gold_down");
                panel_gold_down.getChildByName("lbl_gold").getComponent(cc.Label).string = data.usdt.toString();
            },
            (res) => {
            }
        )
    }

    reqListInfo() {
        let info = {
            limit : 100,
            offset : 0
        }
        LobbyControl.getInstance().reqGoldChangeLog(ClubCache.club_id, info).then(
            (res) => {
                this.refreshListView(res);
            },
            (res) => {
            }
        )
    }

    refreshListView(data) {
        let records = data.data.list;
        let len = records.length;
        let lbl_no : cc.Node = this.getChildNodeOrComponent("lbl_no");
        lbl_no.active = len == 0;
        // 有数据 刷新列表
        let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item1");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        for (let i=0; i<len; i++) {
            let _cloneNode = cc.instantiate(panel_item);
            _cloneNode.x = 0;
            _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
            _cloneNode.parent = scrollView.content;

            let info = records[i];

            // let nameStr = GC.data.languageTemp.temp.getName(info.name);
            // _cloneNode.getChildByName("lbl_deskName").getComponent(cc.Label).string = nameStr;
            // _cloneNode.getChildByName("lbl_next").getComponent(cc.Label).string = "第" + info.hand_num + "手";
            // let score = info.change;
            // let scLbl = _cloneNode.getChildByName("lbl_score").getComponent(cc.Label);
            // LobbyControl.getInstance().setWinColor(scLbl, score, true);

            // _cloneNode["index"] = i;
            // _cloneNode["info"] = {
            //     data: data,
            //     info: info
            // };
            // _cloneNode.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this)
        }
        scrollView.content.height = panel_item.height * (len+2);
    }

    onClickItem(event) {
        let node = event.target;
        let info = node.info;
        UIComponent.open(UIDefine.UIMine_Poker, {info : info});
    }

}
