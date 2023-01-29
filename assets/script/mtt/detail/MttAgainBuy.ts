/*
 * @Author: xfj
 * @Date: 2023-01-16 18:31:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-29 20:53:24
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttAgainBuy.ts
 */

import { UIDefine } from "../../define/UIDefine";
import GGSlider from "../../ui/component/GGSlider";
import UINewDialogComponent from "../../ui/dialog/UINewDialogComponent";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttAgainBuy')
export default class MttAgainBuy extends BaseForm {
    @property(cc.ScrollView)
    scrow: cc.ScrollView = null;
    private slider: GGSlider = null;
    buy_lbl: cc.Label = null;
    start() {

    }
    protected lateLoad(): void {
        super.lateLoad();

        this.buy_lbl = this.getChildNodeOrComponent("buy_lbl", cc.Label);
        this.slider = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.slider.onChange(this.onSliderChange.bind(this));
        this.slider._delegate = this;
    }
    onShow(fromSetting?: boolean): void {
        super.onShow(fromSetting);
        this.slider.SetMinMax(0, 100);
        this.slider.onShow({ index: 0 });
        // this.onValueChangedSliderCoin(0);
    }
    /**
     * 滑动条改变触发
     */
    onSliderChange(rate: number) {
        // this._curIntoValue = (this._startRate + rate) * GameCache.Instance.CurGame.bigBlind / 100;

        this.setText(this.buy_lbl, rate);
        // this.setTextColor(this.curInto, this._curIntoValue >= GC.data.user.info.displayGold ? "#B82B30" : "#3BE1F5");
    }
    commitBtn() {
        UIComponent.Instance.OpenNoAnimation(UIDefine.UINewDialogComponent,
            {
                type: UINewDialogComponent.DialogType.CommitCancel,
                // title: "提示",
                content: 'UI_WalletNoHave',
                contentCommit: "UIMine_WalletAdd_EjPOTlsz",
                contentCancel: "UI_otherPay",
                actionCommit: () => {

                },
                noAnimation: true,
            });
    }

    // update (dt) {}
}
