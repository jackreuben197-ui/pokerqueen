/*
 * @Author: xfj
 * @Date: 2022-10-17 15:01:00
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-07 14:31:14
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
    // _itemData = null;
    _small = 0;
    _big = 0;
    _offNum = 0; //每隔数值

    onLoad() {
        this.selectNum = this.node.getChildByName('selectNum')
        this.selectNum1 = this.node.getChildByName('selectNum1')
        this.selectNum.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);

        this.selectNum1.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum1.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum1.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum1.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);
    }
    initUi(small, big, selectIndex, selectIndex1) {
        this.itemNode = this.node.getChildByName('itemNode')
        this.nomalItem = this.itemNode.getChildByName('nomalItem')
        this.nomalItem.width = 5;
        this.nomalItem.height = 5;
        this._big = big;
        this._small = small;
        let _leng = this._big / this._small

        let _x = 1000 / _leng
        this._offNum = (this._big - this._small) / (_leng - 1)
        // this._itemData = data
        for (let index = this.itemNode.childrenCount - 1; index > 0; index--) {
            this.itemNode.children[index].removeFromParent();
        }

        for (let index = 1; index < _leng; index++) {
            let node = cc.instantiate(this.nomalItem);
            node.parent = this.itemNode;
            node.width = 100;
            node.height = 100;
        }
        for (let index = 0; index < _leng; index++) {
            let _nomalItem = this.itemNode.children[index];
            _nomalItem.getChildByName('lbl').getComponent(cc.Label).string = this._small + index * this._offNum + ""
            const x = 0 + _x * index;
            _nomalItem.x = x;
            _nomalItem['clickIndex'] = index;
            // _nomalItem.on(cc.Node.EventType.TOUCH_END, this.nomalItemClick, this);
        }
        this.selectNum.x = this.itemNode.children[selectIndex].x
        this.selectNum1.x = this.itemNode.children[selectIndex1].x

        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = this._small + selectIndex * this._offNum + ''
        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string = this._small + selectIndex1 * this._offNum + ''
        this.selectNum['num'] = this._small + selectIndex * this._offNum
        this.selectNum1['num'] = this._small + selectIndex1 * this._offNum

        this.node.getChildByName('lbl_small').getComponent(cc.Label).string = this._small + ''
        this.node.getChildByName('lbl_big').getComponent(cc.Label).string = this._big + ''
    }


    /**
   * @method 拖拽开始
   */
    drogTouchStart(event, customData) {
        this._targetDe.ScrollView.enabled = false
        let node = event.target;
        let pos = node.parent.convertToNodeSpaceAR(event.getLocation());
        if (pos.x >= 0 && pos.x <= 1000) {
            node.x = pos.x;

        }

    }
    /**
     * @method 拖拽移动
     */
    drogTouchMove(event, customData) {
        let node = event.target;
        let pos = node.parent.convertToNodeSpaceAR(event.getLocation());
        if (pos.x >= 0 && pos.x <= 1000) {
            node.x = pos.x;
            for (let index = 0; index < this.itemNode.childrenCount; index++) {
                const element = this.itemNode.children[index];
                if (element.x < node.x) {
                    this.setData(node, index)
                }
            }
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
        if (node.x > 1000) {
            _index = this.itemNode.childrenCount;
            node.x = 1000
        }
        if (node.x < 0) {
            _index = 0;
            node.x = 0
        }
        this.setData(node, _index)
    }
    setData(node, index) {
        if (node.name == 'selectNum') {
            this.selectNum['num'] = this._small + index * this._offNum
        } else if (node.name == 'selectNum1') {
            this.selectNum1['num'] = this._small + index * this._offNum
        }
        let min = Math.min(this.selectNum['num'], this.selectNum1['num']) + ''
        let max = Math.max(this.selectNum['num'], this.selectNum1['num']) + ''
        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = min
        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum1').getComponent(cc.Label).string = max
    }

    // update (dt) {}
}
