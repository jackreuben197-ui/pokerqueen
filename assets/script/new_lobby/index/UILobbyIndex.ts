import { UIDefine } from "../../define/UIDefine";
import { GameType, PokerType } from "../../game/util/GameUtil";
import WebImageHelper from "../../helper/WebImageHelper";
import SceneManager from "../../manager/SceneManager";
import { api_wallet_total, Web_Room_Center_Rooms, Web_User_Info, WWW } from "../../net/https/WebRequest";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILobbyIndex extends UIBasePlus {
    //Part1
    cc_Label$uc_des: cc.Label = null;
    cc_Label$uc_num: cc.Label = null;
    cc_Label$gc_des: cc.Label = null;
    cc_Label$gc_num: cc.Label = null;
    cc_Label$welcome: cc.Label = null;
    cc_Sprite$head: cc.Sprite = null;
    $message:cc.Node = null;
    //Part2
    $mtt: cc.Node = null;
    $banner:cc.Node = null;
    $game:cc.Node = null;


    //table
    $GameTypeTabs: cc.Node = null;
    ////////////////////////////////////
    room_offset = 0;

    ///////////////////////////////
    GameTypeTabs = {
        0: {
            label: "ALL",
            game_type: null,
            poker_type: null,
        },
        1: {
            label: "NLH",
            game_type: [GameType.Holdem],
            poker_type: [PokerType.Normal],
        },
        2: {
            label: "PLO",
            game_type: [GameType.Omaha4, GameType.Omaha5, GameType.Omaha6],
            poker_type: [PokerType.Normal],
        },
        3: {
            label: "6+",
            game_type: null,
            poker_type: [PokerType.SixPlus],
        },

    }
    _gametype_status: number = -1;


    protected lateLoad(): void {
        this.name = "UILobbyIndex";
        super.lateLoad();
        this.showGameTypeTabs();
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.cc_Sprite$head.node, this.onHeadClick);
        this.setButtonClick(this.$message, this.onMessageClick);
        this.setButtonClick(this.$mtt, this.onMTTClick);
        this.setButtonClick(this.$banner, this.onBannerClick);
        this.setButtonClick(this.$game, this.onGameClick);
    }

    onShow(param: any): void {
        super.onShow(param);
        this.refreshUserInfo();
        this.gametype_status = 0;
    }
    refreshUserInfo() {
        WebImageHelper.SetHeadImage(this.cc_Sprite$head, Web_User_Info.Response.data.user.avatar);
        this.cc_Label$welcome.string = "Hey," + Web_User_Info.Response.data.user.nickname + "!";
    }
    private showGameTypeTabs() {
        this.$GameTypeTabs.children.forEach((item, index) => {
            item.getChildByName("label").getComponent(cc.Label).string = this.GameTypeTabs[index].label;
            item["index"] = index;
            this.setButtonClick(item, this.onGameTypeTabClick);
        })
    }
    ////////////////////////////////////////////////
    //游戏类型选择
    gametype_select(tab: cc.Node, on: number) {
        tab.getChildByName("label").opacity = on == 1 ? 255 : 102;
        tab.getChildByName("bg").active = Boolean(on);
    }
    set gametype_status(value: number) {
        if (this._gametype_status == value) return;
        this._gametype_status = value;
        this.$GameTypeTabs.children.forEach((item, index) => {
            this.gametype_select(item, 0);
        });
        this.gametype_select(this.$GameTypeTabs.children[value], 1);
    }
    get gametype_status(): number {
        return this._gametype_status;
    }
    ///////////////////////click////////////////////
    //头像点击
    onHeadClick() {
        UIComponent.open(UIDefine.UIEditInformation, null, { SceneUI: SceneManager.Instance.currUI });
    }
    //消息点击
    onMessageClick(){
        UIComponent.open(UIDefine.UIMine_MessageList, { enterType: 2 },{ SceneUI: SceneManager.Instance.currUI });
    }
    //banner点击
    onBannerClick(){
        console.log("onBannerClick");
    }
    //游戏入口点击
    onGameClick(){
        console.log("onGameClick");
    }
    
    //mtt入口点击
    onMTTClick() {
        UIComponent.open(UIDefine.MttListForm, null, { SceneUI: SceneManager.Instance.currUI })
    }
    //游戏类型页签点击
    onGameTypeTabClick(button: cc.Button) {
        let index = button.node["index"];
        this.gametype_status = index;
        this.reqRooms(this.gametype_status);
    }
    ///////////////////////request////////////////////
    //启动
    public start() {
        this.reqWalletTotal();
    }
    //请求总钱包
    reqWalletTotal() {
        WWW.Instance.CommonAPI(
            {
                web_class: api_wallet_total,
            }
        ).then(
            (res: any) => {

                this.cc_Label$uc_num.string = `${res.data.usdt_total}`;
                this.cc_Label$gc_num.string = `${res.data.tribe_total}`;
                this.reqRooms(this.gametype_status);

            },
            (res: any) => {
                this.reqRooms(this.gametype_status);
            }
        )
    }
    //请求所有房间  
    reqRooms(index: number) {

        console.log("......reqRooms", index);

        if (origin) this.room_offset = 0;

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Rooms,
                
                body: {
                    limit: 50,
                    offset: this.room_offset,
                    game_type: this.GameTypeTabs[index].game_type,
                    poker_type: this.GameTypeTabs[index].poker_type,
                    order: ["players_desc", "game_type"]
                }
            }
        ).then(
            (res: any) => {
                if(index == 0){
                    //
                }
            },
            (res: any) => {

            }
        )
    }
}
