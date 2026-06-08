# pokerqueen

## 子模块更新 

git submodule update --init --recursive --remote

## 同步Hybrid代码

```shell
# h5 code sync
npm run sync:h5-game #pnpm run sync:h5-game
# protocol sync (pb)
npm run sync:proto
```

## 格式化代码

```shell
#可能缺失pretty，需要 npm install
node ./fmt-blanklines.js
```

## SSH密匙使用方法
1.
```
ssh-keygen -t rsa -C "你在gitee/github/gitlab上注册帐号时填写的邮箱"
```
SSH密匙生成命令,一路回车  

2.
```
C:\Users\Admin\.ssh\id_rsa.pub
```
打开文件 -> 拷贝内容至gitlab/github 网站上添加SSH   

3.clone库代码，私钥指向 C:\Users\Admin\.ssh\id_rsa 文件   

4.完成

## 开发工具
cocoscreator 2.4.8
## 设计分辨率
1125x2436

## protobuf 安装和使用（备忘）

1.安装protobufjs到全局   

npm install -g protobufjs   

将模块安装到全局方便全局使用protobufjs提供的pbjs命令行工具。   

pbjs可以将proto原文件转换成json、js   

pbts，用来将转化后的js文件转为ts   

2.把下载好的protobuf中这个文件夹下的protobuf.js文件 把这个文件拖到Creator工程中并且导入为插件   

3.创建.proto消息文件
```
package ntesgame;

message ClientRegister {
    required string userId = 1;
    repeated string deviceId = 2;
    option string userToken = 3;
}
```
ntesgame 是包名，转换成js 或ts 后就是 命名空间   

ClientRegister 是 消息结构   

required 是 必须有的变量   

4.
在保存proto文件的目录下打开命令行执行如下命令   

将文件中所有的.proto文件转化为一个proto.js文件）   

pbjs -t static-module -w commonjs -o proto.js *.proto   

将proto.js文件 转为 proto.d.t文件   
pbts -o proto.d.ts proto.js   

5.protobuf设置为插件后 修改proto.js中protobuf的引用   
```
var $protobuf = protobuf
```
6.然后把proto.js 或 proto.d.ts文件放入项目代码目录中 即可   

7.测试
```
@ccclass
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let msg = ntesgame.ClientRegister.create({userId:"123",deviceId:"22",userToken:"ff"})
        let encode = ntesgame.ClientRegister.encode(msg).finish();
        console.log("编码:",JSON.stringify(encode))
        this.scheduleOnce(()=>{
            let decode = ntesgame.ClientRegister.decode(encode)
            console.log("解码：",JSON.stringify(decode))

        },3)
    }

    // update (dt) {}
}

```

8. Md5库安装

npm install ts-md5 --save  

```

9. 其它内容:

## H5 桥接重连机制

H5 桥接模式下 WebSocket 由 H5 层独占管理，Cocos 通过桥接事件感知断线/重连状态。完整协议参见 `h5-game/src/bridge/README.md §9`，本节只覆盖 Cocos 侧的契约。

### 入口文件

| 文件 | 作用 |
|------|------|
| `assets/script/funcomponent/BridgeReconnectComponent.ts` | 重连流程组件（监听桥接事件 + 控制 `Main.Reconnect` 遮罩 + Register 回包处理 + 暴露 `IsReconnecting()` / `ConsumeReconnectFlag()`） |
| `assets/script/H5MsgMgr.ts` | 桥接消息总线；声明 `wsReconnecting/wsReconnected/wsReconnectFailed` 类型 |
| `assets/script/MainUtils.ts` | `wsClosed` 仅做日志（H5 已自动重连） |
| `assets/script/Main.ts` | `BridgeReconnectComponent.Instance.Start()` 与 `H5MsgMgr.Instance.init()` 一起在 `onLoad` 启动 |
| `assets/script/game/messageHandler/TexasGameMessageHandler.ts` | `Protocol_Holdem_EnterRoom_Handler` 内调 `ConsumeReconnectFlag()` 触发 `ReEnterClear()`（牌桌侧清场闭环） |

### 事件流向

```
[H5 wsProxy] ──wsReconnecting──▶ [Cocos BridgeReconnectComponent]
                                       │
                                       ▼
                       显示 Main.Reconnect 遮罩 + _inReconnectFlow = true
                                       │
[H5 wsProxy] ──wsReconnected──▶  等 8s 兜底定时器 OR 等服务端 REGISTER 回包
                                       │
[Server]    ──Protocol_Holdem_Register──▶ ProtocolAgency.Receive
                                       │
                                       ▼
                            OnRegisterAck (隐遮罩) + CurGame.ReEnterRoom()
                                       │
                                       ▼ (发 Protocol_Holdem_EnterRoom)
[Server]    ──Protocol_Holdem_EnterRoom──▶ TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler
                                       │
                                       ▼
                       ConsumeReconnectFlag() === true → ReEnterClear() (清桌)
                                       │
                                       ▼
                       正常进房流程 (ChangeGameState INIT 等)

[H5 wsProxy] ──wsReconnectFailed──▶ Toast + sendToH5('h5Navigate', { name: 'login', replace: true })
                                  + _inReconnectFlow = false
```

### 触发主动重连

```ts
import BridgeReconnectComponent from './funcomponent/BridgeReconnectComponent';

// 牌桌错误码 / GM 工具中主动触发
BridgeReconnectComponent.Instance.StartReconnect();
// 等价于：H5MsgMgr.sendToH5('wsConnect', 1, { port, roomId, matchId, force: true });
```

### 玩法恢复钩子

`Protocol_Holdem_Register` 回包默认走 `BridgeReconnectComponent._onProtocolRegister`：

- `body.status === 0` → 调 `OnRegisterAck()` 收掉遮罩；若 `GameCache.Instance.CurGame` 存在再调 `ReEnterRoom()`
- 其他状态 → 仅打 warn，等 `wsReconnectFailed` 兜底（不强行 Logout，避免和 H5 的回登录页流程打架）

`Protocol_Holdem_EnterRoom` 回包（`TexasGameMessageHandler.Protocol_Holdem_EnterRoom_Handler`）补一次清场：

```ts
// 桥接链路：BridgeReconnectComponent.ConsumeReconnectFlag() 在 wsReconnecting → EnterRoom 回包闭环期间返回 true
const isOldReconnect = ReconnectComponent.Instance.CheckMask();
const isBridgeReconnect = BridgeReconnectComponent.Instance.ConsumeReconnectFlag();
if (isOldReconnect || isBridgeReconnect) {
    GC.game?.ReEnterClear();   // 清公牌 / 座位 / 弹窗 / 报告 UI
}
```

对齐 Unity 的做法：`OnMsgEnterRoom` 里 `_gameStatusRestoreHandler.Invoke(status)` 闭环 `NetworkDetectionComponent` 的恢复任务；Cocos 端没有 FSM `NETWORK_EXCEPTION` 状态，因此用 `ReEnterClear()` 做最小等效——重连成功后清掉脏 UI 再走正常进房流程。

如需牌桌特殊恢复逻辑，扩展 `TexasGame.ReEnterRoom()` / `ReEnterClear()` 即可，不必修改桥接层。

### 注意事项

- 桥接模式下 `LobbySession.Init()` 并未被调用，因此 Cocos 端 `HeartbeatComponent` 不会激活；心跳完全由 H5 维护（5s 间隔、连续 5 次无响应触发重连）
- 单次重连退避 1s → 10s（指数）；整体放弃阈值 10 次或 60s，命中即 `wsReconnectFailed`
- 触发来源 `reason`：`close | heartbeat | visibility | online | force`
- 鉴权失败的 reason 为 `auth-invalid`，此时不再二次 `h5Navigate`（H5 端 `forceToLoginFromWs` 已经接手跳转）