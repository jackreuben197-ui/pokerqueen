import { ProcedureEnum } from "../../define/EIDefine";
import { ClubCache } from "../../frame/data/club/ClubCache";
import { GameCache } from "../../game/GameCache";
import { StringHelper } from "../../helper/StringHelper";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import { ResManager } from "../../manager/ResManager";
import HttpRequest from "../../net/https/HttpRequest";
import { APIClubJoinList, APIClubQuitList, APIClubStandings, APIDeleleUser, APIFriendApplyList, APIIsPhoneUser, APILockUser, APIMsgMessageList, APIOrgClubGold, APITicketCreate, APIUnlockUser, API_BAG_CURRENT_PENDANT_LIST, API_BAG_PANDANT_DOWN, API_BAG_PANDANT_UP, API_BAG_PENDANT_LIST, API_CLUB_APPLY_AUDIT, API_CLUB_APPLY_LIST, API_CLUB_USER_WALLET, API_DEL_MSG_TEMPLATE, API_GET_MSG_LIST, API_GOLD_CHANGE_LOG, API_PROP_TASK_LIST, API_PROP_TASK_RECEIVE, API_SEND_MSG, API_SET_MSG_TEMPLATE, WEB2_data_stat_person, Web_Config_Multi_Language_Template, Web_Misc_Banner_List, Web_Misc_Game_Record_Round, Web_Misc_Game_Remove_Round, Web_Misc_Game_Round_List, Web_Misc_Game_Round_Status, Web_Other_User_Info, Web_Prop_User_Prop_List, Web_Room_Center_Groups, Web_Room_Center_History_Hand, Web_Room_Center_History_List, Web_Room_Center_History_Replay, Web_Room_Center_Mtt_Details, Web_Room_Center_Rooms, Web_Room_Center_Rooms_Blinds, Web_Stats_Room_Detail, Web_Stats_User_Stats, Web_User_Check_Nickname, Web_User_Modify_User_Info } from "../../net/https/WebRequest";
import LobbySession from "../../session/LobbySession";
import UIBase from "../../ui/UIBase";

/**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ꧁༺ ༒ ༻꧂≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
    大厅逻辑控制器
        1.大厅数据（全局）
        2.UI处理
        3.网络交互
 ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈ ༺༒༻ ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/


export class LobbyControl {
    /********************************* 1.大厅数据（全局） ***********************************/
    /** 当前大厅中间显示的UI */
    private curShowUI;
    /** 存放中间显示ui 已经加载过存储 没有存储的需要动态加载 */
    private uiMap = {};
    /** ui父节点 创建出来的中间预制体需要挂在此节点上 */
    private Layer;

    private LocalDicRoomName: Map<string, { [key: string]: string }> = new Map();


    /********************************* 2.UI处理 ***********************************/

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        2.1 设置大厅数据 存放控制器
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    setLobbyInfo(param) {
        //this.curShowUI = param.curShowUI;
        this.Layer = param.Layer;
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        2.2 点击主界面下方4个按钮 切换中间不同显示
            name: UILobby UIChat UICareer UIMine
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    public async switchContent(name: string, resPath: string = "main/lobby/prefab/") {

        if (this.curShowUI && name === this.curShowUI.name) {
            return;
        }

        return new Promise((resolve, reject) => {
            let newUI = this.uiMap[name];
            if (newUI) {
                if (this.curShowUI) this.curShowUI.active = false;
                newUI.active = true;
                this.curShowUI = newUI;
                this.curShowUI.getComponent(UIBase)?.onShow();
                resolve(newUI);
            } else {
                ResManager.Load(null, resPath + name, cc.Prefab, (err, asset: cc.Prefab) => {
                    if (err) {
                        return;
                    }
                    if (this.curShowUI) this.curShowUI.active = false;
                    newUI = cc.instantiate(asset);
                    this.Layer.addChild(newUI);
                    this.curShowUI = newUI;
                    this.uiMap[name] = newUI;
                    newUI.active = true;
                    this.curShowUI.getComponent(UIBase)?.onShow();
                    resolve(newUI);
                });
            }
        })
    }

    /********************************* 3.网络交互 ***********************************/

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        3.1 请求banner数据
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    async GetBannerList(param: typeof Web_Misc_Banner_List.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Banner_List,
                body: Web_Misc_Banner_List.Request(
                    {
                        lang: param.lang,               // 语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
                        type: param.type,               // 1-大厅Banner,2-发现页(公会)Banner
                        limit: param.limit,             // unity 默认10
                        offset: param.offset,           // 开始下标。例子（offset=0，limit=10，0-9。)默认0
                    }),
                onSuccess: function () {
                    resolve(Web_Misc_Banner_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * @description: 请求房间列表统计信息
     * @return {Web_Room_Center_Groups.Response}
     */
    async RequestListSummary(param: typeof Web_Room_Center_Groups.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Groups,
                body: Web_Room_Center_Groups.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Groups.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
    * @description: 请求mang信息
    * @return {Web_Room_Center_Rooms_Blinds.Response}
    */
    async RequestSbList(param: typeof Web_Room_Center_Rooms_Blinds.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_Rooms_Blinds,
                body: Web_Room_Center_Rooms_Blinds.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Rooms_Blinds.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * @description: 请求rooms信息
     * @return {Web_Room_Center_Rooms.Response}
     */
    // async APIWebRoomCenterRooms(param: typeof Web_Room_Center_Rooms.RequestParams) {
    //     return new Promise((resolve, reject) => {
    //         HttpRequest.Send({
    //             request: Web_Room_Center_Rooms,
    //             body: Web_Room_Center_Rooms.Request(param),
    //             onSuccess: function () {
    //                 resolve(Web_Room_Center_Rooms.Response);
    //             }.bind(this),
    //             onFailure: function (content) {
    //                 reject(content);
    //             }.bind(this)
    //         });
    //     });
    // }
    /**
    * @description: 请求rooms信息
    * @return {Web_Config_Multi_Language_Template.Response}
    */
    async APIConfig_Multi_Language_Template(param: typeof Web_Config_Multi_Language_Template.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Config_Multi_Language_Template,
                body: Web_Config_Multi_Language_Template.Request(param),
                onSuccess: function () {
                    resolve(Web_Config_Multi_Language_Template.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 验证用户昵称
     */
    async CheckNickName(param: typeof Web_User_Check_Nickname.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Check_Nickname,
                body: Web_User_Check_Nickname.Request(param),
                onSuccess: function () {
                    resolve(Web_User_Check_Nickname.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 修改个人信息
     */
    async fixUserInfo(param: typeof Web_User_Modify_User_Info.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_User_Modify_User_Info,
                body: Web_User_Modify_User_Info.Request(param),
                onSuccess: function () {
                    resolve(Web_User_Modify_User_Info.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 获取战绩数据 int group_by, int match_id, int limit, int offset, int type, sbyte game_type,
     */
    async getHistoryInfo(param: typeof Web_Room_Center_History_List.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_History_List,
                body: Web_Room_Center_History_List.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_History_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 查询他人统计数据 - 【数据统计模块】
     */
    async getPersionInfo(param: typeof WEB2_data_stat_person.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WEB2_data_stat_person,
                body: WEB2_data_stat_person.Request(param),
                onSuccess: function () {
                    resolve(WEB2_data_stat_person.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 战绩7，30,生涯数据(MTT,Room)
     */
    async getUserStatsInfo(param: typeof Web_Stats_User_Stats.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Stats_User_Stats,
                body: Web_Stats_User_Stats.Request(param),
                onSuccess: function () {
                    resolve(Web_Stats_User_Stats.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 战绩详情  
     */
    async getRecordDetailInfo(roomId, param: typeof Web_Stats_Room_Detail.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_Stats_Room_Detail.API.replace("{id}", roomId.toString()),
                request: Web_Stats_Room_Detail,
                body: Web_Stats_Room_Detail.Request(param),
                onSuccess: function () {
                    resolve(Web_Stats_Room_Detail.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 手数列表  
     */
    async getRecordHandInfo(param: typeof Web_Room_Center_History_Hand.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Room_Center_History_Hand,
                body: Web_Room_Center_History_Hand.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_History_Hand.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }


    /**
     * MTT 比赛列表详情  
     */
    async reqMTTDetailInfo(matchID, param: typeof Web_Room_Center_Mtt_Details.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_Room_Center_Mtt_Details.API.replace("{id}", matchID.toString()),
                request: Web_Room_Center_Mtt_Details,
                body: Web_Room_Center_Mtt_Details.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_Mtt_Details.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 玩家申请加入公会列表
     */
    async reqClubJoinList(param: typeof APIClubJoinList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIClubJoinList,
                body: APIClubJoinList.Request(param),
                onSuccess: function () {
                    resolve(APIClubJoinList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 公会管理员冻结公会成员
     */
    async reqClubLockUser(param: typeof APILockUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APILockUser,
                body: APILockUser.Request(param),
                onSuccess: function () {
                    resolve(APILockUser.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 公会管理员解冻公会成员
     */
    async reqClubUnlockUser(param: typeof APIUnlockUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIUnlockUser,
                body: APIUnlockUser.Request(param),
                onSuccess: function () {
                    resolve(APIUnlockUser.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 公会管理员删除公会成员
     */
    async reqClubDeleleUser(param: typeof APIDeleleUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIDeleleUser,
                body: APIDeleleUser.Request(param),
                onSuccess: function () {
                    resolve(APIDeleleUser.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 管理员查看玩家退会记录
     */
    async reqClubQuitList(param: typeof APIClubQuitList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIClubQuitList,
                body: APIClubQuitList.Request(param),
                onSuccess: function () {
                    resolve(APIClubQuitList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 查看成员战绩
     */
    async reqClubStandings(param: typeof APIClubStandings.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIClubStandings,
                body: APIClubStandings.Request(param),
                onSuccess: function () {
                    resolve(APIClubStandings.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 战绩带入数据列表
     */
    async reqFriendAppleList(param: typeof APIFriendApplyList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIFriendApplyList,
                body: APIFriendApplyList.Request(param),
                onSuccess: function () {
                    resolve(APIFriendApplyList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
    * 获取消息列表
    */
    async reqMessageList(param: typeof APIMsgMessageList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIMsgMessageList,
                body: APIMsgMessageList.Request(param),
                onSuccess: function () {
                    resolve(APIMsgMessageList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 发送客服数据
     */
    async reqServiceInfo(param: typeof APITicketCreate.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APITicketCreate,
                body: APITicketCreate.Request(param),
                onSuccess: function () {
                    resolve(APITicketCreate.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 判断用户是否绑定手机  返回布尔值
     */
    async reqIsPhoneUser(param: typeof APIIsPhoneUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: APIIsPhoneUser,
                body: APIIsPhoneUser.Request(param),
                onSuccess: function () {
                    resolve(APIIsPhoneUser.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 牌谱详情
     */
    async reqHistoryReplay(matchID, param: typeof Web_Room_Center_History_Replay.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_Room_Center_History_Replay.API.replace("{id}", matchID.toString()),
                request: Web_Room_Center_History_Replay,
                body: Web_Room_Center_History_Replay.Request(param),
                onSuccess: function () {
                    resolve(Web_Room_Center_History_Replay.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 收藏
     */
    async reqRecordRound(param: typeof Web_Misc_Game_Record_Round.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Game_Record_Round,
                body: Web_Misc_Game_Record_Round.Request(param),
                onSuccess: function () {
                    resolve(Web_Misc_Game_Record_Round.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 取消收藏
     */
    async reqRemoveRound(param: typeof Web_Misc_Game_Remove_Round.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Game_Remove_Round,
                body: Web_Misc_Game_Remove_Round.Request(param),
                onSuccess: function () {
                    resolve(Web_Misc_Game_Remove_Round.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 收藏列表
     */
    async reqRoundList(param: typeof Web_Misc_Game_Round_List.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Game_Round_List,
                body: Web_Misc_Game_Round_List.Request(param),
                onSuccess: function () {
                    resolve(Web_Misc_Game_Round_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 查询牌普列表是否是状态
     */
    async reqRoundStrtus(param: typeof Web_Misc_Game_Round_Status.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Misc_Game_Round_Status,
                body: Web_Misc_Game_Round_Status.Request(param),
                onSuccess: function () {
                    resolve(Web_Misc_Game_Round_Status.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 查询成就任务列表
     */
    async reqPropTaskList(param: typeof API_PROP_TASK_LIST.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_PROP_TASK_LIST,
                body: API_PROP_TASK_LIST.Request(param),
                onSuccess: function () {
                    resolve(API_PROP_TASK_LIST.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 成就任务领取奖励
     */
    async reqPropTaskReceive(param: typeof API_PROP_TASK_RECEIVE.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_PROP_TASK_RECEIVE,
                body: API_PROP_TASK_RECEIVE.Request(param),
                onSuccess: function () {
                    resolve(API_PROP_TASK_RECEIVE.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
    * 用户的装扮道具背包
    */
    async reqBagPendantList(param: typeof API_BAG_PENDANT_LIST.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_BAG_PENDANT_LIST,
                body: API_BAG_PENDANT_LIST.Request(param),
                onSuccess: function () {
                    resolve(API_BAG_PENDANT_LIST.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 用户当前装扮的道具
     */
    async reqBagCurrentPendantList(param: typeof API_BAG_CURRENT_PENDANT_LIST.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_BAG_CURRENT_PENDANT_LIST,
                body: API_BAG_CURRENT_PENDANT_LIST.Request(param),
                onSuccess: function () {
                    resolve(API_BAG_CURRENT_PENDANT_LIST.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 用户穿上装扮道具
     */
    async reqBagPandantUp(param: typeof API_BAG_PANDANT_UP.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_BAG_PANDANT_UP,
                body: API_BAG_PANDANT_UP.Request(param),
                onSuccess: function () {
                    resolve(API_BAG_PANDANT_UP.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
    * 用户移除装扮道具
    */
    async reqBagPandantDown(param: typeof API_BAG_PANDANT_DOWN.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_BAG_PANDANT_DOWN,
                body: API_BAG_PANDANT_DOWN.Request(param),
                onSuccess: function () {
                    resolve(API_BAG_PANDANT_DOWN.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 我的背包
     */
    async reqBagPropList(param: typeof Web_Prop_User_Prop_List.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: Web_Prop_User_Prop_List,
                body: Web_Prop_User_Prop_List.Request(param),
                onSuccess: function () {
                    resolve(Web_Prop_User_Prop_List.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 设置消息模版
     */
    async reqSetMsgTempLate(param: typeof API_SET_MSG_TEMPLATE.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_SET_MSG_TEMPLATE,
                body: API_SET_MSG_TEMPLATE.Request(param),
                onSuccess: function () {
                    resolve(API_SET_MSG_TEMPLATE.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    /**
     * 获取用户消息模版列表
     */
    async reqGetMsgList(param: typeof API_GET_MSG_LIST.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_GET_MSG_LIST,
                body: API_GET_MSG_LIST.Request(param),
                onSuccess: function () {
                    resolve(API_GET_MSG_LIST.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [['X-Club', ClubCache.club_id]]
            });
        });
    }

    /**
     * 删除消息模版
     */
    async reqDelMsgTempLate(param: typeof API_DEL_MSG_TEMPLATE.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_DEL_MSG_TEMPLATE,
                body: API_DEL_MSG_TEMPLATE.Request(param),
                onSuccess: function () {
                    resolve(API_DEL_MSG_TEMPLATE.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 发送消息
     */
    async reqSendMsg(param: typeof API_SEND_MSG.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_SEND_MSG,
                body: API_SEND_MSG.Request(param),
                onSuccess: function () {
                    resolve(API_SEND_MSG.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 发送消息
     */
    async reqOherUserInfo(uid, param: typeof Web_Other_User_Info.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: Web_Other_User_Info.API.replace("{id}", uid.toString()),
                request: Web_Other_User_Info,
                body: Web_Other_User_Info.Request(param),
                onSuccess: function () {
                    resolve(Web_Other_User_Info.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * 公会消息-带入列表
     */
    async reqClubApplyList(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_CLUB_APPLY_LIST,
                body: API_CLUB_APPLY_LIST.Request(param),
                onSuccess: function () {
                    resolve(API_CLUB_APPLY_LIST.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }

    /**
     * 审批玩家带入申请 审批状态(audit_op):2-通过;3-拒绝
     */
    async reqClubApplyAudit(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_CLUB_APPLY_AUDIT,
                body: API_CLUB_APPLY_AUDIT.Request(param),
                onSuccess: function () {
                    resolve(API_CLUB_APPLY_AUDIT.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: ["X-Club", club_id]
            });
        });
    }

    /**
     * 请求公会钱包变动
     */
    async reqGoldChangeLog(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_GOLD_CHANGE_LOG,
                body: API_GOLD_CHANGE_LOG.Request(param),
                onSuccess: function () {
                    resolve(API_GOLD_CHANGE_LOG.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }
    /**
     * 请求公会钱包信息
     */
    async reqClubUserWallet(club_id, param) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: API_CLUB_USER_WALLET,
                body: API_CLUB_USER_WALLET.Request(param),
                onSuccess: function () {
                    resolve(API_CLUB_USER_WALLET.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this),
                headers: [["X-Club", club_id]]
            });
        });
    }

    /********************************* 公共接口 ***********************************/

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        1.获取固定时间
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    getLongTimeStr(pNum) {//1小时3600秒      1天86400秒
        if (pNum >= 3600)//>1小时
        {
            let tHour = Math.floor(pNum / 3600);
            return tHour.toString().padStart(2, '0') + "小时局";
        }
        else if (pNum >= 60)//>1分钟
        {
            let tMinutes = Math.floor(pNum / 60);
            return tMinutes.toString().padStart(2, '0') + "分钟局";

        }
        else if (pNum < 60) {
            return pNum.toString() + '秒局';
        }
        return "";
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        2.设置输赢分颜色
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    setWinColor(lbl, num, isFix = null) {
        let bxStr = "";
        bxStr = num.toString();
        if (isFix) {
            bxStr = StringHelper.GetLongString(num);
        }
        if (num >= 0) {
            if (num > 0) {
                bxStr = "+" + num.toString();
                if (isFix) {
                    bxStr = "+" + StringHelper.GetLongString(num);
                }
            }
            lbl.node.color = cc.color(53, 163, 179)
        } else {
            lbl.node.color = cc.color(255, 204, 0)
        }
        lbl.string = bxStr;
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        3.获取消息多语言
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    GetMsg(pType) {
        var tValue = i18nMgr.Get("MsgInfo_" + pType.toString());
        return tValue;
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        4.字符串多参数解析
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    formatString(localValue: string, ...params): string {
        if (params.length) {
            params.forEach((value, index) => {
                let paramStr: string = String(value);

                let reg = new RegExp(`\\{${index}\\}`, "g");
                localValue = localValue.replace(reg, paramStr);
            })
        }
        return localValue;
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        5.固定牌型
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    getArchPKInfo(index) {
        let pkInfo = [-1, -1, -1, -1, -1];
        let name = "其他";
        switch (index) {
            case 9:
                pkInfo = [14, 13, 12, 11, 10];
                name = "皇家同花顺";
                break;
            case 10:
                pkInfo = [28, 27, 26, 25, 24];
                name = "同花顺";
                break;
            case 11:
                pkInfo = [14, 29, 44, 59, 10];
                name = "四条";
                break;
            case 12:
                pkInfo = [13, 43, 12, 7, 22];
                name = "葫芦";
                break;
            case 13:
                pkInfo = [27, 24, 23, 22, 21];
                name = "同花";
                break;
            case 14:
                pkInfo = [14, 28, 42, 11, 55];
                name = "顺子";
                break;
            case 15:
                pkInfo = [55, 25, 10, 11, 7];
                name = "三条";
                break;
            case 16:
                pkInfo = [14, 44, 26, 11, 10];
                name = "两对";
                break;
            case 17:
                pkInfo = [14, 29, 12, 11, 10];
                name = "一对";
                break;
        }
        return {
            info: pkInfo,
            name: name
        }
    }

    /********************************* 清除 ***********************************/

















    private static instance: LobbyControl;
    private constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LobbyControl();
        }
        return this.instance;
    }
}