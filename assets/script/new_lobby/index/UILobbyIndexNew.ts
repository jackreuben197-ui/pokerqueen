import List from "../../common/List";
import ListEx from "../../common/ListEx";
import SimpleNodePool from "../../common/MyNodePool";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { GameCache } from "../../game/GameCache";
import GameUtil, {
    GameEnterType,
    GameType,
    PokerType,
} from "../../game/util/GameUtil";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Bundle_Resources } from "../../manager/ResManager";
import SceneManager from "../../manager/SceneManager";
import {
    WebWalletTotal,
    WebGuildAdminHas,
    WebRoomCenterRooms,
    WebUserInfo,
    WWW,
} from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import AssetContext from "../../ui/component/AssetContext";
import { UIPasswordDialogType } from "../../ui/dialog/UIPasswordDialog";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";
import ItemLobbyRoom from "./ItemLobbyRoom";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UILobbyIndexNew extends UIBasePlus {
    $scroller: cc.Node = null;
    $content: cc.Node = null;
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

    $null: cc.Node = null;
    ////////////////////////////////////
    room_item_pool: SimpleNodePool = null;
    $ItemLobbyRoom: cc.Node = null;
    //room_offset = 0;

    //当前房间列表
    // curr_room_list: any[] = null;
    // curr_room_offset: number = 0;
    // offset_end: boolean = false;
    // //一次请求的房间数量限制
    // room_limit: number = 20;
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
    };
    _gametype_status: number = 0;

    protected lateLoad(): void {
        this.name = "UILobbyIndexNew";
        super.lateLoad();
        this.showGameTypeTabs();
        this.room_item_pool = new SimpleNodePool(this.$ItemLobbyRoom);
        this.initEX();
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.cc_Sprite$head.node, this.onHeadClick);
        this.setButtonClick(this.$message, this.onMessageClick);
        this.setButtonClick(this.$mtt, this.onMTTClick);
        this.setButtonClick(this.$banner, this.onBannerClick);
        this.setButtonClick(this.$game, this.onGameClick);
        this.listen(EventName.refreshUserData, this.refreshUserInfo);
    }

    onShow(param: any): void {
        super.onShow(param);
        this.refreshUserInfo();
        this.activeRooms(false);
    }
    refreshUserInfo() {
        WebImageHelper.SetHeadImage(
            this.cc_Sprite$head,
            WebUserInfo.Response.data.user.avatar,
        );
        this.cc_Label$welcome.string =
            "Hey," + WebUserInfo.Response.data.user.nickname + "!";
    }
    private showGameTypeTabs() {
        this.$GameTypeTabs.children.forEach((item, index) => {
            item.getChildByName("label").getComponent(cc.Label).string =
                this.GameTypeTabs[index].label;
            item["index"] = index;
            this.setButtonClick(item, this.onGameTypeTabClick);
        });
    }
    //激活房间选项和房间列表
    private activeRooms(boo: boolean) {
        this.$table.active = boo;
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
        UIComponent.open(UIDefine.UIEditInformation, null, {
            SceneUI: SceneManager.Instance.currUI,
        });
    }
    //消息点击
    onMessageClick() {
        UIComponent.open(
            UIDefine.UIMyMessage,
            { from: 2 },
            { SceneUI: SceneManager.Instance.currUI },
        );
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
        //UIComponent.open(UIDefine.MttListForm, null, { SceneUI: SceneManager.Instance.currUI })
        UIComponent.open(UIDefine.UIMTTList, null, {
            SceneUI: SceneManager.Instance.currUI,
        });
    }
    //游戏类型页签点击
    onGameTypeTabClick(button: cc.Button) {
        let index = button.node["index"];
        if (this.gametype_status == index) return;
        this.gametype_status = index;
        //this.resetCurrRoom();
        //this.reqRooms();
        this.listEx.reset();
        this.listEx.dropRequest();
    }
    ///////////////////////request////////////////////
    //启动
    public run() {
        this.gametype_status = 0;
        this.refreshUserInfo();
        this.reqWalletTotal();
        this.listEx.reset();
    }
    //请求总钱包
    reqWalletTotal() {
        WWW.Instance.CommonAPI({
            web_class: WebWalletTotal,
        }).then(
            (res: any) => {
                this.cc_Label$uc_num.string = `${StringHelper.GetLongString(res.data.tribe_total)}`;
                this.cc_Label$gc_num.string = `${StringHelper.GetLongString(res.data.usdt_total)}`;
                this.reqLanguageTemplete();
            },
            (res: any) => {
                this.reqLanguageTemplete();
            },
        );
    }

    async reqLanguageTemplete() {
        await LobbySession.APIConfig_Multi_Language_Template();
        //await LobbySession.APIUserInfo();
        //this.reqRooms();
        this.listEx.dropRequest();
    }

    //请求所有房间
    reqRooms() {
        console.log("......reqRooms", this.gametype_status);

        this.$null.parent = null;

        WWW.Instance.CommonAPI({
            web_class: WebRoomCenterRooms,
            body: {
                game_type: this.GameTypeTabs[this.gametype_status].game_type,
                poker_type: this.GameTypeTabs[this.gametype_status].poker_type,
                order: ["players_desc", "game_type"],
            },
        }).then(
            (res: any) => {
                this.activeRooms(true);

                this.listEx.refresh(res.data.records, res.data.total);

                if (res.data.total == 0) {
                    this.$null.parent = this.$content;
                }
            },
            (res: any) => {},
        );
    }

    onRoomClick(button: cc.Button) {
        if (!GameCache.Instance.isHadClub) {
            UIComponent.Instance.ToastLanguage("UIGuides_clubetips");
            return;
        }

        let room = button.node["room"];
        if (room.private_room != 1) {
            GameUtil.EnterRoomAPI(room, {
                game_enter_type: GameEnterType.Lobby,
            });
            return;
        }

        WWW.Instance.CommonAPI({
            web_class: WebGuildAdminHas,
            body: {
                club_id: room.club_id,
            },
        }).then(
            (res: any) => {
                if (res.data) {
                    GameUtil.EnterRoomAPI(room, {
                        game_enter_type: GameEnterType.Lobby,
                    });
                } else {
                    let password: string =
                        GameCache.Instance.privateRoomPdDic.get(room.rid) || "";
                    UIComponent.open<UIPasswordDialogType>(
                        UIDefine.UIPasswordDialog,
                        {
                            title: i18nMgr.Get("UIGuild_JoinGameTitle"),
                            this: this,
                            password: password,
                            commit_click: (password: string) => {
                                if (password == room.room_password) {
                                    GameCache.Instance.privateRoomPdDic.set(
                                        room.rid,
                                        password,
                                    );
                                    UIComponent.close(
                                        UIDefine.UIPasswordDialog,
                                    );
                                    GameUtil.EnterRoomAPI(room, {
                                        game_enter_type: GameEnterType.Lobby,
                                    });
                                } else {
                                    UIComponent.Instance.ToastLanguage(
                                        "roomError6_2",
                                    );
                                }
                            },
                        },
                    );
                }
            },
            (res: any) => {},
        );
    }

    ////////////////////////////////////List/////////////////////////////
    private listEx: ListEx = null;

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.$scroller.getComponent(List),
            //nullNode: this.$null_player,
            this: this,
            request: this.reqRooms,
        });
    }
    //滚动节点渲染
    render_item(node: cc.Node, index: number) {
        console.log("render_item", node);

        let data = this.listEx.data[index];
        let item_sc: ItemLobbyRoom = node.getComponent(ItemLobbyRoom);
        if (item_sc) {
            item_sc.onShow(data);
            //item_node["room"] = room;
            node.on("click", this.onRoomClick, this);
            item_sc.index = index;
        }
    }

    $main: cc.Node = null;
    protected update(dt: number): void {
        if (this.$content.y < 2000) {
            this.$main.y = this.$content.y - 1915;
        }
    }
}
