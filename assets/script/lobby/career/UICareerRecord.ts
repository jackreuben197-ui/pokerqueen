/*
 * @Author: xfj
 * @Date: 2023-02-02 16:40:21
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-02 17:59:26
 * @FilePath: /pokerqueen/assets/script/lobby/career/UICareerRecord.ts
 */

import TabNode from "../../common/tabNode";
import { CareerRecordTabConfig } from "../../frame/config/tabConfig";
import BaseFormPlus from "../../ui/form/BaseFormPlus";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/ctabNodeareer/UICareerRecord')
export default class UICareerRecord extends BaseFormPlus {
    @property(cc.Node)
    titleNode: cc.Node = null;
    @property(TabNode)
    tabNode: TabNode = null;
    _titleSelect = 0;
    _tabSelect = 0;
    protected lateLoad(): void {
        super.lateLoad();
    }
    onShow(param?, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.tabNode.initData(CareerRecordTabConfig, this.titleNodeClick.bind(this), this);
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
            this.bindClick(item, this.onClickTypeTabBtns, index);
        })
    }
    titleNodeClick(customData) {

    }

    onClickTypeTabBtns(_index) {
        this._titleSelect = _index
        this.titleNode.children.forEach((item, index) => {
            item.getChildByName('title').color = this._titleSelect == index ? cc.color().fromHEX('#EEF5FF') : cc.color().fromHEX('#757CAB')
            item.getChildByName('block').active = this._titleSelect == index
        })
    }

}
