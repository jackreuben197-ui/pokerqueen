/*
 * @Author: xfj
 * @Date: 2023-01-16 18:31:27
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-01-16 18:56:21
 * @FilePath: /pokerqueen/assets/script/mtt/detail/MttAgainBuy.ts
 */

import GGSlider from "../../ui/component/GGSlider";
import BaseForm from "../../ui/form/BaseForm";
import UIBase from "../../ui/UIBase";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('脚本分组/mtt/detail/MttAgainBuy')
export default class MttAgainBuy extends BaseForm {

    private slider: GGSlider = null;

    start() {

    }
    protected lateLoad(): void {
        super.lateLoad();
        this.slider = this.getChildNodeOrComponent("Slider_Coin", GGSlider);
        this.slider.onChange(this.onSliderChange.bind(this));
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

        // this.setText(this.curInto, this._curIntoValue);
        // this.setTextColor(this.curInto, this._curIntoValue >= GC.data.user.info.displayGold ? "#B82B30" : "#3BE1F5");
    }

    // update (dt) {}
}
