

import { CipherCCM } from "crypto";
import GGEvent from "../../event/GGEvent";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import Seat from "../seat/Seat";


class AgreeSecondData {
    title: string;// = LanguageManager.Get("UIAgreeSecondPcs_title"),
    content: string;// = LanguageManager.Get("UIAgreeSecondPcs_agree"),
    contentCommit: string;// = LanguageManager.Get("adaptation20085"),
    contentCancel: string;// = LanguageManager.Get("adaptation10334"),
    SecondPcsTime: number;// = (int)Operator.LeftOpTime,
    actionCommit: Function;
    actionCancel: Function;
}


const Agree_HeadAsset: string = "Head02";
const DeAgree_HeadAsset: string = "Head01";

const { ccclass } = cc._decorator;

@ccclass
export default class UIAgreeSecondPcsComponent extends UIBase {

    public static AgreeSecondData: typeof AgreeSecondData = AgreeSecondData;

    Text_Title: cc.Label = null;
    Text_CountDown: cc.Label = null;

    Text_Reject: cc.Label = null;
    Text_Agree: cc.Label = null;

    Button_Reject: cc.Node = null;
    Button_Agree: cc.Node = null;

    Text_AgreeNum: cc.Label = null;

    curAgreeSecondData: AgreeSecondData = null;

    time: number = 0;

    PlayerActionToggleList: cc.Node[] = null;

    Player_Count: number;

    Heads: cc.Node = null;

    //同意的个数
    Agree_Count: number = 0;

    PlayerIndexMap: Map<number, number> = new Map();

    protected lateLoad() {
        super.lateLoad();
        this.Text_Title = this.getChildNodeOrComponent("Text_Title", cc.Label);
        this.Text_CountDown = this.getChildNodeOrComponent("Text_CountDown", cc.Label);
        this.Text_Reject = this.getChildNodeOrComponent("Text_Reject", cc.Label);
        this.Text_Agree = this.getChildNodeOrComponent("Text_Agree", cc.Label);

        this.Button_Reject = this.getChildNodeOrComponent("Button_Reject");
        this.Button_Agree = this.getChildNodeOrComponent("Button_Agree");
        this.Text_AgreeNum = this.getChildNodeOrComponent("Text_AgreeNum", cc.Label);
        this.Heads = this.getChildNodeOrComponent("Heads");
    }

    update(dt) {
        if (this.time > 0) {
            this.time -= dt;
            this.Text_CountDown.string = TimeHelper.ShowRemainingSemicolonPure(Math.max(0, this.time ^ 0));
        }
        else {
            UIComponent.Instance.HideUI(PrefabUI.UIAgreeSecondPcsComponent);
        }
    }

    onShow(param: AgreeSecondData): void {
        super.onShow(param);
        if (param != null) {
            this.curAgreeSecondData = param;
            this.Text_Reject.string = param.contentCancel ?? "Cancel";
            this.Text_Agree.string = param.contentCommit ?? "Commit";
            this.Text_Title.string = param.title ?? "";
            this.time = param.SecondPcsTime;
            this.UpdateSecondPcsUI();
            this.UpdateTextAgreeNum();
        }
        this.setButtonInteractable(this.Button_Reject, true);
        this.setButtonInteractable(this.Button_Agree, true);
    }
    protected regiterTouchEvents() {
        this.setButtonClick(this.Button_Reject, this.onClickReject);
        this.setButtonClick(this.Button_Agree, this.onClickAgree);
    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(GGEvent.AgreeSecondPcsRefresh, this.PlayerAgreeSecondPcsToggleRefresh);
    }
    //拒绝点击
    onClickReject() {
        this.setButtonInteractable(this.Button_Reject, false);
        this.setButtonInteractable(this.Button_Agree, false);
        this.curAgreeSecondData?.actionCancel?.();
    }
    //同意点击
    onClickAgree() {
        this.setButtonInteractable(this.Button_Reject, false);
        this.setButtonInteractable(this.Button_Agree, false);
        this.curAgreeSecondData?.actionCommit?.();
    }

    private UpdateSecondPcsUI(): void {

        if (GameCache.Instance.CurGame == null) return;

        this.ClearAllHeads();

        this.PlayerActionToggleList = [];

        this.Player_Count = 0;

        for (let i = 0; i < GameCache.Instance.CurGame.listSeat.length; i++) {
            let seat: Seat = GameCache.Instance.CurGame.listSeat[i];
            if (seat.Player == null || seat.seatID == -1 || !seat.Player.isPlaying) {
                continue;
            }
            let head = this.Heads.children[this.Player_Count];

            head.active = true;

            let head_icon: cc.Sprite = cc.find("Mask/Icon", head).getComponent(cc.Sprite);

            WebImageHelper.SetHeadImage(head_icon, seat.Player.headPic);

            this.PlayerIndexMap.set(i, this.Player_Count);

            this.Player_Count++;

        }
        //判断长度设置头像总容器的缩放值(5个头像以内保持1,>5 进行递减)
        this.Heads.scale = (1 - (Math.max(0, this.Player_Count - 5)) * 0.1);

    }

    //刷新同意的对象
    public PlayerAgreeSecondPcsToggleRefresh(seatId: number, isAgree: boolean) {

        if (isAgree) this.Agree_Count++;

        this.UpdateTextAgreeNum();


        let index = this.PlayerIndexMap.get(seatId);

        let head = this.Heads.children[index];

        console.log("head index:", index);

        head.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(isAgree ? Agree_HeadAsset : DeAgree_HeadAsset, AssetFold.texture_TexasUI);
    }

    UpdateTextAgreeNum() {
        this.Text_AgreeNum.string = `${this.Agree_Count}/${this.Player_Count} ${i18nMgr.Get("UIAgreeSecondPcs_AgreeDtail")}`;
    }

    lateClose(param?: any) {
        this.Agree_Count = 0;
        //this.unregiterAllDispatchEvent();
        this.PlayerIndexMap.clear();
    }

    private ClearAllHeads() {
        for (let i = 0; i < this.Heads.children.length; i++) {
            let head = this.Heads.children[i];
            head.getComponent(cc.Sprite).spriteFrame = AssetContext.getAsset(DeAgree_HeadAsset, AssetFold.texture_TexasUI);
            head.active = false;
        }
    }

}
