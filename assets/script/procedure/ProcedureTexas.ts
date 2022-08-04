
import { UIDefine } from "../define/UIDefine";
import GameSession from "../game/GameSession";
import { TexasGameState } from "../game/TexasGameState";
import GameCache from "../manager/GameCache";
import SceneManager from "../manager/SceneManager";
import UIManager from "../manager/UIManager";
import ProcedureBase from "./ProcedureBase";

/**
 * 牌桌内进程
 */
export default class ProcedureTexas extends ProcedureBase {

    Name: string = "ProcedureTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        UIManager.close(UIDefine.TexasPreLoad);
        GameCache.ins.initTexasGame();
        GameCache.ins.CurGame.start();
        GameCache.ins.CurGame.SMAgency.ChangeGameState(TexasGameState.Launch);
    }
    Leave() {
        super.Leave();
    }
}
