import { EventName } from "../../../config/EventName";
import { TRateConfig } from "../../../config/TTypeConfig";
import GC from "../../GameControl";
import { RateConfig } from "./RateConfig";
import RateItemModel from "./RateItemModel";

export default class RateModel {
    clubList: Array<RateItemModel> = [];
    unionList: Array<RateItemModel> = [];
    config: Map<string, TRateConfig> = new Map();

    curClub: RateItemModel = null;
    curUnion: RateItemModel = null;

    constructor() {
        this.initData();
    }

    initData() {
        this.config.clear();
        RateConfig.forEach(cfg => {
            this.config.set(cfg.country, cfg);
        })
    }

    getCfg(type: string) {
        return this.config.get(type);
    }

    updateList(msgs: any, isUnion: boolean) {
        let list = this.getList(isUnion);
        list.length = 0;
        msgs.forEach(msg => {
            list.push(new RateItemModel(msg))
        })
        this.initCurRate(isUnion);
    }

    setRate(msg: any, sendInfo: any, isUnion: boolean = false) {
        let list = this.getList(isUnion);
        let item = list.find(item => item.country == msg.to_currency)
        if (!item) {
            this.addRate(msg, list)
        } else {
            item.updateRate(msg);
            GC.notify.post(EventName.addRateItem);
        }
    }

    addRate(sendInfo: any, list) {
        let item = new RateItemModel(sendInfo);
        list.push(item)
        GC.notify.post(EventName.addRateItem);
    }
    deletRate(msg: any, sendInfo: any, isUnion: boolean = false) {
        let list = this.getList(isUnion);
        let index = list.findIndex(item => item.id == sendInfo.id);
        if (index != -1) {
            list.splice(index, 1);
        }
    }

    getList(isUnion: boolean) {
        return isUnion ? this.unionList : this.clubList;
    }

    getRate(type: string, isUnion: boolean) {
        let list = this.getList(isUnion);
        return list.find(item => item.country == type);
    }

    initCurRate(isUnion: boolean) {
        let type = GC.localStore.getItem(this.getCurRateLocalKey(isUnion));
        let rate = null;
        if (type) {
            rate = this.getRate(type, isUnion)
        }

        if (!rate) {
            let list = this.getList(isUnion);
            if (list.length) {
                rate = list[0];
                this.setCurRate(rate.country, isUnion);
            }
        }

        if (isUnion) {
            this.curUnion = rate;
        } else {
            this.curClub = rate;
        }
    }

    getCurRate(isUnion: boolean) {
        return isUnion ? this.curUnion : this.curClub;
    }
    setCurRate(country: string, isUnion: boolean) {
        let item = this.getRate(country, isUnion);
        GC.localStore.setItem(this.getCurRateLocalKey(isUnion), item.country);

        if (isUnion) {
            this.curUnion = item;
        } else {
            this.curClub = item;
        }
        GC.notify.post(EventName.curSelectRateChange);
    }

    getCurRateLocalKey(isUnion: boolean) {
        return `${isUnion ? "union" : "cliub"}_rate_country`;
    }
}