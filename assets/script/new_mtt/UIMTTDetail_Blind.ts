import List from "../common/List";
import ListEx from "../common/ListEx";
import { TextColor } from "../config/GameConfig";
import MTTGameUtil from "../game/util/MTTGameUtil";
import { StringHelper } from "../helper/StringHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { WWW } from "../net/https/WebRequest";
import UIBasePlus from "../ui/UIBasePlus";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTDetail_Blind extends UIBasePlus {

    $top_blind: cc.Node = null;

    $scroller_blind: cc.Node = null;

    $null_blind: cc.Node = null;

    mtt_detail: any;

    isInit: boolean = false;

    onShow(param: any = null): void {
        super.onShow(param);
        this.mtt_detail = param;
        console.log("onShow UIMTTDetail_Blind");
        if (!this.isInit) {
            this.isInit = true;
            this.initEX();
        }
        this.refreshTop();
        this.listEx.reset();
    }
    refreshTop(res?: any) {
        if (res) {

        } else {

            let levelCount = MTTGameUtil.numOfLevel(this.mtt_detail.mtt.blindtable_type);

            this.$top_blind.children[0].getComponent(cc.Label).string = StringHelper.Format(i18nMgr.Get("MTT_Blind_Num"), [levelCount]);

            this.listEx.refresh(new Array(levelCount), 1);

        }
    }

    private listEx: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.$scroller_blind.getComponent(List),
            nullNode: this.$null_blind,
        });
    }
    //滚动节点渲染
    render_item(node: cc.Node, index: number) {
        let level = index + 1;
        this.setChildLabel(node, "level", level);

        //this.setChildVisible(node, "arrow", this.mtt_detail.more.bl == level);

        this.setChildVisible(node, "arrow", this.mtt_detail.mtt.max_rebuy_bl == level);

        this.setChildVisible(node, "bl", this.mtt_detail.mtt.max_rebuy_bl == level);
        this.setChildLabel(node, "bl", i18nMgr.Get("MTT_Blind_Deadline_to_buy"));
        this.setChildColor(node, "bl", TextColor.Color6);

        if (this.mtt_detail.mtt.addon_begin_bl == level && this.mtt_detail.mtt.addon_begin_bl > 0) {
            this.setChildLabel(node, "bl", i18nMgr.Get("MTT_Blind_Deadline_add_op"));
            this.setChildColor(node, "bl", TextColor.Color5);
        }
        if (this.mtt_detail.mtt.addon_end_bl == level && this.mtt_detail.mtt.addon_end_bl > 0) {
            this.setChildLabel(node, "bl", i18nMgr.Get("MTT_Blind_Deadline_add_cl"));
            this.setChildColor(node, "bl", TextColor.Color8);
        }
        let sb = MTTGameUtil.BlindAtLevel(index, this.mtt_detail.mtt.blindtable_type, 1);//缺少字段，倍数暂时*1，有需求，需要加字段 
        let ante = MTTGameUtil.AnteAtLevel(index, this.mtt_detail.mtt.blindtable_type, 1);

        this.setChildLabel(node, "blind", `${StringHelper.GetLongStringUnit(sb) + "/" + StringHelper.GetLongStringUnit(sb * 2)}`);
        this.setChildLabel(node, "ante", `${StringHelper.GetLongStringUnit(ante)}`);
        this.setChildLabel(node, "time", `${StringHelper.Format(i18nMgr.Get("UITexasReport_Text_MatchNextBlindTime"), [this.mtt_detail.mtt.upblind_interval / 60])}`);

    }

}
