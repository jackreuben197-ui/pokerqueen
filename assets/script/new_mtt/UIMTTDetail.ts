import { B } from "../common/Singleton";
import TabsGroup from "../common/TabsGroup";
import { Tabs_Status, TextColor } from "../config/GameConfig";
import { GameCache } from "../game/GameCache";
import MTTGame from "../game/texas/MTTGame";
import GameUtil from "../game/util/GameUtil";
import TimeHelper from "../helper/TimeHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { CPErrorCode } from "../i18n/CPErrorCode";
import { i18nMgr } from "../i18n/i18nMgr";
import { UIMineModel } from "../lobby/UIMineModel";
import { WWW } from "../net/https/WebRequest";
import { Web_Prop_User_Check_Prop_Info } from "../net/https/WebRequest";
import { Web_Room_Center_Mtt_Details } from "../net/https/WebRequest";
import LobbySession from "../session/LobbySession";
import UIBase from "../ui/UIBase";
import UIBasePlus from "../ui/UIBasePlus";
import UIComponent from "../ui/UIComponent";
import BaseFormPlus from "../ui/form/BaseFormPlus";
import UIMTTDetail_Player from "./UIMTTDetail_Player";
import UIMTTDetail_State from "./UIMTTDetail_State";
import { MTTJoinAction, UIMTTModel } from "./UIMTTModel";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIMTTDetail extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////

    //比赛名称
    cc_Label$mtt_name: cc.Label = null;
    //比赛奖励
    cc_Label$mtt_bonus: cc.Label = null;
    //buy in 费用
    cc_Label$mtt_fee: cc.Label = null;

    //sign-up 按钮
    $btn_signup: cc.Node = null;
    $buyin_coin: cc.Node = null;
    //页签
    $indexs: cc.Node = null;
    //比赛logo
    cc_Sprite$logo: cc.Sprite = null;




    //状态页
    $mtt_state: cc.Node = null;
    $mtt_player: cc.Node = null;
    $mtt_reward: cc.Node = null;
    $mtt_desk: cc.Node = null;
    $mtt_blind: cc.Node = null;



    ////////////////////////////////////////////////////
    indexs_group: TabsGroup = null;
    //是否超过进入时间
    is_over_time: boolean = false;

    pages: cc.Node[] = null;


    protected lateLoad() {
        this.name = "UIMTTDetail";
        super.lateLoad();
        this.indexs_group = new TabsGroup(this.$indexs.children, this.click_index, this);
        this.pages = [
            this.$mtt_state,
            this.$mtt_player,
            this.$mtt_reward,
            this.$mtt_desk,
            this.$mtt_blind
        ];
    }

    closeAllPages() {
        this.pages.forEach(item => {
            item && (item.active = false);
        })

    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$btn_signup, this.click_signup);
    }
    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("MTT-Apply"));
        this.cc_Sprite$logo.spriteFrame = null;
        this.$buyin_coin.children[0].active = false;
        this.$buyin_coin.children[1].active = false;
        this.closeAllPages();
        this.refreshIndexTexts();
        //this.$mtt_state.getComponent(UIMTTDetail_State).onShow();
    }
    fadeInComplete() {
        super.fadeInComplete();
        this.indexs_group.reset();
    }
    //刷新页签文本
    refreshIndexTexts() {
        let texts = i18nMgr.Get("UIMatchMTTDetailList").split("^");
        this.$indexs.children.forEach((item, index) => {
            item.getChildByName("label").getComponent(cc.Label).string = texts[index];
        })
    }
    //请求比赛详情
    reqMTTDetail(callback?: Function) {

        WWW.Instance.CommonAPI(
            {
                web_class: Web_Room_Center_Mtt_Details,
                api_id: this._param.match_id
            }
        ).then(
            (res: any) => {
                UIMTTModel.Instance.refreshData(res.data);
                this.checkFreeFee(res.data);
                this.refreshDetail(res.data);
                this.UpdateBtn(res.data);
                callback?.call(this);
            },
            (res: any) => {

            }
        )
    }

    //免服务费逻辑
    checkFreeFee(data: any) {

        if (!this.$mtt_state.activeInHierarchy) return;

        if (data.mtt.buy_prop_id != 0) {

            WWW.Instance.CommonAPI(
                {
                    web_class: Web_Prop_User_Check_Prop_Info,
                    body: {
                        prop_id: data.mtt.buy_prop_id
                    }
                }
            ).then(
                (res: any) => {
                    GameCache.Instance.gold = res.data.wallet_balance;
                    if (res.data.prop_property_type == 2)//如果Type == 2  免服务费 
                    {
                        UIMTTModel.Instance.MttInfo.mtt.prop_buy_type = 0;
                    }

                    this.$mtt_state.getComponent(UIMTTDetail_State).UpdateInfo(UIMTTModel.Instance.MttInfo, this._param);
                },
                (res: any) => {

                }
            )
        }
        else {
            this.$mtt_state.getComponent(UIMTTDetail_State).UpdateInfo(UIMTTModel.Instance.MttInfo, this._param);
        }
    }

    //刷新详情界面
    refreshDetail(data: any) {

        this.cc_Label$mtt_name.string = LobbySession.getLanguageValueByKey(data.mtt.name);
        this.cc_Label$mtt_bonus.string = `${data.more.prize_pool / 100}`;
        this.$buyin_coin.children[0].active = data.mtt.gold_type == 1;
        this.$buyin_coin.children[1].active = data.mtt.gold_type == 2;

        if (data.mtt.hunter_on > 0) {
            this.cc_Label$mtt_fee.string = `${data.mtt.apply_fee_pool / 100}+${data.mtt.apply_fee_service / 100}+${data.mtt.apply_fee_hunter / 100}`;
        }
        else {
            this.cc_Label$mtt_fee.string = `${data.mtt.apply_fee_pool / 100}+${data.mtt.apply_fee_service / 100}`;
        }

        //判断当前时间是否大于进入比赛时间
        this.is_over_time = TimeHelper.Now > new Date(data.mtt.enter_time).getTime();
    }

    activeSignBtn(boo: boolean) {
        this.$btn_signup.getComponent(cc.Button).interactable = boo;
        this.$btn_signup.getComponent(cc.Sprite).enabled = boo;
        this.$btn_signup.getChildByName("disable").active = !boo;
        this.setChildColor(this.$btn_signup, "label", boo ? "#FFFFFF" : "#515774");
    }

    getSignBtnActive() {
        return this.$btn_signup.getComponent(cc.Button).interactable;
    }


    //刷新按钮状态
    UpdateBtn(data: any) {
        // 主按钮状态
        //this.$btn_signup.getComponent(cc.Button).interactable = false;
        this.activeSignBtn(false);
        switch (data.state_code) {
            case MTTGame.MTTPlayerStatus.WaitingApply:
                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("mtt_btn_waiting_start"));
                break;
            case MTTGame.MTTPlayerStatus.CanApplyNotStart:

                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("MTT-Apply"));
                this.activeSignBtn(true);

                break;
            case MTTGame.MTTPlayerStatus.CanApplyDelay:

                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("mtt_btn_delay"));
                this.activeSignBtn(true);

                break;
            case MTTGame.MTTPlayerStatus.AppliedNotStart:

                // TODO: 配置译文描述已报名但还不能进场状态
                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("Mtt_AppliedNotStart"));

                break;
            case MTTGame.MTTPlayerStatus.CanJoin:


                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("mtt_btn_enter"));
                this.activeSignBtn(true);

                break;
            case MTTGame.MTTPlayerStatus.CannotApplyStarted:


                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("mtt_btn_sign_up_deadline"));

                break;
            case MTTGame.MTTPlayerStatus.LoseCanRebuy:

                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("MTT_Rebuy"));
                this.activeSignBtn(true);

                break;
            case MTTGame.MTTPlayerStatus.Lose:

                if (data.more.bl >= data.mtt.max_rebuy_bl) {
                    this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("mtt_btn_Stopbuying"));
                }
                else {
                    this.setChildLabel(this.$btn_signup, "label", `${i18nMgr.Get("MTT_Rebuy")} ${data.state.left_rebuy_times}/${data.mtt.rebuy_times}`);
                }

                break;
            case MTTGame.MTTPlayerStatus.JoinComplete:
            case MTTGame.MTTPlayerStatus.NotJoinComplete:

                // TODO: 配置对应译文描述比赛已结束状态

                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("Mtt_Complete"));

                break;
            case MTTGame.MTTPlayerStatus.CannotJoinOvertime:

                // TODO: 配置对应译文描述超时停止进入
                this.setChildLabel(this.$btn_signup, "label", i18nMgr.Get("Mtt_CannotJoinOvertime"));

                break;
            default:

                this.setChildLabel(this.$btn_signup, "label", "");

                break;
        }
    }

    protected update(dt: number): void {
        if (UIMTTModel.Instance.MttInfo == null || this.is_over_time) {
            return;
        }
        if (TimeHelper.Now >= new Date(UIMTTModel.Instance.MttInfo.mtt.enter_time).getTime()) {
            this.reqMTTDetail();
            this.is_over_time = true;
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    //顶部标签点击切换响应
    click_index(items: cc.Node[], index: number) {
        let status_list = Tabs_Status[index];
        items.forEach((item, index) => {
            let status = status_list[index];
            //item.getChildByName("label").color = status ? cc.Color.BLACK.fromHEX(TextColor.Color7) : cc.Color.BLACK.fromHEX(TextColor.Color3);
            this.setChildColor(item, "label", status ? TextColor.Color7 : TextColor.Color3);
            this.setChildVisible(item, "label/subline", status == 1);
            this.pages[index] && (this.pages[index].active = status == 1);
            if (this.pages[index]?.active) {
                this.pages[index].getComponent(UIBasePlus).onShow(UIMTTModel.Instance.MttInfo);
            }
        })
        //////////////////////////////////
        switch (index) {
            case 0:
                this.reqMTTDetail();
                break;
            case 1:
                break;
        }
    }
    click_signup() {

        //let openMatchApply = GameCache.Instance.IsAllowOpenMatchApply;

        let openMatchApply = true; // 2.0后端暂不支持功能开关
        if (!openMatchApply) {
            return;
        }
        // if (NeedVoiceprintVerification) {
        //     if (!MicrophoneHelper.IsMicrophonePermissionAllowed()) {
        //         return;
        //     }
        //     Game.Scene.GetComponent<UIComponent>().ShowNoAnimation(UIType.UITexasHumanYZ, new UITexasHumanYZComponent.VerificationDataInfo()
        // 		{
        //             cacheVoiceprint = VoiceprintRoomType.Hall,
        //         });
        //     return;
        // }
        this.reqMTTDetail(() => {
            if (!this.getSignBtnActive()) {
                return;
            }

            switch (UIMTTModel.Instance.MttInfo.state_code) {
                case MTTGame.MTTPlayerStatus.CanApplyNotStart:
                case MTTGame.MTTPlayerStatus.CanApplyDelay:
                    {
                        UIMTTModel.Instance.HandleMTTJoinAction(MTTJoinAction.Apply, code => {
                            this.reqMTTDetail();
                        }, httpState => {
                            //UIComponent.Instance.Toast($"{nameof(HTTPRequestStates)}: {httpState}");
                        });

                    }
                    break;
                case MTTGame.MTTPlayerStatus.CanJoin:

                    UIMTTModel.Instance.HandleMTTJoinAction(MTTJoinAction.PartialBringIn, bringInCode => {
                        if (bringInCode == 0) {
                            UIMTTModel.Instance.ShowGameplayUI(false, 0);
                        }
                        else {
                            this.reqMTTDetail();
                        }
                    })
                    break;
                case MTTGame.MTTPlayerStatus.LoseCanRebuy:
                    UIMineModel.mInstance.ObtainUserInfo(pDto => {
                        UIMTTModel.Instance.HandleMTTJoinAction(MTTJoinAction.Rebuy, rebuyCode => {
                            if (rebuyCode == 0) {
                                UIMTTModel.Instance.ShowGameplayUI(false, 0);
                            }
                            else {
                                this.reqMTTDetail();
                            }
                        }, httpState => {
                        });
                    });
                    break;
            }
        });

    }

}
