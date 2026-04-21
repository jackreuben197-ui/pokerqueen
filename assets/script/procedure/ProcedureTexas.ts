
import { GameConfig } from "../config/GameConfig";
import { GameCache } from "../game/GameCache";
import { RoomType } from "../game/util/GameUtil";
import { TexasGameState } from "../game/TexasGameState";

import ProcedureBase from "./ProcedureBase";
import ProcedureConfig from "./ProcedureConfig";
import GC from "../frame/GameControl";
import H5MsgMgr from "../H5MsgMgr";
import UIComponent from "../ui/UIComponent";
import { UIDefine } from "../define/UIDefine";
import ReconnectComponent from "../funcomponent/ReconnectComponent";

/**
 * 牌桌内进程
 */
export default class ProcedureTexas extends ProcedureBase {

    Name: string = "ProcedureTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        // H5 桥接模式下可能跳过了 ProcedureConfig，确保 Network 已初始化
        if (!GameConfig.Network) {
            ProcedureConfig.setNetwork();
        }
        GameCache.Instance.InitTexasGame();
        GameCache.Instance.CurGame.Enter();
        GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.Launch);
    }
    Leave() {
        super.Leave();

        // if (GameCache.Instance.CurGame.isMTT) {
        //     UIComponent.open(UIDefine.MttDetailForm, GC.data.mtt.list.select);
        // }

        // if (this.param?.fromUIs?.[0]?.Name == UIDefine.UIMatchPlayViewForm.Name) {
        //     UIComponent.open(UIDefine.UIMatchPlayViewForm, null, { animation: false });
        // }

        GameCache.Instance.CurGame.Dispose();
        GameCache.Instance.CurGame = null;

        GC.data.lobby.reqLobbyGroupData();

        ReconnectComponent.Instance.ChangeStatus(1);

        // 通知 H5 层恢复显示
        H5MsgMgr.sendToH5('h5Show', 1);
    }
}
