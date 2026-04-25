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
import LobbyRoomListItem from "./frame/data/lobby/LobbyRoomListItem";
import ProcedureManager from "./manager/ProcedureManager";
import { ResManager, Bundle_Resources } from "./manager/ResManager";
import CCTools from "./tools/CCTools";
import TelegramUtils from "./tools/TelegramUtils";
import { ProcedureEnum } from "./define/EIDefine";
import { ClubCache } from "./frame/data/club/ClubCache";
import LoginSession from "./session/LoginSession";
import PacketHead from "./net/websocket/PacketHead";
import ProtocolAgency from "./net/websocket/ProtocolAgency";
import { i18nMgr } from "./i18n/i18nMgr";

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

// ==================== H5 桥接模式初始化 ====================

/**
 * H5 桥接模式所需的数据层初始化。
 * 大厅流程中原本会顺带初始化这些模块，但 H5 桥接跳过了大厅，
 * 所以需要在此统一执行。
 *
 * 所有 Init 方法都是幂等的（内部有 _initOnce 保护），多次调用无副作用。
 * 不包含：WebSocket 连接、心跳组件、Token 刷新等网络相关初始化（由 H5 层代理）。
 */
async function initH5BridgeDependencies(): Promise<void> {
    PacketHead.Init();       // 包头字段偏移量计算，BuildPacket 依赖

    // i18n 初始化：正常流程由 ProcedureConfig 驱动（loadDir("config") + praseConfig），
    // 但 H5 桥接模式和编辑器预览都跳过了 ProcedureConfig，
    // 所以在这里通过 cc.resources.load 加载词典（走 Cocos 管道，自动享受 md5Cache）。
    if (!i18nMgr.language) {
        i18nMgr.initLanguage();
        await i18nMgr.loadAndRefreshConfig();
        // ATTENTION TO FIX: 强制使用中文，确保默认显示中文
        i18nMgr.setLanguage("cn");             
        console.log('[H5Bridge] i18n 初始化完成, language:', i18nMgr.language);
    }

    console.log('[H5Bridge] 数据层初始化完成 (PacketHead + i18n)');
}

/**
 * 预加载声音资源到 AssetContext.map。
 * 正常流程由 ProcedureEnterLobby 加载 resources/ 全目录（含 sound/），
 * H5 桥接模式跳过了大厅，需要单独补加载。
 */
let _soundLoaded = false;
function loadSoundResources(): void {
    if (_soundLoaded) return;
    _soundLoaded = true;

    cc.resources.loadDir('sound', (err, assets) => {
        if (err) {
            console.error('[H5Bridge] 声音资源加载失败:', err);
            _soundLoaded = false;
            return;
        }
        ResManager.AssetForeach(assets, Bundle_Resources);
        console.log('[H5Bridge] 声音资源加载完成, 共', assets.length, '个资源');
    });
}

/**
 * 预加载牌桌所需的游戏资源（牌面纹理等）到 AssetContext.map。
 * 正常流程由 ProcedureEnterLobby 加载 resources/ 全目录，
 * H5 桥接模式跳过了大厅，需要单独补加载。
 */
let _gameResLoaded = false;
function loadGameResources(): void {
    if (_gameResLoaded) return;
    _gameResLoaded = true;

    cc.resources.loadDir('main/rc', (err, assets) => {
        if (err) {
            console.error('[H5Bridge] 游戏资源加载失败:', err);
            _gameResLoaded = false;
            return;
        }
        ResManager.AssetForeach(assets, Bundle_Resources);
        console.log('[H5Bridge] 游戏资源加载完成, 共', assets.length, '个资源');
    });
}

// ==================== H5 消息监听注册 ====================

/** 注册 H5 桥接消息（enterTable / exitTable / syncUser） */
export async function registerH5Listeners(): Promise<void> {
    // H5 桥接模式下，提前完成数据层初始化（含 i18n），避免跳过大厅导致懒初始化未执行
    await initH5BridgeDependencies();
    initH5BridgeDependencies();
    H5MsgMgr.Instance.on('enterTable', (payload) => {
        console.log('[H5Bridge] 收到 enterTable:', JSON.stringify(payload));
        const { token, websocketPort, roomId, roomName } = payload;

        // === 1. H5 消息基本字段校验 ===
        const missing: string[] = [];
        if (!token) missing.push('token');
        if (!websocketPort) missing.push('websocketPort');
        if (!roomId) missing.push('roomId');
        if (missing.length > 0) {
            console.error('[H5Bridge] enterTable 缺少必要字段:', missing.join(', '));
            return;
        }

        // === 2. 从缓存查找房间详情（syncRoomsList 缓存的数据） ===
        const roomIdNum = Number(roomId);
        const cachedRooms = GC.data.lobby.roomList.getList(false);
        const cachedClubRooms = GC.data.lobby.roomList.getList(true);
        const targetItem = [...cachedRooms, ...cachedClubRooms].find(r => r.rid === roomIdNum);

        if (!targetItem) {
            console.error('[H5Bridge] enterTable 未在缓存房间列表中找到房间:', roomId, '请确认 syncRoomsList 已送达');
            return;
        }
        // 原始房间数据 TRoomListItem
        const roomData = (targetItem as any)._data;

        // === 3. 进入牌桌所需数据完整性校验 ===
        const requiredForEnter: { key: string; val: any }[] = [
            { key: 'room_type', val: roomData.room_type },
            { key: 'game_type', val: roomData.game_type },
            { key: 'poker_type', val: roomData.poker_type },
            { key: 'seat_count', val: roomData.seat_count },
            { key: 'rid', val: roomData.rid },
        ];
        const incomplete = requiredForEnter.filter(f => f.val === undefined || f.val === null);
        if (incomplete.length > 0) {
            console.error('[H5Bridge] enterTable 房间缓存数据不完整，缺少:', incomplete.map(f => f.key).join(', '));
            return;
        }

        // === 4. 设置 Token（WS 由 H5 层代理，CC 层不直接连接） ===
        LoginSession.Token = token;

        console.log('roomData ${roomData}', roomData);

        // === 5. 填充 GameCache（从缓存房间数据） ===
        const gc = GameCache.Instance;
        gc.room_id = roomIdNum;
        gc.roomName = roomName || targetItem.name;
        gc.room_type = roomData.room_type;
        gc.game_type = roomData.game_type;
        gc.poker_type = roomData.poker_type;
        gc.bet_type = roomData.limit_bet_type;
        gc.seat_count = roomData.seat_count;
        gc.serviceId = roomData.service_id;
        gc.straddle = roomData.straddle_on || 0;
        gc.insurance = (roomData.insurance_on || 0) > 0;
        gc.muck_switch = roomData.muck_on || 0;
        gc.origin_type = roomData.origin_type || 0;
        gc.share_table = roomData.share_table || 0;
        gc.gold_type = roomData.gold_type || 0;
        gc.ClubID = roomData.club_id || 0;
        gc.TribeId = roomData.tribe_id || 0;
        gc.match_id = 0;
        gc.carry_small = roomData.limit_bring_in || 0;
        gc.anti_cheat_type = roomData.anti_cheat_type || 0;
        gc.enter_param = { game_enter_type: 0, isLookOn: false };

        // === 6. 启动进入牌桌流程 ===
        // EnterTexas → 加载资源 → Texas procedure → TexasGameUtils.EnterRoom()
        // → ProtocolAgency.Send(ClientMessageEnterRoom) → WebSocket 发送
        ProcedureManager.StartProcedure(ProcedureEnum.EnterTexas, gc.enter_param);
        console.log('[H5Bridge] enterTable 已启动进桌流程, room_id:', roomIdNum, 'room:', roomName);

        // === 7. 通知 H5 层隐藏自身，让出 CC 层牌桌显示 ===
        H5MsgMgr.sendToH5('h5Hide', 1);
    });
    H5MsgMgr.Instance.on('exitTable', (payload) => {
        console.log('[H5Bridge] 离开牌桌:', payload);
        // TODO: 调用离开牌桌的逻辑
    });
    H5MsgMgr.Instance.on('syncUser', (payload) => {
        console.log('[H5Bridge] 同步用户信息:', payload);
        const userInfo = payload?.raw?.user;
        if (!userInfo) {
            console.error('[H5Bridge] syncUser 数据异常：缺少 payload.raw.user');
            return;
        }
        // 仅写入本地缓存，不触发 UI 事件和网络请求
        const gc = GameCache.Instance;
        gc.nUserId = userInfo.un_id;
        gc.userId = userInfo.p_u_id;
        gc.strPhone = userInfo.phone;
        gc.sex = userInfo.sex;
        gc.nick = userInfo.nickname;
        gc.headPic = userInfo.avatar;
        gc.userType = userInfo.ut;
        gc.isHadClub = userInfo.club_id > 0;
        // 直接写入 UserInfoModel 内部数据，绕过 setter（不触发 myGoldChange 事件）
        (GC.data.user.info as any)._msg = userInfo;
        console.log('[H5Bridge] syncUser 缓存完成, user_id:', userInfo.user_id, 'nickname:', userInfo.nickname);

        // 预加载声音和游戏资源（提前加载，避免 enterTable 时再加载影响进桌速度）
        loadSoundResources();
        loadGameResources();
    });
    H5MsgMgr.Instance.on('syncUserClub', (payload) => {
        console.log('[H5Bridge] 同步俱乐部信息:', payload);
        const clubList = payload?.response?.data;
        if (!clubList || !Array.isArray(clubList)) {
            console.error('[H5Bridge] syncUserClub 数据异常：缺少 payload.response.data');
            return;
        }
        // 仅写入本地缓存，不触发 UI 事件和网络请求
        ClubCache._allCubData = clubList;
        // 设置当前俱乐部（第一个），仅写 _msg 和 isHadClub，无事件广播
        if (clubList.length > 0) {
            ClubCache.setClubData(clubList[0]);
        }
        console.log('[H5Bridge] syncUserClub 缓存完成, 共', clubList.length, '个俱乐部');
    });
    H5MsgMgr.Instance.on('syncRoomsList', (payload) => {
        console.log('[H5Bridge] 同步房间列表:', payload);
        const records = payload?.response?.data?.records;
        if (!records || !Array.isArray(records)) {
            console.error('[H5Bridge] syncRoomsList 数据异常：缺少 payload.response.data.records');
            return;
        }
        // 仅写入本地缓存，不触发 UI 事件和网络请求
        const roomListModel = GC.data.lobby.roomList;
        const list = records.map(r => new LobbyRoomListItem(r));
        // 直接替换内部列表（不是追加）
        (roomListModel as any)._list = list;
        (roomListModel as any)._offset = list.length;
        (roomListModel as any)._reqEnd = true;
        (roomListModel as any)._reqing = false;
        console.log('[H5Bridge] syncRoomsList 缓存完成, 共', records.length, '个房间');
    });

    // ─── 网络消息转发 ─────────────────────────────────

    /**
     * wsMessage: H5 层将服务器返回的二进制数据转发给 CC
     * payload 格式: { dataType: 'binary', data: ArrayBuffer }
     * structured clone 传递，data 已经是 ArrayBuffer，无需 base64 解码
     */
    H5MsgMgr.Instance.on('wsMessage', (payload) => {
        if (!payload || payload.dataType !== 'binary' || !payload.data) {
            console.warn('[H5Bridge] wsMessage 数据格式异常:', payload);
            return;
        }
        try {
            let buffer: ArrayBuffer;
            if (payload.data instanceof ArrayBuffer) {
                buffer = payload.data;
            } else if (payload.data instanceof Uint8Array) {
                buffer = payload.data.buffer;
            } else {
                console.warn('[H5Bridge] wsMessage data 类型异常:', typeof payload.data);
                return;
            }
            ProtocolAgency.Receive(buffer);
        } catch (e) {
            console.error('[H5Bridge] wsMessage 处理失败:', e);
        }
    });

    /**
     * wsClosed: H5 层的 WebSocket 连接断开
     * H5 桥接模式下：通知 H5 重连，而非 CC 自己连 WebSocket
     */
    H5MsgMgr.Instance.on('wsClosed', (payload) => {
        console.warn('[H5Bridge] wsClosed:', payload);
        // 通知 H5 层重新连接 WebSocket
        H5MsgMgr.sendToH5('wsConnect', 1, {
            port: GameCache.Instance.serviceId,
            roomId: GameCache.Instance.room_id,
            matchId: GameCache.Instance.match_id,
        });
    });

    /**
     * wsError: H5 层的 WebSocket 发生错误
     */
    H5MsgMgr.Instance.on('wsError', (payload) => {
        console.warn('[H5Bridge] wsError:', payload);
    });
}
