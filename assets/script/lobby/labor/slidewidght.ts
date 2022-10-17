/*
 * @Author: xfj
 * @Date: 2022-10-17 15:01:00
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-17 18:14:28
 * @FilePath: /pokerqueen/assets/script/lobby/labor/slidewidght.ts
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class slidewidght extends cc.Component {
    @property(cc.Node)
    nomalItem: cc.Node = null;

    @property(cc.Node)
    itemNode: cc.Node = null;

    @property(cc.Node)
    selectNum: cc.Node = null;

    _targetDe = null;
    _selectIndex = 0;
    onLoad() {
        this.itemNode = this.node.getChildByName('itemNode')
        this.nomalItem = this.itemNode.getChildByName('nomalItem')
        this.selectNum = this.node.getChildByName('nomalItem')
        this.selectNum.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);
    }
    initUi(data, selectIndex = 0) {
        let _x = 937 / (data.length - 1)
        for (let index = 1; index < data.length; index++) {
            let node = cc.instantiate(this.nomalItem);
            node.parent = this.itemNode;

        }
        for (let index = 0; index < data.length; index++) {
            let _nomalItem = this.itemNode.children[index];
            _nomalItem.getChildByName('lbl').getComponent(cc.Label).string = data[index];
            const x = 0 + _x * index;
            _nomalItem.x = x;
            _nomalItem['clickIndex'] = index;
            _nomalItem.on(cc.Node.EventType.TOUCH_END, this.nomalItemClick, this);
        }
        this._selectIndex = selectIndex;

    }
    /**
   * @method 拖拽开始
   */
    drogTouchStart(event, customData) {
        let node = event.target;
        let pos = node.parent.convertToNodeSpaceAR(event.getLocation());
        if (pos.x < 0 || pos > 937) return
        node['pos'] = node.position.x;
        node.position.x = pos.x;

    }
    /**
     * @method 拖拽移动
     */
    drogTouchMove(event, customData) {
        let node = event.target;
        let pos = node.parent.convertToNodeSpaceAR(event.getLocation());
        if (pos.x < 0 || pos > 937) return
        node['pos'] = node.position.x;
        node.position.x = pos.x;

    }

    /**
     * @method 拖拽结束
     */
    drogTouchEnd(event, customData) {
        let _index = 0;
        for (let index = 0; index < this.itemNode.childrenCount; index++) {
            const element = this.itemNode.children[index];
            if (element.x > this.selectNum.x) {
                _index = index;
                break;
            }
        }
        let _x1 = this.itemNode.children[_index].x - this.selectNum.x;
        let _x2 = this.selectNum.x - this.itemNode.children[_index - 1].x;
        if (_x1 > _x2) {
            this._selectIndex = _index - 1;
            this.selectNum.x = this.itemNode.children[_index - 1].x
        } else {
            this._selectIndex = _index;
            this.selectNum.x = this.itemNode.children[_index].x
        }
        if (this.selectNum.x > 937) {
            this._selectIndex = this.itemNode.childrenCount;
            this.selectNum.x = 937
        }
        if (this.selectNum.x < 0) {
            this._selectIndex = 0;

            this.selectNum.x = 0
        }

    }

    nomalItemClick(event) {
        let node = event.target;
        this._selectIndex = node['clickIndex'];
        this.selectNum.x = node.x
    }

    start() {

    }

    // update (dt) {}
}
