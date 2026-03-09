import { TextColor } from "../../config/GameConfig";
import { StringHelper } from "../../helper/StringHelper";
import WebImageHelper from "../../helper/WebImageHelper";
import AssetContext from "../../ui/component/AssetContext";
import UIBase from "../../ui/UIBase";

const { ccclass } = cc._decorator;
const GamePlaySubTypeNone = 0;
const GamePlaySubTypeMush = 1;
const GamePlaySubTypeSquid = 2;

@ccclass
export default class UITexasGameEndItem extends UIBase {
    private MemberNameTxt: cc.Label = null;
    private MemberIDTxt: cc.Label = null;
    private MemberComeTxt: cc.Label = null;
    private MemberHandleTxt: cc.Label = null;
    private MemberScoreTxt: cc.Label = null;
    private MemberIcon: cc.Sprite = null;

    private bg_a: cc.Node = null;
    private bg_b: cc.Node = null;
    private c_0: cc.Node = null;
    private c_1: cc.Node = null;
    private c_2: cc.Node = null;

    private mushNode: cc.Node = null;
    private mushNumTxt: cc.Label = null;
    private mushChipsTxt: cc.Label = null;
    private squidChipsTxt: cc.Label = null;

    private gamePlaySubType: number = GamePlaySubTypeNone;

    protected lateLoad(): void {
        super.lateLoad();
        this.MemberNameTxt = this.getChildNodeOrComponent("MemberNameTxt", cc.Label);
        this.MemberIDTxt = this.getChildNodeOrComponent("MemberIDTxt", cc.Label);
        this.MemberComeTxt = this.getChildNodeOrComponent("MemberComeTxt", cc.Label);
        this.MemberHandleTxt = this.getChildNodeOrComponent("MemberHandleTxt", cc.Label);
        this.MemberScoreTxt = this.getChildNodeOrComponent("MemberScoreTxt", cc.Label);
        this.MemberIcon = cc.find("MemberContent/MemberIconMask/MemberIcon", this.node)?.getComponent(cc.Sprite)
            || this.getChildNodeOrComponent("MemberIcon", cc.Sprite);

        this.bg_a = this.getChildNodeOrComponent("bg_a");
        this.bg_b = this.getChildNodeOrComponent("bg_b");
        this.c_0 = this.getChildNodeOrComponent("c_0");
        this.c_1 = this.getChildNodeOrComponent("c_1");
        this.c_2 = this.getChildNodeOrComponent("c_2");

        this.mushNode = this.getChildNodeOrComponent("mush");
        this.mushNumTxt = this.getChildNodeOrComponent("mushNum", cc.Label);
        this.mushChipsTxt = this.getChildNodeOrComponent("mushChips", cc.Label);
        this.squidChipsTxt = this.getChildNodeOrComponent("squidChips", cc.Label);
    }

    public SetGamePlaySubType(type: number): void {
        this.gamePlaySubType = type;
    }

    public onShow(param?: any): void {
        super.onShow(param);

        this.MemberNameTxt.string = StringHelper.LengthNick(param.nick_name || "");
        this.MemberIDTxt.string = `ID:${param.user_random_id || 0}`;
        this.MemberComeTxt.string = `${StringHelper.GetLongString(param.bring_in || 0)}`;
        this.MemberHandleTxt.string = `${param.user_hand_num || 0}`;

        const score = Number((param.bring_out || 0) - (param.bring_in || 0));
        this.MemberScoreTxt.string = `${StringHelper.GetSignedLongString(score)}`;
        WebImageHelper.SetUrlImage(this.MemberIcon, param.avatar, AssetContext.getAsset("RadHead"));

        this.UpdateExtraGamePlayInfo(param);
        this.setScoreColor(this.MemberScoreTxt, score);
        this.setBg();
        this.setTop();
    }

    private UpdateExtraGamePlayInfo(param: any): void {
        if (this.mushNode) {
            this.mushNode.active = this.gamePlaySubType === GamePlaySubTypeMush;
        }

        if (this.gamePlaySubType === GamePlaySubTypeMush) {
            if (this.mushNumTxt) {
                this.mushNumTxt.string = StringHelper.FormatToString("{0:N0}", param.mushroom_count || 0);
            }
            if (this.mushChipsTxt) {
                this.mushChipsTxt.string = `(${StringHelper.GetLongString(param.mushroom_amount || 0)})`;
            }
        } else {
            if (this.mushNumTxt) this.mushNumTxt.string = "0";
            if (this.mushChipsTxt) this.mushChipsTxt.string = "(0)";
        }

        if (this.squidChipsTxt) {
            if (this.gamePlaySubType === GamePlaySubTypeSquid) {
                const squidNet = Number(param.squid_in || 0) - Number(param.squid_out || 0) - Number(param.punish_fee || 0);
                this.squidChipsTxt.string = StringHelper.GetSignedLongString(squidNet);
                this.setScoreColor(this.squidChipsTxt, squidNet);
            } else {
                this.squidChipsTxt.string = "0";
                this.squidChipsTxt.node.color = cc.Color.WHITE;
            }
        }
    }

    private setBg(): void {
        if (this.bg_a) this.bg_a.active = this.index % 2 === 0;
        if (this.bg_b) this.bg_b.active = this.index % 2 === 1;
    }

    private setTop(): void {
        if (this.c_0) this.c_0.active = this.index === 0;
        if (this.c_1) this.c_1.active = this.index === 1;
        if (this.c_2) this.c_2.active = this.index === 2;
    }

    private setScoreColor(label: cc.Label, value: number): void {
        if (!label) {
            return;
        }
        if (value > 0) {
            label.node.color = cc.Color.BLACK.fromHEX(TextColor.Color6);
        } else if (value < 0) {
            label.node.color = cc.Color.BLACK.fromHEX(TextColor.Color5);
        } else {
            label.node.color = cc.Color.WHITE;
        }
    }

}
