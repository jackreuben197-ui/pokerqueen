//钱包数据
export default class WalletModel {
    public static get Instance(): WalletModel {
        return (this as any).__Instance ??= new WalletModel();
    }
    public Gold: string = "0";
    public USDT: string = "0";

    Remain: string = "余额";

    Record_Dec = {
        1: "充值数量", 2: "提现数量", 4: "兑换数量"
    };
    Record_Recharge_Status = ["", "充值中", "充值成功", "充值失败"];
    Record_Withdraw_Status = ["", "提现中", "提现成功", "提现失败"];
    Record_Exchange_Status = ["", "兑换中", "兑换成功", "兑换失败"];

    Top_Tab_Text = ["账户", "记录", "申请"];
    Op_Tab_Text = ["充 值", "提 现", "转 换"];
    Record_Tab_Text = ["充值记录", "提现记录", "转换记录"];

    Apply_Des_Text = {
        //gold_type 金币类型
        1: {
            //order_type 1,2,4
            1: "申请补充金豆",
            2: "申请提取金豆",
            4: "申请兑换金豆"
        },
        2: {
            1: "申请补充USDT",
            2: "申请提取USDT",
            4: "申请兑换USDT"
        }
    }
    //审批状态
    Apply_Status_Text = {
        1: "",
        2: "已通过",
        3: "已拒绝",
    }
    Change_Tabs_Text = ["兑换金豆", "兑换USDT"];

    Change_Input_Text = ["请输入数量", "自动计算数量"];

    Change_Des_Text = ["金豆", "兑换按照以上汇率进行转换", "兑换完成后不可取消"];

    Change_Button_Text = ["全部", "兑 换"];

    Change_Success = "兑换申请成功";

    //兑换率
    gold_to_usdt_rate: number = 0;

    usdt_to_gold_rate: number = 0;

    //钱包类型
    wallet_type: number = 0;
    //公会id 不同公会请求参数不同
    club_id:number = 0;
}
