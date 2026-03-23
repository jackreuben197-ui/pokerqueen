import { UIDefine } from "../../define/UIDefine";
import { i18nMgr } from "../../i18n/i18nMgr";
import { StringHelper } from "../../helper/StringHelper";
import { GameCache } from "../../game/GameCache";
import BaseTouchBoard from "../board/BaseTouchBoard";
import UIComponent from "../UIComponent";

export type UIGameplaySecuritySettingParam = {
    isFromBringIn?: boolean;
    bringInAct?: () => void;
    roomPermissions?: {
        room_random_seat?: number;
    };
    noAnimation?: boolean;
};

const { ccclass } = cc._decorator;

@ccclass
export default class UIGameplaySecuritySetting extends BaseTouchBoard {
    private Button_Commit: cc.Node = null;
    private Button_Cancel: cc.Node = null;

    private contentMidTitle: cc.Node = null;
    private itemAndTipsTemplate: cc.Node = null;
    private itemNormalTemplate: cc.Node = null;
    private tipsMask: cc.Node = null;
    private warningTips: cc.Node = null;

    private callTimeTips: cc.Node = null;
    private callTimeInfo: cc.Label | cc.RichText = null;
    private contentRoot: cc.Node = null;

    private itemNormalCache: cc.Node[] = [];
    private itemAndTipsCache: cc.Node[] = [];
    private normalIndex = 0;
    private andTipsIndex = 0;

    private isFromBringIn = false;
    private bringInAct: (() => void) | null = null;
    private roomPermissions: { room_random_seat?: number } = {};

    protected lateLoad(): void {
        super.lateLoad();

        this.Button_Commit = this.getChildNodeOrComponent("Button_Commit");
        this.Button_Cancel = this.getChildNodeOrComponent("Button_Cancel");

        this.contentMidTitle = this.getChildNodeOrComponent("contentMidTitle");
        this.itemAndTipsTemplate = this.getChildNodeOrComponent("itemAndTips");
        this.itemNormalTemplate = this.getChildNodeOrComponent("itemNormal");
        this.tipsMask = this.getChildNodeOrComponent("tipsMask");
        this.warningTips = this.getChildNodeOrComponent("Tip");

        this.callTimeTips = this.getChildNodeOrComponent("calltimeTips");
        const callTimeInfoNode = this.getChildNodeOrComponent("calltimeInfo");
        this.callTimeInfo = callTimeInfoNode?.getComponent(cc.Label) || callTimeInfoNode?.getComponent(cc.RichText) || null;
        this.contentRoot = this.itemNormalTemplate?.parent || this.itemAndTipsTemplate?.parent || this.contentMidTitle?.parent || null;

        if (this.itemNormalTemplate) this.itemNormalTemplate.active = false;
        if (this.itemAndTipsTemplate) this.itemAndTipsTemplate.active = false;
        if (this.tipsMask) this.tipsMask.active = false;
    }

    protected regiterTouchEvents(): void {
        this.setButtonClick(this.Button_Commit, this.OnClickCommit);
        this.setButtonClick(this.Button_Cancel, this.OnClickCancel);
        this.setButtonClick(this.tipsMask, this.OnClickTipsMask);
    }

    protected lateShow(param?: UIGameplaySecuritySettingParam): void {
        super.lateShow(param);

        this.isFromBringIn = !!param?.isFromBringIn;
        this.bringInAct = param?.bringInAct || null;
        this.roomPermissions = param?.roomPermissions || {
            room_random_seat: 1,
        };

        this.RefreshUI();
    }

    private RefreshUI(): void {
        const game: any = GameCache.Instance.CurGame;
        const callTime = Number(game?.callTime || GameCache.Instance.room_call_time || 0);
        const callTimeWinline = Number(game?.callTimeWinline || GameCache.Instance.room_call_time_winline || 0);
        const callTimeLimitCount = Number(game?.callTimeLimitCount || GameCache.Instance.room_call_time_count || 0);

        if (this.callTimeTips) {
            this.callTimeTips.active = callTime === 1;
        }
        if (this.callTimeInfo) {
            this.callTimeInfo.string = StringHelper.Format(i18nMgr.Get("UICreateCallTimeTips"), [
                callTimeWinline,
                callTimeLimitCount,
                callTimeWinline,
            ]);
        }

        if (this.tipsMask) {
            this.tipsMask.active = false;
        }

        this.normalIndex = 0;
        this.andTipsIndex = 0;
        this.itemNormalCache.forEach(item => item && (item.active = false));
        this.itemAndTipsCache.forEach(item => {
            if (!item) return;
            item.active = false;
            const tipsNode = cc.find("tips", item);
            if (tipsNode) tipsNode.active = false;
        });
        if (this.contentMidTitle) {
            this.contentMidTitle.active = false;
        }

        if (Number(this.roomPermissions?.room_random_seat || 0) === 1) {
            this.FillDataByLanguageOpen("UICreateTable_randSeat", Number(GameCache.Instance.room_random_seat || 0) === 1, "UICreateTable_randSeatTips");
        }

        const isDelaySeeCard = !!GameCache.Instance.CurlimitDelaySeeCard;
        const isLimitIP = !!game?.isIpRestrictions;
        const isLimitGPS = !!game?.isGPSRestrictions;
        const isAntiCheatOpen = Number(GameCache.Instance.anti_cheat_type || 0) > 1;
        const isSafeRoom = !!game?.isSafeRoom || Number(GameCache.Instance.room_seated_messaging || 0) === 1;

        this.FillDataByLanguageOpen("adaptation20088", isDelaySeeCard);
        this.FillDataByLanguageOpen("UIClub_RoomCreat_noh7zoAE", isLimitIP);
        this.FillDataByLanguageOpen("UIClub_RoomCreat_OMKEvaor", isLimitGPS);
        this.FillDataByLanguageOpen("UISecuritySetting_limitVideo", isAntiCheatOpen);

        if (this.contentMidTitle) {
            this.contentMidTitle.active = true;
            this.MoveToLast(this.contentMidTitle);
        }
        this.FillDataByOpen("Safe", isSafeRoom);

        if (this.warningTips) {
            this.warningTips.active = !(Number(GameCache.Instance.room_random_seat || 0) === 1
                && isDelaySeeCard
                && isLimitIP
                && isLimitGPS
                && isAntiCheatOpen
                && isSafeRoom);
        }

        this.RefreshContentLayout();
    }

    private FillDataByOpen(titleKey: string, open: boolean, tipsKey = ""): void {
        this.FillData(
            i18nMgr.Get(titleKey),
            i18nMgr.Get(open ? "6digit_password_opened" : "UIMine_AccountNotOpen"),
            open ? "#7ED27E" : "#FF6666",
            i18nMgr.Get(tipsKey)
        );
    }

    private FillDataByLanguageOpen(titleKey: string, open: boolean, tipsKey = ""): void {
        this.FillData(
            i18nMgr.Get(titleKey),
            i18nMgr.Get(open ? "6digit_password_opened" : "UIMine_AccountNotOpen"),
            open ? "#7ED27E" : "#FF6666",
            i18nMgr.Get(tipsKey)
        );
    }

    private FillData(title: string, state: string, stateColor: string, tips = ""): void {
        if (!tips) {
            const item = this.GetNormalItem(this.normalIndex++);
            if (!item) return;

            this.SetTextByPath(item, "title", title);
            this.SetStateByPath(item, "state", state, stateColor);
            this.MoveToLast(item);
            item.active = true;
            return;
        }

        const item = this.GetAndTipsItem(this.andTipsIndex++);
        if (!item) return;

        this.SetTextByPath(item, "titleContent/title", title);
        this.SetStateByPath(item, "state", state, stateColor);
        this.SetTextByPath(item, "tips/tip_bg/Text", tips);

        const tipsNode = cc.find("tips", item);
        if (tipsNode) tipsNode.active = false;

        const btn = cc.find("titleContent/Button", item);
        const onClickTips = () => {
            if (tipsNode) tipsNode.active = true;
            if (this.tipsMask) this.tipsMask.active = true;
        };

        if (btn) {
            btn.targetOff(this);
            this.bindClick(btn, onClickTips);
        }
        item.targetOff(this);
        this.bindClick(item, onClickTips);

        this.MoveToLast(item);
        item.active = true;
    }

    private MoveToLast(node: cc.Node | null): void {
        if (!node || !node.parent) return;
        node.setSiblingIndex(node.parent.childrenCount - 1);
    }

    private RefreshContentLayout(): void {
        if (!this.contentRoot) return;

        const layout = this.contentRoot.getComponent(cc.Layout);
        if (!layout) return;
        layout.updateLayout();
    }

    private GetNormalItem(index: number): cc.Node | null {
        if (!this.itemNormalTemplate) return null;
        if (index < this.itemNormalCache.length) return this.itemNormalCache[index];

        const node = cc.instantiate(this.itemNormalTemplate);
        node.parent = this.itemNormalTemplate.parent;
        node.active = false;
        this.itemNormalCache.push(node);
        return node;
    }

    private GetAndTipsItem(index: number): cc.Node | null {
        if (!this.itemAndTipsTemplate) return null;
        if (index < this.itemAndTipsCache.length) return this.itemAndTipsCache[index];

        const node = cc.instantiate(this.itemAndTipsTemplate);
        node.parent = this.itemAndTipsTemplate.parent;
        node.active = false;
        this.itemAndTipsCache.push(node);
        return node;
    }

    private SetTextByPath(root: cc.Node, path: string, text: string): void {
        const node = cc.find(path, root);
        if (!node) return;
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text || "";
            return;
        }
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = text || "";
        }
    }

    private SetStateByPath(root: cc.Node, path: string, text: string, color: string): void {
        const node = cc.find(path, root);
        if (!node) return;
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text || "";
            label.node.color = cc.color().fromHEX(color);
            return;
        }
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = text || "";
            rich.node.color = cc.color().fromHEX(color);
        }
    }

    private OnClickCancel(): void {
        UIComponent.close(UIDefine.UIGameplaySecuritySetting);
        this.bringInAct?.();
    }

    private OnClickCommit(): void {
        UIComponent.close(UIDefine.UIGameplaySecuritySetting);
        this.bringInAct?.();
    }

    private OnClickTipsMask(): void {
        for (let i = 0; i < this.itemAndTipsCache.length; i++) {
            const node = this.itemAndTipsCache[i];
            if (!node || !node.activeInHierarchy) continue;
            const tipsNode = cc.find("tips", node);
            if (tipsNode && tipsNode.active) {
                tipsNode.active = false;
                if (this.tipsMask) this.tipsMask.active = false;
                return;
            }
        }
        if (this.tipsMask) {
            this.tipsMask.active = false;
        }
    }
}
