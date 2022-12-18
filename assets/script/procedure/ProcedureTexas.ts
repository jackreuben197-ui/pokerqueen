
import { GameCache } from "../game/GameCache";
import { RoomType } from "../game/util/GameUtil";
import { TexasGameState } from "../game/TexasGameState";

import ProcedureBase from "./ProcedureBase";
import GC from "../frame/GameControl";
import UIComponent from "../ui/UIComponent";
import { UIDefine } from "../define/UIDefine";

/**
 * 牌桌内进程
 */
export default class ProcedureTexas extends ProcedureBase {

    Name: string = "ProcedureTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        GameCache.Instance.InitTexasGame();
        GameCache.Instance.CurGame.Enter();
        GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.Launch);
    }
    Leave() {
        super.Leave();

        if (GameCache.Instance.CurGame.isMTT) {
            UIComponent.open(UIDefine.MttDetailForm, GC.data.mtt.list.select);
        }

        // if (this.param?.fromUIs?.[0]?.Name == UIDefine.UIMatchPlayViewForm.Name) {
        //     UIComponent.open(UIDefine.UIMatchPlayViewForm, null, { animation: false });
        // }

        GameCache.Instance.CurGame.Dispose();
        GameCache.Instance.CurGame = null;

        GC.data.lobby.reqLobbyGroupData();
    }
}
