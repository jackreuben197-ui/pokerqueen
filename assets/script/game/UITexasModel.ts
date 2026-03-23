
import GC from "../frame/GameControl";
import HttpRequest from "../net/https/HttpRequest";
import { WebOrgFriendBringIn, WebStatsOtherUserStats, WebUserInfo, WebUserRoom, WebUserRoomSettleDetail } from "../net/https/WebRequest";
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
                api: WebUserRoom.API.replace("{id}", GameCache.Instance.room_id.toString()),
                request: WebUserRoom,
                onSuccess: function () {
                    // if (WebUserRoom.Response.code == 0) {
                    //     GameCache.Instance.gold = WebUserRoom.Response.data.wallet.gold;
                    // }
                    resolve(WebUserRoom.Response);
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
                api: WebUserRoomSettleDetail.API.replace("{id}", roomId),
                request: WebUserRoomSettleDetail,
                onSuccess: function () {
                    resolve(WebUserRoomSettleDetail.Response);
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
                api: WebStatsOtherUserStats.API.replace("{id}", user_id.toString()),
                body: WebStatsOtherUserStats.Request(user_id),
                request: WebStatsOtherUserStats,
                onSuccess: function () {
                    resolve(WebStatsOtherUserStats.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /// 通过俱乐部id 获取钱包
    public GetGoldByClubID(club_id: number,): number {

        let gold = 0;

        let wallet = WebUserRoom.Response?.data?.wallet;

        if (wallet?.length) {
            for (let item of wallet) {
                if (club_id == item.club_id) {
                    gold = item.gold;
                    break;
                }
            }
        }
        return gold;
    }
}