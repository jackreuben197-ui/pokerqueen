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
        cc.log(`${this.constructor.name}: messageLayerEnterAsync: ${this.tableId}, isEnterForeground=${isEnterForeground}`);

        // 等待房间信息返回（由 ProcedureEnterTexas.OnMsgHoldemRooms 触发）

        this.RequestRoomInfo();

        try {
            await this._roomInfoPromise;
        }
        catch (error) {
            cc.error(`${this.constructor.name}: messageLayerEnterAsync: wait room info failed, ${error}`);
            return false;
        }

        // 检查房间状态
        // const checkRoomStatus: boolean = await this.checkCanEnterForRoomStatus();
        // if (!checkRoomStatus) {
        //     return false;
        // }

        // 检查是否可以进入
        const isCanEnter: boolean = await this.checkCanEnterAsync(isEnterForeground);
        cc.log(`${this.constructor.name}: messageLayerEnterAsync - CanEnter: ${isCanEnter}`);

        if (!isCanEnter) {
            return false;
        }

        // 请求进入房间
        this._enterStatus = await this.requestEnterAsync(true);

        cc.log(`${this.constructor.name}: messageLayerEnterAsync - EnterStatus: ${this._enterStatus}`);

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
        cc.log(`${this.constructor.name}: loadGameplay: ${this.tableId}`);
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
        cc.log(`${this.constructor.name}: unloadViewLayer: ${this.tableId}, loadIndicator=${loadIndicator}`);
        // TODO: 卸载德州玩法表现层
        super.unloadViewLayer(loadIndicator);
    }

    /**
     * 加载玩法前缓存相关全局数据
     * @param isClear 是否清理缓存数据
     */
    protected override cacheGlobalDataBeforeLoad(isClear: boolean): void {
        super.cacheGlobalDataBeforeLoad(isClear);

        if (!isClear) {

            // TODO: 缓存德州相关数据
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
                GameCache.Instance._texasData._squidCountRates = this._roomInfo.squidCountRateList;
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

        }
        else {
            // 鱿鱼设置
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
