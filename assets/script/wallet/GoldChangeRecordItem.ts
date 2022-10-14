import TimeHelper from "../helper/TimeHelper";
import UIBase from "../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/GoldChangeRecordItem')
export default class GoldChangeRecordItem extends UIBase {
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

    initData(data: number | Object) {
        this.setActive(this.timeNode, false);
        this.setActive(this.infoNode, false);
        if (typeof data == "number") {
            this.initTimeNode(data);
        } else {
            this.initInfoNode(data);
        }
    }

    initTimeNode(time: number) {
        this.setActive(this.timeNode, true);
        this.node.height = this.timeNode.height;

        if (TimeHelper.isToday(time)) {
            this.setText(this.timeTip, "UIText_today")
        } else if (TimeHelper.isYesterday(time)) {
            this.setText(this.timeTip, "UIText_yesterday")
        } else {
            this.setText(this.timeTip, TimeHelper.getMD(time));
        }
    }

    initInfoNode(data: any) {
        this.node.height = this.infoNode.height;
        this.setActive(this.infoNode, true);

        this.setText(this.title, "xxx");
        this.setText(this.goldNum, "xxx");
        this.setText(this.time, "xxx");
        this.setText(this.changeNum, "xxx");
    }
}