/*
 * @Author: xfj
 * @Date: 2022-10-17 15:01:00
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-01 19:22:05
 * @FilePath: /pokerqueen/assets/script/lobby/labor/slidewidght.ts
 */

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/labor/slidewidght')
export default class slidewidght extends cc.Component {
    // @property(cc.Node)
    nomalItem: cc.Node = null;

    // @property(cc.Node)
    itemNode: cc.Node = null;

    // @property(cc.Node)
    selectNum: cc.Node = null;

    fillsp: cc.Node = null;
    _targetDe = null;
    _selectIndex = 0;
    _itemData = null;
    initListen() {
        this.selectNum.on(cc.Node.EventType.TOUCH_START, this.drogTouchStart, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_MOVE, this.drogTouchMove, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_END, this.drogTouchEnd, this);
        this.selectNum.on(cc.Node.EventType.TOUCH_CANCEL, this.drogTouchEnd, this);
    }
    initUi(data, selectIndex = 0) {
        this.itemNode = this.node.getChildByName('itemNode')
        this.nomalItem = this.itemNode.getChildByName('nomalItem')
        this.nomalItem.width = 100;
        this.nomalItem.height = 100;
        this.selectNum = this.node.getChildByName('selectNum')
        this.fillsp = this.node.getChildByName('fillsp')
        this.initListen();

        let _x = 1000 / (data.length - 1)
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
        this._selectIndex = selectIndex;
        this.selectNum.x = this.itemNode.children[this._selectIndex].x
        this.fillsp.width = this.selectNum.x
        if (this.node.parent.parent.name == 'dxm') {
            this.setFdxmUi();
        } else {
            this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = data[this._selectIndex];
        }
        cc.find('labelNode/lblNum', this.node.parent.parent)['_dataNum'] = this._itemData[this._selectIndex]

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
            this.fillsp.width = this.selectNum.x
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
            this.fillsp.width = this.selectNum.x
            for (let index = 0; index < this.itemNode.childrenCount; index++) {
                const element = this.itemNode.children[index];
                if (element.x < this.selectNum.x) {
                    this._selectIndex = index
                    if (this.node.parent.parent.name == 'dxm') {
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
        if (_index >= this.itemNode.childrenCount || _index <= 0) {
            return
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
        this.fillsp.width = this.selectNum.x
        if (this.selectNum.x > 1000) {
            this._selectIndex = this.itemNode.childrenCount;
            node.x = 1000
            this.fillsp.width = 1000
        }
        if (this.selectNum.x < 0) {
            this._selectIndex = 0;
            node.x = 0
            this.fillsp.width = 0
        }
        cc.find('labelNode/lblNum', this.node.parent.parent)['_dataNum'] = this._itemData[this._selectIndex]

        if (this.node.parent.parent.name == 'dxm') {
            this.setFdxmUi();
            this._targetDe.changeQzsh(this._itemData[this._selectIndex]);
            this._targetDe.resetDrjfp();
        } else {
            this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = this._itemData[this._selectIndex];
        }
    }

    nomalItemClick(event) {
        // let node = event.target;
        // this._selectIndex = node['clickIndex'];
        // this.selectNum.x = node.x
        // cc.find('labelNode/lblNum', this.node.parent.parent)['_dataNum'] = this._itemData[this._selectIndex]
        // if (this.node.parent.parent.name == 'dxm') {
        //     this.setFdxmUi();
        //     this._targetDe.resetDrjfp();
        //     this._targetDe.changeQzsh(this._itemData[this._selectIndex]);
        // } else {
        //     cc.find('labelNode/lblNum', this.node.parent.parent)['_dataNum'] = this._itemData[this._selectIndex]
        //     this.node.parent.parent.getChildByName('labelNode').getChildByName('lblNum').getComponent(cc.Label).string = this._itemData[this._selectIndex];
        // }
    }
    setFdxmUi() {
        cc.find('labelNode/lblNum', this.node.parent.parent).getComponent(cc.Label).string = this._itemData[this._selectIndex] + "/" + this._itemData[this._selectIndex] * 2;
    }



    // update (dt) {}
}
