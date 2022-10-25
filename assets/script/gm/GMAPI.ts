
import { GameCache } from "../game/GameCache";
import HttpRequest from "../net/https/HttpRequest";

export class GM {
    /**
     * 用户信息请求
     */
    static async Web_GMC_Recharge() {
        let param: typeof Web_GMC_Recharge.RequestParams = {
            amount: 5000000,
            user_id: GameCache.Instance.nUserId
        }
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_GMC_Recharge,
                body: Web_GMC_Recharge.Request(param),
                onSuccess: function () {
                    resolve(Web_GMC_Recharge.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
}
(window as any).GM = GM;
export var GM_Templete = {
    Recharge:
        `{
        "amount":5000000,
        "user_id":%0
    }`
}
/**
 * GM 加钱接口
 */
export class Web_GMC_Recharge {
    //接口地址
    public static API: string = "/api/user/debug/recharge";
    //字段声明
    public static RequestParams: {
        amount?: number,
        user_id?: number
    } = null;

    public static ResponseData: {
        flow_id?: number;
        wallet: typeof Web_GMC_Recharge.Wallet;
    } = null;
    public static Wallet:
        {
            w_u_id: number,
            gold: number,
            gold_lock: number,
            wallet_status: number,
        } = null;


    public static Request(param: typeof Web_GMC_Recharge.RequestParams) {
        this.RequestParams = param;
        return param;
    }
    public static Response: { code?: number, message?: string, data?: typeof Web_GMC_Recharge.ResponseData };
}
