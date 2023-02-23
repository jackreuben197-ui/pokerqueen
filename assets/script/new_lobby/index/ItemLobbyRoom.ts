import { ClubCache } from "../../frame/data/club/ClubCache";
import { Web_Org_Club_Get } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemLobbyRoom extends UIBasePlus {
    //类型图标资源
    $room_type_icons: cc.Node = null;
    //房间类型图标
    cc_Sprite$type_icon: cc.Sprite = null;
    //大小盲注
    cc_Label$bb: cc.Label = null;
    //货币类型
    $icon_coin: cc.Node = null;
    $gc: cc.Node = null;
    $uc: cc.Node = null;
    //带入申请
    $icon_bring: cc.Node = null;
    //玩家数量
    cc_Label$player: cc.Label = null;
    //箭头
    $arrow: cc.Node = null;
    //禁止
    $stop: cc.Node = null;
    //////////////////////////////////
    hasClub: boolean = false;
    protected lateLoad(): void {
        super.lateLoad();
        console.log("lateLoad");
    }
    onShow(data: any): void {
        super.onShow(data);
        this.hasClub = Web_Org_Club_Get.Response.data?.length > 0;
        this.refreshUI(data);
    }
    refreshUI(data: any) {
        //gametype 图标
        this.cc_Sprite$type_icon.spriteFrame = this.getIconSpriteFrame(data.game_type);
        this.cc_Label$bb.string = `${data.sb / 100}/${data.sb * 2 / 100}`;
        this.cc_Label$player.string = `${data.roomers}/${data.seat_count}`;
        this.$icon_bring.active = !!data.limit_bring_in;
        //1-联盟 2-usdt
        this.$gc.active = data.gold_type == 1;
        this.$uc.active = data.gold_type == 2;
        this.$icon_coin.active = (data.gold_type == 1 || data.gold_type == 2);
        //判断禁用
        let club_data = Web_Org_Club_Get.Response.data;
        this.$arrow.active = this.hasClub;
        this.$stop.active = !this.hasClub;

    }

    getIconSpriteFrame(index: number) {
        return this.$room_type_icons.children[index].getComponent(cc.Sprite).spriteFrame;
    }
}
