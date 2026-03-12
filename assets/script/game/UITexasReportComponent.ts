
import { UIDefine } from "../define/UIDefine";
import { TextColor } from "../config/GameConfig";
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
import { ServerMessageLeave } from "../protobuf/holdem/req_th_leave_pb";
import { ClientMessageObservers } from "../protobuf/holdem/req_th_observers_pb";
import { ClientMessageRoomers } from "../protobuf/holdem/req_th_roomers_pb";
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
    public deposit;//押金
    public mushroomCount;//蘑菇数
    public mushroomAmount;//蘑菇额
    public squidInTotal;//鱿鱼入
    public squidOutTotal;//鱿鱼出
    public squidPunishTotal;//鱿鱼惩罚
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
    listBar1: cc.Node = null;
    listBar3: cc.Node = null;
    listBar3ModeLabel: cc.Label = null;
    reportSubType: 'none' | 'mush' | 'squid' = 'none';
    protected lateLoad(): void {
        super.lateLoad();
        this.text_Time = this.getChildNodeOrComponent('Text_Time', cc.Label);
        this.room_id = this.getChildNodeOrComponent('room_id', cc.Label);
        this.data_content = this.getChildNodeOrComponent('data_content');
        this.people_content = this.getChildNodeOrComponent('people_content');
        this.peopelNum = this.getChildNodeOrComponent('peopelNum', cc.Label);
        this.line = this.getChildNodeOrComponent('Line');
        this.listBar1 = cc.find('layer/ListBar1', this.node);
        this.listBar3 = cc.find('layer/ListBar3', this.node);
        this.listBar3ModeLabel = cc.find('layer/ListBar3/Text_Mode', this.node)?.getComponent(cc.Label) || null;

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
        console.log(7777,response);
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
            const anyResp: any = response as any;
            if (anyResp.observersList) {
                this.UpdateObViewList(anyResp);
            } else {
                this.UpdateObViewList({ observersList: [] });
            }
        }
    }
    onShow(param?: any): void {
        super.onShow();
        this.unscheduleAllCallbacks();
        this.clearView();
        // this.btnShowProblem = this.getChildNodeOrComponent('BtnShowProblem');
        // this.btnShowProblem.on('click', this.btnShowProblemClick, this)
        this.room_id.string = GameCache.Instance.room_id + '-' + GameCache.Instance.CurGame.mHandNum;
        this.text_Time.string = ''
        this.reportSubType = this.resolveReportSubType();
        this.refreshListBar();
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
            tSignPlayer.deposit = RoomersData.playersList[i].deposit || 0;
            tSignPlayer.mushroomCount = RoomersData.playersList[i].mushroomCount || 0;
            tSignPlayer.mushroomAmount = RoomersData.playersList[i].mushroomAmount || 0;
            tSignPlayer.squidInTotal = RoomersData.playersList[i].squidInTotal || 0;
            tSignPlayer.squidOutTotal = RoomersData.playersList[i].squidOutTotal || 0;
            tSignPlayer.squidPunishTotal = RoomersData.playersList[i].squidPunishTotal || 0;
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
        catch {

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
        if (!RoomersData || !RoomersData.observersList) {
            if (this.people_content) this.people_content.removeAllChildren();
            if (this.peopelNum) this.peopelNum.string = '0';
            return;
        }
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
        const info1 = objTemp.getChildByName('item_info1');
        const info3 = objTemp.getChildByName('item_info3');
        const subType = this.reportSubType;
        const useInfo3 = subType !== 'none';
        if (info1) info1.active = !useInfo3;
        if (info3) info3.active = useInfo3;
        const ele = useInfo3 ? info3 : info1;
        if (!ele) {
            return;
        }
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
            ele.opacity = 50
        } else {
            ele.opacity = 255
        }


        ele.getChildByName('Text_Name').getComponent(cc.Label).string = StringHelper.LengthNick(pDto.nickName)
        ele.getChildByName('Text_Num').getComponent(cc.Label).string = pDto.hand + ''
        ele.getChildByName('Text_All').getComponent(cc.Label).string = StringHelper.GetLongString(pDto.bringIn)
        let outChip = pDto.outChip != 0 ? StringHelper.GetLongString(pDto.outChip) : 0;
        ele.getChildByName('Text_All1').getComponent(cc.Label).string = '(' + outChip + ')'
        this.setCountText(ele.getChildByName('Text_Count'), pDto.score);
        if (useInfo3) {
            const depositLabel = ele.getChildByName('Text_Deposit')?.getComponent(cc.Label);
            if (depositLabel) depositLabel.string = StringHelper.GetLongString(pDto.deposit || 0);
            this.applyMushSquidInfo(ele, subType, pDto);
        }
        ele.getChildByName('own').active = pDto.userId == GameCache.Instance.nUserId;


    }
    btnShowProblemClick() {
        UIComponent.close(this.UIDefine);
        UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.node.parent });
    }
    imageMaskCloseClick() {
        this.unscheduleAllCallbacks();
        UIComponent.close(this.UIDefine);
    }

    private clearView(): void {
        this.tInfo_0 = [];
        this.tInfo_1 = [];
        if (this.data_content) this.data_content.removeAllChildren();
        if (this.people_content) this.people_content.removeAllChildren();
        if (this.peopelNum) this.peopelNum.string = '0';
        if (this.line) this.line.active = false;
    }

    private refreshListBar(): void {
        const subType = this.reportSubType;
        const useBar3 = subType !== 'none';
        if (this.listBar1) this.listBar1.active = !useBar3;
        if (this.listBar3) this.listBar3.active = useBar3;
        if (this.listBar3ModeLabel) {
            this.listBar3ModeLabel.string = subType === 'squid' ? i18nMgr.Get('UISquid') : i18nMgr.Get('UIMush');
        }
    }

    private setCountText(node: cc.Node, score: number): void {
        if (!node) return;
        const text = StringHelper.GetLongString(score);
        const color = score > 0 ? TextColor.Color6 : (score < 0 ? TextColor.Color5 : '#FFFFFF');
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = `<color=${color}>${text}</color>`;
            return;
        }
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text;
            label.node.color = cc.Color.BLACK.fromHEX(color);
        }
    }

    private resolveReportSubType(): 'none' | 'mush' | 'squid' {
        const curGame: any = GameCache.Instance.CurGame;
        const squidOn =
            (GameCache.Instance.room_squid_on || 0) > 0
            || (GameCache.Instance.room_squid_base || 0) > 0
            || (GameCache.Instance.room_squid_sub_base || 0) > 0
            || (curGame?.squidBase || 0) > 0;
        if (squidOn) return 'squid';
        const mushOn = (curGame?.mushroomBase || 0) > 0 || !!curGame?.mushroomEnabled;
        if (mushOn) return 'mush';
        return 'none';
    }

    private applyMushSquidInfo(parent: cc.Node, subType: 'none' | 'mush' | 'squid', pDto: ReportPlayer): void {
        const mushNode = parent.getChildByName('mush');
        const squidNode = parent.getChildByName('Text_Squid');

        if (mushNode) mushNode.active = subType === 'mush';
        if (squidNode) squidNode.active = subType === 'squid';

        if (subType === 'mush' && mushNode) {
            const mushNum = mushNode.getChildByName('mushNum')?.getComponent(cc.Label);
            const mushChips = mushNode.getChildByName('mushChips')?.getComponent(cc.Label);
            if (pDto.mushroomAmount > 0) {
                if (mushNum) mushNum.string = '+' + StringHelper.FormatToString("{0:N0}", pDto.mushroomCount || 0);
                if (mushChips) {
                    mushChips.string = `(+${StringHelper.GetLongString(pDto.mushroomAmount || 0)})`;
                    mushChips.node.active = true;
                }
            } else {
                if (mushNum) mushNum.string = '-';
                if (mushChips) mushChips.node.active = false;
            }
        }

        if (subType === 'squid' && squidNode) {
            const net = Number(pDto.squidInTotal || 0) - Number(pDto.squidOutTotal || 0) - Number(pDto.squidPunishTotal || 0);
            this.setSignedText(squidNode, net);
        }
    }

    private setSignedText(node: cc.Node, value: number): void {
        if (!node) return;
        const text = StringHelper.GetSignedLongString(value);
        const color = value > 0 ? TextColor.Color6 : (value < 0 ? TextColor.Color5 : '#FFFFFF');
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = `<color=${color}>${text}</color>`;
            return;
        }
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text;
            label.node.color = cc.Color.BLACK.fromHEX(color);
        }
    }


}
