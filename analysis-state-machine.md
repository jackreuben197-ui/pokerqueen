# 德州牌桌状态机 — 完整机制分析

## 一、状态机框架层（通用）

```
statemachine/
├── StateMachine.ts      # 状态机引擎（previousState/currentState → ChangeState/UpdateStateMachine）
├── StateHandler.ts      # 状态基类（Enter → Execute → Exit 三生命周期）
└── FSMState.ts          # 座位级单例状态基类（同生命周期）
```

`StateMachine.ChangeState(newState)` 的核心逻辑（`statemachine/StateMachine.ts:19-34`）：
```
oldState.Exit(owner) → 替换 currentState → newState.Enter(owner)
```

每帧驱动：`UpdateStateMachine(dt)` → `currentState.Execute(owner, dt)`

---

## 二、两层状态机架构

牌桌内有两套独立的状态机，通过 `FSMLogicComponent` 挂到 `UpdateComponent` 每帧刷新：

| 层级 | 状态机 | 实体 | 状态枚举 | 文件 |
|------|--------|------|---------|------|
| **游戏层** | `TexasSMAgency` | `TexasGame` | `TexasGameState` (17个状态) | `game/TexasGameState.ts` |
| **座位层** | `SeatFSM`（每座一个） | `Seat` | `SeatXxx`（25个状态） | `game/SeatStateHandler.ts` |

```
TexasGame
  ├── GameLogicSMComponent: FSMLogicComponent
  │       └── SM: StateMachine ──── 游戏层状态机 ────→ 17个 TexasGameStateHandlerXxx
  │
  └── listSeat[0..8]: Seat
          └── FsmLogicComponent: FSMLogicComponent
                  └── SM: StateMachine ──── 座位层状态机 ────→ 25个 SeatXxx 状态
```

驱动入口：`UpdateComponent.Instance.Update(dt)` → 遍历所有 `IUpComponent`（含每个 `FSMLogicComponent`）→ `SM.UpdateStateMachine(dt)`

---

## 三、游戏层状态枚举（17个）

文件：`game/TexasGameState.ts`

| 枚举值 | 含义 |
|--------|------|
| `None` | 无状态 |
| `NetworkException` | 网络异常（可处理重连逻辑） |
| `Launch` | 启动（进入房间逻辑） |
| `Init` | 初始化（进入房间后相关初始化） |
| `Exit` | 退出玩法 |
| `ExchangeRoom` | MTT拆并桌换房间 |
| `NotStart` | 游戏还未开局 |
| `WaitHandStart` | 游戏已开局，等待一手开始 |
| `HandStarted` | 一手开始，还未发底牌 |
| `HandPreflop` | 翻牌前下注（已发手牌） |
| `HandFlop` | 翻牌轮下注（已发三张公牌） |
| `HandTurn` | 转牌轮下注（已发四张公牌） |
| `HandRiver` | 河牌轮下注（已发五张公牌） |
| `HandShowdown` | 结算状态 |
| `HandEnd` | 一手结束 |
| `Cancel` | 牌局被取消 |
| `Complete` | 牌局正常结束 |
| `Unknown` | 游戏状态未知（后端异常） |

---

## 四、游戏层状态机 — 注册

文件：`game/TexasSMAgency.ts`

```typescript
LoadGameStateConf() {
    GameSMStates.set(NetworkException, new TexasGameStateHandlerNetworkException);
    GameSMStates.set(Launch,            new TexasGameStateHandlerLaunch);
    GameSMStates.set(Init,              new TexasGameStateHandlerInit);
    GameSMStates.set(Exit,              new TexasGameStateHandlerExit);
    GameSMStates.set(ExchangeRoom,      new TexasGameStateHandlerExchangeRoom);
    GameSMStates.set(NotStart,          new TexasGameStateHandlerNotStart);
    GameSMStates.set(WaitHandStart,     new TexasGameStateHandlerWaitHandStart);
    GameSMStates.set(HandStarted,       new TexasGameStateHandlerHandStarted);
    GameSMStates.set(HandPreflop,       new TexasGameStateHandlerHandPreflop);
    GameSMStates.set(HandFlop,          new TexasGameStateHandlerHandFlop);
    GameSMStates.set(HandTurn,          new TexasGameStateHandlerHandTurn);
    GameSMStates.set(HandRiver,         new TexasGameStateHandlerHandRiver);
    GameSMStates.set(HandShowdown,      new TexasGameStateHandlerHandShowdown);
    GameSMStates.set(HandEnd,           new TexasGameStateHandlerHandEnd);
    GameSMStates.set(Complete,          new TexasGameStateHandlerComplete);
    GameSMStates.set(Cancel,            new TexasGameStateHandlerCancel);
    GameSMStates.set(Unknown,           new TexasGameStateHandlerUnknown);
}
```

切换方法 `ChangeGameState(state, sourceData)`：
1. 相同状态直接返回
2. 从 Map 取出 StateHandler
3. 设 `game.GameState = state`
4. 设 `stateHandler.SourceData = sourceData`
5. `game.GameLogicSMComponent.SM.ChangeState(stateHandler)`

---

## 五、座位层状态枚举（25个）

文件：`game/SeatStateHandler.ts`

| 状态 | 含义 |
|------|------|
| `SeatIdle` | 座位待机 |
| `SeatEmpty` | 空座位 |
| `SeatSitAnimation` | 坐下动画 |
| `SeatSit` | 坐下 |
| `SeatWaitStart` | 等待开始 |
| `SeatWaitBlind` | 等待补盲 |
| `SeatStandup` | 站起 |
| `SeatStandupAnimation` | 站起动画 |
| `SeatStart` | 每手开始 |
| `SeatStraddle` | Straddle状态 |
| `SeatStartToPlaying` | 开始转游戏中 |
| `SeatOperation` | 操作中 |
| `SeatWaitOther` | 等待其他玩家操作 |
| `SeatPutChip` | 下注 |
| `SeatCall` | 跟注 |
| `SeatRaise` | 加注 |
| `SeatAllin` | 全下 |
| `SeatCheck` | 让牌 |
| `SeatFold` | 弃牌 |
| `SeatRoundEnd` | 本轮结束 |
| `SeatKeep` | 留座离桌 |
| `SeatAddChips` | 带入 |
| `SeatInsurance` | 购买保险 |
| `SeatMuck` | 亮牌 |
| `SeatReturnGame` | 返回游戏 |

所有座位状态通过单例模式获取：`SeatXxx.Instance`

---

## 六、游戏层状态机 — Handler 触发链路

### 6.1 Launch → 请求进入房间

文件：`game/TexasGameStateHandler.ts:33-70`

`TexasGameStateHandlerLaunch.Enter()`:
```
game.RegiterEnterRoom()   → 注册进入房间的消息回调
game.EnterRoom()          → TexasGameUtils.EnterRoom() → ProtocolAgency.Send(EnterRoom)
开始超时计时
```

### 6.2 Init — 服务器返回 EnterRoom → 场景入场

文件：`game/messageHandler/TexasGameMessageHandler.ts:192`

```typescript
// 进入房间成功
if (response.status == 0) {
    sceneManager.switchScene(UITexas)           // 切换到牌桌场景
    game.SMAgency.ChangeGameState(Init, response)  // 进入 Init 状态
}
// 失败
else {
    game.SMAgency.ChangeGameState(Exit, response)
}
```

### 6.3 Init → RegisterMsgHandler + UpdateRoom → 按 gameStatus 切换

文件：`game/TexasGameStateHandler.ts:72-106`

`TexasGameStateHandlerInit.Enter()`:
```
UIComponent.Instance.HideUI(UIPreloading)
GameCache.Instance.CurrentRoomID = room_id
CurGame.RegisterMsgHandler()    // 注册所有协议消息回调
CurGame.UpdateRoom(source)      // 更新座位/玩家/筹码/游戏状态
```

### 6.4 UpdateRoom — 按 gameStatus 切换

文件：`game/texas/TexasGame.ts:1152-1211`

| 服务端 `Def.GameStatus` | 切换到 `TexasGameState` |
|--------------------------|--------------------------|
| `NOT_START` | `NotStart` |
| `WAIT_HAND_START` | `WaitHandStart` |
| `HAND_STARTED` | `HandStarted` |
| `HAND_FLOP` | `HandFlop` |
| `HAND_TURN` | `HandTurn` |
| `HAND_RIVER` | `HandRiver` |
| `HAND_END` | `WaitHandStart`（循环下一手） |
| `COMPLETE` | `Complete` |
| `CANCEL` | `Cancel` |

### 6.5 HandStarted → HandPreflop 自动联动

文件：`game/TexasGameStateHandler.ts:107-129`

```typescript
TexasGameStateHandlerHandStarted.Enter():
    game.SMAgency.ChangeGameState(HandPreflop, this.SourceData)
```

`TexasGameStateHandlerHandPreflop.Enter()`:
```typescript
game.TexasGameProtocol.handleRecvStartInfoCommon(source)  // 处理发手牌数据
```

### 6.6 服务端推送 → 状态切换

所有后续状态切换由 **服务端消息推送触发**，调用点集中在：

| 文件 | 服务端协议 | 切换到的状态 |
|------|-----------|------------|
| `TexasGameMessageHandler.ts:356` | `Protocol_Holdem_StartInfo` | `HandStarted` |
| `TexasGameMessageHandler.ts:480` | `Protocol_Holdem_Winner` | `HandShowdown` |
| `TexasGameMessageHandler.ts:449` | `Protocol_Holdem_HandClear` | `HandEnd` |
| `TexasGameMessageHandler.ts:203` | `Protocol_Holdem_Leave` | `Exit` |
| `TexasGameMessageHandler.ts:379-415` | 各种错误码 | `Exit` |
| `TexasGameProtocol.ts:864,949` | 网络异常 | `NetworkException` |

---

## 七、座位层状态机 — Handler 触发链路

文件：`game/SeatStateHandler.ts`

每个 `SeatXxx` 状态继承 `StateHandler`，`Enter/Execute/Exit` 调用 `SeatFSM` 对应方法：

```typescript
export class SeatOperation extends StateHandler {
    Enter(entity) { if (entity instanceof SeatFSM) entity.OperationEnter(); }
    Execute(entity) { if (entity instanceof SeatFSM) entity.OperationExecute(dt); }
    Exit(entity)   { if (entity instanceof SeatFSM) entity.OperationExit(); }
}
```

`SeatFSM` 文件中实现具体逻辑，例如 `OperationEnter()`（`game/SeatFSM.ts:281-293`）：
```
如果是自己的座位:
    播放转向音效
    开启摄像头（麦序模式）
如果是别人的座位:
    显示倒计时
```

触发来源：

| 触发来源 | 文件/方法 | 典型状态切换 |
|---------|----------|------------|
| 服务器坐下/站起通知 | `TexasGameProtocol.handleRecvSeatInfo` | `SeatSit` / `SeatEmpty` |
| 服务器操作通知 | `TexasGameProtocol.handleActionPerformed` | `SeatFold/Check/Call/Raise/Allin` |
| 服务器换手清理 | `TexasGameProtocol.HandleRoundFinish` | `SeatRoundEnd` |
| 轮到玩家操作 | `TexasGame.setOperationSeat` | `SeatOperation` |
| 留座离桌 | `TexasGame.OnKeep` | `SeatKeep` |
| 补盲 | `TexasGame.WaitBlind` | `SeatWaitBlind` |
| 带入筹码 | `TexasGameProtocol.HandleBringIn` | `SeatAddChips` |

---

## 八、完整生命周期链（时序）

```
用户点击进桌 H5→enterTable
    │
    ▼
ProcedureManager.StartProcedure(EnterTexas)
    → 加载牌桌场景资源
    → 创建 TexasGameplayEntrance → 请求房间信息（Rooms协议）
    → 验证房间状态 → ProcedureManager.StartProcedure(Texas)
        │
        ▼
ProcedureTexas.lateEnter()
    → InitTexasGame()  → TexasGame 实例 / 座位创建 / FSMLogicComponent 创建
    → CurGame.Enter()  → 初始化
    → SMAgency.ChangeGameState(Launch)
        │
        ▼  [Launch Handler]
        RegiterEnterRoom() + EnterRoom()  → 服务端: 请求进入房间
        │
        ▼  [Server: EnterRoom Response]
        Scene → UITexas 场景入场
        SMAgency.ChangeGameState(Init, response)
        │
        ▼  [Init Handler]
        RegisterMsgHandler()  → 注册所有协议消息回调
        UpdateRoom(source)    → 恢复座位/玩家/筹码/游戏状态
        └─→ 根据 gameStatus 切换到 NotStart / WaitHandStart / HandStarted / ...
            │
            ▼  [Server 推送: StartInfo]
            SMAgency.ChangeGameState(HandStarted)
            │
            ▼  [HandStarted Handler]
            自动联动 → SMAgency.ChangeGameState(HandPreflop)
            │
            ▼  [Server 推送: ActionLimits]
            轮到玩家操作 → Seat.ChangeState(SeatOperation)
            │
            ▼  [Server 推送: PublicCards]
            SMAgency.ChangeGameState(HandFlop / HandTurn / HandRiver)
            │
            ▼  [Server 推送: Winner]
            SMAgency.ChangeGameState(HandShowdown)
            │
            ▼  [Server 推送: HandClear]
            SMAgency.ChangeGameState(HandEnd)
            │
            ▼  [循环或结束]
            循环 → 切换 WaitHandStart → HandStarted → HandPreflop → ...
            结束 → 切换 Complete / Cancel
            │
            ▼  [Exit Handler]
            TexasGameUtils.ExitRoom()  → ProcedureManager(Idel)
            → H5MsgMgr.sendToH5('h5Show')
```

---

## 九、关键文件索引

| 文件 | 角色 |
|------|------|
| `statemachine/StateMachine.ts` | 状态机引擎（ChangeState / UpdateStateMachine） |
| `statemachine/StateHandler.ts` | 状态基类（Enter / Execute / Exit） |
| `game/TexasGameState.ts` | 17个游戏状态枚举 |
| `game/TexasSMAgency.ts` | 游戏状态机注册 + ChangeGameState |
| `game/TexasGameStateHandler.ts` | 17个游戏状态的具体处理逻辑 |
| `game/FSMLogicComponent.ts` | 桥接：将 StateMachine 接入 UpdateComponent 每帧刷新 |
| `game/SeatStateHandler.ts` | 25个座位状态定义（单例模式） |
| `game/SeatFSM.ts` | 座位状态转换的具体 UI 操作实现 |
| `game/messageHandler/TexasGameMessageHandler.ts` | 服务端消息 → 游戏状态切换 |
| `game/protocol/TexasGameProtocol.ts` | 服务端消息 → 游戏/座位状态切换 |
| `game/texas/TexasGame.ts` | 游戏实体，持有 SMAgency + GameLogicSMComponent |
| `procedure/ProcedureTexas.ts` | 启动入口：Launch 状态 |
| `procedure/ProcedureEnterTexas.ts` | 进桌前置：资源加载、房间验证 |
