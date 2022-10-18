import { CommonDefine } from "../../define/CommonDefine";
import { UIDefine } from "../../define/UIDefine";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { Web_User_Room, Web_User_Room_Settle_Detail } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { UITexasModel } from "../UITexasModel";
import UITexasGameEndItem from "./UITexasGameEndItem";



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

    tips: cc.Node = null;
    UserInfoView: cc.Node = null;
    TopLook_Con: cc.Node = null;
    Detail_Con: cc.Node = null;

    m_ZongShou: cc.Label = null;

    img_head: cc.Sprite = null;

    m_ZhanJi: cc.Label = null;

    UserInfoItem: UITexasGameEndItem = null;

    UserInfoPool: cc.Node[] = [];

    content: cc.Node = null;

    UserInfoItems: cc.Node[] = [];

    private mRoomId: string = null;



    protected lateLoad(): void {
        super.lateLoad();
        this.Button_back = this.getChildNodeOrComponent("Button_back");
        this.UserInfoView = this.getChildNodeOrComponent("UserInfoView");
        this.TopLook_Con = this.getChildNodeOrComponent("TopLook_Con");
        this.Detail_Con = this.getChildNodeOrComponent("Detail_Con");

        this.tips = this.getChildNodeOrComponent("tips");

        this.m_ZongShou = this.getChildNodeOrComponent("m_ZongShou", cc.Label);
        this.img_head = this.getChildNodeOrComponent("img_head", cc.Sprite);
        this.m_ZhanJi = this.getChildNodeOrComponent("m_ZhanJi", cc.Label);

        this.content = this.getChildNodeOrComponent("content");

        this.UserInfoItem = this.getChildNodeOrComponent("UserInfoItem", UITexasGameEndItem);

        this.UserInfoItem.node.active = false;
    }
    protected regiterTouchEvents(): void {
        this.Button_back.getChildByName("BtnArea").on("click", this.onBackClick, this);
    }
    lateClose(params?: any): void {
        super.lateClose(params);
        while (this.UserInfoItems.length) {
            this.removeUserInfoItem(this.UserInfoItems.shift());
        }
    }
    onShow(param?: RecordDetailForNormalData): void {
        super.onShow(param);
        this.mRoomId = param.roomID;
        this.SetFindLabelText("TitleNameTxt", param.roomName);
        this.SetFindLabelText("TitleIDTxt", "ID:" + this.mRoomId);
        this.SetFindLabelText("LeaveTxt", TimeHelper.TimeToString(TimeHelper.Now, "MM/dd HH:mm"));
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
            if (!this.node.active) return;
            this.InitSuperView(response);
            if (response.data.self_settle == null) {
                this.TopLook_Con.active = false;

            }
            else {
                this.SetMyData(response.data.self_settle.bring_out - response.data.self_settle.bring_in, response.data.self_settle.user_hand_num);
                this.TopLook_Con.active = true;

            }
        }
    }
    private SetMyData(score: number, hand: number): void {
        this.m_ZhanJi.node.color = score >= 0 ? CommonDefine.Text_Green_Color : CommonDefine.Text_Yellow_Color;
        this.m_ZhanJi.string = StringHelper.FormatToString("{0:N0}", StringHelper.GetLongString(score));
        this.m_ZongShou.string = StringHelper.FormatToString("{0:N0}", hand);
        WebImageHelper.SetUrlImage(this.img_head, GameCache.Instance.headPic);
        this.img_head.node.parent.active = true;
    }
    private InitSuperView(response: typeof Web_User_Room_Settle_Detail.Response): void {
        let list: typeof Web_User_Room_Settle_Detail.UsersInfo[] = response.data.list;
        for (let i = 0; i < list.length; i++) {
            let info = list[i];
            let userInfoNode: cc.Node = this.getUserInfoItem();
            let userInfoItem: UITexasGameEndItem = userInfoNode.getComponent(UITexasGameEndItem);
            userInfoItem.index = i + 1;
            userInfoItem.node.active = true;
            userInfoItem.node.parent = this.content;
            userInfoItem.onShow(info);
            this.UserInfoItems.push(userInfoItem.node);
        }
    }
    private ShowEndTips(isTrue: boolean): void {
        this.tips.active = isTrue;
        this.UserInfoView.active = !isTrue;
        this.TopLook_Con.active = !isTrue;
        this.Detail_Con.active = !isTrue;
    }
    private onBackClick() {
        UIComponent.close(UIDefine.UITexasGameEndComponent);
    }

    private getUserInfoItem(): cc.Node {
        if (this.UserInfoPool.length) return this.UserInfoPool.shift();
        return cc.instantiate(this.UserInfoItem.node);
    }
    private removeUserInfoItem(node: cc.Node) {
        node.parent = null;
        this.UserInfoPool.push(node);
    }

}
