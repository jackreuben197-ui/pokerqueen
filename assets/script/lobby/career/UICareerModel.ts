/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-09 10:41:52
 * @FilePath: /pokerqueen/assets/script/lobby/career/UICareerModel.ts
 */

import HttpRequest from "../../net/https/HttpRequest";
import { WebStatsMttRoomDetailApi, WebRoomCenterHistoryGroup, WebStatsUserStatsAll } from "../../net/https/WebRequest";

export class UICareerModel {
    private static instance: UICareerModel = null;
    _coinType = null;
    public static get mInstance(): UICareerModel {
        if (!this.instance) {
            this.instance = new UICareerModel();
        }
        return this.instance;
    }
    WebStatsUserStatsAll(parms, juhua: boolean = true) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebStatsUserStatsAll,
                body: WebStatsUserStatsAll.Request(parms),
                onSuccess: function () {
                    resolve(WebStatsUserStatsAll.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                juhua: juhua
            });
        });
    }
    WebRoomCenterHistoryGroup(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRoomCenterHistoryGroup,
                body: WebRoomCenterHistoryGroup.Request(parms),
                onSuccess: function () {
                    resolve(WebRoomCenterHistoryGroup.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
    * MTT 比赛列表详情
    */
    async WebStatsMttRoomDetailApi(matchID, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: WebStatsMttRoomDetailApi.API.replace("{id}", matchID.toString()),
                request: WebStatsMttRoomDetailApi,
                body: WebStatsMttRoomDetailApi.Request(param),
                onSuccess: function () {
                    resolve(WebStatsMttRoomDetailApi.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }


    //////////////////////////////////////////////////////

}
