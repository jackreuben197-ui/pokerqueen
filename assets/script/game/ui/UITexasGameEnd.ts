import ComFormTitle from "../../common/ComFormTitle";
import { TextColor } from "../../config/GameConfig";
import { UIDefine } from "../../define/UIDefine";
import GC from "../../frame/GameControl";
import { StringHelper } from "../../helper/StringHelper";
import TimeHelper from "../../helper/TimeHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import { WebUserRoom, WebUserRoomSettleDetail } from "../../net/https/WebRequest";
import AssetContext, { AssetFold } from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";
import UIComponent from "../../ui/UIComponent";
import { GameCache } from "../GameCache";
import { UITexasModel } from "../UITexasModel";
import UITexasGameEndItem from "./UITexasGameEndItem";

export enum GamePlaySubType {
    NONE = 0,
    MUSH = 1,
    SQUID = 2,
}

export interface RecordDetailForNormalData {
    roomID: string;
    roomName: string;
    blind: number;
    game_type: number;
    poker_type: number;
    bet_type: number;
    gamePlaySubType?: GamePlaySubType;
}

const { ccclass } = cc._decorator;

@ccclass
export default class UITexasGameEnd extends UIBase {
    private tips: cc.Node = null;
    private UserInfoView: cc.Node = null;
    private TopLook_Con: cc.Node = null;
    private Detail_Con: cc.Node = null;

    private m_ZongShou: cc.Label = null;
    private Head: cc.Node = null;
    private RadHead: cc.Sprite = null;
    private m_ZhanJi: cc.Label = null;

    private content: cc.Node = null;

    private UserInfoItem: UITexasGameEndItem = null;
    private UserInfoItemMushRoom: UITexasGameEndItem = null;
    private UserInfoItemSquid: UITexasGameEndItem = null;

    private List_Title: cc.Node = null;
    private List_Title_Mushroom: cc.Node = null;
    private List_Title_Squid: cc.Node = null;

    private UserInfoItems: cc.Node[] = [];
    private mRoomId: string = null;
    private gamePlaySubType: GamePlaySubType = GamePlaySubType.NONE;

    private comFormTitle: ComFormTitle = null;
    private back_click: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.UserInfoView = this.getChildNodeOrComponent("UserInfoView");
        this.TopLook_Con = this.getChildNodeOrComponent("TopLook_Con");
        this.Detail_Con = this.getChildNodeOrComponent("Detail_Con");
        this.RadHead = cc.find("main/Head/AvatarMask/RadHead", this.node)?.getComponent(cc.Sprite)
            || this.getChildNodeOrComponent("RadHead", cc.Sprite);
        this.Head = this.getChildNodeOrComponent("Head");
        this.tips = this.getChildNodeOrComponent("tips");
        this.m_ZongShou = this.getChildNodeOrComponent("m_ZongShou", cc.Label);
        this.m_ZhanJi = this.getChildNodeOrComponent("m_ZhanJi", cc.Label);
        this.content = this.getChildNodeOrComponent("content");

        this.UserInfoItem = this.getChildNodeOrComponent("UserInfoItem", UITexasGameEndItem);
        this.UserInfoItemMushRoom = this.getChildNodeOrComponent("UserInfoItemMushRoom", UITexasGameEndItem);
        this.UserInfoItemSquid = this.getChildNodeOrComponent("UserInfoItemSquid", UITexasGameEndItem);
        this.List_Title = cc.find("main/List_Title", this.node);
        this.List_Title_Mushroom = cc.find("main/List_Title_Mushroom", this.node);
        this.List_Title_Squid = cc.find("main/List_Title_Squid", this.node);

        if (this.UserInfoItem) this.UserInfoItem.node.active = false;
        if (this.UserInfoItemMushRoom) this.UserInfoItemMushRoom.node.active = false;
        if (this.UserInfoItemSquid) this.UserInfoItemSquid.node.active = false;

        this.comFormTitle = this.getChildNodeOrComponent("comFormTitle", ComFormTitle);
        this.back_click = this.getChildNodeOrComponent("back_click");
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.back_click, this.click_close);
    }

    public lateClose(params?: any): void {
        super.lateClose(params);
        while (this.UserInfoItems.length) {
            this.removeUserInfoItem(this.UserInfoItems.shift());
        }
    }

    public onShow(param?: RecordDetailForNormalData): void {
        super.onShow(param);
        if (!param) {
            return;
        }
        this.mRoomId = param.roomID;
        this.gamePlaySubType = this.ResolveGamePlaySubType(param);
        this.RefreshSubTypeUI();

        this.SetFindLabelText("TitleNameTxt", param.roomName);
        this.SetFindLabelText("TitleIDTxt", "ID:" + this.mRoomId);
        this.SetFindLabelText("LeaveTxt", TimeHelper.TimeToString(TimeHelper.Now, "MM/dd HH:mm"));
        this.SetFindLabelText("Text_Type", StringHelper.GetRoomTypeNameByType(param.game_type, param.poker_type, param.bet_type));
        this.Head.active = false;
        this.comFormTitle.title_label.string = i18nMgr.Get("UIMine_RecordDetailForMatch");
        this.GetGameEndData();
    }

    public SetFindLabelText(path: string, content: string): void {
        this.getChildNodeOrComponent(path, cc.Label).string = content;
    }

    private async GetGameEndData(): Promise<void> {
        this.ShowEndTips(true);
        await TimeHelper.Sleep(2000);
        this.ShowEndTips(false);
        let response: typeof WebUserRoomSettleDetail.Response = await UITexasModel.mInstance.APIUserRoomSettleDetail(this.mRoomId);
        if (response) {
            if (!this.node.activeInHierarchy) return;
            this.InitSuperView(response);
            if (response.data.self_settle == null) {
                this.TopLook_Con.active = false;

            }
            else {
                this.SetMyData(response.data.self_settle.bring_out - response.data.self_settle.bring_in, response.data.self_settle.user_hand_num);
                this.TopLook_Con.active = true;

            }
        }

        this.InitSuperView(response);
        if (response.data.self_settle == null) {
            this.TopLook_Con.active = false;
            return;
        }

        this.SetMyData(response.data.self_settle.bring_out - response.data.self_settle.bring_in, response.data.self_settle.user_hand_num);
        this.TopLook_Con.active = true;
    }

    private SetMyData(score: number, hand: number): void {
        this.m_ZhanJi.node.color = cc.Color.BLACK.fromHEX(score < 0 ? TextColor.Color5 : TextColor.Color6);
        this.m_ZhanJi.string = StringHelper.GetLongString(score);
        this.m_ZongShou.string = `${hand}`;
        WebImageHelper.SetUrlImage(this.RadHead, GameCache.Instance.headPic, AssetContext.getAsset("RadHead"));
        this.Head.active = true;
    }

    private InitSuperView(response: typeof WebUserRoomSettleDetail.Response): void {
        const list = response.data.list || [];
        while (this.UserInfoItems.length) {
            this.removeUserInfoItem(this.UserInfoItems.shift());
        }

        for (let i = 0; i < list.length; i++) {
            const info = list[i];
            const userInfoNode = this.getUserInfoItem();
            const userInfoItem: UITexasGameEndItem = userInfoNode.getComponent(UITexasGameEndItem);
            if (!userInfoItem) {
                continue;
            }

            userInfoItem.index = i;
            userInfoItem.SetGamePlaySubType(this.gamePlaySubType);
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

    private getUserInfoItem(): cc.Node {
        return cc.instantiate(this.GetCurrentTemplate().node);
    }

    private removeUserInfoItem(node: cc.Node): void {
        if (!node) {
            return;
        }
        node.destroy();
    }

    private click_close(): void {
        UIComponent.close(UIDefine.UITexasGameEnd);
    }

    private ResolveGamePlaySubType(param?: RecordDetailForNormalData): GamePlaySubType {
        if (param && param.gamePlaySubType != null) {
            return param.gamePlaySubType;
        }
        const curGame: any = GameCache.Instance.CurGame;
        if (curGame?.squidEnabled) {
            return GamePlaySubType.SQUID;
        }
        if (curGame?.mushroomEnabled) {
            return GamePlaySubType.MUSH;
        }
        return GamePlaySubType.NONE;
    }

    private RefreshSubTypeUI(): void {
        if (this.List_Title) {
            this.List_Title.active = this.gamePlaySubType === GamePlaySubType.NONE;
        }
        if (this.List_Title_Mushroom) {
            this.List_Title_Mushroom.active = this.gamePlaySubType === GamePlaySubType.MUSH;
        }
        if (this.List_Title_Squid) {
            this.List_Title_Squid.active = this.gamePlaySubType === GamePlaySubType.SQUID;
        }
    }

    private GetCurrentTemplate(): UITexasGameEndItem {
        switch (this.gamePlaySubType) {
            case GamePlaySubType.MUSH:
                return this.UserInfoItemMushRoom || this.UserInfoItem;
            case GamePlaySubType.SQUID:
                return this.UserInfoItemSquid || this.UserInfoItem;
            default:
                return this.UserInfoItem;
        }
    }
}
