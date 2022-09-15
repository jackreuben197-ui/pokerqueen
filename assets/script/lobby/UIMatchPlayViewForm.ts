const { ccclass, property } = cc._decorator;
import BaseForm from "../../script/ui/form/BaseForm";
import LobbyScene from "./LobbyScene";
import UIMatchRoom from "./UIMatchRoom";
import { Web_Room_Center_Rooms_Blinds, Web_Room_Center_Groups, Web_Room_Center_Rooms, Web_Config_Multi_Language_Template } from "../../../assets/script/net/https/WebRequest";
import { i18nLabel } from "../../script/i18n/i18nLabel";
import LobbySession from "../../script/session/LobbySession";
import ProcedureManager from "../../script/manager/ProcedureManager";
import { ProcedureEnum } from "../../script/define/EIDefine";
import { i18nMgr } from "../i18n/i18nMgr";
import { GameCache } from "../game/GameCache";
import Main from "../Main";
import { SeatEmpty } from "../game/SeatStateHandler";
import LoginScene from "../ui/scene/LoginScene";
import LoginSession from "../session/LoginSession";
import GlobalSession from "../session/GlobalSession";
import WebSocketClient from "../net/websocket/WebSocketClient";
enum EnumLoadType {
    "Init" = 1,
    "Refresh" = 2,
    "LoadMore" = 0,
}
enum PokerType {
    Normal = 0,//普通
    SixPlus = 2//短牌
}
@ccclass
export default class UIMatchPlayViewForm extends BaseForm {
    //public static instance: UIMatchPlayViewForm = null;
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
    private mLoopListView: cc.Node = null;

    protected lateLoad(): void {
        super.lateLoad();
        this.mLoopListView = this.getChildNodeOrComponent("ViewRoomLayout");
        console.log("UIMatchPlayViewForm load");
    }
    private registerTypeEvent(): void {
        let viewContent: cc.Node = this.getChildNodeOrComponent("ViewTypeContent");
        viewContent.children.forEach((item, index) => {
            cc.log(`registerTypeEvent----item-${index}`);
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.TypeBtn, this)
        })
    }
    private removeTypeEvent(): void {
        let viewContent: cc.Node = this.getChildNodeOrComponent("ViewTypeContent");
        viewContent.children.forEach((item, index) => {
            cc.log(`removeTypeEvent---item-${index}`);
            item.off(cc.Node.EventType.TOUCH_END, this.TypeBtn, this)
        })
    }
    private registerBlindsEvent(): void {
        let viewBilndContent: cc.Node = this.getChildNodeOrComponent("ViewBlindContent");
        viewBilndContent.children.forEach((item, index) => {
            cc.log(`registerBlindsEvent---item-${index}`);
            item["index"] = index;
            item.on(cc.Node.EventType.TOUCH_END, this.BlindBtn, this)
        })
    }
    private removeBlindsEvent(): void {
        let viewBilndContent: cc.Node = this.getChildNodeOrComponent("ViewBlindContent");
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
    private TypeBtn(e: cc.Event.EventTouch): void {
        let target: cc.Node = e.target;
        let index = target["index"];
        // if(this.CurTypeBtn.name === target.name){
        //     return;
        // }
        let scrollView: cc.ScrollView = this.getChildNodeOrComponent("ScrollViewType", cc.ScrollView);
        this.TypeScroll(index, scrollView, target);

        this.RoomInfo = this.RoomTypesInfos[index];
        let sendDate = {
            game_type: this.RoomInfo.gameType,
            poker_type: this.RoomInfo.pokerType,
        }
        this.sendBlindsGetData(sendDate);
    }
    private BlindBtn(e: cc.Event.EventTouch): void {
        let target = e.target;
        let index = target["index"];
        let scrollView: cc.ScrollView = this.getChildNodeOrComponent("ScrollViewBlind", cc.ScrollView);
        this.MangInfo = this.MangList[index];
        this.DragRequestData_Room(EnumLoadType.Refresh);
        this.BlindScroll(parseInt(index), scrollView, e.target);
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
        let len: number = this.TypeContentLength;
        let middle = Math.floor(len / 2);
        // let scrollView:cc.ScrollView = this.getChildNodeOrComponent("ScrollViewType",cc.ScrollView);
        if (index === middle) {
            scrollView.scrollToPercentHorizontal(0.5, 0.1);
        } else if (index < middle) {
            scrollView.scrollToLeft(0.1)
        } else {
            scrollView.scrollToRight(0.1)
        }
    }
    /**
     * @description: 
     * @param {any} param 里面加一个点击的index
     * game_type:roomInfo.game_type,
     * poker_type:roomInfo.poker_type,
     * index:parseInt(CustomEventData),
     * len:len,
     * @return {*}
     */
    async onShow(param?: any, fromUI?: BaseForm) {
        super.onShow(param, fromUI);
        //根据点击的显示
        //获取groups信息刷新 typeScrollView
        this.TypeContentLength = param.len;
        //获取roominfo
        await this.sendGroupGetData(param);
        //获取LocalDicRoomName
        await this.sendBlindsGetData(param);

        await this.sendLanguageGetData();

        this.DragRequestData_Room(EnumLoadType.Init);
    }
    //获取group消息
    async sendGroupGetData(param?: any) {
        //请求group信息
        let typeViewContent: cc.Node = this.getChildNodeOrComponent("ViewTypeContent");
        let typesScrollView: cc.ScrollView = this.getChildNodeOrComponent("ScrollViewType", cc.ScrollView);
        let groupData: any = await LobbyScene.instance.RequestListSummary({})
        this.RoomTypesInfos = UIMatchRoom.instance.handleData(groupData.data, typeViewContent);
        this.RoomInfo = this.RoomTypesInfos[param.index];
        this.removeTypeEvent();
        this.registerTypeEvent();
        this.TypeScroll(param.index, typesScrollView, typeViewContent.children[param.index]);
    }
    //获取语言信息
    async sendLanguageGetData() {
        //{"template_id":"MTT202206181655521398625081","cn_name":"阿斯顿gggg","us_name":"111fffffffff11呆呆呆呆呆","br_name":"22222dddccc"}
        let languageInfo: any = await LobbyScene.instance.APIConfig_Multi_Language_Template({});
        if (languageInfo?.data) {
            this.LocalDicRoomName.clear();
            let data: typeof Web_Config_Multi_Language_Template.ResponseData[] = languageInfo.data;
            for (let obj of data) {
                this.LocalDicRoomName.set(obj.template_id, { cn: obj.cn_name, en: obj.us_name, pt: obj.br_name });
            }

        }
    }
    //通过key值给房间命民
    public GetRoomNameByKey(pStrKey: string): string {
        let name: string = "";
        let strArray = pStrKey.split("-");
        let name_obj = this.LocalDicRoomName.get(strArray[0]);
        if (name_obj) {
            name = name_obj[i18nMgr.language] || "";
        }
        if (strArray.length > 1) {
            name += "-" + strArray[1];
        }
        return name;
    }
    //获取blinds消息
    async sendBlindsGetData(param?: any) {
        //获取blind信息
        let blind: typeof Web_Room_Center_Rooms_Blinds.RequestParams = {
            game_type: param.game_type,
            poker_type: param.poker_type
        }
        let blindData: any = await LobbyScene.instance.RequestSbList(blind);
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
        let roomsInfoData: any = await LobbyScene.instance.APIWebRoomCenterRooms(roomsInfo);
        if (this.cacheResponseData == null) {
            this.UICareerRecordViewCall(loadType, roomsInfoData);
        } else {
            this.cacheResponseData = roomsInfoData;
        }
        this.removeBlindsEvent();
        this.registerBlindsEvent();
    }
    private UICareerRecordViewCall(loadType: EnumLoadType, pAct: typeof Web_Room_Center_Rooms.Response): void {
        if (pAct) {
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
            //空座筛选
            if (this.isSelectEmptySeat) {
                let list = [];
                let sb = "";
                let content: cc.Node = this.getChildNodeOrComponent("ViewBlindContent");
                for (let i = 0; i < content.childrenCount; i++) {
                    if (content.children[i].getChildByName("Select").active) {
                        sb = content.children[i].name;
                    }
                }
                for (let i = 0; i < this.mNormalData.length; i++) {
                    if (this.mNormalData[i].empty_seat != 0 && this.GetLongString(this.mNormalData[i].sb) == sb) {
                        list.push(this.mNormalData[i]);
                    }
                }
                list.push(typeof Web_Room_Center_Rooms.DataElement);
                this.mNormalData = list.length > 1 ? list : this.mNormalData;
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
                if (this.mNormalData.length > 0) {
                    for (let i = 0; i < this.mNormalData.length; i++) {
                        let item: cc.Node
                        if (this.mLoopListView.children[i]) {
                            item = this.mLoopListView.children[i];
                            this.SetItemDataInfo(item, this.mNormalData[i], i);
                        } else {
                            let prefab: cc.Node = this.getChildNodeOrComponent("RoomInfo");
                            item = cc.instantiate(prefab);
                            this.mLoopListView.addChild(item);
                            this.SetItemDataInfo(item, this.mNormalData[i], i);
                        }
                    }
                    if (this.mLoopListView.childrenCount > this.mNormalData.length) {
                        for (let i = this.mNormalData.length; i < this.mLoopListView.childrenCount; i++) {
                            this.mLoopListView.children[i].active = false;
                        }
                    }
                }
            }
            let NonShowed: cc.Node = this.getChildNodeOrComponent("NonShowed");
            NonShowed.active = this.mNormalData.length === 0;
        } else {

        }
    }
    async OnDataSourceLoadMoreFinished(pLength: boolean) {

    }
    async onClose(param: any = null) {
        cc.log("UIMatchPlayView onClose");
        super.onClose();
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
        let content: cc.Node = this.getChildNodeOrComponent("ViewBlindContent");
        let blindItem: cc.Node = this.getChildNodeOrComponent("ViewBlindItem");
        this.MangList = this.SortSB_Data(blindData.data.records);
        this.MangInfo = this.MangList[0];
        let item: cc.Node;
        if (content.childrenCount > 0) {
            for (let i = 0; i < content.childrenCount; i++) {
                let ch: cc.Node = content.children[i];
                ch.active = false;
            }
        }
        for (let i = 0; i < this.MangList.length; i++) {
            let data = this.MangList[i];
            if (content.children[i]) {
                item = content.children[i];
                item.active = true;
            } else {
                item = cc.instantiate(blindItem);
                item.active = true;
                content.addChild(item);
            }
            item.name = this.GetLongString(data);

            let Select: cc.Node = item.getChildByName("Select");
            let ViewBlindLabel: cc.Node = item.getChildByName("ViewBlindLabel");
            let Select_Text_Node: cc.Node = item.getChildByName("Select").getChildByName("Select_Text");

            Select.active = false;
            ViewBlindLabel.active = true;
            Select_Text_Node.active = false;

            let a: string = this.GetLongString(data);
            let b: string = this.GetLongString(data * 2);
            ViewBlindLabel.getComponent(cc.Label).string = a + "/" + b;
            let SelectText: cc.Label = Select_Text_Node.getComponent(cc.Label);
            SelectText.string = a + "/" + b;
            if (i === 0) {
                if (!cc.isValid(ViewBlindLabel.getComponent("i18nLabel"))) {
                    ViewBlindLabel.addComponent(i18nLabel);
                }
                if (!cc.isValid(SelectText.getComponent("i18nLabel"))) {
                    SelectText.addComponent(i18nLabel);
                }
                ViewBlindLabel.getComponent("i18nLabel").string = "UIMatch_GtO8YEdb";
                SelectText.getComponent("i18nLabel").string = "UIMatch_GtO8YEdb";
                item.name = SelectText.getComponent("i18nLabel").string;
                Select.active = true;
                ViewBlindLabel.active = true;
                Select_Text_Node.active = true;
                this.CurListBtn = item;
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
    //设置列表信息
    private SetItemDataInfo(item: cc.Node, roomInfo: typeof Web_Room_Center_Rooms.DataElement, index: number) {
        item.active = true;
        item.getChildByName("Text_Mang").getComponent(cc.Label).string = `${this.GetLongString(roomInfo.sb)}/${this.GetLongString(roomInfo.sb * 2)}${this.GetLongString(roomInfo.ante)}`;
        item.getChildByName("Text_Type").getComponent(cc.Label).string = roomInfo.poker_type == 2 ? this.six_List[roomInfo.game_type] : this.type_List[roomInfo.game_type];
        let layout: cc.Node = item.getChildByName("Text_Icon_Layout");
        if (roomInfo.play_duration == 0) {
            layout.getChildByName("Text_Icon_Time").active = false;
            layout.getChildByName("Text_Icon_Time_node").active = true;
        } else {
            layout.getChildByName("Text_Icon_Time").active = true;
            layout.getChildByName("Text_Icon_Time_node").active = false;
            //值取小数点后一位
            let duration = Math.floor((roomInfo.play_duration * 1.0 / 3600) * 10) / 10
            layout.getChildByName("Text_Icon_Time").getComponent(cc.Label).string = `${duration}h/${duration}h`
        }
        item.getChildByName("Text_Name").getComponent(cc.Label).string = this.GetRoomNameByKey(roomInfo.name);

        let peopleNum1: cc.Label = item.getChildByName("Text_Number").getChildByName("Text_Number_1").getComponent(cc.Label);
        let peopleNum2: cc.Label = item.getChildByName("Text_Number").getChildByName("Text_Number_2").getComponent(cc.Label);
        peopleNum1.string = `${roomInfo.seat_count - roomInfo.empty_seat}/`;
        peopleNum2.string = `${roomInfo.seat_count}`
        item["roomInfo"] = roomInfo;
        item.off(cc.Node.EventType.TOUCH_END, this.EnterRoomAPI, this);
        item.on(cc.Node.EventType.TOUCH_END, this.EnterRoomAPI, this);
    }
    //加入房间
    private async EnterRoomAPI(e: cc.Event.EventCustom) {
        let roominfo: typeof Web_Room_Center_Rooms.DataElement = e.target.roomInfo;
        console.log(`EnterRoomAPI=${JSON.stringify(roominfo)}`)
        GameCache.Instance.serviceId = roominfo.service_id;
        GameCache.Instance.roomName = this.GetRoomNameByKey(roominfo.name);
        GameCache.Instance.room_type = roominfo.room_type;
        GameCache.Instance.game_type = roominfo.game_type;
        GameCache.Instance.poker_type = roominfo.poker_type;
        GameCache.Instance.bet_type = roominfo.limit_bet_type;
        GameCache.Instance.room_id = roominfo.rid;
        GameCache.Instance.seat_count = roominfo.seat_count;
        GameCache.Instance.straddle = roominfo.straddle_on;
        GameCache.Instance.insurance = roominfo.insurance_on > 0;
        GameCache.Instance.muck_switch = roominfo.muck_on;
        GameCache.Instance.voiceprint_verify_on = roominfo.voiceprint_verify_on;
        GameCache.Instance.voiceprint_verify_duration = roominfo.voiceprint_verify_duration;

        if (WebSocketClient.WS.readyState == WebSocket.OPEN) {

            let response = LobbySession.APIWebUserRoominsur(roominfo.rid).catch(() => { });
            if (response) {
                ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, { fromUI: this.UIDefine, lookOn: false });//[this.UIDefine, false, 0]
            }
        } else {
            cc.warn("websocket还没有连接上:", WebSocketClient.WS.readyState);
        }
    }

}
