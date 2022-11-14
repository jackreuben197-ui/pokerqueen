/*
 * @Author: xfj
 * @Date: 2022-11-14 15:19:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-14 15:53:21
 * @FilePath: /pokerqueen/assets/script/lobby/labor/messParent.ts
 */
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/labor/messParent')
export default class messParent extends cc.Component {
    @property(cc.Prefab)
    messPfItem: cc.Prefab = null;

    @property(cc.Prefab)
    messTsItem: cc.Prefab = null;

    @property(cc.Prefab)
    messNomalItem: cc.Prefab = null;
    _data = null;
    initData(data) {
        this.node.removeAllChildren();
        this._data = data;
        let node: cc.Node = null;
        if (this._data.message_type == 1) {
            node = cc.instantiate(this.messNomalItem);
        } else if (this._data.message_type == 2) {
            node = cc.instantiate(this.messTsItem);

        } else if (this._data.message_type == 3 || this._data.message_type == 4) {
            node = cc.instantiate(this.messPfItem);
        }
        node.getComponent(node.name).initData(this._data);
        // node.position = cc.v3(0, 0, 0)
        this.node.addChild(node);
        // this.node.height = 500
    }

}
