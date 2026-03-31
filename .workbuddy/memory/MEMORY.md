# 项目长期记忆

## 项目基本信息
- **项目名称**: pokerqueen (PokerQueen_Base)
- **引擎**: CocosCreator 2.4.8（TypeScript）
- **分辨率**: 竖屏 1125×2436 / 设计分辨率 1242×2688
- **游戏类型**: 德州扑克（NLH/PLO4/PLO5/PLO6/6+）手游
- **多语言**: 中文/英文/葡萄牙语
- **特殊集成**: Telegram WebApp SDK

## 核心架构
- **入口**: `Main.ts` → `ProcedureManager.Init()` 启动流程状态机
- **全局控制器**: `GC (GameControl)` 单例，聚合所有 Manager
- **流程状态机**: Idle→Init→PrelLoadLogin→Config→Login→EnterLobby→Lobby→EnterTexas→Texas
- **网络层**: HTTP（WebRequest.ts）+ WebSocket + Protobuf 协议
- **UI 层**: UIComponent 管理多层级 UI（Scene/Form/Board/Dialog/Alert/Toast 等）

## 目录结构
- `script/frame/` - 基础框架（GameControl、DataManager、NotifyManager 等）
- `script/procedure/` - 流程状态机
- `script/lobby/` - 大厅模块（包含 new_club 公会系统）
- `script/new_lobby/` - 新版大厅（index/me/message/vip）
- `script/game/` - 牌桌游戏逻辑（Texas FSM、座位管理等）
- `script/net/` - 网络层（https + websocket）
- `script/session/` - Session 管理（Lobby/Login/Global）
- `script/protobuf/` - Protobuf 协议文件
- `bundles/texas/` - 牌桌资源 Bundle（动态加载）

## 当前分支
- `branch-clubs` - 俱乐部相关功能开发分支
- 修改中文件：`assets/script/lobby/view/LobbyScene.ts`
