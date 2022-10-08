import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { Web_User_Room, Web_User_Room_Settle_Detail } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { UITexasModel } from "../UITexasModel";



export interface RecordDetailForNormalData {
    roomID: string;
    roomName: string;
    blind: number;
    game_type: number;
    poker_type: number;
    bet_type: number;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class UITexasGameEndComponent extends UIBase {


    Button_back: cc.Node = null;

    gameObject: cc.Node = null;
    tips: cc.Node = null;
    UserInfoView: cc.Node = null;
    TopLookPai: cc.Node = null;
    DetailImage: cc.Node = null;

    m_ZongShou: cc.Label = null;

    img_head: cc.Sprite = null;


    private mRoomId: string = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.Button_back = this.getChildNodeOrComponent("Button_back");
        this.UserInfoView = this.getChildNodeOrComponent("UserInfoView");
        this.TopLookPai = this.getChildNodeOrComponent("TopLookPai");
        this.DetailImage = this.getChildNodeOrComponent("DetailImage");
        this.gameObject = this.getChildNodeOrComponent("GameObject");
        this.tips = this.getChildNodeOrComponent("tips");

        this.m_ZongShou = this.getChildNodeOrComponent("ZongShou", cc.Label);
        this.img_head = this.getChildNodeOrComponent("img_head", cc.Sprite);
    }
    protected regiterTouchEvents(): void {
        this.Button_back.getChildByName("BtnArea").on("click", this.onBackClick, this);
    }


    onShow(param?: RecordDetailForNormalData): void {
        super.onShow(param);
        this.mRoomId = param.roomID;
        this.SetFindLabelText("TitleNameTxt", param.roomName);
        this.SetFindLabelText("TitleIDTxt", "ID:" + this.mRoomId);
        this.SetFindLabelText("LeaveTxt", TimeHelper.TimeToString(TimeHelper.Now(), "MM/dd HH:mm"));
        this.SetFindLabelText("Text_Type", StringHelper.GetRoomTypeNameByType(param.game_type, param.poker_type, param.bet_type));
        this.GetGameEndData();
    }

    public SetFindLabelText(path: string, content: string) {
        this.getChildNodeOrComponent(path, cc.Label).string = content;
    }


    private async GetGameEndData() {
        this.ShowEndTips(true);
        await TimeHelper.Sleep(2000);
        this.ShowEndTips(false);
        let response: typeof Web_User_Room_Settle_Detail.Response = await UITexasModel.mInstance.APIUserRoomSettleDetail(this.mRoomId);
        if (response) {
            this.InitSuperView(response);
            if (response.data.self_settle == null) {
                this.TopLookPai.active = false;
                this.gameObject.active = false;
            }
            else {
                this.SetMyData(response.data.self_settle.bring_out - response.data.self_settle.bring_in, response.data.self_settle.user_hand_num);
                this.TopLookPai.active = true;
                this.gameObject.active = true;
            }
        }
    }
    private SetMyData(score: number, hand: number): void {
        // m_ZhanJi.text = string.Format("{0:N0}", StringHelper.GetLongString(score));
        this.m_ZongShou.string = StringHelper.FormatToString("{0:N0}", hand);
        WebImageHelper.SetUrlImage(this.img_head, GameCache.Instance.headPic);
        this.img_head.node.parent.active = true;
    }

    private InitSuperView(response: typeof Web_User_Room_Settle_Detail.Response): void {
        //this.mLoopListView = rc.Get<GameObject>("UserInfoView").GetComponent<LoopListView2>();
        //mLoopListView.mOnEndDragAction = OnEndDrag;
        //mLoopListView.mOnDragingAction = OnDownMoreDragAction;
        //this.UICareerRecordViewCall(EnumLoadType.Init, pAct);
        //this.isFirstClickView = true;
    }
    private ShowEndTips(isTrue: boolean): void {
        this.tips.active = isTrue;
        this.UserInfoView.active = !isTrue;
        this.TopLookPai.active = !isTrue;
        this.gameObject.active = !isTrue;
        this.DetailImage.active = !isTrue;
    }


    private onBackClick() {
        UIComponent.close(UIDefine.UITexasGameEndComponent);
    }

}
