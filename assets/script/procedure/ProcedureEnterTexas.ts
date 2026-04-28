import { Bundle, ProcedureEnum } from "../define/EIDefine";
import GC from "../frame/GameControl";
import { GameCache } from "../game/GameCache";
import H5MsgMgr from "../H5MsgMgr";
import { CPErrorCode } from "../i18n/CPErrorCode";
import ProcedureManager from "../manager/ProcedureManager";
import { Pre_Texas_Define } from "../manager/ResManager";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { ClientMessageRooms, ServerMessageRooms } from "../protobuf/holdem/req_rpc_rooms_pb";
import { RoomRecord } from "../protobuf/holdem/define_pb";
import UIComponent, { PrefabUI } from "../ui/UIComponent";
import ProcedureBase from "./ProcedureBase";
import { i18nMgr } from "../i18n/i18nMgr";
import ReconnectComponent from "../funcomponent/ReconnectComponent";
import TexasGameplayEntrance from "../crazyPoker/gameplayMisc/entrance/TexasGameplayEntrance";

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterTexas extends ProcedureBase {

    Name: string = "ProcedureEnterTexas";

    /**
     * 德州玩法入口实例
     */
    private _entrance: TexasGameplayEntrance = null;

    lateEnter(param?: any) {
        super.lateEnter(param);

        GC.notify.register(ProtocolCode.Protocol_Holdem_Rooms, this.OnMsgHoldemRooms, this);
        //显示房间进入loading
        UIComponent.Instance.ShowUI(PrefabUI.UIPreloading, { pre_define: Pre_Texas_Define, complete: this.onComplete.bind(this), error: this.errorHandler.bind(this) });

        // 创建德州玩法入口
        const entrance = new TexasGameplayEntrance(
            GameCache.Instance.room_type,
            GameCache.Instance.match_id,
            GameCache.Instance.room_id
        );
        this._entrance = entrance;


    }

    /**
     * @param rec 房间信息
     */
    protected OnMsgHoldemRooms(rec: ServerMessageRooms.AsObject) {

        if (rec == null) {
            UIComponent.Instance.Toast(i18nMgr.Get("EnterForegroundFail"));
            this._entrance._roomInfoReject(new Error("room info is null"));
            this.ReturnBackH5();
            return;
        }

        if (rec.status != 0) {
            //TODO toast无法生效，返回H5应该是把cc卸载掉了
            UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rec.status));
            this._entrance._roomInfoReject(new Error(`status=${rec.status}`));
            this.ReturnBackH5();
            return;
        }

        // 取房间列表中的第一个房间记录
        let roomRecord: RoomRecord.AsObject;
        if (rec.roomsList && rec.roomsList.length > 0) {
            roomRecord = rec.roomsList[0];
        }
        else {
            UIComponent.Instance.Toast(i18nMgr.Get("EnterForegroundFail"));
            this._entrance._roomInfoReject(new Error("roomsList is empty"));
            this.ReturnBackH5();
            return;
        }

        // 查看房间数据是否合法
        if (roomRecord?.status == 3) {
            UIComponent.Instance.Toast(i18nMgr.Get("GameRoom_ForceCloseTips"));
            this._entrance._roomInfoReject(new Error("room status=3"));
            this.ReturnBackH5();
            return;
        }

        if (roomRecord?.status == 4) {
            //TODO 暂时不处理
        }

        // 设置房间信息并 resolve Promise
        GameCache.Instance._roomRecord = roomRecord;
        this._entrance._roomInfoResolve(roomRecord);

        GameCache.Instance.enter_param = this.param;

        ProcedureManager.StartProcedure(ProcedureEnum.Texas, this.param);
    }

    /**
     * 返回H5界面
     * 通知H5层恢复显示
     */
    private ReturnBackH5() {

        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);

        ReconnectComponent.Instance.ChangeStatus(1);

        // 切换到闲置状态
        ProcedureManager.StartProcedure(ProcedureEnum.Idel);

        // 通知 H5 层恢复显示
        H5MsgMgr.sendToH5('h5Show', 1);
    }

    Leave() {
        super.Leave();
    }

    onComplete() {
        // this.RequestRoomInfo();
        // 开始进入前台
        this._entrance.enterForegroundAsync();
    }
    errorHandler() {
        UIComponent.Instance.HideUI(PrefabUI.UIPreloading);
        ProcedureManager.StartProcedure(ProcedureEnum.Lobby, { mode: 1, game_enter_type: 0 });
    }

} 
