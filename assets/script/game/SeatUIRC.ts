import { UIDefine } from "../define/UIDefine";
import { ClubCache } from "../frame/data/club/ClubCache";
import GC from "../frame/GameControl";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { i18nMgr } from "../i18n/i18nMgr";
import { UIMineModel } from "../uimodel/UIMineModel";
import { WebUserRoomBringin, WWW } from "../net/https/WebRequest";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def } from "../protobuf/holdem/define_pb";
import { ClientMessageKeepSeatActive } from "../protobuf/holdem/req_th_keep_seat_active_pb";
import { ClientMessageShowdown } from "../protobuf/holdem/req_th_showdown_pb";
import UIDialogComponent, { UIDialogParam } from "../ui/dialog/UIDialogComponent";
import UIBase from "../ui/UIBase";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import { GameCache } from "./GameCache";
import { AddClipsData } from "./new_ui/UIBringIn";
import Seat, { VoiceprintState } from "./seat/Seat";
import GameUtil from "./util/GameUtil";

export class CardUIInfo {
    public imageSelect: cc.Sprite = null;
    public imageBack: cc.Sprite = null;
    public imageEye: cc.Sprite = null;
    public cardId: number;
    constructor(public imageCard: cc.Node) {
        this.imageSelect = imageCard
            .getChildByName("Image_SelectCard")
            ?.getComponent(cc.Sprite);
        this.imageBack = imageCard
            .getChildByName("Image_CardBack")
            ?.getComponent(cc.Sprite);
        this.imageEye = imageCard
            .getChildByName("Image_EyeCard")
            ?.getComponent(cc.Sprite);
    }
    SetSpriteFrame(cardId: number) {
        this.cardId = cardId;
        this.UpdateSpriteFrame();
    }
    UpdateSpriteFrame() {
        this.imageCard.getComponent(cc.Sprite).spriteFrame =
            GameCache.Instance.CurGame.GetBigPokerSP(
                GameUtil.GetCardNameByNum(this.cardId),
            );
    }
}

const { ccclass, property } = cc._decorator;

/** 麦克风图标状态 */
export enum MicIconState {
    /** 不显示图标 */
    HIDDEN = 0,
    /** 正在说话（喇叭图标） */
    SPEAKING = 1,
    /** 麦克风被禁止 */
    MUTED = 2,
}

@ccclass
export default class SeatUIRC extends UIBase {
    ///////////////////////////////////
    /**
     * 节点|组件 定义
     */

    @property({ tooltip: '正在说话时显示的喇叭图标', type: cc.SpriteFrame })
    speakingIcon: cc.SpriteFrame = null;

    @property({ tooltip: '麦克风被禁止时显示的图标', type: cc.SpriteFrame })
    micMutedIcon: cc.SpriteFrame = null;

    Head: cc.Node = null;
    imageHeadFrame: cc.Node = null;
    imageEmpty: cc.Sprite = null;

    //头像容器
    Frame_Head: cc.Node = null;
    //头像图片
    Raw_Head: cc.Sprite = null;
    //头像灰色蒙版
    Gray_Head: cc.Node = null;

    //麦克风状态图标（动态创建）
    MicIcon: cc.Node = null;
    MicIconSprite: cc.Sprite = null;
    /** 当前麦克风图标状态 */
    private _micIconState: MicIconState = MicIconState.HIDDEN;
    //座位上下名字和筹码
    Nick_Coin: cc.Node = null;
    table_sprite_line: cc.Node = null;
    Text_NickName: cc.Label = null;

    Coin_Con: cc.Node = null; //手上筹码容器 位置自己和Other -109 -187
    Text_Coin: cc.Label = null;
    TextRequesting: cc.Label = null; //带入申请提示中

    WaitforthenextmoveTips: cc.Label = null;

    transCurRoundHaveBet: cc.Node = null;
    Bet_Bg: cc.Node = null;
    imageIconChip: cc.Sprite = null;
    textCurRoundHaveBet: cc.Label = null;

    transSmallCardBacks: cc.Node = null;
    imageBanker: cc.Node = null;

    // 蘑菇池（座位级，靠近庄家位）
    MushroomPool: cc.Node = null;
    MushroomIcon: cc.Sprite = null;
    MushroomLabel: cc.Node = null;
    Label_MushroomCount: cc.Label = null;
    MushroomChip: cc.Node = null;
    Label_MushroomChip: cc.Label = null;
    // 鱿鱼数量组件（玩家）
    PlayerSquidCount: cc.Node = null;
    PlayerSquidIcon: cc.Node = null;
    PlayerSquidLabel: cc.Node = null;
    Label_SquidCount: cc.Label = null;
    Head_Squid_Mask: cc.Node = null;


    Head_CD: cc.Node = null;
    Head_CD_Label: cc.Label = null;
    Head_CD_Mask: cc.Sprite = null;

    imageCardType: cc.Sprite = null;
    textCardType: cc.Label = null;
    imageSmallCardType: cc.Sprite = null;
    textSmallCardType: cc.Label = null;

    imageRecyclingWinChip: cc.Sprite = null;

    buttonCancelReserveSeat: cc.Node = null;
    textCancelReserveSeat: cc.Label = null;

    imageOffline: cc.Node = null;

    Image_Bubble: cc.Node = null;
    textBubble: cc.Label = null;

    //保险
    Image_BubbleInsuranceNum: cc.Node = null;

    Image_BubbleInsuranceToubao: cc.Node = null;

    //返回座位
    imageReserveSeat: cc.Node = null;
    //返回座位时间
    m_ReserveTime: cc.Label = null;
    //托管
    Image_Trust: cc.Node = null;

    //猎人头奖励
    Image_CoinShadow: cc.Node = null;

    //用来设置操作面板的位置
    Operation_Pos_Mark: cc.Node = null;
    ///////////////////////////////////

    ///////////////////////////////////
    /**
     * 声明内容
     */
    public seat: Seat = null;

    public voiceprintList: cc.Node[];

    //主玩家手牌节点列表
    imageCards: CardUIInfo[];
    imageSmallCards: CardUIInfo[];
    imageSmallCardBacks: cc.Sprite[];

    //winner动画
    Spine_Winner: sp.Skeleton = null;

    //保险状态
    Image_BubbleInsuranceCountDown: cc.Node = null;
    Text_BubbleInsuranceCountDown: cc.Label = null;

    ///////////////////////////////////
    protected override lateLoad(): void {
        super.lateLoad();
        this.Head = this.getChildNodeOrComponent("Head");

        this.imageEmpty = this.getChildNodeOrComponent(
            "Image_Empty",
            cc.Sprite,
        );
        this.Frame_Head = this.getChildNodeOrComponent("Frame_Head");
        this.Raw_Head = this.getChildNodeOrComponent("Raw_Head", cc.Sprite);
        this.Gray_Head = this.getChildNodeOrComponent("Gray_Head");

        // 动态创建麦克风状态图标
        this._createMicIcon();

        this.Nick_Coin = this.getChildNodeOrComponent("Nick_Coin");
        this.table_sprite_line = this.getChildNodeOrComponent("table_sprite_line");
        if (this.Nick_Coin) {
            this.Nick_Coin.active = false;
        }
        if (this.table_sprite_line) {
            this.table_sprite_line.opacity = 0;
            this.table_sprite_line.color = cc.Color.WHITE;
        }
        this.Coin_Con = this.getChildNodeOrComponent("Coin_Con");
        this.Text_Coin = this.getChildNodeOrComponent("Text_Coin", cc.Label);
        this.Text_NickName = this.getChildNodeOrComponent(
            "Text_NickName",
            cc.Label,
        );
        this.TextRequesting = this.getChildNodeOrComponent(
            "TextRequesting",
            cc.Label,
        );

        this.WaitforthenextmoveTips = this.getChildNodeOrComponent(
            "WaitforthenextmoveTips",
            cc.Label,
        );

        this.transCurRoundHaveBet = this.getChildNodeOrComponent("CurRoundHaveBet");
        this.Bet_Bg = this.getChildNodeOrComponent("Bet_Bg");
        this.imageIconChip = this.getChildNodeOrComponent("Image_IconChip", cc.Sprite);
        this.textCurRoundHaveBet = this.getChildNodeOrComponent("Text_CurRoundHaveBet", cc.Label);

        this.transSmallCardBacks =
            this.getChildNodeOrComponent("SmallCardBacks");
        this.imageBanker = this.getChildNodeOrComponent("Image_Banker");

        // 蘑菇池（座位模板内，固定路径）
        this.MushroomPool = this.getChildNodeOrComponent("MushroomPool");
        this.MushroomIcon = this.getChildNodeOrComponent("MushroomIcon", cc.Sprite);
        this.MushroomLabel = this.getChildNodeOrComponent("MushroomLabel");
        this.Label_MushroomCount = this.getChildNodeOrComponent("MushroomLabelCount", cc.Label);
        this.MushroomChip = this.getChildNodeOrComponent("MushroomChip");
        this.Label_MushroomChip = this.getChildNodeOrComponent("MushroomChipCount", cc.Label);
        this.PlayerSquidCount = this.getChildNodeOrComponent("PlayerSquidCount");
        this.PlayerSquidIcon = this.PlayerSquidCount?.getChildByName("PlayerSquidIcon");
        this.PlayerSquidLabel = this.PlayerSquidCount?.getChildByName("PlayerSquidLabel");
        this.Label_SquidCount = this.PlayerSquidLabel
            ?.getChildByName("PlayerSquidLabelCount")
            ?.getComponent(cc.Label);
        if (this.PlayerSquidCount) {
            this.PlayerSquidCount.active = false;
        }
        this.Head_Squid_Mask = this.getChildNodeOrComponent("Head_Squid_Mask");
        if (this.Head_Squid_Mask) {
            this.Head_Squid_Mask.active = false;
        }

        this.Spine_Winner = this.getChildNodeOrComponent("Spine_Winner", sp.Skeleton);

        //当前最大6张
        this.imageCards = [];
        this.imageSmallCards = [];
        this.imageSmallCardBacks = [];
        for (let i = 0; i < 6; i++) {
            //自己手牌
            this.imageCards.push(
                new CardUIInfo(this.getChildNodeOrComponent(`Image_Card${i}`)),
            );
            //最后胜利展示牌
            this.imageSmallCards.push(
                new CardUIInfo(
                    this.getChildNodeOrComponent(`Image_SmallCard${i}`),
                ),
            );
            //其他玩家手牌
            this.imageSmallCardBacks.push(
                this.getChildNodeOrComponent(
                    `Image_SmallCardBack${i}`,
                    cc.Sprite,
                ),
            );
        }

        this.Head_CD = this.getChildNodeOrComponent("Head_CD");
        this.Head_CD_Label = this.getChildNodeOrComponent(
            "Head_CD_Label",
            cc.Label,
        );
        this.Head_CD_Mask = this.getChildNodeOrComponent(
            "Head_CD_Mask",
            cc.Sprite,
        );

        this.imageCardType = this.getChildNodeOrComponent(
            "Image_CardType",
            cc.Sprite,
        );
        this.textCardType = this.getChildNodeOrComponent(
            "Text_CardType",
            cc.Label,
        );

        this.imageSmallCardType = this.getChildNodeOrComponent(
            "Image_SmallCardType",
            cc.Sprite,
        );
        this.textSmallCardType = this.getChildNodeOrComponent(
            "Text_SmallCardType",
            cc.Label,
        );

        this.imageRecyclingWinChip = this.getChildNodeOrComponent(
            "Image_RecyclingWinChip",
            cc.Sprite,
        );

        this.buttonCancelReserveSeat = this.getChildNodeOrComponent(
            "Button_CancelReserveSeat",
        );
        this.textCancelReserveSeat = this.getChildNodeOrComponent(
            "Text_CancelReserveSeat",
            cc.Label,
        );
        this.imageReserveSeat = this.getChildNodeOrComponent("Image_ReserveSeat");
        this.m_ReserveTime = this.getChildNodeOrComponent("time", cc.Label);

        this.Image_Trust = this.getChildNodeOrComponent("Image_Trust");

        this.imageOffline = this.getChildNodeOrComponent("imageOffline");

        this.Image_Bubble = this.getChildNodeOrComponent("Image_Bubble");
        this.textBubble = this.getChildNodeOrComponent("Text_Bubble", cc.Label);

        this.Image_BubbleInsuranceNum = this.getChildNodeOrComponent(
            "Image_BubbleInsuranceNum",
        );
        this.Image_BubbleInsuranceToubao = this.getChildNodeOrComponent(
            "Image_BubbleInsuranceToubao",
        );

        this.Image_CoinShadow =
            this.getChildNodeOrComponent("Image_CoinShadow");

        this.Operation_Pos_Mark =
            this.getChildNodeOrComponent("Operation_Pos_Mark");

        this.Image_BubbleInsuranceCountDown = this.getChildNodeOrComponent(
            "Image_BubbleInsuranceCountDown",
        );
        this.Text_BubbleInsuranceCountDown = this.getChildNodeOrComponent(
            "Text_BubbleInsuranceCountDown",
            cc.Label,
        );

        //声纹
        this.voiceprintList = [];
        // this.voiceprintList.Add(VoiceprintStart);
        // this.voiceprintList.Add(VoiceprintEntering);
        // this.voiceprintList.Add(VoiceprintEnd);
        // this.voiceprintList.Add(VoiceprintRobot);
        // this.voiceprintList.Add(VoiceprintReal);
        // this.voiceprintList.Add(VoiceprintVoting);
    }

    /**
     * 动态创建麦克风状态图标节点，挂在 Frame_Head 下
     * 位置在 setMicIconState 时根据座位方向更新
     */
    private _createMicIcon(): void {
        if (!this.Frame_Head) return;

        // 挂在 Head 节点（Frame_Head 的父级）上，避免被 Frame_Head 的 Mask 裁剪
        const parentNode = this.Head || this.Frame_Head.parent || this.Frame_Head;
        this.MicIcon = new cc.Node('MicIcon');
        this.MicIconSprite = this.MicIcon.addComponent(cc.Sprite);
        this.MicIcon.setContentSize(82, 82);
        this.MicIcon.active = false; // 默认隐藏
        parentNode.addChild(this.MicIcon);
    }

    /**
     * 设置麦克风图标状态
     * @param state HIDDEN=不显示, SPEAKING=正在说话, MUTED=麦克风被禁止
     */
    public setMicIconState(state: MicIconState): void {
        if (!this.MicIcon) return;
        this._micIconState = state;

        switch (state) {
            case MicIconState.SPEAKING:
                if (this.speakingIcon) {
                    this.MicIconSprite.spriteFrame = this.speakingIcon;
                    this.MicIcon.active = true;
                } else {
                    this.MicIcon.active = false;
                }
                break;
            case MicIconState.MUTED:
                if (this.micMutedIcon) {
                    this.MicIconSprite.spriteFrame = this.micMutedIcon;
                    this.MicIcon.active = true;
                } else {
                    this.MicIcon.active = false;
                }
                break;
            case MicIconState.HIDDEN:
            default:
                this.MicIcon.active = false;
                break;
        }

        // 每次设置状态时更新图标位置（ClientSeatId 在 UpdateSeatUIInfo 后才确定）
        this._updateMicIconPosition();
    }

    /** 根据座位左右侧更新 MicIcon 的位置（基于 Frame_Head 在 Head 下的坐标） */
    private _updateMicIconPosition(): void {
        if (!this.MicIcon || !this.Frame_Head) return;

        const headPos = this.Frame_Head.getPosition();
        const headSize = this.Frame_Head.getContentSize();
        const iconSize = this.MicIcon.getContentSize();
        const gap = 4; // 图标与头像边缘的间距
        const isRight = this.seat?.GetRorL() ?? false;

        this.MicIcon.y = headPos.y;
        if (isRight) {
            // 右侧座位：图标在头像左侧，往右缩 30px
            this.MicIcon.x = headPos.x - headSize.width / 2 - iconSize.width / 2 - gap + 50;
        } else {
            // 左侧座位：图标在头像右侧，往左缩 50px
            this.MicIcon.x = headPos.x + headSize.width / 2 + iconSize.width / 2 + gap - 50;
        }
    }

    /** 获取当前麦克风图标状态 */
    public get micIconState(): MicIconState {
        return this._micIconState;
    }

    protected override update(dt: number): void {
        //刷新带入申请中倒计时

        if (this.seat?.Player && this.seat.Player.KeepSeatLeftTime > 0) {
            this.seat.Player.KeepSeatLeftTime -= dt;

            let int_left_time = Math.ceil(this.seat.Player.KeepSeatLeftTime);

            this.TextRequesting.string = `${i18nMgr.Get("UITEXAS_PLAYERSEATDOWNTIPS01")}${int_left_time}s`;

            if (int_left_time <= 0) {
                this.seat.Player.KeepSeatLeftTime = -1;
                //this.seat.UpdateRequesting();
                this.TextRequesting.string = "";
            }
        }
    }

    protected override regiterTouchEvents(): void {
        for (let i = 0; i < this.imageCards.length; i++) {
            this.setButtonClick(this.imageCards[i].imageCard, this.onClickCard);
        }
        this.setButtonClick(this.imageEmpty.node, this.onClickEmpty);
        this.setButtonClick(this.Frame_Head, this.onClickHead);
        this.setButtonClick(
            this.buttonCancelReserveSeat,
            this.onClickCancelReserveSeat,
        );
    }

    private onClickCancelReserveSeat(): void {
        UIMineModel.mInstance.ObtainUserInfo((pDto: any) => {
            UIMineModel.mInstance.UIRefreshGoldEvent(); //更新完金币ui
            this.ClickCancelReserveSeat();
        }); //更新用户金币数量
    }

    private ClickCancelReserveSeat(): void {
        if (this.seat.IsMySeat && this.seat.Player.chips <= 0) {
            GameCache.Instance.CurGame.StartAddChips();
        } else {
            ProtocolAgency.Send<ClientMessageKeepSeatActive.AsObject>({
                Code: ProtocolCode.Protocol_Holdem_KeepSeatActive,
                RoomID: GameCache.Instance.room_id,
                MatchID: GameCache.Instance.match_id,
                Body: {
                    room: {
                        roomId: GameCache.Instance.room_id,
                        matchId: GameCache.Instance.match_id,
                    },
                    keep: false,
                    duration: 0,
                },
            });
            GameCache.Instance.CurGame.cacheCancelKeepSeat = true;
        }
    }
    onClickEmpty() {
        UIMineModel.mInstance.ObtainUserInfo((pDto: any) => {
            if (pDto.user.forbid_bring_in == 1) {
                UIComponent.open<UIDialogParam>(UIDefine.UIDialogComponent, {
                    title: "",
                    type: UIDialogComponent.DialogType.Commit,
                    content: i18nMgr.Get("UIForbidBringInTips"),
                    contentCommit: CPErrorCode.LanguageDescription(10012),
                });
                return;
            } else {
                GameCache.Instance.CurGame.Sitdown(
                    this.seat.ClientSeatId,
                    true,
                );
            }
        });
    }
    /// <summary>
    /// 查看玩家信息
    /// </summary>
    /// <param name="go"></param>
    protected onClickHead(): void {
        switch (this.seat.SeatVoiceprintState) {
            case VoiceprintState.Start:
            case VoiceprintState.Recording:
                //             UIComponent.Instance.ShowUI(UIType.UIDialog, new UIDialogComponent.DialogData()
                // 				{
                //                     type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                //                     title = LanguageManager.Get("UiVoiceprint_10001"),
                //                     content = string.Format(LanguageManager.Get("UiVoiceprint_10046"), Player.nick),
                //                     contentCancel = LanguageManager.Get("UiVoiceprint_10030"),
                //                     contentCommit = LanguageManager.Get("UIBackDiolg_Konw_01"),
                //                     actionCancel = () => {
                //                         UIComponent.Instance.ShowUI(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                //     }
                // });
                break;
            case VoiceprintState.Checking:
            case VoiceprintState.None:
            case VoiceprintState.Robot:
            case VoiceprintState.Real:
                // 查看个人信息
                GameCache.Instance.CurGame.CheckPlayerInfo(
                    this.seat.Player.userID,
                    this.seat.Player,
                );
                break;
            case VoiceprintState.Voting:
                if (
                    this.seat.Player.userID ==
                    GameCache.Instance.CurGame.mainPlayer.userID
                ) {
                    GameCache.Instance.CurGame.CheckPlayerInfo(
                        this.seat.Player.userID,
                        this.seat.Player,
                    );
                } else {
                    let seat: Seat = GameCache.Instance.CurGame.GetSeatByUserId(
                        GameCache.Instance.CurGame.mainPlayer.userID,
                    );
                    if (seat != null) {
                        if (seat.Player.seatID >= 0) {
                            // UIComponent.Instance.ShowUI(UIType.UITexasHumanVote, new UITexasHumanVoteComponent.VoteDataInfo()
                            // 	{
                            //         verify_id = this.Player.VoiceprintId,
                            //         name = this.Player.nick,
                            //         updateTime = this.Player.UpdateStateTime,
                            //         userId = this.Player.userID
                            //     });
                        } else {
                            //         UIComponent.Instance.ShowUI(UIType.UIDialog, new UIDialogComponent.DialogData()
                            // 			{
                            //                 type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                            //                 title = "",
                            //                 contentCommit = LanguageManager.Get("adaptation10024"),//知道了
                            //                 contentCancel = LanguageManager.Get("UiVoiceprint_10030"),//验证记录
                            //                 content = LanguageManager.Get("UiVoiceprint_10027"),//上桌后可参与该玩家真人验证投票
                            //                 actionCommit = () => { UIComponent.Instance.Remove(UIType.UIDialog); },
                            //                 actionCancel = () => {
                            //                     UIComponent.Instance.ShowUI(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                            //     }
                            // });
                        }
                    } else {
                        //         UIComponent.Instance.ShowUI(UIType.UIDialog, new UIDialogComponent.DialogData()
                        // 			{
                        //                 type = UIDialogComponent.DialogData.DialogType.CommitCancel,
                        //                 title = "",
                        //                 contentCommit = LanguageManager.Get("adaptation10024"),//知道了
                        //                 contentCancel = LanguageManager.Get("UiVoiceprint_10030"),//验证记录
                        //                 content = LanguageManager.Get("UiVoiceprint_10027"),//上桌后可参与该玩家真人验证投票
                        //                 actionCommit = () => { UIComponent.Instance.Remove(UIType.UIDialog); },
                        //                 actionCancel = () => {
                        //                     UIComponent.Instance.ShowUI(UIType.UITexasHumanVerification, new object[] { GameCache.Instance.room_id, (int)Player.userID, Player.nick });
                        //     }
                        // });
                    }
                }
                break;
            default:
                break;
        }
    }
    protected onClickCard(button: cc.Button): void {
        let mTmpSequencePlayDealAnimation =
            GameCache.Instance.CurGame.GetSequencePlayDealAnimation();
        if (
            null != mTmpSequencePlayDealAnimation &&
            mTmpSequencePlayDealAnimation.IsPlaying
        ) {
            return;
        }
        // 亮牌   弃牌 , 未动作（没有开赛）
        if (
            null == this.seat.Player ||
            this.seat.Player.userID !=
                GameCache.Instance.CurGame.mainPlayer.userID ||
            this.seat.seatID != GameCache.Instance.CurGame.mainPlayer.seatID ||
            !this.seat.Player.isParticipateInTheGame
        ) {
            return;
        }

        let go = button.node;

        let mTmp: string = go.name.substring(go.name.length - 1);
        let mCardIndex: number = +mTmp;

        let mActive: boolean =
            this.seat.listCardUIInfos[mCardIndex].imageEye.node
                .activeInHierarchy;
        this.seat.listCardUIInfos[mCardIndex].imageEye.node.active = !mActive;
        this.seat.showCardsId[mCardIndex] = !mActive ? 1 : 0;
        ProtocolAgency.Send<ClientMessageShowdown.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Showdown,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: {
                    roomId: GameCache.Instance.room_id,
                    matchId: GameCache.Instance.match_id,
                },
                showCardsList: this.seat.showCardsId,
            },
        });
    }
}
