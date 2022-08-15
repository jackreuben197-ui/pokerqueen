import GameCache from "../manager/GameCache";
import HttpRequest from "../net/https/HttpRequest";
import { Web_User_Info, Web_User_Room } from "../net/https/WebRequest";

export class UITexasModel {
    private static instance: UITexasModel;
    public static get mInstance(): UITexasModel {
        return this.instance ||= new UITexasModel()
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
                    if (Web_User_Room.Response.code == 0) {
                        GameCache.Instance.gold = Web_User_Room.Response.data.wallet.gold;
                    }
                    resolve(Web_User_Room.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
