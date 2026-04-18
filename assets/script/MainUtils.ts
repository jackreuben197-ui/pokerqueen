/**
 * MainUtils — 从 Main.ts 拆出的辅助功能
 *
 * 包含：SDK 动态加载、遮挡层刷新、H5 消息桥接、
 *       enterTable 数据校验与 GameCache 写入
 */
import { GameConfig } from "./config/GameConfig";
import GC from "./frame/GameControl";
import { GameCache } from "./game/GameCache";
import AgoraManager from "./net/agora/AgoraManager";
import H5MsgMgr from "./H5MsgMgr";
import ProcedureManager from "./manager/ProcedureManager";
import CCTools from "./tools/CCTools";
import TelegramUtils from "./tools/TelegramUtils";
import { ProcedureEnum } from "./define/EIDefine";

// ==================== SDK 动态加载 ====================

/**
 * 动态加载 Web 层第三方 SDK
 * 预览和构建通用，不依赖 HTML 模板
 */
export function loadWebSDK(): void {
    if (!GameConfig.enableAgora) {
        console.log('[WebSDK] 声网已禁用（enableAgora=false），跳过加载');
        return;
    }

    const sdkList = [
        { name: 'AgoraRTC', src: 'https://download.agora.io/sdk/release/AgoraRTC_N.js' },
    ];

    sdkList.forEach(sdk => {
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

// ==================== UI 辅助 ====================

/** 刷新左右遮挡层宽度，使其覆盖屏幕外区域 */
export function refreshDiss(dissNode: cc.Node): void {
    let l_mask = dissNode.getChildByName("l_mask");
    let r_mask = dissNode.getChildByName("r_mask");
    l_mask.width = cc.view.getVisibleSize().width;
    r_mask.width = cc.view.getVisibleSize().width;
}

// ==================== H5 桥接：enterTable ====================

/** enterTable 必需字段定义 */
const ENTER_TABLE_REQUIRED: { key: string; label: string; type: string }[] = [
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

/**
 * 校验 enterTable 数据完整性
 * 返回缺失/类型不匹配的字段列表
 */
export function validateEnterTableData(payload: any): { key: string; label: string; type: string; actual: string }[] {
    if (!payload || typeof payload !== 'object') {
        return ENTER_TABLE_REQUIRED.map(f => ({ ...f, actual: 'undefined' }));
    }

    const missing: { key: string; label: string; type: string; actual: string }[] = [];
    for (const field of ENTER_TABLE_REQUIRED) {
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

/** 将 H5 传入的数据写入 GameCache */
export function fillGameCache(payload: any): void {
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

// ==================== H5 消息监听注册 ====================

/** 注册 H5 桥接消息（enterTable / exitTable / syncUser） */
export function registerH5Listeners(): void {
    H5MsgMgr.Instance.on('enterTable', (payload) => {
        console.log('[H5Bridge] 收到 enterTable:', JSON.stringify(payload));

        const missing = validateEnterTableData(payload);
        if (missing.length > 0) {
            console.error('[H5Bridge] enterTable 数据校验失败，缺少以下字段:');
            missing.forEach(m => console.error(`  - ${m.key} (${m.label}): 期望 ${m.type}, 实际 ${m.actual}`));
            return;
        }

        fillGameCache(payload);
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
