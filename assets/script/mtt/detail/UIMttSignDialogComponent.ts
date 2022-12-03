
import MttListItemModel from "../../frame/data/mtt/MttListItemModel";
import { UIMatchMttModel } from "../../frame/data/mtt/UIMatchMttModel";
import GC from "../../frame/GameControl";
import { GameCache } from "../../game/GameCache";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { CPErrorCode } from "../../i18n/CPErrorCode";
import { i18nMgr } from "../../i18n/i18nMgr";
import ToastManager from "../../manager/ToastManager";
import { Web_Room_Center_Mtt_Details } from "../../net/https/WebRequest";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";

const { ccclass, property, menu } = cc._decorator;

export enum DialogType {
    Commit,
    CommitCancel
}

enum MTTJoinMode // 参与mtt玩法方式
{
    None,
    Apply,          // 报名
    Rebuy,          // 重购
    AddOn, // 增购
}

export class RebuyData {
    upblindInterval: number;//升盲间隔
    rebuyBlind: number;//最大重购等级
    starTime: string;//比赛开始时间
}

export class DialogData {

    type: DialogType;
    title: string;
    content: string;
    coinnum: number;
    coinBalance: string;
    contentCommit: string;
    contentCancel: string;
    actionCommit: any;
    actionCancel: any;
    isactiveclosebtn: boolean = false;
    buyTimes: number;//剩余买入次数 加报名次数
    hunterFee: number;//人头费
    Fee: number;//服务费
    buyRatio: number;
    rebuyData: RebuyData;
    isHunter: number;//1是猎人赛 0不是
    buyin_free_times: number;
    rebuy_free_times: number;
    multi_ratio_free_times: number;
    addon_free_times: number;
    buyin_free_incl_svr: number;
    rebuy_free_incl_svr: number;
    multi_ratio_free_incl_svr: number;
    addon_free_incl_svr: number;
    mTTJoinMode: MTTJoinMode;
};
@ccclass
export default class UIMttSignDialogComponent extends UIBase {



    panel_click2: cc.Node = null;
    cachePropPropertyType: number = 0;
    cacheIsFreeServiceFee: boolean = false;
    curDialogData: DialogData = null;
    SingType: number = 0;
    cachePropBalance: number = 0;
    isUseLimitFree: any = null;
    isUseFreeService: any = null;
    isUseMultFree: any = null;
    limitFreeName: any = null;
    limitDetail: any = null;
    discountNum: any = null;
    disCountType: any = null;
    MultLimitFree: any = null;
    rebuySecond: number = 0;
    lastTime: number = 0;
    IntervalTime: number = 1;
    totalRebuyTimes: number = 0;
    used_prop_id: number = 0;
    prop_type: number = 0;
    use_free: boolean = false;
    coinnum: any = null;
    isUpArrow = true;
    isChoose3 = false;

    lateLoad() {
        super.lateLoad();
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
    }

    lateClose(param: any = null) {
        super.lateClose(param);
    }

    lateOpen(param: any = null) {
        this.panel_click2.active = true;
    }

    onShow(data?: DialogData): void {
        super.onShow(data);


        this.panel_click2 = this.getChildNodeOrComponent("panel_click2");
        this.panel_click2.active = true;
        this.panel_click2.on(cc.Node.EventType.TOUCH_END, this.onHideAddMtt, this)

        let btn_3: cc.Node = this.getChildNodeOrComponent("btn_3");
        btn_3.active = false;

        let btn_confim: cc.Node = this.getChildNodeOrComponent("btn_confim");
        btn_confim.on(cc.Node.EventType.TOUCH_END, this.onClickCommit, this)

        let btn_arrow: cc.Node = this.getChildNodeOrComponent("btn_arrow");
        btn_arrow.on(cc.Node.EventType.TOUCH_END, this.onClickArrow, this)
        this.isUpArrow = true;
        let img_arrrow_up: cc.Node = this.getChildNodeOrComponent("img_arrrow_up");
        let img_arrrow_down: cc.Node = this.getChildNodeOrComponent("img_arrrow_down");
        img_arrrow_up.active = true;
        img_arrrow_down.active = false;

        let node_choose3: cc.Node = this.getChildNodeOrComponent("node_choose3");
        node_choose3.on(cc.Node.EventType.TOUCH_END, this.onClickChoose3, this)
        this.isChoose3 = false;
        node_choose3.active = false;

        let node_normal3: cc.Node = this.getChildNodeOrComponent("node_normal3");
        node_normal3.on(cc.Node.EventType.TOUCH_END, this.onClickChoose3, this)
        node_normal3.active = true;

        this.coinnum =  this.getChildNodeOrComponent("lbl_chips", cc.Label);

        if (null != data) {
            this.SingType = UIMatchMttModel.Instance.MttInfo.mtt.prop_buy_type;
            this.curDialogData = data;
            if (null != this.curDialogData) {
                let lbl_title =  this.getChildNodeOrComponent("lbl_title", cc.Label);
                lbl_title.string = data.title;
                if (UIMatchMttModel.Instance.MttInfo.mtt.buy_prop_id != 0) {
                    UIMatchMttModel.Instance.APIPropUserCheckPropInfo(res => {
                        if (res.code == 0) {
                            this.cachePropPropertyType = res.data.prop_property_type;
                            this.cachePropBalance = res.data.prop_balance;
                            this.cacheIsFreeServiceFee = res.data.is_free_service_charge;
                            // FreeService.SetActive(this.cacheIsFreeServiceFee && curDialogData.buyRatio <= 1);
                            // FreeService.GetComponent<Toggle>().onValueChanged.AddListener(ClickFreeService);
                            // FreeService.transform.Find("name").GetComponent<Text>().text = LanguageManager.Get("UIMine_Backpack_FreeServiceVoucher");
                            GC.data.user.info.gold = res.data.wallet_balance;
                            if (this.cachePropPropertyType == 2) {
                                this.SingType = 0;
                            }
                            this.HandleDate();
                        }
                        else {
                            // UIComponent.Instance.Toast(CPErrorCode.ServerErrorDescription(res.code));
                        }
                    });
                }
                else {
                    this.HandleDate();
                }
            }

            let lbl_gold = this.getChildNodeOrComponent("lbl_gold", cc.Label);
            lbl_gold.string = data.coinBalance;


            this.totalRebuyTimes = UIMatchMttModel.Instance.MttInfo.mtt.rebuy_times;

            let lbl_last = this.getChildNodeOrComponent("lbl_last", cc.Label);

            if (this.totalRebuyTimes < 10000) {
                //可重构次数   
                //!!!!!特别注意:当后台设置不限制重构次数时,rebuy_times为10000,而left_rebuy_times在后端传输时做了int8转换越界变为16了,但只是传到前端的转化了后端正常,故在此做特别处理!!!!!!
                if (UIMatchMttModel.Instance.MttInfo.state != null) {
                    lbl_last.string = i18nMgr.Get("UIMTTSignDialogRemainingBuy").replace("{0}", UIMatchMttModel.Instance.MttInfo.state.left_rebuy_times.toString());
                } else {
                    lbl_last.string = i18nMgr.Get("UIMTTSignDialogRemainingBuy").replace("{0}", this.totalRebuyTimes.toString());
                }
            } else {
                lbl_last.string = i18nMgr.Get("UIMTTSignDialogRemainingBuy").replace("{0}", i18nMgr.Get("UIMTT_StateUnLimitRebuy"));
            }
    
            let lbl_ticket = this.getChildNodeOrComponent("lbl_ticket", cc.Label);
            lbl_ticket.string = i18nMgr.Get("UIMTTSignDialogCanUseTickt").replace("{0}", this.cachePropBalance.toString());

            let lbl_center = this.getChildNodeOrComponent("lbl_center", cc.Label);
            lbl_center.string = i18nMgr.Get("UIMTTbuyinDialog").replace("{0}", data.buyRatio.toString());

            lbl_center.node.active = data.buyRatio > 1;

            let btn_2: cc.Node = this.getChildNodeOrComponent("btn_2");
            let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
            // btn_2.active = this.SingType == 0 || this.SingType == 2;


            let node_1x: cc.Node = this.getChildNodeOrComponent("node_1x");
            let node_2x: cc.Node = this.getChildNodeOrComponent("node_2x");
            let node_3x: cc.Node = this.getChildNodeOrComponent("node_3x");
            let node_4x: cc.Node = this.getChildNodeOrComponent("node_4x");

            node_1x["index"] = 1;
            node_2x["index"] = 2;
            node_3x["index"] = 3;
            node_4x["index"] = 4;
            node_1x.on(cc.Node.EventType.TOUCH_END, this.onClickNX, this);
            node_2x.on(cc.Node.EventType.TOUCH_END, this.onClickNX, this);
            node_3x.on(cc.Node.EventType.TOUCH_END, this.onClickNX, this);
            node_4x.on(cc.Node.EventType.TOUCH_END, this.onClickNX, this);
            node_1x.active = data.buyRatio > 1;
            node_2x.active = data.buyRatio > 1;
            node_3x.active = data.buyRatio > 1;
            node_4x.active = data.buyRatio > 1;

            node_1x.getChildByName("img1").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", "1");
            node_1x.getChildByName("img2").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", "1");

            node_2x.getChildByName("img1").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", data.buyRatio.toString());
            node_2x.getChildByName("img2").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", data.buyRatio.toString());

            node_3x.getChildByName("img1").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", "1");
            node_3x.getChildByName("img2").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", "1");

            node_4x.getChildByName("img1").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", data.buyRatio.toString());
            node_4x.getChildByName("img2").getChildByName("lbl").getComponent(cc.Label).string = i18nMgr.Get("UIMTTbuyinDialogRatio").replace("{0}", data.buyRatio.toString());

            let buttonCommit = btn_confim.getComponent(cc.Button);
            let btnComImg = btn_confim.getChildByName("img_1");

            switch (this.SingType)//0 金币，1 道具，2 全选
            {
                case 0:
                    btn_1.active = false;
                    btn_2.active = true;
                    // ToggleCoin.isOn = true;
                    // ToggleTicket.isOn = false;
                    // ToggleCoin.interactable = false;
                    // ToggleTicket.interactable = false;
                    buttonCommit.interactable = data.coinnum + data.Fee <= GameCache.Instance.gold;
                    // btnComImg.active = data.coinnum + data.Fee <= GameCache.Instance.gold;
                    // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                    // if (this.curDialogData.buyRatio > 1) {
                        // ToggleCoin1.isOn = true;
                        // ToggleCoin2.isOn = false;
                        node_1x.getChildByName("img2").active = true;
                        node_2x.getChildByName("img2").active = false;
                    // }
                    break;
                case 1:
                    btn_1.active = true;
                    btn_2.active = false;
                    // ToggleCoin.interactable = false;
                    // ToggleTicket.interactable = false;
                    // ToggleTicket.isOn = true;
                    // ToggleCoin.isOn = false;
                    // node_3x.getChildByName("img2").active = false;

                    buttonCommit.interactable = this.cachePropBalance > 0;
                    // btnComImg.active = this.cachePropBalance > 0;
                    // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                    // if (this.curDialogData.buyRatio > 1) {
                        // ToggleTicket1.isOn = true;
                        // ToggleTicket2.isOn = false;
                        node_3x.getChildByName("img2").active = true;
                        node_4x.getChildByName("img2").active = false;
                    // }
                    break;
                case 2:
                    btn_1.active = true;
                    btn_2.active = true;
                    // ToggleCoin.interactable = true;
                    // ToggleTicket.interactable = true;
                    // ToggleCoin.isOn = true;
                    // node_3x.getChildByName("img2").active = true;
                    // ToggleTicket.isOn = false;
                    buttonCommit.interactable = data.coinnum + data.Fee <= GameCache.Instance.gold;
                    // btnComImg.active = data.coinnum + data.Fee <= GameCache.Instance.gold;
                    // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                    // if (this.curDialogData.buyRatio > 1) {
                        // ToggleCoin1.isOn = true;
                        node_3x.getChildByName("img2").active = true;
                        // ToggleCoin2.isOn = false;
                        node_4x.getChildByName("img2").active = false;

                        node_1x.getChildByName("img2").active = false;
                        node_2x.getChildByName("img2").active = false;
                        // ToggleTicket1.isOn = false;
                        // ToggleTicket2.isOn = false;
                        // ToggleCoin.interactable = false;
                        // ToggleTicket.interactable = false;
                    // }
                    break;
                default:
                    break;
            }
        }
        // textCommit.text = string.IsNullOrEmpty(curDialogData.contentCommit) ? $"Commit" : curDialogData.contentCommit;
        // textTitle.text = string.IsNullOrEmpty(curDialogData.title) ? $"" : curDialogData.title;

        // limitFreeName = limitFree.transform.Find("name").GetComponent<Text>();
        // limitFree.GetComponent<Toggle>().onValueChanged.AddListener(ClickLimitFree);
        // MultLimitFree.GetComponent<Toggle>().onValueChanged.AddListener(ClickMultFree);
        //UpdateLimitFree();
        //SetMultLimitFreeName();
        // propInfos = new List<Web_Prop_User_Prop_List.Record>();
        UIMatchMttModel.Instance.APIMtt_GetDiscounts(pAct => {
            if (pAct.code == 0) {
                if (pAct.data.excludefee_list.Count > 0 && pAct.data.excludefee_list != null) {
                    // propInfos.AddRange(pAct.data.excludefee_list);
                }
                if (pAct.data.includefee_list.Count > 0 && pAct.data.includefee_list != null) {
                    // propInfos.AddRange(pAct.data.includefee_list);
                }
                // int count = 0;
                // count = discountObj.Count > propInfos.Count ? propInfos.Count : discountObj.Count;

                // for (int i = 0; i < count; i++)
                // {
                // 	discountObj[i].transform.Find("Info/name").GetComponent<Text>().text = propInfos[i].game_prop.prop_value / 100 + UILoginModel.mInstance.GetRoomNameByKey(propInfos[i].game_prop.prop_name);
                // 	Toggle toggle = discountObj[i].GetComponent<Toggle>();
                // 	int pId = propInfos[i].prop_id;
                // 	int pType = propInfos[i].prop_type;
                // 	int gold = propInfos[i].game_prop.prop_value;
                // 	toggle.onValueChanged.AddListener((isOn) => { ClickDiscountsToggle(isOn, pId, pType, gold); });
                // 	discountObj[i].SetActive(true);
                // }
            }
        });


        

    }

    onClickNX(event) {
        let target = event.currentTarget;
        let index = target.index;
        let node_1x: cc.Node = this.getChildNodeOrComponent("node_1x");
        let node_2x: cc.Node = this.getChildNodeOrComponent("node_2x");
        let node_3x: cc.Node = this.getChildNodeOrComponent("node_3x");
        let node_4x: cc.Node = this.getChildNodeOrComponent("node_4x");
        if (index == 1) {
            node_1x.getChildByName("img2").active = true;
            node_2x.getChildByName("img2").active = false;
        } else if (index == 2) {
            node_2x.getChildByName("img2").active = true;
            node_1x.getChildByName("img2").active = false;
        } else if (index == 3) {
            node_3x.getChildByName("img2").active = true;
            node_4x.getChildByName("img2").active = false;
        } else if (index == 4) {
            node_4x.getChildByName("img2").active = true;
            node_3x.getChildByName("img2").active = false;
        }
    }

    onClickChoose3() {
        let node_choose3: cc.Node = this.getChildNodeOrComponent("node_choose3");
        let node_normal3: cc.Node = this.getChildNodeOrComponent("node_normal3");
        this.isChoose3 = !this.isChoose3;
        if (this.isChoose3) {
            node_choose3.active = true;
            node_normal3.active = false;
        } else {
            node_choose3.active = false;
            node_normal3.active = true;
        }
    }

    onClickArrow() {
        let img_arrrow_up: cc.Node = this.getChildNodeOrComponent("img_arrrow_up");
        let img_arrrow_down: cc.Node = this.getChildNodeOrComponent("img_arrrow_down");
        let btn_1: cc.Node = this.getChildNodeOrComponent("btn_1");
        let btn_2: cc.Node = this.getChildNodeOrComponent("btn_2");
        let btn_3: cc.Node = this.getChildNodeOrComponent("btn_3");
        if (this.isUpArrow) {
            // 改成向下
            img_arrrow_up.active = false;
            img_arrrow_down.active = true;
            btn_1.active = false;
            btn_2.active = true;
            btn_3.active = true;
        } else {
            btn_1.active = this.SingType == 2 || this.SingType == 3;
            btn_2.active = true;
            btn_3.active = false;
            img_arrrow_up.active = true;
            img_arrrow_down.active = false;
        }
        this.isUpArrow = !this.isUpArrow;

    }

    setVisible(isShow) {
        this.node.active = isShow;
        this.panel_click2.active = isShow;
    }


    onHideAddMtt() {
        this.setVisible(false);
        this.panel_click2.active = false;
        if (this.curDialogData.actionCancel) {
            this.curDialogData.actionCancel();
        }
    }

    onClickCommit(event) {
        let target = event.currentTarget;
        if (!target.getComponent(cc.Button).interactable)
        {
            // return;
        }
        this.ApplyMatch();
    }

    HandleDate() {
        this.UpdateGold();
        // coinBalance.text = curDialogData.coinBalance;
        //多倍买入时展示
        // ToggleCoin1.gameObject.SetActive(curDialogData.buyRatio > 1);
        // ToggleCoin2.gameObject.SetActive(curDialogData.buyRatio > 1);
        // ToggleCoin1.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), 1);
        // ToggleCoin2.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), curDialogData.buyRatio);
        // ToggleTicket1.gameObject.SetActive(curDialogData.buyRatio > 1);
        // ToggleTicket2.gameObject.SetActive(curDialogData.buyRatio > 1);
        // ToggleTicket1.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), 1);
        // ToggleTicket2.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), curDialogData.buyRatio);
        // Text_Ratio.text = string.Format(LanguageManager.Get("UIMTTbuyinDialog"), curDialogData.buyRatio);
        // AvailableTickets.text = string.Format(LanguageManager.Get("UIMTTSignDialogCanUseTickt"), cachePropBalance);
        //if (UIMatchMTTModel.Instance.MttInfo.mtt.total_rebuy_times > 0) {
        this.totalRebuyTimes = UIMatchMttModel.Instance.MttInfo.mtt.rebuy_times;
        if (this.totalRebuyTimes < 10000) {
            //可重构次数   
            //!!!!!特别注意:当后台设置不限制重构次数时,rebuy_times为10000,而left_rebuy_times在后端传输时做了int8转换越界变为16了,但只是传到前端的转化了后端正常,故在此做特别处理!!!!!!
            if (UIMatchMttModel.Instance.MttInfo.state != null) {
                // Purchase.text = string.Format(LanguageManager.Get("UIMTTSignDialogRemainingBuy"), UIMatchMTTModel.Instance.MttInfo.state.left_rebuy_times);
            } else {
                // Purchase.text = string.Format(LanguageManager.Get("UIMTTSignDialogRemainingBuy"), totalRebuyTimes);
            }
        } else {
            // Purchase.text = string.Format(LanguageManager.Get("UIMTTSignDialogRemainingBuy"), LanguageManager.Get("UIMTT_StateUnLimitRebuy"));
        }

        // Text_ErroTips.text = LanguageManager.Get("UIMTTSignDialogBuyErroTipscoin");
        // ToggleCoin.gameObject.SetActive(SingType == 0 || SingType == 2);
        // ToggleTicket.gameObject.SetActive(SingType == 1 || SingType == 2);
        switch (this.SingType)//0 金币，1 道具，2 全选
        {
            case 0:
                // ToggleCoin.isOn = true;
                // ToggleTicket.isOn = false;
                // ToggleCoin.interactable = false;
                // ToggleTicket.interactable = false;
                // buttonCommit.interactable = curDialogData.coinnum + curDialogData.Fee <= GameCache.Instance.gold;
                // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                if (this.curDialogData.buyRatio > 1) {
                    // ToggleCoin1.isOn = true;
                    // ToggleCoin2.isOn = false;
                }
                break;
            case 1:
                // ToggleCoin.interactable = false;
                // ToggleTicket.interactable = false;
                // ToggleTicket.isOn = true;
                // ToggleCoin.isOn = false;

                // buttonCommit.interactable = cachePropBalance > 0;
                // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                if (this.curDialogData.buyRatio > 1) {
                    // ToggleTicket1.isOn = true;
                    // ToggleTicket2.isOn = false;
                }
                break;
            case 2:
                // ToggleCoin.interactable = true;
                // ToggleTicket.interactable = true;
                // ToggleCoin.isOn = true;
                // ToggleTicket.isOn = false;
                // buttonCommit.interactable = curDialogData.coinnum + curDialogData.Fee <= GameCache.Instance.gold;
                // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                if (this.curDialogData.buyRatio > 1) {
                    // ToggleCoin1.isOn = true;
                    // ToggleCoin2.isOn = false;

                    // ToggleTicket1.isOn = false;
                    // ToggleTicket2.isOn = false;
                    // ToggleCoin.interactable = false;
                    // ToggleTicket.interactable = false;
                }
                break;
            default:
                break;
        }
        // Text_Ratio.gameObject.SetActive(!Text_ErroTips.gameObject.activeInHierarchy && curDialogData.buyRatio > 1);
        //textContent.gameObject.SetActive(!Text_ErroTips.gameObject.activeInHierarchy && cacheIsFreeServiceFee && curDialogData.buyRatio == 1);
        if (this.curDialogData.rebuyData != null) {
            let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(this.curDialogData.rebuyData.starTime) + (this.curDialogData.rebuyData.rebuyBlind - 1) * this.curDialogData.rebuyData.upblindInterval;
            this.rebuySecond = deadLineTime - TimeHelper.Now / 10000000;
            if (this.rebuySecond > 15) {
                this.rebuySecond = 14;
                // textCommit.text = CPErrorCode.LanguageDescription(10012) + "(15s)";
            }
            else {
                this.rebuySecond -= -1;
                if (this.rebuySecond < 0) {
                    // textCommit.text = CPErrorCode.LanguageDescription(10012) + "(" + 0 + "s)";
                }
                else {
                    // textCommit.text = CPErrorCode.LanguageDescription(10012) + "(" + rebuySecond + "s)";
                }
            }
        }
    }

    //UIMTTApply_dialog_content  账户余额：{0} ， UIMTTSignDialogCanUseTickt 可用门票  ，  UIMTTSignDialogRemainingBuy  剩余买入


    update() {
        // UI uiDialog = UIComponent.Instance.Get(UIType.UIMTTSignDialog);
        // if (null == uiDialog || !uiDialog.GameObject.activeInHierarchy)
        // {
        //     return;
        // }
        if (this.curDialogData != null && this.curDialogData.rebuyData != null) {
            // if (Time.time - lastTime < IntervalTime)
            // {
            //     return;
            // }
            // lastTime = Time.time;
            // if (rebuySecond > 0)
            // {
            //     rebuySecond -= IntervalTime;

            //     textCommit.text = CPErrorCode.LanguageDescription(10012) + "(" + (rebuySecond + 1) + "s)";
            // }
            // else
            // {

            //     if (null != curDialogData && curDialogData.type == DialogData.DialogType.CommitCancel && null != curDialogData.actionCancel)
            //     {
            //         curDialogData.actionCancel.Invoke();
            //     }
            //     UIComponent.Instance.Remove(UIType.UIMTTSignDialog);
            // }
        }

    }

    UpdateGold(discount = 0, DiscountType = 0) {
        let buyRatio = 1;
        // if (ToggleCoin2.isOn)
        // {
        // 	buyRatio = curDialogData.buyRatio;
        // }
        // else
        // {
        // 	buyRatio = 1;
        // }
        if (this.isUseLimitFree) {
            switch (this.curDialogData.mTTJoinMode) {
                case MTTJoinMode.None:
                    break;
                case MTTJoinMode.Apply:
                    if (this.curDialogData.buyin_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
                    {
                        this.UseLimitFreeNoServer(buyRatio);
                    }
                    else {
                        this.UseLimitFree(buyRatio);
                    }
                    break;
                case MTTJoinMode.Rebuy:
                    if (this.curDialogData.rebuy_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
                    {
                        this.UseLimitFreeNoServer(buyRatio);
                    }
                    else {
                        this.UseLimitFree(buyRatio);
                    }
                    break;
                case MTTJoinMode.AddOn:
                    if (this.curDialogData.addon_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
                    {
                        this.UseLimitFreeNoServer(buyRatio);
                    }
                    else {
                        this.UseLimitFree(buyRatio);
                    }
                    break;
                default:
                    break;
            }
            return;
        }

        if (this.isUseFreeService) {
            if (this.curDialogData.isHunter == 0) {
                //猎人赛处于关闭
                this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + "0";
            }
            else {
                this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + "0" + "+" + StringHelper.GetLongString(this.curDialogData.Fee * buyRatio);
            }
            return;
        }

        if (this.isUseMultFree) {
            if (this.curDialogData.multi_ratio_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
            {
                this.UseLimitFreeNoServer(buyRatio);
            }
            else {
                this.UseLimitFree(buyRatio);
            }
            return;
        }

        let discountResult = discount;
        let type = DiscountType;
        if (discount == 0) {
            if (this.curDialogData.isHunter == 0) {
                //猎人赛处于关闭
                this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.Fee * buyRatio);
            }
            else {
                this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.hunterFee * buyRatio) + "+" + (this.curDialogData.Fee * buyRatio);
            }
        }
        else {

            if (this.curDialogData.isHunter == 0) {
                if (DiscountType == 12) {
                    if (discountResult >= this.curDialogData.coinnum * buyRatio) {
                        discountResult = this.curDialogData.coinnum * buyRatio;
                    }
                }
                else if (DiscountType == 13) {
                    if (discountResult >= this.curDialogData.coinnum * buyRatio + this.curDialogData.Fee * buyRatio) {
                        discountResult = this.curDialogData.coinnum * buyRatio + this.curDialogData.Fee * buyRatio;
                    }
                }
                //猎人赛处于关闭
                this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.Fee * buyRatio) + "-" + (discountResult);
            }
            else {
                if (DiscountType == 12) {
                    if (discountResult >= this.curDialogData.coinnum * buyRatio + this.curDialogData.hunterFee * buyRatio)
                        discountResult = this.curDialogData.coinnum * buyRatio + this.curDialogData.hunterFee * buyRatio;
                }
                else if (DiscountType == 13) {
                    if (discountResult >= this.curDialogData.coinnum * buyRatio + this.curDialogData.hunterFee * buyRatio + this.curDialogData.Fee * buyRatio)
                        discountResult = this.curDialogData.coinnum * buyRatio + this.curDialogData.hunterFee * buyRatio + this.curDialogData.Fee * buyRatio;
                }
                this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.hunterFee * buyRatio) + "+" + (this.curDialogData.Fee * buyRatio) + "-" + (discountResult);
            }
        }

        this.disCountType = type;
        this.discountNum = discountResult;
    }

    /// <summary>
    /// 使用限免不包含服务费
    /// </summary>
    UseLimitFreeNoServer(buyRatio) {
        if (this.curDialogData.isHunter == 0) {
            //猎人赛处于关闭
            this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.Fee * buyRatio) + "-" + (this.curDialogData.coinnum);
        }
        else {
            this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.hunterFee * buyRatio) + "+" + (this.curDialogData.Fee * buyRatio) + "-" + (this.curDialogData.coinnum + this.curDialogData.hunterFee);
        }
    }

    /// <summary>
    /// 使用限免包含服务费
    /// </summary>
    UseLimitFree(buyRatio) {
        if (this.curDialogData.isHunter == 0) {
            //猎人赛处于关闭
            this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.Fee * buyRatio) + "-" + (this.curDialogData.coinnum + this.curDialogData.Fee);
        }
        else {
            this.coinnum.string = StringHelper.GetLongString(this.curDialogData.coinnum * buyRatio) + "+" + StringHelper.GetLongString(this.curDialogData.hunterFee * buyRatio) + "+" + (this.curDialogData.Fee * buyRatio) + "-" + (this.curDialogData.coinnum + this.curDialogData.hunterFee + this.curDialogData.Fee);
        }
    }

    // 报名
    ApplyMatch() {
        if (this.cachePropPropertyType == 2 && this.cacheIsFreeServiceFee && this.curDialogData.buyRatio == 1 && UIMatchMttModel.Instance.MttInfo.mtt.buy_prop_id != 0 && this.isUseFreeService) {
            UIMatchMttModel.Instance.APIPropUserBuyProp(response => {
                if (response.code == 0) {
                    if (null != this.curDialogData && null != this.curDialogData.actionCommit) {
                        this.curDialogData.actionCommit.Invoke(true, 1, this.used_prop_id, this.prop_type, this.use_free);
                    }
                    UIComponent.close(this.UIDefine);
                }
                else {
                    ToastManager.Instance.createToast(CPErrorCode.ServerErrorDescription(response.code));
                }
            });
        }
        // else if (this.curDialogData.buyRatio > 1 && (ToggleCoin2.isOn || ToggleTicket2.isOn))
        else if (this.curDialogData.buyRatio > 1) {
            if (null != this.curDialogData && null != this.curDialogData.actionCommit) {
                // curDialogData.actionCommit.Invoke(ToggleTicket2.isOn, curDialogData.buyRatio, used_prop_id, prop_type, use_free);
                this.curDialogData.actionCommit(false, 1, this.curDialogData.buyRatio, this.used_prop_id, this.prop_type, this.use_free);
            }
            UIComponent.close(this.UIDefine);
        }
        else {
            if (null != this.curDialogData && null != this.curDialogData.actionCommit) {
                //this.curDialogData.actionCommit(ToggleTicket.isOn, 1, used_prop_id, prop_type, use_free);
                this.curDialogData.actionCommit(false, 1, this.used_prop_id, this.prop_type, this.use_free);
            }
            UIComponent.close(this.UIDefine);
        }
    }

}








