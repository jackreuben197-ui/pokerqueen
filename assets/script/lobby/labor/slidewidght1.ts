/*
 * @Author: xfj
 * @Date: 2022-10-17 15:01:00
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-12-19 10:18:16
 * @FilePath: /pokerqueen/assets/script/lobby/labor/slidewidght1.ts
 */

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/labor/slidewidght1')
export default class slidewidght1 extends cc.Component {
    // @property(cc.Node)
    nomalItem: cc.Node = null;

    // @property(cc.Node)
    itemNode: cc.Node = null;

    // @property(cc.Node)
    selectNum: cc.Node = null;

    // @property(cc.Node)
    selectNum1: cc.Node = null;

    _targetDe = null;
    _itemData = null;
    start() {

        this.selectNum.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);

        this.selectNum1.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum1.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum1.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum1.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);
    }
    initUi(data, selectIndex = 0, selectIndex1 = 3) {
        this.itemNode = this.node.getChildByName('itemNode')
        this.nomalItem = this.itemNode.getChildByName('nomalItem')
        this.nomalItem.width = 100;
        this.nomalItem.height = 100;
        this.selectNum = this.node.getChildByName('selectNum')
        this.selectNum1 = this.node.getChildByName('selectNum1')
        let _x = 937 / (data.length - 1)
        this._itemData = data
        for (let index = this.itemNode.childrenCount - 1; index > 0; index--) {
            this.itemNode.children[index].removeFromParent();
        }

        for (let index = 1; index < data.length; index++) {
            let node = cc.instantiate(this.nomalItem);
            node.parent = this.itemNode;
            node.width = 100;
            node.height = 100;
        }
        for (let index = 0; index < data.length; index++) {
            let _nomalItem = this.itemNode.children[index];
            _nomalItem.getChildByName('lbl').getComponent(cc.Label).string = data[index];
            const x = 0 + _x * index;
            _nomalItem.x = x;
            _nomalItem['clickIndex'] = index;
            // _nomalItem.on(cc.Node.EventType.TOUCH_END, this.nomalItemClick, this);
        }
        this.selectNum.x = this.itemNode.children[selectIndex].x
        this.selectNum1.x = this.itemNode.children[selectIndex1].x
        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = data[selectIndex];
        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string = data[selectIndex1];
        this.selectNum['num'] = data[selectIndex];
        this.selectNum1['num'] = data[selectIndex1];
    }

    /**
   * @method 拖拽开始
   */
    drogTouchStart(event, customData) {
        this._targetDe.ScrollView.enabled = false
        let node = event.target;
        let pos = node.parent.convertToNodeSpaceAR(event.getLocation());
        if (pos.x >= 0 && pos.x <= 937) {
            node.x = pos.x;
        }


    }
    /**
     * @method 拖拽移动
     */
    drogTouchMove(event, customData) {
        let node = event.target;
        let pos = node.parent.convertToNodeSpaceAR(event.getLocation());
        if (pos.x >= 0 && pos.x <= 937) {
            node.x = pos.x;
            // for (let index = 0; index < this.itemNode.childrenCount; index++) {
            //     const element = this.itemNode.children[index];
            //     if (element.x < node.x) {
            //         this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = Math.min(this.selectNum['num'], this.selectNum1['num']) + ''
            //         this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string = Math.max(this.selectNum['num'], this.selectNum1['num']) + ''
            //     }
            // }
        }
    }

    /**
     * @method 拖拽结束
     */
    drogTouchEnd(event, customData) {
        let node = event.target;
        this._targetDe.ScrollView.enabled = true
        let _index = 0;
        for (let index = 0; index < this.itemNode.childrenCount; index++) {
            const element = this.itemNode.children[index];
            if (element.x > node.x) {
                _index = index;
                break;
            }
        }
        if (_index >= this.itemNode.childrenCount || _index <= 0) {
            return
        }
        let _x1 = this.itemNode.children[_index].x - node.x;
        let _x2 = node.x - this.itemNode.children[_index - 1].x;
        if (_x1 > _x2) {
            _index = _index - 1
        }
        node.x = this.itemNode.children[_index].x
        if (node.x > 937) {
            _index = this.itemNode.childrenCount;
            node.x = 937
        }
        if (node.x < 0) {
            _index = 0;
            node.x = 0
        }
        node['num'] = this._itemData[_index];

        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = Math.min(this.selectNum['num'], this.selectNum1['num']) + ''
        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string = Math.max(this.selectNum['num'], this.selectNum1['num']) + ''
    }

    // update (dt) {}
}
