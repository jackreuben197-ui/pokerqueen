/*
 * @Author: xfj
 * @Date: 2022-09-06 16:14:44
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-20 10:54:44
 * @FilePath: /pokerqueen/assets/script/game/UITexasHistoryComponent.ts
 */
import GC from '../frame/GameControl';
import { StringHelper } from '../helper/StringHelper';
import ProtocolAgency from '../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../net/websocket/ProtocolCode';
import AssetContext, { AssetFold } from '../ui/component/AssetContext';
import UIComponent from '../ui/UIComponent';
import UIBase from '../ui/UIBase';
import { CardTypeUtil } from './CardTypeUtil';
import { GameCache } from './GameCache';
import GameUtil from './util/GameUtil';

export class HistoryInfoData {
    public bInsurance: boolean;
    public bJackPot: boolean;
    public Blindstr: string;
    public bgroupBet: number;
    public handNum: number;
    public roomId: number;
    public match_id: number;
    public room_unique_id: string;
    // public ReferenceCollector rcPokerSprite;
}

export class PlayerInfo {
    public playerId; //uid 随机ID
    public userName; //名字
    public headPic; //头像
    public seatID; //座位号
    public initChip; //初始筹码
    public maxCardIndex; //最大牌型数组下标
    public maxCardType; //最大牌型
    public winAnte; //输赢筹码
    public insuranceGain; //保险
    public handCards; //手牌
    public isMine; //是否是自己
    public playerPosition;
    public handBet;
    public maxCardType2; //最大牌型
    public maxCardIndex2; //最大牌型数组下标
    public winAnte2; //第二套公共牌输赢筹码
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
export default class UITexasHistoryComponent extends UIBase {
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
    playerInfos: Array<PlayerInfo> = [];
    playerInfosPreFlop: Array<PlayerActionDataInfo> = [];
    playerInfosFlop: Array<PlayerActionDataInfo> = [];
    playerInfosTurn: Array<PlayerActionDataInfo> = [];
    playerInfosRiver: Array<PlayerActionDataInfo> = [];
    playerInfosWinner: Array<PlayerInfo> = [];
    tableSeatIds: Array<number> = [];
    AllPlayerCardsInfos = [];
    AllPlayerCardsInfosPreFlop = [];
    AllPlayerCardsInfosFlop = [];
    AllPlayerCardsInfosTurn = [];
    AllPlayerCardsInfosRiver = [];
    AllPlayerCardsInfoswinner = [];
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

    protected lateLoad(): void {
        super.lateLoad();
        this.playerInfos = [];
        this.playerInfosPreFlop = [];
        this.playerInfosFlop = [];
        this.playerInfosTurn = [];
        this.playerInfosRiver = [];
        this.playerInfosWinner = [];
        // this.registerHandler();
        let Image_MenuMask: any = this.getChildNodeOrComponent('Image_MenuMask');
        Image_MenuMask.on('click', this.imageMaskCloseClick, this);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        GC.notify.register(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);
    }

    // registerHandler() {
    //     CPMessageDispatherComponent.Instance.RegisterHandler(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);//自己坐下
    // }
    // private removeHandler() {
    //     CPMessageDispatherComponent.Instance.RemoveHandler(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);//自己坐下
    // }
    Protocol_Holdem_PublicReplay_Handler(response) {
        // let ResponseData = (response as Protocol_Holdem_PublicReplay)?.response;
        if (response == null || Buffer.from(response.data, 'base64').toString() == '') {
            // Log.Debug("rec.Data is null");
            return;
        }
        let data = Buffer.from(response.data, 'base64').toString();
        data = JSON.parse(data);
        this.handleHistoryReplay(data);
    }

    /**
     * @methos 初始化房间顶部信息
     */
    private InitRoomInfo() {
        this.GameObject = this.getChildNodeOrComponent('GameObject');
        let RoomNameText = this.GameObject.getChildByName('RoomNameText').getComponent(cc.Label);
        let RoomIDText = this.GameObject.getChildByName('RoomIDText').getComponent(cc.Label);
        let BlindText = this.GameObject.getChildByName('BlindText').getComponent(cc.Label);
        let PlayerNumText = this.GameObject.getChildByName('PlayerNumText').getComponent(cc.Label);
        let Title = this.GameObject.getChildByName('Title');
        this.InfoList = this.getChildNodeOrComponent('InfoList');
        this.PreflopInfoList = this.getChildNodeOrComponent('PreflopInfoList');
        this.Preflop = this.getChildNodeOrComponent('Preflop');
        this.PreflopInfoObj = this.Preflop.getChildByName('player_info');
        this.PreflopInfoObj.active = false;
        this.FlopInfoList = this.getChildNodeOrComponent('FlopInfoList');
        this.TurnNum = this.getChildNodeOrComponent('TurnNum');
        this.TurnInfoList = this.getChildNodeOrComponent('TurnInfoList');
        this.FlopNum = this.getChildNodeOrComponent('FlopNum');
        this.RiverInfoList = this.getChildNodeOrComponent('RiverInfoList');
        this.RiverNum = this.getChildNodeOrComponent('RiverNum');
        this.ShowdownInfoList = this.getChildNodeOrComponent('ShowdownInfoList');
        this.ShowdownNum = this.getChildNodeOrComponent('ShowdownNum');
        this.ShowdownInfoList2 = this.getChildNodeOrComponent('ShowdownInfoList2');
        this.ShowdownNum2 = this.getChildNodeOrComponent('ShowdownNum2');
        this.AllPlayerPaiPu = this.getChildNodeOrComponent('AllPlayerPaiPu');
        RoomNameText.string = GameCache.Instance.roomName;
        this.rcPokerSprite = this.getChildNodeOrComponent('rcPokerSprite');
        this.AllPlayerPaiPuInfoObj = this.AllPlayerPaiPu.getChildByName('player_info');
        this.Image_Insurance = this.getChildNodeOrComponent('Image_Insurance');
        this.AllPlayerSecondInfoObj = this.getChildNodeOrComponent('player_infoSecond');
        if (this.historyInfoData.bgroupBet > 0) {
            BlindText.string = this.historyInfoData.Blindstr + '(' + StringHelper.getStringDiv100(this.historyInfoData.bgroupBet) + ')';
        } else {
            BlindText.string = this.historyInfoData.Blindstr;
        }
        PlayerNumText.string = '0';
        RoomIDText.string = GameCache.Instance.room_id + '-' + 0;
        //按钮
        this.buttonFirstPage = this.getChildNodeOrComponent('Button_FirstPage', cc.Button);
        this.buttonFirstPage.node.on('click', this.onClickFirstPage, this);
        this.buttonLastPage = this.getChildNodeOrComponent('Button_LastPage', cc.Button);
        this.buttonLastPage.node.on('click', this.onClickLastPage, this);
        this.buttonPrePage = this.getChildNodeOrComponent('Button_PrePage', cc.Button);
        this.buttonPrePage.node.on('click', this.onClickPrePage, this);
        this.buttonNextPage = this.getChildNodeOrComponent('Button_NextPage', cc.Button);
        this.buttonNextPage.node.on('click', this.onClickNextPage, this);
        let ScrollBar: cc.Node = this.getChildNodeOrComponent('ScrollBar');
        this.Text_num = ScrollBar.getChildByName('Text_num').getComponent(cc.Label);
        // scrollview_Content.gameObject.SetActive(false);
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

    RefreshPageButton() {
        this.buttonFirstPage.interactable = this.currentPage > 1;
        this.buttonLastPage.interactable = this.currentPage < this.totalPage;
        this.buttonPrePage.interactable = this.currentPage > 1;
        this.buttonNextPage.interactable = this.currentPage < this.totalPage;
        this.Text_num.string = `${this.currentPage}/${this.totalPage}`;
    }

    onShow(param?: any): void {
        super.onShow();
        if (null == param) return;
        this.historyInfoData = param as HistoryInfoData;
        // rcPokerSprite = this.historyInfoData.rcPokerSprite;
        this.currentPage = 0;
        this.InitRoomInfo();
        this.setBtnState();
        this.totalPage = this.historyInfoData.handNum == 0 ? this.historyInfoData.handNum : this.historyInfoData.handNum - 1;
        if (this.totalPage == 0) {
            //第一手没打完不请求
            return;
        }
        this.RefreshData(this.totalPage);
    }

    resetData() {
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
        for (let index = 0; index < this.AllPlayerCardsInfoswinner.length; index++) {
            const element: cc.Node = this.AllPlayerCardsInfoswinner[index];
            element.destroy();
        }
        this.AllPlayerCardsInfoswinner = [];
        this.playerInfos = [];
        this.playerInfosPreFlop = [];
        this.playerInfosFlop = [];
        this.playerInfosTurn = [];
        this.playerInfosRiver = [];
        this.playerInfosWinner = [];
    }

    RefreshData(_currentPage) {
        this.currentPage = _currentPage;
        this.RefreshPageButton();
        this.SendClientMessagePublicReplay(this.currentPage);
    }

    SendClientMessagePublicReplay(handNum) {
        ProtocolAgency.Send({
            Code: ProtocolCode.Protocol_Holdem_PublicReplay,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                handNum: handNum,
                uniqueId: GameCache.Instance.CurGame.cacheUniqueId
            }
        });
    }

    handleHistoryReplay(ResponseData) {
        this.PublicCards = [0, 0, 0, 0, 0];
        this.HaveSecondCard = false;
        this.RefreshTopHandAndPlayerNumInfo(ResponseData.s.table.pl.length.toString());
        //缓存公共牌
        if (ResponseData.s.procedure.flop.card != null) {
            for (let i = 0; i < ResponseData.s.procedure.flop.card.length; i++) {
                this.PublicCards[i] = ResponseData.s.procedure.flop.card[i];
            }
        }
        if (ResponseData.s.procedure.turn.card != null && ResponseData.s.procedure.turn.card.length > 0) {
            this.PublicCards[3] = ResponseData.s.procedure.turn.card[0];
        }
        if (ResponseData.s.procedure.river.card != null && ResponseData.s.procedure.river.card.length > 0) {
            this.PublicCards[4] = ResponseData.s.procedure.river.card[0];
        }
        //判断是否有第二套牌，并赋值
        if (ResponseData.s.procedure.river.scard != null && ResponseData.s.procedure.river.scard.length > 0) {
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
        //显示公共牌
        for (let i = 0; i < 5; i++) {
            let publicCard = this.InfoList.getChildByName('PublicCard').children[i].getComponent(cc.Sprite);
            let publicCardDown = this.ShowdownInfoList.getChildByName('PublicCard' + i).getComponent(cc.Sprite);
            if (this.PublicCards[i] == 0) {
                //没发完的公共牌不显示
                publicCard.node.active = false;
                publicCardDown.node.active = false;
            } else {
                publicCard.node.active = true;
                publicCard.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                publicCardDown.node.active = true;
                publicCardDown.spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(this.PublicCards[i]),
                    AssetFold.texture_SmallCard0
                ) as cc.SpriteFrame;
            }
        }
        if (this.HaveSecondCard) {
            for (let i = 0; i < 5; i++) {
                let publicCardDown = this.ShowdownInfoList2.getChildByName('PublicCard' + i).getComponent(cc.Sprite);
                if (this.SecondPublicCards[i] == 0) {
                    //没发完的公共牌不显示
                    publicCardDown.node.active = false;
                } else {
                    publicCardDown.node.active = true;
                    publicCardDown.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(this.SecondPublicCards[i]),
                        AssetFold.texture_SmallCard0
                    ) as cc.SpriteFrame;
                }
            }
        }
        this.resetData();
        this.tableSeatIds = []; //本手参与玩家座位号
        let banerSeatId = ResponseData.s.table.btn; //庄位
        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            this.tableSeatIds.push(ResponseData.s.table.pl[i].sn);
        }
        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            let player: PlayerInfo = new PlayerInfo();
            player.playerId = ResponseData.s.table.pl[i].uid;
            player.playerPosition = this.getPositionNumByBaner(this.tableSeatIds, banerSeatId, ResponseData.s.table.pl[i].sn);
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
            }
            playerInfo.maxCardType = ResponseData.s.result[i].card_type;
            playerInfo.winAnte = ResponseData.s.result[i].win;
            playerInfo.insuranceGain = ResponseData.s.result[i].ins;
            playerInfo.maxCardIndex = ResponseData.s.result[i].maxcard_idx;
        }
        this.InfoList.active = ResponseData.s.result.length > 0;
        this.AllPlayerPaiPu.active = ResponseData.s.result.length > 0;
        this.InfoList.getChildByName('PlayerNumText').getComponent(cc.Label).string = ResponseData.s.result.length.toString();
        //region Ante
        if (ResponseData.s.procedure.ante != null) {
            for (let i = 0; i < ResponseData.s.procedure.ante.pl.length; i++) {
                let seatID = ResponseData.s.procedure.ante.pl[i].sn;
                let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
                if (playerInfo == null) {
                    console.error('playerInfo is null');
                    continue;
                }
                let player: PlayerActionDataInfo = new PlayerActionDataInfo();
                playerInfo.handBet += ResponseData.s.procedure.ante.pl[i].act_amt; //统计本手下注筹码
                if (ResponseData.s.procedure.ante.pl[i].pot_out > 0) {
                    mPool = ResponseData.s.procedure.ante.pl[i].pot_out;
                }
            }
        }
        //endregion
        //PreFlop
        this.Preflop.active = ResponseData.s.procedure.preflop.pl.length > 0;
        this.PreflopInfoList.active = ResponseData.s.procedure.preflop.pl.length > 0;
        //string[] headStrPreFlops = rec.headStrPreFlop.Split(new string[] { "@%" }, StringSplitOptions.None);
        let times = 0;
        for (let i = 0; i < ResponseData.s.procedure.preflop.pl.length; i++) {
            let seatID = ResponseData.s.procedure.preflop.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                console.error('playerInfo is null');
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(this.tableSeatIds, banerSeatId, ResponseData.s.procedure.preflop.pl[i].sn);
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
            this.PreflopInfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool);
        }
        //Flop
        this.FlopInfoList.active = ResponseData.s.procedure.flop.pl.length > 0;
        this.FlopNum.active = ResponseData.s.procedure.flop.pl.length > 0;
        if (ResponseData.s.procedure.flop.pl.length > 0) {
            for (let i = 0; i < 3; i++) {
                let publicCard = this.FlopInfoList.getChildByName('ImageCard' + i).getComponent(cc.Sprite);
                if (this.PublicCards[i] == 0) {
                    //没发完的公共牌不显示
                    publicCard.node.active = false;
                } else {
                    publicCard.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(this.PublicCards[i]),
                        AssetFold.texture_SmallCard0
                    ) as cc.SpriteFrame;
                    publicCard.node.active = true;
                }
            }
        }
        this.FlopInfoList.getChildByName('PlayerNumText').getComponent(cc.Label).string = ResponseData.s.procedure.flop.pl.length.toString();
        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.flop.pl.length; i++) {
            let seatID = ResponseData.s.procedure.flop.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            if (ResponseData.s.procedure.flop.pl[i].act == 'bet' || ResponseData.s.procedure.flop.pl[i].act == 'raise') {
                times++;
                player.raiseTimes = times;
            }
            player.playerPosition = this.getPositionNumByBaner(this.tableSeatIds, banerSeatId, ResponseData.s.procedure.flop.pl[i].sn);
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
            this.FlopInfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool);
        }
        //Turn
        this.TurnNum.active = ResponseData.s.procedure.turn.pl.length > 0;
        this.TurnInfoList.active = ResponseData.s.procedure.turn.pl.length > 0;
        if (ResponseData.s.procedure.turn.pl.length > 0) {
            for (let i = 0; i < 4; i++) {
                let publicCard = this.TurnInfoList.getChildByName('PublicCard' + i).getComponent(cc.Sprite);
                if (this.PublicCards[i] == 0) {
                    //没发完的公共牌不显示
                    publicCard.node.active = false;
                } else {
                    publicCard.node.active = true;
                    publicCard.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(this.PublicCards[i]),
                        AssetFold.texture_SmallCard0
                    ) as cc.SpriteFrame;
                }
            }
        }
        this.TurnInfoList.getChildByName('PlayerNumText').getComponent(cc.Label).string = ResponseData.s.procedure.turn.pl.length.toString();
        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.turn.pl.length; i++) {
            let seatID = ResponseData.s.procedure.turn.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(this.tableSeatIds, banerSeatId, ResponseData.s.procedure.turn.pl[i].sn);
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
            this.TurnInfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool);
        }
        //River
        this.RiverNum.active = ResponseData.s.procedure.river.pl.length > 0;
        this.RiverInfoList.active = ResponseData.s.procedure.river.pl.length > 0;
        if (ResponseData.s.procedure.river.pl.length > 0) {
            for (let i = 0; i < 5; i++) {
                let publicCard = this.RiverInfoList.getChildByName('PublicCard' + i).getComponent(cc.Sprite);
                if (this.PublicCards[i] == 0) {
                    //没发完的公共牌不显示
                    publicCard.node.active = false;
                } else {
                    publicCard.node.active = true;
                    publicCard.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(this.PublicCards[i]),
                        AssetFold.texture_SmallCard0
                    ) as cc.SpriteFrame;
                }
            }
        }
        this.RiverInfoList.getChildByName('PlayerNumText').getComponent(cc.Label).string = ResponseData.s.procedure.river.pl.length.toString();
        times = 0;
        for (let i = 0; i < ResponseData.s.procedure.river.pl.length; i++) {
            let seatID = ResponseData.s.procedure.river.pl[i].sn;
            let playerInfo: PlayerInfo = this.GetPlayerInfoByPlayerInfoList(this.playerInfos, seatID);
            if (playerInfo == null) {
                continue;
            }
            let player: PlayerActionDataInfo = new PlayerActionDataInfo();
            player.nickNameStr = playerInfo.userName;
            player.headStr = playerInfo.headPic;
            player.playerPosition = this.getPositionNumByBaner(this.tableSeatIds, banerSeatId, ResponseData.s.procedure.river.pl[i].sn);
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
            this.RiverInfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool);
        }
        //Winner
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
        this.ShowdownInfoList.active = ResponseData.s.result.length > 0;
        this.ShowdownNum.active = ResponseData.s.result.length > 0;
        this.ShowdownInfoList.getChildByName('PlayerNumText').getComponent(cc.Label).string = ResponseData.s.result.length.toString();
        //赢牌底池
        this.ShowdownInfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool);
        this.ShowdownInfoList2.active = ResponseData.s.result.length > 0 && this.HaveSecondCard;
        this.ShowdownNum2.active = ResponseData.s.result.length > 0 && this.HaveSecondCard;
        //本手结束时底池
        if (this.HaveSecondCard) {
            //赢牌底池
            this.ShowdownInfoList.getChildByName('ChipNumText').active = true;
            this.ShowdownInfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool / 2);
            this.ShowdownInfoList2.getChildByName('PlayerNumText').getComponent(cc.Label).string = ResponseData.s.result.length.toString();
            this.ShowdownInfoList2.getChildByName('PlayerNumText').active = true;
            //赢牌底池
            this.ShowdownInfoList2.getChildByName('ChipNumText').active = true;
            this.ShowdownInfoList2.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool / 2);
        }
        this.InfoList.getChildByName('ChipNumText').getComponent(cc.Label).string = StringHelper.getStringDiv100(mPool);
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
                let isWin1 = ResponseData.s.result[i].sp_detail[0].is_winner;
                let isWin2 = ResponseData.s.result[i].sp_detail[1].is_winner;
                let win1 = ResponseData.s.result[i].sp_detail[0].win;
                let win2 = ResponseData.s.result[i].sp_detail[1].win;
                let fee = ResponseData.s.result[i].fee;
                let fee1 = 0;
                let fee2 = 0;
                if (isWin1 && isWin2) {
                    if (fee != 0) {
                        fee1 = (win1 * fee) / (win1 + win2);
                        fee2 = fee - fee1;
                    }
                } else {
                    fee1 = isWin1 ? fee : 0;
                    fee2 = isWin2 ? fee : 0;
                }
                let handBet1 = playerInfo.handBet / 2;
                let handBet2 = playerInfo.handBet - handBet1;
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
        // let ContentHeight = 137 + 199 + 109 + 109 + 109 + 109;
        for (let i = 0; i < this.playerInfos.length; i++) {
            let allPlayerObj = this.HaveSecondCard ? this.AllPlayerSecondInfoObj : this.AllPlayerPaiPuInfoObj;
            let _cloneNode = this.GetCreatePrefab(allPlayerObj, this.AllPlayerPaiPu);
            this.AllPlayerCardsInfos.push(_cloneNode);
            _cloneNode.active = true;
            if (this.HaveSecondCard) {
                this.SetPlayerSecondCardItem(_cloneNode, this.playerInfos[i]);
            } else {
                this.SetPlayerCardItem(_cloneNode, this.playerInfos[i]);
            }
            // ContentHeight += 180;
        }
        for (let i = 0; i < this.playerInfosPreFlop.length; i++) {
            let go = this.GetCreatePrefab(this.PreflopInfoObj, this.Preflop);
            this.AllPlayerCardsInfosPreFlop.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosPreFlop[i], true);
            // ContentHeight += 80;
        }
        for (let i = 0; i < this.playerInfosFlop.length; i++) {
            let go = this.GetCreatePrefab(this.PreflopInfoObj, this.FlopNum);
            this.AllPlayerCardsInfosFlop.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosFlop[i]);
            // ContentHeight += 80;
        }
        for (let i = 0; i < this.playerInfosTurn.length; i++) {
            let go = this.GetCreatePrefab(this.PreflopInfoObj, this.TurnNum);
            this.AllPlayerCardsInfosTurn.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosTurn[i]);
            // ContentHeight += 80;
        }
        for (let i = 0; i < this.playerInfosRiver.length; i++) {
            let go = this.GetCreatePrefab(this.PreflopInfoObj, this.RiverNum);
            this.AllPlayerCardsInfosRiver.push(go);
            go.active = true;
            this.SetPlayerItem(go, this.playerInfosRiver[i]);
            // ContentHeight += 80;
        }
        for (let i = 0; i < this.playerInfosWinner.length; i++) {
            let go = this.GetCreatePrefab(this.AllPlayerPaiPuInfoObj, this.ShowdownNum);
            this.AllPlayerCardsInfoswinner.push(go);
            go.active = true;
            this.SetPlayerCardItem(go, this.playerInfosWinner[i], this.HaveSecondCard);
            this.m_winUserId = this.playerInfosWinner[i].playerId;
            // ContentHeight += 180;
        }
        if (this.HaveSecondCard) {
            for (let i = 0; i < this.playerInfosWinner.length; i++) {
                let go = this.GetCreatePrefab(this.AllPlayerPaiPuInfoObj, this.ShowdownNum2);
                this.AllPlayerCardsInfoswinner.push(go);
                go.active = true;
                this.SetPlayerCardItem(go, this.playerInfosWinner[i], this.HaveSecondCard, 1);
                this.m_winUserId = this.playerInfosWinner[i].playerId;
                // ContentHeight += 180;
            }
        }
        if (this.historyInfoData.bInsurance) {
            // ContentHeight += 200;
        }
        //保险
        this.AllPlayerPaiPu.getChildByName('Image_Insurance').active = mInsurancePool != 0;
        // this.AllPlayerPaiPu.getChildByName("Image_Insurance").SetAsLastSibling();
        cc.find('Image_Insurance/Text_insuranceValue', this.AllPlayerPaiPu).getComponent(cc.Label).string = StringHelper.getStringDiv100(mInsurancePool);
        this.ShowdownNum.getChildByName('Image_Insurance').active = mInsurancePool != 0;
        // this.ShowdownNum.getChildByName("Image_Insurance").SetAsLastSibling();
        cc.find('Image_Insurance/Text_insuranceValue', this.AllPlayerPaiPu).getComponent(cc.Label).string = StringHelper.getStringDiv100(mInsurancePool);
        cc.find('Image_Insurance/Text_insuranceValue', this.ShowdownNum).getComponent(cc.Label).string = StringHelper.getStringDiv100(mInsurancePool);
        // if (ContentHeight < 2108) {
        //     ContentHeight = 2108;
        // }
        // scrollview_Content.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, ContentHeight);
        //  #region 收藏牌谱和分享牌谱逻辑
        let DownBar: cc.Node = this.getChildNodeOrComponent('DownBar');
        // DownBar.active = true
        let textShareTip = cc.find('Button_Share/Text_ShareTip', DownBar);
        textShareTip.color = cc.color(233, 191, 128, 255);
        let textCollectTip = cc.find('Button_Collect/Text_ShareTip', DownBar);
        textCollectTip.color = cc.color(233, 191, 128, 255);
    }

    shouCangBtn() {}

    /// <summary>
    /// 设置无牌预制体
    /// </summary>
    SetPlayerItem(go, element, isoutchip = false) {
        go.getChildByName('Text_name').getComponent(cc.Label).string = StringHelper.LengthNick(element.nickNameStr);
        if (isoutchip) {
            let str = (element.leftChips / 100).toString();
            go.getChildByName('Text_wins').getComponent(cc.Label).string = this.tryParse(str);
        } else {
            let str = (element.leftChips / 100).toString();
            go.getChildByName('Text_wins').getComponent(cc.Label).string = 'P:' + this.tryParse(str);
        }
        if (element.isMine) {
            cc.find('PositionImageBg/PositionText', go).color = cc.color(225, 181, 141, 255);
            go.getChildByName('Text_name').color = cc.color(225, 181, 141, 255);
            cc.find('PositionImageChipBg/Text', go).color = cc.color(225, 181, 141, 255);
            go.getChildByName('Text_wins').color = cc.color(225, 181, 141, 255);
        } else {
            cc.find('PositionImageBg/PositionText', go).color = cc.color(255, 255, 255, 255);
            go.getChildByName('Text_name').color = cc.color(255, 255, 255, 255);
            cc.find('PositionImageChipBg/Text', go).color = cc.color(255, 255, 255, 255);
            go.getChildByName('Text_wins').color = cc.color(255, 255, 255, 255);
        }
        cc.find('PositionImageBg/PositionText', go).getComponent(cc.Label).string = this.PlayerPositionStr[element.playerPosition];
        if (element.actList == 6 || element.actList == 7) {
            if (element.raiseTimes == 1) {
                cc.find('PositionImageChipBg/PositionChipText', go).getComponent(cc.Label).string = this.PlayerActionStr[element.actList];
            } else if (element.raiseTimes == 2) {
                cc.find('PositionImageChipBg/PositionChipText', go).getComponent(cc.Label).string = this.PlayerActionStr[7];
            } else {
                cc.find('PositionImageChipBg/PositionChipText', go).getComponent(cc.Label).string = element.raiseTimes + 'B';
            }
        } else {
            cc.find('PositionImageChipBg/PositionChipText', go).getComponent(cc.Label).string = this.PlayerActionStr[element.actList];
        }
        //
        cc.find('PositionImageChipBg/Text', go).getComponent(cc.Label).string = '' + StringHelper.getStringDiv100(element.actChipList); //下注数
        let chipbg = go.getChildByName('PositionImageChipBg');
        if (element.actList > 0 && element.actList < 5) {
            chipbg.color = cc.color(86, 181, 87, 255); //绿
        } else if (element.actList > 4 && element.actList < 10) {
            chipbg.color = cc.color(230, 68, 85, 255); //红
        } else if (element.actList == 11) //黄，新加保险，暂时
        {
            chipbg.color = cc.color(255, 184, 83, 255); //黄
        } else {
            chipbg.color = cc.color(198, 198, 198, 198); //灰
        }
        if (element.actList == 9) {
            go.getChildByName('Text_wins').color = cc.color(198, 198, 198, 160);
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

    SetPlayerCardItem(go, element, isSecond = false, SpcsIndex = 0) {
        go.getChildByName('Text_name').getComponent(cc.Label).string = StringHelper.LengthNick(element.userName); //名字
        //输赢筹码
        let str = StringHelper.getStringDiv100(element.winAnte);
        if (isSecond) {
            str = StringHelper.getStringDiv100(element.winAnte2[SpcsIndex]);
        }
        go.getChildByName('Text_wins').getComponent(cc.Label).string = str;
        //保险
        if (element.insuranceGain != 0) {
            go.getChildByName('Image_InsuranceText').getComponent(cc.Label).string = StringHelper.getStringDiv100(element.insuranceGain);
        } else {
            go.getChildByName('Image_InsuranceText').getComponent(cc.Label).string = '';
        }
        //判断是否是自己
        if (element.isMine) {
            cc.find('PositionImageBg/PositionText', go).color = cc.color(225, 181, 141, 255);
            go.getChildByName('Text_name').color = cc.color(225, 181, 141, 255);
            go.getChildByName('Text_wins').color = cc.color(225, 181, 141, 255);
        } else {
            cc.find('PositionImageBg/PositionText', go).color = cc.color(255, 255, 255, 255);
            go.getChildByName('Text_name').color = cc.color(255, 255, 255, 255);
            go.getChildByName('Text_wins').color = cc.color(255, 255, 255, 255);
        }
        //位置
        cc.find('PositionImageBg/PositionText', go).getComponent(cc.Label).string = this.PlayerPositionStr[element.playerPosition];
        //牌型
        if (isSecond && SpcsIndex != 0) {
            go.getChildByName('FoldText').getComponent(cc.Label).string = this.GetShowCardType(element.maxCardType2);
        } else {
            go.getChildByName('FoldText').getComponent(cc.Label).string = this.GetShowCardType(element.maxCardType);
        }
        // #region  牌
        //手牌
        let handcards = [];
        let Image_handCard = cc.find('Image_handCard', go);
        for (let i = 1; i <= 6; i++) {
            let handCard = Image_handCard.getChildByName('Image_handCard' + i).getComponent(cc.Sprite);
            handCard.node.active = false;
            handcards.push(handCard);
        }
        //手牌显示
        for (let i = 0; i < element.handCards.length; i++) {
            handcards[i].spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(element.handCards[i]), AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            handcards[i].node.active = true;
        }
        if (element.handCards.length <= 0) {
            for (let i = 0; i < GameCache.Instance.CurGame.HandCards; i++) {
                handcards[i].spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(element.handCards[0]),
                    AssetFold.texture_SmallCard0
                ) as cc.SpriteFrame;
                handcards[i].active = true;
            }
        }
        //公共牌
        let publicCards = [];
        let PublicCardpos = cc.find('PublicCardpos', go);
        for (let i = 0; i < 5; i++) {
            let publicCard = PublicCardpos.getChildByName('Image_publicCard' + i).getComponent(cc.Sprite);
            publicCard.node.active = true;
            publicCards.push(publicCard);
        }
        // //公共牌位置
        // GameObject publiccardpos = go.getChildByName("PublicCardpos").gameObject;
        let handCardNum = GameCache.Instance.CurGame.HandCards;
        // switch (handCardNum) {
        //     case 2:
        //         PublicCardpos.position = cc.v3(-78.1, 0, 0);
        //         break;
        //     case 4:
        //         PublicCardpos.position = cc.v3(30, 0, 0);
        //         break;
        //     case 5:
        //         PublicCardpos.position = cc.v3(75, 0, 0);
        //         break;
        //     case 6:
        //         PublicCardpos.position = cc.v3(120, 0, 0);
        //         break;
        //     default:
        //         PublicCardpos.position = cc.v3(-78.1, 0, 0);
        //         break;
        // }
        if (isSecond && SpcsIndex != 0) {
            //公共牌显示
            for (let i = 0; i < 5; i++) {
                let publicCard = PublicCardpos.getChildByName('Image_publicCard' + i).getComponent(cc.Sprite);
                if (this.SecondPublicCards[i] == 0) {
                    //没发完的公共牌不显示
                    publicCard.node.active = false;
                } else {
                    publicCard.node.active = true;
                    publicCard.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(this.SecondPublicCards[i]),
                        AssetFold.texture_SmallCard0
                    ) as cc.SpriteFrame;
                }
            }
        } else {
            //公共牌显示
            for (let i = 0; i < 5; i++) {
                let publicCard = PublicCardpos.getChildByName('Image_publicCard' + i).getComponent(cc.Sprite);
                if (this.PublicCards[i] == 0) {
                    //没发完的公共牌不显示
                    publicCard.node.active = false;
                } else {
                    publicCard.node.active = true;
                    publicCard.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(this.PublicCards[i]),
                        AssetFold.texture_SmallCard0
                    ) as cc.SpriteFrame;
                }
            }
        }
        if (isSecond && SpcsIndex != 0) {
            //高亮牌显示
            if (element.maxCardIndex2 != null && element.maxCardIndex2.length > 0) {
                //手牌置灰
                for (let i = 0; i < handcards.length; i++) {
                    handcards[i].node.color = cc.color(127, 127, 127, 255);
                }
                //公共牌置灰
                for (let i = 0; i < publicCards.length; i++) {
                    publicCards[i].color = cc.color(127, 127, 127, 255);
                }
                for (let i = 0; i < element.maxCardIndex2.length; i++) {
                    if (element.maxCardIndex2[i] >= 5) {
                        handcards[element.maxCardIndex2[i] - 5].node.color = cc.color(255, 255, 255, 255);
                    } else {
                        publicCards[element.maxCardIndex2[i]].node.color = cc.color(255, 255, 255, 255);
                    }
                }
            }
        } else {
            //高亮牌显示
            if (element.maxCardIndex != null && element.maxCardIndex.length > 0) {
                //手牌置灰
                for (let i = 0; i < handcards.length; i++) {
                    handcards[i].node.color = cc.color(127, 127, 127, 255);
                }
                //公共牌置灰
                for (let i = 0; i < publicCards.length; i++) {
                    publicCards[i].node.color = cc.color(127, 127, 127, 255);
                }
                for (let i = 0; i < element.maxCardIndex.length; i++) {
                    if (element.maxCardIndex[i] >= 5) {
                        handcards[element.maxCardIndex[i] - 5].node.color = cc.color(255, 255, 255, 255);
                    } else {
                        publicCards[element.maxCardIndex[i]].node.color = cc.color(255, 255, 255, 255);
                    }
                }
            }
        }
        // #endregion
    }

    SetPlayerSecondCardItem(go, element) {
        go.getChildByName('Text_name').getComponent(cc.Label).string = StringHelper.LengthNick(element.userName); //名字
        //输赢筹码
        let str;
        str = StringHelper.getStringDiv100(element.winAnte2[0]);
        if (go.getChildByName('Text_wins')) {
            go.getChildByName('Text_wins').getComponent(cc.Label).string = this.tryParse(str);
        }
        str = StringHelper.getStringDiv100(element.winAnte);
        str = StringHelper.getStringDiv100(element.winAnte2[1]);
        if (go.getChildByName('Text_secondWins')) {
            go.getChildByName('Text_secondWins').getComponent(cc.Label).string = this.tryParse(str);
        }
        //判断是否是自己
        if (element.isMine) {
            cc.find('PositionImageBg/PositionText', go).color = cc.color(220, 186, 130, 255);
            go.getChildByName('Text_name').getComponent(cc.Label).color = cc.color(220, 186, 130, 255);
            if (go.getChildByName('Text_wins')) {
                go.getChildByName('Text_wins').getComponent(cc.Label).color = cc.color(220, 186, 130, 255);
            }
            if (go.getChildByName('Text_secondWins')) {
                go.getChildByName('Text_secondWins').getComponent(cc.Label).color = cc.color(220, 186, 130, 255);
            }
        } else {
            cc.find('PositionImageBg/PositionText', go).color = cc.color(255, 255, 255, 255);
            go.getChildByName('Text_name').color = cc.color(255, 255, 255, 255);
            if (go.getChildByName('Text_wins')) {
                go.getChildByName('Text_wins').color = cc.color(255, 255, 255, 255);
            }
            if (go.getChildByName('Text_secondWins')) {
                go.getChildByName('Text_secondWins').color = cc.color(255, 255, 255, 255);
            }
        }
        //位置
        cc.find('PositionImageBg/PositionText', go).getComponent(cc.Label).string = this.PlayerPositionStr[element.playerPosition];
        //     #region  牌
        //手牌
        let handcards = [];
        let Image_handCard = cc.find('Image_handCard', go);
        for (let i = 1; i <= 6; i++) {
            let handCard = Image_handCard.getChildByName('Image_handCard' + i).getComponent(cc.Sprite);
            handCard.node.active = true;
            handcards.push(handCard);
        }
        //公共牌
        let publicCards = [];
        let PublicCardpos = cc.find('PublicCardpos', go);
        for (let i = 0; i < 5; i++) {
            let publicCard = PublicCardpos.getChildByName('Image_publicCard' + i).getComponent(cc.Sprite);
            publicCard.node.active = true;
            publicCards.push(publicCard);
        }
        let secondPublicCards = [];
        for (let i = 0; i < 5; i++) {
            let publicCard = PublicCardpos.getChildByName('Image_secondPublicCard' + i).getComponent(cc.Sprite);
            publicCard.node.active = true;
            secondPublicCards.push(publicCard);
        }
        //手牌显示
        for (let i = 0; i < element.handCards.length; i++) {
            handcards[i].spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(element.handCards[i]), AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            handcards[i].node.active = true;
        }
        if (element.handCards.length <= 0) {
            for (let i = 0; i < GameCache.Instance.CurGame.HandCards; i++) {
                handcards[i].spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(element.handCards[0]),
                    AssetFold.texture_SmallCard0
                ) as cc.SpriteFrame;
                handcards[i].active = true;
            }
        }
        //公共牌位置
        // GameObject publiccardpos = go.getChildByName("PublicCardpos").gameObject;
        let handCardNum = GameCache.Instance.CurGame.HandCards;
        // switch (handCardNum) {
        //     case 2:
        //         PublicCardpos.GetComponent<RectTransform>().anchoredPosition3D = new Vector3(-78.1f, 0, 0);
        //         break;
        //     case 4:
        //         PublicCardpos.GetComponent<RectTransform>().anchoredPosition3D = new Vector3(30, 0, 0);
        //         break;
        //     case 5:
        //         PublicCardpos.GetComponent<RectTransform>().anchoredPosition3D = new Vector3(75, 0, 0);
        //         break;
        //     case 6:
        //         PublicCardpos.GetComponent<RectTransform>().anchoredPosition3D = new Vector3(120, 0, 0);
        //         break;
        //     default:
        //         PublicCardpos.GetComponent<RectTransform>().anchoredPosition3D = new Vector3(-78.1f, 0, 0);
        //         break;
        // }
        //公共牌显示
        for (let i = 0; i < 5; i++) {
            let publicCard = publicCards[i];
            let sPublicCard = secondPublicCards[i];
            if (this.PublicCards[i] == 0) {
                //没发完的公共牌不显示
                publicCard.node.active = false;
                sPublicCard.node.active = false;
            } else {
                sPublicCard.node.active = true;
                sPublicCard.spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(this.SecondPublicCards[i]),
                    AssetFold.texture_SmallCard0
                ) as cc.SpriteFrame;
                publicCard.node.active = true;
                publicCard.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            }
        }
        //高亮牌显示
        if (element.maxCardIndex2 != null && element.maxCardIndex2.length > 0) {
            //手牌置灰
            for (let i = 0; i < handcards.length; i++) {
                handcards[i].node.color = cc.color(127, 127, 127, 255);
            }
            //公共牌置灰
            for (let i = 0; i < secondPublicCards.length; i++) {
                secondPublicCards[i].node.color = cc.color(127, 127, 127, 255);
            }
            for (let i = 0; i < element.maxCardIndex2.length; i++) {
                if (element.maxCardIndex2[i] >= 5) {
                    handcards[element.maxCardIndex2[i] - 5].node.color = cc.color(255, 255, 255, 255);
                } else {
                    secondPublicCards[element.maxCardIndex2[i]].node.color = cc.color(255, 255, 255, 255);
                }
            }
        }
        //高亮牌显示
        if (element.maxCardIndex != null && element.maxCardIndex.length > 0) {
            //手牌置灰
            for (let i = 0; i < handcards.length; i++) {
                handcards[i].node.color = cc.color(127, 127, 127, 255);
            }
            //公共牌置灰
            for (let i = 0; i < publicCards.length; i++) {
                publicCards[i].node.color = cc.color(127, 127, 127, 255);
            }
            for (let i = 0; i < element.maxCardIndex.length; i++) {
                if (element.maxCardIndex[i] >= 5) {
                    handcards[element.maxCardIndex[i] - 5].node.color = cc.color(255, 255, 255, 255);
                } else {
                    publicCards[element.maxCardIndex[i]].node.color = cc.color(255, 255, 255, 255);
                }
            }
        }
        // #endregion
    }

    GetCreatePrefab(cloneNode, parentNode) {
        let _cloneNode = cc.instantiate(cloneNode);
        _cloneNode.parent = parentNode;
        return _cloneNode;
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

    RefreshTopHandAndPlayerNumInfo(playerNum) {
        let RoomIDText = this.GameObject.getChildByName('RoomIDText').getComponent(cc.Label);
        let PlayerNumText = this.GameObject.getChildByName('PlayerNumText').getComponent(cc.Label);
        PlayerNumText.string = playerNum;
        RoomIDText.string = GameCache.Instance.room_id + '-' + this.currentPage;
    }

    imageMaskCloseClick() {
        UIComponent.close(this.UIDefine);
    }
}
