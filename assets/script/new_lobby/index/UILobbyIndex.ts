import SimpleNodePool from "../../common/MyNodePool";
import { UIDefine } from "../../define/UIDefine";
import GameUtil, { GameType, PokerType } from "../../game/util/GameUtil";
import WebImageHelper from "../../helper/WebImageHelper";
import { Bundle_Resources } from "../../manager/ResManager";
import SceneManager from "../../manager/SceneManager";
import { api_wallet_total, Web_Room_Center_Rooms, Web_User_Info, WWW } from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import AssetContext from "../../ui/component/AssetContext";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";
import ItemLobbyRoom from "./ItemLobbyRoom";

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
    $message: cc.Node = null;
    //Part2
    $mtt: cc.Node = null;
    $banner: cc.Node = null;
    $game: cc.Node = null;
    //table
    $table: cc.Node = null;
    $GameTypeTabs: cc.Node = null;
    //list
    $list: cc.Node = null;
    $null: cc.Node = null;
    ////////////////////////////////////
    room_item_pool: SimpleNodePool = null;
    $ItemLobbyRoom: cc.Node = null;
    //room_offset = 0;

    //当前房间列表
    curr_room_list: any[] = null;
    curr_room_offset: number = 0;
    offset_end: boolean = false;
    //一次请求的房间数量限制
    room_limit: number = 50;
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
    _gametype_status: number = 0;


    protected lateLoad(): void {
        this.name = "UILobbyIndex";
        super.lateLoad();
        this.showGameTypeTabs();
        this.room_item_pool = new SimpleNodePool(this.$ItemLobbyRoom);
        this.curr_room_list = [];
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
        this.activeRooms(false);
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
    //激活房间选项和房间列表
    private activeRooms(boo: boolean) {
        this.$table.active = boo;
        this.$list.active = boo;
    }
    ////////////////////////////////////////////////
    //游戏类型选择
    gametype_select(tab: cc.Node, on: number) {
        tab.getChildByName("label").opacity = on == 1 ? 255 : 102;
        tab.getChildByName("bg").active = Boolean(on);
    }
    set gametype_status(value: number) {
        //if (this._gametype_status == value) return;
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
    onMessageClick() {
        UIComponent.open(UIDefine.UIMyMessage, { from: 0 }, { SceneUI: SceneManager.Instance.currUI });
    }
    //banner点击
    onBannerClick() {
        console.log("onBannerClick");
    }
    //游戏入口点击
    onGameClick() {
        console.log("onGameClick");
    }

    //mtt入口点击
    onMTTClick() {
        UIComponent.open(UIDefine.MttListForm, null, { SceneUI: SceneManager.Instance.currUI })
    }
    //游戏类型页签点击
    onGameTypeTabClick(button: cc.Button) {
        let index = button.node["index"];
        if (this.gametype_status == index) return;
        this.gametype_status = index;
        this.resetCurrRoom();
        this.reqRooms();
    }
    ///////////////////////request////////////////////
    //启动
    public run() {
        this.gametype_status = 0;
        this.refreshUserInfo();
        this.resetCurrRoom();
        this.reqWalletTotal();
    }
    //重置当前房间的数据
    resetCurrRoom() {
        this.curr_room_offset = 0;
        this.curr_room_list = [];
        this.offset_end = false;
    }
    //请求总钱包
    reqWalletTotal() {

        WWW.Instance.CommonAPI(
            {
                web_class: api_wallet_total,
            }
        ).then(
            (res: any) => {

                this.cc_Label$uc_num.string = `${res.data.usdt_total / 100}`;
                this.cc_Label$gc_num.string = `${res.data.tribe_total / 100}`;
                this.reqLanguageTemplete();
            },
            (res: any) => {
                this.reqLanguageTemplete();
            }
        )
    }

    async reqLanguageTemplete() {
        await LobbySession.APIConfig_Multi_Language_Template();
        this.reqRooms();
    }

    //请求所有房间  
    reqRooms() {

        console.log("......reqRooms", this.gametype_status);

        if (this.offset_end) {
            console.log("请求到头");
            return;
        }
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Rooms,
                body: {
                    limit: this.room_limit,
                    offset: this.curr_room_offset,
                    game_type: this.GameTypeTabs[this.gametype_status].game_type,
                    poker_type: this.GameTypeTabs[this.gametype_status].poker_type,
                    order: ["players_desc", "game_type"]
                }
            }
        ).then(
            (res: any) => {
                //{"limit":50,"offset":0,"records":[],"total":0}
                this.activeRooms(true);
                this.cleanList();
                //判断数据长度0
                if (res.data.total == 0) {
                    this.$table.x = (this.gametype_status == 0) ? 2000 : 0;
                    this.$null.parent = this.$list;
                } else {
                    this.$table.x = 0;
                    this.$null.parent = null;
                    this.curr_room_list.push(...res.data.records);
                    this.refreshRooms();
                }
                if (res.data.total > this.curr_room_list.length) {
                    this.curr_room_offset += this.room_limit;
                } else {
                    this.offset_end = true;
                }
            },
            (res: any) => {

            }
        )
    }
    //////////////////////////////////
    //清理列表
    cleanList() {
        this.$list.children.forEach(item => {
            if (item.getComponent(ItemLobbyRoom)) {
                this.room_item_pool.BackNode(item);
            }
        })
        this.$list.removeAllChildren();
    }
    //刷新显示房间列表 
    refreshRooms() {
        console.log("刷新显示房间列表");
        if (this.curr_room_list.length) {
            this.curr_room_list.forEach((room, index) => {
                let item_node: cc.Node = this.room_item_pool.GetNode();
                item_node.parent = this.$list;
                let item_sc: ItemLobbyRoom = item_node.getComponent(ItemLobbyRoom);
                item_sc.onShow(room);
                item_node.on("click", this.onRoomClick, this);
                item_sc.index = index;
            });
        }
    }
    onRoomClick(button: cc.Button) {
        let sc = button.node.getComponent(ItemLobbyRoom);
        if (sc.hasClub) {
            //sc.index
            console.log("房间", sc.index);

            GameUtil.EnterRoomAPI(this.curr_room_list[sc.index]);
        } else {
            UIComponent.Instance.ToastLanguage("error2005");
        }
    }
}
