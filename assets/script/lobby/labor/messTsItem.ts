/*
 * @Author: xfj
 * @Date: 2022-11-12 11:37:53
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-14 20:18:07
 * @FilePath: /pokerqueen/assets/script/lobby/labor/messTsItem.ts
 */

import TimeHelper from "../../helper/TimeHelper";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/labor/messTsItem')
export default class messTsItem extends cc.Component {
    _data = null;
    @property(cc.Node)
    lblNode: cc.Node = null
    @property(cc.Label)
    mess: cc.Label = null
    @property(cc.Label)
    dm: cc.Label = null
    initData(data) {
        this._data = data
        this.mess.string = this._data.content
        this.dm.string = TimeHelper.convertUTCTimeToLocalTime(this._data.create_time)

        setTimeout(() => {
            this.node.height = this.lblNode.height + 150
            this.dm.node.y = - this.lblNode.height - 70
            // this.node.parent.height = this.node.height
        }, 100)

    }
    closeClick() {
        this.node.removeFromParent();
    }
}
