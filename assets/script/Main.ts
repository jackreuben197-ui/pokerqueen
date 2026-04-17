/*
 * @Author: xfj
 * @Date: 2022-11-02 10:22:02
 * @description: 
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-11-03 15:59:34
 * @FilePath: /pokerqueen/assets/script/Main.ts
 */
/**
 * 入口函数
 */
import Common_Button_Ex from "./common/Common_Button_Ex";
import { GameConfig } from "./config/GameConfig";
import GC from "./frame/GameControl";
import OrientationComponent from "./funcomponent/OrientationComponent";
import ReconnectComponent from "./funcomponent/ReconnectComponent";
import { GM } from "./gm/GMAPI";
import ProcedureManager from "./manager/ProcedureManager";
import SoundComponent from "./sound/SoundComponent";
import CCTools from "./tools/CCTools";
import TelegramUtils from "./tools/TelegramUtils";
import UIComponent, { PrefabUI } from "./ui/UIComponent";
import AgoraManager from "./net/agora/AgoraManager";
import H5MsgMgr from "./H5MsgMgr";
import { GameCache } from "./game/GameCache";
import { ProcedureEnum } from "./define/EIDefine";
///////////////////////////////////////////////
cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    static instance: Main = null;

    static Cache_UI: cc.Node = null;

    static Scene: cc.Node = null;
    static Marquee: cc.Node = null;
    static Form: cc.Node = null;
    static Board: cc.Node = null;
    static Dialog: cc.Node = null;
    static Alert: cc.Node = null;
    static Block: cc.Node = null;
    static Prompt: cc.Node = null;
    static Toast: cc.Node = null;
    static UIPreloading: cc.Node = null;
    static Toast_Node: cc.Node = null;
    //横屏提示
    static Orientation: cc.Node = null;
    //重连提示
    static Reconnect: cc.Node = null;

    static Diss: cc.Node = null;
    ////////////////////////////////////调试开关

    static ShowSeatID: number;//显示seat id

    async onLoad() {

        // 初始化 Telegram WebApp SDK（必须在最开始）
        TelegramUtils.Instance;
        
        // 输出 Telegram 调试信息（在 log 被禁用之前）
        if (TelegramUtils.Instance.isInTelegram) {
            TelegramUtils.Instance.printDebugInfo();
        }
        
        if (!CCTools.getQueryString("log") && GameConfig.publish) {
            console.log = function () { }
        }
        console.log("游戏启动", cc.sys.os);

        GC.init();

        GC.localStore.keyPre = CCTools.getQueryString("player") || "";

        Main.instance = this;
        //设置是否代理模式(根据地址栏配置proxy字段)
        GameConfig.useProxy = !!CCTools.getQueryString("proxy");
        //设置各种开关
        Main.ShowSeatID = + CCTools.getQueryString("ShowSeatID");
        //设置调试开关
        GM.SetDebugSwitch(CCTools.getQueryString("debug"));

        // UI 节点缓存
        Main.Cache_UI = this.node.parent.getChildByName("Cache_UI - UI缓存");
        Main.Scene = this.node.parent.getChildByName("Scene - 场景");
        Main.Marquee = this.node.parent.getChildByName("Marquee - 场景上层");
        Main.Form = this.node.parent.getChildByName("Form - 窗体层");
        Main.Board = this.node.parent.getChildByName("Board - 遮挡浮窗层");
        Main.Dialog = this.node.parent.getChildByName("Dialog - 弹窗层");
        Main.Alert = this.node.parent.getChildByName("Alert - 提示框");
        Main.Block = this.node.parent.getChildByName("Block - 遮挡");
        Main.Prompt = this.node.parent.getChildByName("Prompt - 网络菊花层");
        Main.Toast = this.node.parent.getChildByName("Toast - 提示层");
        Main.UIPreloading = Main.Block.getChildByName("UIPreloading");
        Main.Toast_Node = Main.Toast.getChildByName("Toast_Node");

        Main.Orientation = this.node.parent.getChildByName("Orientation");
        Main.Reconnect = this.node.parent.getChildByName("Reconnect - 重连");

        Main.Diss = this.node.parent.getChildByName("Diss - 出界遮挡");

        UIComponent.Instance.SetPrefabNode(PrefabUI.UIPreloading, Main.UIPreloading);

        this.scheduleOnce(() => {
            console.log("屏幕分辨率:", cc.view.getFrameSize().toString());
            console.log("逻辑分辨率:", cc.view.getVisibleSize().toString());
            this.refreshDiss();
        }, 1);

        GC.uc.AddComponent(new OrientationComponent);

        this.loadWebSDK();

        SoundComponent.Instance.initSound();

        ReconnectComponent.Instance.Start();

        // 监听 H5 层（Vue/Vite）通过 bridge.js 发来的消息
        H5MsgMgr.Instance.init();
        this._registerH5Listeners();

        // 启动握手：设置 __CC_READY__，等待 H5 发来 h5Ready，回复 ccAck
        H5MsgMgr.Instance.startHandshake();
    }
    protected update(dt: number): void {
        GC.uc.Update(dt);
    }
    start() {
        console.log("start");
        ProcedureManager.Init();
    }

    /**
     * 动态加载 Web 层第三方 SDK
     * 预览和构建通用，不依赖 HTML 模板
     */
    private loadWebSDK(): void {
        if (!GameConfig.enableAgora) {
            console.log('[WebSDK] 声网已禁用（enableAgora=false），跳过加载');
            return;
        }

        const sdkList = [
            { name: 'AgoraRTC', src: 'https://download.agora.io/sdk/release/AgoraRTC_N.js' },
        ];

        sdkList.forEach(sdk => {
            // 已存在则跳过
            if ((window as any)[sdk.name]) {
                console.log(`[WebSDK] ${sdk.name} 已存在，跳过加载`);
                return;
            }
            const script = document.createElement('script');
            script.src = sdk.src;
            script.charset = 'utf-8';
            script.onload = () => {
                console.log(`[WebSDK] ${sdk.name} 声网sdk加载完成`);
                if (sdk.name === 'AgoraRTC') {
                    AgoraManager.Instance.init();
                }
            };
            script.onerror = () => {
                console.error(`[WebSDK] ${sdk.name} 声网sdk加载失败: ${sdk.src}`);
            };
            document.head.appendChild(script);
        });
    }

    //刷新遮挡
    private refreshDiss() {
        let l_mask = Main.Diss.getChildByName("l_mask");
        let r_mask = Main.Diss.getChildByName("r_mask");
        //let u_mask = Main.Diss.getChildByName("u_mask");
        //let b_mask = Main.Diss.getChildByName("b_mask");
        l_mask.width = cc.view.getVisibleSize().width;
        r_mask.width = cc.view.getVisibleSize().width;
        //u_mask.width = cc.view.getVisibleSize().height;
        //b_mask.width = cc.view.getVisibleSize().height;

    }

    // ==================== H5 消息处理 ====================

    /** 进入牌桌必需字段定义 */
    private static readonly ENTER_TABLE_REQUIRED: { key: string; label: string; type: string }[] = [
        { key: 'nUserId', label: '用户ID', type: 'number' },
        { key: 'nick', label: '昵称', type: 'string' },
        { key: 'headPic', label: '头像', type: 'string' },
        { key: 'sex', label: '性别', type: 'number' },
        { key: 'gold', label: '金豆余额', type: 'number' },
        { key: 'game_enter_type', label: '进入类型', type: 'number' },
        { key: 'isLookOn', label: '是否观战', type: 'boolean' },
        { key: 'room_type', label: '房间类型', type: 'number' },
        { key: 'room_id', label: '房间号', type: 'number' },
        { key: 'roomName', label: '房间名称', type: 'string' },
        { key: 'game_type', label: '游戏类型', type: 'number' },
        { key: 'poker_type', label: '牌类型', type: 'number' },
        { key: 'bet_type', label: '下注类型', type: 'number' },
        { key: 'seat_count', label: '座位数', type: 'number' },
        { key: 'match_id', label: 'MTT比赛ID', type: 'number' },
        { key: 'service_id', label: '服务器ID', type: 'string' },
        { key: 'carry_small', label: '最小带入', type: 'number' },
    ];

    private _registerH5Listeners(): void {
        H5MsgMgr.Instance.on('enterTable', (payload) => {
            console.log('[H5Bridge] 收到 enterTable:', JSON.stringify(payload));

            const missing = Main._validateEnterTableData(payload);
            if (missing.length > 0) {
                console.error('[H5Bridge] enterTable 数据校验失败，缺少以下字段:');
                missing.forEach(m => console.error(`  - ${m.key} (${m.label}): 期望 ${m.type}, 实际 ${m.actual}`));
                return;
            }

            // 数据完整，写入 GameCache 并进入牌桌
            Main._fillGameCache(payload);
            ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, {
                game_enter_type: payload.game_enter_type,
                isLookOn: payload.isLookOn,
            });
        });
        H5MsgMgr.Instance.on('exitTable', (payload) => {
            console.log('[H5Bridge] 离开牌桌:', payload);
            // TODO: 调用离开牌桌的逻辑
        });
        H5MsgMgr.Instance.on('syncUser', (payload) => {
            console.log('[H5Bridge] 同步用户信息:', payload);
            // TODO: 调用同步用户的逻辑
        });
    }

    /**
     * 校验 enterTable 数据完整性
     * 返回缺失/类型不匹配的字段列表
     */
    private static _validateEnterTableData(payload: any): { key: string; label: string; type: string; actual: string }[] {
        if (!payload || typeof payload !== 'object') {
            return Main.ENTER_TABLE_REQUIRED.map(f => ({ ...f, actual: 'undefined' }));
        }

        const missing: { key: string; label: string; type: string; actual: string }[] = [];
        for (const field of Main.ENTER_TABLE_REQUIRED) {
            const val = payload[field.key];
            if (val === undefined || val === null) {
                missing.push({ ...field, actual: 'undefined' });
            } else if (field.type === 'number' && typeof val !== 'number') {
                missing.push({ ...field, actual: typeof val });
            } else if (field.type === 'string' && typeof val !== 'string') {
                missing.push({ ...field, actual: typeof val });
            } else if (field.type === 'boolean' && typeof val !== 'boolean') {
                missing.push({ ...field, actual: typeof val });
            }
        }
        return missing;
    }

    /**
     * 将 H5 传入的数据写入 GameCache
     */
    private static _fillGameCache(payload: any): void {
        const gc = GameCache.Instance;
        // 用户信息
        gc.nUserId = payload.nUserId;
        gc.nick = payload.nick;
        gc.headPic = payload.headPic;
        gc.sex = payload.sex;
        gc.gold = payload.gold;
        // 房间信息
        gc.room_type = payload.room_type;
        gc.room_id = payload.room_id;
        gc.roomName = payload.roomName;
        gc.game_type = payload.game_type;
        gc.poker_type = payload.poker_type;
        gc.bet_type = payload.bet_type;
        gc.seat_count = payload.seat_count;
        gc.match_id = payload.match_id;
        gc.serviceId = payload.service_id;
        gc.carry_small = payload.carry_small;
        // 可选字段（有则写入，无则保持默认）
        gc.straddle = payload.straddle ?? 0;
        gc.insurance = !!payload.insurance;
        gc.muck_switch = payload.muck_switch ?? 0;
        gc.ClubID = payload.club_id ?? 0;
        gc.origin_type = payload.origin_type ?? 0;
        gc.gold_type = payload.gold_type ?? 0;

        console.log('[H5Bridge] GameCache 数据已写入, room_id:', gc.room_id, 'room_type:', gc.room_type);
    }
}

// @ts-ignore
BigInt.prototype.toJSON = function() {
    return this.toString();
};


(window as any).Main = Main;

//http://localhost:7456/assets/resources/native/ff/ff223a1d-adf2-4ecd-a826-ca1e0628cb82.png
//http://localhost:7456/assets/resources/native/31/310952bf-e832-4f99-985f-7da18d2051bc.png