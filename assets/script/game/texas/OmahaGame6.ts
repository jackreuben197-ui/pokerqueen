import { CardType, CardTypeUtil } from "../CardTypeUtil";
import { GameCache } from "../GameCache";
import GameUtil from "../GameUtil";
import OmahaGame4 from "./OmahaGame4";

import TexasGame from "./TexasGame";
/**
 * 奥马哈 +6 玩法
 */
export default class OmahaGame6 extends OmahaGame4 {

    public override get HandCards(): number {
        return 6;
    }

}
