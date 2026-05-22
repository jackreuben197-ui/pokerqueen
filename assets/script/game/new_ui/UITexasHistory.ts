import SimpleNodePool from '../../common/MyNodePool';
import SliderPlus from '../../common/SliderPlus';
import { TextColor } from '../../config/GameConfig';
import GC from '../../frame/GameControl';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import PublicHelper from '../../helper/PublicHelper';
import { StringHelper } from '../../helper/StringHelper';
import { WebRoomCenterHistoryReplay, WebRoomCenterHistoryViewPublicCards, WebRoomCenterHistoryViewPublicCardsFreeCount, WebRoomCenterGameWatch, WebRoomCenterGameWatchNum, WebUserDiamondsWallet, WWW } from '../../net/https/WebRequest';
import HttpRequest from '../../net/https/HttpRequest';
import ProtocolAgency from '../../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../../net/websocket/ProtocolCode';
import UIBasePlus from '../../ui/UIBasePlus';
import UIComponent from '../../ui/UIComponent';
import AssetContext, { AssetFold } from '../../ui/component/AssetContext';
import { CardTypeUtil } from '../CardTypeUtil';
import { GameCache } from '../GameCache';
import GameUtil from '../util/GameUtil';
import playerCardNode, { IPlayerCardData } from '../../crazyPoker/gameplay/common/view/cardhisory/playerCardNode';
import { ResManager } from '../../manager/ResManager';
import DiamondModel from '../../diamond/DiamondModel';
import { replayGet, replaySet, roomKey, matchKey } from '../../tools/ReplayCacheDB';
import { WebMiscGameRecordRound, WebMiscGameRoundStatus, WebMiscGameRemoveRound } from '../../net/https/web_request/WebRequestMisc';

export class HistoryInfoData {
    public bInsurance: boolean;
    public bJackPot: boolean;
    public Blindstr: string;
    public bgroupBet: number;
    public handNum: number;
    public room_id: number;
    public match_id: number;
    public room_unique_id: string;
    // public ReferenceCollector rcPokerSprite;
}

export class PlayerInfo {
    public playerId: number; //uid 随机ID
    public userName: string; //名字
    public headPic: string; //头像
    public seatID: number; //座位号
    public initChip: number = 0; //初始筹码
    public maxCardIndex: number[]; //最大牌型数组下标
    public maxCardType: number; //最大牌型
    public winAnte: number = 0; //输赢筹码
    public insuranceGain: number = 0; //保险
    public handCards: number[]; //手牌
    public isMine: boolean; //是否是自己
    public playerPosition: number;
    public handBet: number = 0;
    public maxCardType2: number; //最大牌型
    public maxCardIndex2: number[]; //最大牌型数组下标
    public winAnte2: number[]; //第二套公共牌输赢筹码
}

export class PlayerActionDataInfo {
    public nickNameStr; // 昵称// 玩家昵称，@%分割
    public headStr; //  头像，@%分割
    public playerPosition; // 用户位置 盲注/大盲注/庄家
    public actList; // 玩家操作明细
    public actChipList; // 玩家操作对应筹码
    public leftChips; //玩家剩余筹码
    public isMine; //是否是自己
    public playerId; //玩家id
    public raiseTimes; //加注次数
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasHistory extends UIBasePlus {
    currentPage = 0;
    totalPage = 0;
    private _pendingHandNum: number = -1;
    historyInfoData: HistoryInfoData;
    AllPlayerPaiPu: cc.Node = null;
    AllPlayerPaiPuInfoObj: cc.Node = null;
    Image_Insurance: cc.Node = null;
    AllPlayerSecondInfoObj: cc.Node = null;
    InfoList: cc.Node = null;
    PreflopInfoList: cc.Node = null;
    Preflop: cc.Node = null;
    PreflopInfoObj: cc.Node = null;
    FlopInfoList: cc.Node = null;
    FlopNum: cc.Node = null;
    TurnInfoList: cc.Node = null;
    TurnNum: cc.Node = null;
    RiverInfoList: cc.Node = null;
    RiverNum: cc.Node = null;
    ShowdownInfoList: cc.Node = null;
    ShowdownNum: cc.Node = null;
    ShowdownInfoList2: cc.Node = null;
    ShowdownNum2: cc.Node = null;
    GameObject: cc.Node = null;
    PublicCards: Array<number> = [];
    SecondPublicCards: Array<number> = [];
    HaveSecondCard: boolean = false;
    rcPokerSprite: cc.Node;
    tableSeatIds: Array<number> = [];
    AllPlayerCardsInfos = [];
    AllPlayerCardsInfosPreFlop = [];
    AllPlayerCardsInfosFlop = [];
    AllPlayerCardsInfosTurn = [];
    AllPlayerCardsInfosRiver = [];
    AllPlayerCardsInfosWinner = [];
    buttonFirstPage: cc.Button = null;
    buttonLastPage: cc.Button = null;
    buttonPrePage: cc.Button = null;
    buttonNextPage: cc.Button = null;
    Text_num: cc.Label = null;
    m_winUserId = 0;
    /// 0 庄家，1 小盲注，2 大盲注，3 枪口，4 枪口+1，5 中位1，6 中位2，7 劫位，8 关位
    /// </summary>
    private PlayerPositionStr = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP1', 'MP2', 'HJ', 'CO'];
    /// <summary>
    /// 0 ，1 小盲注，2 大盲注，3 跟住，4 让牌，5 强制盲注，6 下注，7 加注，8 3次加注，9 全下，10 弃牌，11 保险，
    /// </summary>
    private PlayerActionStr = ['', 'SB', 'BB', 'C', 'X', 'S', 'B', 'R', '3B', 'A', 'F', 'INS'];
    playerInfos: PlayerInfo[] = null;
    playerInfosPreFlop: PlayerActionDataInfo[] = null;
    playerInfosFlop: PlayerActionDataInfo[] = null;
    playerInfosTurn: PlayerActionDataInfo[] = null;
    playerInfosRiver: PlayerActionDataInfo[] = null;
    playerInfosWinner: PlayerInfo[] = null;
    $bg_click: cc.Node = null;
    //顶部包含房间信息
    $Top: cc.Node = null;
    // Dashboard 概览区 (Layout节点, 自动绑定)
    $Dashboard: cc.Node = null;
    $DetailsBtn: cc.Node = null;
    private detailsExpanded: boolean = false;
    $Score: cc.Node = null;
    $Preflop: cc.Node = null;
    $Flop: cc.Node = null;
    $Turn: cc.Node = null;
    $River: cc.Node = null;
    $Showdown: cc.Node = null;
    $Showdown2: cc.Node = null;
    /////////////////////////////////////
    //1.Score
    $Score_Childs: cc.Node = null;
    //child模板
    $Score_Child: cc.Node = null;
    $Score_Second_Child: cc.Node = null;
    Score_Child_Pool: SimpleNodePool = null;
    Score_Second_Child_Pool: SimpleNodePool = null;
    //公共牌 1-2
    $Score_PublicCards: cc.Node = null;
    //$Score_PublicCards2: cc.Node = null;
    /////////////////////////////////////
    /////////////////////////////////////
    //2.Preflop
    $Preflop_Childs: cc.Node = null;
    //child模板
    $Preflop_Child: cc.Node = null;
    Preflop_Child_Pool: SimpleNodePool = null;
    $Preflop_title_childs: cc.Node = null;
    ////////////////////////////////////
    /////////////////////////////////////
    //3.Flop
    $Flop_Childs: cc.Node = null;
    //child模板
    $Flop_Child: cc.Node = null;
    Flop_Child_Pool: SimpleNodePool = null;
    $Flop_Cards: cc.Node = null;
    ////////////////////////////////////
    /////////////////////////////////////
    //4.Flop
    $Turn_Childs: cc.Node = null;
    //child模板
    $Turn_Child: cc.Node = null;
    Turn_Child_Pool: SimpleNodePool = null;
    $Turn_Cards: cc.Node = null;
    ////////////////////////////////////
    /////////////////////////////////////
    //5.River
    $River_Childs: cc.Node = null;
    //child模板
    $River_Child: cc.Node = null;
    River_Child_Pool: SimpleNodePool = null;
    $River_Cards: cc.Node = null;
    ////////////////////////////////////
    //第一套结算
    $Showdown_Childs: cc.Node = null;
    Showdown_Child_Pool: SimpleNodePool = null;
    $Showdown_PublicCards: cc.Node = null;
    //第二套结算
    $Showdown2_Childs: cc.Node = null;
    Showdown2_Child_Pool: SimpleNodePool = null;
    $Showdown2_PublicCards: cc.Node = null;
    //总滚动容器
    $content: cc.Node = null;
    //不同手牌数不同的位置
    cards_position = {
        2: -142,
        4: -155,
        5: -198,
        6: -241
    };
    color_green = cc.color(86, 181, 87);
    color_red = cc.color(230, 68, 85);
    color_yellow = cc.color(255, 184, 83, 255);
    color_gray = cc.color(198, 198, 198);
    SliderPlus$slider: SliderPlus = null;
    cc_Label$page: cc.Label = null;
    $DiamondNum: cc.Node = null;
    $PeekButton: cc.Node = null;
    $PeekCost: cc.Node = null;
    $ViewPubButton: cc.Node = null;
    $ViewPubCost: cc.Node = null;
    $left_btn: cc.Node = null;
    $right_btn: cc.Node = null;
    $progressBlue: cc.Node = null;
    // Dashboard 概览区 - 动态生成的 playerCardNode 实例列表
    private dashboardNodes: cc.Node[] = [];
    private playerCardPrefab: cc.Prefab = null;
    // 偷偷看：缓存已偷看到的手牌数据
    private beWatchedUserHands: { user_rid: number; data: string }[] = [];
    // 偷偷看：服务端返回的累计偷看次数（阶梯收费用）
    private _peekCount: number = 0;
    // 发发看：免费次数
    private _viewPubFreeCount: number = 0;
    // 缓存最后一份回放数据，用于发发看后重新渲染 Dashboard
    private _lastResponseData: any = null;
    // 自己是否参与了当前这手牌 (对齐 Unity _hasMe)
    private _hasMe: boolean = false;
    // 当前手牌是否已收藏
    private _isCollected: boolean = false;
    $favoBtn: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        // 禁用 top_block 的 BlockInputEvents，它是 bg 的子节点且覆盖全屏，
        // 会拦截触摸导致兄弟节点 Scroller 无法接收拖动事件
        let topBlock = cc.find('bg/top_block', this.node);
        if (topBlock) {
            let blockComp = topBlock.getComponent(cc.BlockInputEvents);
            if (blockComp) blockComp.enabled = false;
        }
        this.InitUI();
        this.playerInfos = [];
        this.playerInfosPreFlop = [];
        this.playerInfosFlop = [];
        this.playerInfosTurn = [];
        this.playerInfosRiver = [];
        this.playerInfosWinner = [];
        this.Score_Child_Pool = new SimpleNodePool(this.$Score_Child);
        this.Score_Second_Child_Pool = new SimpleNodePool(this.$Score_Second_Child);
        this.Preflop_Child_Pool = new SimpleNodePool(this.$Preflop_Child);
        this.Flop_Child_Pool = new SimpleNodePool(this.$Flop_Child);
        this.Turn_Child_Pool = new SimpleNodePool(this.$Turn_Child);
        this.River_Child_Pool = new SimpleNodePool(this.$River_Child);
        this.Showdown2_Child_Pool = new SimpleNodePool(this.$Score_Child);
        this.$Score_Childs.removeAllChildren();
        // 预加载 playerCardNode prefab
        this.loadPlayerCardPrefab();
        // 隐藏 $Dashboard 下的静态 playerNode 模板
        this.hideDashboardTemplate();
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$bg_click, this.click_bg);
        this.setButtonClick(this.$left_btn, this.click_left);
        this.setButtonClick(this.$right_btn, this.click_right);
        this.setButtonClick(this.$DetailsBtn, this.click_detailsBtn);
        this.setButtonClick(this.$PeekButton, this.click_peekButton);
        this.setButtonClick(this.$ViewPubButton, this.click_viewPubButton);
        this.setButtonClick(this.$favoBtn, this.click_favoBtn);
        let exitBtn = this.$Top.getChildByName('exit_button');
        if (exitBtn) exitBtn.on(cc.Node.EventType.TOUCH_END, this.click_bg, this);
    }

    onShow(obj?: any): void {
        super.onShow(obj);
        if (null == obj) return;
        this.historyInfoData = obj as HistoryInfoData;
        //rcPokerSprite = historyInfoData.rcPokerSprite;
        //imageMenuMask.gameObject.SetActive(true);
        this.currentPage = 0;
        //this.bInitListView = false;
        // buttonFirstPage.interactable = false;
        // buttonLastPage.interactable = false;
        // buttonPrePage.interactable = false;
        // buttonNextPage.interactable = false;
        this.InitRoomInfo();
        this.reqDiamondBalance();
        this.reqPeekPrice();
        //初始化空心牌数量
        this.$Preflop_title_childs.children.forEach((item, index) => {
            item.active = index < GameCache.Instance.CurGame.HandCards;
        });
        //模拟数据
        // this.Protocol_Holdem_PublicReplay_Handler(this.moni_data);
        // this.SliderPlus$slider.show({
        //     min_value: 1,
        //     max_value: 3,
        //     step: 1,
        //     change: this.sliderChange,
        //     own: this
        // });
        // this.sliderChange(3);
        ///////////////////////////////////////////////////
        //总页数
        this.totalPage = Math.max(0, this.historyInfoData.handNum - 1);
        //PageSlider.minValue = 1;
        // if (this.totalPage < 1) {
        //     //PageSlider.maxValue = 1;
        // }
        // else {
        //     //PageSlider.maxValue = totalPage;
        // }
        if (this.totalPage == 0) {
            //第一手没打完不请求
            this.SliderPlus$slider.show({
                min_value: 0,
                max_value: 0,
                step: 1,
                change: this.sliderChange,
                touch_end: this.sliderTouchEnd,
                own: this
            });
            this.cc_Label$page.string = '0/0';
            this.syncProgressBlue();
            return;
        }
        this.registerHandler();
        this.SliderPlus$slider.show({
            min_value: 1,
            max_value: this.totalPage,
            step: 1,
            change: this.sliderChange,
            touch_end: this.sliderTouchEnd,
            own: this
        });
        this.SliderPlus$slider.value = this.totalPage;
        this.RefreshData(this.totalPage);
    }

    click_left() {
        if (this.currentPage - 1 > 0) {
            this.SliderPlus$slider.value = this.currentPage - 1;
            this.RefreshData(this.currentPage);
        }
    }

    click_right() {
        if (this.currentPage + 1 <= this.totalPage) {
            this.SliderPlus$slider.value = this.currentPage + 1;
            this.RefreshData(this.currentPage);
        }
    }

    /*
     * 滑动条改变触发
     */
    sliderChange(value: number) {
        if (this.currentPage == value) return;
        this.currentPage = value;
        this.refreshPageLabel();
        this.syncProgressBlue();
    }

    private sliderTouchEnd() {
        this.RefreshPageButton();
        this.SendClientMessagePublicReplay(this.currentPage);
    }

    refreshPageLabel() {
        this.cc_Label$page.string = `${this.currentPage}/${this.totalPage}`;
    }

    /** 同步 $progressBlue 宽度与 slider 进度位置一致，实现双色进度条效果 */
    private syncProgressBlue() {
        if (!this.$progressBlue || !this.SliderPlus$slider) return;
        // 直接从 slider.value 计算目标宽度，不依赖 _bar_offset
        // 原因：点击 progressBar 时 _touch() 先触发 change 回调再通过 tween 更新 _bar_offset，
        // 导致回调中读取的 _bar_offset 是旧值；而 slider.value (curr_value) 在回调前已更新
        let slider = this.SliderPlus$slider;
        let range = slider.data.max_value - slider.data.min_value;
        if (range <= 0) {
            this.$progressBlue.width = 0;
            return;
        }
        let k = (slider.value - slider.data.min_value) / range;
        this.$progressBlue.width = slider.min + (slider.max - slider.min) * k;
    }

    /** 切换详情区域的显示/隐藏 */
    private getDetailNodes(): cc.Node[] {
        return [this.$Score, this.$Preflop, this.$Flop, this.$Turn, this.$River, this.$Showdown, this.$Showdown2];
    }

    /** 根据当前展开状态强制设置详情区域的可见性 */
    private enforceDetailsVisibility() {
        this.getDetailNodes().forEach(node => {
            if (node) node.active = this.detailsExpanded;
        });
        // Showdown2 仅在双套牌且展开时显示
        if (this.$Showdown2 && !this.HaveSecondCard) {
            this.$Showdown2.active = false;
        }
    }

    click_detailsBtn() {
        this.detailsExpanded = !this.detailsExpanded;
        this.getDetailNodes().forEach(node => {
            if (node) node.active = this.detailsExpanded;
        });
        // Showdown2 仅在双套牌且展开时显示
        if (this.$Showdown2 && !this.HaveSecondCard) {
            this.$Showdown2.active = false;
        }
        let arrowsp = this.$DetailsBtn.getChildByName('arrowsp');
        if (arrowsp) {
            arrowsp.scaleY *= -1;
        }
    }

    /** 偷偷看按钮点击：请求看所有未亮牌玩家的手牌 */
    click_peekButton() {
        if (!this.$PeekButton) return;
        // 防重复点击
        let btn = this.$PeekButton.getComponent(cc.Button);
        if (btn) btn.interactable = false;
        WWW.Instance.CommonAPI({
            web_class: WebRoomCenterGameWatch,
            body: WebRoomCenterGameWatch.Request({
                room_id: this.historyInfoData.room_id,
                room_unique_id: this.historyInfoData.room_unique_id,
                hand_num: this.currentPage,
                be_watched_user_id: 0
            })
        }).then(
            (res: any) => {
                if (!cc.isValid(this.node)) return;
                if (btn) btn.interactable = true;
                if (res?.code === 0 && res?.data) {
                    // 合并偷偷看到的手牌到当前手牌缓存数据中（对齐 Unity ExecuteWatchUser）
                    this.mergeWatchedHands(res.data.be_watched_user_hands);
                    // 将偷看数据写回该手牌的缓存，确保切换后再切回来时数据不丢失
                    this.updateReplayCacheWithWatchedHands();
                    // 用新数据重新渲染界面
                    this.HandleHistoryReplay(res.data);
                    // 隐藏偷偷看按钮（已看过）
                    if (this.$PeekButton) {
                        let peekBtn = this.$PeekButton.getComponent(cc.Button);
                        if (peekBtn) peekBtn.interactable = false;
                        this.$PeekButton.opacity = 128;
                    }
                    // 偷看成功，刷新价格（次数会从服务端重新获取）
                    this.reqPeekPrice();
                    // 刷新钻石余额
                    this.reqDiamondBalance();
                }
            },
            () => {
                if (btn) btn.interactable = true;
            }
        );
    }

    /** 发发看按钮点击：通过 HTTP API 请求查看未亮公共牌 (对齐 Unity RequestReplayPublicCards) */
    click_viewPubButton() {
        if (!this.$ViewPubButton) return;
        let btn = this.$ViewPubButton.getComponent(cc.Button);
        if (btn) btn.interactable = false;
        let round = this.getViewPubRound();
        let roomId = this._lastResponseData?.s?.rid || this.historyInfoData.room_id;
        let handNum = this._lastResponseData?.s?.hand || this.currentPage;
        console.log('[UITexasHistory] click_viewPubButton request params:', JSON.stringify({
            room_id: roomId,
            hand_num: handNum,
            round: round,
            // 诊断字段
            _lastResponseData_rid: this._lastResponseData?.s?.rid,
            _lastResponseData_hand: this._lastResponseData?.s?.hand,
            _lastResponseData_mid: this._lastResponseData?.s?.mid,
            _lastResponseData_unique: this._lastResponseData?.s?.unique,
            historyInfoData_room_id: this.historyInfoData?.room_id,
            currentPage: this.currentPage,
            totalPage: this.totalPage,
            PublicCards: this.PublicCards,
            cacheRoomId: GameCache.Instance.room_id,
            cacheMatchId: GameCache.Instance.match_id,
            cacheUniqueId: GameCache.Instance.CurGame?.cacheUniqueId
        }));
        WWW.Instance.CommonAPI({
            web_class: WebRoomCenterHistoryViewPublicCards,
            body: WebRoomCenterHistoryViewPublicCards.Request({
                room_id: roomId,
                hand_num: handNum,
                round: round
            })
        }).then(
            (res: any) => {
                if (!cc.isValid(this.node)) return;
                if (btn) btn.interactable = true;
                if (res?.code === 0 && res?.data) {
                    let round = this.getViewPubRound();
                    this.mergeViewedPublicCards(res.data.pub_cards, res.data.pub_cards2, round);
                    // 将发发看数据写回缓存
                    this.updateReplayCacheWithViewedPublicCards(res.data);
                    // 用新数据重新渲染界面
                    this.renderPublicCards();
                    // 更新按钮状态
                    this.updateViewPubButtonState();
                    // 刷新钻石余额
                    this.reqDiamondBalance();
                    // 刷新发发看价格
                    this.reqViewPubPrice();
                } else {
                    if (res?.code === 90003) {
                        UIComponent.Instance.Toast('该手牌尚未同步到历史记录，请稍后再试');
                    } else {
                        UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res?.code));
                    }
                }
            },
            () => {
                if (btn) btn.interactable = true;
            }
        );
    }

    // region 收藏功能 (对齐 Unity OnClickCollect / RequestReplayCollectedStatus)

    /** 收藏按钮点击 */
    click_favoBtn() {
        if (!this.$favoBtn) return;
        console.log('[UITexasHistory] click_favoBtn _isCollected=' + this._isCollected, JSON.stringify({
            hasLastData: !!this._lastResponseData,
            rid: this._lastResponseData?.s?.rid,
            unique: this._lastResponseData?.s?.unique,
            hand: this._lastResponseData?.s?.hand,
            mid: this._lastResponseData?.s?.mid,
            name: this._lastResponseData?.s?.name,
            // 完整 s 字段的 key 列表
            sKeys: this._lastResponseData?.s ? Object.keys(this._lastResponseData.s) : null
        }));
        if (this._isCollected) {
            this.reqRemoveCollect();
        } else {
            this.reqAddCollect();
        }
    }

    /** 查询当前手牌是否已收藏 (对齐 Unity RequestReplayCollectedStatus) */
    private reqCollectStatus() {
        let s = this._lastResponseData?.s;
        let roomId = s?.rid || this.historyInfoData?.room_id || GameCache.Instance.room_id;
        let roomUniqueId = s?.unique || this.historyInfoData?.room_unique_id || GameCache.Instance.CurGame?.cacheUniqueId || '';
        let handNum = s?.hand || this.currentPage;
        if (!roomId || !handNum) return;
        WWW.Instance.CommonAPI({
            web_class: WebMiscGameRoundStatus,
            body: WebMiscGameRoundStatus.Request({
                room_id: roomId,
                room_unique_id: roomUniqueId,
                hand_num: handNum
            })
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            console.log('[UITexasHistory] reqCollectStatus response:', JSON.stringify(res?.data));
            // ResponseData 结构: { data?: { records?: ... } }，也可能直接 { records?: ... }
            let records = res?.data?.data?.records ?? res?.data?.records;
            let isCollected = res?.code === 0 && records?.length > 0 && records[0].remove === 0;
            console.log('[UITexasHistory] reqCollectStatus isCollected=' + isCollected, 'records=' + JSON.stringify(records));
            this.refreshCollectShow(isCollected);
        });
    }

    /** 请求收藏当前手牌 (对齐 Unity OnClickCollect → RequestReplayDetail → Collect3) */
    private reqAddCollect() {
        let roomId = this.historyInfoData?.room_id || GameCache.Instance.room_id;
        let matchId = this.historyInfoData?.match_id || GameCache.Instance.match_id || 0;
        let roomUniqueId = this.historyInfoData?.room_unique_id || GameCache.Instance.CurGame?.cacheUniqueId || '';
        let handNum = this.currentPage;
        let name = GameCache.Instance.roomName || '';
        let btn = this.$favoBtn?.getComponent(cc.Button);
        if (btn) btn.interactable = false;

        // 第一步：通过 GET /api/roomcenter/history/replay/{room_id} 触发服务端持久化回放数据
        // Unity 先调 RequestReplayDetail GET 该接口持久化后再收藏
        // CC 用 WebSocket 获取回放，服务端没持久化，直接收藏会报 90001
        let replayApi = '/api/roomcenter/history/replay/' + roomId;
        HttpRequest.Send({
            api: replayApi,
            isGet: true,
            onSuccess: () => {
                if (!cc.isValid(this.node)) { if (btn) btn.interactable = true; return; }
                console.log('[UITexasHistory] reqAddCollect: replay GET success, now collecting');
                this.doCollect(roomId, matchId, roomUniqueId, handNum, name, btn);
            },
            onFailure: () => {
                if (!cc.isValid(this.node)) { if (btn) btn.interactable = true; return; }
                console.log('[UITexasHistory] reqAddCollect: replay GET failed, trying direct');
                this.doCollect(roomId, matchId, roomUniqueId, handNum, name, btn);
            }
        });
    }

    /** 实际发送收藏请求 */
    private doCollect(roomId: number, matchId: number, roomUniqueId: string, handNum: number, name: string, btn: cc.Button) {
        let params = {
            id: 0,
            room_id: roomId,
            match_id: matchId,
            room_unique_id: roomUniqueId,
            name: name,
            hand_num: handNum,
            change: 0,
            type: 0,
            open: 0
        };
        console.log('[UITexasHistory] doCollect params:', JSON.stringify(params));
        WWW.Instance.CommonAPI({
            web_class: WebMiscGameRecordRound,
            body: WebMiscGameRecordRound.Request(params)
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            if (btn) btn.interactable = true;
            console.log('[UITexasHistory] doCollect response:', JSON.stringify(res));
            if (res?.code === 0) {
                this.refreshCollectShow(true);
                UIComponent.Instance.Toast('收藏成功');
            } else {
                UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res?.code));
            }
        }, (err: any) => {
            if (!cc.isValid(this.node)) return;
            if (btn) btn.interactable = true;
            console.log('[UITexasHistory] doCollect FAIL:', JSON.stringify(err));
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(err?.code));
        });
    }

    /** 请求取消收藏 (对齐 Unity RequestDeleteCollectedReplay) */
    private reqRemoveCollect() {
        let s = this._lastResponseData?.s;
        let roomId = s?.rid || this.historyInfoData?.room_id || GameCache.Instance.room_id;
        let roomUniqueId = s?.unique || this.historyInfoData?.room_unique_id || GameCache.Instance.CurGame?.cacheUniqueId || '';
        let handNum = s?.hand || this.currentPage;
        WWW.Instance.CommonAPI({
            web_class: WebMiscGameRemoveRound,
            body: WebMiscGameRemoveRound.Request({
                room_id: roomId,
                room_unique_id: roomUniqueId,
                hand_num: handNum
            })
        }).then((res: any) => {
            if (!cc.isValid(this.node)) return;
            if (res?.code === 0) {
                this.refreshCollectShow(false);
                UIComponent.Instance.Toast('已取消收藏');
            } else {
                UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res?.code));
            }
        });
    }

    /** 更新收藏 star 颜色 (对齐 Unity RefreshCollectShow) */
    private refreshCollectShow(isCollected: boolean) {
        this._isCollected = isCollected;
        if (!this.$favoBtn) {
            console.log('[UITexasHistory] refreshCollectShow: $favoBtn is null');
            return;
        }
        let star = this.$favoBtn.getChildByName('Background')?.getChildByName('$star');
        console.log('[UITexasHistory] refreshCollectShow isCollected=' + isCollected + ', star=' + (star ? 'found' : 'NOT FOUND'));
        if (star) {
            star.color = isCollected ? cc.color(255, 200, 50) : cc.color(255, 255, 255);
        }
    }

    // endregion 收藏功能

    /** 推断当前需要查看的公共牌轮次 (HTTP API: 1=flop, 2=turn, 3=river) */
    private getViewPubRound(): number {
        // PublicCards[0]==0 → 连flop都没有 → round=1
        // PublicCards[3]==0 → 有flop但没turn → round=2
        // 否则 → 有turn但没river → round=3
        if (!this.PublicCards || this.PublicCards[0] === 0) return 1;
        if (this.PublicCards[3] === 0) return 2;
        return 3;
    }

    /** 将服务端返回的公共牌数据合并到 PublicCards 数组 (对齐 Unity ExecutePublicCards) */
    private mergeViewedPublicCards(pubCardsStr: string, pubCards2Str: string, round: number) {
        if (!pubCardsStr) return;
        let cards = pubCardsStr.split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
        if (round === 1) {
            // flop: 替换位置 0-2
            for (let i = 0; i < cards.length && i < 3; i++) {
                this.PublicCards[i] = cards[i];
            }
        } else if (round === 2) {
            // turn: 替换位置 3
            if (cards.length > 0) this.PublicCards[3] = cards[0];
        } else if (round === 3) {
            // river: 替换位置 4
            if (cards.length > 0) this.PublicCards[4] = cards[0];
        }
        // 第二套公共牌 (Bomb Pot)
        if (pubCards2Str && this.HaveSecondCard) {
            let cards2 = pubCards2Str.split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
            if (round === 1) {
                for (let i = 0; i < cards2.length && i < 3; i++) {
                    this.SecondPublicCards[i] = cards2[i];
                }
            } else if (round === 2) {
                if (cards2.length > 0) this.SecondPublicCards[3] = cards2[0];
            } else if (round === 3) {
                if (cards2.length > 0) this.SecondPublicCards[4] = cards2[0];
            }
        }
    }

    /** 重新渲染公共牌 UI (Score、Showdown、Flop/Turn/River 区、详情页公共牌) */
    private renderPublicCards() {
        // Score 公共牌
        if (this.$Score_PublicCards) {
            this.$Score_PublicCards.children.forEach((item, index) => {
                item.active = this.PublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            });
        }
        // Showdown 公共牌
        if (this.$Showdown_PublicCards) {
            this.$Showdown_PublicCards.children.forEach((item, index) => {
                item.active = this.PublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            });
        }
        // 第二套公共牌
        if (this.HaveSecondCard && this.$Showdown2_PublicCards) {
            this.$Showdown2_PublicCards.children.forEach((item, index) => {
                item.active = this.SecondPublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.SecondPublicCards[index]), AssetFold.texture_SmallCard0);
            });
        }
        // Flop/Turn/River 区的卡牌
        if (this.$Flop_Cards) {
            this.$Flop_Cards.children.forEach((item, index) => {
                let sprite = item.getComponent(cc.Sprite) || item.getComponentInChildren(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
                }
                item.active = this.PublicCards[index] > 0;
            });
        }
        if (this.$Turn_Cards) {
            this.$Turn_Cards.children.forEach((item, index) => {
                let sprite = item.getComponent(cc.Sprite) || item.getComponentInChildren(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
                }
                item.active = this.PublicCards[index] > 0;
            });
        }
        if (this.$River_Cards) {
            this.$River_Cards.children.forEach((item, index) => {
                let cardValue = this.PublicCards[index];
                let sprite = item.getComponent(cc.Sprite) || item.getComponentInChildren(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(cardValue), AssetFold.texture_SmallCard0);
                }
                item.active = cardValue > 0;
            });
        }
        // 更新详情页中每个玩家卡片项的公共牌 (Score/Showdown 中的 public_cards 子节点)
        this.updateDetailPublicCards();
        // 重新渲染 Dashboard 概览区（公共牌已更新）
        for (let i = 0; i < this.dashboardNodes.length; i++) {
            if (!cc.isValid(this.dashboardNodes[i])) continue;
            let comp = this.dashboardNodes[i].getComponent(playerCardNode);
            if (comp) {
                comp.setData({
                    userName: this.playerInfos[i]?.userName || '',
                    headPic: this.playerInfos[i]?.headPic || '',
                    handCards: this.playerInfos[i]?.handCards || [],
                    publicCards: this.PublicCards,
                    publicCards2: this.HaveSecondCard && this.SecondPublicCards.length > 0 ? this.SecondPublicCards : undefined,
                    cardType: this.playerInfos[i]?.maxCardType,
                    actName: '',
                    actChip: 0,
                    raiseTimes: 0,
                    winAnte: this.playerInfos[i]?.winAnte || 0,
                    isMine: this.playerInfos[i]?.isMine || false
                });
            }
        }
    }

    /** 更新详情页中每个玩家卡片项的公共牌显示 */
    private updateDetailPublicCards() {
        // 更新 $Score_Childs 中的公共牌
        this.updateDetailChildsPublicCards(this.$Score_Childs);
        // 更新 $Showdown_Childs 中的公共牌
        this.updateDetailChildsPublicCards(this.$Showdown_Childs);
    }

    /** 更新某个详情子节点列表中所有玩家卡片的公共牌 */
    private updateDetailChildsPublicCards(childsNode: cc.Node) {
        if (!childsNode) return;
        childsNode.children.forEach(go => {
            let public_cards: cc.Node;
            if (this.HaveSecondCard) {
                // 双套牌布局
                let public_cards1 = cc.find('cards_position/public_cards/cards1', go);
                let public_cards2 = cc.find('cards_position/public_cards/cards2', go);
                if (public_cards1) {
                    for (let i = 0; i < public_cards1.children.length && i < 5; i++) {
                        let item = public_cards1.children[i];
                        if (this.PublicCards[i] == 0) {
                            item.active = false;
                        } else {
                            item.active = true;
                            let sprite = item.getComponent(cc.Sprite);
                            if (sprite) sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0);
                        }
                    }
                }
                if (public_cards2) {
                    for (let i = 0; i < public_cards2.children.length && i < 5; i++) {
                        let item = public_cards2.children[i];
                        if (this.SecondPublicCards[i] == 0) {
                            item.active = false;
                        } else {
                            item.active = true;
                            let sprite = item.getComponent(cc.Sprite);
                            if (sprite) sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.SecondPublicCards[i]), AssetFold.texture_SmallCard0);
                        }
                    }
                }
            } else {
                // 单套牌布局
                public_cards = cc.find('cards_position/public_cards', go);
                if (public_cards) {
                    public_cards.children.forEach((item, index) => {
                        let sprite = item.getComponent(cc.Sprite);
                        if (!sprite) return;
                        item.active = this.PublicCards[index] > 0;
                        sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
                    });
                }
            }
        });
    }

    /** 更新发发看按钮状态 */
    private updateViewPubButtonState() {
        if (!this.$ViewPubButton) return;
        let riverRevealed = this.PublicCards[4] !== 0;
        let canView = !riverRevealed && this._hasMe;
        let hasHidden = canView && this.hasHiddenPublicCards();
        let btn = this.$ViewPubButton.getComponent(cc.Button);
        if (btn) btn.interactable = hasHidden;
        this.$ViewPubButton.opacity = hasHidden ? 255 : 128;
    }

    /** 判断是否还有未查看的公共牌 */
    private hasHiddenPublicCards(): boolean {
        if (!this.PublicCards) return false;
        for (let i = 0; i < 5; i++) {
            if (this.PublicCards[i] === 0) return true;
        }
        return false;
    }

    /** 请求发发看免费次数+价格并显示到 $ViewPubCost */
    private async reqViewPubPrice() {
        if (!this.$ViewPubCost) return;
        try {
            // 获取免费次数
            this._viewPubFreeCount = await this._reqViewPubFreeCount();
            if (this._viewPubFreeCount > 0) {
                // 对齐 Unity：显示 "VIP免费 {剩余次数}"
                let label = this.$ViewPubCost.getComponent(cc.Label);
                if (label) label.string = `VIP免费 ${this._viewPubFreeCount}`;
                return;
            }
            // config_type=8 (SeeMorePublic)，thousand: 1=flop, 2=turn, 3=river
            let round = this.getViewPubRound();
            let thousand = round; // 1,2,3 对应 flop/turn/river
            let typeExt = thousand * 1000; // 对齐 GetDiamondTypeText(8, thousand)
            await DiamondModel.Instance.ReqDiamondConfig(8);
            let diamondConfig = DiamondModel.Instance.GetDiamondConfig(typeExt, 8);
            let price = this.getPriceFromConfig(diamondConfig);
            let label = this.$ViewPubCost.getComponent(cc.Label);
            if (label) label.string = `${price}`;
        } catch (e) {
            cc.log('[UITexasHistory] reqViewPubPrice failed', e);
        }
    }

    /** 请求发发看免费次数 */
    private _reqViewPubFreeCount(): Promise<number> {
        return new Promise((resolve) => {
            WWW.Instance.CommonAPI({
                web_class: WebRoomCenterHistoryViewPublicCardsFreeCount
            }).then(
                (res: any) => {
                    let freeCount = res?.data?.free_count || 0;
                    resolve(freeCount);
                },
                () => {
                    resolve(0);
                }
            );
        });
    }

    /** 合并偷偷看到的手牌数据到缓存 */
    private mergeWatchedHands(hands: { user_rid: number; data: string }[]) {
        if (!hands || hands.length <= 0) return;
        for (let i = 0; i < hands.length; i++) {
            let found = false;
            for (let j = 0; j < this.beWatchedUserHands.length; j++) {
                if (this.beWatchedUserHands[j].user_rid === hands[i].user_rid) {
                    this.beWatchedUserHands[j].data = hands[i].data;
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.beWatchedUserHands.push(hands[i]);
            }
        }
    }

    /** 将偷看数据写回当前手牌的 replaySet 缓存（对齐 Unity：更新 _recordData 后写入 GameCache） */
    private async updateReplayCacheWithWatchedHands() {
        const userId = GameCache.Instance.nUserId;
        const roomId = GameCache.Instance.room_id;
        const matchId = GameCache.Instance.match_id;
        const handNum = this.currentPage;
        // 从缓存中取出当前手牌数据
        const cached = (await replayGet(roomKey(userId, roomId, handNum))) ?? (matchId ? await replayGet(matchKey(userId, matchId, handNum)) : null);
        if (cached) {
            // 将偷看数据合并到缓存数据的 be_watched_user_hands 字段
            if (!cached.be_watched_user_hands) {
                cached.be_watched_user_hands = [];
            }
            for (const hand of this.beWatchedUserHands) {
                const existing = cached.be_watched_user_hands.find(h => h.user_rid === hand.user_rid);
                if (existing) {
                    existing.data = hand.data;
                } else {
                    cached.be_watched_user_hands.push({ user_rid: hand.user_rid, data: hand.data });
                }
            }
            // 写回缓存
            replaySet(roomKey(userId, roomId, handNum), cached);
            if (matchId) replaySet(matchKey(userId, matchId, handNum), cached);
        }
    }

    /** 将发发看数据写回当前手牌的 replaySet 缓存 (对齐 Unity：更新 _recordData.pub_cards 后写入) */
    private async updateReplayCacheWithViewedPublicCards(viewData: { pub_cards?: string; pub_cards2?: string }) {
        const userId = GameCache.Instance.nUserId;
        const roomId = GameCache.Instance.room_id;
        const matchId = GameCache.Instance.match_id;
        const handNum = this.currentPage;
        const cached = (await replayGet(roomKey(userId, roomId, handNum))) ?? (matchId ? await replayGet(matchKey(userId, matchId, handNum)) : null);
        if (cached) {
            if (viewData.pub_cards) cached.pub_cards = viewData.pub_cards;
            if (viewData.pub_cards2) cached.pub_cards2 = viewData.pub_cards2;
            replaySet(roomKey(userId, roomId, handNum), cached);
            if (matchId) replaySet(matchKey(userId, matchId, handNum), cached);
        }
    }

    /** 从缓存中获取偷偷看到的玩家手牌 */
    private getWatchedHandCards(userRid: number): number[] {
        for (let i = 0; i < this.beWatchedUserHands.length; i++) {
            if (this.beWatchedUserHands[i].user_rid === userRid) {
                let cards: number[] = [];
                let parts = this.beWatchedUserHands[i].data.split(',');
                for (let j = 0; j < parts.length; j++) {
                    let val = parseInt(parts[j]);
                    if (!isNaN(val)) cards.push(val);
                }
                return cards;
            }
        }
        return null;
    }

    /** 判断是否还有未查看的手牌（控制偷偷看按钮的显示） */
    private hasHiddenCards(ResponseData: typeof WebRoomCenterHistoryReplay.Data): boolean {
        for (let i = 0; i < ResponseData.s.result.length; i++) {
            let result = ResponseData.s.result[i];
            if (result.card == null || result.card.length === 0 || result.card[0] <= 0) {
                // 这个玩家没有亮牌，通过座位号找 uid，再检查是否已经偷看过
                let playerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, result.sn);
                if (playerInfo && playerInfo.playerId !== GameCache.Instance.nUserId) {
                    let watched = this.getWatchedHandCards(playerInfo.playerId);
                    if (!watched || watched.length === 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    click_bg() {
        UIComponent.close(this.UIDefine);
    }

    private registerHandler() {
        GC.notify.register(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);
    }

    private removeHandler() {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);
    }

    Protocol_Holdem_PublicReplay_Handler(response) {
        if (this._pendingHandNum < 0) return; // 预取响应，非本面板请求，忽略
        if (response?.data == '' || response?.data == null) {
            this._pendingHandNum = -1;
            return;
        }
        const handNum = this._pendingHandNum;
        this._pendingHandNum = -1;
        let data = JSON.parse(PublicHelper.Base64ToJsonString(response.data));
        const userId = GameCache.Instance.nUserId;
        const roomId = GameCache.Instance.room_id;
        const matchId = GameCache.Instance.match_id;
        replaySet(roomKey(userId, roomId, handNum), data);
        if (matchId) replaySet(matchKey(userId, matchId, handNum), data);
        this.HandleHistoryReplay(data);
    }

    //请求个人历史并刷新界面
    RefreshData(_currentPage) {
        this.currentPage = _currentPage;
        this.RefreshPageButton();
        this.SendClientMessagePublicReplay(this.currentPage);
        //PageSlider.value = currentPage;
    }

    // 刷新底部按钮和页数
    RefreshPageButton() {
        // this.buttonFirstPage.interactable = this.currentPage > 1;
        // this.buttonLastPage.interactable = this.currentPage < this.totalPage;
        // this.buttonPrePage.interactable = this.currentPage > 1;
        // this.buttonNextPage.interactable = this.currentPage < this.totalPage;
        // this.Text_num.string = `${this.currentPage}/${this.totalPage}`;
    }

    async SendClientMessagePublicReplay(handNum) {
        const userId = GameCache.Instance.nUserId;
        const roomId = GameCache.Instance.room_id;
        const matchId = GameCache.Instance.match_id;
        const cached = (await replayGet(roomKey(userId, roomId, handNum))) ?? (matchId ? await replayGet(matchKey(userId, matchId, handNum)) : null);
        if (cached) {
            this.HandleHistoryReplay(cached);
            return;
        }
        this._pendingHandNum = handNum;
        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_PublicReplay,
            RoomID: roomId,
            MatchID: matchId,
            Body: {
                room: { roomId: roomId, matchId: matchId },
                handNum: handNum,
                uniqueId: GameCache.Instance.CurGame.cacheUniqueId
            }
        });
    }

    // 初始化顶部房间信息
    private InitRoomInfo() {
        this.setChildLabel(this.$Top, 'room_name_label', GameCache.Instance.roomName);
        if (this.historyInfoData.bgroupBet > 0) {
            this.setChildLabel(this.$Top, 'room_bb_label', `${this.historyInfoData.Blindstr}(${StringHelper.GetLongString(this.historyInfoData.bgroupBet)})`);
        } else {
            this.setChildLabel(this.$Top, 'room_bb_label', this.historyInfoData.Blindstr);
        }
        this.setChildLabel(this.$Top, 'player_count_label', '0');
        this.setChildLabel(this.$Top, 'room_id_label', `${GameCache.Instance.room_id}-0`);
        this.$content.active = false;
    }

    /**
     * @methos 初始化UI
     */
    private InitUI() {}

    /** 异步请求钻石余额并显示 */
    private reqDiamondBalance() {
        if (!this.$DiamondNum) return;
        WWW.Instance.CommonAPI({
            web_class: WebUserDiamondsWallet
        }).then((res: any) => {
            if (cc.isValid(this.node) && this.$DiamondNum && res?.data?.diamonds_wallet) {
                let label = this.$DiamondNum.getComponent(cc.Label);
                if (label) label.string = res.data.diamonds_wallet.diamonds.toLocaleString('en-US');
            }
        });
    }

    /** 预加载 playerCardNode prefab */
    private async loadPlayerCardPrefab() {
        this.playerCardPrefab = await ResManager.GetOrLoad<cc.Prefab>('texas', 'prefab/widgetLayer/playerCardNode');
    }

    /** 请求偷偷看次数+价格并显示到 $PeekCost 上（支持阶梯收费） */
    private async reqPeekPrice() {
        if (!this.$PeekCost) return;
        try {
            // 先从服务端获取当前偷看次数
            this._peekCount = await this._reqWatchNum();
            // config_type=30（看全部手牌），type_ext 阶梯：11/21/31/41/51（11 + 10 * peekCount，最多4次）
            const times = Math.min(this._peekCount, 4);
            const typeExt = 11 + 10 * times;
            console.log('[UITexasHistory] reqPeekPrice peekCount=' + this._peekCount + ', times=' + times + ', typeExt=' + typeExt);
            await DiamondModel.Instance.ReqDiamondConfig(30);
            let diamondConfig = DiamondModel.Instance.GetDiamondConfig(typeExt, 30);
            console.log('[UITexasHistory] diamondConfig=' + JSON.stringify(diamondConfig));
            let price = this.getPriceFromConfig(diamondConfig);
            let label = this.$PeekCost.getComponent(cc.Label);
            if (label) label.string = `${price}`;
        } catch (e) {
            cc.log('[UITexasHistory] reqPeekPrice failed', e);
        }
    }

    /** 请求偷看次数（HTTP 接口，对齐 WebSocket 1029） */
    private _reqWatchNum(): Promise<number> {
        return new Promise((resolve) => {
            let roomId = this.historyInfoData?.room_id || GameCache.Instance.room_id;
            WWW.Instance.CommonAPI({
                web_class: WebRoomCenterGameWatchNum,
                body: WebRoomCenterGameWatchNum.Request({ room_id: roomId })
            }).then(
                (res: any) => {
                    console.log('[UITexasHistory] _reqWatchNum response=' + JSON.stringify(res?.data));
                    let payTimes = res?.data?.pay_times || 0;
                    resolve(payTimes);
                },
                () => {
                    resolve(0);
                }
            );
        });
    }

    /** 从钻石配置中按 smallBlind 匹配价格 */
    private getPriceFromConfig(diamondConfig: any): number {
        if (!diamondConfig?.setting) return 0;
        let sb = GameCache.Instance.CurGame?.smallBlind || 0;
        for (let item of diamondConfig.setting) {
            if (item.sb === sb) {
                return item.price || 0;
            }
        }
        // 没有精确匹配则取第一个
        if (diamondConfig.setting.length > 0) {
            return diamondConfig.setting[0].price || 0;
        }
        return 0;
    }

    /** 隐藏 $Dashboard 下的静态 playerNode 模板节点 */
    private hideDashboardTemplate() {
        if (!this.$Dashboard) return;
        let template = this.$Dashboard.getChildByName('playerNode');
        if (template) {
            template.active = false;
        }
    }

    /** 清空 $Dashboard 中动态生成的 playerCardNode 实例 */
    private clearDashboard() {
        for (let i = 0; i < this.dashboardNodes.length; i++) {
            if (cc.isValid(this.dashboardNodes[i])) {
                this.dashboardNodes[i].destroy();
            }
        }
        this.dashboardNodes = [];
    }

    /**
     * 在 $Dashboard 中根据玩家数据生成 playerCardNode 实例
     * @param playerInfos 玩家信息列表
     * @param publicCards 公共牌数组
     * @param responseData 完整回放数据 (用于获取 result 中的牌型、盈亏等)
     */
    private renderDashboard(playerInfos: PlayerInfo[], publicCards: number[], responseData: typeof WebRoomCenterHistoryReplay.Data) {
        this.clearDashboard();
        if (!this.$Dashboard || !this.playerCardPrefab) return;
        for (let i = 0; i < playerInfos.length; i++) {
            let pInfo = playerInfos[i];
            let node = cc.instantiate(this.playerCardPrefab);
            let comp = node.getComponent(playerCardNode);
            if (!comp) {
                comp = node.addComponent(playerCardNode);
            }
            // 获取该玩家的最后操作
            let lastAct = this.getPlayerLastAction(pInfo.seatID, responseData);
            let cardData: IPlayerCardData = {
                userName: pInfo.userName,
                headPic: pInfo.headPic,
                handCards: pInfo.handCards || [],
                publicCards: publicCards,
                publicCards2: this.HaveSecondCard && this.SecondPublicCards.length > 0 ? this.SecondPublicCards : undefined,
                cardType: pInfo.maxCardType,
                actName: lastAct.actName,
                actChip: lastAct.actChip,
                raiseTimes: lastAct.raiseTimes,
                winAnte: pInfo.winAnte,
                isMine: pInfo.isMine
            };
            // 插入到 $Dashboard 中，位于隐藏的静态模板之前
            node.parent = this.$Dashboard;
            let templateNode = this.$Dashboard.getChildByName('playerNode');
            if (templateNode) {
                node.setSiblingIndex(this.$Dashboard.childrenCount - 2); // 模板在最后，新节点在模板前
            }
            node.active = true;
            comp.setData(cardData);
            this.dashboardNodes.push(node);
        }
    }

    /**
     * 获取玩家在整手牌中的最后一次操作
     * 遍历所有轮次(procedure)找到该玩家最后一次出现的操作
     */
    private getPlayerLastAction(
        seatID: number,
        responseData: typeof WebRoomCenterHistoryReplay.Data
    ): { actName: string; actChip: number; raiseTimes: number } {
        let lastAct = { actName: '', actChip: 0, raiseTimes: 0 };
        let raiseCount = 0;
        let allRounds = [];
        // 收集所有轮次
        if (responseData.s.procedure.preflop?.pl) {
            allRounds.push(...responseData.s.procedure.preflop.pl);
        }
        if (responseData.s.procedure.flop?.pl) {
            allRounds.push(...responseData.s.procedure.flop.pl);
        }
        if (responseData.s.procedure.turn?.pl) {
            allRounds.push(...responseData.s.procedure.turn.pl);
        }
        if (responseData.s.procedure.river?.pl) {
            allRounds.push(...responseData.s.procedure.river.pl);
        }
        for (let i = 0; i < allRounds.length; i++) {
            if (allRounds[i].sn === seatID) {
                let act = allRounds[i].act;
                if (act === 'bet' || act === 'raise') {
                    raiseCount++;
                }
                lastAct.actName = act;
                lastAct.actChip = allRounds[i].act_amt;
                lastAct.raiseTimes = raiseCount;
            }
        }
        return lastAct;
    }

    protected async HandleHistoryReplay(ResponseData: typeof WebRoomCenterHistoryReplay.Data) {
        // 切换手牌时清空偷看缓存，防止上一手的偷看数据污染当前手
        this.beWatchedUserHands = [];
        this.PublicCards = [0, 0, 0, 0, 0];
        this.SecondPublicCards = [];
        // 保存上一手的双套状态，用于正确回收节点池
        const prevHaveSecondCard = this.HaveSecondCard;
        this.HaveSecondCard = false;
        // 清理上一手双套牌残留的 UI（含节点池污染修复）
        this.clearSecondBoardUI(prevHaveSecondCard);
        //显示滚动容器
        this.$content.active = true;
        this.RefreshTopHandAndPlayerNumInfo(ResponseData.s.table.pl.length.toString());
        //缓存公共牌 — 逐个复制到固定 5 元素数组，避免引用替换导致数组长度不一致
        if (ResponseData.s.procedure.flop?.card) {
            for (let i = 0; i < ResponseData.s.procedure.flop.card.length && i < 5; i++) {
                this.PublicCards[i] = ResponseData.s.procedure.flop.card[i];
            }
        }
        if (ResponseData.s.procedure.turn?.card?.length > 0) {
            this.PublicCards[3] = ResponseData.s.procedure.turn.card[0];
        }
        if (ResponseData.s.procedure.river?.card?.length > 0) {
            this.PublicCards[4] = ResponseData.s.procedure.river.card[0];
        }
        //判断是否有第二套牌，并赋值
        if (ResponseData.s.procedure.river.scard?.length > 0) {
            this.SecondPublicCards = [0, 0, 0, 0, 0];
            this.HaveSecondCard = true;
            if (ResponseData.s.procedure.river.scard.length < this.PublicCards.length) {
                for (let i = 0; i < this.PublicCards.length - ResponseData.s.procedure.river.scard.length; i++) {
                    this.SecondPublicCards[i] = this.PublicCards[i];
                }
                for (let i = 0; i < ResponseData.s.procedure.river.scard.length; i++) {
                    this.SecondPublicCards[this.PublicCards.length - ResponseData.s.procedure.river.scard.length + i] = this.PublicCards[i];
                }
            } else {
                for (let i = 0; i < ResponseData.s.procedure.river.scard.length; i++) {
                    this.SecondPublicCards[i] = ResponseData.s.procedure.river.scard[i];
                }
            }
        }
        //显示第一套公共牌
        //let Cards = cc.find("Title/Cards", this.$Score);
        this.$Score_PublicCards.children.forEach((item, index) => {
            item.active = this.PublicCards[index] > 0;
            item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
        });
        //Showdown 显示和score相同
        //Cards = cc.find("Title/Cards", this.$Showdown);
        this.$Showdown_PublicCards.children.forEach((item, index) => {
            item.active = this.PublicCards[index] > 0;
            item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
        });
        //显示第二套公共牌
        if (this.HaveSecondCard) {
            this.$Showdown2_PublicCards.children.forEach((item, index) => {
                item.active = this.SecondPublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(this.SecondPublicCards[index]),
                    AssetFold.texture_SmallCard0
                );
            });
        }
        this.playerInfos = [];
        this.playerInfosPreFlop = [];
        this.playerInfosFlop = [];
        this.playerInfosTurn = [];
        this.playerInfosRiver = [];
        this.playerInfosWinner = [];
        this.AllPlayerCardsInfos = [];
        this.AllPlayerCardsInfosPreFlop = [];
        this.AllPlayerCardsInfosFlop = [];
        this.AllPlayerCardsInfosTurn = [];
        this.AllPlayerCardsInfosRiver = [];
        this.AllPlayerCardsInfosWinner = [];
        // 判断自己是否参与了这手牌 (对齐 Unity _hasMe)
        this._hasMe = false;
        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            if (ResponseData.s.table.pl[i].uid == GameCache.Instance.nUserId) {
                this._hasMe = true;
                break;
            }
        }
        let tableSeatIds = []; //本手参与玩家座位号
        let banerSeatId = ResponseData.s.table.btn; //庄位
        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            tableSeatIds.push(ResponseData.s.table.pl[i].sn);
        }
        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            let player: PlayerInfo = new PlayerInfo();
            player.playerId = ResponseData.s.table.pl[i].uid;
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.table.pl[i].sn);
            player.userName = ResponseData.s.table.pl[i].name;
            player.headPic = ResponseData.s.table.pl[i].avatar;
            player.seatID = ResponseData.s.table.pl[i].sn;
            player.initChip = ResponseData.s.table.pl[i].c;
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
                if (ResponseData.d != null && ResponseData.d.length >= 0) {
                    player.handCards = ResponseData.d;
                }
            } else {
                player.isMine = false;
            }
            this.playerInfos.push(player);
        }
        // if (IsDisposed) {
        //     return;
        // }
        let mInsurancePool = 0; //保险池
        let mPool = 0; //各底池
        for (let i = 0; i < ResponseData.s.result.length; i++) {
            mInsurancePool -= ResponseData.s.result[i].ins;
            let seatID = ResponseData.s.result[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            if (playerInfo.playerId != GameCache.Instance.nUserId) {
                playerInfo.handCards = ResponseData.s.result[i].card;
                // 如果结果中没有手牌或手牌为空，尝试使用偷偷看缓存
                if (!playerInfo.handCards || playerInfo.handCards.length === 0 || playerInfo.handCards[0] <= 0) {
                    // 优先用接口返回的 be_watched_user_hands
                    if (ResponseData.be_watched_user_hands && ResponseData.be_watched_user_hands.length > 0) {
                        for (let j = 0; j < ResponseData.be_watched_user_hands.length; j++) {
                            if (ResponseData.be_watched_user_hands[j].user_rid === playerInfo.playerId) {
                                this.mergeWatchedHands([ResponseData.be_watched_user_hands[j]]);
                                break;
                            }
                        }
                    }
                    let watchedCards = this.getWatchedHandCards(playerInfo.playerId);
                    if (watchedCards && watchedCards.length > 0) {
                        playerInfo.handCards = watchedCards;
                    }
                }
            }
            playerInfo.maxCardType = ResponseData.s.result[i].card_type;
            playerInfo.winAnte = ResponseData.s.result[i].win;
            playerInfo.insuranceGain = ResponseData.s.result[i].ins;
            playerInfo.maxCardIndex = ResponseData.s.result[i].maxcard_idx;
        }
        // 渲染 Dashboard 概览区 (使用新的 playerCardNode prefab)
        this.renderDashboard(this.playerInfos, this.PublicCards, ResponseData);
        this.$Score.active = ResponseData.s.result.length > 0;
        this.setChildLabel(this.$Score, 'Title/player/num', `${ResponseData.s.result.length}`);
        // #region Ante
        if (ResponseData.s.procedure.ante != null) {
            for (let i = 0; i < ResponseData.s.procedure.ante.pl.length; i++) {
                let seatID = ResponseData.s.procedure.ante.pl[i].sn;
                let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
                if (playerInfo == null) {
                    cc.log('playerInfo is null');
                    continue;
                }
                //PlayerActionDataInfo player = new PlayerActionDataInfo();
                playerInfo.handBet += ResponseData.s.procedure.ante.pl[i].act_amt; //统计本手下注筹码
                if (ResponseData.s.procedure.ante.pl[i].pot_out > 0) {
                    mPool = ResponseData.s.procedure.ante.pl[i].pot_out;
                }
            }
        }
        // #endregion
        // #region PreFlop
        this.$Preflop.active = ResponseData.s.procedure.preflop.pl.length > 0;
        // Preflop.gameObject.SetActive(ResponseData.s.procedure.preflop.pl.Count > 0);
        // PreflopInfoList.gameObject.SetActive(ResponseData.s.procedure.preflop.pl.Count > 0);
        let times = 0;
        for (let i = 0; i < ResponseData.s.procedure.preflop.pl.length; i++) {
            let seatID: number = ResponseData.s.procedure.preflop.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log('playerInfo is null');
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.preflop.pl[i].sn);
            player.actList = this.getActionNumByName(ResponseData.s.procedure.preflop.pl[i].act);
            if (ResponseData.s.procedure.preflop.pl[i].act == 'bet' || ResponseData.s.procedure.preflop.pl[i].act == 'raise') {
                times++;
                player.raiseTimes = times;
            }
            player.actChipList = ResponseData.s.procedure.preflop.pl[i].act_amt;
            player.playerId = playerInfo.playerId;
            playerInfo.handBet += ResponseData.s.procedure.preflop.pl[i].act_amt; //统计本手下注筹码
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
            } else {
                player.isMine = false;
            }
            if (ResponseData.s.procedure.preflop.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.preflop.pl[i].pot_out;
            }
            player.leftChips = ResponseData.s.procedure.preflop.pl[i].c;
            this.playerInfosPreFlop.push(player);
        }
        if (ResponseData.s.procedure.preflop.pl == null || ResponseData.s.procedure.preflop.pl.length <= 0) {
            this.setChildLabel(this.$Preflop, 'Title/coin/num', StringHelper.GetLongString(mPool));
        }
        // #endregion
        // #region Flop
        // //Flop
        this.$Flop.active = ResponseData.s.procedure.flop.pl.length > 0;
        this.setChildLabel(this.$Flop, 'Title/player/num', `${ResponseData.s.procedure.flop.pl.length}`);
        // 卡牌显示不受 pl 条件限制：即使该街无玩家动作，社区牌仍需正确渲染
        this.$Flop_Cards.children.forEach((item, index) => {
            let sprite = item.getComponent(cc.Sprite) || item.getComponentInChildren(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            }
            item.active = this.PublicCards[index] > 0;
        });
        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.flop.pl.length; i++) {
            let seatID = ResponseData.s.procedure.flop.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log('playerInfo is null');
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            if (ResponseData.s.procedure.flop.pl[i].act == 'bet' || ResponseData.s.procedure.flop.pl[i].act == 'raise') {
                times++;
                player.raiseTimes = times;
            }
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.flop.pl[i].sn);
            player.actList = this.getActionNumByName(ResponseData.s.procedure.flop.pl[i].act);
            player.actChipList = ResponseData.s.procedure.flop.pl[i].act_amt;
            playerInfo.handBet += ResponseData.s.procedure.flop.pl[i].act_amt; //统计本手下注筹码
            player.leftChips = ResponseData.s.procedure.flop.pl[i].c;
            player.playerId = playerInfo.playerId;
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
            } else {
                player.isMine = false;
            }
            if (ResponseData.s.procedure.flop.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.flop.pl[i].pot_out;
            }
            this.playerInfosFlop.push(player);
        }
        if (ResponseData.s.procedure.flop.pl != null && ResponseData.s.procedure.flop.pl.length > 0) {
            this.setChildLabel(this.$Flop, 'Title/coin/num', StringHelper.GetLongString(mPool));
        }
        // #endregion
        // #region Turn
        // //Turn
        this.$Turn.active = ResponseData.s.procedure.turn.pl.length > 0;
        this.setChildLabel(this.$Turn, 'Title/player/num', `${ResponseData.s.procedure.turn.pl.length}`);
        // 卡牌显示不受 pl 条件限制：全进等场景 pl 为空但牌已发出，必须无条件更新
        this.$Turn_Cards.children.forEach((item, index) => {
            let sprite = item.getComponent(cc.Sprite) || item.getComponentInChildren(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            }
            item.active = this.PublicCards[index] > 0;
        });
        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.turn.pl.length; i++) {
            let seatID = ResponseData.s.procedure.turn.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log('playerInfo is null');
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.turn.pl[i].sn);
            player.actList = this.getActionNumByName(ResponseData.s.procedure.turn.pl[i].act);
            player.actChipList = ResponseData.s.procedure.turn.pl[i].act_amt;
            playerInfo.handBet += ResponseData.s.procedure.turn.pl[i].act_amt; //统计本手下注筹码
            player.playerId = playerInfo.playerId;
            if (ResponseData.s.procedure.turn.pl[i].act == 'bet' || ResponseData.s.procedure.turn.pl[i].act == 'raise') {
                times++;
                player.raiseTimes = times;
            }
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
            } else {
                player.isMine = false;
            }
            player.leftChips = ResponseData.s.procedure.turn.pl[i].c;
            if (ResponseData.s.procedure.turn.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.turn.pl[i].pot_out;
            }
            this.playerInfosTurn.push(player);
        }
        if (ResponseData.s.procedure.turn.pl != null && ResponseData.s.procedure.turn.pl.length > 0) {
            this.setChildLabel(this.$Turn, 'Title/coin/num', StringHelper.GetLongString(mPool));
        }
        // #endregion
        // #region River
        // //River
        this.$River.active = ResponseData.s.procedure.river.pl.length > 0;
        this.setChildLabel(this.$River, 'Title/player/num', `${ResponseData.s.procedure.river.pl.length}`);
        // 卡牌显示不受 pl 条件限制：全进等场景 pl 为空但牌已发出，必须无条件更新
        this.$River_Cards.children.forEach((item, index) => {
            let cardValue = this.PublicCards[index];
            let sprite = item.getComponent(cc.Sprite) || item.getComponentInChildren(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(cardValue), AssetFold.texture_SmallCard0);
            }
            item.active = cardValue > 0;
        });
        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.river.pl.length; i++) {
            let seatID = ResponseData.s.procedure.river.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log('playerInfo is null');
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.river.pl[i].sn);
            player.actList = this.getActionNumByName(ResponseData.s.procedure.river.pl[i].act);
            player.actChipList = ResponseData.s.procedure.river.pl[i].act_amt;
            playerInfo.handBet += ResponseData.s.procedure.river.pl[i].act_amt; //统计本手下注筹码
            player.leftChips = ResponseData.s.procedure.river.pl[i].c;
            player.playerId = playerInfo.playerId;
            if (ResponseData.s.procedure.river.pl[i].act == 'bet' || ResponseData.s.procedure.river.pl[i].act == 'raise') {
                times++;
                player.raiseTimes = times;
            }
            if (playerInfo.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
            } else {
                player.isMine = false;
            }
            if (ResponseData.s.procedure.river.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.river.pl[i].pot_out;
            }
            this.playerInfosRiver.push(player);
        }
        if (ResponseData.s.procedure.river.pl != null && ResponseData.s.procedure.river.pl.length > 0) {
            this.setChildLabel(this.$River, 'Title/coin/num', StringHelper.GetLongString(mPool));
        }
        // #endregion
        // //Winner
        for (let i = 0; i < ResponseData.s.result.length; i++) {
            let seatID = ResponseData.s.result[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            playerInfo.maxCardType = ResponseData.s.result[i].card_type;
            playerInfo.winAnte = ResponseData.s.result[i].win;
            playerInfo.insuranceGain = ResponseData.s.result[i].ins;
        }
        this.$Showdown.active = ResponseData.s.result.length > 0;
        this.setChildLabel(this.$Showdown, 'Title/player/num', `${ResponseData.s.result.length}`);
        //赢牌底池
        this.setChildLabel(this.$Showdown, 'Title/coin/num', StringHelper.GetLongString(mPool));
        this.setChildLabel(this.$Score, 'Title/coin/num', StringHelper.GetLongString(mPool));
        //第二套结算区显示
        if (this.$Showdown2) {
            this.$Showdown2.active = this.HaveSecondCard && ResponseData.s.result.length > 0;
            if (this.HaveSecondCard) {
                this.setChildLabel(this.$Showdown2, 'Title/player/num', `${ResponseData.s.result.length}`);
                this.setChildLabel(this.$Showdown2, 'Title/coin/num', StringHelper.GetLongString(mPool / 2));
            } else {
                // 单套牌局时清空标签，防止从双套牌局切换后残留旧数据
                this.setChildLabel(this.$Showdown2, 'Title/player/num', '');
                this.setChildLabel(this.$Showdown2, 'Title/coin/num', '');
            }
        }
        //ShowdownInfoList2.gameObject.SetActive(ResponseData.s.result.Count > 0 && HaveSecondCard);
        //ShowdownNum2.gameObject.SetActive(ResponseData.s.result.Count > 0 && HaveSecondCard);
        // //本手结束时底池
        if (this.HaveSecondCard) {
            //赢牌底池
            this.setChildLabel(this.$Showdown, 'Title/coin/num', StringHelper.GetLongString(mPool / 2));
            // ShowdownInfoList2.Find("PlayerNumText").GetComponent<Text>().text = ResponseData.s.result.Count.ToString();
            // //赢牌底池
            // ShowdownInfoList2.Find("ChipNumText").GetComponent<Text>().text = StringHelper.GetLongString(mPool / 2);
        }
        for (let i = 0; i < ResponseData.s.result.length; i++) {
            let seatID = ResponseData.s.result[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            let player: PlayerInfo = new PlayerInfo();
            player.userName = playerInfo.userName;
            player.playerPosition = playerInfo.playerPosition;
            player.winAnte = ResponseData.s.result[i].win;
            player.playerId = playerInfo.playerId;
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
                if (ResponseData.d != null && ResponseData.d.length >= 0) {
                    player.handCards = ResponseData.d;
                }
            } else {
                player.handCards = ResponseData.s.result[i].card;
                player.isMine = false;
            }
            player.maxCardType = ResponseData.s.result[i].card_type;
            player.maxCardIndex = playerInfo.maxCardIndex;
            player.insuranceGain = ResponseData.s.result[i].ins;
            if (this.HaveSecondCard) {
                player.winAnte2 = [];
                playerInfo.winAnte2 = [];
                let isWin1: boolean = ResponseData.s.result[i].sp_detail[0].is_winner;
                let isWin2: boolean = ResponseData.s.result[i].sp_detail[1].is_winner;
                let win1: number = ResponseData.s.result[i].sp_detail[0].win;
                let win2: number = ResponseData.s.result[i].sp_detail[1].win;
                let fee: number = ResponseData.s.result[i].fee;
                let fee1: number = 0;
                let fee2: number = 0;
                if (isWin1 && isWin2) {
                    if (fee != 0) {
                        fee1 = (win1 * fee) / (win1 + win2);
                        fee2 = fee - fee1;
                    }
                } else {
                    fee1 = isWin1 ? fee : 0;
                    fee2 = isWin2 ? fee : 0;
                }
                let handBet1: number = playerInfo.handBet / 2;
                let handBet2: number = playerInfo.handBet - handBet1;
                player.winAnte2.push(win1 - fee1 - handBet1);
                player.winAnte2.push(win2 - fee2 - handBet2);
                player.maxCardType2 = ResponseData.s.result[i].card_type2;
                player.maxCardIndex2 = ResponseData.s.result[i].maxcard_idx2;
                playerInfo.winAnte2.push(win1 - fee1 - handBet1);
                playerInfo.winAnte2.push(win2 - fee2 - handBet2);
                playerInfo.maxCardIndex2 = ResponseData.s.result[i].maxcard_idx2;
            }
            this.playerInfosWinner.push(player);
        }
        //赋值玩家数据
        this.clearChilds(this.$Score_Childs, this.Score_Child_Pool);
        this.clearChilds(this.$Preflop_Childs, this.Preflop_Child_Pool);
        this.clearChilds(this.$Flop_Childs, this.Flop_Child_Pool);
        this.clearChilds(this.$Turn_Childs, this.Turn_Child_Pool);
        this.clearChilds(this.$River_Childs, this.River_Child_Pool);
        this.clearChilds(this.$Showdown_Childs, this.Score_Child_Pool);
        this.clearChilds(this.$Showdown2_Childs, this.Showdown2_Child_Pool);
        for (let i = 0; i < this.playerInfos.length; i++) {
            let pool = this.HaveSecondCard ? this.Score_Second_Child_Pool : this.Score_Child_Pool;
            let go = this.GetCreatePrefab(pool, this.$Score_Childs);
            this.AllPlayerCardsInfos.push(go);
            go.active = true;
            if (this.HaveSecondCard) {
                this.SetPlayerSecondCardItem(go, this.playerInfos[i]);
            } else {
                this.SetPlayerCardItem(go, this.playerInfos[i]);
            }
            // layoutDetailHandCards 已将手牌约束在固定范围内，无需按牌数动态偏移
            // Score_Child prefab: cards_position 默认 X=-142
            // Score_Second_Child prefab: cards_position 默认 X=-367.499，补偿差值 -225.499
            const secondBoardOffset = this.HaveSecondCard ? -225.499 : 0;
            go.getChildByName('cards_position').x = -142 + secondBoardOffset;
        }
        for (let i = 0; i < this.playerInfosPreFlop.length; i++) {
            let go = this.GetCreatePrefab(this.Preflop_Child_Pool, this.$Preflop_Childs);
            this.AllPlayerCardsInfosPreFlop.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosPreFlop[i], true);
        }
        for (let i = 0; i < this.playerInfosFlop.length; i++) {
            let go = this.GetCreatePrefab(this.Flop_Child_Pool, this.$Flop_Childs);
            this.AllPlayerCardsInfosFlop.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosFlop[i]);
        }
        for (let i = 0; i < this.playerInfosTurn.length; i++) {
            let go = this.GetCreatePrefab(this.Turn_Child_Pool, this.$Turn_Childs);
            this.AllPlayerCardsInfosTurn.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosTurn[i]);
        }
        for (let i = 0; i < this.playerInfosRiver.length; i++) {
            let go = this.GetCreatePrefab(this.River_Child_Pool, this.$River_Childs);
            this.AllPlayerCardsInfosRiver.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosRiver[i]);
        }
        for (let i = 0; i < this.playerInfosWinner.length; i++) {
            let go = this.GetCreatePrefab(this.Score_Child_Pool, this.$Showdown_Childs);
            this.AllPlayerCardsInfosWinner.push(go);
            go.active = true;
            this.SetPlayerCardItem(go, this.playerInfosWinner[i]);
            this.m_winUserId = this.playerInfosWinner[i].playerId;
        }
        //结果的第二套牌
        if (this.HaveSecondCard) {
            for (let i = 0; i < this.playerInfosWinner.length; i++) {
                let go = this.GetCreatePrefab(this.Showdown2_Child_Pool, this.$Showdown2_Childs);
                go.active = true;
                this.SetShowdown2CardItem(go, this.playerInfosWinner[i]);
            }
        }
        // if (this.historyInfoData.bInsurance) {
        //     ContentHeight += 200;
        // }
        // //保险
        this.setChildVisible(this.$Score, 'Shows/insurance', mInsurancePool != 0);
        this.setChildLabel(this.$Score, 'Shows/insurance/value', StringHelper.GetSignedLongString(mInsurancePool));
        this.setChildVisible(this.$Showdown, 'Shows/insurance', mInsurancePool != 0);
        this.setChildLabel(this.$Showdown, 'Shows/insurance/value', StringHelper.GetSignedLongString(mInsurancePool));
        // 偷偷看按钮：还有未查看的手牌时显示
        if (this.$PeekButton) {
            let peekBtn = this.$PeekButton.getComponent(cc.Button);
            let hasHidden = this.hasHiddenCards(ResponseData);
            if (peekBtn) peekBtn.interactable = hasHidden;
            this.$PeekButton.opacity = hasHidden ? 255 : 128;
            // 切换牌局时刷新价格（阶梯次数可能已变）
            if (hasHidden) this.reqPeekPrice();
        }
        // 发发看按钮 (对齐 Unity SetViewPublicCardPrice: _firstPublicCards[4]!=0 || !_hasMe → 不可点击)
        if (this.$ViewPubButton) {
            let riverRevealed = this.PublicCards[4] !== 0;
            let canView = !riverRevealed && this._hasMe;
            let hasHidden = canView && this.hasHiddenPublicCards();
            let viewPubBtn = this.$ViewPubButton.getComponent(cc.Button);
            if (viewPubBtn) viewPubBtn.interactable = hasHidden;
            this.$ViewPubButton.opacity = hasHidden ? 255 : 128;
            if (hasHidden) this.reqViewPubPrice();
        }
        // 缓存回放数据用于发发看后重新渲染
        this._lastResponseData = ResponseData;
        // 默认折叠详情区域
        this.enforceDetailsVisibility();
        // 查询当前手牌是否已收藏并更新 star 颜色
        this.refreshCollectShow(false);
        this.reqCollectStatus();
    }

    setBtnState() {
        this.buttonFirstPage.interactable = false;
        this.buttonLastPage.interactable = false;
        this.buttonPrePage.interactable = false;
        this.buttonNextPage.interactable = false;
    }

    onClickFirstPage(event) {
        if (this.buttonFirstPage.interactable == false) return;
        this.currentPage = 1;
        this.RefreshData(this.currentPage);
    }

    onClickPrePage(event) {
        if (this.buttonPrePage.interactable == false) return;
        this.currentPage--;
        this.RefreshData(this.currentPage);
    }

    onClickNextPage(event) {
        if (this.buttonNextPage.interactable == false) return;
        this.currentPage++;
        this.RefreshData(this.currentPage);
    }

    onClickLastPage(event) {
        if (this.buttonLastPage.interactable == false) return;
        this.currentPage = this.totalPage;
        this.RefreshData(this.currentPage);
    }

    resetData() {
        // 清空 Dashboard 概览区
        this.clearDashboard();
        // 清空偷偷看缓存
        this.beWatchedUserHands = [];
        for (let index = 0; index < this.AllPlayerCardsInfos.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfos[index];
            element.destroy();
        }
        this.AllPlayerCardsInfos = [];
        for (let index = 0; index < this.AllPlayerCardsInfosPreFlop.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosPreFlop[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosPreFlop = [];
        for (let index = 0; index < this.AllPlayerCardsInfosFlop.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosFlop[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosFlop = [];
        for (let index = 0; index < this.AllPlayerCardsInfosTurn.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosTurn[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosTurn = [];
        for (let index = 0; index < this.AllPlayerCardsInfosRiver.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosRiver[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosRiver = [];
        for (let index = 0; index < this.AllPlayerCardsInfosWinner.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosWinner[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosWinner = [];
        this.playerInfos = [];
        this.playerInfosPreFlop = [];
        this.playerInfosFlop = [];
        this.playerInfosTurn = [];
        this.playerInfosRiver = [];
        this.playerInfosWinner = [];
    }

    shouCangBtn() {}

    /// <summary>
    /// 设置无牌预制体
    /// </summary>
    SetPlayerItem(go, element, isoutchip = false) {
        //go.getChildByName("Text_name").getComponent(cc.Label).string = StringHelper.LengthNick(element.nickNameStr);
        this.setChildLabel(go, 'player_nick', element.nickNameStr);
        if (isoutchip) {
            this.setChildLabel(go, 'win', StringHelper.GetDecimalN(element.leftChips / 100));
        } else {
            this.setChildLabel(go, 'win', 'P:' + StringHelper.GetDecimalN(element.leftChips / 100));
        }
        if (element.isMine) {
            // cc.find('PositionImageBg/PositionText', go).color = cc.color(225, 181, 141, 255);
            // go.getChildByName("Text_name").color = cc.color(225, 181, 141, 255);
            // cc.find('PositionImageChipBg/Text', go).color = cc.color(225, 181, 141, 255);
            // go.getChildByName("Text_wins").color = cc.color(225, 181, 141, 255);
        } else {
            // cc.find('PositionImageBg/PositionText', go).color = cc.color(255, 255, 255, 255);
            // go.getChildByName("Text_name").color = cc.color(255, 255, 255, 255);
            // cc.find('PositionImageChipBg/Text', go).color = cc.color(255, 255, 255, 255);
            // go.getChildByName("Text_wins").color = cc.color(255, 255, 255, 255);
        }
        this.setChildLabel(go, 'SB/label', this.PlayerPositionStr[element.playerPosition]);
        if (element.actList == 6 || element.actList == 7) {
            if (element.raiseTimes == 1) {
                this.setChildLabel(go, 'CC/action', this.PlayerActionStr[element.actList]);
            } else if (element.raiseTimes == 2) {
                this.setChildLabel(go, 'CC/action', this.PlayerActionStr[7]);
            } else {
                this.setChildLabel(go, 'CC/action', element.raiseTimes + 'B');
            }
        } else {
            this.setChildLabel(go, 'CC/action', this.PlayerActionStr[element.actList]);
        }
        //
        this.setChildLabel(go, 'CC/chip', StringHelper.GetLongString(element.actChipList)); //下注数
        if (element.actList > 0 && element.actList < 5) {
            this.setChildColor(go, 'CC/BG', this.color_green); //绿
            this.setChildOpacity(go, 'CC/BG', 255);
        } else if (element.actList > 4 && element.actList < 10) {
            this.setChildColor(go, 'CC/BG', this.color_red); //红
            this.setChildOpacity(go, 'CC/BG', 255);
        } else if (element.actList == 11) //黄，新加保险，暂时
        {
            this.setChildColor(go, 'CC/BG', this.color_yellow); //黄
            this.setChildOpacity(go, 'CC/BG', 255);
        } else {
            this.setChildColor(go, 'CC/BG', this.color_gray); //灰
            this.setChildOpacity(go, 'CC/BG', 198);
        }
        if (element.actList == 9) {
            this.setChildColor(go, 'win', cc.color(198, 198, 198));
            this.setChildOpacity(go, 'win', 160);
        } else {
            this.setChildColor(go, 'win', TextColor.Color1);
            this.setChildOpacity(go, 'win', 255);
        }
    }

    /**
     * 详情页手牌紧密排列
     * 参照 playerCardNode 的排列算法:
     *   spacing = min(牌宽+间隙, (rightX-leftX)/(count-1))
     *   2张 → 不重叠平铺; 4~6张 → 等距叠加
     *
     * @param handCardsNode  cards_position/hand_cards 节点
     * @param cardCount      需要显示的牌数 (2~6)
     * @param leftX          prefab 中最左侧牌的中心 x
     * @param rightX         prefab 中最右侧牌的中心 x
     * @param cards          牌值数组, null 时显示牌背
     */
    private layoutDetailHandCards(handCardsNode: cc.Node, cardCount: number, leftX: number, rightX: number, cards: number[] | null) {
        const CARD_WIDTH = 84;
        const VISIBLE_GAP = 4;
        const spacing = cardCount > 1 ? Math.min(CARD_WIDTH + VISIBLE_GAP, (rightX - leftX) / (cardCount - 1)) : 0;
        const children = handCardsNode.children;
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            if (i < cardCount) {
                item.active = true;
                item.x = cardCount === 1 ? leftX : leftX + i * spacing;
                item.zIndex = i;
                let sprite = item.getComponent(cc.Sprite);
                if (sprite) {
                    let cardVal = cards ? cards[i] || 0 : 0;
                    sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(cardVal), AssetFold.texture_SmallCard0);
                }
            } else {
                item.active = false;
            }
        }
    }

    tryParse(x: string) {
        let y = x.indexOf('.') + 1; //获取小数点的位置
        let length = x.length - y; //获取小数点后的个数
        if (y > 0) {
            return x.substring(0, y + 1);
        } else {
            return x;
        }
    }

    GetShowCardType(cardType) {
        return CardTypeUtil.GetCardTypeEnglishName(cardType);
    }

    /**
     * Showdown 第二套结算区渲染
     * 模板使用 Score_Child（单套公牌布局），渲染第二套公共牌、第二套牌型、第二套盈亏和高亮
     */
    private SetShowdown2CardItem(go: cc.Node, element: PlayerInfo) {
        //玩家名字
        this.setChildLabel(go, 'cards_position/nick/label', StringHelper.LengthNick(element.userName));
        //第二套盈亏
        let winStr = '';
        if (element.winAnte2 && element.winAnte2.length > 1) {
            winStr = StringHelper.GetLongString(element.winAnte2[1]);
        }
        this.setChildLabel(go, 'win', winStr);
        //保险
        if (element.insuranceGain != 0) {
            this.setChildLabel(go, 'score', StringHelper.GetSignedLongString(element.insuranceGain));
        } else {
            this.setChildLabel(go, 'score', '');
        }
        //位置
        this.setChildLabel(go, 'SB/label', this.PlayerPositionStr[element.playerPosition]);
        //第二套牌型
        this.setChildLabel(go, 'pai_type', element.maxCardType2 != null ? this.GetShowCardType(element.maxCardType2) : '');
        //手牌 + 公共牌
        let hand_cards: cc.Node = cc.find('cards_position/hand_cards', go);
        let public_cards = cc.find('cards_position/public_cards', go);
        //手牌紧密排列
        let cardCount = GameCache.Instance.CurGame.HandCards;
        this.layoutDetailHandCards(hand_cards, cardCount, -477, -331.32, element.handCards.length <= 0 ? null : element.handCards);
        //第二套公共牌显示
        public_cards.children.forEach((item, index) => {
            let sprite = item.getComponent(cc.Sprite);
            if (!sprite) return;
            let cardVal = this.SecondPublicCards[index] || 0;
            item.active = cardVal > 0;
            sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(cardVal), AssetFold.texture_SmallCard0);
        });
        //高亮牌显示 — 使用第二套高亮索引
        if (element.maxCardIndex2 != null && element.maxCardIndex2.length > 0) {
            //手牌置灰
            hand_cards.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            });
            //公共牌置灰
            public_cards.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            });
            //高亮第二套赢牌
            for (let i = 0; i < element.maxCardIndex2.length; i++) {
                if (element.maxCardIndex2[i] >= 5) {
                    let child = hand_cards.children[element.maxCardIndex2[i] - 5];
                    if (child) child.color = cc.color(255, 255, 255);
                } else {
                    let child = public_cards.children[element.maxCardIndex2[i]];
                    if (child) child.color = cc.color(255, 255, 255);
                }
            }
        }
    }

    SetPlayerCardItem(go, element, isSecond = false, SpcsIndex = 0) {
        //玩家名字
        this.setChildLabel(go, 'cards_position/nick/label', StringHelper.LengthNick(element.userName));
        //输赢筹码f
        let str = StringHelper.GetLongString(element.winAnte);
        if (isSecond) {
            str = StringHelper.GetLongString(element.winAnte2[SpcsIndex]);
        }
        this.setChildLabel(go, 'win', str);
        //保险
        if (element.insuranceGain != 0) {
            this.setChildLabel(go, 'score', StringHelper.GetSignedLongString(element.insuranceGain));
        } else {
            this.setChildLabel(go, 'score', '');
        }
        //判断是否是自己
        if (element.isMine) {
            //go.transform.Find("PositionImageBg/PositionText").GetComponent<Text>().color = meColor;
        } else {
            //go.transform.Find("PositionImageBg/PositionText").GetComponent<Text>().color = otherColor;
        }
        //位置
        this.setChildLabel(go, 'SB/label', this.PlayerPositionStr[element.playerPosition]);
        //牌型
        if (isSecond && SpcsIndex != 0) {
            this.setChildLabel(go, 'pai_type', this.GetShowCardType(element.maxCardType2));
        } else {
            this.setChildLabel(go, 'pai_type', this.GetShowCardType(element.maxCardType));
        }
        //#region  牌
        //手牌
        // let handcards = [];
        // for (int i = 1; i <= 6; i++)
        // {
        //     Image handCard = go.transform.Find("Image_handCard" + i).GetComponent<Image>();
        //     handCard.gameObject.SetActive(false);
        //     handcards.Add(handCard);
        // }
        //         //公共牌
        //         List < Image > publicCards = new List<Image>();
        //         for (int i = 1; i <= 5; i++)
        //         {
        //     Image publicCard = go.transform.Find("PublicCardpos/Image_publicCard" + i).GetComponent<Image>();
        //             publicCard.gameObject.SetActive(false);
        //             publicCards.Add(publicCard);
        //         }
        let hand_cards: cc.Node = cc.find('cards_position/hand_cards', go);
        let public_cards = cc.find('cards_position/public_cards', go);
        //手牌显示 + 紧密排列 (Score_Child prefab: card[0]=-477, card[5]=-331.32)
        let cardCount = GameCache.Instance.CurGame.HandCards;
        this.layoutDetailHandCards(hand_cards, cardCount, -477, -331.32, element.handCards.length <= 0 ? null : element.handCards);
        if (isSecond) public_cards = public_cards.children[0];
        if (isSecond && SpcsIndex != 0) {
            //公共牌显示
            // for (int i = 0; i < 5; i++)
            // {
            //     Image publicCard = go.transform.Find($"PublicCardpos/Image_publicCard{i + 1}").GetComponent<Image>();
            //     if (SecondPublicCards[i] == 0) {
            //         //没发完的公共牌不显示
            //         publicCard.gameObject.SetActive(false);
            //     }
            //     else {
            //         publicCard.gameObject.SetActive(true);
            //         publicCard.sprite = rcPokerSprite.Get<Sprite>(GameUtil.GetCardNameByNum((sbyte)SecondPublicCards[i]));
            //     }
            // }
        } else {
            //第一套公共牌显示
            public_cards.children.forEach((item, index) => {
                let sprite = item.getComponent(cc.Sprite);
                if (!sprite) return;
                item.active = this.PublicCards[index] > 0;
                sprite.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            });
        }
        if (isSecond && SpcsIndex != 0) {
            //高亮牌显示
            // if (element.maxCardIndex2 != null && element.maxCardIndex2.Count > 0) {
            //     //手牌置灰
            //     for (int i = 0; i < handcards.Count; i++)
            //     {
            //         handcards[i].GetComponent<Image>().color = new Color32(127, 127, 127, 255);
            //     }
            //     //公共牌置灰
            //     for (int i = 0; i < publicCards.Count; i++)
            //     {
            //         publicCards[i].GetComponent<Image>().color = new Color32(127, 127, 127, 255);
            //     }
            //     for (int i = 0; i < element.maxCardIndex2.Count; i++)
            //     {
            //         if (element.maxCardIndex2[i] >= 5) {
            //             handcards[element.maxCardIndex2[i] - 5].GetComponent<Image>().color = new Color32(255, 255, 255, 255);
            //         }
            //         else {
            //             publicCards[element.maxCardIndex2[i]].GetComponent<Image>().color = new Color32(255, 255, 255, 255);
            //         }
            //     }
            // }
        } else {
            //高亮牌显示
            if (element.maxCardIndex != null && element.maxCardIndex.length > 0) {
                //手牌置灰
                hand_cards.children.forEach(item => {
                    item.color = cc.color(127, 127, 127);
                });
                //公共牌置灰
                public_cards.children.forEach(item => {
                    item.color = cc.color(127, 127, 127);
                });
                for (let i = 0; i < element.maxCardIndex.length; i++) {
                    if (element.maxCardIndex[i] >= 5) {
                        let child = hand_cards.children[element.maxCardIndex[i] - 5];
                        if (child) child.color = cc.color(255, 255, 255);
                    } else {
                        let child = public_cards.children[element.maxCardIndex[i]];
                        if (child) child.color = cc.color(255, 255, 255);
                    }
                }
            }
        }
    }

    SetPlayerSecondCardItem(go, element) {
        //玩家名字
        this.setChildLabel(go, 'cards_position/nick/label', StringHelper.LengthNick(element.userName));
        //输赢筹码
        this.setChildLabel(go, 'win1', StringHelper.GetDecimalN(element.winAnte2[0] / 100));
        this.setChildLabel(go, 'win2', StringHelper.GetDecimalN(element.winAnte2[1] / 100));
        //保险
        if (element.insuranceGain != 0) {
            this.setChildLabel(go, 'score', StringHelper.GetSignedLongString(element.insuranceGain));
        } else {
            this.setChildLabel(go, 'score', '');
        }
        //判断是否是自己
        if (element.isMine) {
            // cc.find('PositionImageBg/PositionText', go).color = cc.color(220, 186, 130, 255);
            // go.getChildByName("Text_name").getComponent(cc.Label).color = cc.color(220, 186, 130, 255);
            // if (go.getChildByName("Text_wins")) {
            //     go.getChildByName("Text_wins").getComponent(cc.Label).color = cc.color(220, 186, 130, 255);
            // }
            // if (go.getChildByName("Text_secondWins")) {
            //     go.getChildByName("Text_secondWins").getComponent(cc.Label).color = cc.color(220, 186, 130, 255);
            // }
        } else {
            // cc.find('PositionImageBg/PositionText', go).color = cc.color(255, 255, 255, 255);
            // go.getChildByName("Text_name").color = cc.color(255, 255, 255, 255);
            // if (go.getChildByName("Text_wins")) {
            //     go.getChildByName("Text_wins").color = cc.color(255, 255, 255, 255);
            // }
            // if (go.getChildByName("Text_secondWins")) {
            //     go.getChildByName("Text_secondWins").color = cc.color(255, 255, 255, 255);
            // }
        }
        //位置
        this.setChildLabel(go, 'SB/label', this.PlayerPositionStr[element.playerPosition]);
        //牌型
        this.setChildLabel(go, 'pai_type', this.GetShowCardType(element.maxCardType));
        //#region  牌
        let hand_cards: cc.Node = cc.find('cards_position/hand_cards', go);
        let public_cards1 = cc.find('cards_position/public_cards/cards1', go);
        let public_cards2 = cc.find('cards_position/public_cards/cards2', go);
        //手牌显示 + 紧密排列 (Score_Second_Child prefab: card[0]=-222, card[5]=-79.566)
        let cardCount = GameCache.Instance.CurGame.HandCards;
        this.layoutDetailHandCards(hand_cards, cardCount, -222, -79.566, element.handCards.length <= 0 ? null : element.handCards);
        //公共牌显示
        for (let i = 0; i < 5; i++) {
            let publicCard1 = public_cards1.children[i];
            let publicCard2 = public_cards2.children[i];
            if (!publicCard1 || !publicCard2) continue;
            if (this.PublicCards[i] == 0) {
                //没发完的公共牌不显示
                publicCard1.active = false;
                publicCard2.active = false;
            } else {
                publicCard1.active = true;
                let sprite1 = publicCard1.getComponent(cc.Sprite);
                if (sprite1) sprite1.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0);
                publicCard2.active = true;
                let sprite2 = publicCard2.getComponent(cc.Sprite);
                if (sprite2) sprite2.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.SecondPublicCards[i]), AssetFold.texture_SmallCard0);
            }
        }
        //高亮牌显示 — 合并处理，避免第二套高亮被第一套覆盖
        const hasHighlight1 = element.maxCardIndex != null && element.maxCardIndex.length > 0;
        const hasHighlight2 = element.maxCardIndex2 != null && element.maxCardIndex2.length > 0;
        if (hasHighlight1 || hasHighlight2) {
            // 先全部置灰
            hand_cards.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            });
            public_cards1.children.forEach(item => {
                let sprite = item.getComponent(cc.Sprite);
                if (sprite) item.color = cc.color(127, 127, 127);
            });
            public_cards2.children.forEach(item => {
                let sprite = item.getComponent(cc.Sprite);
                if (sprite) item.color = cc.color(127, 127, 127);
            });
            // 高亮第一套赢牌
            if (hasHighlight1) {
                for (let i = 0; i < element.maxCardIndex.length; i++) {
                    if (element.maxCardIndex[i] >= 5) {
                        let child = hand_cards.children[element.maxCardIndex[i] - 5];
                        if (child) child.color = cc.color(255, 255, 255);
                    } else {
                        let child = public_cards1.children[element.maxCardIndex[i]];
                        if (child) child.color = cc.color(255, 255, 255);
                    }
                }
            }
            // 高亮第二套赢牌 (手牌可能被第一套也高亮，再高亮一次无害)
            if (hasHighlight2) {
                for (let i = 0; i < element.maxCardIndex2.length; i++) {
                    if (element.maxCardIndex2[i] >= 5) {
                        let child = hand_cards.children[element.maxCardIndex2[i] - 5];
                        if (child) child.color = cc.color(255, 255, 255);
                    } else {
                        let child = public_cards2.children[element.maxCardIndex2[i]];
                        if (child) child.color = cc.color(255, 255, 255);
                    }
                }
            }
        }
        // #endregion
    }

    GetCreatePrefab(pool: SimpleNodePool, parentNode) {
        let node = pool.GetNode();
        node.parent = parentNode;
        return node;
    }

    /// 通过操作名字，取得对应缩写数组下标
    /// </summary>
    /// <param name="actionName"></param>
    /// <returns></returns>
    private getActionNumByName(actionName) {
        let action = 0;
        switch (actionName) {
            case 'small blind':
                action = 1;
                break;
            case 'big blind':
                action = 2;
                break;
            case 'call':
                action = 3;
                break;
            case 'check':
                action = 4;
                break;
            case 'straddle':
                action = 5;
                break;
            case 'bet':
                action = 6;
                break;
            case 'raise':
                action = 7;
                break;
            case 'all in':
                action = 9;
                break;
            case 'fold':
                action = 10;
                break;
            case 'insure':
                action = 11;
                break;
        }
        return action;
    }

    /// 获取玩家列表单个玩家
    /// </summary>
    /// <param name="playerInfos"></param>
    /// <param name="severSeatId"></param>
    /// <returns></returns>
    GetPlayerInfoByPlayerInfoList(playerInfos, severSeatId) {
        for (let index = 0; index < playerInfos.length; index++) {
            const element = playerInfos[index];
            if (severSeatId == element.seatID) {
                return element;
            }
        }
        return null;
    }

    getPositionNumByBaner(seatIds, banerSeatId, seatId) {
        let positionNum = 0;
        seatIds.sort();
        let banerMarkId = seatIds.indexOf(banerSeatId);
        let tmpSeatIds = [];
        for (let i = 0; i < seatIds.length; i++) {
            if (i >= banerMarkId) {
                tmpSeatIds.push(seatIds[i]);
            }
        }
        for (let i = 0; i < seatIds.length; i++) {
            if (i < banerMarkId) {
                tmpSeatIds.push(seatIds[i]);
            }
        }
        positionNum = tmpSeatIds.indexOf(seatId);
        return positionNum;
    }

    // 刷新顶部玩家数量和当前手数
    RefreshTopHandAndPlayerNumInfo(playerNum: string) {
        this.setChildLabel(this.$Top, 'player_count_label', `${playerNum}/${GameCache.Instance.seat_count}`);
        this.setChildLabel(this.$Top, 'room_id_label', `${GameCache.Instance.room_id}-${this.currentPage}`);
    }

    // imageMaskCloseClick() {
    //     UIComponent.close(this.UIDefine);
    // }
    get moni_data() {
        return {
            status: 0,
            data: 'eyJkIjpbNTUsNTldLCJzIjp7InJlc3VsdCI6W3sic24iOjEsIndpbiI6LTIwLCJpbnMiOjAsImZlZSI6MCwiYWN0aXZlIjpmYWxzZSwibWF4Y2FyZF9pZHgiOlswLDIsMyw0LDZdLCJjYXJkX3R5cGUiOjIsImNhcmQiOls0LDE0XX0seyJzbiI6Miwid2luIjoyMCwiaW5zIjowLCJmZWUiOjAsImFjdGl2ZSI6ZmFsc2UsIm1heGNhcmRfaWR4IjpbMCwyLDQsNSw2XSwiY2FyZF90eXBlIjoyLCJjYXJkIjpbNTUsNTldfV0sImV0aW1lIjoxNjg0MDg0NTY4LCJzdHJhZGRsZSI6ZmFsc2UsInN0aW1lIjoxNjg0MDg0NTM5LCJoYW5kIjoxLCJ0YWJsZSI6eyJhbnRlIjowLCJwbCI6W3sic24iOjEsImMiOjIwMCwiYXZhdGFyIjoiaHR0cHM6Ly9zdGF0aWMuYXdhbnB0ZXN0LmNvbS9hd2FucHRlc3RpbmctaW50bC10ZXN0L2ltYWdlLWF2YXRhci85NjYxNTcwNi1qQ2Rkei5wbmciLCJuYW1lIjoi5LiJ5Liq5qC45qGDIiwidWlkIjo5NjYxNTcwNn0seyJzbiI6MiwiYyI6MjAwLCJhdmF0YXIiOiJodHRwczovL3N0YXRpYy5hd2FucHRlc3QuY29tL2F3YW5wdGVzdGluZy1pbnRsLXRlc3QvaW1hZ2Utbm9ybWFsLzIwMjIwMzEwMDk0NzIxLXpkQXJ0LnBuZyIsIm5hbWUiOiJQbGF5ZXI0IiwidWlkIjo5NTAxNTcwNn1dLCJzYiI6eyJzbiI6MSwiYmV0IjoxMH0sImJiIjp7InNuIjoyLCJiZXQiOjIwfSwic3RyYWRkbGUiOm51bGwsImJ0biI6MSwic2VhdGNvdW50IjoyfSwibmFtZSI6Inl5eS05MiIsInJpZCI6OTg2OTcwNjYsIm1pZCI6MCwidW5pcXVlIjoiMTY4NDA4NDM0NSIsInByb2NlZHVyZSI6eyJwcmVmbG9wIjp7InBsIjpbeyJjIjoxOTAsInBvdF9vdXQiOjEwLCJzbiI6MSwiYWN0Ijoic21hbGwgYmxpbmQiLCJhY3RfYW10IjoxMH0seyJjIjoxODAsInBvdF9vdXQiOjMwLCJzbiI6MiwiYWN0IjoiYmlnIGJsaW5kIiwiYWN0X2FtdCI6MjB9LHsiYyI6MTgwLCJwb3Rfb3V0Ijo0MCwic24iOjEsImFjdCI6ImNhbGwiLCJhY3RfYW10IjoxMH0seyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MiwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfV19LCJmbG9wIjp7InBsIjpbeyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MiwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfSx7ImMiOjE4MCwicG90X291dCI6NDAsInNuIjoxLCJhY3QiOiJjaGVjayIsImFjdF9hbXQiOjB9XSwiY2FyZCI6WzQyLDYsMjhdfSwidHVybiI6eyJwbCI6W3siYyI6MTgwLCJwb3Rfb3V0Ijo0MCwic24iOjIsImFjdCI6ImNoZWNrIiwiYWN0X2FtdCI6MH0seyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MSwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfV0sImNhcmQiOlsyMl19LCJyaXZlciI6eyJwbCI6W3siYyI6MTgwLCJwb3Rfb3V0Ijo0MCwic24iOjIsImFjdCI6ImNoZWNrIiwiYWN0X2FtdCI6MH0seyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MSwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfV0sImNhcmQiOls0M119fX0sInUiOjk1MDE1NzA2fQ=='
        };
    }

    //清理child节点
    clearChilds(childs: cc.Node, pool: SimpleNodePool) {
        childs.children.forEach(item => {
            pool.BackNode(item);
        });
        childs.removeAllChildren();
    }

    /**
     * 清理上一手双套牌残留的 UI (公共牌、子节点、节点池污染)
     * @param prevHaveSecondCard 上一手是否为双套牌局，用于将 $Score_Childs 中的节点还回正确的池子
     */
    private clearSecondBoardUI(prevHaveSecondCard: boolean) {
        // 关键：如果上一手是双套牌，$Score_Childs 下挂的是 Score_Second_Child_Pool 的节点
        // 必须还回 Score_Second_Child_Pool，否则会污染 Score_Child_Pool
        if (prevHaveSecondCard && this.$Score_Childs && this.Score_Second_Child_Pool) {
            this.clearChilds(this.$Score_Childs, this.Score_Second_Child_Pool);
        }
        // 清空第二套公牌显示
        if (this.$Showdown2_PublicCards) {
            this.$Showdown2_PublicCards.children.forEach(item => {
                item.active = false;
            });
        }
        // 回收第二套 Score 子节点
        if (this.$Showdown2_Childs && this.Showdown2_Child_Pool) {
            this.clearChilds(this.$Showdown2_Childs, this.Showdown2_Child_Pool);
        }
    }

    //关闭处理的内容
    onClose(param?: any): void {
        super.onClose(param);
        this.removeHandler();
        this.clearDashboard();
    }
}
