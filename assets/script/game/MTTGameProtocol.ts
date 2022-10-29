import TimeHelper from "../helper/TimeHelper";
import { ServerMessageHandClear } from "../protobuf/holdem/recv_hand_clear_pb";
import MTTGame from "./texas/MTTGame";
import TexasGame from "./texas/TexasGame";
import TexasGameProtocol from "./TexasGameProtocol";


export default class MTTGameProtocol extends TexasGameProtocol {

    constructor(public game: TexasGame) {
        super(game);
    }

    public override RegisterMsgHandler(): void {
        super.RegisterMsgHandler();
    }
    public override RemoveMsgHandler(): void {

        super.RemoveMsgHandler();
    }
    public override async HandleRoundFinish(source: ServerMessageHandClear.AsObject) {
        super.HandleRoundFinish(source);
        await TimeHelper.Sleep(4000);
        // if (IsDisposed) {
        //     return;
        // }
        this.JudgeHavePlayer();
    }
    /// <summary>
    /// 判断除了自己此时的房间的人数
    /// </summary>
    private JudgeHavePlayer() {
        var currentPlayers = this.game.TexasGameUtils.GetCurrentPlayers();
        if (currentPlayers.length == 0) {
            (this.game as MTTGame).isStartShowPullDown = true;
            this.game.uirc.Image_RedistributionTips.active = true;
        }
    }

}
