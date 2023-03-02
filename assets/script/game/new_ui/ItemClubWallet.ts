import UIBasePlus from "../../ui/UIBasePlus";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu('脚本分组/game/new_ui/ItemClubWallet')
export default class ItemClubWallet extends UIBasePlus {
    $icon: cc.Node = null;
    cc_Label$name: cc.Label = null;
    cc_Label$id: cc.Label = null;
    cc_Label$coin: cc.Label = null;
    $coin: cc.Node = null;
    $usdt: cc.Node = null;
    $select: cc.Node = null;
    ///////////////////

    // "w_u_id": 0, // 用户id
    //                         "club_id": 0, // 工会ID
    //                         "tribe_id": 0, // 联盟ID
    //                         "gold": 0, // 金豆
    //                         "gold_lock": 0,// 锁定金豆
    //                         "wallet_status": 0, // 状态(1-正常,2-停用, 3提现中)
    //                         "gold_type": 0, // 钱包类型 1:gold(联盟币)  2 usdt
    //                         "gold_currency": "", // 币种三字码
    //                         "club_random_id": 929776, // 公会随机ID
    //                         "club_name": "峨眉派" // 公会名称

    // {
    //     "last_bring_out":null,
    //     "return_table":false,
    //     "wallet":[
    //         {
    //             "w_u_id":6727,
    //             "club_id":47,
    //             "tribe_id":3,
    //             "gold":18900,
    //             "gold_lock":0,
    //             "wallet_status":3,
    //             "gold_type":1,
    //             "gold_currency":"USD",
    //             "user_status":0,
    //             "user_type":0,
    //             "club_random_id":928776,
    //             "club_name":"超级联盟"
    //         }
    //     ]
    // }
    onShow(data: any): void {
        super.onShow(data);
        this.cc_Label$name.string = data.data.club_name;
        this.cc_Label$id.string = `${data.data.club_random_id}`;
        this.cc_Label$coin.string = `${data.data.gold / 100}`;
        this.$coin.active = data.data.gold_type == 1;
        this.$usdt.active = data.data.gold_type == 2;
        this.$select.active = data.data.club_id == data.selected_wallet?.club_id;
    }

}
