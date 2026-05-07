import { ProcedureEnum } from "../define/EIDefine";
import GC from "../frame/GameControl";
import { GameCache, GameEnterParam } from "../game/GameCache";
import H5MsgMgr from "../H5MsgMgr";
import { CPErrorCode } from "../i18n/CPErrorCode";
import ProcedureManager from "../manager/ProcedureManager";
import { PreloadDefinitionTexas, PreloadParams } from "../manager/ResManager";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ServerMessageRooms } from "../protobuf/holdem/req_rpc_rooms_pb";
import { RoomRecord } from "../protobuf/holdem/define_pb";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";
import { i18nMgr } from "../i18n/i18nMgr";
import ReconnectComponent from "../funcomponent/ReconnectComponent";
import TexasGameplayEntrance from "../crazyPoker/gameplayMisc/entrance/TexasGameplayEntrance";
import { GameEnterType } from "../game/util/GameUtil";
import { ServerMessageMttDetail } from "../protobuf/holdem/req_rpc_mtt_detail_pb";
import AGameplayEntrance from "../crazyPoker/gameplayMisc/entrance/AGameplayEntrance";
import { AGameplayEntranceProvider } from "../crazyPoker/gameplayMisc/entrance/AGamelayEntranceProvider";

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {

    Name: string = "ProcedureEnterTexas";

    /**
     * 德州玩法入口实例
     */
    private _entrance: AGameplayEntrance = null;

    override lateEnter<T>(param?: T) {
        super.lateEnter(param);
        if (!param) console.log('[ProcedureEnterTexas]', 'miss param');
        // === 7. 通知 H5 层隐藏自身，让出 CC 层牌桌显示 ===
        H5MsgMgr.sendToH5('h5Hide', 1);
        //显示房间进入loading
        UIComponent.Instance.ShowUI<PreloadParams>(
            PrefabUI.UIPreloading, 
            { 
                preloadDefinition: PreloadDefinitionTexas, 
                complete: this.onComplete.bind(this), 
                error: this.errorHandler.bind(this),
            }
        );

        // 创建德州玩法入口
        const entrance = AGameplayEntranceProvider.createEntrance(
            GameCache.Instance.room_type,
            GameCache.Instance.match_id,
            GameCache.Instance.room_id
        );
        this._entrance = entrance;
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
        super.Leave();
    }

    onComplete() {
        // this.RequestRoomInfo();
        // 开始进入前台
        this._entrance.enterForegroundAsync().then(result => {
            if (!result) {
                console.error('[ProcedureEnterTexas]', 'enterForegroundAsync false');
                ProcedureManager.StartProcedure<PrefabUI>(ProcedureEnum.Return, PrefabUI.UIPreloading);
            }
        }).catch(e => {
            console.error('[ProcedureEnterTexas]', 'err', e);
            ProcedureManager.StartProcedure<PrefabUI>(ProcedureEnum.Return, PrefabUI.UIPreloading);
            return;
        });
    }

    errorHandler(error: any) {
        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
        console.log('进入房间发生错误:', error);
        // ProcedureManager.StartProcedure(ProcedureEnum.Idle, { mode: 1, game_enter_type: 0 });
    }

} 
