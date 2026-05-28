/*
 * @Author: xfj
 * @Date: 2023-01-16 10:33:59
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-22 14:46:17
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttPayforHome.ts
 */
import { UIDefine } from '../../define/UIDefine';
import { ClubCache } from '../../frame/data/club/ClubCache';
import BaseForm from '../../ui/form/BaseForm';
import UIComponent from '../../ui/UIComponent';
import { EventName } from '../../config/EventName';
import TimeHelper from '../../helper/TimeHelper';
import {
    WebMttUserWallet,
    WebUserDiamondsWallet,
    WWW,
    WebPropUserBuyProp,
    WebPropUserCheckPropInfo,
    WebRoomCenterMttBuyin,
    WebRoomCenterMttDetailS,
    WebRoomCenterMttRebuy
} from '../../net/https/WebRequest';
import { i18nMgr } from '../../i18n/i18nMgr';
import ToastManager from '../../manager/ToastManager';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import GC from '../../frame/GameControl';
import { StringHelper } from '../../helper/StringHelper';
import UINewDialogComponent from '../../ui/dialog/UINewDialogComponent';
import { WalletType } from '../../config/TexasConfig';
import { UIClubModel } from '../../lobby/labor/UIClubModel';
import { UIMTTModel } from '../../new_mtt/UIMTTModel';
import { GameCache } from '../../game/GameCache';
import { UISuperDialogType } from '../../ui/dialog/UISuperDialog';
const { ccclass, property, menu } = cc._decorator;

enum MTTJoinMode {
    // 参与mtt玩法方式
    None,
    Apply, // 报名
    Rebuy, // 重购
    AddOn // 增购
}

@ccclass
@menu('脚本分组/mtt/detail/MttPayforHome')
export default class MttPayforHome extends BaseForm {
    // @property(cc.Node)
    // USDT: cc.Node = null;
    // @property(cc.Node)
    // USDT1: cc.Node = null;
    // @property(cc.Label)
    // uc: cc.Label = null;
    //上排金币
    Gold: cc.Node = null;
    //下排金币
    Balance: cc.Node = null;
    Gold_Type_Label: cc.Label = null;
    payNode: cc.Node = null;
    select_lbl: cc.Label = null;
    sure: cc.Node = null;
    rateNode: cc.Node = null;
    _data: any = null;
    totalRebuyTimes = 0;
    isCurTimeOverEnterTime = null;
    panel_click2: cc.Node = null;
    cachePropPropertyType: number = 0;
    cacheIsFreeServiceFee: boolean = false;
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
    used_prop_id: number = 0;
    prop_type: number = 0;
    use_free: boolean = false;
    coinnum: any = null;
    _coinnum: number = null;
    isUpArrow = true;
    isChoose3 = false;
    textCommit: cc.Label = null;
    isRebuySecondStart = false;
    _type = 1;
    title_lbl: cc.Label = null;
    ToggleGroup: cc.Node = null;
    _ratio = 1;

    protected lateLoad(): void {
        super.lateLoad();
        this.payNode = this.getChildNodeOrComponent('payNode');
        this.select_lbl = this.getChildNodeOrComponent('select_lbl', cc.Label);
        this.sure = this.getChildNodeOrComponent('sure');
        this.rateNode = this.getChildNodeOrComponent('rateNode');
        this.coinnum = this.getChildNodeOrComponent('coin', cc.Label);
        this.title_lbl = this.getChildNodeOrComponent('title_lbl', cc.Label);
        this.ToggleGroup = this.getChildNodeOrComponent('ToggleGroup');
        this.Gold = this.getChildNodeOrComponent('Gold');
        this.Balance = this.getChildNodeOrComponent('Balance');
        this.Gold_Type_Label = this.getChildNodeOrComponent('Gold_Type_Label', cc.Label);
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this._data = param.data;
        this._type = param.type;
        this.setText(this.title_lbl, this._type == 1 ? 'UIMTTSignDialogBuyTitle' : 'UIMTTSignDialogReBuyTitle');
        this.Gold_Type_Label.string = UIMTTModel.Instance.GetGoldTypeName(UIMTTModel.Instance.MttInfo.mtt.gold_type);
        this.setChildVisible(this.Gold, 'uc', param.data.gold_type == 1);
        this.setChildVisible(this.Gold, 'gc', param.data.gold_type == 2);
        this.setChildVisible(this.Gold, 'dc', param.data.gold_type == 4);
        this.setChildVisible(this.Balance, 'uc', param.data.gold_type == 1);
        this.setChildVisible(this.Balance, 'gc', param.data.gold_type == 2);
        this.setChildVisible(this.Balance, 'dc', param.data.gold_type == 4);
        //如果币种是钻石
        if (this._data.gold_type == 4) {
            //隐藏钱包选择
            this.payNode.active = false;
            this.ShowDiamond();
        } else {
            //显示钱包选择
            this.payNode.active = true;
            await UIClubModel.mInstance.WebMttUserWallet(GC.data.mtt.list.select.match_id, { club_id: ClubCache.club_id, offset: 0, limit: 20 });
            if (this._type == 1) {
                ClubCache.mttPayWallat = null;
            } else {
                ClubCache.mttPayWallat = ClubCache.mttPayWallat ? ClubCache.mttPayWallat : localStorage.getItem(GC.data.mtt.list.select.match_id + '');
            }
            this.initSelectWallet();
            this.bindClick(this.payNode, () => {
                if (this._type == 2) return;
                // if (ClubCache.mttPayWallat != null) return
                UIComponent.open(UIDefine.MttPayforList);
            });
            //this.USDT.active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 2
            //this.USDT1.active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 2
            this.SingType = UIMTTModel.Instance.MttInfo.mtt.prop_buy_type;
            if (UIMTTModel.Instance.MttInfo.mtt.buy_prop_id != 0) {
                UIMTTModel.Instance.APIPropUserCheckPropInfo(res => {
                    if (res.code == 0) {
                        this.cachePropPropertyType = res.data.prop_property_type;
                        this.cachePropBalance = res.data.prop_balance;
                        this.cacheIsFreeServiceFee = res.data.is_free_service_charge;
                        GC.data.user.info.gold = res.data.wallet_balance;
                        if (this.cachePropPropertyType == 2) {
                            this.SingType = 0;
                        }
                        this.HandleDate();
                    } else {
                    }
                });
            } else {
                this.HandleDate();
            }
        }
    }

    protected regiterDispatchEvent() {
        this.listen(EventName.selectMttWwllet, this.initSelectWallet);
    }

    initSelectWallet() {
        if (ClubCache.mttPayWallat == null) {
            this.sure.active = false;
            this.setText(this.select_lbl, 'UILogin_Select');
            this.rateNode.active = false;
        } else {
            let _data: any = WebMttUserWallet.Response.data;
            let walletData = null;
            _data.wallet.some(element => {
                walletData = element;
                return element.club_random_id == ClubCache.mttPayWallat.club_random_id;
            });
            localStorage.setItem(GC.data.mtt.list.select.match_id + '', walletData);
            this.sure.active = true;
            this.setText(this.select_lbl, ClubCache.mttPayWallat.club_name);
            this.rateNode.active = true;
            let num1 = cc.find('node1/num', this.rateNode).getComponent(cc.Label);
            num1.string = StringHelper.GetLongString(walletData.gold);
            let num2 = cc.find('node2/num', this.rateNode).getComponent(cc.Label);
            this.totalRebuyTimes = UIMTTModel.Instance.MttInfo.mtt.rebuy_times;
            if (this.totalRebuyTimes < 10000) {
                //可重构次数
                //!!!!!特别注意:当后台设置不限制重构次数时,rebuy_times为10000,而left_rebuy_times在后端传输时做了int8转换越界变为16了,但只是传到前端的转化了后端正常,故在此做特别处理!!!!!!
                if (UIMTTModel.Instance.MttInfo.state != null) {
                    num2.string = UIMTTModel.Instance.MttInfo.state.left_rebuy_times.toString();
                } else {
                    num2.string = this.totalRebuyTimes.toString();
                }
            } else {
                num2.string = i18nMgr.Get('UIMTT_StateUnLimitRebuy');
            }
            let num3 = cc.find('node3/num', this.rateNode).getComponent(cc.Label);
            //门票逻辑
            // num3.string = i18nMgr.Get("UIMTTSignDialogCanUseTickt").replace("{0}", this.cachePropBalance.toString());
        }
    }

    HandleDate() {
        this.UpdateGold();
        // coinBalance.text = _data.coinBalance;
        //多倍买入时展示
        this.ToggleGroup.active = this._data.buyRatio > 1;
        // ToggleTicket1.gameObject.SetActive(_data.buyRatio > 1);
        // ToggleTicket2.gameObject.SetActive(_data.buyRatio > 1);
        // ToggleTicket1.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), 1);
        // ToggleTicket2.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), _data.buyRatio);
        // Text_Ratio.text = string.Format(LanguageManager.Get("UIMTTbuyinDialog"), _data.buyRatio);
        // AvailableTickets.text = string.Format(LanguageManager.Get("UIMTTSignDialogCanUseTickt"), cachePropBalance);
        //if (UIMTTModel.Instance.MttInfo.mtt.total_rebuy_times > 0) {
        this.totalRebuyTimes = UIMTTModel.Instance.MttInfo.mtt.rebuy_times;
        if (this.totalRebuyTimes < 10000) {
            //可重构次数
            //!!!!!特别注意:当后台设置不限制重构次数时,rebuy_times为10000,而left_rebuy_times在后端传输时做了int8转换越界变为16了,但只是传到前端的转化了后端正常,故在此做特别处理!!!!!!
            if (UIMTTModel.Instance.MttInfo.state != null) {
                // Purchase.text = string.Format(LanguageManager.Get("UIMTTSignDialogRemainingBuy"), UIMTTModel.Instance.MttInfo.state.left_rebuy_times);
            } else {
                // Purchase.text = string.Format(LanguageManager.Get("UIMTTSignDialogRemainingBuy"), totalRebuyTimes);
            }
        } else {
            // Purchase.text = string.Format(LanguageManager.Get("UIMTTSignDialogRemainingBuy"), LanguageManager.Get("UIMTT_StateUnLimitRebuy"));
        }
        // Text_ErroTips.text = LanguageManager.Get("UIMTTSignDialogBuyErroTipscoin");
        // ToggleCoin.gameObject.SetActive(SingType == 0 || SingType == 2);
        // ToggleTicket.gameObject.SetActive(SingType == 1 || SingType == 2);
        switch (
            this.SingType //0 金币，1 道具，2 全选
        ) {
            case 0:
                // ToggleCoin.isOn = true;
                // ToggleTicket.isOn = false;
                // ToggleCoin.interactable = false;
                // ToggleTicket.interactable = false;
                // buttonCommit.interactable = _data.coinnum + _data.Fee <= GameCache.Instance.gold;
                // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                if (this._data.buyRatio > 1) {
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
                if (this._data.buyRatio > 1) {
                    // ToggleTicket1.isOn = true;
                    // ToggleTicket2.isOn = false;
                }
                break;
            case 2:
                // ToggleCoin.interactable = true;
                // ToggleTicket.interactable = true;
                // ToggleCoin.isOn = true;
                // ToggleTicket.isOn = false;
                // buttonCommit.interactable = _data.coinnum + _data.Fee <= GameCache.Instance.gold;
                // Text_ErroTips.gameObject.SetActive(!buttonCommit.interactable);
                if (this._data.buyRatio > 1) {
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
        // Text_Ratio.gameObject.SetActive(!Text_ErroTips.gameObject.activeInHierarchy && _data.buyRatio > 1);
        //textContent.gameObject.SetActive(!Text_ErroTips.gameObject.activeInHierarchy && cacheIsFreeServiceFee && _data.buyRatio == 1);
        if (this._data.rebuyData != null) {
            let deadLineTime =
                TimeHelper.RFC3339TimeConvertToUTCTime(this._data.rebuyData.starTime) +
                (this._data.rebuyData.rebuyBlind - 1) * this._data.rebuyData.upblindInterval;
            this.rebuySecond = deadLineTime - TimeHelper.Now / 10000000;
            if (this.rebuySecond > 15) {
                this.rebuySecond = 14;
                UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10012) + '(15s)');
                // textCommit.text = CPErrorCode.LanguageDescription(10012) + "(15s)";
            } else {
                this.rebuySecond -= -1;
                if (this.rebuySecond < 0) {
                    UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10012) + '(' + 0 + 's)');
                    // this.textCommit.string = CPErrorCode.LanguageDescription(10012) + "(" + 0 + "s)";
                } else {
                    UIComponent.Instance.Toast(CPErrorCode.LanguageDescription(10012) + '(' + this.rebuySecond + 's)');
                    // this.textCommit.string = CPErrorCode.LanguageDescription(10012) + "(" + this.rebuySecond + "s)";
                }
            }
            this.isRebuySecondStart = true;
        }
    }

    UpdateGold(discount = 0, DiscountType = 0) {
        let buyRatio = 1;
        // if (ToggleCoin2.isOn)
        // {
        // 	buyRatio = _data.buyRatio;
        // }
        // else
        // {
        // 	buyRatio = 1;
        // }
        if (this.isUseLimitFree) {
            switch (this._data.mTTJoinMode) {
                case MTTJoinMode.None:
                    break;
                case MTTJoinMode.Apply:
                    if (this._data.buyin_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
                    {
                        this.UseLimitFreeNoServer(buyRatio);
                    } else {
                        this.UseLimitFree(buyRatio);
                    }
                    break;
                case MTTJoinMode.Rebuy:
                    if (this._data.rebuy_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
                    {
                        this.UseLimitFreeNoServer(buyRatio);
                    } else {
                        this.UseLimitFree(buyRatio);
                    }
                    break;
                case MTTJoinMode.AddOn:
                    if (this._data.addon_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
                    {
                        this.UseLimitFreeNoServer(buyRatio);
                    } else {
                        this.UseLimitFree(buyRatio);
                    }
                    break;
                default:
                    break;
            }
            return;
        }
        if (this.isUseFreeService) {
            if (this._data.isHunter == 0) {
                //猎人赛处于关闭
                this.coinnum.string = StringHelper.GetLongString(this._data.coinnum * buyRatio) + '+' + '0';
                this._coinnum = Number(StringHelper.GetLongString(this._data.coinnum * buyRatio));
            } else {
                this.coinnum.string =
                    StringHelper.GetLongString(this._data.coinnum * buyRatio) + '+' + '0' + '+' + StringHelper.GetLongString(this._data.Fee * buyRatio);
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) + Number(StringHelper.GetLongString(this._data.Fee * buyRatio));
            }
            return;
        }
        if (this.isUseMultFree) {
            if (this._data.multi_ratio_free_incl_svr == 0) //限免是否包含服务费，0不包含，1包含
            {
                this.UseLimitFreeNoServer(buyRatio);
            } else {
                this.UseLimitFree(buyRatio);
            }
            return;
        }
        let discountResult = discount;
        let type = DiscountType;
        if (discount == 0) {
            if (this._data.isHunter == 0) {
                //猎人赛处于关闭
                this.coinnum.string = StringHelper.GetLongString(this._data.coinnum * buyRatio) + '+' + StringHelper.GetLongString(this._data.Fee * buyRatio);
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) + Number(StringHelper.GetLongString(this._data.Fee * buyRatio));
            } else {
                this.coinnum.string =
                    StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                    '+' +
                    StringHelper.GetLongString(this._data.hunterFee * buyRatio) +
                    '+' +
                    StringHelper.GetLongString(this._data.Fee * buyRatio);
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                    Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                    +StringHelper.GetLongString(this._data.Fee * buyRatio);
            }
        } else {
            if (this._data.isHunter == 0) {
                if (DiscountType == 12) {
                    if (discountResult >= this._data.coinnum * buyRatio) {
                        discountResult = this._data.coinnum * buyRatio;
                    }
                } else if (DiscountType == 13) {
                    if (discountResult >= this._data.coinnum * buyRatio + this._data.Fee * buyRatio) {
                        discountResult = this._data.coinnum * buyRatio + this._data.Fee * buyRatio;
                    }
                }
                //猎人赛处于关闭
                this.coinnum.string =
                    StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                    '+' +
                    StringHelper.GetLongString(this._data.Fee * buyRatio) +
                    '-' +
                    discountResult;
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                    Number(StringHelper.GetLongString(this._data.Fee * buyRatio)) -
                    discountResult;
            } else {
                if (DiscountType == 12) {
                    if (discountResult >= this._data.coinnum * buyRatio + this._data.hunterFee * buyRatio)
                        discountResult = this._data.coinnum * buyRatio + this._data.hunterFee * buyRatio;
                } else if (DiscountType == 13) {
                    if (discountResult >= this._data.coinnum * buyRatio + this._data.hunterFee * buyRatio + this._data.Fee * buyRatio)
                        discountResult = this._data.coinnum * buyRatio + this._data.hunterFee * buyRatio + this._data.Fee * buyRatio;
                }
                this.coinnum.string =
                    StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                    '+' +
                    StringHelper.GetLongString(this._data.hunterFee * buyRatio) +
                    '+' +
                    StringHelper.GetLongString(this._data.Fee * buyRatio) +
                    '-' +
                    discountResult;
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                    Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                    +StringHelper.GetLongString(this._data.Fee * buyRatio) -
                    discountResult;
            }
        }
        this.disCountType = type;
        this.discountNum = discountResult;
    }

    UseLimitFreeNoServer(buyRatio) {
        if (this._data.isHunter == 0) {
            //猎人赛处于关闭
            this.coinnum.string =
                StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                '+' +
                StringHelper.GetLongString(this._data.Fee * buyRatio) +
                '-' +
                this._data.coinnum;
            this._coinnum =
                Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                Number(StringHelper.GetLongString(this._data.Fee * buyRatio)) -
                this._data.coinnum;
        } else {
            this.coinnum.string =
                StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                '+' +
                StringHelper.GetLongString(this._data.hunterFee * buyRatio) +
                '+' +
                StringHelper.GetLongString(this._data.Fee * buyRatio) +
                '-' +
                (this._data.coinnum + this._data.hunterFee);
            this._coinnum =
                Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                +StringHelper.GetLongString(this._data.Fee * buyRatio) -
                (this._data.coinnum + this._data.hunterFee);
        }
    }

    /// <summary>
    /// 使用限免包含服务费
    /// </summary>
    UseLimitFree(buyRatio) {
        if (this._data.isHunter == 0) {
            //猎人赛处于关闭
            this.coinnum.string =
                StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                '+' +
                StringHelper.GetLongString(this._data.Fee * buyRatio) +
                '-' +
                (this._data.coinnum + this._data.Fee);
            this._coinnum =
                Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                Number(StringHelper.GetLongString(this._data.Fee * buyRatio)) -
                (this._data.coinnum + this._data.Fee);
        } else {
            this.coinnum.string =
                StringHelper.GetLongString(this._data.coinnum * buyRatio) +
                '+' +
                StringHelper.GetLongString(this._data.hunterFee * buyRatio) +
                '+' +
                StringHelper.GetLongString(this._data.Fee * buyRatio) +
                '-' +
                (this._data.coinnum + this._data.hunterFee + this._data.Fee);
            this._coinnum =
                Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                +StringHelper.GetLongString(this._data.Fee * buyRatio) -
                (this._data.coinnum + this._data.hunterFee + this._data.Fee);
        }
    }

    signUpReq() {
        if (ClubCache.mttPayWallat.gold < this._coinnum) {
            UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent, {
                type: UINewDialogComponent.DialogType.CommitCancel,
                content: 'ServerErrorCode_20004',
                contentCommit: 'UIMine_WalletAdd_EjPOTlsz',
                contentCancel: 'UI_otherPay',
                actionCommit: () => {
                    UIComponent.open(UIDefine.UIToRecharge, {
                        type: 1,
                        walletType: WalletType.Club,
                        club_id: ClubCache.mttPayWallat.club_id,
                        club_name: ClubCache.mttPayWallat.club_name
                    });
                },
                actionCancel: () => {
                    UIComponent.open(UIDefine.MttPayforList);
                },
                noAnimation: true
            });
            return;
        }
        if (
            this.cachePropPropertyType == 2 &&
            this.cacheIsFreeServiceFee &&
            this._data.buyRatio == 1 &&
            UIMTTModel.Instance.MttInfo.mtt.buy_prop_id != 0 &&
            this.isUseFreeService
        ) {
            UIMTTModel.Instance.APIPropUserBuyProp(response => {
                if (response.code == 0) {
                    if (null != this._data && null != this._data.actionCommit) {
                        this._data.actionCommit.Invoke(true, 1, this.used_prop_id, this.prop_type, this.use_free);
                    }
                    this.close();
                } else {
                    ToastManager.Instance.showToast(CPErrorCode.ServerErrorDescription(response.code));
                }
            });
        }
        // else if (this._data.buyRatio > 1 && (ToggleCoin2.isOn || ToggleTicket2.isOn))
        else if (this._data.buyRatio > 1) {
            if (null != this._data && null != this._data.actionCommit) {
                // _data.actionCommit.Invoke(ToggleTicket2.isOn, _data.buyRatio, used_prop_id, prop_type, use_free);
                this._data.actionCommit(false, this._ratio, this.used_prop_id, this.prop_type, this.use_free);
            }
            this.close();
        } else {
            if (null != this._data && null != this._data.actionCommit) {
                //this._data.actionCommit(ToggleTicket.isOn, 1, used_prop_id, prop_type, use_free);
                this._data.actionCommit(false, 1, this.used_prop_id, this.prop_type, this.use_free);
            }
            this.close();
        }
    }

    buyRatioBtn(event, custom) {
        this._ratio = Number(custom);
    }

    //显示钻石并且不足提示
    public ShowDiamond() {
        WWW.Instance.CommonAPI({
            web_class: WebUserDiamondsWallet
        }).then(
            (res: any) => {
                //this.Balance_Label.string = `${res.data.diamonds_wallet.diamonds}`;
                GameCache.Instance.gold = res.data.diamonds_wallet.diamonds;
                //this.selectWallet = res.data.diamonds_wallet.diamonds;
                this.HandleDate();
                //Log.Debug("报名费用" + buyinNum);
                if (this._coinnum > res.data.diamonds_wallet.diamonds) {
                    //买入的大于已经拥有的钻石，提示钻石不足
                    UIComponent.open<UISuperDialogType>(UIDefine.UISuperDialog, {
                        title: i18nMgr.Get('UIMTTBuyInBuyTip'),
                        content: i18nMgr.Get('UIMTTBuyInBuyContent'),
                        commit: i18nMgr.Get('UIMTTBuyInBuyCommit'),
                        cancel: i18nMgr.Get('UIMTTBuyInBuyCancel'),
                        commit_click: () => {
                            UIComponent.open(UIDefine.UIMall);
                        }
                    });
                }
            },
            (res: any) => {}
        );
    }
}
