
import HttpRequest from "../net/https/HttpRequest";
import { Web_Stats_Other_User_Stats, Web_User_Info, Web_User_Room, Web_User_Room_Settle_Detail } from "../net/https/WebRequest";
import { GameCache } from "./GameCache";

export class UITexasModel {
    private static instance: UITexasModel = null;
    public static get mInstance(): UITexasModel {
        if (!this.instance) {
            this.instance = new UITexasModel();
        }
        return this.instance;
    }
    /// <summary>
    /// 本房间带出信息
    /// </summary>
    /// <param name="pAct"></param>
    public APIUserRoom() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_User_Room.API.replace("{id}", GameCache.Instance.room_id.toString()),
                request: Web_User_Room,
                onSuccess: function () {
                    // if (Web_User_Room.Response.code == 0) {
                    //     GameCache.Instance.gold = Web_User_Room.Response.data.wallet.gold;
                    // }
                    resolve(Web_User_Room.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /// <summary>
    /// 获取结算信息
    /// </summary>
    /// <param name="Act"></param>
    public APIUserRoomSettleDetail(roomId: string) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_User_Room_Settle_Detail.API.replace("{id}", roomId),
                request: Web_User_Room_Settle_Detail,
                onSuccess: function () {
                    resolve(Web_User_Room_Settle_Detail.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /// 牌局内玩家战绩数据
    /// </summary>
    public getOtherUserStats(user_id) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_Stats_Other_User_Stats.API.replace("{id}", GameCache.Instance.room_id.toString()),
                body: Web_Stats_Other_User_Stats.Request(user_id),
                request: Web_Stats_Other_User_Stats,
                onSuccess: function () {
                    resolve(Web_Stats_Other_User_Stats.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}