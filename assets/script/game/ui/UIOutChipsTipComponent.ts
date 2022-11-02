import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import UIComponent, { PrefabUI } from "../../ui/UIComponent";

const { ccclass } = cc._decorator;

class OutClipstipData {
    //state // 状态/0成功 / 19带出记分牌失败 /20房间不支持带出记分牌/21本手已带出过记分牌/22确认记分牌
    //tableChips // 玩家剩余记分牌
    constructor(public state: number, public tableChips: number) { }
}

@ccclass
export default class UIOutChipsTipComponent extends UIBase {

    static OutClipstipData: any = OutClipstipData;

    Image_Mask: cc.Node = null;
    Icon: cc.Sprite = null;
    Text: cc.Label = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.Image_Mask = this.getChildNodeOrComponent("Image_Mask");
        this.Icon = this.getChildNodeOrComponent("Icon", cc.Sprite);
        this.Text = this.getChildNodeOrComponent("Text", cc.Label);
    }
    protected regiterTouchEvents(): void {
        this.setButtonClick(this.Image_Mask, this.onMaskClick);
    }
    private onMaskClick() {
        UIComponent.Instance.HideUI(PrefabUI.UIOutChipsTipComponent);
    }

    onShow(outClipstipData?: OutClipstipData) {
        super.onShow(outClipstipData);
        if (null != outClipstipData) {
            this.ShowTips(outClipstipData);
        }
    }
    private async ShowTips(data: OutClipstipData) {

        switch (data.state) {
            case 0:
                this.Text.string = "成功带出" + StringHelper.GetLongString(data.tableChips) + "记分牌！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_suc",AssetFold.texture_TexasUI);
                break;
            case 1:
                this.Text.string = "记分牌不足！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                
                break;
            case 3:
                this.Text.string = "超过最大可带出记分牌！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                break;
            case 9:
                this.Text.string = "您所在房间即将结束，无法继续带出！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                break;
            case 17:
                this.Text.string = "公会、联盟处于关闭状态时不允许带出！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                break;
            case 19:
                this.Text.string = "带出记分牌失败！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                break;
            case 20:
                this.Text.string = "本房间不支持带出记分牌！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                break;
            case 21:
                this.Text.string = "本手已带出过记分牌！";
                this.Icon.spriteFrame = AssetContext.getAsset("icon_image_out_chips_tip_lose",AssetFold.texture_TexasUI);
                break;
            default:
                break;
        }
        await TimeHelper.Sleep(3000);

        UIComponent.Instance.HideUI(PrefabUI.UIOutChipsTipComponent);
    }

}
