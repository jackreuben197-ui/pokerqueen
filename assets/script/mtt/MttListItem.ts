import ListItem from "../common/ListItem";
import { EMttItemStatus } from "../config/EEnumConfig";
import { UIDefine } from "../define/UIDefine";
import MttListItemModel from "../frame/data/mtt/MttListItemModel";
import GC from "../frame/GameControl";
import TimeHelper from "../helper/TimeHelper";
import ToastManager from "../manager/ToastManager";
import { Web_Org_Club_Get } from "../net/https/WebRequest";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import UIComponent from "../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/MttListItem')
export default class MttListItem extends ListItem {
    private title: cc.Label = null;
    private startTime: cc.Label = null;
    private type: cc.Label = null;
    private buy: cc.Label = null;
    private joinNum: cc.Label = null;

    private status: cc.Label = null;
    private statusDes: cc.Label = null;
    private rewardNum: cc.Label = null;

    private typeBg: cc.Sprite = null;
    private statusBg: cc.Sprite = null;
    private star: cc.Sprite = null;

    private joinFlag: cc.Node = null;
    private bought: cc.Label = null;

    private type_List = ["NLH", "PLO4", "PLO5", "PLO6"];
    private six_List = ["NLH 6+", "PLO4 6+", "PLO5 6+", "PLO6 6+"];

    private _data: MttListItemModel = null;
    private _endTime: number = 0;
    lateLoad() {
        super.lateLoad();
        this.title = this.getChildNodeOrComponent("title", cc.Label)
        this.startTime = this.getChildNodeOrComponent("startTime", cc.Label)
        this.type = this.getChildNodeOrComponent("type", cc.Label)
        this.buy = this.getChildNodeOrComponent("buy", cc.Label)
        this.joinNum = this.getChildNodeOrComponent("joinNum", cc.Label)
        this.status = this.getChildNodeOrComponent("status", cc.Label)
        this.statusDes = this.getChildNodeOrComponent("statusDes", cc.Label)
        this.rewardNum = this.getChildNodeOrComponent("rewardNum", cc.Label)
        this.typeBg = this.getChildNodeOrComponent("typeBg", cc.Sprite)
        this.statusBg = this.getChildNodeOrComponent("statusBg", cc.Sprite)
        this.star = this.getChildNodeOrComponent("star", cc.Sprite)
        this.joinFlag = this.getChildNodeOrComponent("joinFlag")
        this.bought = this.getChildNodeOrComponent("bought", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.bindClick(this.node, this.clickItem);
    }

    initData(data: MttListItemModel) {
        this._data = data;

        this.setText(this.title, this._data.mttName);
        this.setText(this.startTime, TimeHelper.getYMD(this._data.start_time, "/") + " " + TimeHelper.getHMS(this._data.start_time, ":"))
        this.setText(this.type, this._data.poker_type == 2 ? this.six_List[this._data.game_type] : this.type_List[this._data.game_type])
        this.setText(this.buy, this._data.buyIn);
        this.setText(this.joinNum, this._data.participants)

        this.setText(this.rewardNum, this._data.prize_base_pool);

        this.setActive(this.joinFlag, this._data.bought);
        if (this.joinFlag.active) {
            this.setText(this.bought, ["MTT-Applying", "UIMatch_RoomItemMark"][this._data.bought - 1])
            // this.setTextColor(this.bought, ["#2FCC64", "#FFFFFF"][this._data.bought - 1])
        }

        this.updateStatus();
    }

    updateStatus() {
        this.setActive(this.statusBg, AssetContext.getAsset("mttStatusBox_blue", AssetFold.texture_mtt));
        if (this._data.status == EMttItemStatus.create) {
            //报名
            this.setText(this.status, "UIMTT_Listdistancestart")
            this.setTextColor(this.statusDes, "#FFFFFF");
            this.setTime(this._data.start_time);
        } else if (this._data.status == EMttItemStatus.run && this._data.delayApplyEndTime > TimeHelper.NowS) {
            //延迟报名
            this.setActive(this.statusBg, AssetContext.getAsset("mttStatusBox_red", AssetFold.texture_mtt));
            this.setText(this.status, "UIMTT_Listdistancesclose")
            this.setTextColor(this.statusDes, "#F75447");
            this.setTime(this._data.delayApplyEndTime);
        } else {
            //运行
            this.setText(this.status, "UIMTT_Listitemyx")
            this.setTextColor(this.statusDes, "#3BF5B2");
            this.setText(this.statusDes, `${this._data.alive}/${this._data.participants}`);
        }
    }

    setTime(endTime: number = this._endTime) {
        this._endTime = endTime;
        if (this._endTime - TimeHelper.NowS > 24 * 60 * 60) {
            this.setText(this.statusDes, TimeHelper.getSubD(this._endTime - TimeHelper.NowS));
        } else if (this._endTime - TimeHelper.NowS > 0) {
            this.timeDown();
            this.schedule(this.timeDown, 1);
        } else {
            this.unschedule(this.timeDown);
            this.resetStatus();
        }
    }

    resetStatus() {
        if (this._data.status == EMttItemStatus.create) {
            this._data.status = EMttItemStatus.run;
        } else if (this._data.status == EMttItemStatus.run) {
            this._data.status = EMttItemStatus.end;
        }
        this.updateStatus();
    }

    timeDown = () => {
        this.setText(this.statusDes, TimeHelper.getSubTimeHM(this._endTime - TimeHelper.NowS, ":"))
        if (this._endTime <= TimeHelper.NowS) {
            this.setTime();
        }
    }

    clickItem() {
        if (Web_Org_Club_Get.Response.data.club_id > 0) {
            GC.data.mtt.list.select = this._data;
            // UIComponent.open(UIDefine.MttDetailForm, this._data);
            UIComponent.open(UIDefine.MttRealTime, this._data);
        } else {
            ToastManager.Instance.createToast("PleaseJoinAUnionFirs");
        }
    }
}