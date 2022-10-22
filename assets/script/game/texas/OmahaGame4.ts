import { CardType, CardTypeUtil } from "../CardTypeUtil";
import { GameCache } from "../GameCache";
import GameUtil from "../GameUtil";

import TexasGame from "./TexasGame";
/**
 * 奥马哈 +4 玩法
 */
export default class OmahaGame4 extends TexasGame {

    public override GetCardType(highlightCards_ref: { highlightCards: number[] }, publicCards: number[]): CardType {

        return CardTypeUtil.GetOmahaCardType(this.mainPlayer.cards, publicCards, highlightCards_ref, GameUtil.JudgeIsSixPlusRoomPath(GameCache.Instance.room_type));

    }
    public override get HandCards(): number {
        return 4;
    }

}
