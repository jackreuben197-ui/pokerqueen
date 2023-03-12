import { ClubCache } from "../../frame/data/club/ClubCache";
import { GameCache } from "../../game/GameCache";
import { StringHelper } from "../../helper/StringHelper";
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
    //上锁
    $icon_lock: cc.Node = null;

    // 1 平台，2 联盟，3 公会 4 朋友桌
    $icon_origin_type: cc.Node = null;

    //防作弊类型 0 未知 1 无 2 实时语音 3 实时视频 4 人脸验证 
    $icon_anti_cheat_type: cc.Node = null;
    //带入申请
    $icon_bring: cc.Node = null;
    //玩家数量
    cc_Label$player: cc.Label = null;
    //箭头
    $arrow: cc.Node = null;
    //禁止
    $stop: cc.Node = null;
    //////////////////////////////////
    //hasClub: boolean = false;
    protected lateLoad(): void {
        super.lateLoad();
        console.log("lateLoad");
    }
    onShow(data: any): void {
        super.onShow(data);
        //this.hasClub = Web_Org_Club_Get.Response.data?.length > 0;
        this.refreshUI(data);
    }
    refreshUI(data: any) {

        //gametype 图标
        this.cc_Sprite$type_icon.spriteFrame = this.getIconSpriteFrame(data.poker_type, data.game_type);
        this.cc_Label$bb.string = `${StringHelper.GetLongString(data.sb)}/${StringHelper.GetLongString(data.sb * 2)}(${data.ante})`;
        this.cc_Label$player.string = `${data.seat_count - data.empty_seat}/${data.seat_count}`;
        this.$icon_bring.active = !!data.limit_bring_in;
        //1-联盟 2-usdt
        this.$icon_coin.active = (data.gold_type == 1 || data.gold_type == 2);
        this.$icon_coin.getChildByName("uc").active = data.gold_type == 1;
        this.$icon_coin.getChildByName("gc").active = data.gold_type == 2;

        //牌桌类型
        this.$icon_origin_type.getChildByName("platform").active = data.origin_type == 1;
        this.$icon_origin_type.getChildByName("union").active = data.origin_type == 2;
        this.$icon_origin_type.getChildByName("club").active = data.origin_type == 3;
        this.$icon_origin_type.getChildByName("friend").active = data.origin_type == 4;

        //刷新 anti_cheat_type 图标
        this.$icon_anti_cheat_type.active = data.anti_cheat_type > 1;
        this.$icon_anti_cheat_type.getChildByName("voice").active = data.anti_cheat_type == 2;
        this.$icon_anti_cheat_type.getChildByName("video").active = data.anti_cheat_type == 3;
        this.$icon_anti_cheat_type.getChildByName("face").active = data.anti_cheat_type == 4;

        //加密房间
        this.$icon_lock.active = data.room_password?.length > 0;

        //判断禁用
        this.$arrow.active = GameCache.Instance.hasClub;
        this.$stop.active = !GameCache.Instance.hasClub;

    }

    getIconSpriteFrame(poker_type: number, game_type: number) {
        //return this.$room_type_icons.children[index].getComponent(cc.Sprite).spriteFrame;
        if (poker_type == 0) {
            return this.$room_type_icons.children[game_type].getComponent(cc.Sprite).spriteFrame;
        }
        if (poker_type == 2) {
            return this.$room_type_icons.children[4].getComponent(cc.Sprite).spriteFrame;
        }
    }
}
