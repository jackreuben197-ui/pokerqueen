import ComFormTitle from "../../../common/ComFormTitle";
import { UIDefine } from "../../../define/UIDefine";
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
export default class UIChangeLayer extends BaseForm {


    private comFormTitle: ComFormTitle = null;

    isUSDT: boolean = false;

    ebx_num_up: cc.EditBox = null;
    ebx_num_down: cc.EditBox = null;

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

        let btn_gold: cc.Node = this.getChildNodeOrComponent("btn_gold");
        btn_gold.on(cc.Node.EventType.TOUCH_END, this.onClickGold, this)

        let btn_usdt: cc.Node = this.getChildNodeOrComponent("btn_usdt");
        btn_usdt.on(cc.Node.EventType.TOUCH_END, this.onClickUSDT, this)

        let btn_all: cc.Node = this.getChildNodeOrComponent("btn_all");
        btn_all.on(cc.Node.EventType.TOUCH_END, this.onClickAll, this)

        this.ebx_num_up = this.getChildNodeOrComponent("ebx_num_up", cc.EditBox);
        this.ebx_num_down = this.getChildNodeOrComponent("ebx_num_down", cc.EditBox);

        this.isUSDT = false;
        this.refreshTopUI();

        this.ebx_num_up.string = "";
        this.ebx_num_down.string = "";
    }

    onClickAll(event) {
        let node = event.target;
        let info = node.info;
        this.ebx_num_up.string = "500";
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

        let panel_input: cc.Node = this.getChildNodeOrComponent("panel_input");
        let panel_input2: cc.Node = this.getChildNodeOrComponent("panel_input2");
        // 上面的金豆 如果是金豆 显示绿色 是usdt 显示黄色 img_bg 绿色 img_bg2 黄色
        panel_input.getChildByName("img_bg").active = !this.isUSDT;
        panel_input2.getChildByName("img_bg").active = this.isUSDT;
        panel_input.getChildByName("img_bg2").active = this.isUSDT;
        panel_input2.getChildByName("img_bg2").active = !this.isUSDT;

        this.ebx_num_up.string = "";
        this.ebx_num_down.string = "";
    }

    onClickGold(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = false;
        this.refreshTopUI();
    }

    onClickUSDT(event) {
        let node = event.target;
        let info = node.info;
        this.isUSDT = true;
        this.refreshTopUI();
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

}
