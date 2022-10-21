import { ServerMessageStartInfo } from "../../protobuf/holdem/recv_start_info_pb";
import { ServerMessageWinner } from "../../protobuf/holdem/recv_winner_pb";
import { ServerMessageEnterRoom } from "../../protobuf/holdem/req_enter_room_pb";
import { CardType, CardTypeUtil } from "../CardTypeUtil";
import { GameCache } from "../GameCache";
import GameUtil from "../GameUtil";
import TexasGame from "./TexasGame";
/**
 * 奥马哈 +4 玩法
 */
export default class OmahaGame extends TexasGame {

    public omahaBloody: number = 0;  //  奥马哈血战模式0 1

    // public override UpdateRoom(object obj) {
    //     ServerMessageEnterRoom rec = obj as ServerMessageEnterRoom;
    //     if (null == rec)
    //         return;

    //     //showCardsIdOmaha = rec.MyInfo.;
    //     //omahaBloody = rec.omahaBloody;
    //     base.UpdateRoomCommon(rec, obj);
    // }
    public override GetEmptyHandCards(): number[] {
        return [-1, -1, -1, -1];
    }

    public override GetHandCardsAtEnterRoom(rec: ServerMessageEnterRoom.AsObject, index: number): number[] {
        let result = rec.playersList[index];
        return [
            result.cardsList?.[0] ?? 0,
            result.cardsList?.[1] ?? 0,
            result.cardsList?.[2] ?? 0,
            result.cardsList?.[3] ?? 0
        ];
    }

    public override GetHandCardsAtRecvWinner(rec: ServerMessageWinner.AsObject, index: number): number[] {
        let result = rec.resultsList[index];
        return [
            result.myCardsList?.[0] ?? 0,
            result.myCardsList?.[1] ?? 0,
            result.myCardsList?.[2] ?? 0,
            result.myCardsList?.[3] ?? 0
        ];
    }

    public override GetHandCardsAtRecvStartInfo(rec: ServerMessageStartInfo.AsObject, index: number) {
        let result = rec.playersList[index];
        return [
            result.cardsList?.[0] ?? 0,
            result.cardsList?.[1] ?? 0,
            result.cardsList?.[2] ?? 0,
            result.cardsList?.[3] ?? 0
        ];
    }

    public GetCardType(highlightCards_ref: { highlightCards: number[] }, publicCards: number[]): CardType {

        return CardTypeUtil.GetOmahaCardType(this.mainPlayer.cards, publicCards, highlightCards_ref, GameUtil.JudgeIsSixPlusRoomPath(GameCache.Instance.room_type));

    }
    public override get HandCards(): number {
        return 5;
    }

}
