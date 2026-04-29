# PokerQueen 项目分析报告

## 1. 项目概述

**项目名称:** PokerQueen（德州扑克）  
**底层引擎:** Cocos Creator 2.4.8  
**语言:** TypeScript（编译至 ES5 / CommonJS）  
**设计分辨率:** 1242×2688  
**目标平台:** Web（web-mobile）  

---

## 2. 混合架构总览

PokerQueen 采用 **H5-Cocos 混合模式**，在同一 HTML 页面中同时运行两个独立的 UI 层：

```
┌──────────────────────────────────────────────────┐
│                    index.html                      │
│                                                    │
│  ┌──────────────────────┐  ┌───────────────────┐ │
│  │   H5 层 (Vue/Vite)    │  │ Cocos 层 (Canvas)  │ │
│  │   z-index: 10        │  │ z-index: auto      │ │
│  │   ┌──────────┐       │  │                    │ │
│  │   │  大厅界面 │       │  │  ┌── 牌桌 ──┐     │ │
│  │   │  俱乐部   │       │  │  │ 扑克牌   │     │ │
│  │   │  钱包     │       │  │  │ 玩家座位 │     │ │
│  │   │  个人中心 │       │  │  │ 记分板   │     │ │
│  │   └──────────┘       │  │  └─────────┘     │ │
│  │                      │  │                    │ │
│  │   Vue Router 管理     │  │ 过程状态机管理      │ │
│  └──────────┬───────────┘  └─────────┬─────────┘ │
│             │                        │            │
│             │  ←── H5MsgMgr ────→   │            │
│             │  window.postMessage()  │            │
│             │  CocosBridge.postMessage()         │
│             │                        │            │
└──────────────────────────────────────────────────┘
```

**分层职责：**

| 层级 | 负责内容 | 何时可见 |
|------|---------|---------|
| **H5 层 (Vue/Vite)** | 大厅、登录/注册、俱乐部管理、钱包、充值、个人中心、消息 | 平时（大厅状态） |
| **Cocos 层** | 德州扑克牌桌：发牌、下注、摊牌、动画、座位管理 | 进入牌桌后 |

---

## 3. HTML 入口（index.html）

> 文件：`preview-templates/index.html`（由 `scripts/sync-template.js` 从 `build-templates/web-mobile/index.html` 自动生成）

### DOM 结构

```html
<body>
    <!-- Cocos 编辑器工具栏（仅编辑器预览生效） -->
    <div class="toolbar">...</div>

    <!-- Cocos 官方画布区域 -->
    <div id="GameDiv">
        <canvas id="GameCanvas"></canvas>   <!-- Cocos 渲染画布 -->
        <div id="splash">...</div>           <!-- Cocos 启动进度条 -->
    </div>

    <!-- H5 层挂载点（z-index: 10，覆盖在 Canvas 上层） -->
    <div id="app"></div>
</body>
```

### 脚本加载顺序

```
1. H5 层 Vite polyfills (type="module")
2. H5 层 CSS (Vant + 业务样式)
3. H5 层 Vite 模块预加载 (vendors, i18n, ws, game, user...)
4. H5 层 Vite 主入口 (index-*.js)    ← Vue 应用在这里启动
5. i18n 拦截脚本 (编辑器预览用)
6. settings.js                       ← Cocos 构建设置
7. __quick_compile__.js              ← Cocos 热加载
8. boot.js                           ← Cocos 启动引导
9. socket.io.js                      ← Cocos 编辑器实时通讯
10. Cocos 引擎 (<%=cocos2d%>)        ← 根据构建配置插入引擎文件
11. Telegram 初始化脚本 (inline)
12. H5 旧版浏览器兼容脚本 (nomodule)
```

### 关键设计点

- **`#app` 的 z-index 为 10**，默认覆盖在 Cocos Canvas 上方
- H5 层和 Cocos 层由 `H5MsgMgr` 发送 `h5Hide` / `h5Show` 来控制 `#app` 的显示/隐藏
- 进入牌桌时：CC 发 `h5Hide` → H5 隐藏 → 露出下方 Canvas（玩家看到扑克牌桌）
- 退出牌桌时：CC 发 `h5Show` → H5 显示 → 覆盖 Canvas（玩家回到大厅）

---

## 4. Cocos 层启动 (Main.ts)

> 文件：`assets/script/Main.ts`

### `onLoad()` 执行完整流程

```
Main.onLoad()
├── 1. cc.debug.setDisplayStats(false)          // 关闭 FPS/DrawCall 统计
├── 2. TelegramUtils.Instance                   // 初始化 Telegram SDK（检查是否在 Telegram 内运行）
├── 3. 根据 GameConfig.publish 禁用 console.log
├── 4. GC.init()                                // 初始化全局控制器
│      ├── DataManager.init()                   // 创建所有数据层实例 (LobbyData, UserInfoData, Wallet, MTT...)
│      └── SDKManager.init()                    // 初始化 Google 登录 SDK
├── 5. 解析 URL 查询参数                         // ?player, ?proxy, ?ShowSeatID, ?debug
├── 6. 缓存 UI 层级节点                          // Scene, Form, Board, Dialog, Alert, Block, Prompt, Toast
│      (通过 node.parent.getChildByName 定位)
├── 7. 注册 OrientationComponent 到 Update 循环
├── 8. loadWebSDK()                             // AgoraRTC SDK 动态 <script> 注入（可选）
├── 9. SoundComponent.initSound()               // 初始化游戏音效
├── 10. ReconnectComponent.Start()             // 初始化重连逻辑
├── 11. H5MsgMgr.Instance.init()               // 注册 CocosBridge 和 postMessage 监听
│        ├── 注册 window.CocosBridge = { postMessage: fn }  // bridge.js 直接调用
│        └── window.addEventListener('message', fn)         // 标准 postMessage 监听
├── 12. await MainUtils.registerH5Listeners()   // 注册 H5→CC 指令监听
│        ├── initH5BridgeDependencies()          // PacketHead.Init() + i18n 初始化
│        ├── loadSoundResources()                // 预加载声音资源
│        ├── loadGameResources()                 // 预加载牌桌资源
│        └── 注册消息回调: enterTable, exitTable, syncUser, syncUserClub, syncRoomsList, wsMessage, wsClosed, wsError
└── 13. H5MsgMgr.Instance.startHandshake()     // 启动 CC↔H5 握手

Main.start()
└── ProcedureManager.Init()                    // 创建全部 9 个过程，启动 ProcedureInit
```

---

## 5. 全局控制器 (GC — GameControl)

> 文件：`assets/script/frame/GameControl.ts`

`GC` 是整个 Cocos 层的**全局外观单例**，统一访问所有管理器和数据层：

| 属性 | 类 | 功能 |
|------|----|------|
| `GC.language` | LanguageManager | 国际化文本查找 |
| `GC.notify` | NotifyManager | 观察者事件总线 |
| `GC.localStore` | LocalStoreManager | 本地存储（带前缀的 localStorage） |
| `GC.audio` | AudioManager | 音乐/音效管理 |
| `GC.data` | DataManager | 领域数据（大厅、用户、钱包、赛事、俱乐部） |
| `GC.sdk` | SDKManager | 第三方登录（Google / Facebook / Instagram） |
| `GC.game` | TexasGame | 当前牌桌游戏实例 |
| `GC.game_cache` | GameCache | 运行时游戏状态缓存 |
| `GC.uc` | UpdateComponent | 更新循环管理器 |
| `GC.sound` | SoundComponent | 音效组件 |
| `GC.bundle` | Map | 已加载的资源包 |

---

## 6. H5 消息桥接 (H5MsgMgr)

> 文件：`assets/script/H5MsgMgr.ts`

这是混合架构的**核心通信层**，负责 H5 与 Cocos Creator 之间的所有数据传输。

### 通信通道（3 种方式）

| 方式 | 方向 | 说明 |
|------|------|------|
| `window.CocosBridge.postMessage(data)` | H5 → CC | bridge.js 直接调用（最快） |
| `window.postMessage(msg, '*')` | 双向 | 支持 JSON 字符串 + binary ArrayBuffer (structured clone) |
| `cocos://...data=...` scheme | H5 → CC | 旧版兼容 |

### 消息类型约定

```typescript
msgtype = 0  // 网络消息转发（WebSocket 数据由 H5 层代理发送/接收）
msgtype = 1  // 内部指令（Cocos 与 H5 之间互相控制）
```

### 握手协议

```
步骤 1：CC 加载完成 → 设置 window.__CC_READY__ = true
步骤 2：CC 发送 ccReady 给 H5（通知 H5 层"Cocos 已就绪"）
步骤 3：H5 收到后 → 发送 h5Ready 给 CC
步骤 4：CC 收到 h5Ready → 回复 ccAck → 握手完成 ✓
超时备用：10 秒后无论是否收到 h5Ready，强制完成握手
```

### CC → H5 消息类型

| action | msgtype | payload | 用途 |
|--------|---------|---------|------|
| `ccReady` | 1 | - | 握手消息：CC 就绪 |
| `ccAck` | 1 | - | 握手消息：确认收到 H5 就绪 |
| `wsSend` | 0 | `Uint8Array` (binary) | 转发牌桌协议数据到 H5 的 WebSocket |
| `wsConnect` | 1 | `{port, roomId, matchId}` | 通知 H5 重新连接 WebSocket |
| `h5Hide` | 1 | - | 通知 H5 隐藏自身（进入牌桌） |
| `h5Show` | 1 | - | 通知 H5 显示自身（退出牌桌） |

### H5 → CC 消息类型

| action | msgtype | payload | 用途 |
|--------|---------|---------|------|
| `h5Ready` | 1 | - | 握手消息：H5 就绪 |
| `h5Ack` | 1 | - | 握手消息：确认收到 CC 就绪 |
| `enterTable` | 1 | `{token, websocketPort, roomId, roomName}` | 进入牌桌指令 |
| `exitTable` | 1 | - | 离开牌桌指令 |
| `syncUser` | 1 | `{raw: {user: ...}}` | 同步用户信息到 CC 缓存 |
| `syncUserClub` | 1 | `{response: {data: [...]}}` | 同步俱乐部列表到 CC 缓存 |
| `syncRoomsList` | 1 | `{response: {data: {records: [...]}}}` | 同步房间列表到 CC 缓存 |
| `wsMessage` | 0 | `{dataType: 'binary', data: ArrayBuffer}` | 转发服务器 WebSocket 数据到 CC |
| `wsClosed` | 1 | - | 通知 CC：H5 的 WebSocket 已断开 |
| `wsError` | 1 | - | 通知 CC：H5 的 WebSocket 出现错误 |

### 消息队列机制

握手完成前，所有业务消息进入队列 `_pendingMessages`；握手完成后统一 `_flushPendingMessages()` 发送。握手消息（`ccReady`/`ccAck`）不受限制，直接发送。

---

## 7. 过程状态机 (Procedure Lifecycle)

> 文件：`assets/script/manager/ProcedureManager.ts`

PokerQueen 使用**过程（Procedure）** 模式管理整体游戏流程。每个过程代表游戏的一个状态/阶段。

### 过程枚举

```typescript
ProcedureEnum {
    Idel = 0,           // 闲置（错误回退、空状态）
    Init = 1,           // 初始化（Canvas 适配、FPS 设置）
    PrelLoadLogin = 2,  // 预加载登录资源
    Config = 3,         // 配置（i18n、网络端点、座位适配）
    Login = 4,          // 登录（Token 验证、登录界面）
    EnterLobby = 5,     // 进入大厅请求（登录→用户信息→WebSocket→大厅资源）
    Lobby = 6,          // 大厅（场景切换、WebSocket 连接）
    EnterTexas = 7,     // 进入牌桌（资源加载、房间验证）
    Texas = 8           // 牌桌内游戏
}
```

### 过程基类

```typescript
class ProcedureBase {
    id: ProcedureEnum;
    Name: string;
    param: any;

    Enter(param?) { this.lateEnter(param); }   // 进入过程
    Leave() { }                                 // 离开过程
    protected lateEnter(param?) { }             // 子类覆写实现具体逻辑
}
```

### 过程管理器

```typescript
class ProcedureManager {
    static procedureDic;    // { [id] → ProcedureBase } 预创建的 9 个过程实例
    static prevProcedure;   // 上一个过程
    static currProcedure;   // 当前过程

    static Init() {         // 创建全部 9 个过程 → 启动 ProcedureInit
        ...
    }
    static StartProcedure(id, param?) { // 切换过程
        prevProcedure.Leave();          // 离开旧过程
        procedure.Enter(param);         // 进入新过程
    }
}
```

---

## 8. H5-Cocos 混合模式下的过程流转

在 H5 桥接模式下，**H5 层作为主控**，驱动 Cocos 层的状态切换。

### 正常模式（无 H5 代理）

```
Init → PrelLoadLogin → Config → Login → EnterLobby → Lobby → EnterTexas → Texas
```

### H5 混合模式（实际路径）

```
Init (CC 自行完成) → 等待 H5 指令...

  H5 → syncUser        → CC 缓存用户数据，预加载声音/游戏资源
  H5 → syncUserClub     → CC 缓存俱乐部数据
  H5 → syncRoomsList    → CC 缓存房间列表
  H5 → enterTable       → ProcedureManager.StartProcedure(EnterTexas)
                           → 资源加载 → 请求房间信息 → ProcedureTexas
                           → GameState.Launch → 牌桌游戏
  H5 → exitTable        → 离开牌桌 (TODO)
```

### 关键：H5 桥接模式下的补偿初始化

因为 H5 模式跳过了正常过程中的 Config / Login / EnterLobby 等步骤，这些过程所需的依赖需要通过 `MainUtils.initH5BridgeDependencies()` 额外补偿：

```typescript
// MainUtils.ts
async function initH5BridgeDependencies() {
    PacketHead.Init();        // 包头字段偏移计算（BitPacket 依赖）
    i18nMgr.initLanguage();   // i18n 初始化
    await i18nMgr.loadAndRefreshConfig();  // 从 Cocos 资源管线加载词典
}
```

---

## 9. 网络通信模式

> 文件：`assets/script/net/websocket/ProtocolAgency.ts`

### 双模式设计

```typescript
static Send(param) {
    // === 模式 A：H5 桥接模式（优先） ===
    if (H5MsgMgr.Instance.handshakeDone) {
        // 1. 将协议参数编码为 Protobuf 二进制包
        // 2. 写入包头的所有字段 (Code, Token, RoomID, MatchID...)
        // 3. 通过 H5MsgMgr.sendToH5('wsSend', 0, Uint8Array) 发送给 H5 层
        // 4. H5 层用自己的 WebSocket 发出
        return;
    }

    // === 模式 B：Cocos 直连（后备） ===
    if (WebSocketClient.CheckOpen()) {
        // 直接通过 CC 自己的 WebSocket 发送
        WebSocketClient.WS.send(arrayBuffer);
    }
}
```

### 接收路径

```
服务器 → H5 WebSocket → [wsMessage] → H5MsgMgr._onMessageObj()
    → ProtocolAgency.Receive(ArrayBuffer)
    → 解析包头 (Code, RoomID, MatchID)
    → Protobuf 反序列化 Body
    → GC.notify.post(code, body)
    → 各种 notify 监听器 (如 OnMsgHoldemRooms)
```

---

## 10. 完整启动周期（时序图）

```
时间轴 →

浏览器加载 index.html
│
├─ H5 层初始化 ─────────────────────────────────┤
│  ├─ 加载 Vite polyfills + CSS
│  ├─ 加载 Vite 主入口 (index-*.js)
│  ├─ Vue 应用挂载到 #app
│  ├─ H5 初始化 WebSocket 连接
│  └─ H5 等待 CC 就绪...
│
└─ Cocos 层初始化 ───────────────────────────────┤
   ├─ settings.js 加载
   ├─ boot.js 启动
   ├─ 加载 Cocos 引擎
   ├─ 加载 bundles (main + 子包)
   ├─ 运行场景中的 Main 组件
   │
   ├─ Main.onLoad()
   │   ├─ Telegram SDK 初始化
   │   ├─ GC.init() → DataManager + SDKManager
   │   ├─ 缓存 UI 层节点
   │   ├─ SoundComponent 初始化
   │   ├─ ReconnectComponent 初始化
   │   ├─ H5MsgMgr.init()               ← 注册 postMessage 监听
   │   ├─ registerH5Listeners()         ← 注册 enterTable/syncUser/wsMessage
   │   └─ startHandshake()              ← 设置 __CC_READY__=true，发 ccReady
   │
   └─ Main.start()
       └─ ProcedureManager.Init()
           └─ StartProcedure(Init)
               └─ ProcedureInit.lateEnter()
                   ├─ setCCC()          ← FPS + 多点触摸设置
                   └─ setFit()          ← 屏幕适配
                   └─ 等待 H5 层指令...

═══════════ 握手完成 ═══════════

H5 检测到 __CC_READY__ → 发送 h5Ready
CC 收到 h5Ready → 回复 ccAck → 握手完成 ✓
(或 CC 发送 ccReady → H5 回复 h5Ack → 握手完成 ✓)

═══════════ 正常运行 ═══════════

H5 发送 syncUser → CC 缓存用户数据
H5 发送 syncUserClub → CC 缓存俱乐部
H5 发送 syncRoomsList → CC 缓存房间列表

═══════════ 用户点击进桌 ═══════════

H5 发送 enterTable(token, websocketPort, roomId, roomName)
    │
    ▼
MainUtils 接收消息
    ├─ 验证必要字段 (token, websocketPort, roomId)
    ├─ 从缓存房间列表查找房间详情
    ├─ 设置 LoginSession.Token
    ├─ 填充 GameCache (房间 ID, 类型, 人数, 盲注...)
    └─ ProcedureManager.StartProcedure(EnterTexas)
        │
        ▼
ProcedureEnterTexas.lateEnter()
    ├─ GC.notify.register(Rooms, OnMsgHoldemRooms)  ← 等待房间信息
    ├─ 显示加载界面 (UIPreloading, pre_texas)
    ├─ 创建 TexasGameplayEntrance
    └─ entrance.enterForegroundAsync() → 请求房间信息 via ProtocolAgency.Send
    │
    │  ProtocolAgency.Send 发现 handshakeDone=true
    │  → 走 H5 桥接模式
    │  → 编码 Protobuf → H5MsgMgr.sendToH5('wsSend', binary)
    │  → H5 WebSocket 发送
    │
    ▼
服务器返回房间信息 (Protocol_Holdem_Rooms)
    │
    ▼
ProtocolAgency.Receive(ArrayBuffer from H5 wsMessage)
    → 解析包头 → NotifyManager.post(code, body)
    → OnMsgHoldemRooms 被触发
    ├─ 验证 roomRecord 状态
    ├─ GameCache._roomRecord = roomRecord
    └─ ProcedureManager.StartProcedure(Texas)
        │
        ▼
ProcedureTexas.lateEnter()
    ├─ 确保 GameConfig.Network 已初始化
    ├─ GameCache.InitTexasGame()  ← 创建 TexasGame 实例
    ├─ CurGame.Enter()             ← 进入游戏
    └─ SMAgency.ChangeGameState(Launch)  ← 启动游戏状态机

    H5MsgMgr.sendToH5('h5Hide', 1)   ← 通知 H5 隐藏自身
    #app display:none → 露出 Canvas → 牌桌可见

═══════════ 退出牌桌 ═══════════

ProcedureTexas.Leave()
    ├─ CurGame.Dispose()               ← 销毁牌桌游戏
    ├─ CurGame = null
    ├─ 请求大厅分组数据
    ├─ ReconnectComponent.ChangeStatus(1)
    └─ H5MsgMgr.sendToH5('h5Show', 1)  ← 通知 H5 显示自身
        #app display:block → 覆盖 Canvas → 大厅可见

从牌桌异常退出 (ProcedureEnterTexas.ReturnBackH5)
    ├─ 隐藏加载界面
    ├─ ReconnectComponent.ChangeStatus(1)
    ├─ ProcedureManager.StartProcedure(Idel)
    └─ H5MsgMgr.sendToH5('h5Show', 1)
```

---

## 11. 配置文件、构建和开发命令

### 关键配置文件

| 文件 | 用途 |
|------|------|
| `GameConfig.ts` | 构建类型、网络端点、FPS、分辨率、语言 |
| `tsconfig.json` | TypeScript 编译配置（ES5/CommonJS） |
| `project.json` | Cocos Creator 项目配置（引擎版本 2.4.8） |
| `settings/project.json` | 设计分辨率、端口、排除模块 |

### GameConfig.BuildType → 环境映射（0-5）

| BuildType | 协议 | 主机 |
|-----------|------|------|
| 0 | http | dev.awanptest.com |
| 1 | http | test2.awanptest.com |
| 2 | http | dev1.awanptest.com |
| 3 | https | test2.awanptest.com |
| 4 | https | dev1.awanptest.com |
| **5** (当前) | https | test2.awanptest.com |

### 开发命令

```bash
npm run check:ts              # TypeScript 类型检查
npm run cocos:build:web       # 调试构建
npm run cocos:build:web:release  # 发布构建（MD5 缓存）
npm run verify:code           # 类型检查 + 构建
npm run sync:template         # 同步 index.html 模板
npm run merge:i18n            # 合并 i18n 文件
```

### 相关的 H5 项目

- H5 层代码不在本仓库，在 `h5-game/public/assets/` 的 **同级目录**
- `scripts/sync-template.js` 从 `build-templates/web-mobile/index.html` 提取 Vite 资源引用 → 重建 `preview-templates/index.html`
- `scripts/merge-i18n.js` 从 H5 项目和 CC 项目两边合并 i18n 词典文件

---

## 12. 总结

### 核心设计思想

1. **双 UI 层共存**：H5 (Vue/Vite) 负责大厅业务，Cocos 负责牌桌游戏，通过 z-index 和显示/隐藏切换
2. **H5 作为主控**：所有网络请求由 H5 层代理（WebSocket 连接在 H5 侧），Cocos 通过 `postMessage` 桥接发送和接收协议数据
3. **过程状态机**：9 个 Procedure 管理整体游戏生命周期，H5 桥接模式跳过正常登录/大厅流程
4. **握手协议**：`__CC_READY__` / `ccReady` / `h5Ready` / `ccAck` 四步确保双方都就绪后才开始业务通信
5. **二进制零拷贝**：Protobuf 序列化后的 `ArrayBuffer/Uint8Array` 通过 `structured clone` 直接在 CC 和 H5 间传递，不经过 Base64 编码
