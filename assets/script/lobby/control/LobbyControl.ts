import { ProcedureEnum } from "../../define/EIDefine";
import { GameCache } from "../../game/GameCache";
import { i18nMgr } from "../../i18n/i18nMgr";
import ProcedureManager from "../../manager/ProcedureManager";
import { ResManager } from "../../manager/ResManager";
import HttpRequest from "../../net/https/HttpRequest";
import { WEB2_data_stat_person, Web_Config_Multi_Language_Template, Web_Misc_Banner_List, Web_Room_Center_Groups, Web_Room_Center_History_Hand, Web_Room_Center_History_List, Web_Room_Center_Mtt_Details, Web_Room_Center_Rooms, Web_Room_Center_Rooms_Blinds, Web_Stats_Room_Detail, Web_Stats_User_Stats, Web_User_Check_Nickname, Web_User_Modify_User_Info } from "../../net/https/WebRequest";
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
        this.curShowUI = param.curShowUI;
        this.Layer = param.Layer;
    }

    /**≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
        2.2 点击主界面下方4个按钮 切换中间不同显示
            name: UILobby UIChat UICareer UIMine
    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈*/
    public async switchContent(name: string) {

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
                ResManager.Load(null, "main/lobby/prefab/" + name, cc.Prefab, (err, asset: cc.Prefab) => {
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
                        type: param.type,               // 1-大厅Banner,2-发现页(工会)Banner
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

    setWinColor(lbl, num) {
        let bxStr = "";
        bxStr = num.toString();
        if (num >= 0) {
            if (num > 0) {
                bxStr = "+" + num.toString();
            }
            lbl.node.color = cc.color(53, 163, 179)
        } else {
            lbl.node.color = cc.color(255, 204, 0)
        }
        lbl.string = bxStr;
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
    


    /********************************* 流程控制 ***********************************/
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