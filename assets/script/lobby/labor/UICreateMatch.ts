/*
 * @Author: xfj
 * @Date: 2022-10-17 13:50:18
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-10-17 18:02:38
 * @FilePath: /pokerqueen/assets/script/lobby/labor/UICreateMatch.ts
 */

import BaseForm from "../../ui/form/BaseForm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UICreateMatch extends BaseForm {
    _curType = 0;
    tabBtnsParent: cc.Node = null;
    matchType: cc.Node = null;
    jfp: cc.Node = null;
    xzlx: cc.Node = null;
    fwfbl: cc.Node = null;
    fddm: cc.Node = null;
    fdxm: cc.Node = null;
    zwsl: cc.Node = null;
    zdks: cc.Node = null;
    qwsz: cc.Node = null;
    pjsc: cc.Node = null;
    jfpbs: cc.Node = null;
    zdcl: cc.Node = null;
    zxbljf: cc.Node = null;
    zss: cc.Node = null;
    sksj: cc.Node = null;
    ipdzxz: cc.Node = null;
    gpszx: cc.Node = null;
    bm: cc.Node = null;
    Straddle: cc.Node = null;
    select: cc.Node = null;
    itemData = {
        zwsl: [2, 3, 4, 5, 6, 7, 8, 9],
        zdks: [2, 3, 4, 5, 6, 7, 8, 9],
        qwsz: [0, 1, 2, 4, 8, 18, 20, 30],
        pjsc: [0.5, 1, 2, 3, 4, 5, 6],
        jfpbs: [1, 2, 3, 4, 5, 6, 7, 8],
        zdcl: ['不限', 25, 30, 35, 40, 45],
        zxbljf: [1, 2, 3, 4],
        zss: ['不限', 50, 100, 300, 1000],
        sksj: [10, 12, 15, 18, 20, 25, 30],
    }
    protected lateLoad(): void {
        super.lateLoad();
        this.tabBtnsParent = this.getChildNodeOrComponent("tabBtns");
        this.tabBtnsParent.children.forEach((item, index) => {
            this.bindClick(item, this.onClickTabBtns, index);
        })
        this.matchType = this.getChildNodeOrComponent('matchType')
        this.jfp = this.getChildNodeOrComponent('jfp')
        this.xzlx = this.getChildNodeOrComponent('xzlx')
        this.fwfbl = this.getChildNodeOrComponent('fwfbl')
        this.fddm = this.getChildNodeOrComponent('fddm')
        this.fdxm = this.getChildNodeOrComponent('fdxm')
        this.zwsl = this.getChildNodeOrComponent('zwsl')
        this.zdks = this.getChildNodeOrComponent('zdks')
        this.qwsz = this.getChildNodeOrComponent('qwsz')
        this.pjsc = this.getChildNodeOrComponent('pjsc')
        this.jfpbs = this.getChildNodeOrComponent('jfpbs')
        this.zdcl = this.getChildNodeOrComponent('zdcl')
        this.zxbljf = this.getChildNodeOrComponent('zxbljf')
        this.zss = this.getChildNodeOrComponent('zss')
        this.sksj = this.getChildNodeOrComponent('sksj')
        this.ipdzxz = this.getChildNodeOrComponent('ipdzxz')
        this.gpszx = this.getChildNodeOrComponent('gpszx')
        this.bm = this.getChildNodeOrComponent('bm')
        this.Straddle = this.getChildNodeOrComponent('Straddle')
        this.select = this.getChildNodeOrComponent('select')

        this.initUI()
    }
    private onClickTabBtns(index: number): void {
        this.switchTab(index);
    }
    switchTab = (type) => {
        if (this._curType != type) {
            this._curType = type;
            this.switchTabBtnState();

            this.switchTabView(type);
        }
    }
    switchTabBtnState() {
        this.tabBtnsParent.children.forEach((item, index) => {
            let choose = item.getChildByName("choose");
            let normal = item.getChildByName("normal");
            choose.active = this._curType == index;
            normal.active = this._curType != index;
        })
    }

    switchTabView(type) {

    }

    onShow(data?: any, fromUI?: BaseForm) {
        super.onShow(data, fromUI);
    }
    initUI() {
        //
        let zwslItem: any = cc.find('item/Rectangle', this.zwsl).getComponent('slidewidght');
        zwslItem.initUi(this.itemData.zwsl)

        let zdksItem: any = cc.find('item/Rectangle', this.zdks).getComponent('slidewidght');
        zdksItem.initUi(this.itemData.zdks)

        let qwszItem: any = cc.find('item/Rectangle', this.qwsz).getComponent('slidewidght');
        qwszItem.initUi(this.itemData.qwsz)

        let pjscItem: any = cc.find('item/Rectangle', this.pjsc).getComponent('slidewidght');
        pjscItem.initUi(this.itemData.pjsc)

        let jfpbsItem: any = cc.find('item/Rectangle', this.jfpbs).getComponent('slidewidght');
        jfpbsItem.initUi(this.itemData.jfpbs)

        let zdclItem: any = cc.find('item/Rectangle', this.zdcl).getComponent('slidewidght');
        zdclItem.initUi(this.itemData.zdcl)

        let zxbljfItem: any = cc.find('item/Rectangle', this.zxbljf).getComponent('slidewidght');
        zxbljfItem.initUi(this.itemData.zxbljf)

        let zssItem: any = cc.find('item/Rectangle', this.zss).getComponent('slidewidght');
        zssItem.initUi(this.itemData.zss)

        let sksjItem: any = cc.find('item/Rectangle', this.sksj).getComponent('slidewidght');
        sksjItem.initUi(this.itemData.sksj)
    }
    saveModel() {

    }

    baganGame() {

    }

}
