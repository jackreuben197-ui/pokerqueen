import { GameConfig } from '../config/GameConfig';
import { GameCache } from '../game/GameCache';
import { RoomType } from '../game/util/GameUtil';
import { TexasGameState } from '../game/TexasGameState';
import ProcedureBase from './ProcedureBase';
import GC from '../frame/GameControl';
import StorageKey from '../session/StorageKey';
import H5MsgMgr from '../H5MsgMgr';
import UIComponent from '../ui/UIComponent';
import { UIDefine } from '../define/UIDefine';
import ReconnectComponent from '../funcomponent/ReconnectComponent';

/**
 * 牌桌内进程
 */
export default class ProcedureTexas extends ProcedureBase {
    override Name: string = 'ProcedureTexas';

    override lateEnter(param?: any) {
        super.lateEnter(param);
        // H5 桥接模式下可能跳过了 ProcedureConfig，确保 Network 已初始化
        GameCache.Instance.InitTexasGame();
        if (!GameCache.Instance.CurGame) {
            H5MsgMgr.sendToH5('showDialog', 1, {
                message: '游戏实例创建失败，即将出现黑屏，请截图发给程序员',
                confirmButtonText: '我已截图',
                ensureVisible: true,
            });
            return;
        }
        GameCache.Instance.CurGame.Enter();
        GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.Launch);
        // 通知 H5 切到牌桌内心跳频率（对齐 HeartbeatComponent.SendIntervalInGameplay = 1s）
        H5MsgMgr.sendToH5('setHeartbeatMode', 1, { mode: 'in-gameplay' });
        // 标记牌桌资源已加载过，下次启动不再显示首次加载提示
        if (GC.localStore.getItem(StorageKey.TextureResourceLoaded) !== 1) {
            GC.localStore.setItem(StorageKey.TextureResourceLoaded, 1);
        }
        // 隐藏首次加载提示（覆盖同会话内反复进桌的场景）
        const firstloadLabel = cc.find('Canvas/Block - 遮挡/UIPreloading/progress_node/firstload_label');
        if (firstloadLabel) firstloadLabel.active = false;
    }

    override Leave() {
        super.Leave();
        // if (GameCache.Instance.CurGame.isMTT) {
        //     UIComponent.open(UIDefine.MttDetailForm, GC.data.mtt.list.select);
        // }
        // if (this.param?.fromUIs?.[0]?.Name == UIDefine.UIMatchPlayViewForm.Name) {
        //     UIComponent.open(UIDefine.UIMatchPlayViewForm, null, { animation: false });
        // }
        GameCache.Instance.CurGame.Dispose();
        GameCache.Instance.CurGame = null;
        // 通知 H5 切回牌桌外心跳频率（对齐 HeartbeatComponent.SendIntervalNormal = 5s）
        H5MsgMgr.sendToH5('setHeartbeatMode', 1, { mode: 'normal' });
    }
}
