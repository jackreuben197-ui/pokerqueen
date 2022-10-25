import { GameCache } from "../../game/GameCache";
import UIBase from "../../ui/UIBase";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/mtt/realTime/MttRealTimeBlindItem')
export default class MttRealTimeBlindItem extends UIBase {
    private level: cc.Label = null;
    private blind: cc.Label = null;
    private front: cc.Label = null;
    private blindTime: cc.Label = null;

    private curFlag: cc.Node = null;
    private statusBg: cc.Node = null;
    private status: cc.Label = null;
    lateLoad() {
        super.lateLoad();

        this.level = this.getChildNodeOrComponent("level", cc.Label);
        this.blind = this.getChildNodeOrComponent("blind", cc.Label);
        this.front = this.getChildNodeOrComponent("front", cc.Label);
        this.blindTime = this.getChildNodeOrComponent("blindTime", cc.Label);

        this.curFlag = this.getChildNodeOrComponent("curFlag");
        this.statusBg = this.getChildNodeOrComponent("statusBg");
        this.status = this.getChildNodeOrComponent("status", cc.Label);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    initData(data: { ante: number, blind: number, level: number, updateTime: number }) {

        this.setText(this.level, data.level);
        this.setText(this.blind, `${data.blind}/${data.blind * 2}`);
        this.setText(this.front, data.ante);
        this.setText(this.blindTime, "UITexasReport_Text_MatchNextBlindTime", data.updateTime / 60);

        this.setActive(this.curFlag, GameCache.Instance.currLeve == data.level);
        this.setActive(this.statusBg, GameCache.Instance.mtt_rebuyLevel == data.level);
        this.setText(this.status, "MTT_Blind_Deadline_to_buy")
        if (GameCache.Instance.mtt_addoprebuyLevel == data.level && GameCache.Instance.mtt_addoprebuyLevel > 0) {
            // icon.sprite = red_bg;
            this.setActive(this.statusBg, true)
            this.setText(this.status, "MTT_Blind_Deadline_add_op")
        }
        if (GameCache.Instance.mtt_addclrebuyLevel == data.level && GameCache.Instance.mtt_addclrebuyLevel > 0) {
            // icon.sprite = ls_bg;
            this.setActive(this.statusBg, true)
            this.setText(this.status, "MTT_Blind_Deadline_add_cl")
        }
    }
}