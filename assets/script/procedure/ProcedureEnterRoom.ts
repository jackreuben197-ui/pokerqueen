import { ProcedureEnum } from '../define/EIDefine';
import { GameCache } from '../game/GameCache';
import H5MsgMgr from '../H5MsgMgr';
import ProcedureManager from '../manager/ProcedureManager';
import { PreloadDefinitionTexas, PreloadParams } from '../manager/ResManager';
import UIComponent, { PrefabUI } from '../ui/UIComponent';
import ProcedureBase from './ProcedureBase';
import AGameplayEntrance from '../crazyPoker/gameplayMisc/entrance/AGameplayEntrance';
import { AGameplayEntranceProvider } from '../crazyPoker/gameplayMisc/entrance/AGamelayEntranceProvider';

/**
 * 进入牌桌进程
 */
export default class ProcedureEnterRoom extends ProcedureBase {
    Name: string = 'ProcedureEnterRoom';
    /**
     * 德州玩法入口实例
     */
    private _entrance: AGameplayEntrance = null;

    override lateEnter<T>(param?: T) {
        super.lateEnter(param);
        if (!param) console.log('[ProcedureEnterRoom]', 'miss param');
        H5MsgMgr.sendToH5('h5Hide', 1);
        // 创建德州玩法入口
        const entrance = AGameplayEntranceProvider.createEntrance(GameCache.Instance.room_type, GameCache.Instance.match_id, GameCache.Instance.room_id);
        this._entrance = entrance;
        this._onComplete();
    }

    Leave() {
        super.Leave();
    }

    _onComplete() {
        // this.RequestRoomInfo();
        // 开始进入前台
        this._entrance
            .enterForegroundAsync()
            .then(result => {
                if (!result) {
                    console.warn('[ProcedureEnterRoom]', 'enterForegroundAsync false');
                    this._entrance = null;
                    ProcedureManager.StartProcedure<PrefabUI>(ProcedureEnum.Return, PrefabUI.UIPreloading);
                }
            })
            .catch(e => {
                console.error('[ProcedureEnterRoom]', 'err', e);
                this._entrance = null;
                ProcedureManager.StartProcedure<PrefabUI>(ProcedureEnum.Return, PrefabUI.UIPreloading);
            });
    }
}
