import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import { ClubCache } from "../frame/data/club/ClubCache";
import { GameCache } from "../game/GameCache";
import { TexasGameState } from "../game/TexasGameState";
import MTTGame from "../game/texas/MTTGame";
import GameUtil, { GameEnterType } from "../game/util/GameUtil";
import { StringHelper } from "../helper/StringHelper";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { i18nMgr } from "../i18n/i18nMgr";
import ToastManager from "../manager/ToastManager";
import { DialogType } from "../mtt/detail/UIMttSignDialogComponent";
import HttpRequest from "../net/https/HttpRequest";
import { WebPropUserBuyProp, WebPropUserCheckPropInfo, WebRoomCenterMttBuyin, WebRoomCenterMttDetailS, WebRoomCenterMttRebuy } from "../net/https/WebRequest";
import { ServerErrorCode } from "../net/websocket/ServerErrorCode";
import UIComponent, { PrefabUI } from "../ui/UIComponent";



// MTT比赛列表排序类型
export enum MTTListOrderTypeString {
    id_asc,//比赛id正序
    id_desc,//比赛id倒序
    start_asc,//开始时间正序
    start_desc,//开始时间倒序
    enter_asc,//结束时间正序
    enter_desc,//结束时间倒序
}


// mtt比赛状态
export enum MTTMatchStatus {
    /// <summary>
    /// 未开赛
    /// </summary>
    Created,
    /// <summary>
    /// 比赛中
    /// </summary>
    Running,
    /// <summary>
    /// 已关闭
    /// </summary>
    Closed,
    /// <summary>
    /// 已取消
    /// </summary>
    Cancel,
}

export enum MTTJoinAction // 参与mtt玩法动作
{
    None,
    Apply,          // 报名
    Rebuy,          // 重购
    PartialBringIn, // 部分带入
}


export enum MTTJoinMode // 参与mtt玩法方式
{
    None,
    Apply,          // 报名
    Rebuy,          // 重购
    AddOn, // 增购
}

export class UIMTTModel {

    _joinAction: MTTJoinAction = MTTJoinAction.None;
    _actionResultCallback: any = null;
    _args: any = null;
    _actionExceptionCallback: any = null;
    //MttInfo: typeof WebRoomCenterMttDetailS.Response.data;
    PartialBringIn: number = 0;

    public HandleMTTJoinAction(
        actionType: MTTJoinAction,
        resultCallback: any,
        exceptionCallback: any = null,
        args: any = null,
        checkGPS: boolean = true
    ) {
        this._joinAction = actionType;
        this._actionResultCallback = resultCallback;
        this._args = args;

        this._actionExceptionCallback = exceptionCallback;
        this.MTTJoinActionHandler(actionType, resultCallback, exceptionCallback, args);
    }

    MTTJoinActionHandler(
        actionType: MTTJoinAction,
        resultCallback: any,
        exceptionCallback: any,
        args: any
    ) {
        switch (actionType) {
            case MTTJoinAction.Apply:
                {
                    this.MTTApplyActionHandler(resultCallback, exceptionCallback);//MTTApplyActionHandler
                }
                break;
            case MTTJoinAction.Rebuy:
                {
                    this.MTTRebuyActionHandler(resultCallback, exceptionCallback);
                }
                break;
            case MTTJoinAction.PartialBringIn:
                {
                    this.MTTPartialBringInActionHandler(resultCallback, exceptionCallback, args == null ? 0 : args);
                }
                break;
        }
    }

    MTTApplyActionHandler(resultCallback, exceptionCallback) {

        let rebuyTimes = this.MttInfo.mtt.rebuy_times + 1;//+1 为报名 买入次数等于 重构次数 + 报名
        let dialogData = {
            type: DialogType.CommitCancel,
            title: i18nMgr.Get("UIMTTSignDialogBuyTitle"),
            //报名费+服务费+猎人赛人头费
            coinnum: this.MttInfo.mtt.apply_fee_pool,
            hunterFee: this.MttInfo.mtt.apply_fee_hunter,
            Fee: this.MttInfo.mtt.apply_fee_service,
            isHunter: this.MttInfo.mtt.hunter_on,

            buyin_free_times: this.MttInfo.mtt.buyin_free_times,
            rebuy_free_times: this.MttInfo.mtt.rebuy_free_times,
            multi_ratio_free_times: this.MttInfo.mtt.multi_ratio_free_times,
            addon_free_times: this.MttInfo.mtt.addon_free_times,
            buyin_free_incl_svr: this.MttInfo.mtt.buyin_free_incl_svr,
            rebuy_free_incl_svr: this.MttInfo.mtt.rebuy_free_incl_svr,
            multi_ratio_free_incl_svr: this.MttInfo.mtt.multi_ratio_free_incl_svr,
            addon_free_incl_svr: this.MttInfo.mtt.addon_free_incl_svr,
            mTTJoinMode: MTTJoinMode.Apply,

            coinBalance: i18nMgr.Get("UIMTTApply_dialog_content").replace("{0}", StringHelper.GetLongString(GC.data.user.info.gold)),
            contentCommit: CPErrorCode.LanguageDescription(10012),
            contentCancel: CPErrorCode.LanguageDescription(10013),
            buyRatio: this.MttInfo.mtt.buy_ratio,
            buyTimes: this.MttInfo.mtt.rebuy_times - this.MttInfo.mtt.total_rebuy_times,
            gold_type : this.MttInfo.mtt.gold_type,

            actionCommit: (isticket, buyRatio, used_prop_id, prop_type, use_free) => {
                let req =
                {
                    ticket: isticket,
                    ratio: buyRatio,
                    used_prop_id: used_prop_id,
                    prop_type: prop_type,
                    use_free: use_free,
                    club_id: ClubCache.mttPayWallat.club_id
                };

                HttpRequest.Send({
                    api: WebRoomCenterMttBuyin.API.replace("{id}", this.MttInfo.mtt.match_id.toString()),
                    request: WebRoomCenterMttBuyin,
                    body: WebRoomCenterMttBuyin.Request(req),
                    onSuccess: function () {
                        let response = WebRoomCenterMttBuyin.Response;
                        if (response.code == 0) {
                            let content = i18nMgr.Get("MTT_Apply_Success");
                            UIComponent.Instance.Toast(content);
                        }
                        else if (response.code == ServerErrorCode.MTT_SameTagLimit) {
                            // UIComponent.Instance.ShowNoAnimation(UIType.UIDialog,
                            //                             new UIDialogComponent.DialogData()
                            //                             {
                            //                                 type = UIDialogComponent.DialogData.DialogType.Commit,
                            //                                 title = LanguageManager.Get("adaptation10007"),
                            //                                 content = CPErrorCode.ServerErrorDescription(response.code),
                            //                                 contentCommit = LanguageManager.Get("UIBackDiolg_Konw_01"),
                            //                                 contentCancel = string.Empty,
                            //                                 actionCommit = null,
                            //                                 actionCancel = null
                            //                             });
                        }
                        else {
                            // if (UIMineModel.mInstance.UserInfoDto.user.gold < (StringHelper.GetLongClientCurrencyUnit(MttInfo.mtt.apply_fee_pool) + StringHelper.GetLongClientCurrencyUnit(MttInfo.mtt.apply_fee_service) + StringHelper.GetLongClientCurrencyUnit(MttInfo.mtt.apply_fee_hunter)))
                            // {
                            //     UIComponent.Instance.Toast(LanguageManager.Get("adaptation20094"));
                            // }
                            // else
                            // {
                            //     UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.code));
                            // }
                        }

                        if (resultCallback) {
                            resultCallback(response.code);
                        }
                    }.bind(this),
                    onFailure: function (content) {
                    }.bind(this)
                });

            }
        }
        if (GameCache.Instance.CurGame) {
            UIComponent.open(UIDefine.MttPayforHome, { data: dialogData, type: 1 })

            
            UIComponent.open(UIDefine.MttPayforHome, { data: dialogData, type: 1 })

        } else {
            UIComponent.open(UIDefine.MttPayforHome, { data: dialogData, type: 1 })
        }
    }



    MTTRebuyActionHandler(resultCallback, exceptionCallback) {
        let curGame = GameCache.Instance.CurGame as MTTGame;
        this.RequestMTTDetails(this.MttInfo.mtt.match_id, code => {
            if (code == 0) {
                let cost: any;
                let score = curGame == null ? this.MttInfo.mtt.initial_score : curGame.RebuyScore;
                let remain_count = curGame == null ? this.MttInfo.state.left_rebuy_times : curGame.RemainRebuyCount;
                let upBlTime = this.MttInfo.mtt.upblind_interval;
                let rebuyBl = this.MttInfo.mtt.max_rebuy_bl;
                let starTime = this.MttInfo.mtt.start_time;

                let rebuyTimes = this.MttInfo.state.left_rebuy_times;

                //string content = string.Format(LanguageManager.Get("MTT_Rebuy_Alert"), StringHelper.GetLongString(cost), StringHelper.GetLongString(score), remain_count);
                let dialogData =
                {
                    type: DialogType.CommitCancel,
                    title: i18nMgr.Get("UIMTTSignDialogReBuyTitle"),
                    //content = content,

                    coinnum: this.MttInfo.mtt.apply_fee_pool,
                    hunterFee: this.MttInfo.mtt.apply_fee_hunter,
                    Fee: this.MttInfo.mtt.apply_fee_service,
                    isHunter: this.MttInfo.mtt.hunter_on,
                    buyTimes: rebuyTimes,
                    buyRatio: this.MttInfo.mtt.buy_ratio,

                    buyin_free_times: this.MttInfo.mtt.buyin_free_times,
                    rebuy_free_times: this.MttInfo.mtt.rebuy_free_times,
                    multi_ratio_free_times: this.MttInfo.mtt.multi_ratio_free_times,
                    addon_free_times: this.MttInfo.mtt.addon_free_times,
                    buyin_free_incl_svr: this.MttInfo.mtt.buyin_free_incl_svr,
                    rebuy_free_incl_svr: this.MttInfo.mtt.rebuy_free_incl_svr,
                    multi_ratio_free_incl_svr: this.MttInfo.mtt.multi_ratio_free_incl_svr,
                    addon_free_incl_svr: this.MttInfo.mtt.addon_free_incl_svr,
                    mTTJoinMode: MTTJoinMode.Rebuy,

                    coinBalance: i18nMgr.Get("UIMTTApply_dialog_content").replace("{0}", StringHelper.GetLongString(GC.data.user.info.gold)),
                    contentCommit: CPErrorCode.LanguageDescription(10012),
                    contentCancel: CPErrorCode.LanguageDescription(10013),
                    rebuyData:
                    {
                        upblindInterval: upBlTime,
                        rebuyBlind: rebuyBl,
                        starTime: starTime
                    },
                    actionCommit: (isticket, buyRatio, used_prop_id, prop_type, use_free) => {
                        let req = {
                            ticket: isticket,
                            ratio: buyRatio,
                            used_prop_id: used_prop_id,
                            prop_type: prop_type,
                            use_free: use_free
                        };

                        let requestData =
                        {
                        };
                        HttpRequest.Send({
                            api: WebRoomCenterMttRebuy.API.replace("{id}", this.MttInfo.mtt.match_id.toString()),
                            request: WebRoomCenterMttRebuy,
                            body: WebRoomCenterMttRebuy.Request(requestData),
                            onSuccess: function () {
                                var responseData = WebRoomCenterMttRebuy.Response;
                                if (responseData.code == 0) {
                                    ToastManager.Instance.createToast(i18nMgr.Get("Repurchase_successful"));
                                } else {
                                    ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(responseData.code));
                                }
                                if (resultCallback) {
                                    resultCallback(responseData.code);
                                }
                            }.bind(this),
                            onFailure: function (content) {
                                if (exceptionCallback) {
                                    exceptionCallback(content);
                                }
                            }.bind(this)
                        });
                    },
                    actionCancel: () => {
                        if (curGame != null) {
                            // UIComponent.open(UIDefine.UIMTTMineRankComponent, new MineRankData({
                            //     matchId: GameCache.Instance.match_id,
                            //     matchName: GameCache.Instance.roomName,
                            //     isRebuy: true
                            // }))

                            UIComponent.open(UIDefine.UIMTTMineRank,
                                {
                                    matchId: GameCache.Instance.match_id,
                                    matchName: GameCache.Instance.roomName,
                                    isRebuy: true
                                });


                            GameCache.Instance.CurGame.SMAgency.ChangeGameState(TexasGameState.Exit, null);
                        }
                    }
                }
                if (GameCache.Instance.CurGame) {

                    UIComponent.Instance.ShowUI(PrefabUI.MttPayforHome, { data: dialogData, type: 2 });

                    // UIComponent.Instance.ShowUI(PrefabUI.MttAgainBuy, dialogData);
                } else {

                    UIComponent.open(UIDefine.MttPayforHome, { data: dialogData, type: 2 })
                    // UIComponent.open(UIDefine.MttAgainBuy, dialogData)
                }
            }
            else {
                ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(code));
            }
        }, null);

    }

    CalcPartialBringInValue(baseVal, remainVal, ratio) {
        let v = Math.ceil(baseVal * ratio);
        return v < remainVal ? v : 0;
    }

    MTTPartialBringInActionHandler(resultCallback, exceptionCallback, storeChips) {
        this.PartialBringIn = 0;

        let onClick = (baseValue, remainValue, ratioValue) => {
            this.PartialBringIn = this.CalcPartialBringInValue(baseValue, remainValue, ratioValue);
            if (resultCallback) {
                resultCallback(0);
            }
        };

        if (storeChips != 0) {
            // 用于玩法内部分带入处理
            let baseVal = this.MttInfo.mtt.initial_score;
            let remainVal = storeChips;
            let upBlTime = this.MttInfo.mtt.upblind_interval;
            let rebuyBl = this.MttInfo.mtt.max_rebuy_bl;
            let starTime = this.MttInfo.mtt.start_time;
            // UIComponent.Instance.ShowNoAnimation(UIType.UIDialogPartialAddOn, new UIDialogPartialAddOnComponent.DialogData()
            // {
            // 	mttDataInfo = new UIDialogPartialAddOnComponent.MTTDataInfo()
            // 	{
            // 		upblindInterval = upBlTime,
            // 		rebuyBlind = rebuyBl,
            // 		starTime = starTime,
            // 		remainVal = remainVal,
            // 		baseVal = baseVal
            // 	},
            // 	type = UIDialogPartialAddOnComponent.DialogData.DialogType.CommitCancel,
            // 	title = "",
            // 	content = "初始记分牌: " + baseVal + "  剩余记分牌: " + remainVal,
            // 	action1 = () => { onClick(baseVal, remainVal, 1.0 / 3.0); },
            // 	action2 = () => { onClick(baseVal, remainVal, 2.0 / 3.0); },
            // 	action3 = () => { onClick(baseVal, remainVal, 1.0); }
            // });
        }
        else {
            // 用于玩法外部分带入处理
            this.RequestMTTDetails(this.MttInfo.mtt.match_id, code => {
                if (code == 0) {
                    // if (IsNeedPartialBringIn)
                    // {
                    //     long baseVal = MttInfo.mtt.initial_score;
                    //     long remainVal = MttInfo.state.store;
                    //     UIComponent.Instance.ShowNoAnimation(UIType.UIDialogPartialAddOn, new UIDialogPartialAddOnComponent.DialogData()
                    //     {
                    //         type = UIDialogPartialAddOnComponent.DialogData.DialogType.CommitCancel,
                    //         title = "",
                    //         content = "初始记分牌: " + StringHelper.GetDoubleString(baseVal) + "  剩余记分牌: " + StringHelper.GetDoubleString(remainVal),
                    //         action1 = () => { onClick(baseVal, remainVal, 1.0 / 3.0); },
                    //         action2 = () => { onClick(baseVal, remainVal, 2.0 / 3.0); },
                    //         action3 = () => { onClick(baseVal, remainVal, 1.0); }
                    //     });
                    // }
                    // else
                    // {
                    // 全部带入
                    this.PartialBringIn = 0;
                    if (resultCallback) {
                        resultCallback(0);
                    }
                    // }
                }
                else {
                    if (resultCallback) {
                        resultCallback(code);
                    }
                }
            }, exceptionCallback);
        }
    }

    // public void MTTAddOnActionHandler(Def.Types.AddOnMode addOnMode)
    // 	{
    // 		UIComponent.Instance.ShowNoAnimation(UIType.UIMTTSignDialog, new UIMTTSignDialogComponent.DialogData()
    // 		{
    // 			type = UIMTTSignDialogComponent.DialogData.DialogType.CommitCancel,
    // 			title = LanguageManager.Get("OpCodeString_MTTAO"),
    // 			//报名费+服务费+猎人赛人头费
    // 			coinnum = MttInfo.mtt.apply_fee_pool,
    // 			hunterFee = MttInfo.mtt.apply_fee_hunter,
    // 			Fee = MttInfo.mtt.apply_fee_service,
    // 			isHunter = MttInfo.mtt.hunter_on,

    // 			buyin_free_times = MttInfo.mtt.buyin_free_times,
    // 			rebuy_free_times = MttInfo.mtt.rebuy_free_times,
    // 			multi_ratio_free_times = MttInfo.mtt.multi_ratio_free_times,
    // 			addon_free_times = MttInfo.mtt.addon_free_times,
    // 			buyin_free_incl_svr = MttInfo.mtt.buyin_free_incl_svr,
    // 			rebuy_free_incl_svr = MttInfo.mtt.rebuy_free_incl_svr,
    // 			multi_ratio_free_incl_svr = MttInfo.mtt.multi_ratio_free_incl_svr,
    // 			addon_free_incl_svr = MttInfo.mtt.addon_free_incl_svr,
    // 			mTTJoinMode = MTTJoinMode.AddOn,

    // 			coinBalance = string.Format(LanguageManager.Get("UIMTTApply_dialog_content"), StringHelper.GetDoubleString(GameCache.Instance.gold)),
    // 			contentCommit = CPErrorCode.LanguageDescription(10012),
    // 			contentCancel = CPErrorCode.LanguageDescription(10013),
    // 			buyRatio = MttInfo.mtt.buy_ratio,
    // 			buyTimes = MttInfo.mtt.rebuy_times - MttInfo.mtt.total_rebuy_times,
    // 			actionCommit = (isticket, buyRatio, used_prop_id, prop_type, use_free) =>
    // 			{
    // 				CPGameSessionComponent.Instance.Send(new Protocol_Holdem_AddOn()
    // 				{
    // 					RoomID = (ulong)GameCache.Instance.room_id,
    // 					MatchID = (ulong)GameCache.Instance.match_id,
    // 					request = new ClientMessageAddOn()
    // 					{
    // 						Room = new Room() { RoomId = (uint)GameCache.Instance.room_id, MatchId = (uint)GameCache.Instance.match_id },
    // 						Mode = addOnMode,
    // 						Ratio = 1,
    // 						UseProp = false,
    // 						PropType = prop_type,
    // 						UsedPropId = (ulong)used_prop_id,
    // 						UseFree = use_free
    // 					}
    // 				});
    // 			}
    // 		});

    // 	}

    /// <summary>
    /// 购买
    /// </summary>
    /// <param name="request"></param>
    /// <param name="pAct"></param>
    APIPropUserBuyProp(pAct) {
        let request =
        {
            prop_id: this.MttInfo.mtt.buy_prop_id,
            match_id: this.MttInfo.mtt.match_id,
        }
        HttpRequest.Send({
            api: WebPropUserBuyProp.API,
            request: WebPropUserBuyProp,
            body: WebPropUserBuyProp.Request(request),
            onSuccess: function () {
                let tResp = WebPropUserBuyProp.Response;
                if (pAct != null) {
                    pAct(tResp);
                }
            }.bind(this),
            onFailure: function (content) {
            }.bind(this)
        });
    }

    /// <summary>
    /// 查询
    /// </summary>
    /// <param name="request"></param>
    /// <param name="pAct"></param>
    APIPropUserCheckPropInfo(pAct) {
        let request =
        {
            prop_id: this.MttInfo.mtt.buy_prop_id,
        };
        HttpRequest.Send({
            api: WebPropUserCheckPropInfo.API,
            request: WebPropUserCheckPropInfo,
            body: WebPropUserCheckPropInfo.Request(request),
            onSuccess: function () {
                let tResp = WebPropUserCheckPropInfo.Response;
                if (pAct != null) {
                    pAct(tResp);
                }
            }.bind(this),
            onFailure: function (content) {
            }.bind(this)
        });
    }

    /// <summary>
    /// MTT查询折扣 todo 需要依赖我的背包
    /// </summary>
    /// <param name="pAct"></param>
    APIMtt_GetDiscounts(pAct) {
        // WebRoomCenterMttGetdisCountS.RequestData request = new WebRoomCenterMttGetdisCountS.RequestData()
        // {

        // };
        // HttpRequestComponent.Instance.Send(WebRoomCenterMttGetdisCountS.API, WebRoomCenterMttGetdisCountS.Request(request), (Action<string>)(resData =>
        // {
        //     var tResp = WebRoomCenterMttGetdisCountS.Response(resData);
        //     if (pAct != null)
        //     {
        //         pAct(tResp);
        //     }
        // }), null);
    }

    RequestMTTDetails(
        matchID,
        resultCallback,
        exceptionCallback
    ) {
        let requestData =
        {
        };

        let self = this;

        HttpRequest.Send({
            api: WebRoomCenterMttDetailS.API.replace("{id}", matchID.toString()),
            request: WebRoomCenterMttDetailS,
            body: WebRoomCenterMttDetailS.Request(requestData),
            onSuccess: function () {
                var responseData = WebRoomCenterMttDetailS.Response;
                if (responseData.code == 0) {
                    // 核心数据缓存
                    self.MttInfo = responseData.data;
                    let a = responseData.data;
                    GameCache.Instance.room_type = self.MttInfo.mtt.type;
                    GameCache.Instance.game_type = self.MttInfo.mtt.game_type;
                    GameCache.Instance.poker_type = self.MttInfo.mtt.poker_type;
                    GameCache.Instance.bet_type = self.MttInfo.mtt.limit_bet_type;
                    GameCache.Instance.mtt_rebuyLevel = self.MttInfo.mtt.max_rebuy_bl;
                    GameCache.Instance.mtt_addclrebuyLevel = self.MttInfo.mtt.addon_end_bl;
                    GameCache.Instance.mtt_addoprebuyLevel = self.MttInfo.mtt.addon_begin_bl;
                    GameCache.Instance.currLeve = self.MttInfo.more.bl;
                    // GameCache.Instance.TableClothTag = MttInfo.mtt.tablecloth_tag;//指定桌布
                }
                if (resultCallback) {
                    resultCallback(responseData.code);
                }
            }.bind(this),
            onFailure: function (content) {
            }.bind(this)
        });
    }


    public get RebuyCost() {
        return this.MttInfo.mtt.apply_fee_pool + this.MttInfo.mtt.apply_fee_service;
    }


    public ShowGameplayUI(isLookOn: boolean, roomid: number = 0) {
        // 参赛进入roomid置空，观众进入roomid置为对应房间id
        GameCache.Instance.room_id = roomid;

        // UIComponent.Instance.ShowNoAnimation(UIType.UIMatch_Loading);
        // UIComponent.Instance.Remove(UIType.UIDialog);
        // UIComponent.Instance.Remove(UIType.UIMatch_MttList);
        // UIComponent.Instance.Remove(UIType.UIMatch_MttDetail);
        // UIComponent.Instance.ShowNoAnimation(UIType.UITexas, new object[] { fromUI, isLookOn, PartialBringIn });
        GameUtil.EnterMTTRoom({ game_enter_type: GameEnterType.MTT, isLookOn: isLookOn });
    }


    public static get Instance(): UIMTTModel {
        return (this as any).instance ??= new UIMTTModel;
    }

    //mtt_detail数据
    MttInfo: any;

    refreshData(data: any) {
        this.MttInfo = data;
        GameCache.Instance.room_type = data.mtt.type;
        GameCache.Instance.game_type = data.mtt.game_type;
        GameCache.Instance.poker_type = data.mtt.poker_type;
        GameCache.Instance.bet_type = data.mtt.limit_bet_type;
        GameCache.Instance.mtt_rebuyLevel = data.mtt.max_rebuy_bl;
        GameCache.Instance.mtt_addclrebuyLevel = data.mtt.addon_end_bl;
        GameCache.Instance.mtt_addoprebuyLevel = data.mtt.addon_begin_bl;
        GameCache.Instance.currLeve = data.more.bl;
        GameCache.Instance.TribeId = data.mtt.tribe_id;
        GameCache.Instance.TableClothTag = data.mtt.tablecloth_tag;//指定桌布
    }

    //获取货币类型名
    GetGoldTypeName(gold_type: number): string {
        switch (gold_type) {
            case 1:
                return "UC";
            case 2:
                return "GC";
            default:
                return "";
        }
    }

}
(window as any).UIMTTModel = UIMTTModel;