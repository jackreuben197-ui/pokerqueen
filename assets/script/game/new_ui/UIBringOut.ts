
import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import GGSlider from "../../ui/component/GGSlider";
import UIBasePlus from "../../ui/UIBasePlus";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";


const { ccclass, menu } = cc._decorator;

/**
 * 带出筹码数据
 */
export type OutClipsData = {
    /**
     * 当前最小倍数
     */
    currentMinRate: number,

    /**
     * 玩家剩余记分牌
     */
    tableChips: number,
};

/**
 * 带入筹码数据
 */
export type AddClipsDataOut = {
    /**
     * 大盲注金额
     */
    bigBlind: number;

    /**
     * 小盲注金额
     */
    smallBlind: number;

    /**
     * 最小带入倍数（相对于大盲）
     */
    currentMinRate: number;

    /**
     * 最大带入倍数（相对于大盲）
     */
    currentMaxRate: number;

    /**
     * 玩家持有总金豆
     */
    totalCoin?: number;

    /**
     * 当前桌面积分牌
     */
    tableChips: number;

    /**
     * 藏钱记分牌
     */
    storeChips: number;

    /**
     * 是否来自设置界面
     */
    isFromSetting?: boolean;

    /**
     * 指定最小带入额（含押金），单位同 bigBlind
     */
    minBringIn?: number;

    /**
     * 钱包列表
     */
    wallets?: any;
};

@ccclass
@menu('脚本分组/game/new_ui/UIBringOut')
export default class UIBringOut extends UIBasePlus {
    //part1
    $Part1: cc.Node = null;
    cc_Label$title: cc.Label = null;
    //part2
    cc_Label$tips: cc.Label = null;
    cc_Label$coin: cc.Label = null;
    cc_Label$des: cc.Label = null;
    //part3
    cc_Label$min: cc.Label = null;
    cc_Label$max: cc.Label = null;
    GGSlider$slider: GGSlider = null;
    //part4
    $Part4: cc.Node = null;
    $commit: cc.Node = null;
    $enable: cc.Node = null;

    $close: cc.Node = null;

    MaxRate: number = 0;
    CurMinOutBeans: number = 0;
    Curmultiple: number = 0;//当前倍数

    sendCoin: number = 0;//发送货币值
    ownCoin: number = 0;//拥有的货币值
    gold_type: number = 0;//货币类型


    wallet_mode: number = 0; //钱包模式 0:无钱包 1:1个钱包 2:多个钱包
    wallet_status: number = 0;//钱包状态 0未选择 1选择

    selected_wallet: any = null;//选中的钱包

    wallet: any[] = null;

    protected _param: OutClipsData;


    protected lateLoad(): void {
        super.lateLoad();
        this.GGSlider$slider.onChange(this.onSliderChange.bind(this));
    }

    onShow(data: OutClipsData): void {
        super.onShow(data);

        if (null != data) {

            //textCoin.text = $"{GameCache.Instance.carry_small* addClipsData.currentMinRate}";
            this.CurMinOutBeans = GameCache.Instance.carry_small * data.currentMinRate;

            let currentMaxBring = (data.tableChips / 100 - (GameCache.Instance.carry_small / 100) * data.currentMinRate);

            let maxRate = 0;

            this.Curmultiple = 0;

            if (currentMaxBring > 10 && currentMaxBring < 1000) {
                maxRate = currentMaxBring / 10;
                this.Curmultiple = 10;
                this.enableCommit(true);
            }
            else if (currentMaxBring > 1000 && currentMaxBring < 10000) {
                maxRate = currentMaxBring / 100;
                this.Curmultiple = 100;
                this.enableCommit(true);

            }
            else if (currentMaxBring > 10000) {
                maxRate = currentMaxBring / 1000;
                this.Curmultiple = 1000;
                this.enableCommit(true);
            }
            else {
                maxRate = 0;
                this.CurMinOutBeans = 0;
                this.enableCommit(false);
                this.cc_Label$coin.string = "0";
            }

            this.MaxRate = maxRate;
            this.GGSlider$slider.SetMinMax(0, maxRate);
            this.GGSlider$slider.onShow({ index: 0 });
        }
    }

    private enableCommit(boo: boolean) {
        this.$commit.getComponent(cc.Button).interactable = boo;
        this.$enable.active = boo;
    }


    protected regiterTouchEvents(): void {
        this.setButtonClick(this.$commit, this.onClickCommit);
        this.setButtonClick(this.$close, this.onClickClose);
    }
    /**
     * 滑动条改变触发
     */

    onSliderChange(rate: number) {

        if (this.MaxRate == rate && this.MaxRate > 0) {
            this.cc_Label$coin.string = `${StringHelper.GetLongString(this._param.tableChips / 100 * 100 - this.CurMinOutBeans)}`;
        }
        else if (this._param.tableChips > this.CurMinOutBeans * 2) {
            if ((rate) * this.Curmult
            iple > this.CurMinOutBeans) {
                this.cc_Label$coin.string = `${StringHelper.GetLongString(rate * this.Curmultiple * 100)}`;
            }
            else {
                this.cc_Label$coin.string = `${StringHelper.GetLongString(this.CurMinOutBeans + rate * this.Curmultiple * 100)}`;
            }
        }
        else if (this._param.tableChips <= this.CurMinOutBeans * 2 && this._param.tableChips > this.CurMinOutBeans) {
            this.cc_Label$coin.string = `${StringHelper.GetLongString(this._param.tableChips / 100 * 100 - this.CurMinOutBeans)}`;
        }

    }

    hideUI() {
        UIComponent.Instance.HideUI(PrefabUI.UIBringIn);
    }

    //打开钱包列表
    goWalletList() {

        UIComponent.open(UIDefine.UIClubWalletList, {
            data: this.wallet,
            selected_wallet: this.selected_wallet,
            own: this
        });
    }
    /////////////////////click事件
    //确认
    onClickCommit() {
        let mAnteNumber = + this.cc_Label$coin.string;
        if (mAnteNumber == 0) {
            return;
        }
        GameCache.Instance.CurGame.OutChips(mAnteNumber * 100);
        this.hideUI();
    }
    //关闭
    onClickClose() {
        this.hideUI();
    }
}
