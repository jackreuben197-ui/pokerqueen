import { ProcedureEnum } from '../define/EIDefine';
import { GameCache } from '../game/GameCache';
import H5MsgMgr from '../H5MsgMgr';
import ProcedureManager from '../manager/ProcedureManager';
import { PreloadDefinitionTexas, PreloadParams } from '../manager/ResManager';
import UIComponent, { PrefabUI } from '../ui/UIComponent';
import ProcedureBase from './ProcedureBase';
import AGameplayEntrance from '../crazyPoker/gameplayMisc/entrance/AGameplayEntrance';
import { AGameplayEntranceProvider } from '../crazyPoker/gameplayMisc/entrance/AGamelayEntranceProvider';
import { ProcedureReturnNavigateParam } from './ProcedureReturn';

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {
    Name: string = 'ProcedureEnterTexas';
    /**
     * 德州玩法入口实例
     */
    private _entrance: AGameplayEntrance = null;
    /** 是否正在进入房间（用于判断 wsError 是否发生在进房过程中） */
    private _isEntering: boolean = false;

    override lateEnter<T>(param?: T) {
        super.lateEnter(param);
        if (!param) console.log('[ProcedureEnterTexas]', 'miss param');
        H5MsgMgr.sendToH5('h5Hide', 1);
        // 监听 wsError：进房过程中 WS 断开则直接退回 H5
        this._isEntering = true;
        H5MsgMgr.Instance.on('wsError', this._onWsError);
        // 创建德州玩法入口
        const entrance = AGameplayEntranceProvider.createEntrance(GameCache.Instance.room_type, GameCache.Instance.match_id, GameCache.Instance.room_id);
        // 使用老路由方式
        entrance.oldPathForEnter = true;
        this._entrance = entrance;
        this.onComplete();
    }

    /**
     * @param rec 房间信息
     */
    // private onMsgHoldemRooms(rec: ServerMessageRooms.AsObject) {
    //     if (rec == null) {
    //         UIComponent.Instance.Toast(i18nMgr.Get("EnterForegroundFail"));
    //         this._entrance._roomInfoReject(new Error("room info is null"));
    //         this.returnBackToH5(PrefabUI.UIPreloading);
    //         return;
    //     }
    //     if (rec.status != 0) {
    //         //TODO toast无法生效，返回H5应该是把cc卸载掉了
    //         UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
    //         this._entrance._roomInfoReject(new Error(`status=${rec.status}`));
    //         this.returnBackToH5(PrefabUI.UIPreloading);
    //         return;
    //     }
    //     // 取房间列表中的第一个房间记录
    //     let roomRecord: RoomRecord.AsObject;
    //     if (rec.roomsList && rec.roomsList.length > 0) {
    //         roomRecord = rec.roomsList[0];
    //     }
    //     else {
    //         UIComponent.Instance.Toast(i18nMgr.Get("EnterForegroundFail"));
    //         this._entrance._roomInfoReject(new Error("roomsList is empty"));
    //         this.returnBackToH5(PrefabUI.UIPreloading);
    //         return;
    //     }
    //     // 查看房间数据是否合法
    //     if (roomRecord?.status == 3) {
    //         UIComponent.Instance.Toast(i18nMgr.Get("GameRoom_ForceCloseTips"));
    //         this._entrance._roomInfoReject(new Error("room status=3"));
    //         this.returnBackToH5(PrefabUI.UIPreloading);
    //         return;
    //     }
    //     if (roomRecord?.status == 4) {
    //         //TODO 暂时不处理
    //     }
    //     // 设置房间信息并 resolve Promise
    //     GameCache.Instance._roomRecord = roomRecord;
    //     this._entrance._roomInfoResolve(roomRecord);
    //     GameCache.Instance.enter_param = this.param;
    //     ProcedureManager.StartProcedure(ProcedureEnum.Texas, this.param);
    // }

    Leave() {
        this._isEntering = false;
        H5MsgMgr.Instance.off('wsError');
        super.Leave();
    }

    /**
     * WS 断开回调：进房过程中如果 WS 断开，直接退回 H5
     */
    private _onWsError(payload: any): void {
        if (!this._isEntering) return;
        console.warn('[ProcedureEnterTexas]', 'wsError during entering, return to H5', payload);
        this._isEntering = false;
        this._entrance = null;
        H5MsgMgr.Instance.off('wsError');
        ProcedureManager.StartProcedure(ProcedureEnum.Return);
    }

    onComplete() {
        // this.RequestRoomInfo();
        // 开始进入前台
        this._entrance
            .enterForegroundAsync()
            .then(result => {
                this._isEntering = false;
                H5MsgMgr.Instance.off('wsError');
                if (!result) {
                    console.warn('[ProcedureEnterTexas]', 'enterForegroundAsync false');
                    this._entrance = null;
                    ProcedureManager.StartProcedure<ProcedureReturnNavigateParam>(ProcedureEnum.Return, {
                        needClosedUI: [PrefabUI.UIPreloading]
                    });
                }
            })
            .catch(e => {
                this._isEntering = false;
                H5MsgMgr.Instance.off('wsError');
                console.error('[ProcedureEnterTexas]', 'err', e);
                this._entrance = null;
                ProcedureManager.StartProcedure<ProcedureReturnNavigateParam>(ProcedureEnum.Return, {
                    needClosedUI: [PrefabUI.UIPreloading]
                });
            });
    }
}
