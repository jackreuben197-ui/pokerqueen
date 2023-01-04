/*
 * @Author: xfj
 * @Date: 2022-12-27 11:14:08
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-04 17:19:33
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubUpLevel.ts
 */

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { UIClubModel } from "../labor/UIClubModel";
import { APIOrgClubLevelBenefit, APIOrgClubLevelInfo } from "../../net/https/WebRequest";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
import TimeHelper from "../../helper/TimeHelper";
import { EventName } from "../../config/EventName";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/new_club/UIClubUpLevel')
export default class UIClubUpLevel extends BaseForm {

    @property(cc.Label)
    currentLevel: cc.Label = null;

    @property(cc.Label)
    lastData: cc.Label = null;

    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Node)
    itemNode: cc.Node = null;

    private comFormTitle: ComFormTitle = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        let title = "club_Level"
        this.comFormTitle.initData(title, this);
        this.getData();
        this.initTop();

    }
    initTop() {
        if (ClubCache.level == 1) {
            this.lastData.node.active = false
        }
        else {
            this.lastData.node.active = true
            UIClubModel.mInstance.APIOrgClubLevelInfo({ club_id: ClubCache.club_id }).then(() => {
                let data: any = APIOrgClubLevelInfo.Response.data;
                this.lastData.getComponent(cc.Label).string = TimeHelper.convertUTCTimeToLocalTime(data.data.up_level_time)
            })
        }
        this.currentLevel.string = 'LV.' + ClubCache.level
    }

    async getData() {
        await UIClubModel.mInstance.APIOrgClubLevelBenefit({ club_id: ClubCache.club_id });
        let data: any = APIOrgClubLevelBenefit.Response.data;
        // data = {
        //     "data": [
        //         {
        //             "id": 9,
        //             "club_level": 9,
        //             "user_num": 1500,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 8,
        //             "club_level": 8,
        //             "user_num": 1200,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 7,
        //             "club_level": 7,
        //             "user_num": 1000,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 6,
        //             "club_level": 6,
        //             "user_num": 800,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 5,
        //             "club_level": 5,
        //             "user_num": 600,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 4,
        //             "club_level": 4,
        //             "user_num": 400,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 3,
        //             "club_level": 3,
        //             "user_num": 300,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 2,
        //             "club_level": 2,
        //             "user_num": 200,
        //             "level_count": 100,
        //             "level_duration": 30
        //         },
        //         {
        //             "id": 1,
        //             "club_level": 1,
        //             "user_num": 100,
        //             "level_count": 100,
        //             "level_duration": 30
        //         }
        //     ]
        // }
        for (let index = 0; index < data.data.length; index++) { //data.data.lengt
            const element = data?.data[index];

            let item = cc.instantiate(this.itemNode)
            item.parent = this.contentNode;
            this.initItemData(item, element);
            item['levelData'] = element;
        }

    }
    initItemData(node, data) {
        node.getChildByName('levelNum').getComponent(cc.Label).string = 'Lv' + data.club_level
        node.getChildByName('levelNum').getChildByName('data').getComponent(cc.Label).string = `（${data.level_duration}天）`
        node.getChildByName('peopleNum').getChildByName('data').getComponent(cc.Label).string = data.user_num
        node.getChildByName('diamondNode').getChildByName('diamondNum').getComponent(cc.Label).string = data.level_count

    }
    upBtn(node) {
        let data = node.target['levelData']
        if (ClubCache.level >= data.club_level) {
            UIComponent.Instance.Toast('公会等级大于当前选择的等级')
            return
        }
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `确定花费 ${data.level_count} 钻石购买 Lv.${data.club_level} （${data.level_duration}天）`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    await UIClubModel.mInstance.APIOrgClubUpLevel({ club_id: ClubCache.club_id, level: data.club_level })
                    ClubCache._msg.level = data.club_level;
                    this.initTop();
                    this.post(EventName.refreshClubLevel)
                },
                noAnimation: true,
            });
    }
}
