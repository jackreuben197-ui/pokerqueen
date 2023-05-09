import { TextColor } from "../../../config/GameConfig";
import { i18nMgr } from "../../../i18n/i18nMgr";

//钱包数据
export default class WalletModel {
    public static get Instance(): WalletModel {
        return (this as any).__Instance ??= new WalletModel();
    }
    //缓存当前货币
    public Gold: string = "0";
    public USDT: string = "0";

    Remain: string = "余额";

    // Record_Dec = {
    //     1: "充值数量", 2: "提现数量", 4: "兑换数量"
    // };

    Record_Exchange_Status = ["", "adaptation10204", "adaptation10199", "Uibacklistgoods_erro"];

    //兑换率
    gold_to_usdt_rate: number = 0;

    usdt_to_gold_rate: number = 0;

    //钱包类型
    wallet_type: number = 0;
    //公会id 不同公会请求参数不同
    //club_id: number = 0;

    //充豆状态文本颜色
    recharge_status_textColors = [TextColor.Color4, TextColor.Color5, TextColor.Color6, TextColor.Color6];

    /**
     * @param type 0:Recharge 1:Exchange
     * 返回文本組
     */
    getTags(type: number): string[] {
        let tags = [];
        if (type == 0) {
            tags = i18nMgr.Get("Wallet_Flow7").split("^");
            tags.push(i18nMgr.Get("Wallet_Flow6"));
        } else {
            tags = i18nMgr.Get("Wallet_Flow8").split("^");
            tags.push(i18nMgr.Get("UIEXCHANGERECORD_receivetips"));
        }
        return tags;
    }
    //获取充豆状态文本 1 充值|提现中 2 充值|提现完成 3 充值|提现失败
    getRechargeStatusText(status: number) {
        let index = status - 1;
        let text = i18nMgr.Get("Wallet_Flow1").split("^")[index];
        let color = this.recharge_status_textColors[index];
        return `<color=${color}>${text}</color>`
    }
    //获取申请状态文本
    getApplyStatusText(type: number) {
        if (type == 1) return i18nMgr.Get("Text_Add");
        if (type == 4) return i18nMgr.Get("Text_Trans");
        return "";
    }
    getApplyResultText(status: number) {
        if (status == 2) return `<color=${TextColor.Color5}>${i18nMgr.Get("UIClub_RoomSitApplyRecords_ok")}</color>`;
        if (status == 3) return `<color=${TextColor.Color6}>${i18nMgr.Get("UIClub_RoomSitApplyRecords_no")}</color>`;
        return "";
    }
}
