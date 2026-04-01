import SimpleNodePool from "../../common/MyNodePool";
import { EventName } from "../../config/EventName";
import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { GameCache } from "../../game/GameCache";
import GameUtil, { GameEnterType, GameType, PokerType } from "../../game/util/GameUtil";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { Bundle_Resources } from "../../manager/ResManager";
import SceneManager from "../../manager/SceneManager";
import { api_wallet_total, Web_Guild_AdminHas, Web_Room_Center_Rooms, Web_User_Info, WWW } from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import AssetContext from "../../ui/component/AssetContext";
import { UIPasswordDialogType } from "../../ui/dialog/UIPasswordDialog";
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

    /**
     * 测试毛玻璃的遮罩背景
     */
    $scroller: cc.Node = null;
    $glass: cc.Node = null;
    private baseYVal: number = 0;

    $glass1: cc.Node = null;
    private baseYVal1: number = 0;

    $glass2: cc.Node = null;
    private baseYVal2: number = 0;

    $pokerglass: cc.Node = null;
    private baseYValPoker: number = 0;

    mScrollView: cc.ScrollView = null;
    // 记录上一次的滚动位置，用于判断是否在滚动
    private lastScrollOffset: cc.Vec2 = cc.Vec2.ZERO;
    // 滚动状态标志
    private isScrolling: boolean = false;
    // 滚动停止的计时器（用于判断滚动是否结束）
    private scrollStopTimer: number = 0;

    /**
     * 客服区的按钮：
     */
    cc_Button$service: cc.Button = null;
    cc_Button$game1: cc.Button = null;
    cc_Button$game2: cc.Button = null;

    /**
     * 几大游戏板块:
     */
    $mahjong: cc.Node = null;
    $match: cc.Node = null;
    $xgame: cc.Node = null;
    $poker: cc.Node = null;


    /**
     * River: 新加入变量的测试，后期删除上面的旧数据与变量。
     */
    protected cc_Label$noticelabel: cc.Label = null;

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


    /**
     * 实时滚动回调
     * @param offset 当前滚动偏移量
     * @param scrollSpeed 滚动速度（像素/帧）
     */
    protected onScrolling(offset: cc.Vec2, scrollSpeed: number = 0): void {
        // 每次滚动都会触发此回调

        // 获取 content 节点相对于 view 的绝对世界坐标
        let contentWorldPos = this.mScrollView.content.convertToWorldSpaceAR(cc.Vec2.ZERO);

        //console.log("正在滚动，当前 Y 偏移:", offset.y, "滚动速度:", scrollSpeed.toFixed(2));
        this.$glass.y = this.baseYVal - offset.y;
        this.$glass1.y = this.baseYVal1 - offset.y;
        this.$glass2.y = this.baseYVal2 - offset.y;
        this.$pokerglass.y = this.baseYValPoker - offset.y;

        // 进阶：判断是否滚动到了底部
        let maxOffset = this.mScrollView.getMaxScrollOffset();
        if (offset.y >= maxOffset.y - 10) { // 增加10像素容差
            console.log("已滚动到底部");
        }
    }

    /**
     * 滚动开始时触发
     */
    protected onScrollBegan(): void {
        //console.log("滚动开始");
        this.isScrolling = true;
    }

    /**
     * 滚动停止时触发
     */
    protected onScrollEnded(): void {
        //console.log("滚动停止");
        this.isScrolling = false;

        // 可以在这里执行滚动结束后的操作，例如加载更多数据
        let offset = this.mScrollView.getScrollOffset();
        let maxOffset = this.mScrollView.getMaxScrollOffset();
        if (offset.y >= maxOffset.y - 10) {
            console.log("滚动停止在底部，加载更多数据");
            this.reqRooms();
        }
    }

    protected lateLoad(): void {
        this.name = "UILobbyIndex";
        super.lateLoad();

        if (this.cc_Label$noticelabel) {
            this.cc_Label$noticelabel.string = 'hello,world! 此处播放广播消息，长度过长的话，会被截断。';
        }

        debugger;
        // 获取 ScrollView 组件
        if (this.$scroller) {

            this.mScrollView = this.$scroller.getComponent(cc.ScrollView);
            // 初始化滚动位置记录
            this.lastScrollOffset = this.mScrollView.getScrollOffset();

            this.baseYVal = this.$glass.y;
            this.baseYVal1 = this.$glass1.y;
            this.baseYVal2 = this.$glass2.y;
            this.baseYValPoker = this.$pokerglass.y;

        }

        // 注册按钮点击事件:
        if (this.cc_Button$game1) {
            this.cc_Button$game1.node.on(cc.Node.EventType.TOUCH_END, this.onGame1Click, this);
            this.cc_Button$game2.node.on(cc.Node.EventType.TOUCH_END, this.onGame2Click, this);
            this.cc_Button$service.node.on(cc.Node.EventType.TOUCH_END, this.onServiceClick, this);
        }

        if (this.$mahjong) {
            this.$mahjong.on(cc.Node.EventType.TOUCH_END, this.onMahjong, this);
            this.$match.on(cc.Node.EventType.TOUCH_END, this.onMatch, this);
            this.$xgame.on(cc.Node.EventType.TOUCH_END, this.onXgame, this);
            this.$poker.on(cc.Node.EventType.TOUCH_END, this.onPoker, this);
        }

        // 旧代码本身后期也需要删除:
        // 以下旧代码会产生异常，暂不执行：
        return;
        this.showGameTypeTabs();
        this.room_item_pool = new SimpleNodePool(this.$ItemLobbyRoom);
        this.curr_room_list = [];

    }

    protected onGame1Click(event: cc.Event.EventTouch): void {
        console.log('Game 1 clicked');
    }
    protected onGame2Click(event: cc.Event.EventTouch): void {
        console.log('Game 2 clicked');
    }
    protected onServiceClick(event: cc.Event.EventTouch): void {
        console.log('Service clicked');
    }
    protected onMahjong(event: cc.Event.EventTouch): void {
        console.log('麻将区域被点击.');
    }
    protected onMatch(event: cc.Event.EventTouch): void {
        console.log('赛事区域被点击.');
    }
    protected onXgame(event: cc.Event.EventTouch): void {
        console.log('小游戏区域被点击.');
    }
    protected onPoker(event: cc.Event.EventTouch): void {
        console.log('扑克区域被点击.');
        UIComponent.open(UIDefine.UIPokerRoomList, null, { SceneUI: SceneManager.Instance.currUI })
    }


    /**
     * 每帧更新，用于实时检测滚动状态
     */
    protected update(dt: number): void {
        // 如果没有 ScrollView 组件，直接返回
        if (!this.mScrollView) return;

        // 获取当前滚动位置
        let currentOffset = this.mScrollView.getScrollOffset();

        // 计算滚动速度（像素/秒）
        let scrollSpeed = 0;
        if (this.isScrolling) {
            let distance = currentOffset.y - this.lastScrollOffset.y;
            scrollSpeed = Math.abs(distance) / dt;
        }

        // 判断位置是否发生变化
        if (!currentOffset.equals(this.lastScrollOffset)) {
            // 位置发生变化，说明正在滚动
            if (!this.isScrolling) {
                // 从静止状态进入滚动状态
                this.onScrollBegan();
            }
            // 触发滚动回调
            this.onScrolling(currentOffset, scrollSpeed);
            // 更新记录的位置
            this.lastScrollOffset = currentOffset;
            // 重置停止计时器
            this.scrollStopTimer = 0;
        } else {
            // 位置没有变化
            if (this.isScrolling) {
                // 累计停止时间
                this.scrollStopTimer += dt;
                // 如果连续多帧位置不变（例如超过0.2秒），认为滚动停止
                if (this.scrollStopTimer > 0.2) {
                    this.onScrollEnded();
                }
            }
        }
    }

    /**
     * 组件销毁时调用，清理资源
     */
    public onDestroy(): void {
        // 清理滚动相关的状态
        this.isScrolling = false;
        this.scrollStopTimer = 0;
        this.lastScrollOffset = cc.Vec2.ZERO;
        super.onDestroy();
    }
    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.cc_Sprite$head.node, this.onHeadClick);
        this.setButtonClick(this.$message, this.onMessageClick);
        this.setButtonClick(this.$mtt, this.onMTTClick);
        this.setButtonClick(this.$banner, this.onBannerClick);
        this.setButtonClick(this.$game, this.onGameClick);
        this.listen(EventName.refreshUserData, this.refreshUserInfo)
    }

    onShow(param: any): void {
        super.onShow(param);
        this.refreshUserInfo();
        this.activeRooms(false);
    }
    refreshUserInfo() {
        //WebImageHelper.SetHeadImage(this.cc_Sprite$head, Web_User_Info.Response.data.user.avatar);
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
        if (!this.$table || !this.$list) return;
        this.$table.active = boo;
        this.$list.active = boo;
    }
    ////////////////////////////////////////////////
    //游戏类型选择
    gametype_select(tab: cc.Node, on: number) {
        tab.getChildByName("label").opacity = on == 1 ? 255 : 102;
        tab.getChildByName("line").active = Boolean(on);
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
        console.log("消息点击处理.");
        UIComponent.open(UIDefine.UIMyMessage, { from: 2 }, { SceneUI: SceneManager.Instance.currUI });
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
        UIComponent.open(UIDefine.UIMTTList, null, { SceneUI: SceneManager.Instance.currUI })
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

        // River:先不管消息处理：
        return;

        this.gametype_status = 0;
        this.refreshUserInfo();
        this.resetCurrRoom();
        //this.reqWalletTotal();
        this.reqLanguageTemplete();
    }
    //重置当前房间的数据
    resetCurrRoom() {
        this.curr_room_offset = 0;
        this.curr_room_list = [];
        this.offset_end = false;
    }

    async reqLanguageTemplete() {
        await LobbySession.APIConfig_Multi_Language_Template(false);
        //await LobbySession.APIUserInfo();
        this.reqRooms();
    }

    //请求所有房间  
    reqRooms() {

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
                },
                juhua: false
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
        if (this.$list) {
            this.$list.children.forEach(item => {
                if (item.getComponent(ItemLobbyRoom)) {
                    this.room_item_pool.BackNode(item);
                }
            })
            this.$list.removeAllChildren();
        }
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
                item_node["room"] = room;
                item_node.on("click", this.onRoomClick, this);
                item_sc.index = index;
            });
        }
    }
    onRoomClick(button: cc.Button) {

        if (!GameCache.Instance.isHadClub) {
            UIComponent.Instance.ToastLanguage("UIGuides_clubetips");
            return;
        }

        let room = button.node["room"];
        if (room.private_room != 1) {
            GameUtil.EnterRoomAPI(room, { game_enter_type: GameEnterType.Lobby });
            return;
        }

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Guild_AdminHas,
                body: {
                    club_id: room.club_id
                }
            }
        ).then(
            (res: any) => {

                if (res.data) {
                    GameUtil.EnterRoomAPI(room, { game_enter_type: GameEnterType.Lobby });
                } else {
                    let password: string = GameCache.Instance.privateRoomPdDic.get(room.rid) || "";
                    UIComponent.open<UIPasswordDialogType>(UIDefine.UIPasswordDialog, {
                        title: i18nMgr.Get("UIGuild_JoinGameTitle"),
                        this: this,
                        password: password,
                        commit_click: (password: string) => {
                            if (password == room.room_password) {
                                GameCache.Instance.privateRoomPdDic.set(room.rid, password);
                                UIComponent.close(UIDefine.UIPasswordDialog);
                                GameUtil.EnterRoomAPI(room, { game_enter_type: GameEnterType.Lobby });
                            } else {
                                UIComponent.Instance.ToastLanguage("roomError6_2");
                            }
                        },

                    })
                }
            },
            (res: any) => {

            }
        )
    }
}
