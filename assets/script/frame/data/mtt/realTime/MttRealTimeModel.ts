import { TMttRank } from "../../../../config/TTypeConfig";
import GC from "../../../GameControl";
import MttRealTimeBlindsModel from "./MttRealTimeBlindsModel";
import MttRealTimeRankItemModel from "./MttRealTimeRankItemModel";
import MttRealTimeRealPrizeModel from "./MttRealTimeRealPrizeModel";
import MttRealTimeRoomsModel from "./MttRealTimeRoomsModel";

export default class MttRealTimeModel {
    private _rankTotlePages: number = 0;
    private _ranks: Map<number, Array<MttRealTimeRankItemModel>> = new Map();
    private _rankLimit: number = 10;
    private _rankCurPage: number = 0;



    resetData() {
        this._ranks.clear();
        this._rankCurPage = 0;
        this._rankTotlePages = 0;
    }

    reqRankList(pageNum: number = 0) {
        if (pageNum == 0) {
            this.resetData();
        }
        let offSet = pageNum * this._rankLimit;
        GC.data.mtt.reqRealTimeRankList(offSet, this._rankLimit);
    }

    updateRankList(msg: TMttRank) {
        this._rankTotlePages = Math.ceil(msg.total / this._rankLimit);
        let page = Math.floor(msg.offset / this._rankLimit);
        let ranks = this._ranks.get(page);
        if (!ranks) {
            ranks = [];
            this._ranks.set(page, ranks);
        } else {
            ranks.length = 0;
        }
        msg.records.forEach(r => ranks.push(new MttRealTimeRankItemModel(r)));
    }

    get ranks() {
        return this._ranks.get(this._rankCurPage);
    }
    get totlePage() {
        return this._rankTotlePages;
    }
    get curPage() {
        return this._rankCurPage;
    }
    set curPage(p) {
        if (p < 0 || p > this._rankTotlePages || p == this._rankCurPage) return
        this._rankCurPage = p;
        this._rankCurPage = this._rankCurPage < 0 ? 0 : this._rankCurPage;
        this._rankCurPage = this.curPage > this._rankTotlePages ? this._rankTotlePages : this._rankCurPage;
        let ranks = this._ranks.get(this._rankCurPage);
        if (!ranks) {
            this.reqRankList(this._rankCurPage);
        }
    }

    firstPage() {
        this.curPage = 0;
    }
    frontPage() {
        this.curPage--;
    }
    nextPage() {
        this.curPage++;
    }
    lastPage() {
        this.curPage = this._rankTotlePages;
    }






    realPrize: MttRealTimeRealPrizeModel = new MttRealTimeRealPrizeModel();
    updateRealPrize(msg) {
        this.realPrize.updateData(msg);
    }

    rooms: MttRealTimeRoomsModel = new MttRealTimeRoomsModel();
    updateRooms(msg) {
        this.rooms.updateData(msg);
    }

    blinds: MttRealTimeBlindsModel = new MttRealTimeBlindsModel();


}