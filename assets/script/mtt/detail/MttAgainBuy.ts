/*
 * @Author: xfj
 * @Date: 2023-01-16 18:31:27
 * @description:
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-01 18:04:54
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttAgainBuy.ts
 */
import { UIDefine } from '../../define/UIDefine';
import { ClubCache } from '../../frame/data/club/ClubCache';
import GC from '../../frame/GameControl';
import { StringHelper } from '../../helper/StringHelper';
import TimeHelper from '../../helper/TimeHelper';
import { CPErrorCode } from '../../i18n/CPErrorCode';
import ToastManager from '../../manager/ToastManager';
import GGSlider from '../../ui/component/GGSlider';
import UINewDialogComponent from '../../ui/dialog/UINewDialogComponent';
import BaseForm from '../../ui/form/BaseForm';
import UIComponent from '../../ui/UIComponent';
import Toast from '../../ui/toast/Toast';
import { WalletType } from '../../config/TexasConfig';
import SliderPlus from '../../common/SliderPlus';
import { UIMTTModel } from '../../new_mtt/UIMTTModel';

enum MTTJoinMode {
    // 参与mtt玩法方式
    None,
    Apply, // 报名
    Rebuy, // 重购
    AddOn // 增购
}
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttAgainBuy')
export default class MttAgainBuy extends BaseForm {
    @property(cc.Node)
    USDT: cc.Node = null;
    @property(cc.ScrollView)
    scrow: cc.ScrollView = null;
    //private slider: GGSlider = null;
    private slider_plus: SliderPlus = null;
    buy_lbl: cc.Label = null;
    select_lbl: cc.Label = null;
    sb_lbl: cc.Label = null;
    sure: cc.Node = null;
    _data = null;
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

    start() {}

    protected lateLoad(): void {
        super.lateLoad();
        this.buy_lbl = this.getChildNodeOrComponent('buy_lbl', cc.Label);
        //this.slider = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.slider_plus = this.getChildNodeOrComponent('slider_plus', SliderPlus);
        this.coinnum = this.getChildNodeOrComponent('coinNum', cc.Label);
        this.sb_lbl = this.getChildNodeOrComponent('sb_lbl', cc.Label);
        this.select_lbl = this.getChildNodeOrComponent('select_lbl', cc.Label);
        this.sure = this.getChildNodeOrComponent('sure');
        //this.slider.onChange(this.onSliderChange.bind(this));
        //this.slider._delegate = this;
    }

    async onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        this._data = param;
        this.USDT.active = UIMTTModel.Instance.MttInfo.mtt.gold_type == 2;
        this.setText(this.select_lbl, ClubCache.mttPayWallat.club_name);
        this.setText(this.coinnum, Number(StringHelper.GetLongString(ClubCache.mttPayWallat.gold)));
        this.setText(
            this.sb_lbl,
            StringHelper.GetLongString(UIMTTModel.Instance.MttInfo.more.sb) + '/' + StringHelper.GetLongString(UIMTTModel.Instance.MttInfo.more.nsb)
        );
        // this.slider.SetMinMax(0, Number(StringHelper.GetLongString(ClubCache.mttPayWallat.gold)));
        // this.slider.onShow({ index: 0 });
        //////////////////////////////////////////
        this.slider_plus.show({
            min_value: 0,
            max_value: Number(StringHelper.GetLongString(ClubCache.mttPayWallat.gold)),
            step: 1,
            change: this.sliderChange,
            touch_start: this.sliderStart,
            touch_end: this.sliderEnd,
            own: this
        });
        this.sliderChange(0);
        //////////////////////////////////////////
        //this.setText(this.buy_lbl, 0);
        this.sure.active = false;
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
                    // this.HandleDate();
                } else {
                }
            });
        } else {
            // this.HandleDate();
        }
    }

    /**
     * 滑动条改变触发
     */
    // onSliderChange(rate: number) {
    //     // this._curIntoValue = (this._startRate + rate) * GameCache.Instance.CurGame.bigBlind / 100;
    //     this.sure.active = rate != 0;
    //     this.setText(this.buy_lbl, rate);
    //     // this.setTextColor(this.curInto, this._curIntoValue >= GC.data.user.info.displayGold ? "#B82B30" : "#3BE1F5");
    // }
    sliderChange(value: number) {
        this.sure.active = value != 0;
        this.setText(this.buy_lbl, value);
    }

    sliderStart() {
        this.scrow.enabled = false;
    }

    sliderEnd() {
        this.scrow.enabled = true;
    }

    HandleDate() {
        this.UpdateGold();
        // coinBalance.text = _data.coinBalance;
        //多倍买入时展示
        // ToggleCoin1.gameObject.SetActive(_data.buyRatio > 1);
        // ToggleCoin2.gameObject.SetActive(_data.buyRatio > 1);
        // ToggleCoin1.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), 1);
        // ToggleCoin2.transform.Find("Label").GetComponent<Text>().text = string.Format(LanguageManager.Get("UIMTTbuyinDialogRatio"), _data.buyRatio);
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
                this.textCommit.string = CPErrorCode.LanguageDescription(10012) + '(15s)';
                // textCommit.text = CPErrorCode.LanguageDescription(10012) + "(15s)";
            } else {
                this.rebuySecond -= -1;
                if (this.rebuySecond < 0) {
                    this.textCommit.string = CPErrorCode.LanguageDescription(10012) + '(' + 0 + 's)';
                } else {
                    this.textCommit.string = CPErrorCode.LanguageDescription(10012) + '(' + this.rebuySecond + 's)';
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
                    this._data.Fee * buyRatio;
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                    Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                    this._data.Fee * buyRatio;
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
                    this._data.Fee * buyRatio +
                    '-' +
                    discountResult;
                this._coinnum =
                    Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                    Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                    this._data.Fee * buyRatio -
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
                this._data.Fee * buyRatio +
                '-' +
                (this._data.coinnum + this._data.hunterFee);
            this._coinnum =
                Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                this._data.Fee * buyRatio -
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
                this._data.Fee * buyRatio +
                '-' +
                (this._data.coinnum + this._data.hunterFee + this._data.Fee);
            this._coinnum =
                Number(StringHelper.GetLongString(this._data.coinnum * buyRatio)) +
                Number(StringHelper.GetLongString(this._data.hunterFee * buyRatio)) +
                this._data.Fee * buyRatio -
                (this._data.coinnum + this._data.hunterFee + this._data.Fee);
        }
    }

    commitBtn() {
        if (ClubCache.mttPayWallat.gold <= 0) {
            UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent, {
                type: UINewDialogComponent.DialogType.CommitCancel,
                content: 'UI_WalletNoHave',
                contentCommit: 'UIMine_WalletAdd_EjPOTlsz',
                contentCancel: 'UI_otherPay',
                actionCommit: () => {
                    UIComponent.open(UIDefine.UIWallet, { wallet_type: WalletType.Club });
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
                this._data.actionCommit(false, 1, this._data.buyRatio, this.used_prop_id, this.prop_type, this.use_free);
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

    // update (dt) {}
}
