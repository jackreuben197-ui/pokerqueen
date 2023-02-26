
import { TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { i18nMgr } from "../../../i18n/i18nMgr";

import UIDialogComponent from "../../../ui/dialog/UIDialogComponent";

import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipMemberDetail extends BaseFormPlus {
    //文本
    private A_Text = ["全部", "NLH", "PLO", "6+"];
    private B_Text = ["全部", "7天", "30天"];
    private C_Text = ["局数", "手数", "充值USDT", "充值金豆", "提现金豆", "提现USDT"];

    //页签状态
    A_Tab_Status = {
        0: [1, 0, 0, 0],
        1: [0, 1, 0, 0],
        2: [0, 0, 1, 0],
        3: [0, 0, 0, 1],
    }
    B_Tab_Status = {
        0: [1, 0, 0],
        1: [0, 1, 0],
        2: [0, 0, 1],
    }

    private _A_index: number = -1;
    private _B_index: number = -1;


    ///////////////////////引用声明////////////////////////

    cc_Label$Gold: cc.Label = null;
    cc_Label$USDT: cc.Label = null;

    cc_EditBox$Name: cc.EditBox = null;
    cc_EditBox$Notes: cc.EditBox = null;

    $A: cc.Node = null;
    $B: cc.Node = null;
    $C: cc.Node = null;

    $Remove: cc.Node = null;
    ////////////////////////////////////////////////////


    protected lateLoad() {
        super.lateLoad();
        this.setTabs();
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$Remove, this.removeClick);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        this.refreshTabs();
        this.A_Index = 0;
        this.B_Index = 0;
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }

    //设置切换按钮
    setTabs() {
        this.$A.children.forEach((item, index) => {
            item["index"] = index;
            this.setButtonClick(item, this.tabAClick);
        })
        this.$B.children.forEach((item, index) => {
            item["index"] = index;
            this.setButtonClick(item, this.tabBClick);
        })
    }

    //刷新页签按钮
    refreshTabs() {
        this.$A.children.forEach((item, index) => {
            item.getComponent(cc.Label).string = i18nMgr.Get(this.A_Text[index]);
        })
        this.$B.children.forEach((item, index) => {
            item.children[0].getComponent(cc.Label).string = i18nMgr.Get(this.B_Text[index]);
        })
        this.$C.children.forEach((item, index) => {
            item.children[1].getComponent(cc.Label).string = i18nMgr.Get(this.C_Text[index]);
        })
    }

    set A_Index(index: number) {
        if (this._A_index == index) return;
        this._A_index = index;
        let status = this.A_Tab_Status[index];
        this.$A.children.forEach((item, index) => {
            let color = status[index] ? TextColor.Color1 : TextColor.Color2;
            item.color = cc.Color.BLACK.fromHEX(color);
        })
    }
    set B_Index(index: number) {
        if (this._B_index == index) return;
        this._B_index = index;
        let status = this.B_Tab_Status[index];
        this.$B.children.forEach((item, index) => {

            let color = status[index] ? TextColor.Color1 : TextColor.Color2;
            item.color = cc.Color.BLACK.fromHEX(color);
            item.children[0].color = cc.Color.BLACK.fromHEX(color);
            item.children[0].children[0].color = cc.Color.BLACK.fromHEX(color);
        })
    }

    /////////////////点击
    //Tab_A点击
    tabAClick(button: cc.Button) {
        let index = button.node["index"];
        this.A_Index = index;

    }
    //Tab_B点击
    tabBClick(button: cc.Button) {
        let index = button.node["index"];
        this.B_Index = index;
    }
    //移除按钮点击
    removeClick() {

        UIComponent.Instance.OpenNoAnimation(UIDefine.UIDialogComponent,
            {
                type: UIDialogComponent.DialogType.CommitCancel,
                title: "提示",
                content: `<color=${TextColor.Color2}}>玩家昵称</color>下线成员xx人，身份修改后，所有下线成员将解除绑定，是否确定操作？`,
                contentCommit: "确定",
                contentCancel: "取消",
                actionCommit: async () => {
                },
                noAnimation: true,
            });
    }

}
