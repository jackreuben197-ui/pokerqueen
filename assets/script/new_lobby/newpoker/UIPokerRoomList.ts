import { API_User_Rooms_ids, API_User_Rooms_List, WWW } from "../../net/https/WebRequest";
import BaseFormPlus from "../../ui/form/BaseFormPlus";
import AreaCodeFormItem from "../../ui/item/AreaCodeFormItem";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPokerRoomList extends BaseFormPlus {

    protected isReqing: boolean = false;

    protected $allTabNode: cc.Node = null;
    protected $holdemTabNode: cc.Node = null;
    protected $omahaTabNode: cc.Node = null;
    protected $sixplusTabNode: cc.Node = null;

    protected cc_Sprite$allTab: cc.Sprite = null;
    protected cc_Sprite$holdemTab: cc.Sprite = null;
    protected cc_Sprite$omahaTab: cc.Sprite = null;
    protected cc_Sprite$sixplusTab: cc.Sprite = null;

    protected $dropdownBtn: cc.Node = null;
    protected $contentPoker: cc.Node = null;
    protected $bkTest: cc.Node = null;

    protected $dropdownBtn1: cc.Node = null;
    protected $tableLayout: cc.Node = null;

    // 记录 bkTest 的原始尺寸，用于动画恢复
    private _bkTestOriginalSize: cc.Size = null;
    // 记录 tableLayout 的原始尺寸，用于动画恢复
    private _tableLayoutOriginalSize: cc.Size = null;
    // 记录当前是否正在动画中
    private _isAnimating: boolean = false;
    // 记录当前是否正在动画中（tableLayout）
    private _isAnimating1: boolean = false;



    protected lateLoad() {
        this.name = "UIPokerRoomList";
        super.lateLoad();
        debugger;

        // 处理点击事件：
        if (this.$allTabNode) {
            this.$allTabNode.on(cc.Node.EventType.TOUCH_END, this.onAllTabClick, this);
            this.$holdemTabNode.on(cc.Node.EventType.TOUCH_END, this.onHoldemTabClick, this);
            this.$omahaTabNode.on(cc.Node.EventType.TOUCH_END, this.onOmahaTabClick, this);
            this.$sixplusTabNode.on(cc.Node.EventType.TOUCH_END, this.onSixPlusTabClick, this);

            // 默认选中全部：
            this.setTabSel(0);
        }

        // TEST CODE to Delete:
        if (this.$dropdownBtn)
            this.$dropdownBtn.on(cc.Node.EventType.TOUCH_END, this.onDropDownBtn, this);

        if (this.$dropdownBtn1) {
            this.$dropdownBtn1.on(cc.Node.EventType.TOUCH_END, this.onDropDownBtn1, this);
        }

        // 记录 bkTest 的原始尺寸
        if (this.$bkTest) {
            this._bkTestOriginalSize = this.$bkTest.getContentSize();
            // 初始状态为隐藏（高度设为0）
            this.$bkTest.setContentSize(this._bkTestOriginalSize.width, 0);
            // 设置锚点为 (0.5, 1)，这样展开时从上往下，收起时从下往上
            this.$bkTest.setAnchorPoint(0.5, 1);
        }

        // 记录 tableLayout 的原始尺寸
        if (this.$tableLayout) {
            this._tableLayoutOriginalSize = this.$tableLayout.getContentSize();
            // 初始状态为隐藏（高度设为0）
            this.$tableLayout.setContentSize(this._tableLayoutOriginalSize.width, 0);
            // 设置锚点为 (0.5, 1)，这样展开时从上往下，收起时从下往上
            this.$tableLayout.setAnchorPoint(0.5, 1);
        }
    }

    protected onDropDownBtn1(event: cc.Event.EventTouch): void {
        if (!this.$tableLayout || !this._tableLayoutOriginalSize) return;

        /*
        // 简单测试：直接切换高度
        let currentHeight = this.$tableLayout.getContentSize().height;
        let newHeight = currentHeight > 0 ? 0 : this._tableLayoutOriginalSize.height;
        
        this.$tableLayout.setContentSize(this._tableLayoutOriginalSize.width, newHeight);
        */

        this.$tableLayout.active = !this.$tableLayout.active;

        // 更新 Layout
        //let tableLayoutComp = this.$tableLayout.getComponent(cc.Layout);

        //if (tableLayoutComp) tableLayoutComp.updateLayout();
        let contentLayout = this.$contentPoker ? this.$contentPoker.getComponent(cc.Layout) : null;
        if (contentLayout) contentLayout.updateLayout();

    }

    protected onDropDownBtn(event: cc.Event.EventTouch): void {
        // 防止动画过程中重复点击
        if (this._isAnimating || !this.$bkTest || !this._bkTestOriginalSize) return;

        this._isAnimating = true;
        let layout = this.$contentPoker ? this.$contentPoker.getComponent(cc.Layout) : null;

        // 判断当前是显示还是隐藏状态（通过高度判断）
        let isShowing = this.$bkTest.getContentSize().height > 0;
        let targetHeight = isShowing ? 0 : this._bkTestOriginalSize.height;

        // 使用 Tween 动画改变高度，显示从下往上展开，隐藏从上往下收起
        // 由于锚点设为 (0.5, 1)，高度变化会从上往下动画
        let easing = isShowing ? "sineOut" : "sineIn";
        cc.tween(this.$bkTest)
            .to(0.2, { height: targetHeight }, { easing: easing })
            .call(() => {
                this._isAnimating = false;
                if (layout) layout.updateLayout();
            })
            .start();

        // 动画过程中更新 Layout（几个关键时间点）
        if (layout) {
            this.scheduleOnce(() => {
                if (layout) layout.updateLayout();
            }, 0.05);
            this.scheduleOnce(() => {
                if (layout) layout.updateLayout();
            }, 0.1);
            this.scheduleOnce(() => {
                if (layout) layout.updateLayout();
            }, 0.15);
        }
    }

    protected setTabSel(idx: number = 0): void {
        let tabArr: Array<cc.Sprite> = [this.cc_Sprite$allTab, this.cc_Sprite$holdemTab, this.cc_Sprite$omahaTab, this.cc_Sprite$sixplusTab];
        for (let ti: number = 0; ti < 4; ti++) {
            if (ti == idx)
                tabArr[ti].enabled = true;
            else
                tabArr[ti].enabled = false;
        }
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
    }

    protected onAllTabClick(event: cc.Event.EventTouch): void {
        console.log('All Tab clicked');
        this.setTabSel(0);
    }

    protected onHoldemTabClick(event: cc.Event.EventTouch): void {
        console.log('Holdem Tab clicked');
        this.setTabSel(1);

        this.reqRoomIdxList();
    }

    protected onOmahaTabClick(event: cc.Event.EventTouch): void {
        console.log('Omaha Tab clicked');
        this.setTabSel(2);
    }

    protected onSixPlusTabClick(event: cc.Event.EventTouch): void {
        console.log('SixPlus Tab clicked');
        this.setTabSel(3);
    }

    protected getRidList(res: any): Array<number> {

        if (res.code != 0) return;
        let arrRid: Array<number> = [];
        let arr: Array<any> = res.data.records;
        for (let ti: number = 0; ti < arr.length; ti++) {
            arrRid.push(arr[ti].rid);
        }

        return arrRid;
    }

    protected reqRoomInfo(arrRid: Array<number>) {
        this.isReqing = true;
        WWW.Instance.CommonAPI(
            {
                web_class: API_User_Rooms_List,
                body: {
                    "room_ids": arrRid
                },
            }
        ).then(
            (res: any) => {
                debugger;

                this.isReqing = false;
            },
            (res: any) => {
                //this.listEx.error();
                debugger;
                this.isReqing = false;
            }
        )
    }

    protected reqRoomIdxList(offset: number = 0): void {

        this.isReqing = true;

        WWW.Instance.CommonAPI(
            {
                web_class: API_User_Rooms_ids,// API_User_Rooms_List,
                body: {
                },
                /*
                body: {

                    limit: 10,
                    offset: offset,
                    status: [0, 1],
                    order: [MTTListOrderTypeString[MTTListOrderTypeString.start_asc]],
                },*/
            }
        ).then(
            (res: any) => {
                debugger;
                let arrRis: Array<number> = this.getRidList(res);
                if (arrRis.length > 0)
                    this.reqRoomInfo(arrRis);
                //debugger;
                //this.listEx.refresh(res.data.records, res.data.total);
                //this.isReqing = false;
            },
            (res: any) => {
                //this.listEx.error();
                debugger;
                this.isReqing = false;
            }
        )
    }


}