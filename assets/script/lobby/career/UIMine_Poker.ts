import ComFormTitle from "../../common/ComFormTitle";
import GGEvent from "../../event/GGEvent";
import GC from "../../frame/GameControl";
import { CardTypeUtil } from "../../game/CardTypeUtil";
import { GameCache } from "../../game/GameCache";
import { PlayerInfo } from "../../game/UITexasHistoryComponent";
import GameUtil from "../../game/util/GameUtil";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import { APIOrgClubUploadIcon, Web_User_Info } from "../../net/https/WebRequest";
import ProtocolAgency from "../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../net/websocket/ProtocolCode";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import BaseForm from "../../ui/form/BaseForm";
import { LobbyControl } from "../control/LobbyControl";
import { UIClubModel } from "../labor/UIClubModel";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMine_Poker extends BaseForm {

    _enterInfo: any = null;


    /// 0 庄家，1 小盲注，2 大盲注，3 枪口，4 枪口+1，5 中位1，6 中位2，7 劫位，8 关位
    /// </summary>
    private PlayerPositionStr = ["BTN", "SB", "BB", "UTG", "UTG+1", "MP1", "MP2", "HJ", "CO"];
    /// <summary>
    /// 0 ，1 小盲注，2 大盲注，3 跟住，4 让牌，5 强制盲注，6 下注，7 加注，8 3次加注，9 全下，10 弃牌，11 保险，
    /// </summary>
    private PlayerActionStr = ["", "SB", "BB", "C", "X", "S", "B", "R", "3B", "A", "F", "INS"];

    playerInfos: Array<PlayerInfo> = []

    PublicCards = null;
    SecondPublicCards = null;
    HaveSecondCard: boolean = false;

    isSC: boolean = false;

    _data = null;

    item_poker: cc.Node = null;
    item_preflop: cc.Node = null;
    item_player: cc.Node = null;
    panel_paipu_up: cc.Node = null;
    panel_player_up: cc.Node = null;
    panel_prefrop: cc.Node = null;
    panel_item_preflop: cc.Node = null;
    panel_item_flop: cc.Node = null;
    panel_item_turn: cc.Node = null;
    panel_item_river: cc.Node = null;
    panel_paipu_down: cc.Node = null;
    panel_player_down: cc.Node = null;
    handcards = [];
    publicCards1 = [];
    publicCards2 = [];
    private comFormTitle: ComFormTitle = null;
    currentPage: number = 0
    totalPage: number = 0;
    buttonFirstPage: cc.Button = null;
    buttonLastPage: cc.Button = null;
    buttonPrePage: cc.Button = null;
    buttonNextPage: cc.Button = null;
    Text_num: cc.Label = null;
    ScrollBar: cc.Node = null;
    btnNode: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);

    }


    lateClose(param: any = null) {
        super.lateClose(param);
        GC.notify.post(GGEvent.UPD_CARD_SCORE);
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();

        GC.notify.register(ProtocolCode.Protocol_Holdem_PublicReplay, this.Protocol_Holdem_PublicReplay_Handler, this);
    }
    Protocol_Holdem_PublicReplay_Handler(response) {
        if (response == null || Buffer.from(response.data, 'base64').toString() == "") {
            return;
        }
        let _data = Buffer.from(response.data, 'base64').toString()
        _data = JSON.parse(_data)
        let a = { data: _data }

        this.refreshUI(a);
    }

    RefreshData(_currentPage) {
        this.currentPage = _currentPage;
        this.RefreshPageButton();
        this.SendClientMessagePublicReplay(this.currentPage);
    }
    RefreshPageButton() {
        this.buttonFirstPage.interactable = this.currentPage > 1;
        this.buttonLastPage.interactable = this.currentPage < this.totalPage;
        this.buttonPrePage.interactable = this.currentPage > 1;
        this.buttonNextPage.interactable = this.currentPage < this.totalPage;
        this.Text_num.string = `${this.currentPage}/${this.totalPage}`;
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
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        this.HaveSecondCard = false;
        this.handcards = [];
        this.publicCards1 = [];
        this.publicCards2 = [];
        this.item_poker = this.getChildNodeOrComponent("item_poker");
        this.item_preflop = this.getChildNodeOrComponent("item_preflop");
        this.item_player = this.getChildNodeOrComponent("item_player");
        this.panel_paipu_up = this.getChildNodeOrComponent("panel_paipu_up");
        this.panel_player_up = this.getChildNodeOrComponent("panel_player_up");
        this.panel_prefrop = this.getChildNodeOrComponent("panel_prefrop");
        this.panel_item_preflop = this.getChildNodeOrComponent("panel_item_preflop");
        this.panel_item_flop = this.getChildNodeOrComponent("panel_item_flop");
        this.panel_item_turn = this.getChildNodeOrComponent("panel_item_turn");
        this.panel_item_river = this.getChildNodeOrComponent("panel_item_river");
        this.panel_paipu_down = this.getChildNodeOrComponent("panel_paipu_down");
        this.panel_player_down = this.getChildNodeOrComponent("panel_player_down");
        this.buttonFirstPage = this.getChildNodeOrComponent("Button_FirstPage", cc.Button);
        this.buttonLastPage = this.getChildNodeOrComponent("Button_LastPage", cc.Button);
        this.buttonPrePage = this.getChildNodeOrComponent("Button_PrePage", cc.Button);
        this.buttonNextPage = this.getChildNodeOrComponent("Button_NextPage", cc.Button);
        this.Text_num = this.getChildNodeOrComponent("Text_num", cc.Label);
        this.ScrollBar = this.getChildNodeOrComponent("ScrollBar");
        this.btnNode = this.getChildNodeOrComponent("btnNode");
        // this.comFormTitle.initData('', this);

        // this.comFormTitle.title.string = "牌谱详情";
        this.ScrollBar.active = param.enterType == 1
        this.btnNode.active = param.enterType == 2
        this._enterInfo = param.info;
        if (param.enterType == 1) {
            this.totalPage = param.info.handNum == 0 ? param.info.handNum : param.info.handNum - 1;
            this.RefreshData(this.totalPage);
        } else {
            if (param.info) {
                this.reqInfo(param.info);
            }

        } let info = {
            room_id: param.info.room_id, //普通牌局，
            room_unique_id: param.info.room_unique_id, // room唯一标识
            hand_num: param.info.hand_num, //手数
        }
        LobbyControl.getInstance().reqRoundStrtus(info).then(
            (res: any) => {
                let isSC = false;
                if (res.code == 0 && res.data.records != null && res.data.records.length > 0) {
                    for (let i = 0; i < res.data.records.length; i++) {
                        let t1 = param.info.id;
                        let t2 = res.data.records[i].id;
                        if (t1 == t2) {
                            isSC = true;
                        }
                    }
                }
                this.isSC = isSC;
                this.refreshBtnUI();
            },
            (res) => {
            }
        )
        let btn_get: cc.Node = this.getChildNodeOrComponent("btn_get");
        btn_get.on("click", this.onClickGet, this);


    }

    refreshBtnUI() {
        let btn_get: cc.Node = this.getChildNodeOrComponent("btn_get");
        let img1 = btn_get.getChildByName("img1");
        let img2 = btn_get.getChildByName("img2");
        if (this.isSC) {
            img1.active = true;
            img2.active = false;
        } else {
            img1.active = false;
            img2.active = true;
        }
    }

    onClickGet() {
        if (this.isSC) {
            let info = {
                room_id: this._enterInfo.room_id, // 普通牌局，
                room_unique_id: this._enterInfo.room_unique_id, // room唯一标识
                hand_num: this._enterInfo.hand_num, // 手数
            }
            LobbyControl.getInstance().reqRemoveRound(info).then(
                (res) => {
                    this.isSC = false;
                    this.refreshBtnUI();
                },
                (res) => {
                }
            )
        } else {
            let info = {
                id: this._enterInfo.id, // 牌普id
                room_id: this._enterInfo.room_id, // 普通牌局，
                match_id: this._enterInfo.match_id, // mtt赛事id
                room_unique_id: this._enterInfo.room_unique_id, // room唯一标识
                name: this._enterInfo.name, // 
                hand_num: this._enterInfo.hand_num, // 手数
                change: this._enterInfo.change, // 金币变动值
                type: this._enterInfo.type, // 类型
                open: this._enterInfo.open, // 是否公开
            }
            LobbyControl.getInstance().reqRecordRound(info).then(
                (res) => {
                    this.isSC = true;
                    this.refreshBtnUI();
                },
                (res) => {
                }
            )
        }
    }

    reqInfo(data: any) {
        let info = {

        }
        let match_id = data.id;
        LobbyControl.getInstance().reqHistoryReplay(match_id, info).then(
            (res) => {
                this.refreshUI(res);
            },
            (res) => {
            }
        )
    }

    refreshUI(data) {
        this._data = data.data;
        //获取公共牌数据
        this.updatePublicCard(data);
        //初始化顶部房间信息
        this.initRoomInfo(data);
        //刷新顶部玩家数量和当前手数
        this.refreshTopHandAndPlayerNumInfo(data.data);
        //动态创建玩家 更新玩家数据
        this.updatePlayerUI(data.data);
        // 中间4行更新
        this.updatePreflopUI(data.data);
    }

    // 中间每行更新
    updateOneRow(clone_item, pl, i, isShowP) {
        let lbl_2 = clone_item.getChildByName("lbl_2");
        let lbl_3 = clone_item.getChildByName("lbl_3");
        let lbl_score = clone_item.getChildByName("lbl_score");
        let lbl_btn = clone_item.getChildByName("lbl_btn");
        let lbl_name3 = clone_item.getChildByName("lbl_name3");

        let actList = this.getActionNumByName(pl[i].act);

        let raiseTimes = 0;
        for (let i = 0; i < pl.length; i++) {
            if (pl[i].act == "bet" || pl[i].act == "raise") {
                raiseTimes++;
            }
        }

        if (actList == 6 || actList == 7) {
            if (raiseTimes == 1) {

                lbl_2.getComponent(cc.Label).string = this.PlayerActionStr[actList];
            }
            else if (raiseTimes == 2) {
                lbl_2.getComponent(cc.Label).string = this.PlayerActionStr[7];
            }
            else {
                lbl_2.getComponent(cc.Label).string = raiseTimes + "B";
            }
        }
        else {
            lbl_2.getComponent(cc.Label).string = this.PlayerActionStr[actList];
        }

        let leftChips = pl[i].c;
        // let str = (leftChips / 100).toString();
        lbl_3.getComponent(cc.Label).string = StringHelper.GetLongString(pl[i].act_amt);
        let pStr = isShowP ? "P:" : "";
        lbl_score.getComponent(cc.Label).string = pStr + StringHelper.GetLongString(leftChips);

        lbl_name3.getComponent(cc.Label).string = this.getNameBySn(pl[i].sn);

        lbl_btn.getComponent(cc.Label).string = this.PlayerPositionStr[pl[i].sn];
    }

    // 更新中间三行 preflop flop turn revier
    updatePreflopUI(data) {
        let FlopInfoList: cc.Node = this.getChildNodeOrComponent("FlopInfoList");
        let TurnInfoList: cc.Node = this.getChildNodeOrComponent("TurnInfoList");
        let RiverInfoList: cc.Node = this.getChildNodeOrComponent("RiverInfoList");
        let ResponseData = data;

        // prop
        let propPl = ResponseData.s.procedure.preflop.pl;
        let propLen = propPl.length;
        this.panel_item_preflop.removeAllChildren();
        for (let i = 0; i < propLen; i++) {
            let clone_item: cc.Node = cc.instantiate(this.item_preflop);
            clone_item.x = 0;
            clone_item.y = 0;
            this.updateOneRow(clone_item, propPl, i, false);
            this.panel_item_preflop.addChild(clone_item);
        }

        // flop
        this.panel_item_flop.removeAllChildren();
        if (ResponseData.s.procedure.flop.pl.length > 0) {
            FlopInfoList.active = true;
            let card = ResponseData.s.procedure.flop.card;
            let pl = ResponseData.s.procedure.flop.pl;
            let cardLen = card.length;
            let plLen = ResponseData.s.procedure.flop.pl.length;
            for (let i = 0; i < 3; i++) {
                let ImageCard = FlopInfoList.getChildByName("ImageCard" + i);
                if (i < cardLen) {
                    ImageCard.active = true;
                    let sp = ImageCard.getComponent(cc.Sprite)
                    sp.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(
                            this.PublicCards[i]),
                        AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                } else {
                    ImageCard.active = false;
                }
            }
            let ChipNumText = FlopInfoList.getChildByName("ChipNumText");
            ChipNumText.getComponent(cc.Label).string = StringHelper.GetLongString(pl[0].pot_out);
            let PlayerNumText = FlopInfoList.getChildByName("PlayerNumText");
            PlayerNumText.getComponent(cc.Label).string = plLen.toString();
            for (let i = 0; i < plLen; i++) {
                let clone_item: cc.Node = cc.instantiate(this.item_preflop);
                clone_item.x = 0;
                clone_item.y = 0;
                this.updateOneRow(clone_item, pl, i, true);
                this.panel_item_flop.addChild(clone_item);
            }
        } else {
            FlopInfoList.active = false;
        }

        // turn
        this.panel_item_turn.removeAllChildren();
        if (ResponseData.s.procedure.turn.pl.length > 0) {
            TurnInfoList.active = true;
            let card = ResponseData.s.procedure.turn.card;
            let pl = ResponseData.s.procedure.turn.pl;
            let cardLen = card.length;
            let plLen = ResponseData.s.procedure.turn.pl.length;
            for (let i = 0; i < 4; i++) {
                let ImageCard = TurnInfoList.getChildByName("PublicCard" + i);
                ImageCard.active = true;
                let sp = ImageCard.getComponent(cc.Sprite)
                sp.spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(
                        this.PublicCards[i]),
                    AssetFold.texture_SmallCard0) as cc.SpriteFrame;

            }
            let ChipNumText = TurnInfoList.getChildByName("ChipNumText");
            ChipNumText.getComponent(cc.Label).string = StringHelper.GetLongString(pl[0].pot_out);
            let PlayerNumText = TurnInfoList.getChildByName("PlayerNumText");
            PlayerNumText.getComponent(cc.Label).string = plLen.toString();
            for (let i = 0; i < plLen; i++) {
                let clone_item: cc.Node = cc.instantiate(this.item_preflop);
                clone_item.x = 0;
                clone_item.y = 0;
                this.panel_item_turn.addChild(clone_item);
                this.updateOneRow(clone_item, pl, i, true);
            }
        } else {
            TurnInfoList.active = false;
        }

        // river
        this.panel_item_river.removeAllChildren();
        if (ResponseData.s.procedure.river.pl.length > 0) {
            RiverInfoList.active = true;
            let card = ResponseData.s.procedure.river.card;
            let pl = ResponseData.s.procedure.river.pl;
            let cardLen = card.length;
            let plLen = ResponseData.s.procedure.river.pl.length;
            for (let i = 0; i < 5; i++) {
                let ImageCard = RiverInfoList.getChildByName("PublicCard" + i);
                ImageCard.active = true;
                let sp = ImageCard.getComponent(cc.Sprite)
                sp.spriteFrame = AssetContext.getAsset(
                    GameUtil.GetCardNameByNum(
                        this.PublicCards[i]),
                    AssetFold.texture_SmallCard0) as cc.SpriteFrame;

            }
            let ChipNumText = RiverInfoList.getChildByName("ChipNumText");
            ChipNumText.getComponent(cc.Label).string = StringHelper.GetLongString(pl[0].pot_out);
            let PlayerNumText = RiverInfoList.getChildByName("PlayerNumText");
            PlayerNumText.getComponent(cc.Label).string = plLen.toString();
            for (let i = 0; i < plLen; i++) {
                let clone_item: cc.Node = cc.instantiate(this.item_preflop);
                clone_item.x = 0;
                clone_item.y = 0;
                this.panel_item_river.addChild(clone_item);
                this.updateOneRow(clone_item, pl, i, true);
            }
        } else {
            RiverInfoList.active = false;
        }
    }

    updatePublicCard(data) {
        this.PublicCards = [0, 0, 0, 0, 0]
        let ResponseData = data.data;
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
            this.SecondPublicCards = [0, 0, 0, 0, 0]
            this.HaveSecondCard = true;

            if (ResponseData.s.procedure.river.scard.length < this.PublicCards.Length) {
                for (let i = 0; i < this.PublicCards.Length - ResponseData.s.procedure.river.scard.length; i++) {
                    this.SecondPublicCards[i] = this.PublicCards[i];
                }
                for (let i = 0; i < ResponseData.s.procedure.river.scard.length; i++) {
                    this.SecondPublicCards[this.PublicCards.Length - ResponseData.s.procedure.river.scard.length + i] = this.PublicCards[i];
                }
            }
            else {
                for (let i = 0; i < ResponseData.s.procedure.river.scard.length; i++) {
                    this.SecondPublicCards[i] = ResponseData.s.procedure.river.scard[i];
                }
            }
        }

        //显示公共牌
        let panel_paipu_up: cc.Node = this.getChildNodeOrComponent("panel_paipu_up");
        let panel_paipu_down: cc.Node = this.getChildNodeOrComponent("panel_paipu_down");
        let cardLen = this.PublicCards.length;
        let list_poke1 = panel_paipu_up.getChildByName('list_poker');
        let list_poker2 = panel_paipu_down.getChildByName('list_poker');
        list_poke1.removeAllChildren();
        list_poker2.removeAllChildren();
        for (let i = 0; i < cardLen; i++) {
            let item_poker: cc.Node = cc.instantiate(this.item_poker);
            item_poker.x = 0;
            item_poker.y = 0;
            let item_poker2: cc.Node = cc.instantiate(this.item_poker);
            item_poker2.x = 0;
            item_poker2.y = 0;
            list_poke1.addChild(item_poker);
            list_poker2.addChild(item_poker2);
            let cardNum = 0;
            // 手牌
            cardNum = this.PublicCards[i];
            this.udpateCardUI(item_poker, cardNum);
            this.udpateCardUI(item_poker2, cardNum);
        }
    }

    getNameBySn(sn) {
        if (this._data == null) {
            return "";
        }
        let name = "";
        let tPl = this._data.s.table.pl;
        for (let i = 0; i < tPl.length; i++) {
            if (tPl[i].sn == sn) {
                name = tPl[i].name;
                break;
            }
        }
        return name;
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

    /// <summary>
    /// 初始化顶部房间信息
    /// </summary>
    initRoomInfo(responseData) {
        let roomName = responseData.data.s.name;
        let ante = responseData.data.s.table.ante;
        let blind = responseData.data.s.table.sb == null ? responseData.data.s.table.bb.bet / 2 : responseData.data.s.table.sb.bet;
        let playerNum = responseData.data.s.table.pl.length;
        let roomId = responseData.data.s.mid == 0 ? responseData.data.s.rid : responseData.data.s.mid;
        let handNum = responseData.data.s.hand;

        let panel_top_1: cc.Node = this.getChildNodeOrComponent("panel_top_1");
        let lbl_1 = panel_top_1.getChildByName("lbl_1");
        lbl_1.getComponent(cc.Label).string = GC.data.languageTemp.temp.getName(roomName);

        let lbl_2 = panel_top_1.getChildByName("lbl_2").getComponent(cc.Label);

        let lbl_3 = panel_top_1.getChildByName("lbl_3").getComponent(cc.Label);

        let lbl_4 = panel_top_1.getChildByName("lbl_4").getComponent(cc.Label);
        if (ante > 0) {
            lbl_2.string = StringHelper.GetLongString(blind) + "/" + StringHelper.GetLongString(blind * 2).toString() + "(" + ante.toString() + ")";
        }
        else {
            lbl_2.string = StringHelper.GetLongString(blind).toString() + "/" + StringHelper.GetLongString(blind * 2).toString();
        }
        lbl_3.string = playerNum.toString();
        lbl_4.string = roomId + "-" + handNum;


    }

    /// <summary>
    /// 刷新顶部玩家数量和当前手数
    /// </summary>
    refreshTopHandAndPlayerNumInfo(responseData) {
        let lbl_playerNum = this.panel_paipu_up.getChildByName("lbl_playerNum").getComponent(cc.Label);
        let lbl_score = this.panel_paipu_up.getChildByName("lbl_score").getComponent(cc.Label);
        let len = responseData.s.table.pl.length;
        lbl_playerNum.string = len;

        let lbl_playerNum1 = this.panel_paipu_down.getChildByName("lbl_playerNum").getComponent(cc.Label);
        let lbl_score1 = this.panel_paipu_down.getChildByName("lbl_score").getComponent(cc.Label);

        let mPool = 0;//各底池

        mPool = responseData.s.procedure.preflop.pl[responseData.s.procedure.preflop.pl.length - 1].pot_out;//pot_out
        lbl_score.string = StringHelper.GetLongString(mPool);

        lbl_playerNum1.string = len;
        lbl_score1.string = StringHelper.GetLongString(mPool);
    }

    // 动态创建玩家 更新玩家数据
    updatePlayerUI(responseData) {
        let plLen = responseData.s.table.pl.length;
        this.panel_player_up.removeAllChildren();
        for (let i = 0; i < plLen; i++) {
            let clone_item: cc.Node = cc.instantiate(this.item_player);
            clone_item.x = 0;
            clone_item.y = 0;
            this.updateLeftStr(responseData, clone_item, i);
            this.updateHandcards(responseData, clone_item, i);

            this.panel_player_up.addChild(clone_item);
        }
        this.panel_player_down.removeAllChildren();
        for (let i = 0; i < plLen; i++) {
            let clone_item: cc.Node = cc.instantiate(this.item_player);
            clone_item.x = 0;
            clone_item.y = 0;
            this.updateLeftStr(responseData, clone_item, i);
            this.updateHandcards(responseData, clone_item, (plLen - 1 - i));

            this.panel_player_down.addChild(clone_item);
        }
    }

    // 更新牌的花色
    udpateCardUI(item_poker, cardNum) {
        let img = item_poker.getChildByName("img");
        let cardStr = GameUtil.GetCardNameByNum(cardNum);
        let path = AssetContext.getAsset(
            cardStr,
            AssetFold.texture_SmallCard0) as cc.SpriteFrame;
        img.getComponent(cc.Sprite).spriteFrame = path;
    }

    // 更新玩家手牌
    updateHandcards(data, clone_item, index) {
        let info = data.s.result;
        let infoLen = info.length;
        let item_hand_public: cc.Node = clone_item.getChildByName("item_hand_public");
        let item_public_up: cc.Node = clone_item.getChildByName("item_public_up");
        let item_public_down: cc.Node = clone_item.getChildByName("item_public_down");

        let handcards = [];
        let publicCards1 = [];
        let publicCards2 = [];
        let result = info[index];
        let card = result.card;
        // let card = this.playerInfos[index].handCards
        let playerId = data.s.table.pl[index].uid;
        if (playerId == GameCache.Instance.nUserId) {
            if (data.d != null && data.d.length >= 0) {
                card = data.d;
            }
        }
        else {
            card = data.s.result[index].card;
        }
        let publicCardLen = this.PublicCards.length;

        if (this.HaveSecondCard) {
            // 有二套牌 手牌不带公共牌 公共牌后面上下显示

            let secondPublicCardLen = this.SecondPublicCards.length;
            let cardLen = card.length;
            item_hand_public.removeAllChildren();
            for (let j = 0; j < cardLen; j++) {
                let item_poker: cc.Node = cc.instantiate(this.item_poker);
                item_poker.x = 0;
                item_poker.y = 0;
                item_hand_public.addChild(item_poker);
                let cardNum = 0;
                // 手牌
                cardNum = card[j];
                handcards.push(item_poker);
                this.udpateCardUI(item_poker, cardNum);
            }
            item_public_up.removeAllChildren();
            item_public_down.removeAllChildren();
            for (let j = 0; j < publicCardLen; j++) {
                let item_poker: cc.Node = cc.instantiate(this.item_poker);
                item_poker.x = 0;
                item_poker.y = 0;
                item_public_up.addChild(item_poker);
                let cardNum = 0;
                // 手牌
                cardNum = this.PublicCards[j];
                publicCards1.push(item_poker);
                this.udpateCardUI(item_poker, cardNum);
            }
            for (let j = 0; j < secondPublicCardLen; j++) {
                let item_poker: cc.Node = cc.instantiate(this.item_poker);
                item_poker.x = 0;
                item_poker.y = 0;
                item_public_down.addChild(item_poker);
                let cardNum = 0;
                // 手牌
                cardNum = this.SecondPublicCards[j];
                publicCards2.push(item_poker);
                this.udpateCardUI(item_poker, cardNum);
            }
            this.updateMaxCardUI(result, handcards, publicCards1, publicCards2);
        } else {
            // 没有二套牌情况 手牌后 空格 公共牌
            // let result = info[index];
            // let card = result.card;
            let maxCardIndex = result.maxcard_idx;
            // let publicCardLen = this.PublicCards.length;
            let cardLen = card.length;
            let total = cardLen + 1 + publicCardLen;
            item_hand_public.removeAllChildren();
            for (let j = 0; j < total; j++) {
                let item_poker: cc.Node = cc.instantiate(this.item_poker);
                item_poker.x = 0;
                item_poker.y = 0;
                item_hand_public.addChild(item_poker);
                let cardNum = 0;

                if (j < cardLen) {
                    // 手牌
                    cardNum = card[j];
                    handcards.push(item_poker);
                    this.udpateCardUI(item_poker, cardNum);
                } else if (j == cardLen) {
                    //空格
                } else {
                    //公共牌
                    publicCards1.push(item_poker);
                    cardNum = this.PublicCards[j - 1 - cardLen];
                    this.udpateCardUI(item_poker, cardNum);
                }

                // // 高亮牌
                // let isExist = false;
                // for (let ik=0; ik<maxCardIndex.length; ik++) {
                //     if (maxCardIndex[ik] == j) {
                //         isExist = true;
                //         break;
                //     }
                // }
                // if (!isExist) {
                //     item_poker.color = cc.color(127, 127, 127, 255);
                // } else {
                //     item_poker.color = cc.color(255, 255, 255, 255);
                // }
            }
            this.updateMaxCardUI(result, handcards, publicCards1, publicCards2);
        }

    }

    //更新高亮牌
    updateMaxCardUI(element, handcards, publicCards1, publicCards2) {
        this.handcards = handcards;
        this.publicCards1 = publicCards1;
        this.publicCards2 = publicCards2;
        if (this.HaveSecondCard) {
            //高亮牌显示
            if (element.maxcard_idx2 != null && element.maxcard_idx2.length > 0) {
                //手牌置灰
                for (let i = 0; i < this.handcards.length; i++) {
                    this.handcards[i].getChildByName("img").color = cc.color(127, 127, 127, 255);
                }
                //公共牌置灰
                for (let i = 0; i < this.publicCards1.length; i++) {
                    this.publicCards1[i].getChildByName("img").color = cc.color(127, 127, 127, 255);
                }
                for (let i = 0; i < this.publicCards2.length; i++) {
                    this.publicCards2[i].getChildByName("img").color = cc.color(127, 127, 127, 255);
                }
                for (let i = 0; i < element.maxcard_idx2.length; i++) {
                    if (element.maxcard_idx2[i] >= 5) {
                        this.handcards[element.maxcard_idx2[i] - 5].getChildByName("img").color = cc.color(255, 255, 255, 255);
                    }
                    else {
                        this.publicCards1[element.maxcard_idx2[i]].getChildByName("img").color = cc.color(255, 255, 255, 255);
                        this.publicCards2[element.maxcard_idx2[i]].getChildByName("img").color = cc.color(255, 255, 255, 255);
                    }
                }
            }
        }
        else {
            //高亮牌显示
            if (element.maxcard_idx != null && element.maxcard_idx.length > 0) {
                //手牌置灰
                for (let i = 0; i < this.handcards.length; i++) {
                    this.handcards[i].getChildByName("img").color = cc.color(127, 127, 127, 255);
                }
                //公共牌置灰
                for (let i = 0; i < this.publicCards1.length; i++) {
                    this.publicCards1[i].getChildByName("img").color = cc.color(127, 127, 127, 255);
                }
                for (let i = 0; i < element.maxcard_idx.length; i++) {
                    if (element.maxcard_idx[i] >= 5) {
                        this.handcards[element.maxcard_idx[i] - 5].getChildByName("img").color = cc.color(255, 255, 255, 255);
                    }
                    else {
                        this.publicCards1[element.maxcard_idx[i]].getChildByName("img").color = cc.color(255, 255, 255, 255);
                    }
                }
            }
        }
    }

    //更新玩家左边文本
    updateLeftStr(ResponseData, clone_item, index) {
        let tableSeatIds = [];//本手参与玩家座位号
        let banerSeatId = ResponseData.s.table.btn;//庄位

        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            tableSeatIds.push(ResponseData.s.table.pl[i].sn);
        }

        let i = index;
        let player: PlayerInfo = new PlayerInfo();
        player.playerId = ResponseData.s.table.pl[i].uid;
        player.playerPosition = this.getPositionNumByBaner(tableSeatIds, banerSeatId, ResponseData.s.table.pl[i].sn);

        player.userName = ResponseData.s.table.pl[i].name;
        player.headPic = ResponseData.s.table.pl[i].avatar;
        player.seatID = ResponseData.s.table.pl[i].sn;
        player.initChip = ResponseData.s.table.pl[i].c;

        let win1 = ResponseData.s.result[i].win;
        let win2 = ResponseData.s.result[i].win;
        let fee = ResponseData.s.result[i].fee;
        // let handBet1 = handBet / 2;
        // let handBet2 = handBet - handBet1;

        // if (player.playerId == GameCache.Instance.nUserId) {
        //     player.isMine = true;
        //     if (ResponseData.d != null && ResponseData.d.length >= 0) {
        //         player.handCards = ResponseData.d;
        //     }
        // }
        // else {
        //     player.isMine = false;
        // }
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

        this.playerInfos.push(player);

        let card_type = ResponseData.s.result[i].card_type;

        clone_item.getChildByName("lbl_left_1").getComponent(cc.Label).string = this.PlayerPositionStr[player.playerPosition];
        clone_item.getChildByName("lbl_left_name_1").getComponent(cc.Label).string = player.userName;
        clone_item.getChildByName("lbl_left_up_1").getComponent(cc.Label).string = this.GetShowCardType(card_type);
        if (this.HaveSecondCard) {
            clone_item.getChildByName("lbl_public").active = false;
            clone_item.getChildByName("lbl_public_up").active = true;
            clone_item.getChildByName("lbl_public_down").active = true;
            this.setTextColor(clone_item.getChildByName("lbl_public_up").getComponent(cc.Label), win1 < 0 ? '#7187FF' : '#B0FFAE')
            clone_item.getChildByName("lbl_public_up").getComponent(cc.Label).string = StringHelper.GetLongString(win1);
            this.setTextColor(clone_item.getChildByName("lbl_public_down").getComponent(cc.Label), win2 < 0 ? '#7187FF' : '#B0FFAE')
            clone_item.getChildByName("lbl_public_down").getComponent(cc.Label).string = StringHelper.GetLongString(win2);
        } else {
            clone_item.getChildByName("lbl_public").active = true;
            clone_item.getChildByName("lbl_public_up").active = false;
            clone_item.getChildByName("lbl_public_down").active = false;
            this.setTextColor(clone_item.getChildByName("lbl_public").getComponent(cc.Label), win1 < 0 ? '#7187FF' : '#B0FFAE')
            clone_item.getChildByName("lbl_public").getComponent(cc.Label).string = StringHelper.GetLongString(win1);
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

    GetShowCardType(cardType) {
        return CardTypeUtil.GetCardTypeEnglishName(cardType);
    }

    /**
     * 注册触摸事件
     */
    protected regiterTouchEvents() {
        super.regiterTouchEvents();
    }
    // /**
    //  * 注册广播事件
    //  */
    // protected regiterDispatchEvent() {
    // }

}
