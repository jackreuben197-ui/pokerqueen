import { UIType } from "../../../define/EIDefine";
import { UIDefine } from "../../../define/UIDefine";
import { GameCache } from "../../../game/GameCache";
import { CPErrorCode } from "../../../i18n/CPErrorCode";
import { i18nMgr } from "../../../i18n/i18nMgr";
import UIMttSignDialogComponent, { DialogData, DialogType } from "../../../mtt/detail/UIMttSignDialogComponent";
import HttpRequest from "../../../net/https/HttpRequest";
import { Web_Prop_User_Buy_Prop, Web_Prop_User_Check_Prop_Info, Web_Room_Center_Mtt_Buyin, Web_Room_Center_Mtt_Details } from "../../../net/https/WebRequest";
import { ServerErrorCode } from "../../../net/websocket/ServerErrorCode";
import { MTTInfo } from "../../../protobuf/holdem/define_pb";
import UIComponent from "../../../ui/UIComponent";
import GC from "../../GameControl";


export enum MTTJoinAction // 参与mtt玩法动作
{
    None,
    Apply,          // 报名
    Rebuy,          // 重购
    PartialBringIn, // 部分带入
}

enum MTTJoinMode // 参与mtt玩法方式
{
    None,
    Apply,          // 报名
    Rebuy,          // 重购
    AddOn, // 增购
}

export class UIMatchMttModel {
   
    _joinAction: MTTJoinAction = MTTJoinAction.None;
    _actionResultCallback: any = null;
    _args: any = null;
    _actionExceptionCallback: any = null;
    MttInfo: typeof Web_Room_Center_Mtt_Details.Data;

    HandleMTTJoinAction(
        actionType: MTTJoinAction,
        resultCallback: any,
        exceptionCallback: any = null,
        args: any = null,
        checkGPS: boolean = true
    )
    {
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
    )
    {
        switch (actionType)
        {
            case MTTJoinAction.Apply:
                {
                    this.MTTApplyActionHandler(resultCallback, exceptionCallback);
                }
                break;
            case MTTJoinAction.Rebuy:
                {
                    // this.MTTRebuyActionHandler(resultCallback, exceptionCallback);
                }
                break;
            case MTTJoinAction.PartialBringIn:
                {
                    // this.MTTPartialBringInActionHandler(resultCallback, exceptionCallback, args == null ? 0 : (int)args);
                }
                break;
        }
    }

    MTTApplyActionHandler(resultCallback, exceptionCallback)
    {

        let rebuyTimes = this.MttInfo.mtt.rebuy_times + 1;//+1 为报名 买入次数等于 重构次数 + 报名
        let dialogData = {
            type : DialogType.CommitCancel,
            title : i18nMgr.Get("UIMTTSignDialogBuyTitle"),
            //报名费+服务费+猎人赛人头费
            coinnum : this.MttInfo.mtt.apply_fee_pool,
            hunterFee : this.MttInfo.mtt.apply_fee_hunter,
            Fee : this.MttInfo.mtt.apply_fee_service,
            isHunter : this.MttInfo.mtt.hunter_on,

            buyin_free_times : this.MttInfo.mtt.buyin_free_times,
            rebuy_free_times : this.MttInfo.mtt.rebuy_free_times,
            multi_ratio_free_times : this.MttInfo.mtt.multi_ratio_free_times,
            addon_free_times : this.MttInfo.mtt.addon_free_times,
            buyin_free_incl_svr : this.MttInfo.mtt.buyin_free_incl_svr,
            rebuy_free_incl_svr : this.MttInfo.mtt.rebuy_free_incl_svr,
            multi_ratio_free_incl_svr : this.MttInfo.mtt.multi_ratio_free_incl_svr,
            addon_free_incl_svr : this.MttInfo.mtt.addon_free_incl_svr,
            mTTJoinMode : MTTJoinMode.Apply,

            coinBalance : i18nMgr.Get("UIMTTApply_dialog_content").replace("{0}", GC.data.user.info.gold.toString()),
            contentCommit : CPErrorCode.LanguageDescription(10012),
            contentCancel : CPErrorCode.LanguageDescription(10013),
            buyRatio : this.MttInfo.mtt.buy_ratio,
            buyTimes : this.MttInfo.mtt.rebuy_times - this.MttInfo.mtt.total_rebuy_times,
            actionCommit : (isticket, buyRatio, used_prop_id, prop_type, use_free) =>
            {
                let req =
                { 
                    ticket : isticket, 
                    ratio : buyRatio, 
                    used_prop_id : used_prop_id,
                    prop_type : prop_type, 
                    use_free : use_free 
                };

                HttpRequest.Send({
                    api: Web_Room_Center_Mtt_Buyin.API.replace("{id}", this.MttInfo.mtt.match_id.toString()),
                    request: Web_Room_Center_Mtt_Buyin,
                    body: Web_Room_Center_Mtt_Buyin.Request(req),
                    onSuccess: function () {
                        let response = Web_Room_Center_Mtt_Buyin.Response;
                        if (response.code == 0)
                        {
                            let content = i18nMgr.Get("MTT_Apply_Success");
                            UIComponent.Instance.Toast(content);
                        }
                        else if (response.code == ServerErrorCode.MTT_SameTagLimit)
                        {
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
                        else
                        {
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
        UIComponent.open(UIDefine.UIMttSignDialogComponent, dialogData)
    }



    // MTTRebuyActionHandler(resultCallback, exceptionCallback)
	// 	{
	// 		MTTGame curGame = GameCache.Instance.CurGame as MTTGame;
	// 		RequestMTTDetails(this.MttInfo.mtt.match_id, code =>
	// 		{
	// 			if (code == 0)
	// 			{
	// 				let cost : RebuyCost;
	// 				let score = curGame == null ? this.MttInfo.mtt.initial_score : curGame.RebuyScore;
	// 				let remain_count = curGame == null ? this.MttInfo.state.left_rebuy_times : curGame.RemainRebuyCount;
	// 				let upBlTime = this.MttInfo.mtt.upblind_interval;
	// 				let rebuyBl = this.MttInfo.mtt.max_rebuy_bl;
	// 				let starTime = this.MttInfo.mtt.start_time;

	// 				let rebuyTimes = this.MttInfo.state.left_rebuy_times;

	// 				//string content = string.Format(LanguageManager.Get("MTT_Rebuy_Alert"), StringHelper.GetLongString(cost), StringHelper.GetLongString(score), remain_count);
	// 				UIComponent.Instance.ShowNoAnimation(UIType.UIMTTSignDialog, new UIMTTSignDialogComponent.DialogData()
	// 				{
	// 					type = UIMTTSignDialogComponent.DialogData.DialogType.CommitCancel,
	// 					title = LanguageManager.Get("UIMTTSignDialogReBuyTitle"),
	// 					//content = content,

	// 					coinnum = MttInfo.mtt.apply_fee_pool,
	// 					hunterFee = MttInfo.mtt.apply_fee_hunter,
	// 					Fee = MttInfo.mtt.apply_fee_service,
	// 					isHunter = MttInfo.mtt.hunter_on,
	// 					buyTimes = rebuyTimes,
	// 					buyRatio = MttInfo.mtt.buy_ratio,

	// 					buyin_free_times = MttInfo.mtt.buyin_free_times,
	// 					rebuy_free_times = MttInfo.mtt.rebuy_free_times,
	// 					multi_ratio_free_times = MttInfo.mtt.multi_ratio_free_times,
	// 					addon_free_times = MttInfo.mtt.addon_free_times,
	// 					buyin_free_incl_svr = MttInfo.mtt.buyin_free_incl_svr,
	// 					rebuy_free_incl_svr = MttInfo.mtt.rebuy_free_incl_svr,
	// 					multi_ratio_free_incl_svr = MttInfo.mtt.multi_ratio_free_incl_svr,
	// 					addon_free_incl_svr = MttInfo.mtt.addon_free_incl_svr,
	// 					mTTJoinMode = MTTJoinMode.Rebuy,

	// 					coinBalance = string.Format(LanguageManager.Get("UIMTTApply_dialog_content"), StringHelper.GetDoubleString(GameCache.Instance.gold)),
	// 					contentCommit = CPErrorCode.LanguageDescription(10012),
	// 					contentCancel = CPErrorCode.LanguageDescription(10013),
	// 					rebuyData = new UIMTTSignDialogComponent.RebuyData()
	// 					{
	// 						upblindInterval = upBlTime,
	// 						rebuyBlind = rebuyBl,
	// 						starTime = starTime
	// 					},
	// 					actionCommit = (isticket, buyRatio, used_prop_id, prop_type, use_free) =>
	// 					{
	// 						Web_Room_Center_Mtt_Rebuy.RequestData req = new Web_Room_Center_Mtt_Rebuy.RequestData() { ticket = isticket, ratio = buyRatio, used_prop_id = used_prop_id, prop_type = prop_type, use_free = use_free };

	// 						HttpRequestComponent.Instance.Send(
	// 							StringHelper.GetWebUrlString(Web_Room_Center_Mtt_Rebuy.API, MttInfo.mtt.match_id.ToString()),
	// 							Web_Room_Center_Mtt_Rebuy.Request(req),
	// 							json =>
	// 							{
	// 								var response = Web_Room_Center_Mtt_Rebuy.Response(json);
	// 								if (response.code == 0)
	// 								{
	// 									UIComponent.Instance.Toast(LanguageManager.Get("Repurchase_successful"));
	// 								}
	// 								else
	// 								{
	// 									UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.code));
	// 								}
	// 								resultCallback?.Invoke(response.code);
	// 							},
	// 							null,
	// 							null,
	// 							(httpState) =>
	// 							{
	// 								exceptionCallback?.Invoke(httpState);
	// 							},
	// 							_httpConnectTimeoutThreshold,
	// 							_httpRequestTimeoutThreshold
	// 						);
	// 					},
	// 					actionCancel = () =>
	// 					{
	// 						if (curGame != null)
	// 						{
	// 							UIComponent.Instance.ShowNoAnimation(UIType.UIMTTMineRank, new UIMTTMineRankComponent.MineRankData()
	// 							{
	// 								matchId = GameCache.Instance.match_id,
	// 								matchName = GameCache.Instance.roomName,
	// 								isRebuy = true,
	// 							});
	// 							curGame.ChangeGameState(TexasGameState.Exit, null);
	// 						}
	// 					}
	// 				});
	// 			}
	// 			else
	// 			{
	// 				UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
	// 			}
	// 		}, null);

	// 	}


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
    APIPropUserBuyProp(pAct)
    {
        let request =
        {
            prop_id : this.MttInfo.mtt.buy_prop_id,
            match_id : this.MttInfo.mtt.match_id,
        }
        HttpRequest.Send({
            api: Web_Prop_User_Buy_Prop.API,
            request: Web_Prop_User_Buy_Prop,
            body: Web_Prop_User_Buy_Prop.Request(request),
            onSuccess: function () {
                let tResp = Web_Prop_User_Buy_Prop.Response;
                if (pAct != null)
                {
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
    APIPropUserCheckPropInfo(pAct)
    {
        let request = 
        {
            prop_id : this.MttInfo.mtt.buy_prop_id,
        };
        HttpRequest.Send({
            api: Web_Prop_User_Check_Prop_Info.API,
            request: Web_Prop_User_Check_Prop_Info,
            body: Web_Prop_User_Check_Prop_Info.Request(request),
            onSuccess: function () {
                let tResp = Web_Prop_User_Check_Prop_Info.Response;
                if (pAct != null)
                {
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
    APIMtt_GetDiscounts(pAct)
    {
        // Web_Room_Center_Mtt_GetDiscounts.RequestData request = new Web_Room_Center_Mtt_GetDiscounts.RequestData()
        // {

        // };
        // HttpRequestComponent.Instance.Send(Web_Room_Center_Mtt_GetDiscounts.API, Web_Room_Center_Mtt_GetDiscounts.Request(request), (Action<string>)(resData =>
        // {
        //     var tResp = Web_Room_Center_Mtt_GetDiscounts.Response(resData);
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
        )
    {
        let requestData =
        {
        };

        let self = this;

        HttpRequest.Send({
            api: Web_Room_Center_Mtt_Details.API.replace("{id}", matchID.toString()),
            request: Web_Room_Center_Mtt_Details,
            body: Web_Room_Center_Mtt_Details.Request(requestData),
            onSuccess: function () {
                var responseData = Web_Room_Center_Mtt_Details.Response;
                if (responseData.code == 0)
                {
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


    private static instance: UIMatchMttModel;
    private constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UIMatchMttModel();
        }
        return this.instance;
    }
}