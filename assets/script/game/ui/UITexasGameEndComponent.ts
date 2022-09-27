import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import { Web_User_Room, Web_User_Room_Settle_Detail } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
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
    private mRoomId: string = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.Button_back = this.getChildNodeOrComponent("Button_back");
        this.UserInfoView = this.getChildNodeOrComponent("UserInfoView");
        this.TopLookPai = this.getChildNodeOrComponent("TopLookPai");
        this.DetailImage = this.getChildNodeOrComponent("DetailImage");
        this.gameObject = this.getChildNodeOrComponent("GameObject");
        this.tips = this.getChildNodeOrComponent("tips");

    }
    protected regiterTouchEvents(): void {
        this.Button_back.getChildByName("BtnArea").on("click", this.onBackClick, this);
    }


    onShow(param?: any): void {
        super.onShow(param);
        let gameData: RecordDetailForNormalData = param;
        this.mRoomId = gameData.roomID;
        this.SetFindLabelText("TitleNameTxt", param.roomName);
        this.SetFindLabelText("TitleIDTxt", "ID:" + this.mRoomId);
        this.SetFindLabelText("LeaveTxt", TimeHelper.TimeToString(TimeHelper.Now(), "MM/dd HH:mm"));
        this.SetFindLabelText("Text_Type", StringHelper.GetRoomTypeNameByType(gameData.game_type, gameData.poker_type, gameData.bet_type));
        this.GetGameEndData();
    }

    public SetFindLabelText(path: string, content: string) {
        this.getChildNodeOrComponent(path, cc.Label).string = content;
    }


    private async GetGameEndData() {
        this.ShowEndTips(true);
        await TimeHelper.Sleep(2000);
        this.ShowEndTips(false);
        let response: typeof Web_User_Room_Settle_Detail.Response = await UITexasModel.mInstance.APIUserRoomSettleDetail();
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
        // m_ZongShou.text = string.Format("{0:N0}", hand);
        // WebImageHelper.SetUrlImage(m_Mask_head, GameCache.Instance.headPic);
        // m_Mask_head.transform.parent.gameObject.SetActive(true);
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
