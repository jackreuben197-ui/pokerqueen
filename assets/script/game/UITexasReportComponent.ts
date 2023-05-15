
import { UIDefine } from "../define/UIDefine";
import GC from "../frame/GameControl";
import { StringHelper } from "../helper/StringHelper";
import TimeHelper from "../helper/TimeHelper";
import WebImageHelper from "../helper/WebImageHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { UIClubModel } from "../lobby/labor/UIClubModel";
import { APIOrgFriendRoomList } from "../net/https/WebRequest";
import ProtocolAgency from "../net/websocket/ProtocolAgency";
import { ProtocolCode } from "../net/websocket/ProtocolCode";
import { Def } from "../protobuf/holdem/define_pb";
import { ServerMessageLeave } from "../protobuf/holdem/req_leave_pb";
import { ClientMessageObservers } from "../protobuf/holdem/req_observers_pb";
import { ClientMessageRoomers } from "../protobuf/holdem/req_roomers_pb";
import BaseForm from "../ui/form/BaseForm";
import UIBase from "../ui/UIBase";
import UIComponent from "../ui/UIComponent";
import { GameCache } from "./GameCache";

/*
 * @Author: xfj
 * @Date: 2022-09-01 11:38:48
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-01 13:56:09
 * @FilePath: /pokerqueen/assets/script/game/UITexasReportComponent.ts
 */
const { ccclass, property } = cc._decorator;
export class ReportPlayer {
    public userId;
    public nickName;
    public hand;
    public bringIn;//带入
    public score;//输赢
    public outChip;//带出
    public isOnline;//是否在线
}

@ccclass
export default class UITexasReportComponent extends UIBase {

    btnShowProblem: cc.Node = null;
    imageMaskClose: cc.Node = null;
    content: cc.Node = null;
    mRoomLeaveTime: any = null;
    IntervalId = null;
    isLoad = true;
    tInfo_0 = []
    tInfo_1 = []


    @property(cc.Prefab)
    peopleItem: cc.Prefab = null;
    @property(cc.Prefab)
    dataItem: cc.Prefab = null;

    text_Time: cc.Label = null;
    room_id: cc.Label = null;
    data_content: cc.Node = null;
    people_content: cc.Node = null;
    peopelNum: cc.Label = null;
    line: cc.Node = null;
    protected lateLoad(): void {
        super.lateLoad();
        this.text_Time = this.getChildNodeOrComponent('Text_Time', cc.Label);
        this.room_id = this.getChildNodeOrComponent('room_id', cc.Label);
        this.data_content = this.getChildNodeOrComponent('data_content');
        this.people_content = this.getChildNodeOrComponent('people_content');
        this.peopelNum = this.getChildNodeOrComponent('peopelNum', cc.Label);
        this.line = this.getChildNodeOrComponent('Line');

    }
    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(ProtocolCode.Protocol_Holdem_Roomers, this.ProtocolHoldemRoomersHandler)
        this.listen(ProtocolCode.Protocol_Holdem_Observers, this.ProtocolHoldemObserverHandler)
    }

    RequestRoomers() {
        ProtocolAgency.Send<ClientMessageRoomers.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Roomers,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id, },
                history: GameCache.Instance.origin_type == 4,
                historyLimit: 1000,
                historyOffset: 0,
            },
        })
    }

    RequestObservers() {
        ProtocolAgency.Send<ClientMessageObservers.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Observers,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id, },
                // history: GameCache.Instance.origin_type == 4,
                limit: 1000,
                offset: 0,
            },
        })
    }
    ProtocolHoldemObserverHandler(response: ServerMessageLeave.AsObject) {
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            this.UpdateObViewList(response);
        }
    }


    ProtocolHoldemRoomersHandler(response: ServerMessageLeave.AsObject) {
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            this.UpdateViewList(response);
        }
    }
    onShow(param?: any): void {
        super.onShow();
        this.unscheduleAllCallbacks();
        // this.btnShowProblem = this.getChildNodeOrComponent('BtnShowProblem');
        // this.btnShowProblem.on('click', this.btnShowProblemClick, this)
        this.room_id.string = GameCache.Instance.room_id + '-' + GameCache.Instance.CurGame.mHandNum;
        this.text_Time.string = ''
        this.RequestRoomers();
        this.RequestObservers();
    }
    async UpdateViewList(RoomersData) {
        //玩家 
        this.tInfo_0 = []
        this.tInfo_1 = []

        this.data_content.removeAllChildren();
        this.line.active = RoomersData.playersList.length != 0
        for (let i = 0; i < RoomersData.playersList.length; i++) {
            let tSignPlayer = new ReportPlayer();
            tSignPlayer.userId = RoomersData.playersList[i].userRid;
            tSignPlayer.nickName = RoomersData.playersList[i].name;
            tSignPlayer.hand = RoomersData.playersList[i].handNum;
            tSignPlayer.bringIn = RoomersData.playersList[i].bringInTotal;
            tSignPlayer.score = RoomersData.playersList[i].win;
            tSignPlayer.outChip = RoomersData.playersList[i].bringOutTotal;
            tSignPlayer.isOnline = RoomersData.playersList[i].isOnline;
            if (RoomersData.playersList[i].status == Def.CanPlayStatus.NORMAL || RoomersData.playersList[i].Status == Def.CanPlayStatus.AGREE_POST) {
                this.tInfo_0.push(tSignPlayer);
            }
            else {
                this.tInfo_1.push(tSignPlayer);
            }
        }
        try {
            this.tInfo_0.sort((x, y) => { return -x.score.CompareTo(y.score); });
            this.tInfo_1.sort((x, y) => { return -x.score.CompareTo(y.score); });
        }
        catch
        {

        }

        for (let index = 0; index < this.tInfo_0.length; index++) {
            const element: any = cc.instantiate(this.dataItem);
            element.parent = this.data_content;
            this.setInfos(element, this.tInfo_0[index], true);
        }
        for (let index1 = 0; index1 < this.tInfo_1.length; index1++) {
            const element: any = cc.instantiate(this.dataItem);
            element.parent = this.data_content;
            this.setInfos(element, this.tInfo_1[index1], false);
        }
        if (GameCache.Instance.origin_type == 4) {
            let result: any = await UIClubModel.mInstance.APIOrgFriendRoomList(false).catch((content) => { console.log(`>> catch error:${APIOrgFriendRoomList.API}`, content) });
            if (!result) return;
            let data: any = APIOrgFriendRoomList.Response.data

            data.records.forEach(item => {
                if (item.rid == GameCache.Instance.room_id) {
                    if (item.start_time == null) {
                        return;
                    }
                    let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time)
                    let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000
                    if (roomLeftTime > 0) {
                        this.mRoomLeaveTime = roomLeftTime;
                        let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.Label);
                        textTitle.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
                        this.ShowLeaveTimer();
                    }
                }
            })
        } else {
            let parms = {
                name: "",
                ante_min: 0,
                ante_max: 0,
                sb_min: 10,
                sb_max: 100000,
                tribe_id: 0,
                start_time_s: 0,
                start_time_e: 0,
                enter_time_s: 0,
                enter_time_e: 0,
                game_type: [],
                poker_type: [0, 2],
                limit_bet_type: [],
                order: ["sb_asc"],

            }
            UIClubModel.mInstance.APIOrgClubRoom(parms).then((roomsInfoData: any) => {
                roomsInfoData.data.records.forEach(item => {
                    if (item.rid == GameCache.Instance.room_id) {
                        if (item.start_time == null) {
                            return;
                        }
                        let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time)
                        let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000
                        if (roomLeftTime > 0) {
                            this.mRoomLeaveTime = roomLeftTime;
                            let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.Label);
                            textTitle.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
                            this.ShowLeaveTimer();
                        }
                    }
                })
            })
        }

    }

    async UpdateObViewList(RoomersData) {
        this.people_content.removeAllChildren();
        this.peopelNum.string = RoomersData.observersList.length
        for (let index = 0; index < RoomersData.observersList.length; index++) {
            let tItem: cc.Node = cc.instantiate(this.peopleItem);
            tItem.parent = this.people_content;
            let nick_name = StringHelper.LengthNick(RoomersData.observersList[index].name);
            let nameLbl = tItem.getChildByName('Text_Name').getComponent(cc.Label)
            nameLbl.string = nick_name

            let icon = tItem.getChildByName('icon')
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), RoomersData.observersList[index].avatar)
            tItem['user_id'] = RoomersData.observersList[index].userRid
            if (!RoomersData.observersList[index].isOnline && GameCache.Instance.origin_type == 4) {
                tItem.opacity = 50
            } else {
                tItem.opacity = 255
            }
            this.bindClick(tItem, () => {
                UIComponent.open(UIDefine.UITexasReportPlayerInfo, [tItem['user_id'], false, null]);

            })

        }
    }

    ShowLeaveTimer() {
        this.schedule(() => {
            if (this.mRoomLeaveTime >= 0 && this.node.isValid) {
                this.mRoomLeaveTime--;
                if (this.text_Time != null)
                    this.text_Time.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
            } else {
                if (this.text_Time != null && !cc.isValid(this.node, true)) {
                    this.text_Time.string = "00:00";
                }
            }
        }, 1)
    }
    setInfos(objTemp, pDto, onLine) {
        // let color = cc.color().fromHEX('#7187FF')
        // let opactiy = 255
        // if (!pDto.isOnline && GameCache.Instance.origin_type == 4) {
        //     color = cc.color().fromHEX('#FFFFFF')
        //     opactiy = 255 * 0.2
        //     objTemp.getChildByName('Text_Count').color = color
        //     objTemp.getChildByName('Text_Count').opactiy = opactiy
        // }
        // else {
        //     if (pDto.userId == GameCache.Instance.nUserId) {
        //         color = cc.color().fromHEX('#7187FF')

        //     } else {
        //         color = cc.color().fromHEX('#EEF5FF')
        //     }

        //     objTemp.getChildByName('Text_Count').color = pDto.score >= 0 ? cc.color().fromHEX('#B0FFAE') : cc.color().fromHEX('#FF7C7C')
        //     objTemp.getChildByName('Text_Count').opactiy = opactiy

        // }
        // objTemp.getChildByName('Text_Name').color = color
        // objTemp.getChildByName('Text_Num').color = color
        // objTemp.getChildByName('Text_All').color = color
        // objTemp.getChildByName('Text_All1').color = color

        // objTemp.getChildByName('Text_Name').opactiy = opactiy
        // objTemp.getChildByName('Text_Num').opactiy = opactiy
        // objTemp.getChildByName('Text_All').opactiy = opactiy
        // objTemp.getChildByName('Text_All1').opactiy = opactiy
        if (!pDto.isOnline && GameCache.Instance.origin_type == 4) {
            objTemp.opacity = 50
        } else {
            objTemp.opacity = 255
        }


        objTemp.getChildByName('Text_Name').getComponent(cc.Label).string = StringHelper.LengthNick(pDto.nickName)
        objTemp.getChildByName('Text_Num').getComponent(cc.Label).string = pDto.hand + ''
        objTemp.getChildByName('Text_All').getComponent(cc.Label).string = StringHelper.GetLongString(pDto.bringIn)
        let outChip = pDto.outChip != 0 ? StringHelper.GetLongString(pDto.outChip) : 0;
        objTemp.getChildByName('Text_All1').getComponent(cc.Label).string = '(' + outChip + ')'
        objTemp.getChildByName('Text_Count').getComponent(cc.Label).string = StringHelper.GetLongString(pDto.score);
        objTemp.getChildByName('own').active = pDto.userId == GameCache.Instance.nUserId;


    }
    btnShowProblemClick() {
        UIComponent.close(this.UIDefine);
        UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.node.parent });
    }
    imageMaskCloseClick() {
        this.unscheduleAllCallbacks();
        UIComponent.close(this.UIDefine);
    }


}
