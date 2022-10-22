import { CardType, CardTypeUtil } from "../CardTypeUtil";
import { GameCache } from "../GameCache";
import GameUtil from "../GameUtil";
import OmahaGame4 from "./OmahaGame6";

import TexasGame from "./TexasGame";
/**
 * 奥马哈 +5 玩法
 */
export default class OmahaGame5 extends OmahaGame4 {

    public override get HandCards(): number {
        return 5;
    }

}
