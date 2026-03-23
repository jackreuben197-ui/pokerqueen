
import List from "../../../common/List";
import ListEx from "../../../common/ListEx";
import TabsGroup from "../../../common/TabsGroup";
import { Tabs_Status, TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import GC from "../../../frame/GameControl";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import { StringHelper } from "../../../helper/StringHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { WebWww, WebGuildGiveRecyCle } from "../../../net/https/WebRequest";
import { WebOrgMemberList } from "../../../net/https/WebRequest";
import UIComponent from "../../../ui/UIComponent";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import FunMemberItem from "./FunMemberItem";
import UIFunManage from "./UIFunManage";


//跳转充值界面
const { ccclass } = cc._decorator;

@ccclass
export default class UIFunRecycleGive extends BaseFormPlus {

    cc_Label$count: cc.Label = null;

    cc_Label$max_recycle: cc.Label = null;

    $btn_commit: cc.Node = null;

    $keyboard: cc.Node = null;

    $btns_content: cc.Node = null;
    $btn_item: cc.Node = null;

    cc_Label$show_label: cc.Label = null;


    data: { balance: number, op_type: number, gold_type: number, list: any } = null; // type 1 发放， 2 回收

    templateInfos: any[] = null;

    tempIndexs = [];

    keys_value = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "X"];

    ////////////////////////////////////

    protected lateLoad(): void {
        super.lateLoad();
        this.initKeyboard();
        this.initEX();
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        this.setButtonClick(this.$btn_commit, this.onClickCommit);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node): void {

        super.onShow(param, fromUI, sceneUI);
        this.data = param;

        this.refreshList(param);
        //this.tempIndexs = [];
        this.refreshUI(param);


    }

    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
        //this.listEx.dropRequest();
        this.listEx.reset();
        this.listEx.refresh(this.data.list, 1);
    }

    //初始化键盘
    initKeyboard() {

        this.keys_value.forEach(item => {
            let node = cc.instantiate(this.$btn_item);
            node.parent = this.$btns_content;
            node["value"] = item;
            this.setChildLabel(node, "label", item);
            this.setButtonClick(node, this.key_click);
        })
        this.$btn_item.active = false;
    }
    refreshList(data) {
        this.tempIndexs = [];
        data.list.forEach((item, index) => {
            this.tempIndexs.push(index);
        })
    }


    refreshUI(data: any) {




        this.cc_Label$show_label.string = "0";

        this.setChildVisible(this.$keyboard, "show/icon/uc", this.data.gold_type == 1);
        this.setChildVisible(this.$keyboard, "show/icon/gc", this.data.gold_type == 2);


        this.refreshCount();

        this.refreshGiveRecycleBtn();

        if (data.op_type == 1) {//发放
            this.cc_Label$max_recycle.string = "";

            this.title_label.i18NString = i18nMgr.Get("UIClub_FundDetail_5iSXE2Uj");

            this.List$member.node.getComponent(cc.Widget).top = 178;

            this.setChildLabel(this.$btn_commit, "label", i18nMgr.Get("UIClub_FundDetail_5iSXE2Uj"));


        } else {//回收

            this.refreshMaxRecycle();

            this.title_label.i18NString = i18nMgr.Get("UIClub_FundDetail_recycle");

            this.List$member.node.getComponent(cc.Widget).top = 265;

            this.setChildLabel(this.$btn_commit, "label", i18nMgr.Get("UIClub_FundDetail_recycle"));

        }
    }

    refreshCount() {
        this.cc_Label$count.string = `${i18nMgr.Get("UIClub_SelectedTotal")}${this.tempIndexs.length}`;
    }

    refreshMaxRecycle() {

        if (this.data.op_type == 2) {
            this.cc_Label$max_recycle.string = `${i18nMgr.Get("UIClub_MaxRecycle")}${StringHelper.GetLongString(this.getMaxRecycle())}`;
        }
    }



    getMaxRecycle() {

        if (this.tempIndexs.length == 0) return 0;

        let max = Infinity;

        this.tempIndexs.forEach(index => {

            let gold = this.data.gold_type == 1 ? this.data.list[index].gold : this.data.list[index].usdt;

            if (gold < max) max = gold;

        })
        return max;

    }



    onClickCommit() {

        if (this.data.op_type == 1) {//发放
            if ((+this.cc_Label$show_label.string) * (+this.cc_Label$count.string) > this.data.balance) {
                UIComponent.Instance.ToastLanguage("UIClub_LimitMaxGive");
                return;
            }
        }
        else if (this.data.op_type == 2) {//回收

            if (+StringHelper.GetLongString(this.getMaxRecycle()) < +this.cc_Label$show_label.string) {
                UIComponent.Instance.ToastLanguage("UIClub_LimitMaxRecycle");
                return;
            }
        }

        WebWww.Instance.CommonAPI(
            {
                web_class: WebGuildGiveRecyCle,
                body: {
                    user_ids: this.getUserIds(),
                    gold_num: (+this.cc_Label$show_label.string) * 100,
                    gold_type: this.data.gold_type,
                    op_type: this.data.op_type,
                },
                club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                if (this.data.op_type == 1) {
                    UIComponent.Instance.ToastLanguage("UIClub_SendPropsSucceed");
                }
                else if (this.data.op_type == 2) {
                    UIComponent.Instance.ToastLanguage("UIClub_RecycleSucceed");
                }
                UIComponent.close(UIDefine.UIFunRecycleGive);

                UIComponent.Instance.getComponent<UIFunManage>("UIFunManage").refreshPanel();

            },
            (res: any) => {
                if (this.data.op_type == 1) {
                    UIComponent.Instance.ToastLanguage("UIClub_GiveFail");
                }
                else if (this.data.op_type == 2) {
                    UIComponent.Instance.ToastLanguage("UIClub_RecycleFail");
                }
            }
        )



        // UIGuildModel.mInstance.APIGiveRecycle(userIds, (long)(double.Parse(InputNum.text) * 100), dialogData.gold_type, dialogData.op_type, dialogData.clubId, pAct => {
        //     if (pAct.code == 0) {
        //         if (dialogData.op_type == 1) {
        //             UIComponent.Instance.ToastLanguage("UIClub_SendPropsSucceed");
        //         }
        //         else if (dialogData.op_type == 2) {
        //             UIComponent.Instance.ToastLanguage("UIClub_RecycleSucceed");
        //         }
        //         UIComponent.Instance.Remove(UIType.UIGuildGiveRecycleSheet);
        //         Game.EventSystem.Run(UIGuildEventIdType.REFRESH_CLUB_Balance);
        //         Game.EventSystem.Run(UIGuildEventIdType.REFRESH_CLUB_View);
        //         Game.EventSystem.Run(UIGuildEventIdType.REFRESH_CLUB_FUND_INFO);
        //     }
        //     else {
        //         if (dialogData.op_type == 1) {
        //             UIComponent.Instance.ToastLanguage("UIClub_GiveFail");
        //         }
        //         else if (dialogData.op_type == 2) {
        //             UIComponent.Instance.ToastLanguage("UIClub_RecycleFail");
        //         }
        //     }
        // });


    }

    private getUserIds() {

        let ids = [];

        this.tempIndexs.forEach(index => {

            ids.push(this.data.list[index].user_id);

        })
        return ids;
    }


    //////////////////////////////////

    private List$member: List = null;

    private listEx: ListEx = null;


    // private clearList() {

    //     this.List$member.content.removeAllChildren();
    // }

    refreshGiveRecycleBtn() {

        if (this.tempIndexs.length > 0 && +this.cc_Label$show_label.string > 0) {

            this.setButtonInteractable(this.$btn_commit, true);

        } else {
            this.setButtonInteractable(this.$btn_commit, false);

        }

    }

    //初始化滚动列表的补充数据
    private initEX() {
        this.listEx = new ListEx({
            list: this.List$member,
            this: this,
        });
    }
    //////////////////////////////////滚动节点渲染///////////////////////
    render_item(node: cc.Node, index: number) {

        let item_data = this.listEx.data[index];

        let check = this.isCheckByIndex(index);

        node.getComponent(FunMemberItem).onShow({ data: item_data, index: index, gold_type: this.data.gold_type, check: check, handler: this });

    }

    isCheckByIndex(index: number) {
        return this.tempIndexs.indexOf(index) > -1;
    }


    item_click(index: number, check: boolean) {

        //console.log(index, check);

        if (check) {
            this.tempIndexs.push(index);
        } else {
            this.tempIndexs.splice(this.tempIndexs.indexOf(index), 1);
        }

        this.refreshMaxRecycle();

        this.refreshGiveRecycleBtn();

        this.refreshCount();
    }

    //键盘点击
    key_click(button: cc.Button) {

        let value = button.node["value"];

        if (value == "X") {

            let last = this.cc_Label$show_label.string.length - 1;

            if (last == 0) {
                this.cc_Label$show_label.string = "0";
            } else {
                this.cc_Label$show_label.string = this.cc_Label$show_label.string.substring(0, last);
            }

            this.refreshGiveRecycleBtn();

        }


        if (this.cc_Label$show_label.string.length >= 11) return;

        let dot_index = this.cc_Label$show_label.string.indexOf(".");

        if (dot_index > -1 && dot_index == this.cc_Label$show_label.string.length - 3) return;

        switch (value) {

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":

                if (this.cc_Label$show_label.string == "0") {
                    this.cc_Label$show_label.string = value;
                } else {
                    this.cc_Label$show_label.string += value;
                }

                break;
            case "0":
                if (this.cc_Label$show_label.string != "0") {
                    this.cc_Label$show_label.string += value;
                }
                break;
            case ".":
                if (this.cc_Label$show_label.string.indexOf(".") == -1) {
                    this.cc_Label$show_label.string += value;
                }
                break;
        }

        this.refreshGiveRecycleBtn();

    }

}
