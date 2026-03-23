/*
 * @Author: xfj
 * @Date: 2022-10-24 10:50:55
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-22 19:18:06
 * @FilePath: /pokerqueen/assets/script/frame/data/rate/RateData.ts
 */
import { WebRateApi } from "../../../net/https/WebRequest";
import { BaseData } from "../../base/BaseData";
import RateModel from "./RateModel";

export default class RateData extends BaseData {
    rate: RateModel = new RateModel();

    protected notify(id: any, msg: any, sendInfo?: any): void {
        switch (id) {
            case WebRateApi.GET_RATE_LIST: {
                this.rate.updateList(msg.data, sendInfo.config_type == 1);
            } break;
            case WebRateApi.SET_CLUB_RATE: {
                this.rate.setRate(msg, sendInfo, false);
            } break;
            case WebRateApi.DELETE_CLUB_RATE: {
                this.rate.deletRate(msg, sendInfo, false);
            } break;
            default:
                break;
        }
    }




    reqRateList(isUnion: boolean = false) {
        this.reqServePost(WebRateApi.GET_RATE_LIST, {
            config_type: isUnion ? 1 : 2,
            // limit: 10,
            // offset: 0
        })

        // this.post(EventName.serverResponse, WebRateApi.CLUB_RATE_LIST, [{ type: 1, rate: 0.005 }, { type: 2, rate: 0.8 }]);
    }

    reqSetRate(to_currency: string, rate: number, id = 0, isUnion: boolean = false) {
        this.reqServePost(WebRateApi.SET_CLUB_RATE, {
            from_currency: "USD",
            from_rate: 1,
            to_currency: to_currency,
            to_rate: rate,
            id: id,
        });

        // this.post(EventName.serverResponse, WebRateApi.SET_CLUB_RATE, [{ type: type, rate: rate }]);
    }

    reqDeleteRate(id: number) {
        this.reqServePost(WebRateApi.DELETE_CLUB_RATE, {
            id: id
        });
    }


}