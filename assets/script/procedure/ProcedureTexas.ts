
import { UIDefine } from "../define/UIDefine";
import GameSession from "../game/GameSession";
import GameCache from "../manager/GameCache";
import SceneManager from "../manager/SceneManager";
import ProcedureBase from "./ProcedureBase";

/**
 * 牌桌内进程
 */
export default class ProcedureTexas extends ProcedureBase {

    Name: string = "ProcedureTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        GameSession.Init();
        GameCache.ins.initTexasGame();
        SceneManager.ins.switchScene(UIDefine.TexasScene, param);
        GameSession.EnterRoom();
    }
    Leave() {
        super.Leave();
    }
}
