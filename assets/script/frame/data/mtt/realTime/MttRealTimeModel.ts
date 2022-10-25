import { TMttRank } from "../../../../config/TTypeConfig";
import GC from "../../../GameControl";
import MttRealTimeItemModel from "./MttRealTimeItemModel";

export default class MttRealTimeModel {
    private _totlePages: number = 0;
    private _ranks: Map<number, Array<MttRealTimeItemModel>> = new Map();
    private _limit: number = 10;

    private _curPage: number = 0;

    resetData() {
        this._ranks.clear();
        this._curPage = 0;
        this._totlePages = 0;
    }

    reqRankList(pageNum: number = 0) {
        if (pageNum == 0) {
            this.resetData();
        }
        let offSet = pageNum * this._limit;
        GC.data.mtt.reqRealTimeRankList(offSet, this._limit);
    }

    updateRankList(msg: TMttRank) {
        this._totlePages = Math.ceil(msg.total / this._limit);
        let page = Math.floor(msg.offset / this._limit);
        let ranks = this._ranks.get(page);
        if (!ranks) {
            ranks = [];
            this._ranks.set(page, ranks);
        } else {
            ranks.length = 0;
        }
        msg.records.forEach(r => ranks.push(new MttRealTimeItemModel(r)));
    }

    get ranks() {
        return this._ranks.get(this._curPage);
    }
    get totlePage() {
        return this._totlePages;
    }
    get curPage() {
        return this._curPage;
    }
    set curPage(p) {
        if (p < 0 || p > this._totlePages || p == this._curPage) return
        this._curPage = p;
        this._curPage = this._curPage < 0 ? 0 : this._curPage;
        this._curPage = this.curPage > this._totlePages ? this._totlePages : this._curPage;
        let ranks = this._ranks.get(this._curPage);
        if (!ranks) {
            this.reqRankList(this._curPage);
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
        this.curPage = this._totlePages;
    }


}