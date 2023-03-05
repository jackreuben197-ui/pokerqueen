import TabsGroup from "../../../common/TabsGroup";
import { UIDownSelectorParam } from "../../../common/UIDownSelector";
import { Tabs_Status, TextColor } from "../../../config/GameConfig";
import { UIDefine } from "../../../define/UIDefine";
import { ClubCache } from "../../../frame/data/club/ClubCache";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { i18nMgr } from "../../../i18n/i18nMgr";
import { Web_Club_Agent_Friend_Data, Web_Club_Agent_Friend_Info, WWW } from "../../../net/https/WebRequest";
import GGCombobox from "../../../ui/component/GGCombobox";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";
import UIComponent from "../../../ui/UIComponent";
//贵宾统计
const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipStatistics extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    cc_Label$people: cc.Label = null;
    cc_Label$uc: cc.Label = null;
    cc_Label$gc: cc.Label = null;

    //GGCombobox$Gold: GGCombobox = null;
    $down_list: cc.Node = null;
    cc_Label$down_list: cc.Label = null;

    $Detail: cc.Node = null;
    $Com_Back: cc.Node = null;

    cc_Sprite$head: cc.Sprite = null;
    cc_Sprite$vip_icon: cc.Sprite = null;

    cc_Label$nick: cc.Label = null;
    cc_Label$id: cc.Label = null;


    $GameTypeTabs: cc.Node = null;

    gameTypeTabs: TabsGroup = null;

    gold_index: number = 0;


    ////////////////////////////////////////////////////
    //0-all,1-NLH，2-PLO，3-6+ 4MTT
    Com_Game_List = [
        { show: "All", index: 0 },
        { show: "NLH", index: 1 },
        { show: "PLO", index: 2 },
        { show: "6+", index: 3 },
        { show: "MTT", index: 4 }
    ];
    //gold_type 1-金豆,2-USDT，4-记分牌
    Com_Gold_List = [
        { show: "UIGuild_CoinType2", index: 0, gold_type: 1 },
        { show: "UIGuild_CoinType3", index: 1, gold_type: 2 },
        { show: "UIGuild_CoinType1", index: 2, gold_type: 4 },
    ];


    // UIGuild_CoinType1=Chip
    // UIGuild_CoinType2=UC
    // UIGuild_CoinType3=GC


    request_quene: any[] = [];

    //记录当前数据 1 2 4
    currData: any = null;

    protected lateLoad() {
        super.lateLoad();


        this.gameTypeTabs = new TabsGroup(this.$GameTypeTabs.children, this.onGameTypeClick, this);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.setButtonClick(this.$down_list, this.onClickDownlist);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        ////////////////////////////////////////////////////
        this.RefreshHeader([param.user.avatar, param.user.nickname, param.user.random_id, param.user_level]);
        this.reqAgentFriendInfo();

    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }

    reset() {
        this.gold_index = 0;
        this.gameTypeTabs.reset(-1);
        this.refreshDownListLabel();
    }
    refreshDownListLabel() {
        this.cc_Label$down_list.string = i18nMgr.Get(this.Com_Gold_List[this.gold_index].show);
    }

    //////////////////////刷新
    SetImage(node: cc.Node, value: string) {
        let sprite = node.getComponent(cc.Sprite);
        sprite && WebImageHelper.SetHeadImage(sprite, value);
    }
    //刷新详情Item
    RefreshDetailItem(item: cc.Node, data: number[]) {
        this.setChildLabel(item, "Label_Total", `${data[0]}`);
        this.setChildLabel(item, "Label_Today", `${data[1]}`);
        this.setChildLabel(item, "Label_Past", `${data[2]}`);
    }
    //刷新头部
    RefreshHeader(data: any[]) {

        WebImageHelper.SetHeadImage(this.cc_Sprite$head, data[0]);
        this.cc_Label$nick.string = `${data[1]}`;
        this.cc_Label$id.string = `ID:  ${data[2]}`;
        this.cc_Sprite$vip_icon.spriteFrame = ClubCache.getUserLevelIcon(data[3]);

    }
    //刷新成员金豆usdt数量
    RefreshUICount(data: number[]) {
        this.cc_Label$people.string = `${data[0]}`;
        this.cc_Label$uc.string = `${data[1]}`;
        this.cc_Label$gc.string = `${data[2]}`;
    }

    //刷新下面数据
    refreshFriendData() {
        //let gold_index = 0;
        //let gold_type = this.Com_Gold_List[gold_index].gold_type;
        ///let obj = this.currData[gold_type];

        //1 当天  2 :7天 4：所有
        let a_1 = this.currData[1];
        let a_2 = this.currData[2];
        let a_4 = this.currData[4];

        this.RefreshDetailItem(this.$Detail.getChildByName("Item1"), [a_4.total_hand, a_1.total_hand, a_2.total_hand]);
        this.RefreshDetailItem(this.$Detail.getChildByName("Item2"), [a_4.total_game_cnt, a_1.total_game_cnt, a_2.total_game_cnt]);
        this.RefreshDetailItem(this.$Detail.getChildByName("Item3"), [a_4.total_profit, a_1.total_profit, a_2.total_profit]);
    }
    ////////////////////////////////////
    executeQuene() {
        if (this.request_quene.length) {
            let request = this.request_quene.shift();
            request.call(this, this.executeQuene);
        }
    }
    //Web_Club_Agent_Friend_Info
    //Web_Club_Agent_Friend_Data
    //////////////////////////////////////////////请求
    // -> 请求贵宾统计信息
    reqAgentFriendInfo() {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Club_Agent_Friend_Info,
                body: {
                    "user_id": this._param.user.user_id,
                    "club_id": ClubCache.club_id,
                    "time_long": TimeHelper.Now
                },
                //club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {

                this.RefreshUICount([res.data.data.user_num, res.data.data.gold_total / 100, res.data.data.usdt_total / 100]);
                this.gameTypeTabs.reset(0);
            },
            (res: any) => {

            }
        )
    }
    // -> 请求贵宾统计数据
    reqAgentFriendData(game_type: number = 0) {
        WWW.Instance.CommonAPI(
            {
                web_class: Web_Club_Agent_Friend_Data,
                body: {
                    "club_id": ClubCache.club_id,
                    "user_id": this._param.user.user_id,
                    "game_type": game_type,//游戏类型 0-all,1-NLH，2-PLO，3-6+ 4MTT
                    "time_long": TimeHelper.Now,
                    "start_time": 0,
                    "end_time": 0,
                },
                //club_id: ClubCache.club_id
            }
        ).then(
            (res: any) => {
                //UIComponent.Instance.Toast("成功解除绑定");
                this.currData = res.data.data;
                this.refreshFriendData();
            },
            (res: any) => {

            }
        )
    }

    //顶部标签点击切换响应
    onGameTypeClick(items: cc.Node[], index: number) {
        let status_list = Tabs_Status[index];
        items.forEach((item, index) => {
            let status = status_list[index];
            item.getChildByName("lbl_show").color = status ? cc.Color.BLACK.fromHEX(TextColor.Color7) : cc.Color.BLACK.fromHEX(TextColor.Color3);
            item.getChildByName("line").active = status == 1;
        })
        //////////////////////////////////
        if (index == -1) return;
        this.reqAgentFriendData(index);
    }

    //选择器点击
    onClickDownlist() {
        UIComponent.open<UIDownSelectorParam>(UIDefine.UIDownSelector, {
            this: this,
            select_texts: [
                i18nMgr.Get(this.Com_Gold_List[0].show),
                i18nMgr.Get(this.Com_Gold_List[1].show),
                i18nMgr.Get(this.Com_Gold_List[2].show),
            ],
            confirm_text: i18nMgr.Get("CommitOK"),
            select: this.gold_index,
            confirm_click: (index) => {
                this.gold_index = index;
                this.refreshDownListLabel();
            }
        })
    }

}
