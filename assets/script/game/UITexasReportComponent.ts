import { UIDefine } from '../define/UIDefine';
import { TextColor } from '../config/GameConfig';
import { StringHelper } from '../helper/StringHelper';
import TimeHelper from '../helper/TimeHelper';
import WebImageHelper from '../helper/WebImageHelper';
import { i18nLabel } from '../i18n/i18nLabel';
import { i18nMgr } from '../i18n/i18nMgr';
import { UIClubModel } from '../uimodel/UIClubModel';
import { WebOrgFriendRoomList, APITexasSituationMushRound, APITexasSituationSquidRound, WWW } from '../net/https/WebRequest';
import ProtocolAgency from '../net/websocket/ProtocolAgency';
import { ProtocolCode } from '../net/websocket/ProtocolCode';
import { ClubCache } from '../frame/data/club/ClubCache';
import { Def } from '../protobuf/holdem/define_pb';
import { ServerMessageLeave } from '../protobuf/holdem/req_th_leave_pb';
import { ClientMessageObservers } from '../protobuf/holdem/req_th_observers_pb';
import { ClientMessagePlayerJackpotSummary, ServerMessagePlayerJackpotSummary } from '../protobuf/holdem/req_th_player_jackpot_summary_pb';
import { ClientMessageRoomers, ServerMessageRoomers } from '../protobuf/holdem/req_th_roomers_pb';
import UIBase from '../ui/UIBase';
import UIComponent from '../ui/UIComponent';
import Main from '../Main';
import { GameCache } from './GameCache';
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
    public bringIn; //带入
    public score; //输赢
    public outChip; //带出
    public isOnline; //是否在线
    public deposit; //押金
    public mushroomCount; //蘑菇数
    public mushroomAmount; //蘑菇额
    public squidInTotal; //鱿鱼入
    public squidOutTotal; //鱿鱼出
    public squidPunishTotal; //鱿鱼惩罚
}

interface SquidOrMushRecord {
    name: string;
    in_num: number;
    in_amount: number;
    out_num: number;
    out_amount: number;
    user_random_id: number;
}

interface JackpotRecord {
    userRid: number;
    name: string;
    avatar: string;
    sex: number;
    contributeTotal: number;
    awardTotal: number;
    royalFlushCount: number;
    straightFlushCount: number;
    fourOfaKindCount: number;
}
type ReportBottomTab = 'battle' | 'insurance' | 'jackpot' | 'mode';

@ccclass
export default class UITexasReportComponent extends UIBase {
    btnShowProblem: cc.Node = null;
    imageMaskClose: cc.Node = null;
    content: cc.Node = null;
    mRoomLeaveTime: any = null;
    IntervalId = null;
    isLoad = true;
    tInfo_0 = [];
    tInfo_1 = [];
    @property(cc.Prefab)
    peopleItem: cc.Prefab = null;
    @property(cc.Prefab)
    dataItem: cc.Prefab = null;
    text_Time: cc.Label = null;
    room_id: cc.Label = null;
    battle_data_content: cc.Node = null;
    squid_data_content: cc.Node = null;
    mush_data_content: cc.Node = null;
    jackpot_data_content: cc.Node = null;
    reportScrow: cc.Node = null;
    squidListView: cc.Node = null;
    mushRoomListView: cc.Node = null;
    jackpotListView: cc.Node = null;
    peopleNode: cc.Node = null;
    peopleScrow: cc.Node = null;
    people_content: cc.Node = null;
    peopelNum: cc.Label = null;
    listBar1: cc.Node = null;
    listBar3: cc.Node = null;
    listBarSquid: cc.Node = null;
    listBarMushRoom: cc.Node = null;
    listBarJackpot: cc.Node = null;
    jackpotBarNode: cc.Node = null;
    jackpotTotalLabel: cc.Label | cc.RichText = null;
    listBar3ModeLabel: cc.Label = null;
    squidRoundText: cc.Label = null;
    pageText: cc.Label = null;
    leftBtn: cc.Node = null;
    rightBtn: cc.Node = null;
    pageInfoNode: cc.Node = null;
    squidRoundNode: cc.Node = null;
    noDataNode: cc.Node = null;
    mushDirNode: cc.Node = null;
    mushDirText: cc.Label = null;
    reportSubType: 'none' | 'mush' | 'squid' = 'none';
    curBottomTab: ReportBottomTab = 'battle';
    bottomToggleRoot: cc.Node = null;
    battleToggleBtn: cc.Node = null;
    baoxianToggleBtn: cc.Node = null;
    jackpotToggleBtn: cc.Node = null;
    squidToggleBtn: cc.Node = null;
    battleCheckmark: cc.Node = null;
    baoxianCheckmark: cc.Node = null;
    jackpotCheckmark: cc.Node = null;
    squidCheckmark: cc.Node = null;
    battleTextNode: cc.Node = null;
    baoxianTextNode: cc.Node = null;
    jackpotTextNode: cc.Node = null;
    squidTextNode: cc.Node = null;
    private squidRoundDic: Map<number, SquidOrMushRecord[]> = new Map();
    private jackpotRecords: JackpotRecord[] = [];
    private squidTotalRound: number = 0;
    private squidCurRound: number = 0;
    private squidStartHand: number = 0;
    private squidEndHand: number = 0;
    private isSquidListInit: boolean = false;
    private isJackpotListInit: boolean = false;
    private manualClose: boolean = false;
    private normalReportY: number = 0;
    private jackpotReportY: number = 0;
    private normalPeopleNodeY: number = 0;
    private normalPeopleScrowY: number = 0;
    private normalNoDataY: number = 0;

    protected lateLoad(): void {
        super.lateLoad();
        this.text_Time = this.getChildNodeOrComponent('Text_Time', cc.Label);
        this.room_id = this.getChildNodeOrComponent('room_id', cc.Label);
        this.reportScrow = cc.find('layer/reportScrow', this.node);
        this.squidListView = cc.find('layer/squidListView', this.node);
        this.mushRoomListView = cc.find('layer/mushRoomListView', this.node);
        this.jackpotListView = cc.find('layer/jackpotListView', this.node);
        this.peopleNode = cc.find('layer/peopleNode', this.node);
        this.peopleScrow = cc.find('layer/peopleScrow', this.node);
        this.battle_data_content = cc.find('layer/reportScrow/view/data_content', this.node);
        this.squid_data_content = cc.find('layer/squidListView/view/data_content', this.node);
        this.mush_data_content = cc.find('layer/mushRoomListView/view/data_content', this.node);
        this.jackpot_data_content = cc.find('layer/jackpotListView/view/data_content', this.node);
        this.people_content = cc.find('layer/peopleScrow/view/people_content', this.node);
        this.peopelNum = cc.find('layer/peopleNode/peopelNum', this.node)?.getComponent(cc.Label) || null;
        this.listBar1 = cc.find('layer/ListBar1', this.node);
        this.listBar3 = cc.find('layer/ListBar3', this.node);
        this.listBarSquid = cc.find('layer/listBarSquid', this.node);
        this.listBarMushRoom = cc.find('layer/listBarMushRoom', this.node);
        this.listBarJackpot = cc.find('layer/listBarJackpot', this.node);
        this.jackpotBarNode = cc.find('layer/JackpotBar', this.node);
        const jackpotNumberNode = cc.find('layer/JackpotBar/JackpotNumber', this.node);
        this.jackpotTotalLabel = jackpotNumberNode.getComponent(cc.Label);
        this.listBar3ModeLabel = cc.find('layer/ListBar3/Text_Mode', this.node)?.getComponent(cc.Label) || null;
        this.squidRoundText = cc.find('layer/squidRound/squidRoundText', this.node)?.getComponent(cc.Label) || null;
        this.pageText = cc.find('layer/squidPageInfo/pageTextNode/pageText', this.node)?.getComponent(cc.Label) || null;
        this.leftBtn = cc.find('layer/squidPageInfo/leftBtn', this.node);
        this.rightBtn = cc.find('layer/squidPageInfo/rightBtn', this.node);
        this.pageInfoNode = cc.find('layer/squidPageInfo', this.node);
        this.squidRoundNode = cc.find('layer/squidRound', this.node);
        this.noDataNode = cc.find('layer/noData', this.node);
        this.mushDirNode = cc.find('layer/mushDir', this.node);
        this.mushDirText = cc.find('layer/mushDir/mushDirText', this.node)?.getComponent(cc.Label) || null;
        this.normalReportY = this.reportScrow ? this.reportScrow.y : 0;
        this.jackpotReportY = this.jackpotListView ? this.jackpotListView.y : this.normalReportY;
        this.normalPeopleNodeY = this.peopleNode ? this.peopleNode.y : 0;
        this.normalPeopleScrowY = this.peopleScrow ? this.peopleScrow.y : 0;
        this.normalNoDataY = this.noDataNode ? this.noDataNode.y : 0;
        const bottomRootPath = 'layer/bottomToggle';
        this.bottomToggleRoot = cc.find(bottomRootPath, this.node);
        this.battleToggleBtn = cc.find(`${bottomRootPath}/battleToggle`, this.node);
        this.baoxianToggleBtn = cc.find(`${bottomRootPath}/baoxianToggle`, this.node);
        this.jackpotToggleBtn = cc.find(`${bottomRootPath}/JackpotToggle`, this.node);
        this.squidToggleBtn = cc.find(`${bottomRootPath}/squidToggle`, this.node);
        this.battleCheckmark = cc.find(`${bottomRootPath}/battleToggle/text/Checkmark`, this.node);
        this.baoxianCheckmark = cc.find(`${bottomRootPath}/baoxianToggle/text/Checkmark`, this.node);
        this.jackpotCheckmark = cc.find(`${bottomRootPath}/JackpotToggle/text/Checkmark`, this.node);
        this.squidCheckmark = cc.find(`${bottomRootPath}/squidToggle/text/Checkmark`, this.node);
        this.battleTextNode = cc.find(`${bottomRootPath}/battleToggle/text`, this.node);
        this.baoxianTextNode = cc.find(`${bottomRootPath}/baoxianToggle/text`, this.node);
        this.jackpotTextNode = cc.find(`${bottomRootPath}/JackpotToggle/text`, this.node);
        this.squidTextNode = cc.find(`${bottomRootPath}/squidToggle/text`, this.node);
    }

    protected regiterTouchEvents(): void {
        super.regiterTouchEvents();
        if (this.battleToggleBtn) this.bindClick(this.battleToggleBtn, () => this.onClickBottomToggle('battle'));
        if (this.squidToggleBtn) this.bindClick(this.squidToggleBtn, () => this.onClickBottomToggle('mode'));
        if (this.baoxianToggleBtn) this.bindClick(this.baoxianToggleBtn, () => this.onClickBottomToggle('insurance'));
        if (this.jackpotToggleBtn) this.bindClick(this.jackpotToggleBtn, () => this.onClickBottomToggle('jackpot'));
        if (this.leftBtn) this.bindClick(this.leftBtn, () => this.onClickPage(false));
        if (this.rightBtn) this.bindClick(this.rightBtn, () => this.onClickPage(true));
    }

    protected regiterDispatchEvent(): void {
        super.regiterDispatchEvent();
        this.listen(ProtocolCode.Protocol_Holdem_Roomers, this.ProtocolHoldemRoomersHandler);
        this.listen(ProtocolCode.Protocol_Holdem_Observers, this.ProtocolHoldemObserverHandler);
        this.listen(ProtocolCode.Protocol_Holdem_PlayerJackpotSummary, this.ProtocolHoldemPlayerJackpotSummaryHandler);
    }

    RequestRoomers() {
        ProtocolAgency.Send<ClientMessageRoomers.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Roomers,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                history: GameCache.Instance.origin_type == 4,
                historyLimit: 1000,
                historyOffset: 0
            }
        });
    }

    RequestObservers() {
        ProtocolAgency.Send<ClientMessageObservers.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_Observers,
            RoomID: GameCache.Instance.room_id,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId: GameCache.Instance.room_id, matchId: GameCache.Instance.match_id },
                // history: GameCache.Instance.origin_type == 4,
                limit: 1000,
                offset: 0
            }
        });
    }

    RequestJackpotSummary() {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return;
        ProtocolAgency.Send<ClientMessagePlayerJackpotSummary.AsObject>({
            Code: ProtocolCode.Protocol_Holdem_PlayerJackpotSummary,
            RoomID: roomId,
            MatchID: GameCache.Instance.match_id,
            Body: {
                room: { roomId, matchId: GameCache.Instance.match_id }
            }
        });
    }

    ProtocolHoldemObserverHandler(response: ServerMessageLeave.AsObject) {
        if (response == null) {
            return;
        }
        if (response.status == 0) {
            this.UpdateObViewList(response);
        }
    }

    ProtocolHoldemRoomersHandler(response: ServerMessageRoomers.AsObject) {
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

    ProtocolHoldemPlayerJackpotSummaryHandler(response: ServerMessagePlayerJackpotSummary.AsObject) {
        const resp: any = response as any;
        if (!resp) return;
        if (Number(resp.status || 0) !== 0) {
            this.jackpotRecords = [];
            this.isJackpotListInit = true;
            if (this.curBottomTab === 'jackpot') {
                this.UpdateJackpotViewList();
            }
            return;
        }
        const players: any[] = (resp.playersList || []) as any[];
        const uniq = new Map<number, JackpotRecord>();
        for (let i = 0; i < players.length; i++) {
            const p = players[i] || {};
            const userRid = Number(p.userRid || 0);
            if (userRid > 0 && uniq.has(userRid)) continue;
            const row: JackpotRecord = {
                userRid,
                name: `${p.name || ''}`,
                avatar: `${p.avatar || ''}`,
                sex: Number(p.sex || 0),
                contributeTotal: Number(p.contributeTotal || 0),
                awardTotal: Number(p.awardTotal || 0),
                royalFlushCount: Number(p.royalFlushCount || 0),
                straightFlushCount: Number(p.straightFlushCount || 0),
                fourOfaKindCount: Number(p.fourOfaKindCount || 0)
            };
            if (userRid > 0) uniq.set(userRid, row);
        }
        const merged: JackpotRecord[] = [];
        uniq.forEach(v => merged.push(v));
        this.jackpotRecords = merged;
        this.isJackpotListInit = true;
        if (this.curBottomTab === 'jackpot') {
            this.UpdateJackpotViewList();
        }
    }

    onShow(param?: any): void {
        super.onShow();
        const keepState = !!param?.__keepState;
        this.manualClose = false;
        if (keepState) {
            this.reportSubType = this.resolveReportSubType();
            this.refreshMushDir();
            this.refreshBottomToggleState();
            this.refreshContentVisible();
            this.refreshListBar();
            this.RefreshJackpotTotalLabel();
            if (this.curBottomTab === 'jackpot' && !this.isJackpotListInit) {
                this.RequestJackpotSummary();
            }
            this.updateNoDataState();
            return;
        }
        this.unscheduleAllCallbacks();
        this.clearView();
        // this.btnShowProblem = this.getChildNodeOrComponent('BtnShowProblem');
        // this.btnShowProblem.on('click', this.btnShowProblemClick, this)
        this.room_id.string = GameCache.Instance.room_id + '-' + GameCache.Instance.CurGame.mHandNum;
        this.text_Time.string = '';
        this.reportSubType = this.resolveReportSubType();
        this.curBottomTab = 'battle';
        this.refreshMushDir();
        this.refreshBottomToggleState();
        this.refreshContentVisible();
        this.refreshListBar();
        this.RefreshJackpotTotalLabel();
        this.SendSquidData(0);
        this.RequestRoomers();
        this.RequestObservers();
    }

    async UpdateViewList(RoomersData: any) {
        //玩家
        this.tInfo_0 = [];
        this.tInfo_1 = [];
        const playersList = RoomersData?.playersList || [];
        this.clearPlayerListContainers();
        for (let i = 0; i < playersList.length; i++) {
            let tSignPlayer = new ReportPlayer();
            tSignPlayer.userId = playersList[i].userRid;
            tSignPlayer.nickName = playersList[i].name;
            tSignPlayer.hand = playersList[i].handNum;
            tSignPlayer.bringIn = playersList[i].bringInTotal;
            tSignPlayer.score = playersList[i].win;
            tSignPlayer.outChip = playersList[i].bringOutTotal;
            tSignPlayer.isOnline = playersList[i].isOnline;
            tSignPlayer.deposit = playersList[i].deposit || 0;
            tSignPlayer.mushroomCount = playersList[i].mushroomCount || 0;
            tSignPlayer.mushroomAmount = playersList[i].mushroomAmount || 0;
            tSignPlayer.squidInTotal = playersList[i].squidInTotal || 0;
            tSignPlayer.squidOutTotal = playersList[i].squidOutTotal || 0;
            tSignPlayer.squidPunishTotal = playersList[i].squidPunishTotal || 0;
            if (playersList[i].status == Def.CanPlayStatus.NORMAL || playersList[i].Status == Def.CanPlayStatus.AGREE_POST) {
                this.tInfo_0.push(tSignPlayer);
            } else {
                this.tInfo_1.push(tSignPlayer);
            }
        }
        this.tInfo_0.sort((x, y) => Number(y.score || 0) - Number(x.score || 0));
        this.tInfo_1.sort((x, y) => Number(y.score || 0) - Number(x.score || 0));
        this.refreshCurrentDataList();
        if (GameCache.Instance.origin_type == 4) {
            let result: any = await UIClubModel.mInstance.WebOrgFriendRoomList(false).catch(content => {
                console.log(`>> catch error:${WebOrgFriendRoomList.API}`, content);
            });
            if (!result) return;
            let data: any = WebOrgFriendRoomList.Response.data;
            data.records.forEach(item => {
                if (item.rid == GameCache.Instance.room_id) {
                    if (item.start_time == null) {
                        return;
                    }
                    let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time);
                    let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000;
                    if (roomLeftTime > 0) {
                        this.mRoomLeaveTime = roomLeftTime;
                        let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.Label);
                        textTitle.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
                        this.ShowLeaveTimer();
                    }
                }
            });
        } else {
            // let parms = {
            //     name: "",
            //     ante_min: 0,
            //     ante_max: 0,
            //     sb_min: 10,
            //     sb_max: 100000,
            //     tribe_id: 0,
            //     start_time_s: 0,
            //     start_time_e: 0,
            //     enter_time_s: 0,
            //     enter_time_e: 0,
            //     game_type: [],
            //     poker_type: [0, 2],
            //     limit_bet_type: [],
            //     order: ["sb_asc"],
            // }
            // UIClubModel.mInstance.WebOrgClubRoom(parms).then((roomsInfoData: any) => {
            //     roomsInfoData.data.records.forEach(item => {
            //         if (item.rid == GameCache.Instance.room_id) {
            //             if (item.start_time == null) {
            //                 return;
            //             }
            //             let deadLineTime = TimeHelper.RFC3339TimeConvertToUTCTime(item.start_time)
            //             let roomLeftTime = deadLineTime / 1000 + item.play_duration - new Date().getTime() / 1000
            //             if (roomLeftTime > 0) {
            //                 this.mRoomLeaveTime = roomLeftTime;
            //                 let textTitle = this.getChildNodeOrComponent('Text_Time').getComponent(cc.Label);
            //                 textTitle.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
            //                 this.ShowLeaveTimer();
            //             }
            //         }
            //     })
            // })
        }
    }

    async UpdateObViewList(RoomersData: any) {
        if (!RoomersData || !RoomersData.observersList) {
            if (this.people_content) this.people_content.removeAllChildren();
            if (this.peopelNum) this.peopelNum.string = '0';
            return;
        }
        if (!this.people_content || !this.peopelNum) return;
        this.people_content.removeAllChildren();
        this.peopelNum.string = `${RoomersData.observersList.length}`;
        for (let index = 0; index < RoomersData.observersList.length; index++) {
            let tItem: cc.Node = cc.instantiate(this.peopleItem);
            tItem.parent = this.people_content;
            let nick_name = StringHelper.LengthNick(RoomersData.observersList[index].name);
            let nameLbl = tItem.getChildByName('Text_Name').getComponent(cc.Label);
            nameLbl.string = nick_name;
            let icon = tItem.getChildByName('icon');
            WebImageHelper.SetHeadImage(icon.getComponent(cc.Sprite), RoomersData.observersList[index].avatar);
            const uid = RoomersData.observersList[index].userRid;
            if (!RoomersData.observersList[index].isOnline && GameCache.Instance.origin_type == 4) {
                tItem.opacity = 50;
            } else {
                tItem.opacity = 255;
            }
            this.bindClick(tItem, () => {
                UIComponent.open(UIDefine.UITexasReportPlayerInfo, [uid, false, null]);
            });
        }
    }

    ShowLeaveTimer() {
        this.schedule(() => {
            if (this.mRoomLeaveTime >= 0 && this.node.isValid) {
                this.mRoomLeaveTime--;
                if (this.text_Time != null) this.text_Time.string = TimeHelper.ShowRemainingSemicolon2(this.mRoomLeaveTime);
            } else {
                if (this.text_Time != null && !cc.isValid(this.node, true)) {
                    this.text_Time.string = '00:00';
                }
            }
        }, 1);
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
            ele.opacity = 50;
        } else {
            ele.opacity = 255;
        }
        ele.getChildByName('Text_Name').getComponent(cc.Label).string = StringHelper.LengthNick(pDto.nickName);
        ele.getChildByName('Text_Num').getComponent(cc.Label).string = pDto.hand + '';
        ele.getChildByName('Text_All').getComponent(cc.Label).string = StringHelper.GetLongString(pDto.bringIn);
        let outChip = pDto.outChip != 0 ? StringHelper.GetLongString(pDto.outChip) : 0;
        ele.getChildByName('Text_All1').getComponent(cc.Label).string = '(' + outChip + ')';
        this.setCountText(ele.getChildByName('Text_Count'), pDto.score);
        if (useInfo3) {
            const depositLabel = ele.getChildByName('Text_Deposit')?.getComponent(cc.Label);
            if (depositLabel) depositLabel.string = StringHelper.GetLongString(pDto.deposit || 0);
            this.applyMushSquidInfo(ele, subType, pDto);
        }
        ele.getChildByName('own').active = pDto.userId == GameCache.Instance.nUserId;
    }

    btnShowProblemClick() {
        this.manualClose = true;
        GameCache.Instance.CurGame?.SetReportKeepOpen?.(false);
        UIComponent.close(this.UIDefine);
        UIComponent.open(UIDefine.UITexasRule, null, { parentUI: this.node.parent });
    }

    imageMaskCloseClick() {
        this.unscheduleAllCallbacks();
        this.manualClose = true;
        GameCache.Instance.CurGame?.SetReportKeepOpen?.(false);
        UIComponent.close(this.UIDefine);
    }

    onClose(param?: any): void {
        super.onClose(param);
        const game: any = GameCache.Instance.CurGame;
        const shouldRestore = !this.manualClose && !!game && !game.IsDispose && !!game.IsReportKeepOpen?.();
        this.manualClose = false;
        if (!shouldRestore) return;
        setTimeout(() => {
            if (!cc.isValid(this.node)) return;
            UIComponent.open(UIDefine.UITexasReportComponent, { __keepState: true }, { parentUI: Main.Dialog });
        }, 0);
    }

    private clearView(): void {
        this.tInfo_0 = [];
        this.tInfo_1 = [];
        this.squidRoundDic.clear();
        this.jackpotRecords = [];
        this.squidTotalRound = 0;
        this.squidCurRound = 0;
        this.squidStartHand = 0;
        this.squidEndHand = 0;
        this.isSquidListInit = false;
        this.isJackpotListInit = false;
        this.clearPlayerListContainers();
        if (this.people_content) this.people_content.removeAllChildren();
        if (this.peopelNum) this.peopelNum.string = '0';
        this.updateNoDataState();
        this.UpdatePageTxt();
    }

    private refreshListBar(): void {
        const subType = this.reportSubType;
        if (this.listBar1) this.listBar1.active = false;
        if (this.listBar3) this.listBar3.active = false;
        if (this.listBarSquid) this.listBarSquid.active = false;
        if (this.listBarMushRoom) this.listBarMushRoom.active = false;
        if (this.listBarJackpot) this.listBarJackpot.active = false;
        if (this.curBottomTab === 'battle') {
            const useBar3 = subType !== 'none';
            if (this.listBar1) this.listBar1.active = !useBar3;
            if (this.listBar3) this.listBar3.active = useBar3;
        } else if (this.curBottomTab === 'mode') {
            if (subType === 'squid' && this.listBarSquid) this.listBarSquid.active = true;
            if (subType === 'mush' && this.listBarMushRoom) this.listBarMushRoom.active = true;
        } else if (this.curBottomTab === 'jackpot') {
            if (this.listBarJackpot) {
                this.listBarJackpot.active = true;
            } else if (this.listBar1) {
                this.listBar1.active = true;
            }
        }
        if (this.listBar3ModeLabel) {
            this.listBar3ModeLabel.string = subType === 'squid' ? i18nMgr.Get('UISquid') : i18nMgr.Get('UIMush');
        }
    }

    private onClickBottomToggle(tab: ReportBottomTab): void {
        this.reportSubType = this.resolveReportSubType();
        if (tab === 'insurance') {
            return;
        }
        if (tab === 'mode' && this.reportSubType === 'none') {
            return;
        }
        if (tab === 'jackpot' && !this.isJackpotEnabled()) {
            return;
        }
        if (this.curBottomTab === tab) {
            return;
        }
        this.curBottomTab = tab;
        this.refreshBottomToggleState();
        this.refreshContentVisible();
        this.refreshListBar();
        this.refreshCurrentDataList();
        if (this.curBottomTab === 'mode' && this.getCurrentSquidRecords().length <= 0) {
            this.SendSquidData(this.squidCurRound || 0);
            return;
        }
        if (this.curBottomTab === 'jackpot') {
            this.RequestJackpotSummary();
            this.RequestObservers();
        }
    }

    private refreshBottomToggleState(): void {
        this.reportSubType = this.resolveReportSubType();
        this.refreshMushDir();
        const showModeToggle = this.reportSubType !== 'none';
        const showJackpotToggle = this.isJackpotEnabled();
        const showBottomToggle = showModeToggle || showJackpotToggle;
        this.refreshModeToggleTitle();
        if (this.bottomToggleRoot) this.bottomToggleRoot.active = showBottomToggle;
        if (this.battleToggleBtn) this.battleToggleBtn.active = showBottomToggle;
        if (this.squidToggleBtn) this.squidToggleBtn.active = showModeToggle;
        if (this.baoxianToggleBtn) this.baoxianToggleBtn.active = false;
        if (this.jackpotToggleBtn) this.jackpotToggleBtn.active = showJackpotToggle;
        if (!showBottomToggle) {
            this.curBottomTab = 'battle';
        } else if (this.curBottomTab === 'mode' && !showModeToggle) {
            this.curBottomTab = 'battle';
        } else if (this.curBottomTab === 'jackpot' && !showJackpotToggle) {
            this.curBottomTab = showModeToggle ? 'mode' : 'battle';
        }
        if (this.battleCheckmark) this.battleCheckmark.active = showBottomToggle && this.curBottomTab === 'battle';
        if (this.baoxianCheckmark) this.baoxianCheckmark.active = false;
        if (this.jackpotCheckmark) this.jackpotCheckmark.active = showJackpotToggle && this.curBottomTab === 'jackpot';
        if (this.squidCheckmark) this.squidCheckmark.active = showModeToggle && this.curBottomTab === 'mode';
        this.setToggleTextColor(this.battleTextNode, showBottomToggle && this.curBottomTab === 'battle');
        this.setToggleTextColor(this.baoxianTextNode, false);
        this.setToggleTextColor(this.jackpotTextNode, showJackpotToggle && this.curBottomTab === 'jackpot');
        this.setToggleTextColor(this.squidTextNode, showModeToggle && this.curBottomTab === 'mode');
    }

    private refreshModeToggleTitle(): void {
        if (!this.squidTextNode) return;
        const key = this.reportSubType === 'mush' ? 'UITexasReport_MushRoomRecord' : 'UITexasReport_SquidRecord';
        const i18nComp = this.squidTextNode.getComponent(i18nLabel);
        if (i18nComp) {
            i18nComp.i18NString = key;
            return;
        }
        const label = this.squidTextNode.getComponent(cc.Label);
        if (label) {
            label.string = i18nMgr.Get(key);
        }
    }

    private refreshContentVisible(): void {
        const isBattle = this.curBottomTab === 'battle';
        const isJackpot = this.curBottomTab === 'jackpot';
        const isMode = this.curBottomTab === 'mode';
        if (this.reportScrow) this.reportScrow.active = isBattle;
        if (this.jackpotListView) this.jackpotListView.active = isJackpot;
        if (this.jackpotBarNode) this.jackpotBarNode.active = isJackpot;
        if (this.squidListView) this.squidListView.active = isMode && this.reportSubType === 'squid';
        if (this.mushRoomListView) this.mushRoomListView.active = isMode && this.reportSubType === 'mush';
        const showPage = isMode && this.squidTotalRound > 0;
        if (this.pageInfoNode) this.pageInfoNode.active = showPage;
        if (this.squidRoundNode) this.squidRoundNode.active = showPage;
        this.refreshBottomAreaOffset();
        if (isJackpot) this.RefreshJackpotTotalLabel();
        this.updateNoDataState();
    }

    private refreshBottomAreaOffset(): void {
        const isJackpot = this.curBottomTab === 'jackpot';
        const deltaY = isJackpot ? this.jackpotReportY - this.normalReportY : 0;
        if (this.peopleNode) this.peopleNode.y = this.normalPeopleNodeY + deltaY;
        if (this.peopleScrow) this.peopleScrow.y = this.normalPeopleScrowY + deltaY;
        if (this.noDataNode) this.noDataNode.y = this.normalNoDataY + deltaY;
    }

    private refreshCurrentDataList(): void {
        if (this.curBottomTab === 'mode') {
            this.UpdateSquidViewList();
            return;
        }
        if (this.curBottomTab === 'jackpot') {
            this.UpdateJackpotViewList();
            return;
        }
        const content = this.getCurrentDataContent();
        if (!content) {
            return;
        }
        content.removeAllChildren();
        for (let index = 0; index < this.tInfo_0.length; index++) {
            const element: cc.Node = cc.instantiate(this.dataItem);
            element.parent = content;
            this.setInfos(element, this.tInfo_0[index], true);
        }
        for (let index = 0; index < this.tInfo_1.length; index++) {
            const element: cc.Node = cc.instantiate(this.dataItem);
            element.parent = content;
            this.setInfos(element, this.tInfo_1[index], false);
        }
    }

    private getCurrentDataContent(): cc.Node {
        if (this.curBottomTab === 'battle') {
            return this.battle_data_content;
        }
        if (this.curBottomTab === 'jackpot') {
            return this.jackpot_data_content;
        }
        if (this.reportSubType === 'squid') {
            return this.squid_data_content;
        }
        if (this.reportSubType === 'mush') {
            return this.mush_data_content;
        }
        return this.battle_data_content;
    }

    private clearPlayerListContainers(): void {
        if (this.battle_data_content) this.battle_data_content.removeAllChildren();
        if (this.squid_data_content) this.squid_data_content.removeAllChildren();
        if (this.mush_data_content) this.mush_data_content.removeAllChildren();
        if (this.jackpot_data_content) this.jackpot_data_content.removeAllChildren();
    }

    private getCurrentSquidRecords(): SquidOrMushRecord[] {
        if (this.squidCurRound > 0 && this.squidRoundDic.has(this.squidCurRound)) {
            return this.squidRoundDic.get(this.squidCurRound) || [];
        }
        return [];
    }

    private onClickPage(next: boolean): void {
        if (this.squidCurRound <= 0) this.squidCurRound = this.squidTotalRound;
        this.squidCurRound = next ? this.squidCurRound + 1 : this.squidCurRound - 1;
        if (this.squidCurRound > this.squidTotalRound) this.squidCurRound = 1;
        if (this.squidCurRound < 1) this.squidCurRound = this.squidTotalRound;
        if (this.squidRoundDic.has(this.squidCurRound)) {
            this.UpdatePageTxt();
            this.UpdateSquidViewList();
        } else {
            this.SendSquidData(this.squidCurRound);
        }
    }

    private SendSquidData(round: number): void {
        const roomId = Number(GameCache.Instance.room_id || 0);
        if (roomId <= 0) return;
        const subType = this.resolveModeRequestSubType();
        if (!subType) return;
        const web_class = subType === 'mush' ? APITexasSituationMushRound : APITexasSituationSquidRound;
        WWW.Instance.CommonAPI({
            web_class,
            api_id: roomId,
            club_id: ClubCache.club_id,
            body: { round },
            juhua: false
        }).then(
            (response: any) => {
                this.InitSquidViewList(response);
            },
            () => {
                this.updateNoDataState();
            }
        );
    }

    private resolveModeRequestSubType(): 'mush' | 'squid' | null {
        const resolved = this.resolveReportSubType();
        if (resolved === 'mush' || resolved === 'squid') return resolved;
        const curGame: any = GameCache.Instance.CurGame;
        const mushOn =
            Number(curGame?.mushroomPool || 0) > 0 ||
            !!curGame?.mushroomEnabled ||
            Number(GameCache.Instance.room_mushroom_mode || 0) > 0 ||
            Number(GameCache.Instance.room_mushroom_base || 0) > 0;
        if (mushOn) return 'mush';
        const squidOn =
            Number(curGame?.squidPool || 0) > 0 ||
            !!curGame?.isGameInSquidRound ||
            !!curGame?.squidEnabled ||
            Number(GameCache.Instance.room_squid_on || 0) > 0 ||
            Number(GameCache.Instance.room_squid_base || 0) > 0 ||
            Number(GameCache.Instance.room_squid_sub_base || 0) > 0;
        if (squidOn) return 'squid';
        return null;
    }

    private InitSquidViewList(response: any): void {
        const data = response?.data;
        if (!data) {
            this.updateNoDataState();
            return;
        }
        const total = Number(data.total || 0);
        const round = Number(data.round || 0);
        const records: SquidOrMushRecord[] = (data.records || []) as SquidOrMushRecord[];
        this.squidTotalRound = total;
        this.squidStartHand = Number(data.start_hand || 0);
        this.squidEndHand = Number(data.end_hand || 0);
        if (this.squidCurRound === 0) {
            this.squidCurRound = total > 0 ? total : round > 0 ? round : 1;
        } else if (round > 0) {
            this.squidCurRound = round;
        }
        const saveRound = this.squidCurRound > 0 ? this.squidCurRound : 1;
        this.squidRoundDic.set(saveRound, records);
        this.UpdatePageTxt();
        this.UpdateSquidViewList();
    }

    private UpdateSquidViewList(): void {
        if (this.curBottomTab !== 'mode') return;
        const content = this.getCurrentDataContent();
        if (!content) return;
        const records = this.getCurrentSquidRecords();
        if (records.length <= 0 && this.squidTotalRound <= 0) {
            if (!this.isSquidListInit) {
                this.SendSquidData(0);
            }
            this.isSquidListInit = true;
            this.updateNoDataState();
            content.removeAllChildren();
            return;
        }
        if (records.length <= 0 && this.squidTotalRound > 0) {
            this.SendSquidData(this.squidCurRound || 1);
            this.updateNoDataState();
            content.removeAllChildren();
            return;
        }
        this.isSquidListInit = true;
        content.removeAllChildren();
        for (let index = 0; index < records.length; index++) {
            const item = this.OnGetSquidItemByIndex(index, records);
            if (item) {
                item.parent = content;
            }
        }
        this.updateNoDataState();
    }

    private OnGetSquidItemByIndex(index: number, records: SquidOrMushRecord[]): cc.Node {
        if (index < 0 || index >= records.length) {
            return null;
        }
        const dto = records[index];
        if (!dto) {
            return null;
        }
        const item: cc.Node = cc.instantiate(this.dataItem);
        const itemInfo1 = item.getChildByName('item_info1');
        const itemInfo3 = item.getChildByName('item_info3');
        const squidNode = item.getChildByName('room_scrollview_sqiud');
        const mushNode = item.getChildByName('room_scrollview_mushRoom');
        if (itemInfo1) itemInfo1.active = false;
        if (itemInfo3) itemInfo3.active = false;
        if (squidNode) squidNode.active = this.reportSubType === 'squid';
        if (mushNode) mushNode.active = this.reportSubType === 'mush';
        if (this.reportSubType === 'squid') {
            this.SetSquidItemInfo(squidNode, dto);
        } else {
            this.SetMushRoomItemInfo(mushNode, dto);
        }
        return item;
    }

    private SetSquidItemInfo(node: cc.Node, dto: SquidOrMushRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const squidTxtNode = node.getChildByName('Text_Squid');
        const coinTxtNode = node.getChildByName('SelfGo');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        if (squidTxtNode) {
            const rich = squidTxtNode.getComponent(cc.RichText);
            const label = squidTxtNode.getComponent(cc.Label);
            const text = `${Number(dto.in_num || 0)}`;
            if (rich) rich.string = text;
            if (label) label.string = text;
        }
        const amount = Number(dto.in_amount || 0) !== 0 ? Number(dto.in_amount || 0) : -Math.abs(Number(dto.out_amount || 0));
        this.setSignedText(coinTxtNode, amount);
        if (ownNode) ownNode.active = this.isMySquidRecord(dto);
    }

    private SetMushRoomItemInfo(node: cc.Node, dto: SquidOrMushRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const inMushTxt = node.getChildByName('in_mush')?.getComponent(cc.Label);
        const inCoinTxtNode = node.getChildByName('in_coin');
        const outMushTxt = node.getChildByName('out_mush')?.getComponent(cc.Label);
        const outCoinTxtNode = node.getChildByName('out_coin');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        if (outMushTxt) outMushTxt.string = `${Number(dto.out_num || 0)}`;
        if (inMushTxt) inMushTxt.string = Number(dto.in_num || 0) !== 0 ? `${Number(dto.in_num || 0)}` : '-';
        if (Number(dto.in_amount || 0) !== 0) {
            this.setSignedText(inCoinTxtNode, Number(dto.in_amount || 0));
        } else {
            this.setSignedText(inCoinTxtNode, null, '-');
        }
        this.setSignedText(outCoinTxtNode, Number(dto.out_amount || 0));
        if (ownNode) ownNode.active = this.isMySquidRecord(dto);
    }

    private isMySquidRecord(dto: SquidOrMushRecord): boolean {
        const myId = Number(GameCache.Instance.nUserId || 0);
        const myName = `${GameCache.Instance.nick || ''}`;
        const gameAny: any = GameCache.Instance.CurGame;
        const mainName = `${gameAny?.mainPlayer?.nickName || ''}`;
        return (myId > 0 && Number(dto.user_random_id || 0) === myId) || (!!dto.name && (dto.name === myName || dto.name === mainName));
    }

    private UpdatePageTxt(): void {
        const hasData = this.squidTotalRound > 0;
        if (this.pageText) {
            const curRound = this.squidCurRound > 0 ? this.squidCurRound : 0;
            this.pageText.string = `${curRound}/${this.squidTotalRound}`;
        }
        const roundDesc = hasData ? this.formatRoundDesc(this.squidCurRound, this.squidStartHand, this.squidEndHand) : '';
        if (this.squidRoundText) this.squidRoundText.string = roundDesc;
        if (this.pageInfoNode) this.pageInfoNode.active = this.curBottomTab === 'mode' && hasData;
        if (this.squidRoundNode) this.squidRoundNode.active = this.curBottomTab === 'mode' && hasData;
    }

    private formatRoundDesc(round: number, startHand: number, endHand: number): string {
        const template = i18nMgr.Get('UITexasReport_WhichRound');
        return template
            .replace('{0}', `${round || 0}`)
            .replace('{1}', `${startHand || 0}`)
            .replace('{2}', `${endHand || 0}`);
    }

    private updateNoDataState(): void {
        const isMode = this.curBottomTab === 'mode';
        const isJackpot = this.curBottomTab === 'jackpot';
        const noData = isMode ? this.getCurrentSquidRecords().length <= 0 : isJackpot ? this.jackpotRecords.length <= 0 : false;
        if (this.noDataNode) this.noDataNode.active = (isMode || isJackpot) && noData;
    }

    private isJackpotEnabled(): boolean {
        const curGame: any = GameCache.Instance.CurGame;
        return Number(curGame?.jackpot || GameCache.Instance.jackPot_on || 0) === 1;
    }

    private RefreshJackpotTotalLabel(): void {
        const total = Math.floor(Number(GameCache.Instance.jackPot_parent_gold || 0) / 100);
        this.jackpotTotalLabel.string = `${total}`;
    }

    private UpdateJackpotViewList(): void {
        const content = this.jackpot_data_content;
        if (!content) return;
        content.removeAllChildren();
        if (this.jackpotRecords.length <= 0) {
            this.updateNoDataState();
            return;
        }
        for (let i = 0; i < this.jackpotRecords.length; i++) {
            const item = this.OnGetJackpotItemByIndex(i);
            if (item) item.parent = content;
        }
        this.updateNoDataState();
    }

    private OnGetJackpotItemByIndex(index: number): cc.Node {
        if (index < 0 || index >= this.jackpotRecords.length) return null;
        const dto = this.jackpotRecords[index];
        if (!dto) return null;
        const item: cc.Node = cc.instantiate(this.dataItem);
        const itemInfo1 = item.getChildByName('item_info1');
        const itemInfo3 = item.getChildByName('item_info3');
        const squidNode = item.getChildByName('room_scrollview_sqiud');
        const mushNode = item.getChildByName('room_scrollview_mushRoom');
        const jackpotNode = item.getChildByName('room_scrollview_jackpot');
        if (itemInfo1) itemInfo1.active = !jackpotNode;
        if (itemInfo3) itemInfo3.active = false;
        if (squidNode) squidNode.active = false;
        if (mushNode) mushNode.active = false;
        if (jackpotNode) jackpotNode.active = true;
        if (jackpotNode) {
            this.SetJackpotItemInfo(jackpotNode, dto);
        }
        return item;
    }

    private SetJackpotItemInfo(node: cc.Node, dto: JackpotRecord): void {
        if (!node || !dto) return;
        const nameTxt = node.getChildByName('Text_Name')?.getComponent(cc.Label);
        const numTxt = node.getChildByName('Text_Num')?.getComponent(cc.Label);
        const allTxtNode = node.getChildByName('Text_All');
        const cardTxtNode = node.getChildByName('Text_Card');
        const ownNode = node.getChildByName('own');
        if (nameTxt) nameTxt.string = StringHelper.LengthNick(dto.name || '', 20);
        if (numTxt) numTxt.string = StringHelper.GetLongString(dto.contributeTotal || 0);
        this.setSignedText(allTxtNode, Number(dto.awardTotal || 0));
        this.setCardText(cardTxtNode, this.GetJackpotCardDesc(dto));
        if (ownNode) ownNode.active = Number(dto.userRid || 0) === Number(GameCache.Instance.nUserId || 0);
    }

    private setCardText(node: cc.Node, text: string): void {
        if (!node) return;
        const rich = node.getComponent(cc.RichText);
        if (rich) {
            rich.string = text || '';
            return;
        }
        const label = node.getComponent(cc.Label);
        if (label) {
            label.string = text || '';
        }
    }

    private GetJackpotCardDesc(dto: JackpotRecord): string {
        const list: string[] = [];
        if (Number(dto.royalFlushCount || 0) > 0) {
            list.push(i18nMgr.Get('UIJackPotInfo_huangjia'));
        }
        if (Number(dto.straightFlushCount || 0) > 0) {
            list.push(i18nMgr.Get('UIJackPotInfo_tonghuashun'));
        }
        if (Number(dto.fourOfaKindCount || 0) > 0) {
            list.push(i18nMgr.Get('UIJackPotInfo_shitiao'));
        }
        return list.join('\n');
    }

    private refreshMushDir(): void {
        const isMush = this.reportSubType === 'mush';
        if (this.mushDirNode) this.mushDirNode.active = isMush;
        if (!isMush) return;
        const curGame: any = GameCache.Instance.CurGame;
        const base = Number(curGame?.mushroomBase || GameCache.Instance.room_mushroom_base || 0);
        if (this.mushDirText) {
            const template = i18nMgr.Get('UIMushYaJinDir');
            this.mushDirText.string = StringHelper.Format(template, [StringHelper.GetLongString(base)]);
        }
    }

    private setToggleTextColor(node: cc.Node, selected: boolean): void {
        if (!node) return;
        node.color = cc.Color.BLACK.fromHEX(selected ? '#EEF5FF' : '#757CAB');
    }

    private setCountText(node: cc.Node, score: number): void {
        if (!node) return;
        const text = StringHelper.GetLongString(score);
        const color = score > 0 ? TextColor.Color6 : score < 0 ? TextColor.Color5 : '#FFFFFF';
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
        const mushOn =
            !!curGame?.mushroomEnabled ||
            (curGame?.mushroomBase || 0) > 0 ||
            (GameCache.Instance.room_mushroom_mode || 0) > 0 ||
            (GameCache.Instance.room_mushroom_base || 0) > 0;
        if (mushOn) return 'mush';
        const squidOn =
            !!curGame?.squidEnabled ||
            !!curGame?.isGameInSquidRound ||
            (curGame?.squidBase || 0) > 0 ||
            (GameCache.Instance.room_squid_on || 0) > 0 ||
            (GameCache.Instance.room_squid_base || 0) > 0 ||
            (GameCache.Instance.room_squid_sub_base || 0) > 0;
        if (squidOn) return 'squid';
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
                if (mushNum) mushNum.string = '+' + StringHelper.FormatToString('{0:N0}', pDto.mushroomCount || 0);
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

    private setSignedText(node: cc.Node, value: number | null, emptyText: string = null): void {
        if (!node) return;
        if (value == null) {
            const rich = node.getComponent(cc.RichText);
            const label = node.getComponent(cc.Label);
            if (rich) rich.string = emptyText || '';
            if (label) label.string = emptyText || '';
            return;
        }
        const text = StringHelper.GetSignedLongString(value);
        const color = value > 0 ? TextColor.Color6 : value < 0 ? TextColor.Color5 : '#FFFFFF';
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
