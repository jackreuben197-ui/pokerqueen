import ComFormTitle from "../../common/ComFormTitle";
import List from "../../common/List";
import TextTabToggles, { TTabToggleData } from "../../common/TextTabToggles";
import { EOrderRecordType } from "../../config/EEnumConfig";
import GC from "../../frame/GameControl";
import { Web_Order_Rcords } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import OrderRecordItem from "./OrderRecordItem";

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/wallet/record/OrderRcordsForm')
export default class OrderRecordsForm extends BaseForm {
    private comFormTitle: ComFormTitle = null;
    private tabToggles: TextTabToggles = null;
    private list: List = null;

    private titleNodes: Map<EOrderRecordType, cc.Node> = new Map();

    private _isClub: boolean = false;
    private _curType: EOrderRecordType = EOrderRecordType.chongzhi;
    lateLoad() {
        super.lateLoad();
        this.list = this.getChildNodeOrComponent("list", List);
        this.tabToggles = this.getChildNodeOrComponent("tabToggles", TextTabToggles);
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

        this.titleNodes.set(EOrderRecordType.chongzhi, this.getChildNodeOrComponent("titleNode1"));
        this.titleNodes.set(EOrderRecordType.tiqu, this.getChildNodeOrComponent("titleNode2"));
        this.titleNodes.set(EOrderRecordType.fafang, this.getChildNodeOrComponent("titleNode3"));
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.tabToggles.onToggle = this.onToggle;
        this.list.scrollingCB = this.scrollingCB;
    }

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case Web_Order_Rcords.USER_RECORD:
            case Web_Order_Rcords.CLUB_RECORD: {
                this.updateList();
            } break;
            default:
                break;
        }
    }

    onShow(isClub?: boolean): void {
        super.onShow(isClub);
        this._isClub = isClub;
        this.comFormTitle.initData("Text_RecordLine", this);
        GC.data.wallet.orderRecord.resetData();

        let data: TTabToggleData = {
            data: [EOrderRecordType.chongzhi, EOrderRecordType.tiqu],
            title: ["adaptation10252", "adaptation10254"]
        }
        if (isClub) {
            data.data.push(EOrderRecordType.fafang);
            data.title.push("UITitle_fafang_jilu");
        }
        this.tabToggles.data = data;
        this.tabToggles.clickTab(0, null, true);
    }

    onToggle = (index: number, type: EOrderRecordType) => {
        this._curType = type;
        this.titleNodes.forEach((node, type) => {
            this.setActive(node, this._curType == type)
        })

        if (GC.data.wallet.orderRecord.getList(this._curType).length) {
            this.updateList();
        } else {
            GC.data.wallet.orderRecord.reqRecords(type, this._isClub);
        }
    }

    private _scrollingCB = (scrollView: cc.ScrollView) => {
        if (scrollView) {
            let cur = scrollView.getScrollOffset();
            let max = scrollView.getMaxScrollOffset();
            let isDown = cur.y >= max.y;
            let canReq = GC.data.wallet.orderRecord.canReq(this._curType);
            if (isDown && canReq) {
                GC.data.wallet.orderRecord.dropDownReq(this._curType);
            }
        }
    };
    public get scrollingCB() {
        return this._scrollingCB;
    }
    public set scrollingCB(value) {
        this._scrollingCB = value;
    }

    updateList() {
        this.list.numItems = GC.data.wallet.orderRecord.getList(this._curType).length
    }

    onRender(node: cc.Node, index: number) {
        let item = node.getComponent(OrderRecordItem);
        let list = GC.data.wallet.orderRecord.getList(this._curType);
        item.initData(list[index]);
    }
}