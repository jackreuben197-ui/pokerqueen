import { info, table } from "console";
import ComFormTitle from "../../../common/ComFormTitle";
import { UIDefine } from "../../../define/UIDefine";
import LobbyData from "../../../frame/data/lobby/LobbyData";
import GC from "../../../frame/GameControl";
import GameUtil from "../../../game/util/GameUtil";
import TimeHelper from "../../../helper/TimeHelper";
import { WebStatsUserStats } from "../../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../../ui/component/AssetContext";
import BaseForm from "../../../ui/form/BaseForm";
import UIComponent from "../../../ui/UIComponent";
import { LobbyControl } from "../../control/LobbyControl";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMineArch extends BaseForm {


    private comFormTitle: ComFormTitle = null;

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

        // let Text_title = this.getChildNodeOrComponent("Text_title", cc.Label);
        // Text_title.string = "牌型成就";

        // this.comFormTitle.initData('牌型成就', this);

        // this.comFormTitle.title.string = "牌型成就";

        this.resetUI();

        this.reqUpInfo();

    }

    reqUpInfo() {
        let info = {
            type: 2, // 类型ID  任务类型  1；每日任务 2：成就任务
            timezone: 0, // 时区 0-巴西 1-utc
            limit: 100,
            offset: 0,
        }
        LobbyControl.getInstance().reqPropTaskList(info).then(
            (res: any) => {
                this.refreshListView(res.data);
            },
            (res) => {
            }
        )
    }


    resetUI() {

        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
    }

    refreshListView(data) {
        if (data == null) {
            return;
        }
        let list = data.list;


        let len = list.length;

        let ary1 = [];
        let ary2 = [];
        for (let i = 0; i < len; i++) {
            let info = list[i];
            if (info.is_get_goods == 1) {
                ary1.push(info);
            } else {
                ary2.push(info);
            }
        }
        list = ary1.concat(ary2);

        let lbl_noshow: cc.Node = this.getChildNodeOrComponent("lbl_no");
        let scrollView = this.getChildNodeOrComponent("sv_down", cc.ScrollView);
        scrollView.content.removeAllChildren();
        scrollView.scrollToTop();
        if (len == 0) {
            lbl_noshow.active = true;
        } else {
            lbl_noshow.active = false;
            // 有数据 刷新列表
            let panel_item: cc.Node = this.getChildNodeOrComponent("panel_item");
            for (let i = 0; i < len; i++) {
                let info = list[i];
                let _cloneNode = cc.instantiate(panel_item);
                _cloneNode.x = 0;
                _cloneNode.y = -_cloneNode.height * 0.5 - _cloneNode.height * (i);
                _cloneNode.parent = scrollView.content;


                let btn_gift = _cloneNode.getChildByName("btn_gift");
                _cloneNode["index"] = i;
                btn_gift["info"] = info;
                btn_gift.on(cc.Node.EventType.TOUCH_END, this.onClickGift, this)

                let item_dialog = _cloneNode.getChildByName("item_dialog");
                item_dialog.active = false;

                let nameStr = GC.data.languageTemp.temp.getName(info.task_award_prop_name);

                let pkInfo = LobbyControl.getInstance().getArchPKInfo(info.classification);

                let lbl_dialog = item_dialog.getChildByName("lbl_dialog");
                lbl_dialog.getComponent(cc.Label).string = "完成任务可领取: " + nameStr + " x " + info.task_award_prop_num;

                let item_name = _cloneNode.getChildByName("panel_up").getChildByName("item_name");
                item_name.getComponent(cc.Label).string = pkInfo.name;

                let item_pk = _cloneNode.getChildByName("item_pk");
                for (let j = 0; j < 5; j++) {
                    let item = item_pk.children[j];
                    let cardStr = GameUtil.GetCardNameByNum(pkInfo.info[j]);
                    let path = AssetContext.getAsset(
                        cardStr,
                        AssetFold.texture_BigCard0) as cc.SpriteFrame;
                    item.getComponent(cc.Sprite).spriteFrame = path;
                }

                let lbl_date = _cloneNode.getChildByName("lbl_date");
                let timeStr = info.update_time.toString().replace("+0000 ", "");
                let time2 = timeStr.replace(/-/g, "/");
                lbl_date.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(time2);

                let lbl_times = _cloneNode.getChildByName("lbl_times");
                lbl_times.getComponent(cc.Label).string = info.task_final_num + "次";

                let item_get = _cloneNode.getChildByName("item_get");

                if (info.is_get_goods == 1) {
                    btn_gift.active = false;
                    item_get.active = true;
                } else {
                    btn_gift.active = true;
                    item_get.active = false;
                }

                let progress = _cloneNode.getChildByName("progress");
                progress.getComponent(cc.ProgressBar).progress = info.task_final_num / info.task_num;

                let lbl_progress = _cloneNode.getChildByName("lbl_progress");
                lbl_progress.getComponent(cc.Label).string = info.task_final_num + "/" + info.task_num;
            }
            scrollView.content.height = panel_item.height * (len + 1);
        }
    }

    onClickGift(event) {
        let target = event.currentTarget;
        let info = target.info;

        if (info.is_get_goods == 1) {
            return;
        }

        let task_id = info.task_id;
        if (info.task_final_num == info.task_num) {
            let info = {
                task_id: task_id,
                timezone: 0,
            }
            LobbyControl.getInstance().reqPropTaskReceive(info).then(
                (res: any) => {
                    this.reqUpInfo();
                },
                (res) => {
                }
            )
        } else {
            let item_dialog = target.parent.getChildByName("item_dialog");
            item_dialog.active = !item_dialog.active;
            if (item_dialog.active) {
                this.scheduleOnce(() => {
                    item_dialog.active = false;
                }, 2)
            }
        }
    }

    onClickItem(event) {
        let target = event.currentTarget;
        let info = target.info;
        UIComponent.open(UIDefine.UIRecordDetail, { info: info });
    }

}
