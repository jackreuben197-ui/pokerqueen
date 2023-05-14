/*
 * @Author: xfj
 * @Date: 2023-02-02 13:32:23
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-02 15:04:00
 * @FilePath: /pokerqueen/assets/script/common/dropDownBoxNew.ts
 */

import { threadId } from "worker_threads";
import { UIDefine } from "../define/UIDefine";
import AssetContext, { AssetFold } from "../ui/component/AssetContext";
import UIBase from "../ui/UIBase";
import UIComponent from "../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/common/dropDownBoxNew')
export default class dropDownBoxNew extends UIBase {
    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    item: cc.Node = null;
    _dataConfig = null;
    private cb: Function = null;
    _selectData = null;
    _selectIndex = 0;
    initData(dataConfig, _index = 0, _cb = null) {
        this._dataConfig = dataConfig;
        this.cb = _cb
        this.contentNode.removeAllChildren();
        for (let index = 0; index < this._dataConfig.length; index++) {
            const element = cc.instantiate(this.item)
            element.parent = this.contentNode
            element['_index'] = index
            let flag = element.getChildByName('flag').getComponent(cc.Label)
            let up = cc.find('flag/up', element).getComponent(cc.Sprite)
            up.spriteFrame = AssetContext.getAsset(this._dataConfig.type + '', AssetFold.texture_new_club)
            this.setText(flag, this._dataConfig[index].desc);
            flag["_forceUpdateRenderData"]();
            element.on("click", (event) => {
                this.setState(event.node['_index'])
            }, this)

        }
        this.setState(_index)
    }
    protected lateLoad(): void {
        super.lateLoad();

    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.initData(param.data, param.index, param.cb)
    }
    setState(_index) {
        this._selectData = this._dataConfig[_index]
        for (let index = 0; index < this.contentNode.childrenCount; index++) {
            const element = this.contentNode.children[index];
            cc.find('nomal/select', element).active = element['_index'] == _index
        }
        this._selectIndex = _index;
    }

    close() {
        UIComponent.close(UIDefine.dropDownBoxNew)
    }
    close1() {
        if (this.cb) {
            this.cb(this._selectData, this._selectIndex);
        }
        UIComponent.close(UIDefine.dropDownBoxNew)
    }
}
