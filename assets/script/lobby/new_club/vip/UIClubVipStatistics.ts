import { ClubCache } from "../../../frame/data/club/ClubCache";
import TimeHelper from "../../../helper/TimeHelper";
import WebImageHelper from "../../../helper/WebImageHelper";
import { Web_Club_Agent_Friend_Data, Web_Club_Agent_Friend_Info, WWW } from "../../../net/https/WebRequest";
import GGCombobox from "../../../ui/component/GGCombobox";
import BaseFormPlus from "../../../ui/form/BaseFormPlus";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIClubVipStatistics extends BaseFormPlus {

    ///////////////////////引用声明////////////////////////
    cc_Label$People: cc.Label = null;
    cc_Label$Gold: cc.Label = null;
    cc_Label$USDT: cc.Label = null;

    GGCombobox$Game: GGCombobox = null;
    GGCombobox$Gold: GGCombobox = null;

    $Detail: cc.Node = null;
    $Com_Back: cc.Node = null;
    $Head: cc.Node = null;
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
        { show: "金豆", index: 0, gold_type: 1 },
        { show: "USDT", index: 1, gold_type: 2 },
        { show: "记分牌", index: 2, gold_type: 4 },
    ];
    //"total_game_cnt":0,
    //"total_hand": 0,
    //"total_profit": 0,

    request_quene: any[] = [];

    //记录当前数据 1 2 4
    currData: any = null;

    protected lateLoad() {
        super.lateLoad();

        this.GGCombobox$Game.onOpen = this.Game_ComOpen.bind(this);
        this.GGCombobox$Game.onSelect = this.Game_ComSelect.bind(this);

        this.GGCombobox$Gold.onOpen = this.Gold_ComOpen.bind(this);
        this.GGCombobox$Gold.onSelect = this.Gold_ComSelect.bind(this);
    }

    regiterTouchEvents() {
        super.regiterTouchEvents();
        this.$Com_Back.on("click", this.ComBackClick, this);
    }

    onShow(param?: any, fromUI?: cc.Node, sceneUI?: cc.Node) {
        super.onShow(param, fromUI, sceneUI);
        //初始化界面
        this.GGCombobox$Game.closeBox();
        this.GGCombobox$Gold.closeBox();
        this.GGCombobox$Game.bindList(this.Com_Game_List);
        this.GGCombobox$Gold.bindList(this.Com_Gold_List);
        ////////////////////////////////////////////////////
        this.RefreshHeader([param.user.avatar, param.user.nickname, param.user.random_id, param.user_level]);
        this.request_quene = [this.reqAgentFriendInfo, this.reqAgentFriendData];
        this.executeQuene();
    }
    fadeInComplete() {
        super.fadeInComplete();
        //打开完成进行处理
    }

    Game_ComOpen() {
        this.GGCombobox$Gold.closeBox();
    }
    Game_ComSelect(index: number) {
        //console.log(index);
        this.reqAgentFriendData(null, index);
    }
    Gold_ComOpen() {
        this.GGCombobox$Game.closeBox();
    }
    Gold_ComSelect(index: number) {
        console.log(index);
        this.refreshFriendData();
    }

    //底层点击触发combobox组件关闭
    ComBackClick() {
        this.GGCombobox$Game.closeBox();
        this.GGCombobox$Gold.closeBox();
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
        this.setChildLabel(this.$Head, "Label_Nick", `${data[1]}`);
        this.setChildLabel(this.$Head, "Label_ID", `ID:  ${data[2]}`);
        this.setChildSprite(this.$Head, "Icon_VIP", ClubCache.getUserLevelIcon(data[3]));
        WebImageHelper.SetHeadImage(this.$Head.getComponent(cc.Sprite), data[0]);
        console.log(">>>>", ClubCache.getUserLevelIcon(data[3]))
    }
    //刷新成员金豆usdt数量
    RefreshUICount(data: number[]) {
        this.cc_Label$People.string = `${data[0]}`;
        this.cc_Label$Gold.string = `${data[1]}`;
        this.cc_Label$USDT.string = `${data[2]}`;
    }

    //刷新下面数据
    refreshFriendData() {
        let gold_index = this.GGCombobox$Gold.select_index;
        let gold_type = this.Com_Gold_List[gold_index].gold_type;
        let obj = this.currData[gold_type];
        this.RefreshDetailItem(this.$Detail.getChildByName("Item1"), [obj.total_hand, 8, 8]);
        this.RefreshDetailItem(this.$Detail.getChildByName("Item2"), [obj.total_profit, 9, 9]);
        this.RefreshDetailItem(this.$Detail.getChildByName("Item3"), [obj.total_game_cnt, 10, 10]);
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
    reqAgentFriendInfo(next = null) {
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

                //UIComponent.Instance.Toast("成功解除绑定");
                this.RefreshUICount([res.data.data.user_num, res.data.data.gold_total, res.data.data.usdt_total]);
                next?.call(this);
            },
            (res: any) => {

            }
        )
    }
    // -> 请求贵宾统计数据
    reqAgentFriendData(next = null, game_type: number = 0) {
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
                next?.call(this);
            },
            (res: any) => {

            }
        )
    }
}
