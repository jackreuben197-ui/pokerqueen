/*
 * @Author: xfj
 * @Date: 2023-01-16 10:33:59
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-31 17:40:29
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforHome.ts
 */


import { UIDefine } from "../../define/UIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import BaseForm from "../../ui/form/BaseForm";
import UIComponent from "../../ui/UIComponent";
import { EventName } from "../../config/EventName";
import { MTTJoinAction, UIMatchMttModel } from "../../frame/data/mtt/UIMatchMttModel";
import { GameCache } from "../../game/GameCache";
import TimeHelper from "../../helper/TimeHelper";
import MTTGame from "../../game/texas/MTTGame";
import { UIMineModel } from "../../lobby/UIMineModel";
import HttpRequest from "../../net/https/HttpRequest";
import { Web_Prop_User_Buy_Prop, Web_Prop_User_Check_Prop_Info, Web_Room_Center_Mtt_Buyin, Web_Room_Center_Mtt_Details, Web_Room_Center_Mtt_Rebuy } from "../../net/https/WebRequest";
import { i18nMgr } from "../../i18n/i18nMgr";
import { ServerErrorCode } from "../../net/websocket/ServerErrorCode";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttPayforHome')
export default class MttPayforHome extends BaseForm {

    payNode: cc.Node = null;
    select_lbl: cc.Label = null;
    sure: cc.Node = null;
    rateNode: cc.Node = null;
    _data: any = null;
    totalRebuyTimes = 0;
    isCurTimeOverEnterTime = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.payNode = this.getChildNodeOrComponent('payNode')
        this.select_lbl = this.getChildNodeOrComponent('select_lbl', cc.Label);
        this.sure = this.getChildNodeOrComponent('sure');
        this.rateNode = this.getChildNodeOrComponent('rateNode');
    }
    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {

        super.onShow(param, fromUI, sceneUI);
        this._data = param;
        this.initSelectWallet()
        this.bindClick(this.payNode, () => {
            // if (ClubCache.mttPayWallat != null) return
            UIComponent.open(UIDefine.MttPayforList)
        })
    }
    protected regiterDispatchEvent() {
        this.listen(EventName.selectMttWwllet, this.initSelectWallet);

    }
    initSelectWallet() {
        if (ClubCache.mttPayWallat == null) {
            this.sure.active = false
            this.setText(this.select_lbl, 'UILogin_Select')
            this.rateNode.active = false
        } else {
            this.sure.active = true;
            this.setText(this.select_lbl, ClubCache.mttPayWallat.club_name)
            this.rateNode.active = true
            let num1 = cc.find('node1/num', this.rateNode).getComponent(cc.Label)
            num1.string = ClubCache.mttPayWallat.gold
            let num2 = cc.find('node2/num', this.rateNode).getComponent(cc.Label)
            this.totalRebuyTimes = UIMatchMttModel.Instance.MttInfo.mtt.rebuy_times;
            if (this.totalRebuyTimes < 10000) {
                //可重构次数   
                //!!!!!特别注意:当后台设置不限制重构次数时,rebuy_times为10000,而left_rebuy_times在后端传输时做了int8转换越界变为16了,但只是传到前端的转化了后端正常,故在此做特别处理!!!!!!
                if (UIMatchMttModel.Instance.MttInfo.state != null) {
                    num2.string = UIMatchMttModel.Instance.MttInfo.state.left_rebuy_times.toString()
                } else {
                    num2.string = this.totalRebuyTimes.toString()
                }
            } else {
                num2.string = i18nMgr.Get("UIMTT_StateUnLimitRebuy")
            }


            let num3 = cc.find('node3/num', this.rateNode).getComponent(cc.Label)
            //门票逻辑
            // num3.string = i18nMgr.Get("UIMTTSignDialogCanUseTickt").replace("{0}", this.cachePropBalance.toString());

        }
    }
    // signUpBtn() {
    //     this.RefreshMttDetails(() => {
    //         // if (!go.GetComponent<Button>().interactable)
    //         // {
    //         //     return;
    //         // }
    //         let mttInfo = UIMatchMttModel.Instance.MttInfo;
    //         switch (mttInfo.state_code) {
    //             case MTTGame.MTTPlayerStatus.CanApplyNotStart:
    //             case MTTGame.MTTPlayerStatus.CanApplyDelay:
    //                 {
    //                     UIMatchMttModel.Instance.HandleMTTJoinAction(MTTJoinAction.Apply, code => {
    //                         // this.RefreshMttDetails();
    //                         this.close();
    //                     }, httpState => {
    //                         // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
    //                     });
    //                 }
    //                 break;
    //             case MTTGame.MTTPlayerStatus.CanJoin:
    //                 {
    //                     UIMatchMttModel.Instance.HandleMTTJoinAction(MTTJoinAction.PartialBringIn, bringInCode => {
    //                         if (bringInCode == 0) {
    //                             //进入MTT房间时添加firebase事件触发
    //                             // let paramMap = [];
    //                             // paramMap.push("game_type", GameCache.Instance.game_type + "");//游戏类型
    //                             // paramMap.push("roomId", GameCache.Instance.room_id + "");//房间id
    //                             // paramMap.push("roomName", GameCache.Instance.roomName + "");//房间名称
    //                             // paramMap.push("room_type", GameCache.Instance.room_type + "");//房间类型
    //                             // paramMap.push("match_id", GameCache.Instance.match_id + "");//比赛id
    //                             // GoogleFirebaseHelper.LevelStartEvent(paramMap);
    //                             //添加到appsFlyer统计进入MTT房间消息
    //                             // let valuesMap = [];
    //                             // valuesMap.push("game_type", GameCache.Instance.game_type + "");//游戏类型
    //                             // valuesMap.push("roomId", GameCache.Instance.room_id + "");//房间id
    //                             // valuesMap.push("roomName", GameCache.Instance.roomName + "");//房间名称
    //                             // valuesMap.push("room_type", GameCache.Instance.room_type + "");//房间类型
    //                             // valuesMap.push("match_id", GameCache.Instance.match_id + "");//比赛id
    //                             // AppsFlyerHelper.MTTGameEnterEvent(valuesMap);
    //                             // UIMatchMttModel.Instance.ShowGameplayUI(fromUI: UIType.UIMatch_MttDetail, isLookOn: false, roomid: 0);
    //                             UIMatchMttModel.Instance.ShowGameplayUI([UIDefine.MttDetailForm, UIDefine.MttListForm], false, 0);
    //                         }
    //                         else {
    //                             this.RefreshMttDetails();
    //                             // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(bringInCode));
    //                         }
    //                     }, httpState => {
    //                         // ToastManager.Instance.createToast($"{nameof(HTTPRequestStates)}: {httpState}");
    //                     });
    //                 }
    //                 break;
    //             case MTTGame.MTTPlayerStatus.LoseCanRebuy:
    //                 {
    //                     //更新金豆
    //                     UIMineModel
    //                     UIMineModel.mInstance.ObtainUserInfo(pDto => {
    //                         UIMatchMttModel.Instance.HandleMTTJoinAction(MTTJoinAction.Rebuy, rebuyCode => {
    //                             if (rebuyCode == 0) {
    //                                 UIMatchMttModel.Instance.ShowGameplayUI([UIDefine.MttDetailForm, UIDefine.MttListForm], false, 0);
    //                                 // UIMatchMttModel.Instance.ShowGameplayUI(fromUI: UIType.UIMatch_MttDetail, isLookOn: false, roomid: 0);
    //                             }
    //                             else {
    //                                 this.RefreshMttDetails();
    //                                 // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(rebuyCode));
    //                             }
    //                         }, httpState => {
    //                             // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
    //                         });
    //                     });

    //                 }
    //                 break;
    //         }
    //     });
    // }
    // signUpReq() {
    //     // let req =
    //     // {
    //     //     ticket: isticket,
    //     //     ratio: buyRatio,
    //     //     used_prop_id: used_prop_id,
    //     //     prop_type: prop_type,
    //     //     use_free: use_free
    //     // };

    //     HttpRequest.Send({
    //         api: Web_Room_Center_Mtt_Buyin.API.replace("{id}", this._data._msg.match_id.toString()),
    //         request: Web_Room_Center_Mtt_Buyin,
    //         body: Web_Room_Center_Mtt_Buyin.Request(req),
    //         onSuccess: function () {
    //             let response = Web_Room_Center_Mtt_Buyin.Response;
    //             if (response.code == 0) {
    //                 let content = i18nMgr.Get("MTT_Apply_Success");
    //                 UIComponent.Instance.Toast(content);
    //             }
    //             else if (response.code == ServerErrorCode.MTT_SameTagLimit) {
    //                 // UIComponent.Instance.ShowNoAnimation(UIType.UIDialog,
    //                 //                             new UIDialogComponent.DialogData()
    //                 //                             {
    //                 //                                 type = UIDialogComponent.DialogData.DialogType.Commit,
    //                 //                                 title = LanguageManager.Get("adaptation10007"),
    //                 //                                 content = CPErrorCode.ServerErrorDescription(response.code),
    //                 //                                 contentCommit = LanguageManager.Get("UIBackDiolg_Konw_01"),
    //                 //                                 contentCancel = string.Empty,
    //                 //                                 actionCommit = null,
    //                 //                                 actionCancel = null
    //                 //                             });
    //             }
    //             else {
    //                 // if (UIMineModel.mInstance.UserInfoDto.user.gold < (StringHelper.GetLongClientCurrencyUnit(MttInfo.mtt.apply_fee_pool) + StringHelper.GetLongClientCurrencyUnit(MttInfo.mtt.apply_fee_service) + StringHelper.GetLongClientCurrencyUnit(MttInfo.mtt.apply_fee_hunter)))
    //                 // {
    //                 //     UIComponent.Instance.Toast(LanguageManager.Get("adaptation20094"));
    //                 // }
    //                 // else
    //                 // {
    //                 //     UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(response.code));
    //                 // }
    //             }
    //         }.bind(this),
    //         onFailure: function (content) {
    //         }.bind(this)
    //     });
    // }
    // RefreshMttDetails(callback = null) {
    //     // if (IsDisposed)
    //     // {
    //     //     return;
    //     // }
    //     UIMatchMttModel.Instance.RequestMTTDetails(this._data._msg.match_id, code => {
    //         if (code == 0) {
    //             //声纹获取麦克风权限
    //             if (UIMatchMttModel.Instance.MttInfo.mtt.voiceprint_verify_on == 1) {
    //                 // if (!MicrophoneHelper.IsMicrophonePermissionAllowed())
    //                 // {
    //                 //     return;
    //                 // }

    //                 // UITexasModel.mInstance.APIUserVoiceprint(0, 0, Act =>
    //                 // {
    //                 //     if (Act.code == 0)
    //                 //     {
    //                 //         if (Act.data == null)
    //                 //         {
    //                 //             NeedVoiceprintVerification = true;
    //                 //         }
    //                 //     }
    //                 // });
    //             }
    //             ///免服务费逻辑
    //             if (UIMatchMttModel.Instance.MttInfo.mtt.buy_prop_id != 0) {
    //                 UIMatchMttModel.Instance.APIPropUserCheckPropInfo(res => {

    //                     if (res.code == 0) {
    //                         GameCache.Instance.gold = res.data.wallet_balance;
    //                         if (res.data.prop_property_type == 2)//如果Type == 2  免服务费 
    //                         {
    //                             UIMatchMttModel.Instance.MttInfo.mtt.prop_buy_type = 0;
    //                         }
    //                         // UI mUI = UIComponent.Instance.Get(UIType.UIMatch_MttDetailState);
    //                         // if (null != mUI)
    //                         // {
    //                         //     UIMatch_MttDetailStateComponent mUIComponent = mUI.UiBaseComponent as UIMatch_MttDetailStateComponent;
    //                         //     mUIComponent.UpdateInfo(UIMatchMttModel.Instance.MttInfo);
    //                         // }
    //                     }
    //                     else {
    //                         // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res.code));
    //                     }
    //                 });
    //             }
    //             else {
    //                 // UI mUI = UIComponent.Instance.Get(UIType.UIMatch_MttDetailState);
    //                 // if (null != mUI)
    //                 // {
    //                 //     UIMatch_MttDetailStateComponent mUIComponent = mUI.UiBaseComponent as UIMatch_MttDetailStateComponent;
    //                 //     mUIComponent.UpdateInfo(UIMatchMttModel.Instance.MttInfo);
    //                 // }
    //             }
    //             //判断当前时间是否大于进入比赛时间

    //             this.isCurTimeOverEnterTime = TimeHelper.Now >= TimeHelper.RFC3339TimeConvertToUTCTime(UIMatchMttModel.Instance.MttInfo.mtt.enter_time);
    //             if (callback) {
    //                 callback();
    //             }
    //         }
    //         else {
    //             // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(code));
    //         }
    //     }, httpState => {
    //         // UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
    //     });
    // }

}
