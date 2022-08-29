
import HttpRequest from "../net/https/HttpRequest";
import { Web_User_Info, Web_User_Room } from "../net/https/WebRequest";
import {GameCache} from "./GameCache";

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