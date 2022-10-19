/*
 * @Author: xfj
 * @Date: 2022-10-17 15:01:00
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-19 17:30:40
 * @FilePath: /pokerqueen/assets/script/lobby/labor/slidewidght.ts
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class slidewidght extends cc.Component {
    // @property(cc.Node)
    nomalItem: cc.Node = null;

    // @property(cc.Node)
    itemNode: cc.Node = null;

    // @property(cc.Node)
    selectNum: cc.Node = null;

    _targetDe = null;
    _selectIndex = 0;
    _itemData = null;
    start() {

        this.selectNum.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);
    }
    initUi(data, selectIndex = 0) {
        this.itemNode = this.node.getChildByName('itemNode')
        this.nomalItem = this.itemNode.getChildByName('nomalItem')
        this.selectNum = this.node.getChildByName('selectNum')
        let _x = 937 / (data.length - 1)
        this._itemData = data
        for (let index = this.itemNode.childrenCount - 1; index > 0; index--) {
            this.itemNode.children[index].removeFromParent();
        }

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
        this.selectNum.x = this.itemNode.children[this._selectIndex].x

        if (this.node.parent.parent.name == 'fdxm') {
            this.setFdxmUi();
        } else {
            this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = data[this._selectIndex];
        }
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
            for (let index = 0; index < this.itemNode.childrenCount; index++) {
                const element = this.itemNode.children[index];
                if (element.x < this.selectNum.x) {
                    this._selectIndex = index
                    if (this.node.parent.parent.name == 'fdxm') {
                        this.setFdxmUi();

                    } else {
                        this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = this._itemData[index];
                    }

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
        let _x1 = this.itemNode.children[_index].x - node.x;
        let _x2 = node.x - this.itemNode.children[_index - 1].x;
        if (_x1 > _x2) {
            _index = _index - 1
            this._selectIndex = _index
        } else {
            this._selectIndex = _index
        }

        node.x = this.itemNode.children[this._selectIndex].x

        if (this.selectNum.x > 937) {
            this._selectIndex = this.itemNode.childrenCount;
            node.x = 937
        }
        if (this.selectNum.x < 0) {
            this._selectIndex = 0;
            node.x = 0
        }
        if (this.node.parent.parent.name == 'fdxm') {
            this.setFdxmUi();
            // this.node.parent.parent.getChildByName('dmlbl').getComponent(cc.Label).string = this._itemData[this._selectIndex];
            // let a = this._itemData[this._selectIndex].substring(this._itemData[this._selectIndex].length - 1, this._itemData[this._selectIndex].length);
            // this.node.parent.parent.getChildByName('jfplbl').getComponent(cc.Label).string = Number(a) * 100 + '';
        } else {
            this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = this._itemData[this._selectIndex];
        }
    }

    nomalItemClick(event) {
        let node = event.target;
        this._selectIndex = node['clickIndex'];
        this.selectNum.x = node.x
        if (this.node.parent.parent.name == 'fdxm') {
            this.setFdxmUi();
        } else {
            this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = this._itemData[this._selectIndex];
        }

    }
    setFdxmUi() {
        this.node.parent.parent.getChildByName('dmlbl').getComponent(cc.Label).string = this._itemData[this._selectIndex] + "/" + this._itemData[this._selectIndex] * 2;
        this.node.parent.parent.getChildByName('jfplbl').getComponent(cc.Label).string = this._itemData[this._selectIndex] * 200 + '';
    }



    // update (dt) {}
}
