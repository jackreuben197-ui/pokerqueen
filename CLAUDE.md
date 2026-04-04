# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Texas Hold'em poker game built with **Cocos Creator 2.4.8** and **TypeScript**. The game features a complete poker experience with lobby, matchmaking, club management, MTT tournaments, and real-time multiplayer gameplay.

**Engine:** Cocos Creator 2.4.8  
**Language:** TypeScript  
**Design Resolution:** 1242x2688 (configurable in GameConfig.ts)  
**Target Platform:** Web (web-mobile)

## Common Development Commands

### Type Checking
```bash
npm run check:ts
# or
tsc -p tsconfig.json --noEmit
```

### Build Commands
```bash
# Debug build for web
npm run cocos:build:web

# Release build with MD5 cache
npm run cocos:build:web:release

# Full verification (type check + build)
npm run verify:code
```

### Protocol Buffer Generation
```bash
# Generate JS from proto files (in proto/ directory)
pbjs -t static-module -w commonjs -o proto.js *.proto

# Generate TypeScript definitions
pbts -o proto.d.ts proto.js
```

## Project Architecture

### Game Flow System (Procedure-based)
The game uses a **Procedure-based state machine** for high-level flow control:
- `ProcedureManager` manages all game procedures (login, lobby, gameplay)
- Each procedure extends `ProcedureBase` (e.g., `ProcedureLogin`, `ProcedureLobby`, `ProcedureTexas`)
- Flow: Init → PrelLoadLogin → Config → Login → EnterLobby → Lobby → (EnterTexas → Texas)

Entry point: `assets/script/Main.ts` initializes `ProcedureManager.StartProcedure(ProcedureEnum.Init)`

### UI System
The UI system uses a layered architecture managed by `UIMgr`:
- **Scenes**: LoginScene, LobbyScene, UITexas (game table)
- **Forms**: Modal windows (settings, dialogs, forms)
- **Components**: Reusable UI elements
- **Dialogs**: Popups and alerts
- **Items**: List items and cards

UI layers (from bottom to top):
- Scene (main game scenes)
- Form (windows/modals)
- Board (overlay windows)
- Dialog (popups)
- Alert (alerts)
- Toast (toasts)
- Block (loading/overlay)

All UI definitions are centralized in `assets/script/define/UIDefine.ts`

### Network Architecture
**WebSocket + Protobuf** for real-time multiplayer:
- `WebSocketClient`: Low-level WebSocket connection management
- `ProtocolAgency`: High-level protocol sending/receiving
- `ProtocolHoldemMessages`: Protocol message definitions and mapping
- `PacketHead`: Packet header structure (OpCode, RoomID, MatchID)

Protocol files in `assets/script/net/websocket/`:
- `ProtocolCode.ts`: Protocol opcodes enumeration
- `ProtocolHoldemMessages.ts`: Message type mapping
- `ServerErrorCode.ts`: Error code definitions

### Game Logic
**Texas Hold'em gameplay** is organized as:
- `UITexas`: Main game table UI controller
- `SeatFSM`: Finite state machine for each seat
- `TexasGameStateHandler`: Game flow state management
- `GameCache`: Runtime game state cache
- `CardTypeUtil`: Poker hand evaluation utilities

Player data:
- `CPlayer`: Player data model
- Seat state management in `assets/script/game/seat/`

### Data Management
**Data layer** in `assets/script/frame/data/`:
- `user/`: User profile and settings
- `lobby/`: Lobby data (rooms, matches)
- `club/`: Club-related data
- `mtt/`: MTT tournament data
- `wallet/`: Currency and transaction data
- `rate/`: Exchange rate data
- `languageTemplate/`: i18n translations

### Resource Management
- `ResManager`: Asset loading and bundle management
- Prefab-based UI loading from bundles
- Bundles: `assets/bundles/texas/` contains game-specific assets

## Key Configuration Files

- **GameConfig.ts** (`assets/script/config/GameConfig.ts`): 
  - Build type selection (dev/test/prod)
  - Server endpoints
  - Game settings (resolution, FPS, multi-touch)
  
- **tsconfig.json**: TypeScript compiler configuration
  - Target: ES5
  - Module: CommonJS
  - Experimental decorators enabled (for Cocos Creator components)

- **UIDefine.ts** (`assets/script/define/UIDefine.ts`): Centralized UI definitions with bundle paths

## Important Patterns

### Component Registration
All Cocos Creator components use `@ccclass` decorator:
```typescript
const { ccclass, property } = cc._decorator;

@ccclass
export default class MyComponent extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
}
```

### Protocol Communication
```typescript
// Sending a protocol
ProtocolAgency.Send({
    Code: ProtocolCode.Req_JoinRoom,
    RoomID: roomId,
    MatchID: matchId,
    Body: { /* protocol data */ }
});

// Receiving: Register handler in messageHandler classes
```

### Opening UI
```typescript
UIFormMgr.Instance.open(UIDefine.MyForm, params, {
    show: () => { /* on show */ },
    close: () => { /* on close */ }
});
```

## Code Organization

```
assets/script/
├── frame/          # Framework code (GameControl, managers, SDK)
├── manager/        # Global managers (Procedure, Scene, Resource, Toast)
├── procedure/      # Game flow procedures
├── ui/             # UI framework and base classes
├── game/           # Game logic (Texas Hold'em, seats, cards)
├── lobby/          # Lobby screens and features
├── login/          # Login and registration
├── net/            # Network layer (WebSocket + HTTPS)
├── protobuf/       # Generated protobuf code
├── config/         # Configuration files
├── define/         # Type definitions and enums
├── tools/          # Utility functions
├── sound/          # Audio management
└── Main.ts         # Entry point
```

## Telegram Integration

The game integrates with **Telegram WebApp SDK** for mobile web deployment:
- `TelegramUtils` handles Telegram-specific functionality
- Debug info is logged on startup when running in Telegram
- Check `TelegramUtils.Instance.isInTelegram` for Telegram environment

## Development Notes

- The project uses **Cocos Creator 2.4.8** - an older version
- TypeScript files are compiled to CommonJS modules
- Protobuf files must be manually regenerated when `.proto` files change
- The build process uses a custom Cocos CLI wrapper (`scripts/cocos_cli.js`)
- Game uses **cc.Node** hierarchy for all UI elements
- Prefabs are organized in bundles for lazy loading

## Testing

No automated test framework is currently configured. Manual testing is done through:
- Cocos Creator editor preview
- Web builds served via HTTP server
- GM commands (debug interface available via `UIGMComponent`)
