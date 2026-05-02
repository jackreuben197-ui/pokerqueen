import { ClubCache } from "../frame/data/club/ClubCache";
import { StringHelper } from "../helper/StringHelper";
import { i18nMgr } from "../i18n/i18nMgr";
import { ResManager } from "../manager/ResManager";
import HttpRequest from "../net/https/HttpRequest";
import { WebClubJoinList, WebClubQuitList, WebClubStandiNgs, WebDeleleUser, WebFriendApplyList, WebIsPhoneUser, WebLockUser, WebMsgMessageList, WebOrgClubGold, WebTicketCreate, WebUnlockUser, WebBagCurrentPendantList, WebBagpAndantDown, WebBagpandantup, WebBagPendantList, WebClubApplyAudit, WebClubApplyList, WebClubUserWallet, WebDelmsgTemplate, WebGetmsgList, WebGoldChangeLogApi, WebPropTaskList, WebPropTaskReceIve, WebSendMsg, WebSetmsgTemplate, WebWeb2DataStatPerson, WebConfigMultiLanguageTemplate, WebMiscBannerList, WebMiscGameRecordRound, WebMiscGameRemoveRound, WebMiscGameRoundList, WebMiscGameRoundStatus, WebOtherUserInfo, WebPropUserPropList, WebRoomCenterGroups, WebRoomCenterHistoryHand, WebRoomCenterHistoryList, WebRoomCenterHistoryReplay, WebRoomCenterMttDetailS, WebRoomCenterRooms, WebRoomCenterRoomsBlinds, WebStatsRoomDetail, WebStatsUserStats, WebUserCheckNickname, WebUserModifyUserInfo } from "../net/https/WebRequest";
import UIBase from "../ui/UIBase";

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
                let $this = this;
                ResManager.Load(null, resPath + name, cc.Prefab, (err, asset: cc.Prefab) => {
                    if (err) {
                        return;
                    }

                    if ($this.curShowUI) $this.curShowUI.active = false;
                    newUI = cc.instantiate(asset);
                    $this.Layer.addChild(newUI);
                    $this.curShowUI = newUI;
                    $this.uiMap[name] = newUI;
                    newUI.active = true;
                    $this.curShowUI.getComponent(UIBase)?.onShow();
                    resolve(newUI);
                });
            }
        })
    }

    /********************************* 3.网络交互 ***********************************/

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        3.1 请求banner数据
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    async GetBannerList(param: typeof WebMiscBannerList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMiscBannerList,
                body: WebMiscBannerList.Request(
                    {
                        lang: param.lang,               // 语言(zh_CN:简体中文,zh_HK:繁体中文,en_US:英文，pt_BR：葡萄牙语
                        type: param.type,               // 1-大厅Banner,2-发现页(公会)Banner
                        limit: param.limit,             // unity 默认10
                        offset: param.offset,           // 开始下标。例子（offset=0，limit=10，0-9。)默认0
                    }),
                onSuccess: function () {
                    resolve(WebMiscBannerList.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }

    /**
     * @description: 请求房间列表统计信息
     * @return {WebRoomCenterGroups.Response}
     */
    async RequestListSummary(param: typeof WebRoomCenterGroups.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRoomCenterGroups,
                body: WebRoomCenterGroups.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterGroups.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
    * @description: 请求mang信息
    * @return {WebRoomCenterRoomsBlinds.Response}
    */
    async RequestSbList(param: typeof WebRoomCenterRoomsBlinds.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRoomCenterRoomsBlinds,
                body: WebRoomCenterRoomsBlinds.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterRoomsBlinds.Response);
                }.bind(this),
                onFailure: function (content) {
                    reject(content);
                }.bind(this)
            });
        });
    }
    /**
     * @description: 请求rooms信息
     * @return {WebRoomCenterRooms.Response}
     */
    // async APIWebRoomCenterRooms(param: typeof WebRoomCenterRooms.RequestParams) {
    //     return new Promise((resolve, reject) => {
    //         HttpRequest.Send({
    //             request: WebRoomCenterRooms,
    //             body: WebRoomCenterRooms.Request(param),
    //             onSuccess: function () {
    //                 resolve(WebRoomCenterRooms.Response);
    //             }.bind(this),
    //             onFailure: function (content) {
    //                 reject(content);
    //             }.bind(this)
    //         });
    //     });
    // }
    /**
    * @description: 请求rooms信息
    * @return {WebConfigMultiLanguageTemplate.Response}
    */
    async APIConfig_Multi_Language_Template(param: typeof WebConfigMultiLanguageTemplate.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebConfigMultiLanguageTemplate,
                body: WebConfigMultiLanguageTemplate.Request(param),
                onSuccess: function () {
                    resolve(WebConfigMultiLanguageTemplate.Response);
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
    async CheckNickName(param: typeof WebUserCheckNickname.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserCheckNickname,
                body: WebUserCheckNickname.Request(param),
                onSuccess: function () {
                    resolve(WebUserCheckNickname.Response);
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
    async fixUserInfo(param: typeof WebUserModifyUserInfo.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUserModifyUserInfo,
                body: WebUserModifyUserInfo.Request(param),
                onSuccess: function () {
                    resolve(WebUserModifyUserInfo.Response);
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
    async getHistoryInfo(param: typeof WebRoomCenterHistoryList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRoomCenterHistoryList,
                body: WebRoomCenterHistoryList.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterHistoryList.Response);
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
    async getPersionInfo(param: typeof WebWeb2DataStatPerson.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebWeb2DataStatPerson,
                body: WebWeb2DataStatPerson.Request(param),
                onSuccess: function () {
                    resolve(WebWeb2DataStatPerson.Response);
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
    async getUserStatsInfo(param: typeof WebStatsUserStats.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebStatsUserStats,
                body: WebStatsUserStats.Request(param),
                onSuccess: function () {
                    resolve(WebStatsUserStats.Response);
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
    async getRecordDetailInfo(roomId, param: typeof WebStatsRoomDetail.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: WebStatsRoomDetail.API.replace("{id}", roomId.toString()),
                request: WebStatsRoomDetail,
                body: WebStatsRoomDetail.Request(param),
                onSuccess: function () {
                    resolve(WebStatsRoomDetail.Response);
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
    async getRecordHandInfo(param: typeof WebRoomCenterHistoryHand.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebRoomCenterHistoryHand,
                body: WebRoomCenterHistoryHand.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterHistoryHand.Response);
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
    async reqMTTDetailInfo(matchID, param: typeof WebRoomCenterMttDetailS.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: WebRoomCenterMttDetailS.API.replace("{id}", matchID.toString()),
                request: WebRoomCenterMttDetailS,
                body: WebRoomCenterMttDetailS.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterMttDetailS.Response);
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
    async reqClubJoinList(param: typeof WebClubJoinList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubJoinList,
                body: WebClubJoinList.Request(param),
                onSuccess: function () {
                    resolve(WebClubJoinList.Response);
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
    async reqClubLockUser(param: typeof WebLockUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebLockUser,
                body: WebLockUser.Request(param),
                onSuccess: function () {
                    resolve(WebLockUser.Response);
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
    async reqClubUnlockUser(param: typeof WebUnlockUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebUnlockUser,
                body: WebUnlockUser.Request(param),
                onSuccess: function () {
                    resolve(WebUnlockUser.Response);
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
    async reqClubDeleleUser(param: typeof WebDeleleUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebDeleleUser,
                body: WebDeleleUser.Request(param),
                onSuccess: function () {
                    resolve(WebDeleleUser.Response);
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
    async reqClubQuitList(param: typeof WebClubQuitList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubQuitList,
                body: WebClubQuitList.Request(param),
                onSuccess: function () {
                    resolve(WebClubQuitList.Response);
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
    async reqClubStandings(param: typeof WebClubStandiNgs.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebClubStandiNgs,
                body: WebClubStandiNgs.Request(param),
                onSuccess: function () {
                    resolve(WebClubStandiNgs.Response);
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
    async reqFriendAppleList(param: typeof WebFriendApplyList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebFriendApplyList,
                body: WebFriendApplyList.Request(param),
                onSuccess: function () {
                    resolve(WebFriendApplyList.Response);
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
    async reqMessageList(param: typeof WebMsgMessageList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMsgMessageList,
                body: WebMsgMessageList.Request(param),
                onSuccess: function () {
                    resolve(WebMsgMessageList.Response);
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
    async reqServiceInfo(param: typeof WebTicketCreate.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebTicketCreate,
                body: WebTicketCreate.Request(param),
                onSuccess: function () {
                    resolve(WebTicketCreate.Response);
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
    async reqIsPhoneUser(param: typeof WebIsPhoneUser.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebIsPhoneUser,
                body: WebIsPhoneUser.Request(param),
                onSuccess: function () {
                    resolve(WebIsPhoneUser.Response);
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
    async reqHistoryReplay(matchID, param: typeof WebRoomCenterHistoryReplay.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: WebRoomCenterHistoryReplay.API.replace("{id}", matchID.toString()),
                request: WebRoomCenterHistoryReplay,
                body: WebRoomCenterHistoryReplay.Request(param),
                onSuccess: function () {
                    resolve(WebRoomCenterHistoryReplay.Response);
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
    async reqRecordRound(param: typeof WebMiscGameRecordRound.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMiscGameRecordRound,
                body: WebMiscGameRecordRound.Request(param),
                onSuccess: function () {
                    resolve(WebMiscGameRecordRound.Response);
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
    async reqRemoveRound(param: typeof WebMiscGameRemoveRound.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMiscGameRemoveRound,
                body: WebMiscGameRemoveRound.Request(param),
                onSuccess: function () {
                    resolve(WebMiscGameRemoveRound.Response);
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
    async reqRoundList(param: typeof WebMiscGameRoundList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMiscGameRoundList,
                body: WebMiscGameRoundList.Request(param),
                onSuccess: function () {
                    resolve(WebMiscGameRoundList.Response);
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
    async reqRoundStrtus(param: typeof WebMiscGameRoundStatus.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebMiscGameRoundStatus,
                body: WebMiscGameRoundStatus.Request(param),
                onSuccess: function () {
                    resolve(WebMiscGameRoundStatus.Response);
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
    async reqPropTaskList(param: typeof WebPropTaskList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebPropTaskList,
                body: WebPropTaskList.Request(param),
                onSuccess: function () {
                    resolve(WebPropTaskList.Response);
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
    async reqPropTaskReceive(param: typeof WebPropTaskReceIve.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebPropTaskReceIve,
                body: WebPropTaskReceIve.Request(param),
                onSuccess: function () {
                    resolve(WebPropTaskReceIve.Response);
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
    async reqBagPendantList(param: typeof WebBagPendantList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBagPendantList,
                body: WebBagPendantList.Request(param),
                onSuccess: function () {
                    resolve(WebBagPendantList.Response);
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
    async reqBagCurrentPendantList(param: typeof WebBagCurrentPendantList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBagCurrentPendantList,
                body: WebBagCurrentPendantList.Request(param),
                onSuccess: function () {
                    resolve(WebBagCurrentPendantList.Response);
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
    async reqBagPandantUp(param: typeof WebBagpandantup.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBagpandantup,
                body: WebBagpandantup.Request(param),
                onSuccess: function () {
                    resolve(WebBagpandantup.Response);
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
    async reqBagPandantDown(param: typeof WebBagpAndantDown.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebBagpAndantDown,
                body: WebBagpAndantDown.Request(param),
                onSuccess: function () {
                    resolve(WebBagpAndantDown.Response);
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
    async reqBagPropList(param: typeof WebPropUserPropList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebPropUserPropList,
                body: WebPropUserPropList.Request(param),
                onSuccess: function () {
                    resolve(WebPropUserPropList.Response);
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
    async reqSetMsgTempLate(param: typeof WebSetmsgTemplate.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebSetmsgTemplate,
                body: WebSetmsgTemplate.Request(param),
                onSuccess: function () {
                    resolve(WebSetmsgTemplate.Response);
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
    async reqGetMsgList(param: typeof WebGetmsgList.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebGetmsgList,
                body: WebGetmsgList.Request(param),
                onSuccess: function () {
                    resolve(WebGetmsgList.Response);
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
    async reqDelMsgTempLate(param: typeof WebDelmsgTemplate.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebDelmsgTemplate,
                body: WebDelmsgTemplate.Request(param),
                onSuccess: function () {
                    resolve(WebDelmsgTemplate.Response);
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
    async reqSendMsg(param: typeof WebSendMsg.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                request: WebSendMsg,
                body: WebSendMsg.Request(param),
                onSuccess: function () {
                    resolve(WebSendMsg.Response);
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
    async reqOherUserInfo(uid, param: typeof WebOtherUserInfo.RequestParams) {
        return new Promise((resolve, reject) => {
            HttpRequest.Send({
                api: WebOtherUserInfo.API.replace("{id}", uid.toString()),
                request: WebOtherUserInfo,
                body: WebOtherUserInfo.Request(param),
                onSuccess: function () {
                    resolve(WebOtherUserInfo.Response);
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
                request: WebClubApplyList,
                body: WebClubApplyList.Request(param),
                onSuccess: function () {
                    resolve(WebClubApplyList.Response);
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
                request: WebClubApplyAudit,
                body: WebClubApplyAudit.Request(param),
                onSuccess: function () {
                    resolve(WebClubApplyAudit.Response);
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
                request: WebGoldChangeLogApi,
                body: WebGoldChangeLogApi.Request(param),
                onSuccess: function () {
                    resolve(WebGoldChangeLogApi.Response);
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
                request: WebClubUserWallet,
                body: WebClubUserWallet.Request(param),
                onSuccess: function () {
                    resolve(WebClubUserWallet.Response);
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