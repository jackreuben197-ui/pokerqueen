

/// <summary>
/// 声纹状态

import GC from "../../frame/GameControl";
import { GM } from "../../gm/GMAPI";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import { UIMTTModel } from "../../new_mtt/UIMTTModel";
import { Def } from "../../protobuf/holdem/define_pb";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import { CardType, CardTypeUtil } from "../CardTypeUtil";
import { CPlayer } from "../CPlayer";
import FSMLogicComponent from "../FSMLogicComponent";
import { GameCache } from "../GameCache";
import { SeatFSM } from "../SeatFSM";
import { SeatEmpty, SeatKeep, SeatSit, SeatWaitOther, SeatWaitStart } from "../SeatStateHandler";
import SeatUIRC, { CardUIInfo } from "../SeatUIRC";
import TexasGame from "../texas/TexasGame";
import GameUtil, { RoomType, seat_info, some_pos } from "../util/GameUtil";

/// </summary>
export enum VoiceprintState {
    None,
    Start,//发起验证
    Recording,//录入中
    Voting,//投票中
    Checking,//等待审核
    Robot,//被验证是机器人
    Real//被验证是真人
}

export default class Seat {

    public SeatFSM: SeatFSM = null;

    /// <summary>
    /// 自己手牌位置
    /// </summary>
    protected static myCardsPos: cc.Vec3[] = [];

    //缩放值
    protected static myCardsScale: number = 1;

    /// <summary>
    /// 自己手牌旋转
    /// </summary>
    protected static myCardsRot: cc.Vec3[] = [];

    /// <summary>
    /// 小手牌
    /// </summary>
    protected static backSmallCardPos: cc.Vec3[] = [];
    /// <summary>
    /// 小手牌
    /// </summary>
    protected static backSmallCardRot: cc.Vec3[] = [];

    /// <summary>
    /// 输赢时显示的手牌位置
    /// </summary>
    protected static smallCardPos: cc.Vec3[] = [];
    /// <summary>
    /// 自己牌型位置
    /// </summary>
    protected static myCardTypePos: cc.Vec3[] = [];


    protected defaultIconChipLocalPos: cc.Vec3 = cc.v3();


    public FsmLogicComponent: FSMLogicComponent = null;//状态机


    public ClientSeatId: number = 0;    // 客户端当前的方位座位号(0最下方,顺时针)

    public seatID: number = 0;   // 服务器座位号

    public Player: CPlayer = null;  // 玩家信息

    public isSmall: boolean = false; // 是否小盲
    public isBig: boolean = false;    // 是否大盲
    public isBank: boolean = false;  // 是否庄家
    public isStraddle: boolean = false;// 是否Straddle

    public keepSeatLeftTime: number = 0;  // 留座剩余时间（s）
    public ranking: number = 0;   //玩家排名(mtt)
    private voiceprintTime: number = 0;
    private OriginalVoicePos: cc.Vec3 = null;
    //private Transform OriginalVoiceObj;

    public optCurTime: number = 0;
    public optTotalTime: number = 0;
    public isCountDown: boolean = false;

    public seatUIInfo: seat_info = null;

    protected PlayerCount: number = 0;//最大人数

    public uirc: SeatUIRC = null;


    protected sequencePlayFoldAnimation: cc.Tween;

    public SeatVoiceprintState: VoiceprintState = VoiceprintState.None;

    private isStartHide: boolean = false;

    //亮牌数据
    public showCardsId: number[] = null;

    voiceStatePositon: cc.Vec3 = null;

    public listCardUIInfos: CardUIInfo[] = null;
    public listSmallCardUIInfos: CardUIInfo[] = null;
    public listImageSmallCardBack: cc.Sprite[] = null;

    /// <summary>
    /// 是否留座离桌倒计时中
    /// </summary>
    public bKeepSeatCounting: boolean = false;
    public keepSeatDeltaTime: number = 0;
    public IsExit: boolean = false;

    deal_sequence_obj: any = {};

    tweenerPlayRecyclingWinChipAnimation: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function } = null;
    sequenceUpdateBubble: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function } = null;
    tweenerHideBubble: { tween?: cc.Tween, complete?: Function, IsPlaying?: boolean, Kill?: Function } = null;

    IsDisposed: boolean = false;

    constructor(public id: number, public ui: cc.Node) {

        this.SeatFSM = new SeatFSM(id, this);

        this.uirc = ui.getComponent(SeatUIRC);

        this.uirc.seat = this;

        GC.uc.AddComponent(this.FsmLogicComponent = new FSMLogicComponent(this.SeatFSM));

        this.InitData();
        this.InitUI();
    }
    InitData() {
        let pos = GameUtil.Seat_ElementPos[GameCache.Instance.CurGame.HandCards];
        Seat.myCardsPos = pos.myCardsPos;
        Seat.myCardsScale = pos.myCardsScale;
        Seat.backSmallCardPos = pos.backSmallCardPos;
        Seat.smallCardPos = pos.smallCardPos;
        Seat.myCardTypePos = pos.myCardTypePos;
        this.listCardUIInfos = [];
        this.listSmallCardUIInfos = [];
        this.listImageSmallCardBack = [];

        for (let i = 0; i < 6; i++) {
            this.uirc.imageCards[i].imageCard.active = false;
            this.uirc.imageSmallCards[i].imageCard.active = false;
            this.uirc.imageSmallCardBacks[i].node.active = false;
        }

        for (let i = 0; i < GameCache.Instance.CurGame.HandCards; i++) {
            this.listCardUIInfos.push(this.uirc.imageCards[i]);
            this.listSmallCardUIInfos.push(this.uirc.imageSmallCards[i]);
            this.listImageSmallCardBack.push(this.uirc.imageSmallCardBacks[i]);
        }
        this.ResetShowCardsId();
    }
    InitUI() {
        this.StopAllActions();
        this.HideBubbleInsurance();
        this.HideBubbleInsuranceCountDown();
        this.HideReturnGame();
        this.HideCoinShadow();
        this.HideTrust();
        this.HideHeadCD();
    }


    //停止所有动作
    public StopAllActions() {
        this.uirc.imageIconChip.node.active = true;
        this.uirc.imageIconChip.node.stopAllActions();
        this.uirc.Head.stopAllActions();
        this.uirc.Head.scale = 1;
        this.uirc.transSmallCardBacks.stopAllActions();

        this.listImageSmallCardBack.forEach(item => {
            item.node.opacity = 255;
            item.node.stopAllActions();
        })
        this.uirc.imageRecyclingWinChip.node.stopAllActions();

        this.uirc.node.stopAllActions();
    }

    //刷新座位信息 dir方位 (0下,顺时针)
    public UpdateSeatUIInfo(dir: number): void {

        let info: seat_info = GameUtil.pos_config[GameCache.Instance.seat_count][dir];
        //GameUtil.SeatUIInfos[GameCache.Instance.seat_count][dir];
        this.PlayerCount = GameCache.Instance.seat_count;
        this.ClientSeatId = dir;
        this.seatUIInfo = info;
        this.ui.setPosition(info.seat_pos);
        this.uirc.imageBanker.setPosition(info.bank_pos);
        this.uirc.transSmallCardBacks.setPosition(info.card_back_pos);
        this.uirc.transCurRoundHaveBet.setPosition(info.bet_pos);
        // 蘑菇标位置：按座位方位设置
        if (this.uirc.MushroomPool || true) {
            const mushPos = info.mushroom_pos || cc.Vec3.ZERO;
            console.log(`======显示蘑菇s=${mushPos}============`);
            this.uirc.MushroomPool.setPosition(mushPos);
            this.uirc.MushroomPool.active = true;
            // this.ClearMushroomTag(); // 切换座位时先隐藏
        }

        if (this.IsMySeat) {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20090)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -455);
        }
        else {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20091)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -240);
        }


        //是自己座位设置筹码数量位置
        // if (this.IsMySeat) {//this.ClientSeatId == 0 && 
        //     this.uirc.textCoin.node.setPosition(0, -130);
        // } else {
        //     this.uirc.textCoin.node.setPosition(0, -90);
        // }

        //let mRectTransform = this.uirc.Image_Bubble;
        //mRectTransform.SetParent(transBubble);
        this.uirc.Image_Bubble.setPosition(info.bubble_pos);

        this.uirc.Image_BubbleInsuranceCountDown.setPosition(info.insurance_pos);

        if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
            // mRectTransform.localPosition = info.AoMaHaInsurancetoubaoPos;
        }
        else {
            //mRectTransform.localPosition = info.InsurancetoubaoPos;
        }
    }

    /// <summary>
    /// 播放发牌动画
    /// </summary> virtual Sequence 
    public PlayDealAnimation(delay: number, targetPos: cc.Vec3): cc.Tween {

        for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
            this.listCardUIInfos[i].imageSelect.node.active = false;
        }
        for (let i = 0, n = this.listSmallCardUIInfos.length; i < n; i++) {
            this.listSmallCardUIInfos[i].imageSelect.node.active = false;
        }

        let tween = cc.tween(this.deal_sequence_obj);

        tween.delay(delay);

        //自己发牌运动
        if (this.IsMySeat) {

            tween.then(cc.callFunc(() => {
                GC.sound.Play("sfx_desk_new_card");
            }));

            for (let i = 0, n = this.Player.cards.length; i < n; i++) {


                let cardInfo = this.listCardUIInfos[i];
                cardInfo.SetSpriteFrame(this.Player.cards[i]);
                //cardInfo.imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(this.Player.cards[i]));
                cardInfo.imageCard.color = cc.Color.WHITE;
                cardInfo.imageCard.setScale(.5);
                cardInfo.imageCard.setPosition(this.listCardUIInfos[i].imageCard.parent.convertToNodeSpaceAR(targetPos));
                cardInfo.imageCard.active = true;


                cardInfo.imageBack.spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(-1));
                cardInfo.imageBack.node.color = cc.Color.WHITE;
                cardInfo.imageBack.node.active = true;
                cardInfo.imageBack.node.opacity = 255;

                //listCardUIInfos[i].imageCard.rectTransform.localRotation = Quaternion.Euler(0, 0, 0);

                let tween_card = cc.tween(cardInfo.imageCard);
                let tween_back = cc.tween(cardInfo.imageBack.node);


                tween.then(cc.callFunc(() => {
                    tween_card.to(0.4, { scale: Seat.myCardsScale, position: Seat.myCardsPos[i] }, cc.easeQuadraticActionOut()).start();
                    //cc.easeSineOut()
                }))
                if (!GameCache.Instance.CurlimitDelaySeeCard) {
                    tween.then(cc.callFunc(() => {
                        tween_back.to(0.25, { opacity: 0 }).call(() => {
                            cardInfo.imageBack.node.active = false;
                        }).start();
                    }))
                }
            }
            tween.delay(0.4);

        } else {
            // 其他玩家发牌动画
            tween.then(cc.callFunc(() => {
                this.uirc.transSmallCardBacks.active = true;
                this.uirc.transSmallCardBacks.stopAllActions();
            }));

            let mLocalPos: cc.Vec3 = this.uirc.transSmallCardBacks.convertToNodeSpaceAR(targetPos);

            console.log("this.listImageSmallCardBack.length >> ", this.listImageSmallCardBack.length);

            for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {

                let mTmpObj: cc.Node = this.listImageSmallCardBack[i].node;
                let pos = this.GetBackSmallCardPos(i);
                mTmpObj.setPosition(mLocalPos);
                tween.then(cc.callFunc(() => {
                    GC.sound.Play("sfx_desk_new_card");
                    mTmpObj.active = true;
                    cc.tween(mTmpObj).to(0.4, { position: pos }, cc.easeQuadraticActionOut()).start();
                }))
            }
            tween.delay(0.4);
        }
        return tween;
    }

    /// <summary>
    /// 播放弃牌动画
    /// </summary>
    public PlayFoldAnimation(): void {
        //sequencePlayFoldAnimation = DOTween.Sequence();
        this.sequencePlayFoldAnimation = cc.tween(this.ui);
        if (!this.IsMySeat) {
            // 其他玩家弃牌
            //this.sequencePlayFoldAnimation.sequence();
            //InverseTransformPoint 世界转局部
            let sequence = [];
            let pos = this.uirc.transSmallCardBacks.parent.convertToNodeSpaceAR(GameCache.Instance.CurGame.GetRecyclingChipPosV3());
            sequence.push(
                cc.callFunc(() => {
                    cc.tween(this.uirc.transSmallCardBacks).to(.5, { position: pos }).start();
                },
                ));
            for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {
                //sequencePlayFoldAnimation.Join(listImageSmallCardBack[i].DOFade(0, 0.3f));
                sequence.push(
                    cc.callFunc(() => {
                        cc.tween(this.listImageSmallCardBack[i].node).to(0.3, { opacity: 0 }).start();
                    })
                );
            }
            sequence.push(cc.delayTime(.5));

            this.sequencePlayFoldAnimation.sequence.apply(this.sequencePlayFoldAnimation, sequence).call(() => {
                this.uirc.transSmallCardBacks.position = this.seatUIInfo.card_back_pos;
                for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {
                    this.listImageSmallCardBack[i].node.color = cc.Color.WHITE;
                    this.listImageSmallCardBack[i].node.opacity = 255;
                }
                this.uirc.transSmallCardBacks.active = false;

            }).start();
        }
        else {

        }
    }




    public UpdateVoiceprintState(voiceprintState: VoiceprintState, time: number = 0): void {
        this.SeatVoiceprintState = voiceprintState;
        switch (voiceprintState) {
            case VoiceprintState.None:
                this.HideAllVoiceprintState();
                break;
            case VoiceprintState.Start:
                if (time > 0) {
                    this.voiceprintTime = time;
                }
                this.ShowVoiceprintState(0);
                break;
            case VoiceprintState.Recording:
                if (time > 0) {
                    this.voiceprintTime = time;
                }
                this.ShowVoiceprintState(1);
                break;
            case VoiceprintState.Checking:
                this.ShowVoiceprintState(2);
                break;
            case VoiceprintState.Robot:
                this.ShowVoiceprintState(3);
                this.isStartHide = true;
                break;
            case VoiceprintState.Real:
                this.ShowVoiceprintState(4);
                this.isStartHide = true;
                break;
            case VoiceprintState.Voting:
                if (time >= 0 && this.Player != null) {
                    this.Player.UpdateStateTime = time;
                }
                this.ShowVoiceprintState(5);
                break;
            default:
                break;
        }
    }

    private ShowVoiceprintState(num: number): void {
        for (let i = 0; i < this.uirc.voiceprintList.length; i++) {
            this.uirc.voiceprintList[i].active = (num == i);
        }
    }
    private HideAllVoiceprintState(): void {
        if (this.uirc.voiceprintList?.length) {
            for (let i = 0; i < this.uirc.voiceprintList.length; i++) {
                if (this.uirc.voiceprintList[i] != null) {
                    this.uirc.voiceprintList[i].active = false;
                }
            }
        }
    }

    /// <summary>
    /// 刷新头像
    /// </summary>
    public UpdateHead(): void {
        if (null == this.Player) {
            this.uirc.imageEmpty.node.active = true;
            this.uirc.Frame_Head.active = false;
        }
        else {
            WebImageHelper.SetHeadImage(this.uirc.Raw_Head, this.Player.headPic);
        }
    }


    /// <summary>
    /// 刷新占座
    /// </summary>
    public UpdateRequesting() {
        this.uirc.TextRequesting.node.active = this.Player.KeepSeatLeftTime > 0;
        this.uirc.Text_Coin.node.active = this.Player.KeepSeatLeftTime <= 0;
        if (this.Player.KeepSeatLeftTime > 0) {
            this.uirc.TextRequesting.string = `${i18nMgr.Get("UITEXAS_PLAYERSEATDOWNTIPS01")}${Math.ceil(this.Player.KeepSeatLeftTime)}s`;
        }
    }
    //刷新昵称
    public UpdateNickName(): void {
        this.SetNickName(this.Player?.nick || "");
    }
    public SetNickName(name: string): void {
        let nick: string = `${GM.GetDebugSwitch(1) ? `:${this.seatID}` : ``}${name}`;
        this.uirc.Text_NickName.string = StringHelper.LengthNick(nick);
        //`${GM.GetDebugSwitch(1) ? `:${this.seatID}` : ``}${name}`;
    }
    public SetCoin(coin: string) {
        this.uirc.Text_Coin.string = coin;
    }

    /** 刷新座位蘑菇标识（庄家池） */
    public UpdateMushroomTag(pool: number, base: number, enabled: boolean): void {
        if (!this.uirc || !this.uirc.MushroomPool) {
            cc.log(`[MUSH-TAG] seat=${this.seatID} local=${this.ClientSeatId} missing MushroomPool`);
            return;
        }
        const show = enabled && this.isBank && pool > 0 && base > 0;
        // this.uirc.MushroomPool.active = show;
        this.uirc.MushroomPool.active = true;
        console.log(`======show=${show}==${this.ClientSeatId}==${this.seatID}============show:${show}`);
        const cnt = Math.floor(pool / base);
        console.log(`=======${this.ClientSeatId}==${this.seatID}============pool:${pool} base:${base}`);
        this.uirc.Label_MushroomCount && (this.uirc.Label_MushroomCount.string = `${88}`);
        this.uirc.Label_MushroomChip && (this.uirc.Label_MushroomChip.string = `${77}`);

        cc.log(`[MUSH-TAG] seat=${this.seatID} local=${this.ClientSeatId} show cnt=${cnt} chip=${pool}`);
    }

    /** 清理/隐藏蘑菇标识（换桌/重置时调用） */
    public ClearMushroomTag(): void {
        if (this.uirc?.MushroomPool) {
            this.uirc.MushroomPool.active = false;
        }
    }
    /// <summary>
    /// 刷新状态机，主要用户刷新冒泡
    /// </summary>
    public UpdateFSMbyStatus(isConnect = false): void {
        if (null == this.Player) {
            this.FsmLogicComponent.SM.ChangeState(SeatEmpty.Instance);
            return;
        }

        this.FsmLogicComponent.SM.ChangeState(SeatSit.Instance);

        this.UpdateBubble(false, isConnect);

        switch (this.Player.actionStatus) {
            case Def.Action.NONE:
                // 未操作过(显示名字)
                this.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
                break;
            case Def.Action.BET:
                // 下注

                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.CALL:
                // 跟注
                //this.UpdateCards();
                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.RAISE:
                // 加注

                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.ALLIN:
                // 全下

                this.UpdateCards();
                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.CHECK:
                // 让牌

                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;
            case Def.Action.FOLD:
                // 弃牌
                this.Player.isFold = true;
                this.FoldHeadGray(this.Player.isFold);
                this.UpdateCards();
                this.HideCardBack();
                this.FsmLogicComponent.SM.ChangeState(SeatWaitOther.Instance);
                break;

        }
        switch (this.Player.canPlayStatus) {
            case Def.CanPlayStatus.DISABLE:
                this.FsmLogicComponent.SM.ChangeState(SeatWaitStart.Instance);
                break;
            case Def.CanPlayStatus.NORMAL:
                break;
            case Def.CanPlayStatus.NEED_POST:
                break;
            case Def.CanPlayStatus.AGREE_POST:
                break;
            case Def.CanPlayStatus.KEEP_SEAT:
                this.FsmLogicComponent.SM.ChangeState(SeatKeep.Instance);
                break;
            default:
                break;
        }
    }



    private ShowBubbleBG(bubble_node: cc.Node, key: string) {
        bubble_node.children.forEach((item, index) => {
            if (index < 6) {
                item.active = false;
            }
        })
        let t_node = bubble_node.getChildByName(key);
        if (t_node) t_node.active = true;
    }


    /// <summary>
    /// 刷新气泡
    /// </summary>
    public UpdateBubble(isAllinShowVioce = false, isReconect = false): void {
        // 1.出现筹码时隐藏昵称
        // 2.操作提示与牌型提示，只出现一个则与头像居中对齐，出现两个则以居中对齐的线对称上下摆放

        // 1:下注  2:跟注  3:加注  4:全下 5:让牌  6:弃牌 10:straddle--客户端

        if (null == this.Player) {
            if (this.uirc.Image_Bubble.activeInHierarchy)
                this.uirc.Image_Bubble.active = false;
            return;
        }

        if (isReconect && !this.Player.RoundActioned) {
            return;
        }

        this.uirc.Image_Bubble.active = true;

        switch (this.Player.actionStatus) {
            case Def.Action.CALL:

                this.ShowBubbleBG(this.uirc.Image_Bubble, "call");
                // textBubble.text = "跟注";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10044);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.BET:
            case Def.Action.RAISE:
                this.ShowBubbleBG(this.uirc.Image_Bubble, "raise");

                // textBubble.text = "加注";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10045);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.ALLIN:
                this.ShowBubbleBG(this.uirc.Image_Bubble, "allin");
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(30074);
                this.uirc.textBubble.node.active = true;
                this.PlayAllinArmature(isAllinShowVioce);
                break;
            case Def.Action.CHECK:
                this.ShowBubbleBG(this.uirc.Image_Bubble, "check");
                // textBubble.text = "看牌";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10046);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.FOLD:
                this.ShowBubbleBG(this.uirc.Image_Bubble, "fold");

                // textBubble.text = "弃牌";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10047);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.STRADDLE:
                this.ShowBubbleBG(this.uirc.Image_Bubble, "straddle");
                this.uirc.textBubble.string = "Straddle";
                this.uirc.textBubble.node.active = false;
                this.StopAllinArmature();
                break;
            default:
                this.ShowBubbleBG(this.uirc.Image_Bubble, "null");
                this.uirc.textBubble.string = "";
                this.StopAllinArmature();
                break;
        }


        console.log("播放气泡")


        if (this.uirc.textBubble.string != "") {

            if (null == this.sequenceUpdateBubble || !this.sequenceUpdateBubble.IsPlaying)
                this.PlayUpdateBubbleAnimation();
        }
        else {
            if (this.sequenceUpdateBubble?.IsPlaying)
                this.sequenceUpdateBubble.Kill(true);
            this.uirc.Image_Bubble.setScale(cc.Vec3.ONE);
            this.uirc.Image_Bubble.active = false;
            this.sequenceUpdateBubble = null;
        }


        // if (this.uirc.textBubble.string = "") {
        //     this.uirc.Image_Bubble.setScale(cc.Vec3.ONE);
        //     this.uirc.Image_Bubble.active = false;
        //     this.sequenceUpdateBubble = null;
        //     this.UpdateNickName();
        // }
        // else {

        //     if (this.uirc.textBubble.string != "") {

        //         if (null == this.sequenceUpdateBubble || !this.sequenceUpdateBubble.IsPlaying)
        //             this.PlayUpdateBubbleAnimation();
        //     }
        //     else {
        //         if (this.sequenceUpdateBubble?.IsPlaying)
        //             this.sequenceUpdateBubble.Kill(true);
        //         this.uirc.Image_Bubble.setScale(cc.Vec3.ONE);
        //         this.uirc.Image_Bubble.active = false;
        //         this.sequenceUpdateBubble = null;
        //     }
        // }
    }


    /// <summary>
    /// 获取左边或者右边气泡
    /// </summary>
    /// <returns></returns>
    private GetRorL(): boolean {
        let isR = false;
        switch (this.ClientSeatId) {
            case 0:
                isR = false;
                break;
            case 1:
                isR = true;
                break;
            case 2:
                if (this.PlayerCount == 3) {
                    isR = false;
                }
                else {
                    isR = true;
                }
                break;
            case 3:
                if (this.PlayerCount == 4) {
                    isR = false;
                }
                else if (this.PlayerCount == 5) {
                    isR = false;
                }
                else {
                    isR = true;
                }
                break;
            case 4:
                if (this.PlayerCount == 5) {
                    isR = false;
                }
                else if (this.PlayerCount == 6) {
                    isR = false;
                }
                else {
                    isR = true;
                }
                break;
            case 5:
                isR = false;
                break;
            case 6:
                isR = false;
                break;
            case 7:
                isR = false;
                break;
            case 8:
                isR = false;
                break;

            default:
                isR = false;
                break;
        }
        return isR;
    }


    /// <summary>
    /// 刷新离线
    /// </summary>
    public UpdateOnOrOffLine(): void {
        let mEnumRoomType: RoomType = GameCache.Instance.room_type;
        if (mEnumRoomType == RoomType.MTTTexasHoldemStandardNoLimit) {
            this.uirc.imageOffline.active = false;
            return;
        }
        if (this.uirc.imageReserveSeat.activeInHierarchy) {
            this.uirc.imageOffline.active = false;
        }
        else {
            this.uirc.imageOffline.active = this.Player.isOffLine > 0 && !this.IsMySeat;
        }
    }


    /// <summary>
    /// 刷新本手下注筹码
    /// </summary>
    public UpdateCurRoundHaveBet(): void {

        if (GC.game.seatMoveStruct.moving) {
            GC.game.seatMoveStruct.cacheFuncs.push({ a: this, b: this.__UpdateCurRoundHaveBet, c: null, d: "__UpdateCurRoundHaveBet" });
        } else {
            this.__UpdateCurRoundHaveBet();
        }

    }

    private __UpdateCurRoundHaveBet() {
        // 0不显示
        if (null == this.Player || this.Player.anteNumber <= 0) {
            this.uirc.transCurRoundHaveBet.active = false;
            return;
        }

        if (this.isBig && GameCache.Instance.CurGame.cacheRound == Def.Round.PREFLOP) {
            //this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_big_chip");
            this.isBig = false;
        }
        else if (this.isSmall && GameCache.Instance.CurGame.cacheRound == Def.Round.PREFLOP) {
            this.isSmall = false;
            //this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_small_chip");
        }
        else {
            //this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");

        }
        // let str = StringHelper.FormatIntOrFloat1(this.Player.anteNumber / 100);

        // this.uirc.textCurRoundHaveBet.string = str;

        this.uirc.textCurRoundHaveBet.node.active = true;

        this.UpdateBet();

        this.uirc.imageIconChip.node.setPosition(cc.Vec3.ZERO);

        //this.uirc.imageIconChip.node.getPosition(this.defaultIconChipLocalPos);
        //this.defaultIconChipLocalPos = this.uirc.imageIconChip.node.position.clone();
        this.uirc.imageIconChip.node.active = true;

        //if (!GameCache.Instance.CurGame.SeatPlayRecord.SeatMove) {
        this.uirc.transCurRoundHaveBet.active = true;
        //}
    }



    /// <summary>
    /// 隐藏手牌
    /// </summary>
    public HideCards(list: CardUIInfo[]): void {
        for (let i = 0, n = list.length; i < n; i++) {
            list[i].imageCard.active = false;
        }
    }
    /// <summary>
    /// 隐藏手牌背面
    /// </summary>
    public HideCardBack(): void {
        this.uirc.transSmallCardBacks.active = false;
    }

    /// <summary>
    /// 刷新庄家标识
    /// </summary>
    public UpdateBanker(): void {
        this.uirc.imageBanker.active = this.isBank;
    }


    /// <summary>
    /// 刷新手牌
    /// </summary>
    public UpdateCards(isAllin: boolean = false): void {

        console.log("---UpdateCards---", this.id);

        if (GC.game.seatMoveStruct.moving) {
            GC.game.seatMoveStruct.cacheFuncs.push({ a: this, b: this.__UpdateCards, c: isAllin, d: "__UpdateCards" })

        } else {
            this.__UpdateCards(isAllin);
        }
    }

    private __UpdateCards(isAllin: boolean) {
        if (this.IsMySeat) {

            this.HideCards(this.listSmallCardUIInfos);
            this.HideCardBack();
            if (this.Player?.cards != null) {

                if (isAllin) {
                    this.UpdateImageBackActive();
                }

                let hadCard: boolean = false;
                if (this.Player.cards.length > 0 && this.Player.cards[0] > 0) {
                    //有牌必定显示
                    hadCard = true;
                }
                //主位位移中显示卡牌
                if (hadCard || this.Player.isPlaying) {

                    // if (GC.game.seatMoveStruct.moving) {

                    //     GameCache.Instance.CurGame.SeatPlayRecord.ShowCardsSeat = this;

                    // } else {

                    //     this.AfterMoveShowCards();
                    // }
                    for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
                        this.listCardUIInfos[i].imageCard.color = this.Player.isFold ? cc.Color.GRAY : cc.Color.WHITE;
                    }
                    this.ShowCards(this.listCardUIInfos);
                }
                else {
                    this.HideCards(this.listCardUIInfos);
                }
            }
            else {
                this.HideCards(this.listCardUIInfos);
            }
        }
        else {

            this.HideCards(this.listCardUIInfos);
            if (this.Player?.cards != null) {
                let mShow: boolean = false;
                for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                    if (this.Player.cards[i] > 0) {
                        mShow = true;
                        break;
                    }
                }

                if (this.Player.cards.length > 0 && mShow) {
                    this.ShowCards(this.listSmallCardUIInfos);

                    cc.tween(this.uirc.Image_Bubble).to(0.2, { scale: 0 }).call(() => {
                        this.uirc.Image_Bubble.active = false;
                    }).start();

                    this.HideCardBack();
                }
                else {
                    this.HideCards(this.listSmallCardUIInfos);
                    if (this.Player.isPlaying) {
                        this.ShowCardBack();
                    }
                    else {
                        this.HideCardBack();
                    }
                }
            }
            else {
                this.HideCards(this.listSmallCardUIInfos);
                this.HideCardBack();
            }
        }
    }

    /// <summary>
    /// 显示手牌
    /// </summary>
    protected ShowCards(list: CardUIInfo[]): void {

        let mUpdateStart = 0;
        let mUpdateEnd = 0;
        let mHideStart = 0;
        let mHideEnd = 0;

        if (this.Player?.cards != null) {
            if (this.Player.cards.length > list.length) {
                mUpdateStart = 0;
                mUpdateEnd = list.length;
            }
            else if (this.Player.cards.length < list.length) {
                mUpdateStart = 0;
                mUpdateEnd = this.Player.cards.length;

                mHideStart = mUpdateEnd + 1;
                mHideEnd = list.length;
            }
            else {
                mUpdateStart = 0;
                mUpdateEnd = this.Player.cards.length;
            }
        }

        try {
            for (let i = mUpdateStart; i < mUpdateEnd; i++) {
                if (this.IsMySeat) {
                    list[i].imageCard.setPosition(Seat.myCardsPos[i]);
                    //list[i].imageCard.transform.localRotation = Quaternion.Euler(myCardsRot[i]);
                }
                else {
                    list[i].imageCard.color = cc.Color.WHITE;
                    list[i].imageCard.setPosition(Seat.smallCardPos[i]);
                }
                let mCard = this.Player.cards[i];
                //list[i].imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(mCard));
                list[i].SetSpriteFrame(mCard);
                list[i].imageCard.active = true;
            }
        }
        catch (Exception) {

            // System.Text.StringBuilder logContent = new System.Text.StringBuilder();
            // if (Player == null) {
            //     logContent.Append(string.Format("Player == null:= {0},", "Player == null"));
            // }
            // if (Player.cards == null) {
            //     logContent.Append(string.Format("Player.cards == null:= {0},", "Player.cards == null"));
            // }
            // if (Player != null && Player.cards != null) {
            //     logContent.Append(string.Format("ShowCards:= {0},", Player.cards.Count));
            //     logContent.Append(string.Format("mUpdateStart:= {0},", mUpdateStart));
            //     logContent.Append(string.Format("mUpdateEnd:= {0},", mUpdateEnd));
            //     for (int i = 0; i < Player.cards.Count; i++)
            //     {
            //         logContent.Append(string.Format("Player.cards:= {0},", Player.cards[i]));
            //     }
            // }
            // Log.write(UnityEngine.LogType.Log, logContent.ToString());
        }
        for (let i = mHideStart; i < mHideEnd; i++) {
            list[i].imageCard.active = false;
        }
    }


    /// <summary>
    /// 显示手牌背面
    /// </summary>
    public ShowCardBack(): void {
        for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {
            this.listImageSmallCardBack[i].node.active = true;
            this.listImageSmallCardBack[i].node.setPosition(this.GetBackSmallCardPos(i));
            //listImageSmallCardBack[i].transform.localRotation = Quaternion.Euler(GetBackSmallCardRot(i));
        }

        this.uirc.transSmallCardBacks.setPosition(this.seatUIInfo.card_back_pos);
        this.uirc.transSmallCardBacks.active = true;
    }
    /// <summary>
    /// 播放下注动画
    /// </summary>
    public PlayBetAnimation(): cc.Tween {
        let pos = cc.v3();
        this.uirc.imageEmpty.node.getPosition(pos);
        this.uirc.imageIconChip.node.setPosition(GameUtil.ChangeToLocalPos(pos, this.ui, this.uirc.transCurRoundHaveBet));
        this.uirc.imageIconChip.node.active = true;
        return cc.tween(this.uirc.imageIconChip.node).to(.2, { position: this.defaultIconChipLocalPos }, cc.easeQuadraticActionOut()).start();
    }

    /// <summary>
    /// 播放庄家动画
    /// </summary>
    /// <returns>返回庄家标志运动时间</returns> 
    public PlayBankerAnimation(): number {


        let lastBankerIndex = GameCache.Instance.CurGame.lastBankerIndex;

        let lastBankerSeat = GameCache.Instance.CurGame.GetSeatByLocalSeatID(lastBankerIndex);

        if (lastBankerIndex == -1 || lastBankerIndex == this.seatID || lastBankerSeat == null) {
            return 0;
        }
        lastBankerSeat.uirc.imageBanker.active = false;

        //设置banker位置为上把庄家位置在当前节点内的相对位置，做运动准备

        let imageBanker: cc.Node = this.uirc.imageBanker;

        imageBanker.setPosition(GameUtil.ChangeToLocalPos(lastBankerSeat.seatUIInfo.bank_pos, lastBankerSeat.ui, this.ui));

        imageBanker.active = true;

        cc.tween(imageBanker).to(.3, { position: this.seatUIInfo.bank_pos }).start();

        return 0.3;

    }


    /// <summary>
    /// 播放回收筹码动画
    /// </summary>
    public PlayRecyclingChipAnimation(): cc.Tween {
        let tween = cc.tween(this.ui);
        if (this.uirc.imageIconChip.node.activeInHierarchy) {
            this.uirc.textCurRoundHaveBet.node.active = false;
            let pos = this.uirc.textCurRoundHaveBet.node.convertToNodeSpaceAR(GameCache.Instance.CurGame.GetRecyclingChipPosV3());
            GC.sound.Play('sfx_desk_move_chips');
            cc.tween(this.uirc.imageIconChip.node).to(.5, { position: pos }, cc.easeQuadraticActionOut()).call(() => {
                this.uirc.imageIconChip.node.active = false;
            }).start();
        }
        return tween;
    }


    /// <summary>
    /// 刷新前注
    /// </summary>
    public UpdateGroupBet(): void {

        let mOffset = 10;

        //this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");

        //let str = StringHelper.FormatIntOrFloat1(GameCache.Instance.CurGame.groupBet / 100);

        //this.uirc.textCurRoundHaveBet.string = str;

        this.UpdateBet(GameCache.Instance.CurGame.groupBet);

        this.uirc.textCurRoundHaveBet.node.active = true;
        //RectTransform mRectTransform = imageCurRoundHaveBetFrame.transform as RectTransform;
        //mRectTransform.sizeDelta = new Vector2(textCurRoundHaveBet.preferredWidth + imageIconChip.rectTransform.sizeDelta.x, mRectTransform.sizeDelta.y);

        let mTmpV3: cc.Vec2 = this.ui.getPosition();
        if (mTmpV3.x <= 0) {
            //textCurRoundHaveBet.alignment = TextAnchor.MiddleRight;
        }
        else {
            //textCurRoundHaveBet.alignment = TextAnchor.MiddleLeft;
        }
        // if (mTmpV3.y > GameUtil.SeatPosV3[0].y && mTmpV3.y < GameUtil.SeatPosV3[7].y) {
        //     if (mTmpV3.x < 0) {
        //         // 左
        //         //mRectTransform.pivot = new Vector2(0, 0.5f);
        //         //mRectTransform.localPosition = new Vector3(-mOffset, 0);
        //     }
        //     else if (mTmpV3.x > 0) {
        //         // 右
        //         //mRectTransform.pivot = new Vector2(1f, 0.5f);
        //         //mRectTransform.localPosition = new Vector3(mOffset, 0);
        //     }
        //     this.uirc.imageIconChip.node.setPosition(cc.Vec2.ZERO);
        // }
        // else {
        //     //mRectTransform.pivot = new Vector2(0, 0.5f);
        //     //mRectTransform.localPosition = new Vector3(-mRectTransform.sizeDelta.x / 2f - mOffset, mRectTransform.localPosition.y);
        //     this.uirc.imageIconChip.node.setPosition(cc.Vec2.ZERO);
        // }

        this.uirc.imageIconChip.node.setPosition(cc.Vec2.ZERO);
        ////this.uirc.imageIconChip.node.getPosition(this.defaultIconChipLocalPos);
        this.uirc.imageIconChip.node.active = true;
    }



    /// <summary>
    /// 刷新亮牌眼睛
    /// </summary>
    public UpdateShowCardsId(): void {
        if (null == this.Player || null == GameCache.Instance.CurGame.mainPlayer || GameCache.Instance.CurGame.mainPlayer.userID != this.Player.userID ||
            GameCache.Instance.CurGame.mainPlayer.seatID != this.seatID) {
            return;
        }

        for (let i = 0; i < this.showCardsId.length; i++) {
            this.listCardUIInfos[i].imageEye.node.active = this.showCardsId[i] == 1;
        }
    }

    /// <summary>
    /// 轮到自己操作隐藏头像名字
    /// </summary>
    public SetOperationHeadActive(istrue: boolean): void {
        // if (istrue) {
        //     this.uirc.imageBanker.active = this.isBank;
        // }
        // this.uirc.imageHeadFrame.node.active = istrue;
        // this.uirc.Text_NickName.node.active = !this.IsMySeat;
        this.uirc.Frame_Head.active = istrue;
        this.uirc.Text_NickName.node.active = istrue;

        console.log("SetOperationHeadActive", istrue);
    }



    /// <summary>
    /// 停止allin动画
    /// </summary>
    public StopAllinArmature(): void {
        // if (null != this.armatureAllin.dragonAnimation && armatureAllin.dragonAnimation.isPlaying)
        //     armatureAllin.dragonAnimation.Stop();
        // armatureAllin.gameObject.SetActive(false);
    }

    /// <summary>
    /// 停止赢牌头像动画
    /// </summary>
    public StopWinArmature(): void {
        // armatureYouWin.gameObject.SetActive(false);
        // transWinner.gameObject.SetActive(false);
        // Image_OtherWinnerCardType.gameObject.SetActive(false);
        // Image_OtherWinner.gameObject.SetActive(false);
        // imageWinner.gameObject.SetActive(false);
        this.uirc.Spine_Winner.node.active = false;

    }
    /// <summary>
    /// 开始倒计时
    /// </summary>
    /// <param name="countDown"></param>
    public StartCountDown(countDown: number, isInsruance: boolean = false): void {


        console.log("StartCountDown :: ", countDown);

        this.optCurTime = countDown;

        let defaultOpTime: number = GameCache.Instance.CurGame.GetOpTime();
        if (isInsruance)
            defaultOpTime = 30;
        if (countDown > defaultOpTime) {
            defaultOpTime = countDown;
        }
        this.optTotalTime = defaultOpTime;

        this.ShowHeadCD();
        this.uirc.Head_CD_Mask.fillRange = this.optCurTime / defaultOpTime;
        this.uirc.Head_CD_Label.string = `${this.optCurTime}s`;
        //this.StopLightArmature();
    }

    /// <summary>
    /// 停止倒计时
    /// </summary>
    public StopCountDown(): void {
        //if (this.isCountDown) {

        this.HideHeadCD();
        //}
        //this.StopLightArmature();
    }


    /// <summary>
    /// 显示保险冒泡
    /// </summary>
    public ShowBubbleInsuranceCountDown(): void {
        if (null == this.Player || GameCache.Instance.CurGame.mainPlayer.userID == this.Player.userID) {
            return;
        }
        // textBubbleInsuranceCountDown.text = $"购买剩余{Player.timeLeft_insurance}秒";
        this.uirc.Image_BubbleInsuranceCountDown.active = true;
        this.uirc.Text_BubbleInsuranceCountDown.string = `${CPErrorCode.LanguageDescription(10298)} ${this.Player.timeLeft_insurance < 0 ? 0 : this.Player.timeLeft_insurance}s`;
        this.HideBubbleInsurance();
    }

    public UpdateImageBackActive(istrue: boolean = false): void {
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            //if (listCardUIInfos[i].imageBack.gameObject.activeInHierarchy)
            //{
            this.listCardUIInfos[i].imageBack.node.active = istrue;
            //}
        }
    }

    /// <summary>
    /// 刷新手牌牌型高亮
    /// </summary>
    /// <param name="type"></param>
    /// <param name="hightCards"></param>
    public UpdateCardType(type: CardType, hightCards: number[], isGameend = false): void {
        if (this.Player == null || GameCache.Instance.CurGame.GetPublicCardsCount(1) == 0 || this.CardsCount() == 0) {
            this.uirc.imageCardType.node.active = false;
            this.uirc.imageSmallCardType.node.active = false;
            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                this.listCardUIInfos[i].imageSelect.node.active = false;
            }
            return;
        }

        if (this.IsMySeat) {
            this.uirc.imageSmallCardType.node.active = false;
            this.uirc.textCardType.string = CardTypeUtil.GetCardTypeName(type);

            this.uirc.imageCardType.node.active = true;
            this.uirc.imageCardType.node.setPosition(Seat.myCardTypePos[0]);
            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                this.listCardUIInfos[i].imageSelect.node.active = false;
                if (isGameend) {
                    this.listCardUIInfos[i].imageCard.color = cc.Color.GRAY;
                }

                for (let j = 0, m = hightCards.length; j < m; j++) {
                    if (this.Player.cards[i] == hightCards[j]) {
                        if (isGameend) {
                            this.listCardUIInfos[i].imageCard.color = cc.Color.WHITE;
                            this.listCardUIInfos[i].imageCard.setPosition(cc.v3(this.listCardUIInfos[i].imageCard.position.x, this.listCardUIInfos[i].imageCard.position.y));//+40奥马哈两个手牌上移
                            this.listCardUIInfos[i].imageSelect.node.active = false;
                        }
                        else {
                            this.listCardUIInfos[i].imageSelect.node.active = true;
                        }
                        break;
                    }
                }
            }
        }
        else {
            this.uirc.imageCardType.node.active = false;
            this.uirc.textSmallCardType.string = CardTypeUtil.GetCardTypeName(type);


            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                this.listSmallCardUIInfos[i].imageSelect.node.active = false;

            }
        }
    }


    /// <summary>
    /// 隐藏手牌牌型高亮
    /// </summary>
    public HideCardType(): void {
        if (null == this.Player || null == this.Player.cards)
            return;

        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            this.listSmallCardUIInfos[i].imageCard.color = cc.Color.WHITE;
            this.listCardUIInfos[i].imageSelect.node.active = false;
        }
        this.uirc.imageSmallCardType.node.active = false;
        this.uirc.imageCardType.node.active = false;
    }

    /// <summary>
    /// 可见手牌数量
    /// </summary>
    public CardsCount(): number {
        let iCount = 0;
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            if (this.Player.cards[i] != -1) {
                iCount++;
            }
        }
        return iCount;
    }


    protected GetBackSmallCardPos(index: number): cc.Vec3 {
        return Seat.backSmallCardPos[index];
    }

    protected GetBackSmallCardRot(index: number): cc.Vec3 {
        return Seat.backSmallCardRot[index];
    }

    //刷新座位下的等待文本
    public UpdateWaiteNextTips(ishow: boolean): void {
        if (this.IsMySeat) {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20090)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -455);
        }
        else {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20091)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -240);
        }
        if (GameCache.Instance.GameStatus == 1) {
            this.uirc.WaitforthenextmoveTips.node.active = ishow;
        }
    }



    public get IsMySeat(): boolean {
        if (null == this.Player) {
            return false;
        }
        return this.Player.userID == GameCache.Instance.CurGame.mainPlayer.userID && this.seatID == GameCache.Instance.CurGame.mainPlayer.seatID;
    }


    public FoldHeadGray(active: boolean): void {
        this.uirc.Gray_Head.active = active;
        if (this.IsMySeat) {
            let mCardUiInfo: CardUIInfo = null;
            for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
                mCardUiInfo = this.listCardUIInfos[i];
                if (null == mCardUiInfo)
                    continue;

                mCardUiInfo.imageSelect.node.active = false;

                mCardUiInfo.imageCard.color = active ? cc.Color.GRAY : cc.Color.WHITE;
            }
        }
    }

    /// <summary>
    /// 播放allin动画
    /// </summary>
    public PlayAllinArmature(isAllinShowVoice = false): void {
        if (isAllinShowVoice) {
            GC.sound.Play('sfx_desk_allin');
        }
        // armatureAllin.gameObject.SetActive(true);
        // if (null != armatureAllin.dragonAnimation) {
        //     armatureAllin.dragonAnimation.Reset();
        //     armatureAllin.dragonAnimation.Play();
        // }
    }
    /// <summary>
    /// 播放赢牌头像特效
    /// </summary>
    public PlayWinArmature(): void {

        // this.UpdateWinCoin();

        // if (!Player.isWin) {
        //     return;
        // }
        // transWinner.gameObject.SetActive(true);
        // if (IsMySeat) {
        //     armatureYouWin.gameObject.SetActive(true);
        // }
        // else {
        //     armatureYouWin.gameObject.SetActive(false);
        // }
        if (this.Player.isWin) {
            this.uirc.Spine_Winner.node.active = true;
            this.uirc.Spine_Winner.setAnimation(0, "animation", false);
            this.uirc.Spine_Winner.setCompleteListener(() => {
                //cc.log("动画结束");
                this.StopWinArmature();
            })
        }
    }

    /// <summary>
    /// 刷新回收赢的筹码
    /// </summary>
    public UpdateRecyclingWinChip(): void {
        //this.uirc.imageRecyclingWinChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");
    }


    /// <summary>
    /// 操作延时
    /// </summary>
    public AddOperationTime(addTime: number): void {
        this.optCurTime += addTime;
        this.optTotalTime = this.optCurTime;
        if (!this.isCountDown && !this.IsMySeat) {
            this.AddCountDown(addTime);
        }
    }
    /// <summary>
    /// 增加倒计时时间
    /// </summary>
    /// <param name="addValue"></param>
    public AddCountDown(addValue: number): void {
        this.ShowHeadCD();
        this.uirc.Head_CD_Mask.fillRange = 1;
        this.uirc.Head_CD_Label.string = `${addValue}s`;
        this.StopLightArmature();
    }
    /// <summary>
    /// 停止关点动画
    /// </summary>
    public StopLightArmature(): void {
        // if (null != armatureLight.dragonAnimation && armatureLight.dragonAnimation.isPlaying)
        //     armatureLight.dragonAnimation.Stop();
        // armatureLight.gameObject.SetActive(false);
    }

    /// <summary>
    /// 隐藏气泡
    /// </summary>
    public HideBubble(): void {
        if (this.uirc.Image_Bubble.activeInHierarchy) {
            if (null == this.sequenceUpdateBubble || !this.sequenceUpdateBubble.IsPlaying) {
                //this.uirc.imageBubble.node.color = cc.Color.WHITE;
                this.uirc.Image_Bubble.setScale(1, 1);
            }
        }
        this.tweenerHideBubble = { tween: cc.tween(this.uirc.Image_Bubble), IsPlaying: true }
        let tween = this.tweenerHideBubble.tween;
        tween.to(.2, { scale: 0 })
        tween.delay(1);
        tween.call(() => {
            this.uirc.Image_Bubble.active = false;
            this.UpdateNickName();
            this.tweenerHideBubble.IsPlaying = false;
        });
        tween.start();
        // if (this.uirc.Image_BubbleInsuranceNum.gameObject.activeInHierarchy) {
        //     this.uirc.Image_BubbleInsuranceNum.gameObject.SetActive(false);
        // }
        // if (this.uirc.Image_BubbleInsuranceToubao.gameObject.activeInHierarchy) {
        //     this.uirc.Image_BubbleInsuranceToubao.gameObject.SetActive(false);
        // }
        this.HideBubbleInsurance();
        this.HideBubbleInsuranceCountDown();
    }


    /// <summary>
    /// 播放赢了回收筹码动画
    /// </summary>
    public get CanPlayRecyclingWinChipAnimation(): boolean {
        return this.uirc.imageIconChip.node.activeInHierarchy;
    }

    /// <summary>
    /// 播放赢了回收筹码动画
    /// </summary>
    /// <returns></returns> Tweener
    public PlayRecyclingWinChipAnimation(sourcePos: cc.Vec3): any {

        this.tweenerPlayRecyclingWinChipAnimation = null;

        if (this.Player.recyclingChip > 0)//回收筹码大于零时，执行动画
        {

            let imageRecyclingWinChip = this.uirc.imageRecyclingWinChip;

            imageRecyclingWinChip.node.setPosition(imageRecyclingWinChip.node.parent.convertToNodeSpaceAR(sourcePos));

            this.tweenerPlayRecyclingWinChipAnimation = { tween: cc.tween(imageRecyclingWinChip.node) };

            let tween = this.tweenerPlayRecyclingWinChipAnimation.tween;

            tween.then(cc.callFunc(() => {
                imageRecyclingWinChip.node.active = true;
            }));
            let pos = GameUtil.ChangeToLocalPos(this.uirc.Frame_Head.position, this.uirc.Frame_Head.parent, this.ui);
            tween.to(.5, { position: pos }, cc.easeQuadraticActionOut());
            tween.call(() => {
                imageRecyclingWinChip.node.active = false;
                this.tweenerPlayRecyclingWinChipAnimation.IsPlaying = false;
            });

            (this.tweenerPlayRecyclingWinChipAnimation as any).duration = 0.5;
        }
        return this.tweenerPlayRecyclingWinChipAnimation;
    }


    /// <summary>
    /// 播放更新气泡动画
    /// </summary>
    protected PlayUpdateBubbleAnimation(): void {
        this.sequenceUpdateBubble = { tween: cc.tween(this.uirc.Image_Bubble), IsPlaying: true };
        let tween = this.sequenceUpdateBubble.tween;
        this.uirc.Image_Bubble.setScale(.8, .8);
        this.uirc.Image_Bubble.opacity = 0;
        //自己仅有弃牌的图标可见
        this.uirc.Image_Bubble.active = (!(this.IsMySeat && this.Player.actionStatus != Def.Action.FOLD));
        tween.parallel(cc.scaleTo(.2, 1, 1), cc.fadeTo(0.1, 255));
        tween.to(.1, { scale: 0.95 });
        tween.to(.1, { scale: 1 });
        tween.call(() => {
            this.sequenceUpdateBubble.IsPlaying = false;
        })
        tween.start();
    }
    /// <summary>
    /// 显示返回游戏、留座
    /// </summary>
    public ShowReturnGame(): void {

        if (this.Player.keepSeatReason == Def.KeepSeatReason.KSR_TAKE_SEAT) {
            return;
        }
        this.bKeepSeatCounting = true;

        if (GameCache.Instance.CurGame.mainPlayer.userID == this.Player.userID) {
            this.uirc.buttonCancelReserveSeat.active = true;
        }
        this.uirc.imageReserveSeat.active = true;

    }
    /// <summary>
    /// 隐藏返回游戏、留座
    /// </summary>
    public HideReturnGame(): void {
        this.bKeepSeatCounting = false;
        this.uirc.buttonCancelReserveSeat.active = false;
        this.uirc.imageReserveSeat.active = false;
    }



    /// <summary>
    /// 隐藏保险冒泡
    /// </summary>
    public HideBubbleInsuranceCountDown(): void {
        this.uirc.Image_BubbleInsuranceCountDown.active = false;
    }
    public HideBubbleInsurance(): void {
        //if (imageBubbleInsurance.gameObject.activeInHierarchy) {
        //  imageBubbleInsurance.gameObject.SetActive(false);
        //}
    }
    public HideFold() {
        this.uirc.Image_Bubble.active = false;
    }

    /// <summary>
    /// 本轮结束，清理数据。（不是全部数据清空，只需要缓存一手的数据清空）
    /// </summary>
    public ClearRoundEndData(): void {
        if (null != this.Player) {
            this.Player.ClearRoundEndData();
        }
        this.isSmall = false;
        this.isBig = false;
        this.isBank = false;
        this.isStraddle = false;
        this.optCurTime = 0;
        this.optTotalTime = 0;
        //this.isCountDown = false;
        this.StopCountDown();
        this.defaultIconChipLocalPos = cc.Vec3.ZERO;
    }

    /// <summary>
    /// 清空本手下注筹码
    /// </summary>
    public ClearCurRoundHaveBet(): void {
        this.uirc.textCurRoundHaveBet.string = "";
        this.uirc.transCurRoundHaveBet.active = false;
    }
    /// <summary>
    /// 清空数据
    /// </summary>
    public ClearData(): void {
        this.ClientSeatId = -1;
        this.seatID = -1;
        if (null != this.Player) {
            this.Player.Dispose();
            this.Player = null;
        }
        this.isSmall = false;
        this.isBig = false;
        this.isBank = false;
        this.isStraddle = false;
        this.keepSeatLeftTime = 0;

        this.optCurTime = 0;
        this.optTotalTime = 0;
        //this.isCountDown = false;
        this.StopCountDown();
        this.defaultIconChipLocalPos = cc.Vec3.ZERO;
        this.bKeepSeatCounting = false;
        this.keepSeatDeltaTime = 0;
        this.voiceprintTime = 0;
        this.UpdateVoiceprintState(VoiceprintState.None);
        this.HideReturnGame();
        this.HideCardBack();
        this.HideHeadCD();
    }
    /// <summary>
    /// 删除所有Tweener动画
    /// </summary>
    /// <param name="complete">true马上设置为结束值</param>
    public KillAllTweener(complete = false): void {
        if (null != this.tweenerPlayRecyclingWinChipAnimation && this.tweenerPlayRecyclingWinChipAnimation.IsPlaying) {
            this.tweenerPlayRecyclingWinChipAnimation.Kill?.(complete);
        }
        this.tweenerPlayRecyclingWinChipAnimation = null;

        // if (null != sequencePlayRecyclingChipAnimation && sequencePlayRecyclingChipAnimation.IsPlaying()) {
        //     sequencePlayRecyclingChipAnimation.Kill(complete);
        // }

        // sequencePlayRecyclingChipAnimation = null;

        // if (null != sequencePlayDealAnimation && sequencePlayDealAnimation.IsPlaying()) {
        //     sequencePlayDealAnimation.Kill(complete);
        // }

        // sequencePlayDealAnimation = null;

        // if (null != sequenceSitAnimationEnter && sequenceSitAnimationEnter.IsPlaying()) {
        //     sequenceSitAnimationEnter.Kill(complete);
        // }

        // sequenceSitAnimationEnter = null;

        // if (null != sequenceStandupAnimationEnter && sequenceStandupAnimationEnter.IsPlaying()) {
        //     sequenceStandupAnimationEnter.Kill(complete);
        // }

        // sequenceStandupAnimationEnter = null;

        // if (null != tweenerPlayBankerAnimation && tweenerPlayBankerAnimation.IsPlaying()) {
        //     tweenerPlayBankerAnimation.Kill(complete);
        // }

        // tweenerPlayBankerAnimation = null;

        // if (null != tweenerPlayBetAnimation && tweenerPlayBetAnimation.IsPlaying()) {
        //     tweenerPlayBetAnimation.Kill(complete);
        // }

        // tweenerPlayBetAnimation = null;

        // if (null != sequencePlayFoldAnimation && sequencePlayFoldAnimation.IsPlaying()) {
        //     sequencePlayFoldAnimation.Kill(complete);
        // }

        // sequencePlayFoldAnimation = null;

        // if (null != this.sequenceUpdateBubble && sequenceUpdateBubble.IsPlaying()) {
        //     sequenceUpdateBubble.Kill(complete);
        // }

        // sequenceUpdateBubble = null;

        // if (null != tweenerHideBubble && tweenerHideBubble.IsPlaying()) {
        //     tweenerHideBubble.Kill(complete);
        // }

        // tweenerHideBubble = null;

        // if (null != tweenerUpdateBubbleInsurance && tweenerUpdateBubbleInsurance.IsPlaying()) {
        //     tweenerUpdateBubbleInsurance.Kill(complete);
        // }

        // tweenerUpdateBubbleInsurance = null;
    }

    Dispose() {
        this.KillAllTweener();
        this.ClearData();
        this.StopAllActions();
        this.ui = null;
        this.SeatFSM = null;
        GC.uc.RemoveComponent(this.FsmLogicComponent);
    }
    /// <summary>
    /// 设置声纹状态按钮要到达的位置
    /// </summary>
    public SetVoiceStatePositon() {
        this.voiceStatePositon = GameUtil.Seat_ElementPos[GameCache.Instance.CurGame.HandCards].voiceStatePositon;
    }
    // 刷新购买保险数量
    public UpdateBubbleInsurance() {
        this.HideHeadCD();
        //不保
        if (this.Player.totalInsuredAmount + this.Player.autoInsuredAmount == 0) {
            this.uirc.Image_BubbleInsuranceNum.active = !this.IsMySeat;
            this.uirc.Image_BubbleInsuranceNum.getChildByName("Text").getComponent(cc.Label).string = CPErrorCode.LanguageDescription(10049);
        }
        else {
            this.uirc.Image_BubbleInsuranceToubao.active = !this.IsMySeat;
            if (this.Player.autoInsuredAmount > 0) {
                this.uirc.Image_BubbleInsuranceToubao.getChildByName("Text").getComponent(cc.Label).string = CPErrorCode.LanguageDescription(20058, [StringHelper.GetLongString(this.Player.totalInsuredAmount), StringHelper.GetLongString(this.Player.autoInsuredAmount)]);
            }
            else {
                this.uirc.Image_BubbleInsuranceToubao.getChildByName("Text").getComponent(cc.Label).string = CPErrorCode.LanguageDescription(20059, [StringHelper.GetLongString(this.Player.totalInsuredAmount)]);
            }
        }
        this.CloseInsuranceBaoBubaoBubble();

    }
    private async CloseInsuranceBaoBubaoBubble() {
        await TimeHelper.Sleep(2000);
        if (this.uirc.Image_BubbleInsuranceNum.activeInHierarchy) {
            this.uirc.Image_BubbleInsuranceNum.active = false;
        }
        if (this.uirc.Image_BubbleInsuranceToubao.activeInHierarchy) {
            this.uirc.Image_BubbleInsuranceToubao.active = false;
        }
    }
    //刷新猎人头奖励
    public UpdateHunterAward() {
        if (null == this.Player || this.IsMySeat) {
            this.uirc.Image_CoinShadow.active = false;
            return;
        }
        let value = this.Player.HunterHeadValue + this.Player.HunterKillAwardOther + this.Player.MttHunterKillAwardOtherPlus;
        this.uirc.Image_CoinShadow.active = value > 0;
        this.uirc.Image_CoinShadow.getChildByName("Text").getComponent(cc.Label).string = StringHelper.GetLongString(value);

        if (UIMTTModel.Instance.MttInfo.mtt != null) {
            this.uirc.Image_CoinShadow.getChildByName("uc").active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 1;
            this.uirc.Image_CoinShadow.getChildByName("gc").active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 2;
        }
    }

    //////////////////////////////////////

    public ResetShowCardsId(): void {
        if (this.showCardsId == null) {
            this.showCardsId = [];
        }
        else {
            this.showCardsId.length = 0;
        }
        for (let i = 0; i < GameCache.Instance.CurGame.HandCards; i++) {
            this.showCardsId.push(0);
        }

    }

    //隐藏猎人头标记
    public HideCoinShadow() {
        this.uirc.Image_CoinShadow.active = false;
    }
    //隐藏托管
    public HideTrust() {
        this.uirc.Image_Trust.active = false;
    }
    // 刷新托管
    public UpdateTrust() {
        this.uirc.Image_Trust.active = this.Player.IsAutoOp;
    }
    //显示头像CD
    ShowHeadCD() {
        this.uirc.Head_CD.active = true;
        this.isCountDown = true;
    }
    //隐藏头像CD
    HideHeadCD() {
        this.uirc.Head_CD.active = false;
        this.isCountDown = false;
    }

    //刷新座位下方筹码数
    public UpdateCoin(): void {

        if (this.Player?.chips >= 0) {
            this.SetCoin(GameUtil.TransBetValue(this.Player.chips));
        } else {
            this.SetCoin("");
        }
        if (this.IsMySeat) {
            this.uirc.Coin_Con.setPosition(GameUtil.SeatGoldPos[1]);
        } else {
            this.uirc.Coin_Con.setPosition(GameUtil.SeatGoldPos[0]);
        }

        console.log("刷新下方筹码位置");

    }
    //刷新下注的筹码数
    public UpdateBet(bet: number = -1) {
        let value = bet > -1 ? bet : this.Player?.anteNumber || 0;
        this.uirc.textCurRoundHaveBet.string = GameUtil.TransBetValue(value);
    }

}
export interface SeatUIInfo {
    Pos: cc.Vec3;
    BankerPos: cc.Vec3;
    CardBackPos: cc.Vec3;
    CardBackRot: cc.Vec3;
    CardsPos: cc.Vec3;
    CurRoundHaveBetPos: cc.Vec3;
    BubblePos: cc.Vec3;
    InsurancePos: cc.Vec3;
    AoMaHaInsurancePos: cc.Vec3;
    InsurancebubaoPos: cc.Vec3;
    AoMaHaInsurancebubaoPos: cc.Vec3;
    InsurancetoubaoPos: cc.Vec3;
    AoMaHaInsurancetoubaoPos: cc.Vec3;
}

