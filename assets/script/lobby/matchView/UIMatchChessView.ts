import List from "../../common/List";
import { Web_Config_Multi_Language_Template, Web_Room_Center_Rooms, Web_Room_Center_Rooms_Blinds } from "../../net/https/WebRequest";
import UIBase from "../../ui/UIBase";
import { LobbyControl } from "../control/LobbyControl";
import UIMatchRoom from "../view/UIMatchRoom";
import UIMatchChessItem from "./UIMatchChessItem";


/**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ꧁༺ ༒ ༻꧂≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
    房间（牌桌）选择界面
 ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ༺༒༻ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/

enum EnumLoadType {
    "Init" = 1,
    "Refresh" = 2,
    "LoadMore" = 0,
}
enum PokerType {
    Normal = 0,//普通
    SixPlus = 2//短牌
}

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('脚本分组/matchView/UIMatchChessView')
export default class UIMatchChessView extends UIBase {
    private TypeContentLength: number = 0;
    private CurTypeBtn: cc.Node = null;
    private CurListBtn: cc.Node = null;
    private RoomTypesInfos: any[] = null;
    private mNormalData = [];
    private RoomInfo = null;

    private MangList = null;
    private MangInfo = null;
    private isSelectEmptySeat: boolean = false;
    private cacheResponseData: typeof Web_Room_Center_Rooms.Response = null;
    private type_List = ["NLH", "PLO4", "PLO5", "PLO6"];
    private six_List = ["6+NLH", "6+PLO4", "6+PLO5", "6+PLO6"];
    private LocalDicRoomName: Map<string, { [key: string]: string }> = new Map();
    private mLoopListView: any = null;
    private list: List = null;

    /**
    * @description: 
    * @param {any} param 里面加一个点击的index
    * game_type:roomInfo.game_type,
    * poker_type:roomInfo.poker_type,
    * index:parseInt(CustomEventData),
    * len:len,
    * @return {*}
    */
    async onShow(param?: any) {
        super.onShow(param);
        this.TypeContentLength = param.len;

        //获取roominfo
        await this.sendGroupGetData(param);
        //获取LocalDicRoomName
        await this.sendBlindsGetData(param);

        await this.sendLanguageGetData();

        this.DragRequestData_Room(EnumLoadType.Init);
    }


    protected lateLoad(): void {
        super.lateLoad();
        this.mLoopListView = this.getChildNodeOrComponent("sv_content");
        this.list = this.getChildNodeOrComponent("list", List);
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        最上层listview遍历 添加点击事件  
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    private registerTypeEvent(): void {
        let viewContent: cc.Node = this.getChildNodeOrComponent("c_middle");
        viewContent.children.forEach((item, index) => {
            cc.log(`registerTypeEvent----item-${index}`);
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.TypeBtn, this)
        })
    }
    private removeTypeEvent(): void {
        let viewContent: cc.Node = this.getChildNodeOrComponent("c_middle");
        viewContent.children.forEach((item, index) => {
            cc.log(`removeTypeEvent---item-${index}`);
            item.off(cc.Node.EventType.TOUCH_END, this.TypeBtn, this)
        })
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        中间listview遍历 添加点击事件  0/0  1/2
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    private registerBlindsEvent(): void {
        let viewBilndContent: cc.Node = this.getChildNodeOrComponent("c_bottom");
        viewBilndContent.children.forEach((item, index) => {
            cc.log(`registerBlindsEvent---item-${index}`);
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.BlindBtn, this)
        })
    }
    private removeBlindsEvent(): void {
        let viewBilndContent: cc.Node = this.getChildNodeOrComponent("c_bottom");
        viewBilndContent.children.forEach((item, index) => {
            cc.log(`removeBlindsEvent---item-${index}`);
            item.off(cc.Node.EventType.TOUCH_END, this.BlindBtn, this)
        })
    }

    /**
     * @description: 
     * @param {string} CustomEventData:0-4分别为"Texas","Plo4","Plo5","Plo6","SixPlus"
     * @param {cc} e:touch事件
     * @return {*}
     */
    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        点击最上方列表中的item调用此处 请求刷新中间的列表
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    private TypeBtn(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];

        let viewContent: cc.Node = this.getChildNodeOrComponent("c_middle");
        viewContent.children.forEach((item, i) => {
            let lbl = item.getChildByName("lbl").getComponent(cc.Label);
            if (index == i) {
                item.opacity = 255;
                lbl.fontSize = 45;
            } else {
                item.opacity = 76.5;
                lbl.fontSize = 42;
            }
        })

        // if(this.CurTypeBtn.name === target.name){
        //     return;
        // }
        let scrollView: cc.ScrollView = this.getChildNodeOrComponent("ScrollViewType", cc.ScrollView);
        this.TypeScroll(index, scrollView, target);

        this.RoomInfo = this.RoomTypesInfos[index];
        if (this.RoomInfo && this.RoomInfo.gameType) {
            let sendDate = {
                game_type: this.RoomInfo.gameType,
                poker_type: this.RoomInfo.pokerType,
            }
            this.sendBlindsGetData(sendDate);
        }
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        点击中间列表调用此处
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    private BlindBtn(e: cc.Event.EventTouch): void {
        let target = e.target;
        let index = target["index"];
        // let scrollView: cc.ScrollView = this.getChildNodeOrComponent("ScrollViewBlind", cc.ScrollView);
        this.MangInfo = this.MangList[index];
        this.DragRequestData_Room(EnumLoadType.Refresh);
        // this.BlindScroll(parseInt(index), scrollView, e.target);
    }

    // 写一个方法 可以点击按钮的时候自动滑动到
    private TypeScroll(index: number, scrollView: cc.ScrollView, target: cc.Node): void {
        if (this.CurTypeBtn) {
            if (this.CurTypeBtn.name !== target.name) {
                this.CurTypeBtn.scale = 1;
                this.CurTypeBtn = target;
                this.CurTypeBtn.scale = 1.2;
            }
        } else {
            this.CurTypeBtn = target;
            this.CurTypeBtn.scale = 1.2;
        }
        this.scrollMove(index, scrollView)
    }
    private BlindScroll(index: number, scrollView: cc.ScrollView, target: cc.Node): void {
        if (this.CurListBtn) {
            if (this.CurListBtn.name !== target.name) {
                let _Select: cc.Node = this.CurListBtn.getChildByName("Select");
                let _ViewBlindLabel: cc.Node = this.CurListBtn.getChildByName("ViewBlindLabel");
                let _Select_Text_Node: cc.Node = this.CurListBtn.getChildByName("Select").getChildByName("Select_Text");
                _Select.active = false;
                _Select_Text_Node.active = false;
                _ViewBlindLabel.active = true;

                let Select: cc.Node = target.getChildByName("Select");
                let ViewBlindLabel: cc.Node = target.getChildByName("ViewBlindLabel");
                let Select_Text_Node: cc.Node = target.getChildByName("Select").getChildByName("Select_Text");
                Select.active = true;
                Select_Text_Node.active = true;
                ViewBlindLabel.active = false;
                this.CurListBtn = target;
            }
        } else {
            this.CurListBtn = target;
            let _Select: cc.Node = this.CurListBtn.getChildByName("Select");
            let _ViewBlindLabel: cc.Node = this.CurListBtn.getChildByName("ViewBlindLabel");
            let _Select_Text_Node: cc.Node = this.CurListBtn.getChildByName("Select").getChildByName("Select_Text");
            _Select.active = true;
            _Select_Text_Node.active = true;
            _ViewBlindLabel.active = false;
        }
        this.scrollMove(index, scrollView)
    }
    private scrollMove(index: number, scrollView: cc.ScrollView) {
        // let len: number = this.TypeContentLength;
        // let middle = Math.floor(len / 2);
        // // let scrollView:cc.ScrollView = this.getChildNodeOrComponent("ScrollViewType",cc.ScrollView);
        // if (index === middle) {
        //     scrollView.scrollToPercentHorizontal(0.5, 0.1);
        // } else if (index < middle) {
        //     scrollView.scrollToLeft(0.1)
        // } else {
        //     scrollView.scrollToRight(0.1)
        // }
    }


    //获取group消息
    async sendGroupGetData(param?: any) {
        //请求group信息
        let typeViewContent: cc.Node = this.getChildNodeOrComponent("sv_content");
        let typesScrollView: cc.ScrollView = this.getChildNodeOrComponent("sv_list", cc.ScrollView);
        let groupData: any = await LobbyControl.getInstance().RequestListSummary({})
        this.RoomTypesInfos = UIMatchRoom.instance.handleData(groupData.data, typeViewContent);
        this.RoomInfo = this.RoomTypesInfos[param.index];
        this.removeTypeEvent();
        this.registerTypeEvent();
        // this.TypeScroll(param.index, typesScrollView, typeViewContent.children[param.index]);
    }
    //获取语言信息
    async sendLanguageGetData() {
        //{"template_id":"MTT202206181655521398625081","cn_name":"阿斯顿gggg","us_name":"111fffffffff11呆呆呆呆呆","br_name":"22222dddccc"}
        let languageInfo: any = await LobbyControl.getInstance().APIConfig_Multi_Language_Template({});
        if (languageInfo?.data) {
            this.LocalDicRoomName.clear();
            let data: typeof Web_Config_Multi_Language_Template.ResponseData[] = languageInfo.data;
            for (let obj of data) {
                this.LocalDicRoomName.set(obj.template_id, { cn: obj.cn_name, en: obj.us_name, pt: obj.br_name });
            }

        }
    }

    //获取blinds消息
    async sendBlindsGetData(param?: any) {
        //获取blind信息
        let blind: typeof Web_Room_Center_Rooms_Blinds.RequestParams = {
            game_type: param.game_type,
            poker_type: param.poker_type
        }
        let blindData: any = await LobbyControl.getInstance().RequestSbList(blind);
        //通过blindData生成mangBar
        this.setMangBar(blindData);
        //await this.DragRequestData_Room(EnumLoadType.Init);
    }

    //获取房间消息
    async DragRequestData_Room(loadType: EnumLoadType) {

        let param = {
            "sb_min": this.MangInfo,
            "sb_max": this.MangInfo,
            "game_type": this.RoomInfo.gameType,
            "poker_type": this.RoomInfo.pokerType,
        }
        let offset: number = 0;
        let limit: number = 0;
        if (loadType == EnumLoadType.Init || loadType === EnumLoadType.Refresh) {
            offset = 0;
            limit = 20;
            this.cacheResponseData = null;
        }
        if (loadType === EnumLoadType.LoadMore && this.cacheResponseData != null) {
            limit = 10;
        }
        let roomsInfo: typeof Web_Room_Center_Rooms.RequestParams = {
            "limit": limit,
            "offset": offset,
            //"types": null,
            "sb_min": param.sb_min,
            "sb_max": param.sb_max,
            //"ant_min": 0,
            //"ant_max": 0,
            //"room_ids": null,
            "game_type": [+param.game_type],
            "poker_type": [+param.poker_type],
            //"limit_bet_type": null,
            "order": ["sb_asc"]
        }
        //let roomsInfoData: any = { "code": 0, "data": { "limit": 20, "offset": 0, "records": [{ "rid": 97995898, "name": "ROOM202206181655523126304847-2", "room_type": 0, "game_type": 0, "poker_type": 0, "limit_bet_type": 0, "status": 1, "ante": 0, "sb": 1000, "op_duration": 120, "no_user_wait_duration": 2, "keep_seat_duration": 180, "total_bring_in": 0, "total_bring_out": 0, "total_chip": 0, "min_rate": 100, "max_rate": 400, "min_players": 2, "autostart_min_players": 2, "straddle_on": 0, "straddle_max": 0, "insurance_on": 0, "insurance_op_duration": 0, "second_pcs_on": 0, "second_pcs_op_duration": 0, "second_pcs_user_limit": 0, "delay_view_card_on": 0, "post_on": 0, "muck_on": 0, "limit_ip_on": 0, "limit_gps_on": 0, "limit_gps_distance": 0, "limit_delay_times": 2, "limit_auto_check_times": 2, "limit_auto_fold_times": 2, "seat_count": 6, "empty_seat": 6, "roomers": 0, "enter_time": "2022-07-25T04:08:30Z", "play_duration": 1800, "no_user_close_duration": 0, "retain_type": 0, "retain_min_rate": 0, "schedule_start_time": null, "start_time": null, "end_time": null, "settlement_type": 1, "hand_num": 0, "tribe_id": 1, "end_reason": "", "hc_total_hand_lv": 0, "hc_total_hand": 0, "hc_pool_rate_lv": 0, "hc_pool_rate": 0, "service_id": "grpc-throom-1", "create_time": "2022-07-25T04:08:31Z", "update_time": "2022-07-25T04:08:52Z", "voiceprint_verify_on": 1, "voiceprint_verify_limit_times": 10, "voiceprint_verify_duration": 120, "voiceprint_verify_interval_duration": 600, "participation_status": 0 }], "total": 1 } }
        let roomsInfoData: any = await LobbyControl.getInstance().APIWebRoomCenterRooms(roomsInfo);
        if (this.cacheResponseData == null) {
            this.UICareerRecordViewCall(loadType, roomsInfoData);
        } else {
            this.cacheResponseData = roomsInfoData;
        }
        this.removeBlindsEvent();
        this.registerBlindsEvent();
    }

    onRender(node: cc.Node, index) {
        let item = node.getComponent(UIMatchChessItem);
        item.initData(this.mNormalData[index], this.LocalDicRoomName);
    }

    private UICareerRecordViewCall(loadType: EnumLoadType, pAct: typeof Web_Room_Center_Rooms.Response): void {
        if (pAct == null) {
            return;
        }
        let roomData = pAct.data;
        let offset = roomData.limit + roomData.offset;
        let tmpRooms = [];
        if (loadType == EnumLoadType.Init || loadType == EnumLoadType.Refresh) {
            if (roomData.records.length > 10) {
                let index: number = 0;
                for (let element in roomData.records) {
                    index++;
                    if (index < 10) {
                        tmpRooms.push(roomData[element]);
                    }
                }
                this.cacheResponseData.code = pAct.code;
                this.cacheResponseData.data = {
                    limit: roomData.limit,
                    offset: roomData.offset,
                    total: roomData.total,
                    records: []
                }
                let _index = 0;
                for (let element in roomData.records) {
                    let item = roomData.records[element];
                    _index++;
                    if (_index > 10) {
                        this.cacheResponseData.data.records.push(item);
                    }
                }
            } else {
                this.cacheResponseData = null;
                tmpRooms = pAct.data.records;
            }
        }

        if (loadType === EnumLoadType.LoadMore) {
            this.mNormalData.splice(this.mNormalData.length - 1, 1);
            this.mNormalData.concat(roomData.records);
            this.OnDataSourceLoadMoreFinished(roomData.records.length > 0);
        } else if (loadType === EnumLoadType.Refresh) {
            //AddRange
            this.mNormalData = tmpRooms.length > 0 ? tmpRooms : [];
            if (this.mNormalData !== null && this.mNormalData.length > 0) {
                this.mNormalData.push(typeof Web_Room_Center_Rooms.DataElement)
            } else {
                this.mNormalData = [];
            }
            this.OnDataSourceLoadMoreFinished(true);
        } else {
            this.mNormalData = tmpRooms.length > 0 ? tmpRooms : [];
            cc.log("this.mNormalData=", this.mNormalData);
            //在这里初始化房间列表
            //判断当前数组长度是否大于childrenCount
            this.list.numItems = this.mNormalData.length;
            // if (this.mNormalData.length > 0) {
            // for (let i = 0; i < this.mNormalData.length; i++) {
            //     let item: cc.Node
            //     if (this.mLoopListView.children[i]) {
            //         item = this.mLoopListView.children[i];
            //         this.SetItemDataInfo(item, this.mNormalData[i], i);
            //     } else {
            //         let prefab: cc.Node = this.getChildNodeOrComponent("panel_item");
            //         item = cc.instantiate(prefab);
            //         this.mLoopListView.addChild(item);
            //         this.SetItemDataInfo(item, this.mNormalData[i], i);
            //     }
            // }
            // if (this.mLoopListView.childrenCount > this.mNormalData.length) {
            //     for (let i = this.mNormalData.length; i < this.mLoopListView.childrenCount; i++) {
            //         // this.mLoopListView.children[i].active = false;
            //     }
            // }
            // }
        }
        // let NonShowed: cc.Node = this.getChildNodeOrComponent("NonShowed");
        // NonShowed.active = this.mNormalData.length === 0;
    }

    async OnDataSourceLoadMoreFinished(pLength: boolean) {

    }

    private OnClickEmptySet(isOn: boolean) {
        this.isSelectEmptySeat = false;
        if (isOn) {
            this.isSelectEmptySeat = true;
            this.DragRequestData_Room(EnumLoadType.Refresh);
        }
    }
    //设置mangbar
    private setMangBar(blindData: any) {
        let c_bottom: cc.Node = this.getChildNodeOrComponent("c_bottom");

        // let content: cc.Node = this.getChildNodeOrComponent("ViewBlindContent");
        this.MangList = this.SortSB_Data(blindData.data.records);
        this.MangInfo = this.MangList[0];
        let item: cc.Node;
        if (c_bottom.childrenCount > 0) {
            for (let i = 0; i < c_bottom.childrenCount; i++) {
                let ch: cc.Node = c_bottom.children[i];
                ch.active = false;
            }
        }
        for (let i = 0; i < this.MangList.length; i++) {
            let data = this.MangList[i];
            if (c_bottom.children[i]) {
                item = c_bottom.children[i];
                item.active = true;
            } else {
                // item = cc.instantiate(blindItem);
                // item.active = true;
                // content.addChild(item);
                return;
            }
            item.name = this.GetLongString(data);


            if (i === 0) {
                let i18nLabel = item.getChildByName("lbl");
                // if (!cc.isValid(SelectText.getComponent("i18nLabel"))) {
                //     SelectText.addComponent(i18nLabel);
                // }
                i18nLabel.getComponent("i18nLabel").i18NString = "UIMatch_GtO8YEdb";
                // SelectText.getComponent("i18nLabel").string = "UIMatch_GtO8YEdb";
                // item.name = SelectText.getComponent("i18nLabel").string;
                // Select.active = true;
                i18nLabel.active = true;
                // Select_Text_Node.active = true;
                this.CurListBtn = item;
            } else {
                // let Select: cc.Node = item.getChildByName("Select");
                let ViewBlindLabel: cc.Node = item.getChildByName("lbl");
                // let Select_Text_Node: cc.Node = item.getChildByName("Select").getChildByName("Select_Text");

                // Select.active = false;
                ViewBlindLabel.active = true;
                // Select_Text_Node.active = false;

                let a: string = this.GetLongString(data);
                let b: string = this.GetLongString(data * 2);
                ViewBlindLabel.getComponent(cc.Label).string = a + "/" + b;
                // let SelectText: cc.Label = Select_Text_Node.getComponent(cc.Label);
                // SelectText.string = a + "/" + b;
            }
        }
    }
    private SortSB_Data(records: (typeof Web_Room_Center_Rooms_Blinds.DataElement)[]) {
        let list = [];
        for (let i = 0; i < records.length - 1; i++) {
            for (let j = 0; j < records.length - 1 - i; j++) {
                if (records[j].sb > records[j + 1].sb) {
                    let temp = records[j].sb;
                    records[j].sb = records[j + 1].sb;
                    records[j + 1].sb = temp;
                }
            }
        }
        for (let i = 0; i < records.length; i++) {
            list.push(records[i].sb);
        }
        list.splice(0, 0, 0);
        return list;
    }
    private GetLongString(num: number): string {
        if (num == 0) {
            return "0"
        }
        return num / 100 + "";
    }

    lateClose(param?: any): void {
        super.lateClose();
        this.list.numItems = 0;
    }

}