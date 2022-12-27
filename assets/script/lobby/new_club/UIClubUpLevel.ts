/*
 * @Author: xfj
 * @Date: 2022-12-27 11:14:08
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-27 12:23:14
 * @FilePath: /pokerqueen/assets/script/lobby/new_club/UIClubUpLevel.ts
 */

import BaseForm from "../../ui/form/BaseForm";
import ComFormTitle from "../../common/ComFormTitle";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { UIClubModel } from "../labor/UIClubModel";
import { APIOrgClubLevelBenefit } from "../../net/https/WebRequest";
import UIComponent from "../../ui/UIComponent";
import { UIDefine } from "../../define/UIDefine";
import UIDialogComponent from "../../ui/dialog/UIDialogComponent";
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
    }
    async getData() {
        this.currentLevel.string = 'LV.' + ClubCache.level
        await UIClubModel.mInstance.APIOrgClubLevelBenefit({ club_id: ClubCache.club_id });
        let data: any = APIOrgClubLevelBenefit.Response.data;
        // data = data.data.sort((a, b) => b - a);
        for (let index = 0; index < data.data.length; index++) {
            const element = data.data[index];

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
        node.getChildByName('diamondNum').getComponent(cc.Label).string = data.level_count

    }
    upBtn(node) {
        let data = node.target['levelData']
        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `确定花费 ${data.level_count} 钻石购买 Lv + ${data.club_level} （${data.level_duration}天）`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                    this.node.active = false;
                },
                noAnimation: true,
            });
    }
}
