import { UIMatchMttModel } from "../../frame/data/mtt/UIMatchMttModel";
import TimeHelper from "../../helper/TimeHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { Def } from "../../protobuf/holdem/define_pb";
import { ServerMessageLeaveNotification } from "../../protobuf/holdem/recv_leave_notification_pb";
import UIComponent from "../../ui/UIComponent";
import MTTGame from "../texas/MTTGame";
import { TexasGameState } from "../TexasGameState";
import MTTGameUtils from "../util/MTTGameUtils";
import TexasGameMessageHandler from "./TexasGameMessageHandler";

export default class MTTGameMessageHandler extends TexasGameMessageHandler {

    // 通知本人离开房间 消息回调
    public override Protocol_Holdem_LeaveNotification_Handler(rec: ServerMessageLeaveNotification.AsObject) {

        console.log("# MSG_CALLBACK MTT: Protocol_Holdem_LeaveNotification_Handler");

        if (rec == null) return;

        let game = this.game as MTTGame;
        let utils: MTTGameUtils = game.TexasGameUtils as MTTGameUtils;

        switch (rec.reason) {

            case Def.LeaveReason.LR_NOCHIP: // 桌上筹码输光
                {
                    let isTriggerPartialBringIn: boolean = rec.storeChips > 0;
                    let isTriggerRebuy: boolean =
                        rec.storeChips == 0
                        && rec.accountChips >= UIMatchMttModel.Instance.RebuyCost
                        && (game.MaxRebuyBlindLevel > 0 && game.MaxRebuyBlindLevel > game.BlindLevel)
                        && game.RemainRebuyCount > 0;
                    game.RemainRebuyCount = game.TotalRebuyCount - rec.rebuyTimes;
                    if (isTriggerPartialBringIn) {

                        utils.HandlePartialBringIn(rec.storeChips, code => {
                            if (code == 0) {
                                game.SMAgency.ChangeGameState(TexasGameState.Launch, null);
                            }
                            else {
                                this.ShowMineRank(true);
                                game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
                                UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
                            }
                        });
                    }
                    else if (isTriggerRebuy) {
                        utils.HandleRebuy(code => {
                            if (code == 0) {
                                game.SMAgency.ChangeGameState(TexasGameState.Launch, null);
                            }
                            else {
                                this.ShowMineRank(true);
                                game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
                                UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
                            }
                        });
                    }
                    else {
                        this.ShowMineRank();
                    }
                }
                break;
            case Def.LeaveReason.LR_EXCHANGE: // 换房间
                {
                    game.SMAgency.ChangeGameState(TexasGameState.ExchangeRoom, null);
                }
                break;
            case Def.LeaveReason.LR_GAME_END:
                {
                    this.ShowMineRank();
                }
                break;
            default:
                {
                    super.Protocol_Holdem_LeaveNotification_Handler(rec);
                }
                break;
        }
    }
    private async ShowMineRank(isRebuy: boolean = false) {
        await TimeHelper.Sleep(2000);
        // UIComponent.Instance.ShowNoAnimation(UIType.UIMTTMineRank, new UIMTTMineRankComponent.MineRankData()
        // {
        //         matchId = GameCache.Instance.match_id,
        //         matchName = GameCache.Instance.roomName,
        //         isRebuy = isRebuy,
        //     });
        this.game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
    }
}
