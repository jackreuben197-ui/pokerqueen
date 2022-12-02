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

    isSC: boolean = false;

    _data = null;

    protected lateLoad() {
        super.lateLoad();

    }

    lateClose(param: any = null) {
        super.lateClose(param);
        GC.notify.post(GGEvent.UPD_CARD_SCORE);
    }
    /**
     * 每次打开面板处理的内容
     */
    onShow(param?: any, fromUI?: cc.Node): void {
        super.onShow(param, fromUI);
        if (param.info) {
            this._enterInfo = param.info;
            this.reqInfo(param.info);

            let info = {
                room_id: param.info.room_id, //普通牌局，
                room_unique_id: param.info.room_unique_id, // room唯一标识
                hand_num: param.info.hand_num, //手数
            }
            LobbyControl.getInstance().reqRoundStrtus(info).then(
                (res: any) => {
                    let isSC = false;
                    if (res.code == 0 && res.data.records != null && res.data.records.length > 0) {
                        for (let i=0; i<res.data.records.length; i++) {
                            let t1 = param.info.info.id;
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
        }
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
                room_id: this._enterInfo.info.room_id, // 普通牌局，
                room_unique_id: this._enterInfo.info.room_unique_id, // room唯一标识
                hand_num: this._enterInfo.info.hand_num, // 手数
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
                id: this._enterInfo.info.id, // 牌普id
                room_id: this._enterInfo.info.room_id, // 普通牌局，
                match_id: this._enterInfo.info.match_id, // mtt赛事id
                room_unique_id: this._enterInfo.info.room_unique_id, // room唯一标识
                name: this._enterInfo.info.name, // 
                hand_num: this._enterInfo.info.hand_num, // 手数
                change: this._enterInfo.info.change, // 金币变动值
                type: this._enterInfo.info.type, // 类型
                open: this._enterInfo.info.open, // 是否公开
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
        let match_id = data.info.id;
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
        this.updatePublicCard(data);
        this.initRoomInfo(data);
        this.refreshTopHandAndPlayerNumInfo(data.data);
        this.updateHandcards(data, "node_p1", "node_p2");
        this.updateHandcards(data, "node_p3", "node_p4");
        this.updateLeftStr(data.data);
        this.updateCenterUI(data.data);
        // this.refreshTop1(data);
        this.updateHideUI(data.data);
    }

    updateHideUI(data) {
        let FlopInfoList: cc.Node = this.getChildNodeOrComponent("FlopInfoList");
        let node_11: cc.Node = this.getChildNodeOrComponent("node_11");
        let node_12: cc.Node = this.getChildNodeOrComponent("node_12");
        let node_13: cc.Node = this.getChildNodeOrComponent("node_13");
        let node_14: cc.Node = this.getChildNodeOrComponent("node_14");
        let TurnInfoList: cc.Node = this.getChildNodeOrComponent("TurnInfoList");
        let node_21: cc.Node = this.getChildNodeOrComponent("node_21");
        let node_22: cc.Node = this.getChildNodeOrComponent("node_22");
        let node_23: cc.Node = this.getChildNodeOrComponent("node_23");
        let node_24: cc.Node = this.getChildNodeOrComponent("node_24");
        let RiverInfoList: cc.Node = this.getChildNodeOrComponent("RiverInfoList");
        let node_31: cc.Node = this.getChildNodeOrComponent("node_31");
        let node_32: cc.Node = this.getChildNodeOrComponent("node_32");
        let node_33: cc.Node = this.getChildNodeOrComponent("node_33");
        let node_34: cc.Node = this.getChildNodeOrComponent("node_34");
        let ResponseData = data;
        if (ResponseData.s.procedure.flop.pl.length > 0) {
            FlopInfoList.active = true;
            node_11.active = true;
            node_12.active = true;
            node_13.active = true;
            node_14.active = true;
            let card = ResponseData.s.procedure.flop.card;
            let pl = ResponseData.s.procedure.flop.pl;
            let cardLen = card.length;
            let plLen = ResponseData.s.procedure.flop.pl.length;
            for (let i=0; i<3; i++) {
                let ImageCard = FlopInfoList.getChildByName("ImageCard" + i);
                if (i < cardLen) {
                    ImageCard.active = true;
                    let sp = ImageCard.getComponent(cc.Sprite)
                    sp.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(
                            card[i]), 
                            AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                } else {
                    ImageCard.active = false;
                }
            }
            let ChipNumText = FlopInfoList.getChildByName("ChipNumText");
            ChipNumText.getComponent(cc.Label).string = StringHelper.GetLongString(pl[0].pot_out);
            let PlayerNumText = FlopInfoList.getChildByName("PlayerNumText");
            PlayerNumText.getComponent(cc.Label).string = plLen.toString();
            for (let i=0; i<4; i++) {
                let node_row:cc.Node = this.getChildNodeOrComponent("node_1" + (i+1));
                if (i < plLen) {
                    node_row.active = true;
                    let lbl_2 = node_row.getChildByName("lbl_2");
                    let lbl_3 = node_row.getChildByName("lbl_3");
                    let lbl_score = node_row.getChildByName("lbl_score");
                    let lbl_btn = node_row.getChildByName("lbl_btn");
                    let lbl_name3 = node_row.getChildByName("lbl_name3");

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
                    let str = (leftChips / 100).toString();
                    lbl_3.getComponent(cc.Label).string = pl[i].act_amt;
                    lbl_score.getComponent(cc.Label).string = this.tryParse(str);

                    lbl_name3.getComponent(cc.Label).string = this.getNameBySn(pl[i].sn);

                    lbl_btn.getComponent(cc.Label).string = this.PlayerPositionStr[pl[i].sn];
                } else {
                    node_row.active = false;
                }
            }
        } else {
            FlopInfoList.active = false;
            node_11.active = false;
            node_12.active = false;
            node_13.active = false;
            node_14.active = false;
        }
        if (ResponseData.s.procedure.turn.pl.length > 0) {
            TurnInfoList.active = true;
            node_21.active = true;
            node_22.active = true;
            node_23.active = true;
            node_24.active = true;
            let card = ResponseData.s.procedure.turn.card;
            let pl = ResponseData.s.procedure.turn.pl;
            let cardLen = card.length;
            let plLen = ResponseData.s.procedure.turn.pl.length;
            for (let i=0; i<5; i++) {
                let ImageCard = TurnInfoList.getChildByName("PublicCard" + i);
                if (i < cardLen) {
                    ImageCard.active = true;
                    let sp = ImageCard.getComponent(cc.Sprite)
                    sp.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(
                            card[i]), 
                            AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                } else {
                    ImageCard.active = false;
                }
            }
            let ChipNumText = TurnInfoList.getChildByName("ChipNumText");
            ChipNumText.getComponent(cc.Label).string = StringHelper.GetLongString(pl[0].pot_out);
            let PlayerNumText = TurnInfoList.getChildByName("PlayerNumText");
            PlayerNumText.getComponent(cc.Label).string = plLen.toString();
            for (let i=0; i<4; i++) {
                let node_row:cc.Node = this.getChildNodeOrComponent("node_2" + (i+1));
                if (i < plLen) {
                    node_row.active = true;
                    let lbl_2 = node_row.getChildByName("lbl_2");
                    let lbl_3 = node_row.getChildByName("lbl_3");
                    let lbl_score = node_row.getChildByName("lbl_score");
                    let lbl_btn = node_row.getChildByName("lbl_btn");
                    let lbl_name3 = node_row.getChildByName("lbl_name3");

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
                    let str = (leftChips / 100).toString();
                    lbl_3.getComponent(cc.Label).string = pl[i].act_amt;
                    lbl_score.getComponent(cc.Label).string = this.tryParse(str);

                    lbl_name3.getComponent(cc.Label).string = this.getNameBySn(pl[i].sn);

                    lbl_btn.getComponent(cc.Label).string = this.PlayerPositionStr[pl[i].sn];
                } else {
                    node_row.active = false;
                }
            }
        } else {
            TurnInfoList.active = false;
            node_21.active = false;
            node_22.active = false;
            node_23.active = false;
            node_24.active = false;
        }
        if (ResponseData.s.procedure.river.pl.length > 0) {
            RiverInfoList.active = true;
            node_31.active = true;
            node_32.active = true;
            node_33.active = true;
            node_34.active = true;
            let card = ResponseData.s.procedure.river.card;
            let pl = ResponseData.s.procedure.river.pl;
            let cardLen = card.length;
            let plLen = ResponseData.s.procedure.river.pl.length;
            for (let i=0; i<5; i++) {
                let ImageCard = RiverInfoList.getChildByName("PublicCard" + i);
                if (i < cardLen) {
                    ImageCard.active = true;
                    let sp = ImageCard.getComponent(cc.Sprite)
                    sp.spriteFrame = AssetContext.getAsset(
                        GameUtil.GetCardNameByNum(
                            card[i]), 
                            AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                } else {
                    ImageCard.active = false;
                }
            }
            let ChipNumText = RiverInfoList.getChildByName("ChipNumText");
            ChipNumText.getComponent(cc.Label).string = StringHelper.GetLongString(pl[0].pot_out);
            let PlayerNumText = RiverInfoList.getChildByName("PlayerNumText");
            PlayerNumText.getComponent(cc.Label).string = plLen.toString();
            for (let i=0; i<4; i++) {
                let node_row:cc.Node = this.getChildNodeOrComponent("node_3" + (i+1));
                if (i < plLen) {
                    node_row.active = true;
                    let lbl_2 = node_row.getChildByName("lbl_2");
                    let lbl_3 = node_row.getChildByName("lbl_3");
                    let lbl_score = node_row.getChildByName("lbl_score");
                    let lbl_btn = node_row.getChildByName("lbl_btn");
                    let lbl_name3 = node_row.getChildByName("lbl_name3");

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
                    let str = (leftChips / 100).toString();
                    lbl_3.getComponent(cc.Label).string = pl[i].act_amt;
                    lbl_score.getComponent(cc.Label).string = this.tryParse(str);

                    lbl_name3.getComponent(cc.Label).string = this.getNameBySn(pl[i].sn);

                    lbl_btn.getComponent(cc.Label).string = this.PlayerPositionStr[pl[i].sn];
                } else {
                    node_row.active = false;
                }
            }
        } else {
            RiverInfoList.active = false;
            node_31.active = false;
            node_32.active = false;
            node_33.active = false;
            node_34.active = false;
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

        //显示公共牌
        let panel_c1: cc.Node = this.getChildNodeOrComponent("panel_c1");
        let panel_c2: cc.Node = this.getChildNodeOrComponent("panel_c2");
        for (let i = 0; i < 5; i++) {
            let publicCard = panel_c1.getChildByName('img_pk_' + (i+1)).getComponent(cc.Sprite)
            let publicCard2 = panel_c2.getChildByName('img_pk_' + (i+1)).getComponent(cc.Sprite)

            if (this.PublicCards[i] == 0) {
                //没发完的公共牌不显示
                publicCard.node.active = (false);
                publicCard2.node.active = (false);
            }
            else {
                publicCard.node.active = (true);
                publicCard.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0) as cc.SpriteFrame;

                publicCard2.node.active = (true);
                publicCard2.spriteFrame = AssetContext.getAsset(GameUtil.GetCardNameByNum(this.PublicCards[i]), AssetFold.texture_SmallCard0) as cc.SpriteFrame;
            }
        }
    }

    getNameBySn(sn) {
        if (this._data == null) {
            return "";
        }
        let name = "";
        let tPl = this._data.s.table.pl;
        for (let i=0; i<tPl.length; i++) {
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
            lbl_2.string = blind.toString() + "/" + (blind * 2).toString() + "(" + ante.toString() + ")";
        }
        else {
            lbl_2.string = blind.toString() + "/" + (blind * 2).toString();
        }
        lbl_3.string = playerNum.toString();
        lbl_4.string = roomId + "-" + handNum;


    }

    /// <summary>
    /// 刷新顶部玩家数量和当前手数
    /// </summary>
    refreshTopHandAndPlayerNumInfo(responseData) {
        let panel_top_2: cc.Node = this.getChildNodeOrComponent("panel_top_2");
        let panel_c1: cc.Node = this.getChildNodeOrComponent("panel_c1");
        let lbl_5 = panel_c1.getChildByName("lbl_5").getComponent(cc.Label);
        let lbl_6 = panel_c1.getChildByName("lbl_6").getComponent(cc.Label);
        let len = responseData.s.table.pl.length;
        lbl_5.string = len;

        let panel_c2: cc.Node = this.getChildNodeOrComponent("panel_c2");
        let lbl_15 = panel_c2.getChildByName("lbl_5").getComponent(cc.Label);
        let lbl_16 = panel_c2.getChildByName("lbl_6").getComponent(cc.Label);

        let mPool = 0;//各底池
        mPool = responseData.s.procedure.preflop.pl[len - 1].pot_out;
        lbl_6.string = StringHelper.getStringDiv100(mPool);

        lbl_15.string = len;
        lbl_16.string = StringHelper.getStringDiv100(mPool);
    }

    updateHandcards(data, str1, str2) {
        let info = data.data.s.result;
        let infoLen = info.length;
        let node_pk_1: cc.Node = this.getChildNodeOrComponent(str1);
        let node_pk_2: cc.Node = this.getChildNodeOrComponent(str2);
        let list1 = node_pk_1.children;
        let list2 = node_pk_2.children;
        let len1 = list1.length;
        let len2 = list2.length;

        for (let i = 0; i < infoLen; i++) {
            let result = info[i];
            let card = result.card;
            let maxCardIndex = result.maxcard_idx;
            let cardLen = this.PublicCards.length + 2;
            if (i == 0) {
                for (let j = 0; j < len1; j++) {
                    let item = list1[j];
                    let cardNum = 0;
                    if (j < 2) {
                        cardNum = card[j];
                    } else {
                        cardNum = this.PublicCards[j-2];
                    }

                    let isExist = false;
                    for (let ik=0; ik<maxCardIndex.length; ik++) {
                        if (maxCardIndex[ik] == j) {
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        item.color = cc.color(127, 127, 127, 255);
                    } else {
                        item.color = cc.color(255, 255, 255, 255);
                    }

                    if (j < cardLen) {
                        item.active = true;
                        let cardStr = GameUtil.GetCardNameByNum(cardNum);
                        let path = AssetContext.getAsset(
                            cardStr,
                            AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                        item.getComponent(cc.Sprite).spriteFrame = path;
                    } else {
                        item.active = false;
                    }
                }
            } else if (i == 1) {
                for (let j = 0; j < len2; j++) {
                    let item = list2[j];
                    let cardNum = 0;
                    if (j < 2) {
                        cardNum = card[j];
                    } else {
                        cardNum = this.PublicCards[j-2];
                    }

                    let isExist = false;
                    for (let ik=0; ik<maxCardIndex.length; ik++) {
                        if (maxCardIndex[ik] == j) {
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist) {
                        item.color = cc.color(127, 127, 127, 255);
                    } else {
                        item.color = cc.color(255, 255, 255, 255);
                    }
                    
                    if (j < cardLen) {
                        item.active = true;
                        item.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(
                            GameUtil.GetCardNameByNum(cardNum),
                            AssetFold.texture_SmallCard0) as cc.SpriteFrame;
                    } else {
                        item.active = false;
                    }
                }
            }

        }

    }

    updateLeftStr(ResponseData) {
        let tableSeatIds = [];//本手参与玩家座位号
        let banerSeatId = ResponseData.s.table.btn;//庄位

        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
            tableSeatIds.push(ResponseData.s.table.pl[i].sn);
        }

        let lbl_left_1 = this.getChildNodeOrComponent("lbl_left_1", cc.Label);
        let lbl_left_2 = this.getChildNodeOrComponent("lbl_left_2", cc.Label);
        let lbl_left_3 = this.getChildNodeOrComponent("lbl_left_3", cc.Label);
        let lbl_left_4 = this.getChildNodeOrComponent("lbl_left_4", cc.Label);

        let lbl_left_name_1 = this.getChildNodeOrComponent("lbl_left_name_1", cc.Label);
        let lbl_left_name_2 = this.getChildNodeOrComponent("lbl_left_name_2", cc.Label);
        let lbl_left_name_3 = this.getChildNodeOrComponent("lbl_left_name_3", cc.Label);
        let lbl_left_name_4 = this.getChildNodeOrComponent("lbl_left_name_4", cc.Label);

        let lbl_s1 = this.getChildNodeOrComponent("lbl_s1", cc.Label);
        let lbl_s2 = this.getChildNodeOrComponent("lbl_s2", cc.Label);
        let lbl_s3 = this.getChildNodeOrComponent("lbl_s3", cc.Label);
        let lbl_s4 = this.getChildNodeOrComponent("lbl_s4", cc.Label);


        let lbl_left_up_1 = this.getChildNodeOrComponent("lbl_left_up_1", cc.Label);
        let lbl_left_up_2 = this.getChildNodeOrComponent("lbl_left_up_2", cc.Label);
        let lbl_left_up_3 = this.getChildNodeOrComponent("lbl_left_up_3", cc.Label);
        let lbl_left_up_4 = this.getChildNodeOrComponent("lbl_left_up_4", cc.Label);

        let handBet = 0;
        // for (let i = 0; i < ResponseData.s.procedure.flop.pl.length; i++) {
        //     handBet += ResponseData.s.procedure.flop.pl[i].act_amt;//统计本手下注筹码
        // }

        for (let i = 0; i < ResponseData.s.table.pl.length; i++) {
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

            let card_type = ResponseData.s.result[i].card_type;

            if (i == 0) {
                lbl_left_1.string = this.PlayerPositionStr[player.playerPosition];
                lbl_left_4.string = this.PlayerPositionStr[player.playerPosition];
                lbl_left_name_1.string = player.userName;
                lbl_left_name_4.string = player.userName;
                lbl_s1.string = StringHelper.GetLongString(win1);
                lbl_s4.string = StringHelper.GetLongString(win1);
                lbl_left_up_1.string = this.GetShowCardType(card_type);
                lbl_left_up_4.string = this.GetShowCardType(card_type);
            } else if (i == 1) {
                lbl_left_2.string = this.PlayerPositionStr[player.playerPosition];
                lbl_left_3.string = this.PlayerPositionStr[player.playerPosition];
                lbl_left_name_2.string = player.userName;
                lbl_left_name_3.string = player.userName;
                lbl_s2.string = StringHelper.GetLongString(win2);
                lbl_s3.string = StringHelper.GetLongString(win2);
                lbl_left_up_2.string = this.GetShowCardType(card_type);
                lbl_left_up_3.string = this.GetShowCardType(card_type);
            }


        }

    }

    updateCenterUI(ResponseData) {
        let pl = ResponseData.s.procedure.preflop.pl;
        let len = pl.length;
        for (let i = 0; i < 6; i++) {
            let node_row: cc.Node = this.getChildNodeOrComponent("node_c_" + (i + 1));
            if (i < len) {
                let info = ResponseData.s.procedure.preflop.pl[i];
                node_row.active = true;

                let lbl_2 = node_row.getChildByName("lbl_2");
                let lbl_3 = node_row.getChildByName("lbl_3");
                let lbl_score = node_row.getChildByName("lbl_score");
                let lbl_btn = node_row.getChildByName("lbl_btn");
                let lbl_name3 = node_row.getChildByName("lbl_name3");

                let actList = this.getActionNumByName(ResponseData.s.procedure.preflop.pl[i].act);

                let raiseTimes = 0;
                for (let i = 0; i < ResponseData.s.procedure.preflop.pl.length; i++) {
                    if (ResponseData.s.procedure.preflop.pl[i].act == "bet" || ResponseData.s.procedure.preflop.pl[i].act == "raise") {
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

                let leftChips = ResponseData.s.procedure.preflop.pl[i].c;
                let str = (leftChips / 100).toString();
                lbl_3.getComponent(cc.Label).string = pl[i].act_amt;
                lbl_score.getComponent(cc.Label).string = this.tryParse(str);

                lbl_name3.getComponent(cc.Label).string = this.getNameBySn(pl[i].sn);

                lbl_btn.getComponent(cc.Label).string = this.PlayerPositionStr[pl[i].sn];

            } else {
                node_row.active = false;
            }

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
    /**
     * 注册广播事件
     */
    protected regiterDispatchEvent() {
    }

}
