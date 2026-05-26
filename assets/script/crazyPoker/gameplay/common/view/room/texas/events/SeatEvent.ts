import { ProcedureEnum } from "../../../../../../../define/EIDefine";
import { UIDefine } from "../../../../../../../define/UIDefine";
import { i18nMgr } from "../../../../../../../i18n/i18nMgr";
import ProcedureManager from "../../../../../../../manager/ProcedureManager";
import { WebUserInfo, WebUserRoom, WWW } from "../../../../../../../net/https/WebRequest";
import ProtocolAgency from "../../../../../../../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../../../../../../../net/websocket/ProtocolCode";
import { ClientMessageSeated } from "../../../../../../../protobuf/holdem/req_th_seated_pb";
import UIComponent from "../../../../../../../ui/UIComponent";
import { HttpRoomBringOutProtocol } from "../../../../../../module/message/CPHotfixWebMessage/room/HttpRoomBringOutProtocol";
import { HttpUserInfoProtocol } from "../../../../../../module/message/CPHotfixWebMessage/user/HttpUserInfoProtocol";
import TexasGameRoomData from "../../../../../texas/data/TexasGameRoomData";
import TexasGameRoomDataPlayer from "../../../../../texas/data/TexasGameRoomDataPlayer";
import { VideoModel } from "../../../../constant/VideoModel";
import { RetainInfo } from "../../../chips/UIGameplayAddChipsAndDiamond";
import { UIConfirmDialogParam } from "../../../common/UIConfirmDialog";

const LN = '[SeatEvent]'

export default class SeatEvent {
    /// <summary>
    /// 坐下
    /// </summary>
    /// <param name="clientSeatId"></param>
    public async Sitdown(seatData: TexasGameRoomDataPlayer, roomID: number, matchID: number): Promise<void> {
        // if (this.mainPlayer.seatID != -1) {
        //     console.warn(
        //         LN,
        //         `Sitdown 你已在其他位置 seatID ${this.mainPlayer.seatID}, clientSeatId ${this.GetSeatByLocalSeatID(this.mainPlayer.seatID).ClientSeatId}`
        //     );
        //     return;
        // }
        // if (null != mSeat.Player) {
        //     if (mSeat.Player.userID == this.mainPlayer.userID) {
        //         console.warn(LN, `Sitdown 你已在该位置 clientSeatId:${clientSeatId}`);
        //         return;
        //     }
        //     console.warn(LN, `Sitdown 该位置有其他玩家 clientSeatId:${clientSeatId}`);
        //     return;
        // }
        const userInfo = await WWW.Instance.CommonAPI<HttpUserInfoProtocol.ResponseData>({
            web_class: WebUserInfo
        });
        // @TODO更新用户信息
        //GC.data.user.info  Update
        //被冻结
        if (userInfo.data.user.forbid == 0) {
            UIComponent.open<UIConfirmDialogParam>(UIDefine.UIConfirmDialog, {
                title: '',
                content: i18nMgr.Get('UIForbidBringInTips')
                //contentCommit: CPErrorCode.LanguageDescription(10012)
            });
            return;
        }
        // 视频房间：坐下前先请求浏览器摄像头权限（不依赖 Agora 频道状态）
        if (seatData.needVideoPermision) {
            try {
                console.log('[Sitdown] 请求浏览器摄像头权限...');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // 权限通过，立即释放 stream（Agora 的 enableCamera 会自己创建 track）
                console.log('[Sitdown] 摄像头权限通过，释放 stream');
                stream.getTracks().forEach(t => t.stop());
            } catch (e) {
                // 权限被拒绝
                console.error('[Sitdown] 摄像头权限被拒绝:', e);
                UIComponent.Instance.Toast('必须同意浏览器的视频权限才能成功坐在视频桌');
                setTimeout(() => {
                    ProcedureManager.StartProcedure(ProcedureEnum.Return);
                }, 3000);
                return;
            }
        }
        //之前带入信息查询
        try {
            const response = await WWW.Instance.CommonAPI<HttpRoomBringOutProtocol.ResponseData>({
                web_class: WebUserRoom,
                api_id: roomID,
            });
            // 请求异常
            if (response.code != 0) {
                console.error(LN, `Sitdown 坐下查询带入失败 ${response.code}`);
                return;
            }
            // 异步请求期间可能已被清理
            if (!seatData.mine) {
                console.warn(LN, 'Sitdown mainPlayer is null, abort');
                return;
            }
            let seatedData: ClientMessageSeated.AsObject = {
                room: {
                    roomId: roomID,
                    matchId: matchID,
                },
                seatId: seatData.seatNo,
                bringIn: 0,
                autoOnTable: 0,
                autoUseWallet: false,
                returnOrNew: response.data.return_table ? 1 : 0,
                store: 0,
                clubId: 0,
                applyBringIn: false,
                autoOnTableNoStore: false,
                autoOnTableFix: 0,
                depositAdvance: 0,
                autoOnTableMax: 0
            };
            const retainDetail: RetainInfo = {
                RetainType: GameCache.Instance._roomRecord.retainType,
                RetainMinRate: GameCache.Instance._roomRecord.retainMinRate,
                RetainMaxRate: GameCache.Instance._roomRecord.retainMaxRate
            };
            // 自动藏钱要设置几个参数
            if (retainDetail.RetainType == RoomInfo.RetainType.RT_AUTO) {
                seatedData.autoOnTable = retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2;
                seatedData.autoOnTableFix = retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2;
                seatedData.autoOnTableMax = retainDetail.RetainMaxRate * GameCache.Instance._roomRecord.sb * 2;
            }
            let addChipData: AddChipsData = {
                _bigBlind: GameCache.Instance._texasData._bigBlind,
                _smallBlind: GameCache.Instance._texasData._smallBlind,
                _currentMinRate: GameCache.Instance._texasData._curMinRate,
                _currentMaxRate: GameCache.Instance._texasData._curMaxRate,
                _tableChips: this.mainPlayer.chips,
                _wallets: response.data.wallet,
                _source: BringInChipsType.BRING_IN,
                _creditNum: response.data.user_club_gold_credit,
                _deposit: GameCache.Instance._texasData._deposit,
                _commit: this._commitBringInCallback(seatedData),
                _diamonds: userInfo.data.user.diamonds,
                _isTrader: GameplayUtil.IsTrader(userInfo.data.user),
                _type: 0,
                _retainInfo: retainDetail
            };
            // 联盟币
            if (GameCache.Instance.gold_type == 1) {
                addChipData._type = 1;
                // 有带出
                if (response.data.last_bring_out != null) {
                    let returnAmount = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee;
                    // 要带回桌子上金额
                    let bringToTable = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee - GameCache.Instance._texasData._deposit;
                    const returnFromWallet = response.data.last_bring_out.to_wallet;
                    const walletAmount = UITexasModel.mInstance.getGoldFromWallets(response.data.last_bring_out.club_id, response.data.wallet);
                    // 要反桌，但是钱包钱不够了
                    if (bringToTable > 0 && returnFromWallet > walletAmount) {
                        console.log(LN, 'return table, not enough from wallet', 'need:', returnFromWallet, 'current:', walletAmount);
                        // 金额不足
                        UIComponent.Instance.Toast(i18nMgr.Get('adaptation20010') + `(${returnFromWallet} > ${walletAmount})`);
                        return;
                    }
                    seatedData.bringIn = returnAmount;
                    seatedData.clubId = response.data.last_bring_out.club_id;
                    // 钱包够,没输光(反桌)
                    if (bringToTable > 0) {
                        // 没有藏钱直接坐下
                        if (retainDetail.RetainType == RoomInfo.RetainType.RT_DISABLE) {
                            ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                                Code: ProtocolCode.Protocol_Holdem_Seated,
                                RoomID: GameCache.Instance.room_id,
                                MatchID: GameCache.Instance.match_id,
                                Body: seatedData
                            });
                        }
                        // 如果有藏钱的逻辑(还要保留最小上桌)
                        if (retainDetail.RetainType > 0 && bringToTable >= retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2) {
                            if (retainDetail.RetainType == RoomInfo.RetainType.RT_MANUAL) {
                                //手动逻辑自己管理Store
                                seatedData.store = bringToTable - retainDetail.RetainMinRate * GameCache.Instance._roomRecord.sb * 2;
                            }
                            ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                                Code: ProtocolCode.Protocol_Holdem_Seated,
                                RoomID: GameCache.Instance.room_id,
                                MatchID: GameCache.Instance.match_id,
                                Body: seatedData
                            });
                        }
                        return;
                    }
                    // 其他都需要弹窗口输入
                    UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                    return;
                }
                //是否需要显示安全提示
                if (!this.shouldShowBringInSecuritySetting()) {
                    // if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                    //     // this.ShowAutoAddChips(data.wallet);
                    // } else {
                    UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                    //}
                    return;
                }
                // 非首次不显示
                UIComponent.open(UIDefine.UIGameplaySecuritySetting, {
                    isFromBringIn: true,
                    bringInAct: () => {
                        // if (this.CurlimitOutChip == RoomInfo.RetainType.RT_AUTO) {
                        //     // this.ShowAutoAddChips(data.wallet);
                        // } else {
                        UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                        //}
                    },
                    noAnimation: true
                });
            }
            // 记分牌(朋友卓)
            if (GameCache.Instance.gold_type == 3) {
                //@TODO 朋友卓
                addChipData._type = GameCache.Instance.origin_type == 3 ? 3 : 2;
                // 有带出
                if (response.data.last_bring_out != null) {
                    let returnAmount = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee;
                    // 要带回桌子上金额
                    const bringToTable = response.data.last_bring_out.to_wallet + response.data.last_bring_out.fee - GameCache.Instance._texasData._deposit;
                    seatedData.bringIn = returnAmount;
                    seatedData.clubId = response.data.last_bring_out.club_id;
                    // 钱包够,没输光(反桌)
                    if (bringToTable > 0) {
                        ProtocolAgency.Send<ClientMessageSeated.AsObject>({
                            Code: ProtocolCode.Protocol_Holdem_Seated,
                            RoomID: GameCache.Instance.room_id,
                            MatchID: GameCache.Instance.match_id,
                            Body: seatedData
                        });
                        return;
                    }
                    // 其他都需要弹窗口输入
                    UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
                    return;
                }
                // 不提示安全提示直接带入
                UIComponent.open<AddChipsData>(UIDefine.UIGameplayAddChipsAndDiamond, addChipData);
            }
        } catch (e) {
            console.error(LN, 'sit down', e);
        }
    }
}