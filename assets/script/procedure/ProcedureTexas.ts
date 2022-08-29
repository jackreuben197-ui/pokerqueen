
import {GameCache} from "../game/GameCache";
import { TexasGameState } from "../game/TexasGameState";

import ProcedureBase from "./ProcedureBase";

/**
 * 牌桌内进程
 */
export default class ProcedureTexas extends ProcedureBase {

    Name: string = "ProcedureTexas";

    lateEnter(param?: any) {
        super.lateEnter(param);
        GameCache.Instance.initTexasGame();
        console.log("lateEnter GameCache.Instance.CurGame",GameCache.Instance.CurGame);
        GameCache.Instance.CurGame.Start();
        GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.Launch);
    }
    Leave() {
        super.Leave();
        GameCache.Instance.CurGame.Exit();
    }
}
