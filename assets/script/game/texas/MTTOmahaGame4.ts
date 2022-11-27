
import { CardType, CardTypeUtil } from "../CardTypeUtil";
import { GameCache } from "../GameCache";
import GameUtil from "../util/GameUtil";
import MTTGame from "./MTTGame";

export default class MTTOmahaGame4 extends MTTGame {

    public override GetCardType(highlightCards_ref: { highlightCards: number[] }, publicCards: number[]): CardType {

        return CardTypeUtil.GetOmahaCardType(this.mainPlayer.cards, publicCards, highlightCards_ref, GameUtil.JudgeIsSixPlusRoomPath(GameCache.Instance.room_type));

    }
    public override get HandCards(): number {
        return 4;
    }
}
