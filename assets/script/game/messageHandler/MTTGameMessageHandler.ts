import TimeHelper from '../../helper/TimeHelper';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import { UIMTTModel } from '../../new_mtt/UIMTTModel';
import { Def } from '../../protobuf/holdem/define_pb';
import { ServerMessageLeaveNotification } from '../../protobuf/holdem/recv_th_leave_notification_pb';
import UIComponent from '../../ui/UIComponent';
import { GameCache } from '../GameCache';
import H5MsgMgr from '../../H5MsgMgr';
import MTTGame from '../texas/MTTGame';
import { TexasGameState } from '../TexasGameState';
import MTTGameUtils from '../util/MTTGameUtils';
import TexasGameMessageHandler from './TexasGameMessageHandler';

export default class MTTGameMessageHandler extends TexasGameMessageHandler {

    // 通知本人离开房间 消息回调
    public override Protocol_Holdem_LeaveNotification_Handler(rec: ServerMessageLeaveNotification.AsObject) {
        console.log('# MSG_CALLBACK MTT: Protocol_Holdem_LeaveNotification_Handler');
        if (rec == null) return;
        let game = this.game as MTTGame;
        let utils: MTTGameUtils = game.TexasGameUtils as MTTGameUtils;
        switch (rec.reason) {
            case Def.LeaveReason.LR_NOCHIP: // 桌上筹码输光
                {
                    let isTriggerPartialBringIn: boolean = rec.storeChips > 0;
                    game.RemainRebuyCount = game.TotalRebuyCount - rec.rebuyTimes;
                    // 安全读取重购费用，MttInfo 在游戏内可能未初始化
                    let mttInfo = UIMTTModel.Instance?.MttInfo;
                    let rebuyCost = mttInfo?.mtt ? mttInfo.mtt.apply_fee_pool + mttInfo.mtt.apply_fee_service : Number.MAX_SAFE_INTEGER;
                    let isTriggerRebuy: boolean =
                        rec.storeChips == 0 &&
                        rec.accountChips >= rebuyCost &&
                        game.MaxRebuyBlindLevel > 0 &&
                        game.MaxRebuyBlindLevel > game.BlindLevel &&
                        game.RemainRebuyCount > 0;
                    if (isTriggerPartialBringIn) {
                        utils.HandlePartialBringIn(rec.storeChips, code => {
                            if (code == 0) {
                                game.SMAgency.ChangeGameState(TexasGameState.Launch, null);
                            } else {
                                UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
                                this.ShowMineRank(true);
                            }
                        });
                    } else if (isTriggerRebuy) {
                        utils.HandleRebuy(code => {
                            if (code == 0) {
                                game.SMAgency.ChangeGameState(TexasGameState.Launch, null);
                            } else {
                                this.ShowMineRank(true);
                            }
                        });
                    } else {
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
        let game = this.game as MTTGame;
        let matchId = GameCache.Instance.match_id;
        let matchName = GameCache.Instance.roomName;
        await TimeHelper.Sleep(2000);
        this.game.SMAgency.ChangeGameState(TexasGameState.Exit, null);
        H5MsgMgr.sendToH5('showPanel', 1, {
            panelType: 'mttSettlement',
            ensureVisible: true,
            showH5Bg: true,
            props: {
                matchId: matchId,
                matchName: matchName,
                isRebuy: isRebuy,
                startTime: UIMTTModel.Instance?.MttInfo?.mtt?.start_time ?? '',
                currentBlindLevel: game.BlindLevel,
                maxRebuyBlindLevel: game.MaxRebuyBlindLevel,
                remainRebuyTimes: game.RemainRebuyCount
            }
        });
    }
}
