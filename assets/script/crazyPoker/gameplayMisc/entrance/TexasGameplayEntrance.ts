import { GameCache } from "../../../game/GameCache";
import ProtocolAgency from "../../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../../net/websocket/ProtocolCode";
import { ClientMessageRooms } from "../../../protobuf/holdem/req_rpc_rooms_pb";
import AGameplayEntrance, { LoadIndicator } from "./AGameplayEntrance";

/**
 * @description 德州玩法入口
 */
export default class TexasGameplayEntrance extends AGameplayEntrance {

    /**
     * @param roomType 玩法类型
     * @param matchId 比赛id
     * @param roomId 房间id
     */
    constructor(roomType: number, matchId: number, roomId: number) {
        super(roomType, matchId, roomId);
    }

    /**
     * 是否可复用表现层
     * @param roomType 玩法类型
     */
    public override isCanReuseViewLayer(roomType: number): boolean {
        // TODO: 横屏切换
        return false;
    }

    /**
     * 通信层进入玩法
     * @param isEnterForeground 是否进入前台
     */
    protected override async messageLayerEnterAsync(isEnterForeground: boolean): Promise<boolean> {
        console.log(`${this.constructor.name}: messageLayerEnterAsync: ${this.tableId}, isEnterForeground=${isEnterForeground}`);

        // 等待房间信息返回（由 ProcedureEnterTexas.OnMsgHoldemRooms 触发）

        this.RequestRoomInfo();

        try {
            this._roomInfo = await this._roomInfoPromise;
        }
        catch (error) {
            console.error(`${this.constructor.name}: messageLayerEnterAsync: wait room info failed, ${error}`);
            return false;
        }

        // 检查房间状态
        // const checkRoomStatus: boolean = await this.checkCanEnterForRoomStatus();
        // if (!checkRoomStatus) {
        //     return false;
        // }

        // 检查是否可以进入
        const isCanEnter: boolean = await this.checkCanEnterAsync(isEnterForeground);
        console.log(`${this.constructor.name}: messageLayerEnterAsync - CanEnter: ${isCanEnter}`);

        if (!isCanEnter) {
            return false;
        }

        // 请求进入房间
        this._enterStatus = await this.requestEnterAsync(true);

        console.log(`${this.constructor.name}: messageLayerEnterAsync - EnterStatus: ${this._enterStatus}`);

        if (this._enterStatus != 0 && this._enterStatus != 1015) {
            if (!this._isHasToast) {
                this._isHasToast = true;
                // TODO: 显示错误提示
            }
            return false;
        }

        return true;
    }

    /**
     * 请求房间信息
     */
    private async requestRoomInfoAsync(): Promise<number> {
        // TODO: 发送请求房间信息协议
        return 0;
    }

    /**
     * 请求房间信息
     */
    RequestRoomInfo() {

        let send_obj = {
            Code: ProtocolCode.Protocol_Holdem_Rooms,
            RoomID: 0,
            MatchID: 0,
            Body: {
                roomIdList: [this._roomId],
                // roomIdList: [12],
                rpcId: 1,
            },
        }

        ProtocolAgency.Send<ClientMessageRooms.AsObject>(send_obj);

    }

    /**
     * 根据房间状态检查是否可以进入
     */
    private async checkCanEnterForRoomStatus(): Promise<boolean> {
        // TODO: 根据房间状态判断是否可以进入
        // 状态 3 = 强制关闭, 4 = ?
        return true;
    }

    /**
     * 检查是否可以进入
     * @param isEnterForeground 是否进入前台
     */
    private async checkCanEnterAsync(isEnterForeground: boolean): Promise<boolean> {
        // TODO: 检查是否可以进入房间（人脸验证、金币检查等）
        return true;
    }

    /**
     * 通信层离开玩法
     */
    public override messageLayerLeave(): void {
        // TODO: 发送离开房间消息
    }

    /**
     * 加载整个玩法
     */
    protected override loadGameplay(): any {
        console.log(`${this.constructor.name}: loadGameplay: ${this.tableId}`);
        // TODO: 加载德州玩法
        return null;
    }

    /**
     * 卸载逻辑层
     */
    protected override unloadLogicLayer(): void {
        super.unloadLogicLayer();
    }

    /**
     * 卸载表现层
     * @param loadIndicator 卸载玩法表现层后执行何种加载行为
     */
    protected override unloadViewLayer(loadIndicator: LoadIndicator): void {
        console.log(`${this.constructor.name}: unloadViewLayer: ${this.tableId}, loadIndicator=${loadIndicator}`);
        // TODO: 卸载德州玩法表现层
        super.unloadViewLayer(loadIndicator);
    }

    /**
     * 加载玩法前缓存相关全局数据
     * @param isClear 是否清理缓存数据
     */
    protected override cacheGlobalDataBeforeLoad(isClear: boolean): void {
        super.cacheGlobalDataBeforeLoad(isClear);

        console.log(`${this.constructor.name}: cacheGlobalDataBeforeLoad: ${this._roomInfo.rid}, isClear=${isClear}`);

        // 特殊处理与房间存续期相关的数据缓存逻辑
        GameCache.Instance._roomDurationTime = isClear ? 0 : this._roomInfo.playDuration;
        if (isClear) {
            GameCache.Instance._roomStartTime = 0;
            GameCache.Instance._roomEndTime = 0;
        }
        else {
            // 房间的start time是个动态数据, 缓存的roomInfo中此数据可能已经失效
            // 不要因为就只想获得这个数据再请求一次roomInfo，太耗
            // 此时进入房间所必须的所有数据都已准备好, 直接使用enter room响应中的返回值才是实时的
            // TODO: 需要从enter room响应中获取 startTime (需要协议支持)
            // C#: var enterResponse = (_protoEnterResponse as Protocol_Holdem_EnterRoom).response;
            // C#: GameCache.Instance._roomStartTime = enterResponse.RoomInfo.StartTime;
            GameCache.Instance._roomStartTime = 0;
            if (GameCache.Instance._roomStartTime == 0) {
                // 房间还未开始
                GameCache.Instance._roomStartTime = Math.floor(Date.now() / 1000);
            }
            GameCache.Instance._roomEndTime = GameCache.Instance._roomStartTime + this._roomInfo.playDuration;
        }

        GameCache.Instance._serviceId = isClear ? "" : this._roomInfo.serviceId;
        GameCache.Instance.roomName = isClear ? "" : this._roomInfo.name;
        GameCache.Instance.game_type = isClear ? 0 : this._roomInfo.gameType;
        GameCache.Instance.poker_type = isClear ? 0 : this._roomInfo.pokerType;
        GameCache.Instance.bet_type = isClear ? 0 : this._roomInfo.limitBetType;
        GameCache.Instance.gold_type = isClear ? 0 : this._roomInfo.goldType;

        // 俱乐部id
        GameCache.Instance._texasData._clubId = isClear ? 0 : this._roomInfo.clubId;
        // 联盟id
        GameCache.Instance._texasData._tribeId = isClear ? 0 : this._roomInfo.tribeId;
        GameCache.Instance.seat_count = isClear ? 0 : this._roomInfo.seatCount;
        GameCache.Instance._wheelTemplateId = isClear ? 0 : this._roomInfo.wheelTemplateId;
        GameCache.Instance.straddle = isClear ? 0 : this._roomInfo.straddleOn;
        GameCache.Instance._straddleMax = isClear ? 0 : this._roomInfo.straddleMax;
        GameCache.Instance._secondPcsOn = isClear ? false : this._roomInfo.secondPcsOn == 1;
        GameCache.Instance._texasData._isOpenInsurance = isClear ? false : this._roomInfo.insuranceOn != 0;
        GameCache.Instance._texasData._insuranceMode = isClear ? 0 : this._roomInfo.insuranceMode;
        GameCache.Instance._selectedOuts = isClear ? 0 : this._roomInfo.selectOuts;
        GameCache.Instance._bringInLimitType = isClear ? 0 : this._roomInfo.bringinLimitType;
        GameCache.Instance._muck = isClear ? 0 : this._roomInfo.muckOn;
        GameCache.Instance._isShowLeftTime = isClear ? false : false;
        GameCache.Instance._tableSkin = isClear ? "" : this._roomInfo.tableclothTag;
        GameCache.Instance._shareTableType = isClear ? 0 : this._roomInfo.shareTable;
        GameCache.Instance._originType = isClear ? 0 : this._roomInfo.originType;
        GameCache.Instance._friendsTableCode = isClear ? "" : this._roomInfo.invitationCode;
        GameCache.Instance._friendsTableLimitBringIn = isClear ? false : (this._roomInfo.limitBringIn > 0);
        GameCache.Instance._chatType = isClear ? 0 : this._roomInfo.chatType;
        GameCache.Instance._autoRecharge = isClear ? 0 : this._roomInfo.autoOnTableSwitch;
        GameCache.Instance._currentRoomID = isClear ? 0 : this._roomId;
        GameCache.Instance._isRoomManager = isClear ? false : this._roomInfo.roomAdmin?.isAdmin;
        GameCache.Instance._isHasDisbandRoomPrivileges = isClear ? false : this._roomInfo.roomAdmin?.disbandRoom == 1;
        GameCache.Instance._isHasUseLeavePrivileges = isClear ? false : this._roomInfo.roomAdmin?.userLeave == 1;
        GameCache.Instance._isHasUserStandUpPrivileges = isClear ? false : this._roomInfo.roomAdmin?.userStandUp == 1;
        GameCache.Instance._isHasViewVideoPrivileges = isClear ? false : this._roomInfo.roomAdmin?.viewVideo == 1;
        GameCache.Instance._texasData._isBombPot = isClear ? false : this._roomInfo.bombpot == 1;
        GameCache.Instance._creatorId = isClear ? 0 : this._roomInfo.creatorRandomId;
        GameCache.Instance._settlementType = isClear ? 0 : this._roomInfo.settlementType;
        GameCache.Instance._poolRateSwitch = isClear ? 0 : this._roomInfo.hcPoolRateLv;
        GameCache.Instance._poolRate = isClear ? 0 : this._roomInfo.hcPoolRate;
        GameCache.Instance._totalHandSwitch = isClear ? 0 : this._roomInfo.hcTotalHandLv;
        GameCache.Instance._totalHand = isClear ? 0 : this._roomInfo.hcTotalHand;
        GameCache.Instance._randomSeat = isClear ? 0 : this._roomInfo.randomSeat;
        GameCache.Instance._forceShowCard = isClear ? 0 : this._roomInfo.forceShowCard;
        GameCache.Instance._squidForceShowCard = isClear ? 0 : this._roomInfo.squidForceShowCard;
        GameCache.Instance._onlyIOS = isClear ? 0 : this._roomInfo.onlyIos;
        GameCache.Instance._playHandsLimit = isClear ? 0 : this._roomInfo.playHandsLimit;
        GameCache.Instance._notEnoughCloseDuration = isClear ? 0 : this._roomInfo.notEnoughCloseDuration;
        GameCache.Instance._playDurationType = isClear ? 0 : this._roomInfo.playDurationType;
        GameCache.Instance._limitDelayTimes = isClear ? 0 : this._roomInfo.limitDelayTimes;
        GameCache.Instance._lookHandCard = isClear ? 0 : this._roomInfo.viewPlayerCards;
        GameCache.Instance._blockchainType = isClear ? 0 : this._roomInfo.encryptCards;
        GameCache.Instance._bringinEqualLeader = isClear ? 0 : this._roomInfo.bringinEqualLeader;
        GameCache.Instance._minPlayerChipRate = isClear ? 0 : this._roomInfo.minPlayerChipRate;
        GameCache.Instance._maxBringinTotalRate = isClear ? 0 : this._roomInfo.maxBringinTotalRate;
        GameCache.Instance._texasData._jackpot = isClear ? 0 : this._roomInfo.jackpot;
        GameCache.Instance._jackpotId = isClear ? 0 : this._roomInfo.jackpotId;
        GameCache.Instance._texasData._jackpotGold = isClear ? 0 : this._roomInfo.jackpotGold;
        GameCache.Instance._texasData._jackpotParentGold = isClear ? 0 : this._roomInfo.jackpotParentGold;
        GameCache.Instance._texasData._jackpotConfig = isClear ? null : this._roomInfo.jackpotConfig;
        GameCache.Instance._texasData._limitRetainMinRate = isClear ? 0 : this._roomInfo.retainMinRate;
        GameCache.Instance._autoStartMinPlayer = isClear ? 0 : this._roomInfo.autostartMinPlayers;
        GameCache.Instance._minPlayer = isClear ? 0 : this._roomInfo.minPlayers;
        GameCache.Instance._texasData._retainMinRate = isClear ? 0 : this._roomInfo.retainMinRate;
        GameCache.Instance._texasData._retainMaxRate = isClear ? 0 : this._roomInfo.retainMaxRate;
        GameCache.Instance._opDuration = isClear ? 0 : this._roomInfo.opDuration;
        GameCache.Instance._texasData._allinBanChatType = isClear ? 0 : this._roomInfo.allInMute;
        GameCache.Instance._texasData._insuranceForceBuyRatio = isClear ? 0 : this._roomInfo.insuranceForceBuyRatio;

        // 多语言房间名设置
        if (isClear) {
            GameCache.Instance._multiLanguage = null;
        }
        else {
            // TODO: 多语言处理 - 需要MultiLanguage类和相关反射实现
            // C#: GameCache.Instance._multiLanguage = GameCache.Instance._multiLanguage ?? new MultiLanguage();
            // C#: foreach (var mlName in _roomInfo.MultiLangNames) { ... }
        }

        GameCache.Instance._antiCheatType = isClear ? 0 : this._roomInfo.antiCheatType;
        // TODO: 需要AntiCheatType枚举定义，4 = VIDEO
        const AntiCheatType_VIDEO = 4;
        if (GameCache.Instance._antiCheatType == AntiCheatType_VIDEO) {
            GameCache.Instance._videoModel = this._roomInfo.antiCheatVideoType;
        }
        else {
            GameCache.Instance._videoModel = 0;
        }

        GameCache.Instance._normalAntiCheatOrderType = isClear ? 0 : this._roomInfo.antiCheatOrderType;
        GameCache.Instance._normalAntiCheatOrderMicType = isClear ? 0 : this._roomInfo.antiCheatOrderMicType;
        GameCache.Instance._antiCheatTimeLimit = isClear ? 0 : this._roomInfo.antiCheatTimelimit;
        GameCache.Instance._videoEffectType = isClear ? 0 : this._roomInfo.videoEffectType;
        GameCache.Instance._videoPowerSaving = isClear ? 0 : this._roomInfo.powerSaving;
        GameCache.Instance._videoVerifyType = isClear ? 0 : this._roomInfo.videoVerifyType;

        // 保险赔率表 - TODO: 需要GameUtil._outsList实现
        // C#: GameUtil._outsList.Clear();
        // C#: foreach (var insurance in _roomInfo.InsuranceOdds) { ... }
        // C#: GameUtil._outsList.Add((uint)insurance.PotUserCount, oddsList);

        if (!isClear) {
            // 鱿鱼设置
            if (this._roomInfo.squidBase == 0 && (this._roomInfo.subConfigsList == null || this._roomInfo.subConfigsList.length == 0)) {
                GameCache.Instance._texasData._squidBase = this._roomInfo.squidBase;
            }
            else {
                GameCache.Instance._texasData._squidMostGet = this._roomInfo.squidMostGet;
                GameCache.Instance._texasData._squidBetGet = this._roomInfo.squidBetGet;
                GameCache.Instance._texasData._squidHead = this._roomInfo.squidHead;
                GameCache.Instance._texasData._squidTail = this._roomInfo.squidTail;
                GameCache.Instance._texasData._squidMaxCount = this._roomInfo.squidMax;
                GameCache.Instance._texasData._squidRound = this._roomInfo.rounds;
                GameCache.Instance._texasData._squidMode = this._roomInfo.squidMode;
                GameCache.Instance._texasData._squidExtraCount = this._roomInfo.squidExtraCount;
                GameCache.Instance._texasData._squidCountRates = this._roomInfo.squidCountRateList || [];
                GameCache.Instance._texasData._squidDepositPercent = this._roomInfo.depositPercent;
                if (this._roomInfo.subConfigsList != null && this._roomInfo.subConfigsList.length > 0) {
                    GameCache.Instance._texasData._squidOpenNumber =
                        this._roomInfo.subConfigsList[0].playingPlayerCountLimit;
                }
                else {
                    GameCache.Instance._texasData._squidOpenNumber = this._roomInfo.squidPlayerCount;
                }

                if (this._roomInfo.squidBase == 0) {
                    if (this._roomInfo.subConfigsList != null && this._roomInfo.subConfigsList.length > 0) {
                        GameCache.Instance._texasData._squidBase = this._roomInfo.subConfigsList[0].squidBase;
                    }
                }
                else {
                    GameCache.Instance._texasData._squidBase = this._roomInfo.squidBase;
                }
            }

            if (!GameCache.Instance._texasData._isSquidEnable) {
                if (this._roomInfo.subConfigsList != null && this._roomInfo.subConfigsList.length > 0) {
                    GameCache.Instance._texasData._subGamePlayAnte = this._roomInfo.subConfigsList[0].ante;
                    GameCache.Instance._texasData._isCriticalHitEnable =
                        this._roomInfo.subConfigsList[0].criticalHit == 1;
                }
                else {
                    GameCache.Instance._texasData._subGamePlayAnte = 0;
                    GameCache.Instance._texasData._isCriticalHitEnable = false;
                }

                GameCache.Instance._texasData._criticalHitRound = this._roomInfo.rounds;
            }

            // Club/Tribe 权限缓存 - TODO: 需要对应实现
            // C#: GameCache.Instance._clubRoomPermissionsPart.CacheClubRoomPermission(...);
            // C#: GameCache.Instance._tribeBlackUserDataPart.CacheBlackUserList(...);
            // C#: GameCache.Instance._jackpotTemplateListPart.CacheJackpotAwardDetail(...);
            // C#: GameCache.Instance._wheelTemplateListPart.CacheAwardDetail(...);
        }
        else {
            // 鱿鱼设置 isClear
            GameCache.Instance._texasData._squidBase = 0;
            GameCache.Instance._texasData._squidMostGet = 0;
            GameCache.Instance._texasData._squidBetGet = 0;
            GameCache.Instance._texasData._squidHead = 0;
            GameCache.Instance._texasData._squidTail = 0;
            GameCache.Instance._texasData._squidMaxCount = 0;
            GameCache.Instance._texasData._squidRound = 0;
            GameCache.Instance._texasData._squidOpenNumber = 0;
            GameCache.Instance._texasData._subGamePlayAnte = 0;
            GameCache.Instance._texasData._criticalHitRound = 0;
            GameCache.Instance._texasData._isCriticalHitEnable = false;
            GameCache.Instance._texasData._squidMode = 0;
            GameCache.Instance._texasData._squidExtraCount = 0;
            GameCache.Instance._texasData._squidCountRates = [];
            GameCache.Instance._texasData._squidDepositPercent = 0;
        }

        // 新增字段 (C# 408-417行)
        GameCache.Instance._texasData._mushroomMode = isClear ? 0 : this._roomInfo.mushroomMode;
        GameCache.Instance._texasData._mushroomBase = isClear ? 0 : this._roomInfo.mushroomBase;
        // TODO: _enterRoomType 枚举定义
        // C#: (EnterRoomType)_roomInfo.EnterRoomType
        GameCache.Instance._enterRoomType = isClear ? 0 : this._roomInfo.enterRoomType;
        GameCache.Instance._isWhiteList = isClear ? false : this._roomInfo.isWhitelist;
        GameCache.Instance._texasData._anteRandomJumpConfig = isClear ? "" : this._roomInfo.randomAnte;
        GameCache.Instance._texasData._callTime = isClear ? 0 : this._roomInfo.calltime;
        GameCache.Instance._texasData._callTimeWinline = isClear ? 0 : this._roomInfo.calltimeWinLine;
        GameCache.Instance._texasData._callTimeLimitCount = isClear ? 0 : this._roomInfo.calltimeLimit;
        GameCache.Instance._texasData._autoChangeTable = isClear ? 0 : this._roomInfo.autoChangeRoomLimitHand;
    }

    /**
     * 请求进入房间
     * @param isUseCache 是否使用缓存
     */
    public override async requestEnterAsync(isUseCache: boolean): Promise<number> {
        // TODO: 请求进入德州房间
        return 0;
    }
}
