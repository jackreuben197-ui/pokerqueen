import SimpleNodePool from "../../common/MyNodePool";
import SliderPlus from "../../common/SliderPlus";
import { TextColor } from "../../config/GameConfig";
import CPMessageDispatherComponent from "../../event/CPMessageDispatherComponent";
import GC from "../../frame/GameControl";
import PublicHelper from "../../helper/PublicHelper";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { WebRoomCenterHistoryReplay } from "../../net/https/WebRequest";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import UIBase from "../../ui/UIBase";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent from "../../ui/UIComponent";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import { CardTypeUtil } from "../CardTypeUtil";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";
import TexasGameUtils from "../util/TexasGameUtils";



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
    public playerId: number;//uid 随机ID
    public userName: string;//名字
    public headPic: string;//头像
    public seatID: number;//座位号
    public initChip: number = 0;//初始筹码
    public maxCardIndex: number[];//最大牌型数组下标
    public maxCardType: number;//最大牌型
    public winAnte: number = 0;//输赢筹码
    public insuranceGain: number = 0;//保险
    public handCards: number[];//手牌
    public isMine: boolean;//是否是自己
    public playerPosition: number;
    public handBet: number = 0;
    public maxCardType2: number;//最大牌型
    public maxCardIndex2: number[];//最大牌型数组下标
    public winAnte2: number[];//第二套公共牌输赢筹码
}

export class PlayerActionDataInfo {
    public nickNameStr;// 昵称// 玩家昵称，@%分割
    public headStr;//  头像，@%分割
    public playerPosition;// 用户位置 盲注/大盲注/庄家
    public actList;// 玩家操作明细
    public actChipList; // 玩家操作对应筹码

    public leftChips;//玩家剩余筹码
    public isMine;//是否是自己
    public playerId;//玩家id
    public raiseTimes;//加注次数
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasHistory extends UIBasePlus {
    currentPage = 0;
    totalPage = 0;
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


    tableSeatIds: Array<number> = []

    AllPlayerCardsInfos = []
    AllPlayerCardsInfosPreFlop = []
    AllPlayerCardsInfosFlop = []
    AllPlayerCardsInfosTurn = []
    AllPlayerCardsInfosRiver = []
    AllPlayerCardsInfosWinner = []

    buttonFirstPage: cc.Button = null;
    buttonLastPage: cc.Button = null;
    buttonPrePage: cc.Button = null;
    buttonNextPage: cc.Button = null;
    Text_num: cc.Label = null;
    m_winUserId = 0;

    /// 0 庄家，1 小盲注，2 大盲注，3 枪口，4 枪口+1，5 中位1，6 中位2，7 劫位，8 关位
    /// </summary>
    private PlayerPositionStr = ["BTN", "SB", "BB", "UTG", "UTG+1", "MP1", "MP2", "HJ", "CO"];
    /// <summary>
    /// 0 ，1 小盲注，2 大盲注，3 跟住，4 让牌，5 强制盲注，6 下注，7 加注，8 3次加注，9 全下，10 弃牌，11 保险，
    /// </summary>
    private PlayerActionStr = ["", "SB", "BB", "C", "X", "S", "B", "R", "3B", "A", "F", "INS"];




    playerInfos: PlayerInfo[] = null;
    playerInfosPreFlop: PlayerActionDataInfo[] = null;
    playerInfosFlop: PlayerActionDataInfo[] = null;
    playerInfosTurn: PlayerActionDataInfo[] = null;
    playerInfosRiver: PlayerActionDataInfo[] = null;
    playerInfosWinner: PlayerInfo[] = null;



    $bg_click: cc.Node = null;

    //顶部包含房间信息
    $Top: cc.Node = null;
    $Score: cc.Node = null;
    $Preflop: cc.Node = null;
    $Flop: cc.Node = null;
    $Turn: cc.Node = null;
    $River: cc.Node = null;
    $Showdown: cc.Node = null;

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
        6: -241,
    };
    color_green = cc.color(86, 181, 87);
    color_red = cc.color(230, 68, 85);
    color_yellow = cc.color(255, 184, 83, 255);
    color_gray = cc.color(198, 198, 198);


    SliderPlus$slider: SliderPlus = null;

    cc_Label$page: cc.Label = null;

    $left_btn: cc.Node = null;
    $right_btn: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.InitUI();
        this.playerInfos = []
        this.playerInfosPreFlop = []
        this.playerInfosFlop = []
        this.playerInfosTurn = []
        this.playerInfosRiver = []
        this.playerInfosWinner = []

        this.Score_Child_Pool = new SimpleNodePool(this.$Score_Child);
        this.Score_Second_Child_Pool = new SimpleNodePool(this.$Score_Second_Child);
        this.Preflop_Child_Pool = new SimpleNodePool(this.$Preflop_Child);
        this.Flop_Child_Pool = new SimpleNodePool(this.$Flop_Child);
        this.Turn_Child_Pool = new SimpleNodePool(this.$Turn_Child);
        this.River_Child_Pool = new SimpleNodePool(this.$River_Child);
        this.$Score_Childs.removeAllChildren();
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$bg_click, this.click_bg);

        this.setButtonClick(this.$left_btn, this.click_left);
        this.setButtonClick(this.$right_btn, this.click_right);
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

        //初始化空心牌数量
        this.$Preflop_title_childs.children.forEach((item, index) => {
            item.active = index < GameCache.Instance.CurGame.HandCards;
        })

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
                own: this
            });
            this.cc_Label$page.string = "0/0";
            return;
        }

        this.registerHandler();

        this.SliderPlus$slider.show({
            min_value: 1,
            max_value: this.totalPage,
            step: 1,
            change: this.sliderChange,
            own: this
        });
        this.SliderPlus$slider.value = this.totalPage;

        //this.RefreshData(this.totalPage);

    }
    click_left() {
        if (this.currentPage - 1 > 0) {
            // this.RefreshData(this.currentPage - 1);
            // this.refreshPageLabel();
            this.SliderPlus$slider.value = this.currentPage - 1;
        }
    }
    click_right() {
        if (this.currentPage + 1 <= this.totalPage) {
            // this.RefreshData(this.currentPage + 1);
            // this.refreshPageLabel();
            this.SliderPlus$slider.value = this.currentPage + 1;
        }
    }

    /*
     * 滑动条改变触发
     */
    sliderChange(value: number) {

        if (this.currentPage == value) return;

        this.RefreshData(value);

        this.refreshPageLabel();

    }

    refreshPageLabel() {
        this.cc_Label$page.string = `${this.currentPage}/${this.totalPage}`;
    }


    click_bg() {
        UIComponent.close(this.UIDefine);
    }

    private registerHandler() {
        GC.notify.register(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);//自己坐下

    }
    private removeHandler() {
        GC.notify.remove(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);//自己坐下
    }

    Protocol_Holdem_PublicReplay_Handler(response) {

        if (response?.data == "" || response?.data == null) {
            //没有数据
            return;
        }
        let data = PublicHelper.Base64ToJsonString(response.data);
        this.HandleHistoryReplay(JSON.parse(data));
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
    SendClientMessagePublicReplay(handNum) {

        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_PublicReplay,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                handNum: handNum,
                uniqueId: GameCache.Instance.CurGame.cacheUniqueId,
            },
        }
        );
    }

    // 初始化顶部房间信息
    private InitRoomInfo() {


        this.setChildLabel(this.$Top, "room_name_label", GameCache.Instance.roomName);

        if (this.historyInfoData.bgroupBet > 0) {

            this.setChildLabel(this.$Top, "room_bb_label", `${this.historyInfoData.Blindstr}(${StringHelper.GetLongString(this.historyInfoData.bgroupBet)})`);

        }
        else {
            this.setChildLabel(this.$Top, "room_bb_label", this.historyInfoData.Blindstr);
        }

        this.setChildLabel(this.$Top, "player_count_label", "0");

        this.setChildLabel(this.$Top, "room_id_label", `${GameCache.Instance.room_id}-0`);

        this.$content.active = false;

    }

    /**
     * @methos 初始化UI
     */
    private InitUI() {

    }

    protected async HandleHistoryReplay(ResponseData: typeof WebRoomCenterHistoryReplay.Data) {

        this.PublicCards = [0, 0, 0, 0, 0];
        this.HaveSecondCard = false;
        //显示滚动容器
        this.$content.active = true;

        this.RefreshTopHandAndPlayerNumInfo(ResponseData.s.table.pl.length.toString());
        //缓存公共牌
        if (ResponseData.s.procedure.flop.card != null) {
            // for (let i = 0; i < ResponseData.s.procedure.flop.card.length; i++) {
            //     this.PublicCards[i] = ResponseData.s.procedure.flop.card[i];
            // }
            this.PublicCards = ResponseData.s.procedure.flop.card;
        }
        if (ResponseData.s.procedure.turn.card?.length > 0) {
            this.PublicCards[3] = ResponseData.s.procedure.turn.card[0];
        }
        if (ResponseData.s.procedure.river.card?.length > 0) {
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
            }
            else {
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
        })
        //Showdown 显示和score相同
        //Cards = cc.find("Title/Cards", this.$Showdown);
        this.$Showdown_PublicCards.children.forEach((item, index) => {
            item.active = this.PublicCards[index] > 0;
            item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
        })
        //显示第二套公共牌
        if (this.HaveSecondCard) {
            this.$Showdown2_PublicCards.children.forEach((item, index) => {
                item.active = this.SecondPublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.SecondPublicCards[index]), AssetFold.texture_SmallCard0);
            })

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

        let tableSeatIds = [];//本手参与玩家座位号

        let banerSeatId = ResponseData.s.table.btn;//庄位

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
            }
            else {
                player.isMine = false;
            }
            this.playerInfos.push(player);
        }

        // if (IsDisposed) {
        //     return;
        // }
        let mInsurancePool = 0;//保险池
        let mPool = 0;//各底池
        for (let i = 0; i < ResponseData.s.result.length; i++) {
            mInsurancePool -= ResponseData.s.result[i].ins;
            let seatID = ResponseData.s.result[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            if (playerInfo.playerId != GameCache.Instance.nUserId) {
                playerInfo.handCards = ResponseData.s.result[i].card;
            }
            playerInfo.maxCardType = ResponseData.s.result[i].card_type;
            playerInfo.winAnte = ResponseData.s.result[i].win;
            playerInfo.insuranceGain = ResponseData.s.result[i].ins;
            playerInfo.maxCardIndex = ResponseData.s.result[i].maxcard_idx;

        }


        this.$Score.active = ResponseData.s.result.length > 0;

        this.setChildLabel(this.$Score, "Title/player/num", `${ResponseData.s.result.length}`);

        // #region Ante
        if (ResponseData.s.procedure.ante != null) {
            for (let i = 0; i < ResponseData.s.procedure.ante.pl.length; i++) {
                let seatID = ResponseData.s.procedure.ante.pl[i].sn;
                let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
                if (playerInfo == null) {
                    cc.log("playerInfo is null");
                    continue;
                }
                //PlayerActionDataInfo player = new PlayerActionDataInfo();
                playerInfo.handBet += ResponseData.s.procedure.ante.pl[i].act_amt;//统计本手下注筹码
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
                cc.log("playerInfo is null");
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;

            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.preflop.pl[i].sn);
            player.actList = this.getActionNumByName(ResponseData.s.procedure.preflop.pl[i].act);

            if (ResponseData.s.procedure.preflop.pl[i].act == "bet" || ResponseData.s.procedure.preflop.pl[i].act == "raise") {
                times++;
                player.raiseTimes = times;
            }
            player.actChipList = ResponseData.s.procedure.preflop.pl[i].act_amt;
            player.playerId = playerInfo.playerId;
            playerInfo.handBet += ResponseData.s.procedure.preflop.pl[i].act_amt;//统计本手下注筹码

            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
            }
            else {
                player.isMine = false;
            }
            if (ResponseData.s.procedure.preflop.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.preflop.pl[i].pot_out;
            }

            player.leftChips = ResponseData.s.procedure.preflop.pl[i].c;
            this.playerInfosPreFlop.push(player);
        }
        if (ResponseData.s.procedure.preflop.pl == null || ResponseData.s.procedure.preflop.pl.length <= 0) {
            this.setChildLabel(this.$Preflop, "Title/coin/num", StringHelper.GetLongString(mPool));
        }
        // #endregion

        // #region Flop
        // //Flop
        this.$Flop.active = ResponseData.s.procedure.flop.pl.length > 0;
        this.setChildLabel(this.$Flop, "Title/player/num", `${ResponseData.s.procedure.flop.pl.length}`);
        if (ResponseData.s.procedure.flop.pl.length > 0) {
            this.$Flop_Cards.children.forEach((item, index) => {
                item.active = this.PublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            })
        }

        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.flop.pl.length; i++) {
            let seatID = ResponseData.s.procedure.flop.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log("playerInfo is null");
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            if (ResponseData.s.procedure.flop.pl[i].act == "bet" || ResponseData.s.procedure.flop.pl[i].act == "raise") {
                times++;
                player.raiseTimes = times;
            }
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.flop.pl[i].sn);

            player.actList = this.getActionNumByName(ResponseData.s.procedure.flop.pl[i].act);
            player.actChipList = ResponseData.s.procedure.flop.pl[i].act_amt;
            playerInfo.handBet += ResponseData.s.procedure.flop.pl[i].act_amt;//统计本手下注筹码

            player.leftChips = ResponseData.s.procedure.flop.pl[i].c;
            player.playerId = playerInfo.playerId;
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;
            }
            else {
                player.isMine = false;
            }
            if (ResponseData.s.procedure.flop.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.flop.pl[i].pot_out;
            }
            this.playerInfosFlop.push(player);

        }
        if (ResponseData.s.procedure.flop.pl != null && ResponseData.s.procedure.flop.pl.length > 0) {
            this.setChildLabel(this.$Flop, "Title/coin/num", StringHelper.GetLongString(mPool));
        }
        // #endregion

        // #region Turn
        // //Turn
        this.$Turn.active = ResponseData.s.procedure.turn.pl.length > 0;
        this.setChildLabel(this.$Turn, "Title/player/num", `${ResponseData.s.procedure.turn.pl.length}`);
        if (ResponseData.s.procedure.turn.pl.length > 0) {
            this.$Turn_Cards.children.forEach((item, index) => {
                item.active = this.PublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            })
        }

        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.turn.pl.length; i++) {
            let seatID = ResponseData.s.procedure.turn.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log("playerInfo is null");
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.turn.pl[i].sn);

            player.actList = this.getActionNumByName(ResponseData.s.procedure.turn.pl[i].act);
            player.actChipList = ResponseData.s.procedure.turn.pl[i].act_amt;
            playerInfo.handBet += ResponseData.s.procedure.turn.pl[i].act_amt;//统计本手下注筹码

            player.playerId = playerInfo.playerId;
            if (ResponseData.s.procedure.turn.pl[i].act == "bet" || ResponseData.s.procedure.turn.pl[i].act == "raise") {
                times++;
                player.raiseTimes = times;

            }
            if (player.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;

            }
            else {
                player.isMine = false;
            }
            player.leftChips = ResponseData.s.procedure.turn.pl[i].c;
            if (ResponseData.s.procedure.turn.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.turn.pl[i].pot_out;
            }
            this.playerInfosTurn.push(player);

        }
        if (ResponseData.s.procedure.turn.pl != null && ResponseData.s.procedure.turn.pl.length > 0) {
            this.setChildLabel(this.$Turn, "Title/coin/num", StringHelper.GetLongString(mPool));
        }
        // #endregion

        // #region River
        // //River
        this.$River.active = ResponseData.s.procedure.river.pl.length > 0;
        this.setChildLabel(this.$River, "Title/player/num", `${ResponseData.s.procedure.river.pl.length}`);

        if (ResponseData.s.procedure.river.pl.length > 0) {
            this.$River_Cards.children.forEach((item, index) => {
                item.active = this.PublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            })
        }

        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.river.pl.length; i++) {
            let seatID = ResponseData.s.procedure.river.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                cc.log("playerInfo is null");
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.procedure.river.pl[i].sn);
            player.actList = this.getActionNumByName(ResponseData.s.procedure.river.pl[i].act);
            player.actChipList = ResponseData.s.procedure.river.pl[i].act_amt;
            playerInfo.handBet += ResponseData.s.procedure.river.pl[i].act_amt;//统计本手下注筹码

            player.leftChips = ResponseData.s.procedure.river.pl[i].c;
            player.playerId = playerInfo.playerId;
            if (ResponseData.s.procedure.river.pl[i].act == "bet" || ResponseData.s.procedure.river.pl[i].act == "raise") {
                times++;
                player.raiseTimes = times;

            }
            if (playerInfo.playerId == GameCache.Instance.nUserId) {
                player.isMine = true;

            }
            else {
                player.isMine = false;
            }
            if (ResponseData.s.procedure.river.pl[i].pot_out > 0) {
                mPool = ResponseData.s.procedure.river.pl[i].pot_out;
            }
            this.playerInfosRiver.push(player);

        }
        if (ResponseData.s.procedure.river.pl != null && ResponseData.s.procedure.river.pl.length > 0) {
            this.setChildLabel(this.$River, "Title/coin/num", StringHelper.GetLongString(mPool));
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

        this.setChildLabel(this.$Showdown, "Title/player/num", `${ResponseData.s.result.length}`);
        //赢牌底池
        this.setChildLabel(this.$Showdown, "Title/coin/num", StringHelper.GetLongString(mPool));

        this.setChildLabel(this.$Score, "Title/coin/num", StringHelper.GetLongString(mPool));


        //ShowdownInfoList2.gameObject.SetActive(ResponseData.s.result.Count > 0 && HaveSecondCard);
        //ShowdownNum2.gameObject.SetActive(ResponseData.s.result.Count > 0 && HaveSecondCard);

        // //本手结束时底池
        if (this.HaveSecondCard) {
            //赢牌底池
            this.setChildLabel(this.$Showdown, "Title/coin/num", StringHelper.GetLongString(mPool / 2));

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
            }
            else {
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
                        fee1 = win1 * fee / (win1 + win2);
                        fee2 = fee - fee1;
                    }
                }
                else {
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

        //刷新手牌位置
        let offsetx_x = this.cards_position[GameCache.Instance.CurGame.HandCards];
        //赋值玩家数据

        this.clearChilds(this.$Score_Childs, this.Score_Child_Pool);
        this.clearChilds(this.$Preflop_Childs, this.Preflop_Child_Pool);
        this.clearChilds(this.$Flop_Childs, this.Flop_Child_Pool);
        this.clearChilds(this.$Turn_Childs, this.Turn_Child_Pool);
        this.clearChilds(this.$River_Childs, this.River_Child_Pool);
        this.clearChilds(this.$Showdown_Childs, this.Score_Child_Pool);


        for (let i = 0; i < this.playerInfos.length; i++) {
            let pool = this.HaveSecondCard ? this.Score_Second_Child_Pool : this.Score_Child_Pool;
            let go = this.GetCreatePrefab(pool, this.$Score_Childs);
            this.AllPlayerCardsInfos.push(go);
            go.active = true;
            if (this.HaveSecondCard) {
                this.SetPlayerSecondCardItem(go, this.playerInfos[i]);
            }
            else {
                this.SetPlayerCardItem(go, this.playerInfos[i]);
            }
            go.getChildByName("cards_position").x = offsetx_x;
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
            this.SetPlayerCardItem(go, this.playerInfosWinner[i], this.HaveSecondCard);
            this.m_winUserId = this.playerInfosWinner[i].playerId;
        }
        //结果的第二套牌
        if (this.HaveSecondCard) {
            for (let i = 0; i < this.playerInfosWinner.length; i++) {
                // 	GameObject go = GetCreatePrefab(AllPlayerPaiPuInfoObj.gameObject, ShowdownNum2);
                // AllPlayerCardsInfoswinner.Add(go);
                // go.SetActive(true);
                // SetPlayerCardItem(go, playerInfosWinner[i], HaveSecondCard, 1);
                // m_winUserId = playerInfosWinner[i].playerId;
                // ContentHeight += 180;

                // let go = this.GetCreatePrefab(this.Score_Child_Pool, this.$Showdown_Cards);
                // this.AllPlayerCardsInfosRiver.push(go);
                // go.active = true;
                // this.SetPlayerCardItem(go, this.playerInfosWinner[i], this.HaveSecondCard);
                // this.m_winUserId = this.playerInfosWinner[i].playerId;
            }
        }
        // if (this.historyInfoData.bInsurance) {
        //     ContentHeight += 200;
        // }
        // //保险

        this.setChildVisible(this.$Score, "Shows/insurance", mInsurancePool != 0);
        this.setChildLabel(this.$Score, "Shows/insurance/value", StringHelper.GetSignedLongString(mInsurancePool));

        this.setChildVisible(this.$Showdown, "Shows/insurance", mInsurancePool != 0);
        this.setChildLabel(this.$Showdown, "Shows/insurance/value", StringHelper.GetSignedLongString(mInsurancePool));

    }


    setBtnState() {
        this.buttonFirstPage.interactable = false;
        this.buttonLastPage.interactable = false;
        this.buttonPrePage.interactable = false;
        this.buttonNextPage.interactable = false;
    }
    onClickFirstPage(event) {
        if (this.buttonFirstPage.interactable == false)
            return;
        this.currentPage = 1;
        this.RefreshData(this.currentPage);
    }
    onClickPrePage(event) {
        if (this.buttonPrePage.interactable == false)
            return;
        this.currentPage--;
        this.RefreshData(this.currentPage);
    }
    onClickNextPage(event) {
        if (this.buttonNextPage.interactable == false)
            return;
        this.currentPage++;
        this.RefreshData(this.currentPage);
    }
    onClickLastPage(event) {
        if (this.buttonLastPage.interactable == false)
            return;
        this.currentPage = this.totalPage;
        this.RefreshData(this.currentPage);
    }


    resetData() {
        for (let index = 0; index < this.AllPlayerCardsInfos.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfos[index];
            element.destroy();
        }
        this.AllPlayerCardsInfos = []
        for (let index = 0; index < this.AllPlayerCardsInfosPreFlop.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosPreFlop[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosPreFlop = []
        for (let index = 0; index < this.AllPlayerCardsInfosFlop.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosFlop[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosFlop = []
        for (let index = 0; index < this.AllPlayerCardsInfosTurn.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosTurn[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosTurn = []
        for (let index = 0; index < this.AllPlayerCardsInfosRiver.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosRiver[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosRiver = []
        for (let index = 0; index < this.AllPlayerCardsInfosWinner.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfosWinner[index];
            element.destroy();
        }
        this.AllPlayerCardsInfosWinner = []

        this.playerInfos = []
        this.playerInfosPreFlop = []
        this.playerInfosFlop = []
        this.playerInfosTurn = []
        this.playerInfosRiver = []
        this.playerInfosWinner = []
    }



    shouCangBtn() {

    }
    /// <summary>
    /// 设置无牌预制体
    /// </summary>
    SetPlayerItem(go, element, isoutchip = false) {
        //go.getChildByName("Text_name").getComponent(cc.Label).string = StringHelper.LengthNick(element.nickNameStr);

        this.setChildLabel(go, "player_nick", element.nickNameStr);

        if (isoutchip) {
            this.setChildLabel(go, "win", StringHelper.GetDecimalN(element.leftChips / 100));
        }
        else {
            this.setChildLabel(go, "win", "P:" + StringHelper.GetDecimalN(element.leftChips / 100));
        }
        if (element.isMine) {
            // cc.find('PositionImageBg/PositionText', go).color = cc.color(225, 181, 141, 255);
            // go.getChildByName("Text_name").color = cc.color(225, 181, 141, 255);
            // cc.find('PositionImageChipBg/Text', go).color = cc.color(225, 181, 141, 255);
            // go.getChildByName("Text_wins").color = cc.color(225, 181, 141, 255);
        }
        else {
            // cc.find('PositionImageBg/PositionText', go).color = cc.color(255, 255, 255, 255);
            // go.getChildByName("Text_name").color = cc.color(255, 255, 255, 255);
            // cc.find('PositionImageChipBg/Text', go).color = cc.color(255, 255, 255, 255);
            // go.getChildByName("Text_wins").color = cc.color(255, 255, 255, 255);
        }

        this.setChildLabel(go, "SB/label", this.PlayerPositionStr[element.playerPosition]);


        if (element.actList == 6 || element.actList == 7) {
            if (element.raiseTimes == 1) {
                this.setChildLabel(go, "CC/action", this.PlayerActionStr[element.actList]);
            }
            else if (element.raiseTimes == 2) {

                this.setChildLabel(go, "CC/action", this.PlayerActionStr[7]);
            }
            else {
                this.setChildLabel(go, "CC/action", element.raiseTimes + "B");
            }
        }
        else {
            this.setChildLabel(go, "CC/action", this.PlayerActionStr[element.actList]);
        }
        //
        this.setChildLabel(go, "CC/chip", StringHelper.GetLongString(element.actChipList));//下注数


        if (element.actList > 0 && element.actList < 5) {
            this.setChildColor(go, "CC/BG", this.color_green);//绿
            this.setChildOpacity(go, "CC/BG", 255);
        }
        else if (element.actList > 4 && element.actList < 10) {
            this.setChildColor(go, "CC/BG", this.color_red);//红
            this.setChildOpacity(go, "CC/BG", 255);
        }
        else if (element.actList == 11)//黄，新加保险，暂时
        {
            this.setChildColor(go, "CC/BG", this.color_yellow);//黄
            this.setChildOpacity(go, "CC/BG", 255);
        }
        else {
            this.setChildColor(go, "CC/BG", this.color_gray);//灰
            this.setChildOpacity(go, "CC/BG", 198);
        }

        if (element.actList == 9) {
            this.setChildColor(go, "win", cc.color(198, 198, 198));
            this.setChildOpacity(go, "win", 160);
        } else {
            this.setChildColor(go, "win", TextColor.Color1);
            this.setChildOpacity(go, "win", 255);
        }
    }
    tryParse(x: string) {
        let y = x.indexOf(".") + 1;//获取小数点的位置
        let length = x.length - y;//获取小数点后的个数
        if (y > 0) {
            return x.substring(0, y + 1)

        } else {
            return x
        }
    }
    GetShowCardType(cardType) {
        return CardTypeUtil.GetCardTypeEnglishName(cardType);
    }


    SetPlayerCardItem(go, element, isSecond = false, SpcsIndex = 0) {
        //玩家名字
        this.setChildLabel(go, "cards_position/nick/label", StringHelper.LengthNick(element.userName));


        //输赢筹码f
        let str = StringHelper.GetLongString(element.winAnte);
        if (isSecond) {
            str = StringHelper.GetLongString(element.winAnte2[SpcsIndex]);
        }
        this.setChildLabel(go, "win", str);

        //保险
        if (element.insuranceGain != 0) {

            this.setChildLabel(go, "score", StringHelper.GetSignedLongString(element.insuranceGain));
        }
        else {
            this.setChildLabel(go, "score", "");
        }

        //判断是否是自己
        if (element.isMine) {
            //go.transform.Find("PositionImageBg/PositionText").GetComponent<Text>().color = meColor;
        }
        else {
            //go.transform.Find("PositionImageBg/PositionText").GetComponent<Text>().color = otherColor;
        }
        //位置
        this.setChildLabel(go, "SB/label", this.PlayerPositionStr[element.playerPosition]);

        //牌型
        if (isSecond && SpcsIndex != 0) {
            this.setChildLabel(go, "pai_type", this.GetShowCardType(element.maxCardType2));
        }
        else {
            this.setChildLabel(go, "pai_type", this.GetShowCardType(element.maxCardType));
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


        let hand_cards: cc.Node = cc.find("cards_position/hand_cards", go);
        let public_cards = cc.find("cards_position/public_cards", go);

        //手牌显示

        if (element.handCards.length <= 0) {
            hand_cards.children.forEach((item, index) => {
                item.active = index < GameCache.Instance.CurGame.HandCards;
                item.active && (item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(0), AssetFold.texture_SmallCard0));
            })
        } else {
            hand_cards.children.forEach((item, index) => {
                item.active = index < GameCache.Instance.CurGame.HandCards;
                let card = element.handCards[index] || 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(card), AssetFold.texture_SmallCard0);
            })
        }

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
        }
        else {
            //第一套公共牌显示
            public_cards.children.forEach((item, index) => {
                item.active = this.PublicCards[index] > 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[index]), AssetFold.texture_SmallCard0);
            })
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
        }
        else {
            //高亮牌显示
            if (element.maxCardIndex != null && element.maxCardIndex.length > 0) {
                //手牌置灰
                hand_cards.children.forEach(item => {
                    item.color = cc.color(127, 127, 127);
                })
                //公共牌置灰
                public_cards.children.forEach(item => {
                    item.color = cc.color(127, 127, 127);
                })

                for (let i = 0; i < element.maxCardIndex.length; i++) {
                    if (element.maxCardIndex[i] >= 5) {
                        hand_cards.children[element.maxCardIndex[i] - 5].color = cc.color(255, 255, 255);
                    }
                    else {
                        public_cards.children[element.maxCardIndex[i]].color = cc.color(255, 255, 255);
                    }

                }
            }
        }
    }
    SetPlayerSecondCardItem(go, element) {

        //玩家名字
        this.setChildLabel(go, "cards_position/nick/label", StringHelper.LengthNick(element.userName));

        //输赢筹码
        let str;
        str = element.winAnte2[0] / 100;


        this.setChildLabel(go, "win1", StringHelper.GetDecimalN(element.winAnte2[0] / 100));
        this.setChildLabel(go, "win2", StringHelper.GetDecimalN(element.winAnte2[1] / 100));


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
        }
        else {
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

        this.setChildLabel(go, "SB/label", this.PlayerPositionStr[element.playerPosition]);


        //#region  牌

        let hand_cards: cc.Node = cc.find("cards_position/hand_cards", go);
        let public_cards1 = cc.find("cards_position/public_cards/cards1", go);
        let public_cards2 = cc.find("cards_position/public_cards/cards2", go);

        //手牌显示
        if (element.handCards.length <= 0) {
            hand_cards.children.forEach((item, index) => {
                item.active = index < GameCache.Instance.CurGame.HandCards;
                item.active && (item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(0), AssetFold.texture_SmallCard0));
            })
        } else {
            hand_cards.children.forEach((item, index) => {
                item.active = index < GameCache.Instance.CurGame.HandCards;
                let card = element.handCards[index] || 0;
                item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(card), AssetFold.texture_SmallCard0);
            })
        }

        //公共牌显示
        for (let i = 0; i < 5; i++) {
            let publicCard1 = public_cards1.children[i];
            let publicCard2 = public_cards2.children[i];
            if (this.PublicCards[i] == 0) {
                //没发完的公共牌不显示
                publicCard1.active = false;
                publicCard2.active = false;
            }
            else {
                publicCard1.active = true;
                publicCard1.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0);
                publicCard2.active = true;
                publicCard2.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.SecondPublicCards[i]), AssetFold.texture_SmallCard0);

            }
        }
        //高亮牌显示
        if (element.maxCardIndex2 != null && element.maxCardIndex2.Count > 0) {
            //手牌置灰
            hand_cards.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            })
            //公共牌置灰
            public_cards2.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            })

            for (let i = 0; i < element.maxCardIndex2.length; i++) {
                if (element.maxCardIndex2[i] >= 5) {
                    hand_cards.children[element.maxCardIndex2[i] - 5].color = cc.color(255, 255, 255);;
                }
                else {

                    public_cards2.children[element.maxCardIndex2[i]].color = cc.color(255, 255, 255);;
                }
            }
        }

        //高亮牌显示
        if (element.maxCardIndex != null && element.maxCardIndex.Count > 0) {
            //手牌置灰
            hand_cards.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            })
            //公共牌置灰
            public_cards1.children.forEach(item => {
                item.color = cc.color(127, 127, 127);
            })
            for (let i = 0; i < element.maxCardIndex.length; i++) {
                if (element.maxCardIndex[i] >= 5) {
                    hand_cards.children[element.maxCardIndex[i] - 5].color = cc.color(255, 255, 255);;
                }
                else {
                    public_cards1.children[element.maxCardIndex[i]].color = cc.color(255, 255, 255);;
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
            case "small blind":
                action = 1;
                break;
            case "big blind":
                action = 2;
                break;
            case "call":
                action = 3;
                break;
            case "check":
                action = 4;
                break;
            case "straddle":
                action = 5;
                break;
            case "bet":
                action = 6;
                break;
            case "raise":
                action = 7;
                break;
            case "all in":
                action = 9;
                break;
            case "fold":
                action = 10;
                break;
            case "insure":
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

        let tmpSeatIds = []
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

        this.setChildLabel(this.$Top, "player_count_label", playerNum);

        this.setChildLabel(this.$Top, "room_id_label", `${GameCache.Instance.room_id}-${this.currentPage}`);

    }

    // imageMaskCloseClick() {
    //     UIComponent.close(this.UIDefine);
    // }

    get moni_data() {
        return { "status": 0, "data": "eyJkIjpbNTUsNTldLCJzIjp7InJlc3VsdCI6W3sic24iOjEsIndpbiI6LTIwLCJpbnMiOjAsImZlZSI6MCwiYWN0aXZlIjpmYWxzZSwibWF4Y2FyZF9pZHgiOlswLDIsMyw0LDZdLCJjYXJkX3R5cGUiOjIsImNhcmQiOls0LDE0XX0seyJzbiI6Miwid2luIjoyMCwiaW5zIjowLCJmZWUiOjAsImFjdGl2ZSI6ZmFsc2UsIm1heGNhcmRfaWR4IjpbMCwyLDQsNSw2XSwiY2FyZF90eXBlIjoyLCJjYXJkIjpbNTUsNTldfV0sImV0aW1lIjoxNjg0MDg0NTY4LCJzdHJhZGRsZSI6ZmFsc2UsInN0aW1lIjoxNjg0MDg0NTM5LCJoYW5kIjoxLCJ0YWJsZSI6eyJhbnRlIjowLCJwbCI6W3sic24iOjEsImMiOjIwMCwiYXZhdGFyIjoiaHR0cHM6Ly9zdGF0aWMuYXdhbnB0ZXN0LmNvbS9hd2FucHRlc3RpbmctaW50bC10ZXN0L2ltYWdlLWF2YXRhci85NjYxNTcwNi1qQ2Rkei5wbmciLCJuYW1lIjoi5LiJ5Liq5qC45qGDIiwidWlkIjo5NjYxNTcwNn0seyJzbiI6MiwiYyI6MjAwLCJhdmF0YXIiOiJodHRwczovL3N0YXRpYy5hd2FucHRlc3QuY29tL2F3YW5wdGVzdGluZy1pbnRsLXRlc3QvaW1hZ2Utbm9ybWFsLzIwMjIwMzEwMDk0NzIxLXpkQXJ0LnBuZyIsIm5hbWUiOiJQbGF5ZXI0IiwidWlkIjo5NTAxNTcwNn1dLCJzYiI6eyJzbiI6MSwiYmV0IjoxMH0sImJiIjp7InNuIjoyLCJiZXQiOjIwfSwic3RyYWRkbGUiOm51bGwsImJ0biI6MSwic2VhdGNvdW50IjoyfSwibmFtZSI6Inl5eS05MiIsInJpZCI6OTg2OTcwNjYsIm1pZCI6MCwidW5pcXVlIjoiMTY4NDA4NDM0NSIsInByb2NlZHVyZSI6eyJwcmVmbG9wIjp7InBsIjpbeyJjIjoxOTAsInBvdF9vdXQiOjEwLCJzbiI6MSwiYWN0Ijoic21hbGwgYmxpbmQiLCJhY3RfYW10IjoxMH0seyJjIjoxODAsInBvdF9vdXQiOjMwLCJzbiI6MiwiYWN0IjoiYmlnIGJsaW5kIiwiYWN0X2FtdCI6MjB9LHsiYyI6MTgwLCJwb3Rfb3V0Ijo0MCwic24iOjEsImFjdCI6ImNhbGwiLCJhY3RfYW10IjoxMH0seyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MiwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfV19LCJmbG9wIjp7InBsIjpbeyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MiwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfSx7ImMiOjE4MCwicG90X291dCI6NDAsInNuIjoxLCJhY3QiOiJjaGVjayIsImFjdF9hbXQiOjB9XSwiY2FyZCI6WzQyLDYsMjhdfSwidHVybiI6eyJwbCI6W3siYyI6MTgwLCJwb3Rfb3V0Ijo0MCwic24iOjIsImFjdCI6ImNoZWNrIiwiYWN0X2FtdCI6MH0seyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MSwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfV0sImNhcmQiOlsyMl19LCJyaXZlciI6eyJwbCI6W3siYyI6MTgwLCJwb3Rfb3V0Ijo0MCwic24iOjIsImFjdCI6ImNoZWNrIiwiYWN0X2FtdCI6MH0seyJjIjoxODAsInBvdF9vdXQiOjQwLCJzbiI6MSwiYWN0IjoiY2hlY2siLCJhY3RfYW10IjowfV0sImNhcmQiOls0M119fX0sInUiOjk1MDE1NzA2fQ==" }
    }

    //清理child节点
    clearChilds(childs: cc.Node, pool: SimpleNodePool) {
        childs.children.forEach(item => {
            pool.BackNode(item)
        });
        childs.removeAllChildren();
    }

    //关闭处理的内容
    onClose(param?: any): void {
        super.onClose(param);
        this.removeHandler();
    }
}
