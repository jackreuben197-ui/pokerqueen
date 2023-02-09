/*
 * @Author: xfj
 * @Date: 2022-09-20 16:26:41
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-09 10:41:52
 * @FilePath: /pokerqueen/assets/script/lobby/career/UICareerModel.ts
 */

import HttpRequest from "../../net/https/HttpRequest";
import { api_stats_mtt_room_detail, api_roomcenter_history_group, api_stats_user_stats_all } from "../../net/https/WebRequest";

export class UICareerModel {
    private static instance: UICareerModel = null;
    _coinType = null;
    public static get mInstance(): UICareerModel {
        if (!this.instance) {
            this.instance = new UICareerModel();
        }
        return this.instance;
    }
    api_stats_user_stats_all(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: api_stats_user_stats_all,
                body: api_stats_user_stats_all.Request(parms),
                onSuccess: function () {
                    resolve(api_stats_user_stats_all.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    api_roomcenter_history_group(parms) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: api_roomcenter_history_group,
                body: api_roomcenter_history_group.Request(parms),
                onSuccess: function () {
                    resolve(api_roomcenter_history_group.Response);
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
    async api_stats_mtt_room_detail(matchID, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: api_stats_mtt_room_detail.API.replace("{id}", matchID.toString()),
                request: api_stats_mtt_room_detail,
                body: api_stats_mtt_room_detail.Request(param),
                onSuccess: function () {
                    resolve(api_stats_mtt_room_detail.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    } '


    //////////////////////////////////////////////////////

}
