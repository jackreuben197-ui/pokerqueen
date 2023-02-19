import { ClubCache } from "../../frame/data/club/ClubCache";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemMyPack extends UIBasePlus {
    $res: cc.Node = null;
    cc_Sprite$icon: cc.Sprite = null;
    cc_Label$title: cc.Label = null;
    cc_Label$time: cc.Label = null;
    $button: cc.Node = null;
    cc_Label$button:cc.Label = null;
    //////////////////////////////////
    Use_IText = {
        1: null,
        2: "adaptation10200",
        3: "adaptation10200",
        4: "adaptation10200",
        5: "adaptation10200",
        6: "adaptation10200",
        7: "adaptation10200",
        8: "adaptation10200",
        9: "adaptation10200",
        10: "adaptation10200",
        11: null,
        12: null,
        13: null,
    }


    onShow(data: any): void {
        super.onShow(data);
        this.refreshUI(data);
    }
    refreshUI(data: any) {
        //图标
        this.cc_Sprite$icon.spriteFrame = this.getIconRes(data.prop_type - 1);
        //标题内容
        this.cc_Label$title.string = `${data.prop_name} *${data.prop_number}`;
        //到期时间
        let time_18 = i18nMgr.Get("UIMine_BackpackList_timeLimit").split('^');
        if (data.time_limit == null || data.time_limit == "") {
            this.cc_Label$time.string = time_18[1];//none
        }
        else {
            let timespan = TimeHelper.RFC3339TimeConvertToUTCTime(data.time_limit);
            let date = new Date(timespan);
            let ymd = TimeHelper.getDateStructYMD(timespan / 1000);
            let time: string = `${ymd.year}-${ymd.month}-${ymd.day} ${TimeHelper.toTimeFormat(date.getHours())}:${TimeHelper.toTimeFormat(date.getMinutes())}`
            this.cc_Label$time.string = time_18[0].replace("{0}", time);
        }
        //按钮和按钮文本
        let use_text = this.Use_IText[data.prop_type];
        this.$button.active = !!use_text;
        this.cc_Label$button.string = i18nMgr.Get(use_text);
    }

    getIconRes(index: number) {
        return this.$res.children[index].getComponent(cc.Sprite).spriteFrame;
    }
}
