/// <summary>
/// 声纹状态
import GC from '../../frame/GameControl';
import { GM } from '../../gm/GMAPI';
import { StringHelper } from '../../helper/StringHelper';
import TimeHelper from '../../helper/TimeHelper';
import WebImageHelper from '../../helper/WebImageHelper';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import { i18nMgr } from '../../i18n/i18nMgr';
// import { UIMTTModel } from "../../new_mtt/UIMTTModel";
import { Def } from '../../protobuf/holdem/define_pb';
import AssetContext, { AssetFold } from '../../ui/component/AssetContext';
import { CardType, CardTypeUtil } from '../CardTypeUtil';
import { CPlayer } from '../CPlayer';
import FSMLogicComponent from '../FSMLogicComponent';
import { GameCache } from '../GameCache';
import { SeatFSM } from '../SeatFSM';
import { SeatEmpty, SeatKeep, SeatSit, SeatWaitOther, SeatWaitStart } from '../SeatStateHandler';
import SeatUIRC, { CardUIInfo } from '../SeatUIRC';
import GameUtil, { RoomType, seat_info, some_pos } from '../util/GameUtil';
import { sampleLiveBounds, getAnimDuration } from '../util/SpineBoundsUtil';
import TexasGameUtils from '../util/TexasGameUtils';

/// </summary>
export enum VoiceprintState {
    None,
    Start, //发起验证
    Recording, //录入中
    Voting, //投票中
    Checking, //等待审核
    Robot, //被验证是机器人
    Real //被验证是真人
}
const LN = '[Seat]';

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
    public FsmLogicComponent: FSMLogicComponent = null; //状态机
    public ClientSeatId: number = 0; // 客户端当前的方位座位号(0最下方,顺时针)
    public seatID: number = 0; // 服务器座位号
    public Player: CPlayer = null; // 玩家信息
    public isSmall: boolean = false; // 是否小盲
    public isBig: boolean = false; // 是否大盲
    public isBank: boolean = false; // 是否庄家
    public isStraddle: boolean = false; // 是否Straddle
    public keepSeatLeftTime: number = 0; // 留座剩余时间（s）
    public ranking: number = 0; //玩家排名(mtt)
    private voiceprintTime: number = 0;
    private OriginalVoicePos: cc.Vec3 = null;
    //private Transform OriginalVoiceObj;
    public optCurTime: number = 0;
    public optTotalTime: number = 0;
    public isCountDown: boolean = false;
    public seatUIInfo: seat_info = null;
    protected PlayerCount: number = 0; //最大人数
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
    tweenerPlayRecyclingWinChipAnimation: { tween?: cc.Tween; complete?: Function; IsPlaying?: boolean; Kill?: Function } = null;
    sequenceUpdateBubble: { tween?: cc.Tween; complete?: Function; IsPlaying?: boolean; Kill?: Function } = null;
    tweenerHideBubble: { tween?: cc.Tween; complete?: Function; IsPlaying?: boolean; Kill?: Function } = null;
    IsDisposed: boolean = false;
    // All In Spine 动画节点
    private _allinSpineNode: cc.Node = null;
    // 自己赢的 YouWin Spine 动画节点
    private _youwinSpineNode: cc.Node = null;
    // 他人赢的 OtherWin Spine 动画节点
    private _otherWinSpineNode: cc.Node = null;
    // 表情动画节点（头像正上方）
    private _emojiAnimNode: cc.Node = null;
    /** 座位整体缩放（缩小座位圈/头像/筹码等，1=原始大小，按需微调）*/
    public static readonly SEAT_SCALE = 0.82;
    /** 表情统一目标尺寸（像素，包围盒较大边缩放到此值，使所有表情高宽一致；按需微调）*/
    private static readonly EMOJI_ANIM_TARGET_SIZE = 260;
    /** 兜底缩放（无法取包围盒时使用）*/
    private static readonly EMOJI_ANIM_SCALE = 0.6;
    /** 表情动画底部相对头顶的间隙（越大越靠上，避免遮挡头像）*/
    private static readonly EMOJI_ANIM_BOTTOM_GAP = 10;
    /** 表情动画停留时长（秒），之后淡出 */
    private static readonly EMOJI_ANIM_HOLD = 5.0;
    /** 表情语音叠加层音量（0~1）：主层 1.0 + 此层 ≈ 整体响度倍数，越大越响（文件本身偏小，叠加提升）*/
    private static readonly EMOJI_SOUND_BOOST = 0.5;
    /** YouWin 胜利动画目标尺寸（像素，包围盒较大边缩放到此值；新骨骼原始尺寸过大，按需微调）*/
    private static readonly YOUWIN_TARGET_SIZE = 620;
    /** OtherWin（他人赢）胜利动画目标尺寸（像素，对手头像较小，取值更小；按需微调）*/
    private static readonly OTHERWIN_TARGET_SIZE = 330;
    /** OtherWin 动画底部相对头顶的间隙（越大越靠上，越小/负值越往下压向头像）*/
    private static readonly OTHERWIN_BOTTOM_GAP = -60;
    // 其他玩家 Spine_Winner 原始 y（播放 win 动画时上移 60px 避免盖住放大的牌面）
    private _spineWinnerOrigY: number = null;
    private _bubbleInsuranceCountDownHomeParent: cc.Node = null;
    private _bubbleInsuranceCountDownHomeSiblingIndex: number = -1;
    private _bubbleInsuranceCountDownHomeZIndex: number = 0;
    // 静态缓存 SkeletonData（所有座位共享）
    private static _allinSelfSkeletonData: sp.SkeletonData = null;
    private static _allinOtherSkeletonData: sp.SkeletonData = null;
    private static _youwinSkeletonData: sp.SkeletonData = null;
    private static _otherWinSkeletonData: sp.SkeletonData = null;

    constructor(
        public id: number,
        public ui: cc.Node
    ) {
        this.SeatFSM = new SeatFSM(id, this);
        this.uirc = ui.getComponent(SeatUIRC);
        this.uirc.seat = this;
        GC.uc.AddComponent((this.FsmLogicComponent = new FSMLogicComponent(this.SeatFSM)));
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
        this.RefreshNickCoinVisible(false);
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
        });
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
        // 小屏适配：加上 y 偏移量，防止底部头像被 main_menu 遮挡
        const pos = cc.v3(info.seat_pos.x, info.seat_pos.y + some_pos.seatYOffset, info.seat_pos.z);
        this.ui.setPosition(pos);
        // 缩小座位整体尺寸（圈/头像/筹码随节点统一缩放，位置不变）
        this.ui.setScale(Seat.SEAT_SCALE);
        this.uirc.imageBanker.setPosition(info.bank_pos);
        this.uirc.transSmallCardBacks.setPosition(info.card_back_pos);
        this.uirc.transCurRoundHaveBet.setPosition(info.bet_pos);
        this.RefreshCurRoundHaveBetContentPos(info.bet_pos);
        // 蘑菇标位置：按座位方位设置
        if (this.uirc.MushroomPool) {
            const mushPos = info.mushroom_pos || cc.Vec3.ZERO;
            this.uirc.MushroomPool.setPosition(mushPos);
            if (this.uirc.MushroomLabel) {
                this.uirc.MushroomLabel.setPosition(info.mushroom_label_pos || cc.Vec3.ZERO);
            }
            if (this.uirc.MushroomChip) {
                this.uirc.MushroomChip.setPosition(info.mushroom_chip_pos || cc.Vec3.ZERO);
            }
            this.ClearMushroomTag(); // 切换座位时先隐藏
        }
        if (this.uirc.PlayerSquidCount) {
            const squidPos = info.squid_pos || cc.Vec3.ZERO;
            this.uirc.PlayerSquidCount.setPosition(squidPos);
            if (this.uirc.PlayerSquidLabel) {
                this.uirc.PlayerSquidLabel.setPosition(info.mushroom_label_pos || cc.Vec3.ZERO);
            }
        }
        this.ClearSquidTag();
        if (this.IsMySeat) {
            this.uirc.WaitforthenextmoveTips.string = `${CPErrorCode.LanguageDescription(20090)}`;
            this.uirc.WaitforthenextmoveTips.node.setPosition(0, -455);
        } else {
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
        this.SetBubbleInsuranceCountDownPosition(info.insurance_pos);
        if (GameCache.Instance.room_type > RoomType.TexasHoldemSixPlusFixedAof && GameCache.Instance.room_type < RoomType.MTTTexasHoldemStandardNoLimit) {
            // mRectTransform.localPosition = info.AoMaHaInsurancetoubaoPos;
        } else {
            //mRectTransform.localPosition = info.InsurancetoubaoPos;
        }
    }

    public RefreshCurRoundHaveBetContentPos(betPos: cc.Vec3): void {
        const x = betPos?.x || 0;
        const targetX = x > 0 ? 80 : -80;
        if (this.uirc.Bet_Bg) {
            this.uirc.Bet_Bg.setPosition(targetX, 0);
        }
        if (this.uirc.textCurRoundHaveBet?.node) {
            this.uirc.textCurRoundHaveBet.node.setPosition(targetX, 0);
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
            tween.then(
                cc.callFunc(() => {
                    GC.sound.Play('sfx_desk_new_card');
                })
            );
            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                let cardInfo = this.listCardUIInfos[i];
                cardInfo.SetSpriteFrame(this.Player.cards[i]);
                //cardInfo.imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(this.Player.cards[i]));
                cardInfo.imageCard.color = cc.Color.WHITE;
                cardInfo.imageCard.setScale(0.5);
                cardInfo.imageCard.setPosition(this.listCardUIInfos[i].imageCard.parent.convertToNodeSpaceAR(targetPos));
                cardInfo.imageCard.active = true;
                if (cardInfo.imageBack) {
                    cardInfo.imageBack.spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(-1));
                    cardInfo.imageBack.node.color = cc.Color.WHITE;
                    cardInfo.imageBack.node.active = true;
                    cardInfo.imageBack.node.opacity = 255;
                }
                //listCardUIInfos[i].imageCard.rectTransform.localRotation = Quaternion.Euler(0, 0, 0);
                let tween_card = cc.tween(cardInfo.imageCard);
                tween.then(
                    cc.callFunc(() => {
                        tween_card.to(0.4, { scale: Seat.myCardsScale, position: Seat.myCardsPos[i] }, cc.easeQuadraticActionOut()).start();
                        //cc.easeSineOut()
                    })
                );
                if (!GameCache.Instance.CurlimitDelaySeeCard && cardInfo.imageBack) {
                    const tween_back = cc.tween(cardInfo.imageBack.node);
                    tween.then(
                        cc.callFunc(() => {
                            tween_back
                                .to(0.25, { opacity: 0 })
                                .call(() => {
                                    cardInfo.imageBack.node.active = false;
                                })
                                .start();
                        })
                    );
                }
            }
            tween.delay(0.4);
        } else {
            // 其他玩家发牌动画
            tween.then(
                cc.callFunc(() => {
                    this.uirc.transSmallCardBacks.active = true;
                    this.uirc.transSmallCardBacks.stopAllActions();
                })
            );
            let mLocalPos: cc.Vec3 = this.uirc.transSmallCardBacks.convertToNodeSpaceAR(targetPos);
            for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {
                let mTmpObj: cc.Node = this.listImageSmallCardBack[i].node;
                let pos = this.GetBackSmallCardPos(i);
                mTmpObj.setPosition(mLocalPos);
                tween.then(
                    cc.callFunc(() => {
                        GC.sound.Play('sfx_desk_new_card');
                        mTmpObj.active = true;
                        cc.tween(mTmpObj).to(0.4, { position: pos }, cc.easeQuadraticActionOut()).start();
                    })
                );
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
                    cc.tween(this.uirc.transSmallCardBacks).to(0.5, { position: pos }).start();
                })
            );
            for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {
                //sequencePlayFoldAnimation.Join(listImageSmallCardBack[i].DOFade(0, 0.3f));
                sequence.push(
                    cc.callFunc(() => {
                        cc.tween(this.listImageSmallCardBack[i].node).to(0.3, { opacity: 0 }).start();
                    })
                );
            }
            sequence.push(cc.delayTime(0.5));
            this.sequencePlayFoldAnimation.sequence
                //@ts-ignore
                .apply(this.sequencePlayFoldAnimation, sequence)
                .call(() => {
                    this.uirc.transSmallCardBacks.position = this.seatUIInfo.card_back_pos;
                    for (let i = 0, n = this.listImageSmallCardBack.length; i < n; i++) {
                        this.listImageSmallCardBack[i].node.color = cc.Color.WHITE;
                        this.listImageSmallCardBack[i].node.opacity = 255;
                    }
                    this.uirc.transSmallCardBacks.active = false;
                })
                .start();
        } else {
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
            this.uirc.voiceprintList[i].active = num == i;
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
            this.RefreshNickCoinVisible(false);
            this.ClearMushroomTag();
            this.ClearSquidTag();
        } else {
            this.RefreshNickCoinVisible(true);
            WebImageHelper.SetHeadImage(this.uirc.Raw_Head, this.Player.headPic);
        }
    }

    private RefreshNickCoinVisible(show: boolean): void {
        if (this.uirc.Nick_Coin) {
            this.uirc.Nick_Coin.active = show;
        }
        if (this.uirc.table_sprite_line) {
            this.uirc.table_sprite_line.opacity = show ? 255 : 0;
            this.uirc.table_sprite_line.color = cc.Color.WHITE;
        }
    }

    /// <summary>
    /// 刷新占座
    /// </summary>
    public UpdateRequesting() {
        this.uirc.TextRequesting.node.active = this.Player.KeepSeatLeftTime > 0;
        this.uirc.Text_Coin.node.active = this.Player.KeepSeatLeftTime <= 0;
        if (this.Player.KeepSeatLeftTime > 0) {
            this.uirc.TextRequesting.string = `${i18nMgr.Get('UITEXAS_PLAYERSEATDOWNTIPS01')}${Math.ceil(this.Player.KeepSeatLeftTime)}s`;
        }
    }

    //刷新昵称
    public UpdateNickName(): void {
        this.SetNickName(this.Player?.nick || '');
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
        const show = enabled && this.isBank && pool > 0 && base > 0;
        this.uirc.MushroomPool.active = show;
        if (!show) return;
        const cnt = Math.floor(pool / base);
        this.uirc.Label_MushroomCount && (this.uirc.Label_MushroomCount.string = `${cnt}`);
        this.uirc.Label_MushroomChip && (this.uirc.Label_MushroomChip.string = `${pool / 100}`);
    }

    /** 清理/隐藏蘑菇标识（换桌/重置时调用） */
    public ClearMushroomTag(): void {
        if (this.uirc?.MushroomPool) {
            this.uirc.MushroomPool.active = false;
        }
    }

    /** 刷新头像上的鱿鱼标记 */
    public UpdateSquidTag(enabled: boolean, inRound: boolean): void {
        if (!this.uirc) return;
        const p = this.Player;
        const inSquidRound = !!(enabled && inRound && p && p.inSquid);
        const hasSquidMark = !!(inSquidRound && p.squidCount > 0);
        if (this.uirc.PlayerSquidCount) {
            // 按需求隐藏座位头像上的鱿鱼数量标记（橙色鱿鱼图标 + 数字）
            this.uirc.PlayerSquidCount.active = false;
        }
        if (this.uirc.Head_Squid_Mask) {
            // 按需求隐藏紫色鱿鱼触手遮罩（squid_mask.png）
            this.uirc.Head_Squid_Mask.active = false;
        }
        if (hasSquidMark && this.uirc.Label_SquidCount) {
            this.uirc.Label_SquidCount.string = `${p.squidCount}`;
        }
    }

    /** 清理/隐藏鱿鱼标记 */
    public ClearSquidTag(): void {
        if (this.uirc?.PlayerSquidCount) {
            this.uirc.PlayerSquidCount.active = false;
        }
        if (this.uirc?.Head_Squid_Mask) {
            this.uirc.Head_Squid_Mask.active = false;
        }
    }

    /** 首次获得鱿鱼标记时播放头像提示动画 */
    public PlaySquidGetMarkAnim(): void {
        if (!this.uirc?.PlayerSquidCount || !this.uirc.PlayerSquidCount.activeInHierarchy) return;
        this.uirc.PlayerSquidCount.stopAllActions();
        this.uirc.PlayerSquidCount.setScale(0.7);
        cc.tween(this.uirc.PlayerSquidCount).to(0.12, { scale: 1.2 }, cc.easeBackOut()).to(0.1, { scale: 1.0 }, cc.easeSineOut()).start();
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
        });
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
            if (this.uirc.Image_Bubble.activeInHierarchy) this.uirc.Image_Bubble.active = false;
            return;
        }
        if (isReconect && !this.Player.RoundActioned) {
            return;
        }
        this.uirc.Image_Bubble.active = true;
        switch (this.Player.actionStatus) {
            case Def.Action.CALL:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'call');
                // textBubble.text = "跟注";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10044);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.BET:
            case Def.Action.RAISE:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'raise');
                // textBubble.text = "加注";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10045);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.ALLIN:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'allin');
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(30074);
                this.uirc.textBubble.node.active = true;
                if (!isReconect) {
                    this.PlayAllinArmature(isAllinShowVioce);
                }
                break;
            case Def.Action.CHECK:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'check');
                // textBubble.text = "看牌";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10046);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.FOLD:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'fold');
                // textBubble.text = "弃牌";
                this.uirc.textBubble.string = CPErrorCode.LanguageDescription(10047);
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            case Def.Action.STRADDLE:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'straddle');
                // 原来 string='Straddle' 但隐藏了文字节点 → 只剩一个空白气泡。改为显示中文“强抓”
                this.uirc.textBubble.string = '强抓';
                this.uirc.textBubble.node.active = true;
                this.StopAllinArmature();
                break;
            default:
                this.ShowBubbleBG(this.uirc.Image_Bubble, 'null');
                this.uirc.textBubble.string = '';
                this.StopAllinArmature();
                break;
        }
        if (this.uirc.textBubble.string != '') {
            if (null == this.sequenceUpdateBubble || !this.sequenceUpdateBubble.IsPlaying) this.PlayUpdateBubbleAnimation();
        } else {
            if (this.sequenceUpdateBubble?.IsPlaying) this.sequenceUpdateBubble.Kill(true);
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
    public GetRorL(): boolean {
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
                } else {
                    isR = true;
                }
                break;
            case 3:
                if (this.PlayerCount == 4) {
                    isR = false;
                } else if (this.PlayerCount == 5) {
                    isR = false;
                } else {
                    isR = true;
                }
                break;
            case 4:
                if (this.PlayerCount == 5) {
                    isR = false;
                } else if (this.PlayerCount == 6) {
                    isR = false;
                } else {
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
            if (this.uirc.table_sprite_line) {
                this.uirc.table_sprite_line.opacity = 255;
                this.uirc.table_sprite_line.color = cc.Color.WHITE;
            }
            return;
        }
        if (this.uirc.imageReserveSeat.activeInHierarchy) {
            this.uirc.imageOffline.active = false;
        } else {
            this.uirc.imageOffline.active = this.Player.isOffLine > 0 && !this.IsMySeat;
        }
        if (this.uirc.table_sprite_line) {
            this.uirc.table_sprite_line.opacity = this.uirc.Nick_Coin?.active ? 255 : 0;
            this.uirc.table_sprite_line.color = cc.Color.WHITE;
        }
    }

    /// <summary>
    /// 刷新本手下注筹码
    /// </summary>
    public UpdateCurRoundHaveBet(): void {
        if (GC.game.seatMoveStruct.moving) {
            GC.game.seatMoveStruct.cacheFuncs.push({ a: this, b: this.__UpdateCurRoundHaveBet, c: null, d: '__UpdateCurRoundHaveBet' });
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
        } else if (this.isSmall && GameCache.Instance.CurGame.cacheRound == Def.Round.PREFLOP) {
            this.isSmall = false;
            //this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_small_chip");
        } else {
            //this.uirc.imageIconChip.spriteFrame = GameCache.Instance.CurGame.GetChipSpriteBySpriteName("icon_image_nor_chip");
        }
        // let str = StringHelper.FormatIntOrFloat1(this.Player.anteNumber / 100);
        // this.uirc.textCurRoundHaveBet.string = str;
        this.uirc.textCurRoundHaveBet.node.active = true;
        if (this.uirc.Bet_Bg) this.uirc.Bet_Bg.active = true;
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

    public ResetCardsUI(): void {
        const resetCard = (cardInfo: CardUIInfo) => {
            if (!cardInfo) return;
            if (cardInfo.imageCard) {
                cc.Tween.stopAllByTarget(cardInfo.imageCard);
                cardInfo.imageCard.stopAllActions();
                cardInfo.imageCard.active = false;
                cardInfo.imageCard.color = cc.Color.WHITE;
                cardInfo.imageCard.scale = 1;
                TexasGameUtils.ResetCardHighlight(cardInfo.imageCard);
            }
            if (cardInfo.imageBack?.node) {
                cc.Tween.stopAllByTarget(cardInfo.imageBack.node);
                cardInfo.imageBack.node.stopAllActions();
                cardInfo.imageBack.node.active = false;
                cardInfo.imageBack.node.opacity = 255;
                cardInfo.imageBack.node.color = cc.Color.WHITE;
            }
            if (cardInfo.imageSelect?.node) {
                cardInfo.imageSelect.node.active = false;
            }
        };

        this.uirc.imageCards?.forEach(resetCard);
        this.uirc.imageSmallCards?.forEach(resetCard);
        this.uirc.imageSmallCardBacks?.forEach(cardBack => {
            const node = cardBack?.node;
            if (!node) return;
            cc.Tween.stopAllByTarget(node);
            node.stopAllActions();
            node.active = false;
            node.opacity = 255;
        });
        if (this.uirc.transSmallCardBacks) {
            cc.Tween.stopAllByTarget(this.uirc.transSmallCardBacks);
            this.uirc.transSmallCardBacks.stopAllActions();
            this.uirc.transSmallCardBacks.active = false;
        }
        cc.Tween.stopAllByTarget(this.deal_sequence_obj);
        this.deal_sequence_obj = {};
        this.ResetShowCardsId();
        this.ResetSpread(); // 清除 AllIn/摊牌的展开标记，新一局可重新展开
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
        if (GC.game.seatMoveStruct.moving) {
            GC.game.seatMoveStruct.cacheFuncs.push({ a: this, b: this.__UpdateCards, c: isAllin, d: '__UpdateCards' });
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
                } else {
                    this.HideCards(this.listCardUIInfos);
                }
            } else {
                this.HideCards(this.listCardUIInfos);
            }
        } else {
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
                    cc.tween(this.uirc.Image_Bubble)
                        .to(0.2, { scale: 0 })
                        .call(() => {
                            this.uirc.Image_Bubble.active = false;
                        })
                        .start();
                    this.HideCardBack();
                } else {
                    this.HideCards(this.listSmallCardUIInfos);
                    if (this.Player.isPlaying) {
                        this.ShowCardBack();
                    } else {
                        this.HideCardBack();
                    }
                }
            } else {
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
            } else if (this.Player.cards.length < list.length) {
                mUpdateStart = 0;
                mUpdateEnd = this.Player.cards.length;
                mHideStart = mUpdateEnd + 1;
                mHideEnd = list.length;
            } else {
                mUpdateStart = 0;
                mUpdateEnd = this.Player.cards.length;
            }
        }
        try {
            for (let i = mUpdateStart; i < mUpdateEnd; i++) {
                if (this.IsMySeat) {
                    // _isSpread=true 时保持 spread 位置（AllIn/摊牌已放大展开，避免 ShowCards 还原到原始位置导致重叠）
                    if (!this._isSpread) {
                        list[i].imageCard.setPosition(Seat.myCardsPos[i]);
                    }
                    //list[i].imageCard.transform.localRotation = Quaternion.Euler(myCardsRot[i]);
                } else {
                    list[i].imageCard.color = cc.Color.WHITE;
                    if (!this._isSpread) {
                        list[i].imageCard.setPosition(Seat.smallCardPos[i]);
                    }
                }
                let mCard = this.Player.cards[i];
                //list[i].imageCard.getComponent(cc.Sprite).spriteFrame = GameCache.Instance.CurGame.GetBigPokerSP(GameUtil.GetCardNameByNum(mCard));
                list[i].SetSpriteFrame(mCard);
                list[i].imageCard.active = true;
            }
        } catch (Exception) {
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
    /// <summary>
    /// 摊牌/AllIn 阶段放大其他玩家头像上方的小牌到 1.2 倍，并等距水平展开避免重叠。
    /// 主玩家自己的大牌（屏幕底部）不处理。
    /// 用 _isSpread 标记防重复：AllIn 已展开后，摊牌时不再重复展开（保持视觉稳定）。
    /// 新一局 ResetCardsUI 会清掉 _isSpread，下次 ShowCards 默认 setPosition(smallCardPos[i]) + scale=1 自动还原。
    /// </summary>
    private _isSpread: boolean = false;

    public SpreadCards(animate: boolean = false): void {
        if (this._isSpread) return; // 已展开（AllIn 时已展开过），跳过避免重复
        if (!this.Player || !this.Player.cards || this.Player.cards.length === 0) return;

        const isMySeat = this.IsMySeat;
        // 主玩家用大牌 listCardUIInfos + myCardsPos；其他玩家用小牌 listSmallCardUIInfos + smallCardPos
        const cards = isMySeat ? this.listCardUIInfos : this.listSmallCardUIInfos;
        const defaultPos = isMySeat ? Seat.myCardsPos : Seat.smallCardPos;

        if (!cards || cards.length === 0) return;
        const cardCount = Math.min(cards.length, this.Player.cards.length);
        if (cardCount === 0) return;

        // 用首尾两张牌的默认位置算中心点（保持视觉中心不变）
        const posFirst = defaultPos[0];
        const posLast = defaultPos[cardCount - 1];
        const centerX = (posFirst.x + posLast.x) / 2;
        const centerY = (posFirst.y + posLast.y) / 2;

        // 新间距 = 视觉宽度（cardWidth × 1.2）+ 15px buffer，保证放大后视觉上明显分开不重叠
        // 之前 buffer 只有 4px，scale=1.2 时两张牌边缘只有 4px 间距，视觉上像重叠
        const cardWidth = cards[0].imageCard.width || 60;
        const newStep = cardWidth * 1.2 + 15;
        const startX = centerX - (newStep * (cardCount - 1)) / 2;

        this._isSpread = true;
        for (let i = 0; i < cardCount; i++) {
            const info = cards[i];
            if (!info?.imageCard) continue;
            const newPos = cc.v3(startX + i * newStep, centerY, 0);
            if (animate) {
                cc.tween(info.imageCard)
                    .to(0.3, { position: newPos, scale: 1.2 }, { easing: 'sineOut' })
                    .start();
            } else {
                info.imageCard.setPosition(newPos);
                info.imageCard.scale = 1.2;
            }
        }
    }

    /// <summary>
    /// 摊牌阶段入口（带 0.3s 动画）。如果 AllIn 时已经展开过则跳过。
    /// </summary>
    public SpreadShowdownCards(): void {
        this.SpreadCards(true);
    }

    /// <summary>
    /// AllIn 时入口：必须 rec.isAll=true（所有玩家都能看到牌）才调用。
    /// 用 0.3s 动画展开，并标记 _isSpread，使后续摊牌阶段不再重复展开。
    /// </summary>
    public SpreadAllInCards(): void {
        this.SpreadCards(true);
    }

    /// <summary>
    /// 重置展开标记 + 还原私牌 scale 到默认值。
    /// 位置不在这里处理（下次 ShowCards 默认 setPosition(smallCardPos[i]/myCardsPos[i]) 会自动还原）。
    /// 调用时机：ClearRoundEndData（新一局结束清理）。
    /// 注意：ResetCardsUI（玩家离开座位）也会调用本方法，作为兜底。
    /// </summary>
    public ResetSpread(): void {
        this._isSpread = false;
        // 还原大牌 scale 到 myCardsScale（主玩家大牌默认值，从 prefab 加载）
        if (this.listCardUIInfos) {
            for (let i = 0; i < this.listCardUIInfos.length; i++) {
                const info = this.listCardUIInfos[i];
                if (info?.imageCard) info.imageCard.scale = Seat.myCardsScale || 1;
            }
        }
        // 还原小牌 scale 到 1（其他玩家小牌默认值）
        if (this.listSmallCardUIInfos) {
            for (let i = 0; i < this.listSmallCardUIInfos.length; i++) {
                const info = this.listSmallCardUIInfos[i];
                if (info?.imageCard) info.imageCard.scale = 1;
            }
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
        return cc.tween(this.uirc.imageIconChip.node).to(0.2, { position: this.defaultIconChipLocalPos }, cc.easeQuadraticActionOut()).start();
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
        cc.tween(imageBanker).to(0.3, { position: this.seatUIInfo.bank_pos }).start();
        return 0.3;
    }

    /**
     * 播放庄家位蘑菇投注动画。
     * 蘑菇图标从玩家头像位置出发，缩放由 0 到原始大小并移动到蘑菇池位置；
     * 动画完成后显示蘑菇文案。
     * @returns 动画时长（秒）
     */
    public PlayMushroomBetAnimation(): number {
        if (!this.uirc?.MushroomIcon?.node || !this.uirc?.MushroomLabel || !this.uirc?.Frame_Head) {
            return 0;
        }
        const iconNode = this.uirc.MushroomIcon.node;
        const labelNode = this.uirc.MushroomLabel;
        const sourceWorldPos = this.uirc.Frame_Head.parent.convertToWorldSpaceAR(this.uirc.Frame_Head.position);
        const targetPos = iconNode.position.clone();
        const targetScaleX = iconNode.scaleX;
        const targetScaleY = iconNode.scaleY;
        const duration = 0.35;
        // 开始动画前先隐藏文字，仅展示飞行中的蘑菇图标
        labelNode.active = false;
        iconNode.stopAllActions();
        iconNode.active = true;
        iconNode.setPosition(iconNode.parent.convertToNodeSpaceAR(sourceWorldPos));
        iconNode.setScale(0, 0);
        cc.tween(iconNode)
            .to(duration, { position: targetPos, scaleX: targetScaleX, scaleY: targetScaleY }, cc.easeQuadraticActionOut())
            .call(() => {
                labelNode.active = true;
            })
            .start();
        return duration;
    }

    /// <summary>
    /// 播放回收筹码动画
    /// </summary>
    public PlayRecyclingChipAnimation(): cc.Tween {
        let tween = cc.tween(this.ui);
        if (this.uirc.imageIconChip.node.activeInHierarchy) {
            this.uirc.textCurRoundHaveBet.node.active = false;
            if (this.uirc.Bet_Bg) this.uirc.Bet_Bg.active = false;
            let pos = this.uirc.textCurRoundHaveBet.node.convertToNodeSpaceAR(GameCache.Instance.CurGame.GetRecyclingChipPosV3());
            GC.sound.Play('sfx_desk_move_chips');
            cc.tween(this.uirc.imageIconChip.node)
                .to(0.5, { position: pos }, cc.easeQuadraticActionOut())
                .call(() => {
                    this.uirc.imageIconChip.node.active = false;
                })
                .start();
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
        if (this.uirc.Bet_Bg) this.uirc.Bet_Bg.active = true;
        //RectTransform mRectTransform = imageCurRoundHaveBetFrame.transform as RectTransform;
        //mRectTransform.sizeDelta = new Vector2(textCurRoundHaveBet.preferredWidth + imageIconChip.rectTransform.sizeDelta.x, mRectTransform.sizeDelta.y);
        let mTmpV3: cc.Vec2 = this.ui.getPosition();
        if (mTmpV3.x <= 0) {
            //textCurRoundHaveBet.alignment = TextAnchor.MiddleRight;
        } else {
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
        if (
            null == this.Player ||
            null == GameCache.Instance.CurGame.mainPlayer ||
            GameCache.Instance.CurGame.mainPlayer.userID != this.Player.userID ||
            GameCache.Instance.CurGame.mainPlayer.seatID != this.seatID
        ) {
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
    }

    /// <summary>
    /// 停止allin动画
    /// </summary>
    public StopAllinArmature(): void {
        if (this._allinSpineNode) {
            this._allinSpineNode.destroy();
            this._allinSpineNode = null;
        }
    }

    /// <summary>
    /// 停止赢牌头像动画
    /// </summary>
    public StopWinArmature(): void {
        this.uirc.Spine_Winner.node.active = false;
        // 隐藏赢家头像底部 UI（参考 Unity StopWinAnim：_imageWinner/_imageOtherWinner SetActive(false)）
        if (this.uirc?.winTypeNnum) this.uirc.winTypeNnum.active = false;
        if (this.uirc?.winNum) this.uirc.winNum.active = false;
        // 还原 Spine_Winner 的 y（PlayWinArmature 加的 55px 偏移）
        if (this._spineWinnerOrigY !== null && this.uirc?.Spine_Winner?.node) {
            this.uirc.Spine_Winner.node.y = this._spineWinnerOrigY;
        }
        this._stopYouWinAnim();
        this._stopOtherWinAnim();
    }

    /// <summary>
    /// 刷新赢家头像底部 UI：主玩家只显示筹码（WinNum）；其他玩家根据 cardType 决定显示
    /// 牌型+筹码（WinTypeNnum）还是只筹码（WinNum）。参考 Unity TexasSeat.cs:2804 UpdateWinCoin。
    /// 隐藏逻辑：StopWinArmature 会隐藏两个容器（对应 Unity StopWinAnim）。
    /// </summary>
    public UpdateWinCoin(): void {
        if (!this.Player || this.Player.winChips == 0) return;
        const chipStr = StringHelper.getStringDiv100(this.Player.winChips);
        if (this.IsMySeat) {
            // 主玩家：只显示 WinNum（筹码）
            if (this.uirc?.winNum) {
                this.uirc.winNum.active = true;
                if (this.uirc.winNumNum) this.uirc.winNumNum.string = chipStr;
            }
        } else {
            // 其他玩家：cardType > 0 显示 WinTypeNnum（牌型+筹码），否则显示 WinNum（只筹码）
            if (this.Player.cardType > 0) {
                if (this.uirc?.winTypeNnum) {
                    this.uirc.winTypeNnum.active = true;
                    if (this.uirc.winTypeNnumPokerType) {
                        this.uirc.winTypeNnumPokerType.string = CardTypeUtil.GetCardTypeName(this.Player.cardType as CardType);
                    }
                    if (this.uirc.winTypeNnumNum) this.uirc.winTypeNnumNum.string = chipStr;
                }
            } else {
                if (this.uirc?.winNum) {
                    this.uirc.winNum.active = true;
                    if (this.uirc.winNumNum) this.uirc.winNumNum.string = chipStr;
                }
            }
        }
        // 红底黑字 + 整体放大，确保其他玩家也能清晰看到赢取金额（代码强制，不依赖预制体重新导入）
        this._styleWinBubble();
    }

    /** 赢取金额气泡：对齐 Figma — 牌型文字常规黑色、金额加粗黑色、整体放大（红色背景由 winnum/winpokernnum 贴图提供）。
     *  同时把气泡移到牌的下方、并置于最前层，避免被(其他玩家亮牌时的)手牌挡住看不清。 */
    private static readonly WIN_BUBBLE_Y = -175; // 下移到牌下方（与保险倒计时气泡同高），原 -120 会被手牌遮挡
    private static readonly WIN_BUBBLE_Z = 50;   // 提到最前，避免被 Cards/SmallCards 盖住
    private _styleWinBubble(): void {
        const SCALE = 1.3;
        const black = cc.color(0, 0, 0);
        const placeFront = (node: cc.Node) => {
            if (!node) return;
            node.zIndex = Seat.WIN_BUBBLE_Z;
            node.y = Seat.WIN_BUBBLE_Y;
        };
        if (this.uirc?.winTypeNnum) {
            this.uirc.winTypeNnum.scale = SCALE;
            placeFront(this.uirc.winTypeNnum);
            if (this.uirc.winTypeNnumPokerType) this.uirc.winTypeNnumPokerType.node.color = black;
            if (this.uirc.winTypeNnumNum) {
                this.uirc.winTypeNnumNum.node.color = black;
                this.uirc.winTypeNnumNum.enableBold = true; // 金额加粗
            }
        }
        if (this.uirc?.winNum) {
            this.uirc.winNum.scale = SCALE;
            placeFront(this.uirc.winNum);
            if (this.uirc.winNumNum) {
                this.uirc.winNumNum.node.color = black;
                this.uirc.winNumNum.enableBold = true; // 金额加粗
            }
        }
    }

    /// <summary>
    /// 开始倒计时
    /// </summary>
    /// <param name="countDown"></param>
    public StartCountDown(countDown: number, isInsruance: boolean = false): void {
        this.optCurTime = countDown;
        let defaultOpTime: number = GameCache.Instance.CurGame.GetOpTime();
        if (isInsruance) defaultOpTime = 30;
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
        this.MoveBubbleInsuranceCountDownToTop();
        // 重新锚定到下注气泡(Image_Bubble)位置，确保始终在头像正上方（与投保/不保气泡同位置）
        this.SetBubbleInsuranceCountDownPosition(cc.Vec3.ZERO);
        // 单行：文案 + 倒计时（如 购买中9s），与气泡 png 保持一行
        this.uirc.Text_BubbleInsuranceCountDown.string = `${CPErrorCode.LanguageDescription(10298)}${this.Player.timeLeft_insurance < 0 ? 0 : this.Player.timeLeft_insurance}s`;
        this.HideBubbleInsurance();
    }

    private CacheBubbleInsuranceCountDownHierarchy(): void {
        const node = this.uirc?.Image_BubbleInsuranceCountDown;
        if (!node?.parent || this._bubbleInsuranceCountDownHomeParent) {
            return;
        }
        this._bubbleInsuranceCountDownHomeParent = node.parent;
        this._bubbleInsuranceCountDownHomeSiblingIndex = node.getSiblingIndex();
        this._bubbleInsuranceCountDownHomeZIndex = node.zIndex;
    }

    private SetBubbleInsuranceCountDownPosition(pos: cc.Vec3): void {
        const node = this.uirc?.Image_BubbleInsuranceCountDown;
        if (!node) {
            return;
        }
        this.CacheBubbleInsuranceCountDownHierarchy();
        // 让保险倒计时显示在头像上方，与下注气泡（加注/跟注等）同一位置
        const bubble = this.uirc?.Image_Bubble;
        if (bubble && bubble.parent && node.parent) {
            const worldPos = bubble.parent.convertToWorldSpaceAR(bubble.position);
            worldPos.y += Seat.INSURANCE_BUBBLE_UP_OFFSET; // 略微上移，避免遮挡头像上方的手牌
            node.setPosition(node.parent.convertToNodeSpaceAR(worldPos));
            return;
        }
        const homeParent = this._bubbleInsuranceCountDownHomeParent;
        if (homeParent && node.parent && node.parent !== homeParent) {
            const worldPos = homeParent.convertToWorldSpaceAR(pos);
            node.setPosition(node.parent.convertToNodeSpaceAR(worldPos));
            return;
        }
        node.setPosition(pos);
    }

    private MoveBubbleInsuranceCountDownToTop(): void {
        const node = this.uirc?.Image_BubbleInsuranceCountDown;
        const topParent = this.GetBubbleInsuranceCountDownTopParent();
        if (!node?.parent || !topParent) {
            return;
        }
        this.CacheBubbleInsuranceCountDownHierarchy();
        const worldPos = node.parent.convertToWorldSpaceAR(node.position);
        if (node.parent !== topParent) {
            node.parent = topParent;
            node.setPosition(topParent.convertToNodeSpaceAR(worldPos));
        }
        node.zIndex = cc.macro.MAX_ZINDEX;
        node.setSiblingIndex(topParent.childrenCount - 1);
    }

    private GetBubbleInsuranceCountDownTopParent(): cc.Node {
        return GameCache.Instance.CurGame?.uirc?.node || GameCache.Instance.CurGame?.uirc?.main || this.ui?.parent?.parent || this.ui?.parent;
    }

    private RestoreBubbleInsuranceCountDownHierarchy(): void {
        const node = this.uirc?.Image_BubbleInsuranceCountDown;
        const homeParent = this._bubbleInsuranceCountDownHomeParent;
        if (!node || !homeParent || !cc.isValid(homeParent)) {
            return;
        }
        if (node.parent && node.parent !== homeParent) {
            const worldPos = node.parent.convertToWorldSpaceAR(node.position);
            node.parent = homeParent;
            node.setPosition(homeParent.convertToNodeSpaceAR(worldPos));
        } else if (!node.parent) {
            node.parent = homeParent;
        }
        node.zIndex = this._bubbleInsuranceCountDownHomeZIndex;
        if (this._bubbleInsuranceCountDownHomeSiblingIndex >= 0) {
            node.setSiblingIndex(Math.min(this._bubbleInsuranceCountDownHomeSiblingIndex, homeParent.childrenCount - 1));
        }
    }

    public UpdateImageBackActive(istrue: boolean = false): void {
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            if (this.listCardUIInfos[i].imageBack) {
                this.listCardUIInfos[i].imageBack.node.active = istrue;
            }
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
                            this.listCardUIInfos[i].imageCard.setPosition(
                                cc.v3(this.listCardUIInfos[i].imageCard.position.x, this.listCardUIInfos[i].imageCard.position.y)
                            ); //+40奥马哈两个手牌上移
                            this.listCardUIInfos[i].imageSelect.node.active = false;
                            // 高亮的私牌上移30（不放大，scale 由 SpreadShowdownCards 控制）
                            const cardNode = this.listCardUIInfos[i].imageCard as any;
                            if (!cardNode._hlRaised) {
                                cardNode._hlRaised = true;
                                cardNode._hlOrigY = this.listCardUIInfos[i].imageCard.y;
                                cc.tween(this.listCardUIInfos[i].imageCard)
                                    .to(0.2, { y: this.listCardUIInfos[i].imageCard.y + 30 }, { easing: 'sineOut' })
                                    .start();
                            }
                        } else {
                            this.listCardUIInfos[i].imageSelect.node.active = true;
                        }
                        break;
                    }
                }
            }
        } else {
            this.uirc.imageCardType.node.active = false;
            this.uirc.textSmallCardType.string = CardTypeUtil.GetCardTypeName(type);
            for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                // 摊牌阶段（isGameend=true）：默认灰化非参与组合的牌
                if (isGameend && this.listSmallCardUIInfos[i].imageCard) {
                    this.listSmallCardUIInfos[i].imageCard.color = cc.Color.GRAY;
                }
                this.listSmallCardUIInfos[i].imageSelect.node.active = false;
            }
            // 摊牌阶段：把参与最大牌型的私牌还原白色（赢家高亮）
            if (isGameend && hightCards && hightCards.length > 0) {
                for (let i = 0, n = this.Player.cards.length; i < n; i++) {
                    for (let j = 0, m = hightCards.length; j < m; j++) {
                        if (this.Player.cards[i] == hightCards[j]) {
                            if (this.listSmallCardUIInfos[i].imageCard) {
                                this.listSmallCardUIInfos[i].imageCard.color = cc.Color.WHITE;
                                // 高亮的私牌上移30（不放大，scale 由 SpreadShowdownCards 控制）
                                const cardNode = this.listSmallCardUIInfos[i].imageCard as any;
                                if (!cardNode._hlRaised) {
                                    cardNode._hlRaised = true;
                                    cardNode._hlOrigY = this.listSmallCardUIInfos[i].imageCard.y;
                                    cc.tween(this.listSmallCardUIInfos[i].imageCard)
                                        .to(0.2, { y: this.listSmallCardUIInfos[i].imageCard.y + 30 }, { easing: 'sineOut' })
                                        .start();
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    /// <summary>
    /// 输家私牌灰化：摊牌后对所有摊开的私牌（大牌和小牌）全部置灰，不显示牌型名。
    /// 参考 Unity TexasGameMessageHandler.cs:3225 Color.gray 的视觉处理。
    /// </summary>
    public GrayAllCards(): void {
        if (null == this.Player || null == this.Player.cards) return;
        // 隐藏牌型名节点
        this.uirc.imageCardType.node.active = false;
        if (this.uirc.imageSmallCardType?.node) this.uirc.imageSmallCardType.node.active = false;
        // 主玩家大牌（自己看自己的）
        for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
            const info = this.listCardUIInfos[i];
            if (!info) continue;
            if (info.imageCard) info.imageCard.color = cc.Color.GRAY;
            if (info.imageSelect?.node) info.imageSelect.node.active = false;
        }
        // 看别人的小牌（每个座位都有）
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            const info = this.listSmallCardUIInfos[i];
            if (!info) continue;
            if (info.imageCard) info.imageCard.color = cc.Color.GRAY;
            if (info.imageSelect?.node) info.imageSelect.node.active = false;
        }
    }

    /// <summary>
    /// 隐藏手牌牌型高亮
    /// </summary>
    public HideCardType(): void {
        if (null == this.Player || null == this.Player.cards) return;
        for (let i = 0, n = this.Player.cards.length; i < n; i++) {
            this.listSmallCardUIInfos[i].imageCard.color = cc.Color.WHITE;
            this.listCardUIInfos[i].imageSelect.node.active = false;
            // 重置摊牌阶段的高亮偏移/放大（_hlRaised 标记 + 还原 y/scale）
            TexasGameUtils.ResetCardHighlight(this.listSmallCardUIInfos[i].imageCard);
            TexasGameUtils.ResetCardHighlight(this.listCardUIInfos[i].imageCard);
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
        } else {
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
        // 需求（对齐 App 设计稿 / 原生版本）：弃牌状态头像保持【彩色】，不再转黑白灰度。
        //   之前用内置 2d-gray-sprite material 把头像转真灰度（黑白），与设计不符。
        //   现改回普通彩色 material，仅用节点颜色做轻微压暗以区分已弃牌状态（保留原色相）。
        //   备注：cocos 2.4.x 切 spriteFrame 不会重置 material / color，所以异步加载头像后仍生效。
        if (this.uirc.Raw_Head) {
            this.uirc.Raw_Head.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
            this.uirc.Raw_Head.node.color = active ? cc.color(160, 160, 160) : cc.Color.WHITE;
        }
        // 同步显示/隐藏弃牌文字标识，所有调用路径（FSM、协议同步等）自动生效
        if (this.uirc.foldText) {
            this.uirc.foldText.active = active;
            // 代码强制中文“弃牌”，避免预制体残留英文 Fold（且不依赖预制体重新导入）
            const foldLab = this.uirc.foldText.getComponent(cc.Label) || this.uirc.foldText.getComponentInChildren(cc.Label);
            if (foldLab && foldLab.string !== '弃牌') foldLab.string = '弃牌';
        }
        if (this.IsMySeat) {
            let mCardUiInfo: CardUIInfo = null;
            for (let i = 0, n = this.listCardUIInfos.length; i < n; i++) {
                mCardUiInfo = this.listCardUIInfos[i];
                if (null == mCardUiInfo) continue;
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
        this._loadAndPlayAllinSpine();
    }

    /**
     * 动态加载并播放 All In Spine 动画
     * 自己用 Texas_Allin_Self，对手用 Texas_Allin_Other
     */
    private _loadAndPlayAllinSpine(): void {
        if (this.IsDisposed || !this.ui) return;

        // 先清理已有的
        this.StopAllinArmature();

        const isSelf = this.IsMySeat;
        const cachedData = isSelf ? Seat._allinSelfSkeletonData : Seat._allinOtherSkeletonData;
        const resPath = isSelf ? 'spine/Texas_Allin_Self/skeleton' : 'spine/Texas_Allin_Other/skeleton';

        if (cachedData) {
            this._createAllinSpineNode(cachedData);
        } else {
            cc.resources.load(resPath, sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
                if (err) {
                    console.error('加载 AllIn Spine 失败:', resPath, err.message);
                    return;
                }
                if (isSelf) {
                    Seat._allinSelfSkeletonData = skeletonData;
                } else {
                    Seat._allinOtherSkeletonData = skeletonData;
                }
                // 确保座位还未被销毁
                if (!this.IsDisposed && this.ui) {
                    this._createAllinSpineNode(skeletonData);
                }
            });
        }
    }

    /**
     * 创建 All In Spine 节点并播放动画
     */
    private _createAllinSpineNode(skeletonData: sp.SkeletonData): void {
        const spineNode = new cc.Node('AllinSpine');
        const skeleton = spineNode.addComponent(sp.Skeleton);
        // 首帧透明，跳过 skeletonData 赋值时的 setup pose 渲染
        spineNode.opacity = 0;
        skeleton.skeletonData = skeletonData;
        // 居中对齐头像：allin 是环形波纹特效，应以头像中心为圆心包围头像
        const headNode = this.uirc?.Head;
        if (headNode) {
            spineNode.x = headNode.x;
            spineNode.y = headNode.y;
        }
        // 挂到座位节点下，与 Spine_Winner 同级
        this.ui.addChild(spineNode);
        // 播放 animation，不循环（cocos spine 默认行为：播完后停在最后一帧）
        skeleton.setAnimation(0, 'animation', false);
        // 下一帧恢复透明度，此时动画已从第0帧开始正常推进
        skeleton.scheduleOnce(() => {
            if (spineNode.isValid) {
                spineNode.opacity = 255;
            }
        }, 0);
        // 🆕 动画播放完成后节点保留，停在最后一帧，直到当前这手牌结束。
        //   一手牌结束时 StopAllinArmature 会被调用清理（SeatFSM.ts:411 新一手 Enter / :216 StartToPlayingEnter）。
        //   所以这里不再注册 setCompleteListener 销毁节点，保持 spine 停在最后一帧的视觉。
        this._allinSpineNode = spineNode;
    }

    /// <summary>
    /// 播放赢牌头像特效
    /// 自己赢播放 YouWin Spine 动画，他人赢播放 Spine_Winner
    /// </summary>
    public PlayWinArmature(): void {
        // 参考 Unity PlayWinAnim（TexasSeat.cs:5257）：先刷新赢家 UI（牌型+筹码），再判定赢家动画
        this.UpdateWinCoin();

        if (!this.Player.isWin) return;

        if (this.IsMySeat) {
            // 自己赢：播放胜利音效 + YouWin 动画
            GC.sound.Play('sfx_desk_mywin');
            this._playYouWinAnim();
        } else {
            // 他人赢：播放 OtherWin Spine 动画
            this._playOtherWinAnim();
        }
    }

    /**
     * 动态加载并播放 OtherWin Spine 动画
     */
    private _playOtherWinAnim(): void {
        if (this.IsDisposed || !this.ui) return;

        // 先清理已有的
        this._stopOtherWinAnim();

        if (Seat._otherWinSkeletonData) {
            this._createOtherWinSpineNode(Seat._otherWinSkeletonData);
        } else {
            cc.resources.load('spine/Texas_Win_Other/skeleton', sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
                if (err) {
                    console.error('加载 OtherWin Spine 失败:', err.message);
                    return;
                }
                Seat._otherWinSkeletonData = skeletonData;
                if (!this.IsDisposed && this.ui) {
                    this._createOtherWinSpineNode(skeletonData);
                }
            });
        }
    }

    /**
     * 创建 OtherWin Spine 节点并播放动画
     */
    private _createOtherWinSpineNode(skeletonData: sp.SkeletonData): void {
        const spineNode = new cc.Node('OtherWinSpine');
        const skeleton = spineNode.addComponent(sp.Skeleton);
        spineNode.opacity = 0;
        skeleton.skeletonData = skeletonData;
        // 放慢播放速度，让胜利动画停留更久（原速太短）
        skeleton.timeScale = 0.5;
        this.ui.addChild(spineNode);
        skeleton.setAnimation(0, 'animation', false);
        // 下一帧：恢复透明度 + 按实际包围盒归一化到较小尺寸（新骨骼原始尺寸过大）
        const dur = getAnimDuration(skeleton, 'animation');
        skeleton.scheduleOnce(() => {
            if (!spineNode.isValid) return;
            // 采样包围盒会把动画轨道推进到末尾，故先采样、再从头重播并绑定结束回调，
            // 否则 complete 会被提前触发，动画一闪而过/不显示。
            const b = sampleLiveBounds(skeleton, dur);
            if (b.max > 0) {
                const scale = Seat.OTHERWIN_TARGET_SIZE / b.max;
                spineNode.scale = scale;
                // 置于头像正上方：水平居中，动画脚底贴头顶
                const headTopY = this._getHeadTopY();
                spineNode.x = -(b.offX + b.szX / 2) * scale;
                spineNode.y = headTopY - b.offY * scale + Seat.OTHERWIN_BOTTOM_GAP;
            }
            skeleton.setAnimation(0, 'animation', false);
            skeleton.setCompleteListener(() => {
                if (spineNode.isValid) {
                    spineNode.destroy();
                }
                if (this._otherWinSpineNode === spineNode) {
                    this._otherWinSpineNode = null;
                }
            });
            spineNode.opacity = 255;
        }, 0);
        this._otherWinSpineNode = spineNode;
    }

    /**
     * 停止 OtherWin 动画
     */
    private _stopOtherWinAnim(): void {
        if (this._otherWinSpineNode) {
            this._otherWinSpineNode.destroy();
            this._otherWinSpineNode = null;
        }
    }

    /**
     * 动态加载并播放 YouWin Spine 动画
     */
    private _playYouWinAnim(): void {
        if (this.IsDisposed || !this.ui) return;

        // 先清理已有的
        this._stopYouWinAnim();

        if (Seat._youwinSkeletonData) {
            this._createYouWinSpineNode(Seat._youwinSkeletonData);
        } else {
            cc.resources.load('spine/youwin/youwin', sp.SkeletonData, (err, skeletonData: sp.SkeletonData) => {
                if (err) {
                    console.error('加载 YouWin Spine 失败:', err.message);
                    return;
                }
                Seat._youwinSkeletonData = skeletonData;
                if (!this.IsDisposed && this.ui) {
                    this._createYouWinSpineNode(skeletonData);
                }
            });
        }
    }

    /**
     * 创建 YouWin Spine 节点并播放动画
     */
    private _createYouWinSpineNode(skeletonData: sp.SkeletonData): void {
        const spineNode = new cc.Node('YouWinSpine');
        const skeleton = spineNode.addComponent(sp.Skeleton);
        spineNode.opacity = 0;
        skeleton.skeletonData = skeletonData;
        // 放慢播放速度，让胜利动画停留更久（原速太短）
        skeleton.timeScale = 0.5;
        this.ui.addChild(spineNode);
        skeleton.setAnimation(0, 'animation', false);
        // 下一帧：恢复透明度 + 按实际包围盒归一化到中等尺寸（新骨骼原始尺寸过大）
        const dur = getAnimDuration(skeleton, 'animation');
        skeleton.scheduleOnce(() => {
            if (!spineNode.isValid) return;
            // 采样包围盒会把动画轨道推进到末尾，故先采样、再从头重播并绑定结束回调，
            // 否则 complete 会被提前触发，动画被截断/不显示。
            const b = sampleLiveBounds(skeleton, dur);
            if (b.max > 0) {
                spineNode.scale = Seat.YOUWIN_TARGET_SIZE / b.max;
            }
            skeleton.setAnimation(0, 'animation', false);
            skeleton.setCompleteListener(() => {
                if (spineNode.isValid) {
                    spineNode.destroy();
                }
                if (this._youwinSpineNode === spineNode) {
                    this._youwinSpineNode = null;
                }
            });
            spineNode.opacity = 255;
        }, 0);
        this._youwinSpineNode = spineNode;
    }

    /**
     * 停止 YouWin 动画
     */
    private _stopYouWinAnim(): void {
        if (this._youwinSpineNode) {
            this._youwinSpineNode.destroy();
            this._youwinSpineNode = null;
        }
    }

    /// <summary>
    /// 在头像【正上方】显示表情动画（全尺寸，不遮挡头像，5秒后淡出）
    /// </summary>
    public ShowEmojiAnimation(emojiIndex: number): void {
        if (!this.ui || !this.ui.isValid) return;
        // 先清理旧的（挂在座位节点 this.ui 上，名为 EmojiAnim）
        this._stopEmojiAnim();
        // 播放该表情对应的语音（目前仅蘑菇头 em26-35 有音频，其余无文件时静默）
        this._playEmojiSound(emojiIndex);
        // 优先加载 Spine 动画版本（emoji_spine/em{idx}/skeleton），无则回退到静态图
        cc.resources.load(`emoji_spine/em${emojiIndex}/skeleton`, sp.SkeletonData, (err, skelData: sp.SkeletonData) => {
            if (!this.ui || !this.ui.isValid) return;
            if (!err && skelData) {
                this._playEmojiSpine(skelData);
            } else {
                this._playEmojiStatic(emojiIndex);
            }
        });
    }

    /**
     * 播放表情语音。音频文件放在 resources/emoji_audio/em{idx}.mp3，
     * 目前只有蘑菇头表情（em26-35，对应 mogu1-10）有配音；其余序号无文件即静默。
     * 受声音开关 (GC.sound.soundOn) 控制。
     */
    private _playEmojiSound(emojiIndex: number): void {
        try {
            if (GC.sound && (GC.sound as any).soundOn === false) return;
        } catch (e) {}
        cc.resources.load(`emoji_audio/em${emojiIndex}`, cc.AudioClip, (err, clip: cc.AudioClip) => {
            if (err || !clip) return; // 无音频文件的表情直接静默
            try {
                if (GC.sound && (GC.sound as any).soundOn === false) return;
                // 表情语音文件录制音量偏小：主层满音量播放，再叠加一层同音效提升整体响度（约 1.5 倍，清晰但不过响）
                const id1 = cc.audioEngine.playEffect(clip, false);
                try { cc.audioEngine.setVolume(id1, 1.0); } catch (e) {}
                const id2 = cc.audioEngine.playEffect(clip, false);
                try { cc.audioEngine.setVolume(id2, Seat.EMOJI_SOUND_BOOST); } catch (e) {}
            } catch (e) {}
        });
    }

    /** 头像顶部在座位节点(this.ui)坐标系中的 Y 坐标——表情动画以此为底，置于头像正上方 */
    private _getHeadTopY(): number {
        const headNode = this.uirc?.Head;
        let headHeight = headNode ? headNode.height : 0;
        if (headHeight <= 0) {
            const frameHead = this.uirc?.Frame_Head;
            headHeight = frameHead ? (frameHead.height || frameHead.getContentSize().height || 120) : 120;
        }
        const baseY = headNode ? headNode.y : 0;
        return baseY + headHeight / 2;
    }

    /** 头像中心 Y（用于把表情显示在头像上，而非头顶上方） */
    private _getHeadCenterY(): number {
        const headNode = this.uirc?.Head;
        return headNode ? headNode.y : 0;
    }

    /** 清理正在播放的表情动画 */
    private _stopEmojiAnim(): void {
        if (this._emojiAnimNode) {
            if (this._emojiAnimNode.isValid) this._emojiAnimNode.destroy();
            this._emojiAnimNode = null;
        }
        const old = this.ui && this.ui.isValid ? this.ui.getChildByName('EmojiAnim') : null;
        if (old) old.destroy();
    }

    /**
     * Spine 纹理必须禁止进入动态图集（dynamicAtlas）：<512px 的小图会被打包，
     * 导致 atlas UV 错位 → 骨骼渲染为空白。运行时强制 packable=false 可彻底规避，
     * 不依赖 .meta 重新导入。
     */
    private _unpackSpineTextures(skelData: sp.SkeletonData): void {
        // 关闭动态图集：小图被打包后会破坏 Spine 的 UV（首帧正常、次帧变空白/闪烁）。
        // disable 时引擎会 reset 并把已打包的纹理还原。只需触发一次。
        try {
            const dam: any = (cc as any).dynamicAtlasManager;
            if (dam && dam.enabled) dam.enabled = false;
        } catch (e) {}
        try {
            const texs: any = (skelData as any).textures;
            if (texs && texs.forEach) {
                texs.forEach((t: any) => { if (t) t.packable = false; });
            }
        } catch (e) {}
    }

    /// 播放 Spine 表情动画（全尺寸，挂在座位节点上，位于头像正上方）
    private _playEmojiSpine(skelData: sp.SkeletonData): void {
        this._unpackSpineTextures(skelData);
        const node = new cc.Node('EmojiAnim');
        const skeleton = node.addComponent(sp.Skeleton);
        // 首帧透明，跳过 skeletonData 赋值时的 setup pose 渲染
        node.opacity = 0;
        skeleton.skeletonData = skelData;
        skeleton.premultipliedAlpha = false;
        skeleton.timeScale = 1;
        // 取第一个动画名 + 皮肤名
        let animName = 'animation';
        let skinName: string | null = null;
        try {
            const rt: any = (skelData as any).getRuntimeData ? (skelData as any).getRuntimeData() : null;
            if (rt && rt.animations && rt.animations.length) animName = rt.animations[0].name;
            if (rt) skinName = (rt.defaultSkin && rt.defaultSkin.name) || (rt.skins && rt.skins[0] && rt.skins[0].name) || null;
        } catch (e) {}
        this.ui.addChild(node);
        this._emojiAnimNode = node;
        if (skinName) { try { skeleton.setSkin(skinName); } catch (e) {} }
        try { skeleton.setAnimation(0, animName, true); } catch (e) {}
        node.scale = Seat.EMOJI_ANIM_SCALE; // 临时缩放
        const headCenterY = this._getHeadCenterY();
        node.x = 0;
        node.y = headCenterY;
        // 延迟一帧：组件激活后 sk.update 才会推进动画，再沿循环采样包围盒取最大并归一化、对齐
        const dur = getAnimDuration(skeleton, animName);
        skeleton.scheduleOnce(() => {
            if (!node.isValid) return;
            const b = sampleLiveBounds(skeleton, dur);
            if (b.max > 0) {
                const scale = Seat.EMOJI_ANIM_TARGET_SIZE / b.max;
                node.scale = scale;
                node.x = -(b.offX + b.szX / 2) * scale;                 // 水平居中
                node.y = headCenterY - (b.offY + b.szY / 2) * scale;    // 垂直居中显示在头像上
            } else {
                // 量不到包围盒（部分单区域导出 setup 不绑定 → 之前按固定缩放会变巨大/移出屏幕 = “动画不显示”）。
                // 改用骨骼导出尺寸归一化，保证可见且大小一致。
                let dmax = 0;
                try {
                    const rt: any = (skelData as any).getRuntimeData ? (skelData as any).getRuntimeData() : null;
                    if (rt) dmax = Math.max(rt.width || 0, rt.height || 0);
                } catch (e) {}
                node.scale = dmax > 0 ? Seat.EMOJI_ANIM_TARGET_SIZE / dmax : Seat.EMOJI_ANIM_SCALE;
                node.x = 0;
                node.y = headCenterY;
            }
            node.opacity = 255;
        }, 0);
        cc.tween(node)
            .delay(Seat.EMOJI_ANIM_HOLD)
            .to(0.5, { opacity: 0 }, { easing: 'sineIn' })
            .call(() => {
                if (node.isValid) node.destroy();
                if (this._emojiAnimNode === node) this._emojiAnimNode = null;
            })
            .start();
    }

    /// 播放静态表情图（无 Spine 时回退）——同样置于头像正上方
    private _playEmojiStatic(emojiIndex: number): void {
        cc.resources.load(`emoji/em${emojiIndex}`, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err || !spriteFrame || !this.ui || !this.ui.isValid) {
                console.warn(LN, `加载表情图 emoji/em${emojiIndex} 失败`, err);
                return;
            }
            const emojiNode = new cc.Node('EmojiAnim');
            const sprite = emojiNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = spriteFrame;
            const SIZE = 120;
            emojiNode.setContentSize(SIZE, SIZE);
            emojiNode.opacity = 0;
            emojiNode.x = 0;
            // 锚点居中：直接显示在头像中心上
            emojiNode.y = this._getHeadCenterY();
            this.ui.addChild(emojiNode);
            this._emojiAnimNode = emojiNode;
            cc.tween(emojiNode)
                .to(0.3, { opacity: 255 }, { easing: 'sineOut' })
                .delay(Seat.EMOJI_ANIM_HOLD)
                .to(0.5, { opacity: 0 }, { easing: 'sineIn' })
                .call(() => {
                    if (emojiNode.isValid) emojiNode.destroy();
                    if (this._emojiAnimNode === emojiNode) this._emojiAnimNode = null;
                })
                .start();
        });
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
        this.tweenerHideBubble = { tween: cc.tween(this.uirc.Image_Bubble), IsPlaying: true };
        let tween = this.tweenerHideBubble.tween;
        tween.to(0.2, { scale: 0 });
        tween.delay(1);
        tween.call(() => {
            if (!this.ui?.isValid) return;
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
        if (this.Player.recyclingChip > 0) //回收筹码大于零时，执行动画
        {
            let imageRecyclingWinChip = this.uirc.imageRecyclingWinChip;
            imageRecyclingWinChip.node.setPosition(imageRecyclingWinChip.node.parent.convertToNodeSpaceAR(sourcePos));
            this.tweenerPlayRecyclingWinChipAnimation = { tween: cc.tween(imageRecyclingWinChip.node) };
            let tween = this.tweenerPlayRecyclingWinChipAnimation.tween;
            tween.then(
                cc.callFunc(() => {
                    imageRecyclingWinChip.node.active = true;
                })
            );
            let pos = GameUtil.ChangeToLocalPos(this.uirc.Frame_Head.position, this.uirc.Frame_Head.parent, this.ui);
            tween.to(0.5, { position: pos }, cc.easeQuadraticActionOut());
            tween.call(() => {
                if (!this.ui?.isValid) return;
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
        this.uirc.Image_Bubble.setScale(0.8, 0.8);
        this.uirc.Image_Bubble.opacity = 0;
        //自己仅有弃牌的图标可见
        this.uirc.Image_Bubble.active = !(this.IsMySeat && this.Player.actionStatus != Def.Action.FOLD);
        tween.parallel(cc.scaleTo(0.2, 1, 1), cc.fadeTo(0.1, 255));
        tween.to(0.1, { scale: 0.95 });
        tween.to(0.1, { scale: 1 });
        tween.call(() => {
            if (!this.ui?.isValid) return;
            this.sequenceUpdateBubble.IsPlaying = false;
        });
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
        this.RestoreBubbleInsuranceCountDownHierarchy();
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
        // 新一局清理：还原上一局 AllIn/摊牌的展开状态（_isSpread + scale）
        this.ResetSpread();
    }

    /// <summary>
    /// 清空本手下注筹码
    /// </summary>
    public ClearCurRoundHaveBet(): void {
        this.uirc.textCurRoundHaveBet.string = '';
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
        this.HideBubbleInsuranceCountDown();
        this.ResetCardsUI();
        this.HideHeadCD();
        this.RefreshNickCoinVisible(false);
        this.ClearMushroomTag();
        this.ClearSquidTag();
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
        this.StopAllinArmature();
        this.StopWinArmature();
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
            this.uirc.Image_BubbleInsuranceNum.getChildByName('Text').getComponent(cc.Label).string = CPErrorCode.LanguageDescription(10049);
        } else {
            this.uirc.Image_BubbleInsuranceToubao.active = !this.IsMySeat;
            if (this.Player.autoInsuredAmount > 0) {
                this.uirc.Image_BubbleInsuranceToubao.getChildByName('Text').getComponent(cc.Label).string = CPErrorCode.LanguageDescription(20058, [
                    StringHelper.GetLongString(this.Player.totalInsuredAmount),
                    StringHelper.GetLongString(this.Player.autoInsuredAmount)
                ]);
            } else {
                this.uirc.Image_BubbleInsuranceToubao.getChildByName('Text').getComponent(cc.Label).string = CPErrorCode.LanguageDescription(20059, [
                    StringHelper.GetLongString(this.Player.totalInsuredAmount)
                ]);
            }
        }
        // 文案加粗加大、气泡放大，保证清晰易读（代码强制，避免依赖预制体重新导入）
        this._styleInsuranceBubble(this.uirc.Image_BubbleInsuranceNum, false);
        this._styleInsuranceBubble(this.uirc.Image_BubbleInsuranceToubao, true);
        // 让"投保/不保"结果气泡显示在头像上方（与购买中倒计时同位置、同置顶），不再卡在头像中间
        if (!this.IsMySeat) {
            const shown =
                this.Player.totalInsuredAmount + this.Player.autoInsuredAmount == 0
                    ? this.uirc.Image_BubbleInsuranceNum
                    : this.uirc.Image_BubbleInsuranceToubao;
            this._moveInsuranceResultToTop(shown);
        }
        this.CloseInsuranceBaoBubaoBubble();
    }

    /** 保险倒计时/投保结果气泡相对下注气泡再上移的像素（避免遮挡头像上方的手牌） */
    private static readonly INSURANCE_BUBBLE_UP_OFFSET = 40;

    /** 设置"投保/不保"结果气泡：普通(不加粗不描边)但够大可读；背景随文字自适应，去掉多余留白 */
    private _styleInsuranceBubble(bubble: cc.Node, isToubao: boolean): void {
        if (!bubble) return;
        const textNode = bubble.getChildByName('Text');
        if (!textNode) return;
        const lab = textNode.getComponent(cc.Label);
        if (!lab) return;
        lab.fontSize = 58;            // 稍大一点更清晰(背景随文字自适应，不会多出空白)
        lab.lineHeight = 58;
        (lab as any).enableBold = false; // 不加粗，简单文字
        lab.overflow = cc.Label.Overflow.NONE; // 文字框随内容自适应（消除多余留白）
        // 去掉描边
        const outline = textNode.getComponent(cc.LabelOutline);
        if (outline) outline.width = 0;
        // 立即计算文字真实尺寸，再让气泡背景刚好包住文字(留少量内边距)
        try { (lab as any)._forceUpdateRenderData && (lab as any)._forceUpdateRenderData(); } catch (e) {}
        let tw = textNode.width;
        let th = textNode.height;
        if (!tw || tw < 10) {
            // 兜底：按字符估算宽度(CJK按字号、其余按0.55字号)
            const s = lab.string || '';
            let est = 0;
            for (let i = 0; i < s.length; i++) est += s.charCodeAt(i) > 255 ? lab.fontSize : lab.fontSize * 0.55;
            tw = est;
            th = lab.fontSize;
        }
        const padX = 44; // 左右内边距(含圆角)，足够但不空旷
        const padY = 28;
        bubble.setContentSize(Math.max(tw + padX, 110), Math.max(th + padY, 80));
    }

    /** "投保/不保"结果气泡的原始层级，用于复位 */
    private _insResultHome: { node: cc.Node; parent: cc.Node; sibling: number; z: number; pos: cc.Vec3 } | null = null;

    /** 把结果气泡移动到头像上方（复用购买中倒计时的定位/置顶逻辑，保证两者同位置） */
    private _moveInsuranceResultToTop(node: cc.Node): void {
        if (!node || !node.parent) return;
        if (this._insResultHome) this._restoreInsuranceResult();
        const topParent = this.GetBubbleInsuranceCountDownTopParent();
        if (!topParent) return;
        this._insResultHome = { node, parent: node.parent, sibling: node.getSiblingIndex(), z: node.zIndex, pos: node.position.clone() };
        // 目标 = 下注气泡(Image_Bubble)的世界坐标，购买中倒计时用的也是这个
        const bubble = this.uirc?.Image_Bubble;
        let worldPos: cc.Vec3;
        if (bubble && bubble.parent) {
            worldPos = bubble.parent.convertToWorldSpaceAR(bubble.position);
        } else {
            worldPos = node.parent.convertToWorldSpaceAR(node.position);
        }
        worldPos.y += Seat.INSURANCE_BUBBLE_UP_OFFSET; // 略微上移，避免遮挡头像上方的手牌
        if (node.parent !== topParent) node.parent = topParent;
        node.setPosition(topParent.convertToNodeSpaceAR(worldPos));
        node.zIndex = cc.macro.MAX_ZINDEX;
        node.setSiblingIndex(topParent.childrenCount - 1);
    }

    /** 复位结果气泡到原始父节点/层级 */
    private _restoreInsuranceResult(): void {
        const h = this._insResultHome;
        if (!h || !h.node || !cc.isValid(h.parent)) {
            this._insResultHome = null;
            return;
        }
        if (h.node.parent !== h.parent) h.node.parent = h.parent;
        h.node.setPosition(h.pos);
        h.node.zIndex = h.z;
        if (h.sibling >= 0) h.node.setSiblingIndex(Math.min(h.sibling, h.parent.childrenCount - 1));
        this._insResultHome = null;
    }

    private async CloseInsuranceBaoBubaoBubble() {
        await TimeHelper.Sleep(2000);
        if (this.uirc.Image_BubbleInsuranceNum.activeInHierarchy) {
            this.uirc.Image_BubbleInsuranceNum.active = false;
        }
        if (this.uirc.Image_BubbleInsuranceToubao.activeInHierarchy) {
            this.uirc.Image_BubbleInsuranceToubao.active = false;
        }
        this._restoreInsuranceResult();
    }

    //刷新猎人头奖励
    public UpdateHunterAward() {
        if (null == this.Player) {
            this.uirc.Image_CoinShadow.active = false;
            return;
        }
        let value = this.Player.HunterHeadValue + this.Player.HunterKillAwardOther + this.Player.MttHunterKillAwardOtherPlus;
        this.uirc.Image_CoinShadow.active = value > 0;
        this.uirc.Image_CoinShadow.getChildByName('Text').getComponent(cc.Label).string =
            GameCache.Instance.gold_type == 4 ? value.toString() : StringHelper.GetLongString(value);
        // if (UIMTTModel.Instance.MttInfo.mtt != null) {
        //     this.uirc.Image_CoinShadow.getChildByName("uc").active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 1;
        //     this.uirc.Image_CoinShadow.getChildByName("gc").active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 2;
        // }
    }

    //////////////////////////////////////
    public ResetShowCardsId(): void {
        if (this.showCardsId == null) {
            this.showCardsId = [];
        } else {
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
        this.uirc.Head_CD_Label.node.active = true;
        this.isCountDown = true;
    }

    //隐藏头像CD
    HideHeadCD() {
        this.uirc.Head_CD.active = false;
        this.uirc.Head_CD_Label.node.active = false;
        this.isCountDown = false;
    }

    //刷新座位下方筹码数
    public UpdateCoin(): void {
        if (this.Player?.chips >= 0) {
            this.SetCoin(GameUtil.TransBetValue(this.Player.chips));
        } else {
            this.SetCoin('');
        }
        // if (this.IsMySeat) {
        //     this.uirc.Coin_Con.setPosition(GameUtil.SeatGoldPos[1]);
        // } else {
        //     this.uirc.Coin_Con.setPosition(GameUtil.SeatGoldPos[0]);
        // }
    }

    /** 在桌总额（含待生效的补充筹码 cacheAddChips），对齐 Unity BaseSeat.GetTableChips。
     *  未行动：chips + cacheAddChips；已行动：cacheChips + cacheAddChips */
    public GetTableChips(): number {
        if (!this.Player) return 0;
        const add = this.Player.cacheAddChips || 0;
        if (this.Player.actionStatus !== Def.Action.NONE) {
            return this.Player.cacheChips + add;
        }
        return this.Player.chips + add;
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
