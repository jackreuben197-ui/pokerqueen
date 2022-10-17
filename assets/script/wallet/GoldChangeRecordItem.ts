import ListItem from "../common/ListItem";
import GoldChangeLogItem from "../frame/data/wallet/goldChangeLog/GoldChangeLogItem";
import TimeHelper from "../helper/TimeHelper";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/GoldChangeRecordItem')
export default class GoldChangeRecordItem extends ListItem {
    private timeNode: cc.Node = null;
    private timeTip: cc.Label = null;

    private infoNode: cc.Node = null;
    private title: cc.Label = null;
    private goldNum: cc.Label = null;
    private time: cc.Label = null;
    private changeNum: cc.Label = null;

    lateLoad() {
        super.lateLoad();

        this.timeNode = this.getChildNodeOrComponent("timeNode");
        this.timeTip = this.getChildNodeOrComponent("timeTip", cc.Label);

        this.infoNode = this.getChildNodeOrComponent("infoNode");
        this.title = this.getChildNodeOrComponent("title", cc.Label);
        this.goldNum = this.getChildNodeOrComponent("goldNum", cc.Label);
        this.time = this.getChildNodeOrComponent("time", cc.Label);
        this.changeNum = this.getChildNodeOrComponent("changeNum", cc.Label);

    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: GoldChangeLogItem) {
        this.setActive(this.timeNode, false);
        this.setActive(this.infoNode, false);
        if (data.displayTime) {
            this.initTimeNode(data.create_time);
        }
        this.initInfoNode(data);

    }

    initTimeNode(time: number) {
        this.setActive(this.timeNode, true);
        // this.node.height = this.timeNode.height + this.infoNode.height;

        if (TimeHelper.isToday(time)) {
            this.setText(this.timeTip, "UIText_today")
        } else if (TimeHelper.isYesterday(time)) {
            this.setText(this.timeTip, "UIText_yesterday")
        } else {
            this.setText(this.timeTip, TimeHelper.getMD(time));
        }
    }

    initInfoNode(data: GoldChangeLogItem) {
        this.setActive(this.infoNode, true);
        // this.node.height = this.infoNode.height;

        this.setText(this.title, data.opName);
        this.setText(this.goldNum, data.gold_after);
        this.setText(this.time, TimeHelper.getHM(data.create_time, ":"));
        this.setText(this.changeNum, data.changeNum);
        this.setTextColor(this.changeNum, data.changeNum > 0 ? "#3BE1F5" : "#FFCC00");
    }
}