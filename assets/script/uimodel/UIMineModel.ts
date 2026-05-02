

import { EventName } from "../config/EventName";
import GGEvent from "../event/GGEvent";
import GC from "../frame/GameControl";
import { GameCache } from "../game/GameCache";
import ToastManager from "../manager/ToastManager";
import HttpRequest from "../net/https/HttpRequest";
import { WebUserInfo } from "../net/https/WebRequest";

export class UIMineModel {

    private static _instance: UIMineModel = null;

    public static get mInstance(): UIMineModel {
        if (!this._instance) {
            this._instance = new UIMineModel();
        }
        return this._instance;
    }

    public UserInfoDto: typeof WebUserInfo.ResponseData = null;

    public modifyHeadTime: number = null;

    //#region  自已的个人信息
    public ObtainUserInfo(pAct: any) {
        this.APIUserInfo().then(
            (tDto: typeof WebUserInfo.Response) => {
                if (tDto.code == 0) {
                    this.UserInfoDto = tDto.data;
                    this.modifyHeadTime = tDto.data.user.mat;
                    GameCache.Instance.modifyNickNum = tDto.data.user.mnt;
                    // GameCache.Instance.gold = tDto.data.user.gold;
                    GC.data.user.info.gold = tDto.data.user.gold;
                    GameCache.Instance.isTestflight = tDto.data.user.province;
                    this.UIRefreshGoldEvent();
                    GC.notify.post(EventName.myGoldChange);
                    if (pAct != null)
                        pAct(tDto.data);
                } else {
                    ToastManager.Instance.createToast("" + tDto.code);
                }
            })

    }
    //#endregion

    /// <summary>
    /// 请求用户数据
    /// </summary>
    public APIUserInfo() {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserInfo,
                onSuccess: function () {
                    resolve(WebUserInfo.Response);
                }.bind(this),
                onFailure: function (content: any) {
                    reject(content);
                }.bind(this)
            });
        });
    }


    /// <summary>
    /// 刷新各个UI金币显示 
    /// </summary>
    public UIRefreshGoldEvent() {
        //Game.EventSystem.Run(EventIdType.UIMine_GoldText);\
        GC.notify.post(GGEvent.Refresh_UserInfo);
    }
}
