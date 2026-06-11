# UITexasHistory (牌谱 / replay screen) — Figma restyle spec

Maps Figma design **`93:49904`** (file `ZQWVCS9Ro8EH8kNyaiRu2y`) onto the Cocos prefab
`assets/bundles/texas/prefab/widgetLayer/UITexasHistory.prefab` and controller
`assets/script/game/new_ui/UITexasHistory.ts`.

The design is **fully vector + color** — no bitmaps to import (cards, suit pips, pills, icons are all
drawn shapes). So matching it = setting node **colors / opacity / positions** in the editor, plus a few
**code color constants**. Apply in Cocos Creator with live preview.

## Figma color palette

| Purpose | Figma hex | RGBA (0–255) | Notes |
|---|---|---|---|
| Section/row panel | `#000000` @ 0.25 | (0,0,0,64) | translucent dark over the green table |
| Position badge container | `#8053fd` | (128,83,253,255) | purple pill behind position text |
| Result/tag pill — good | `#78e490` | (120,228,144,255) | green |
| Result/tag pill — bad | `#fa2b4b` | (250,43,75,255) | red (also the global accent) |
| Result/tag pill — neutral | `#f9f9f9` | (249,249,249,255) | off‑white |
| Result/tag pill — dark | `#222222` | (34,34,34,255) | dark |
| Body / label text | `#f9f9f9` | (249,249,249,255) | off‑white |

## 1. Already applied (assets, done in repo)

- **Section panels** → `assets/new_texture/dialog/pokerhistory/paipuBlockBg.png` recolored white→**black @25%**.
  Used by `$Dashboard / $Score / $Preflop / $Flop / $Turn / $River / $Showdown`. No node edits needed.
- **Coin/chip** → `assets/new_texture/dialog/coin.png` swapped blue→**red** (app‑wide; also on the main table).

## 2. Prefab node color/opacity changes (Cocos editor)

Node paths are relative to the prefab root. The detail rows (`$Score_Child`, `$Preflop_Child`,
`$Flop_Child`, `$Turn_Child`, `$River_Child`) are **pooled templates** — editing the template child
restyles every runtime instance.

| Element | Node path (within prefab) | Current | Target |
|---|---|---|---|
| Position pill bg | `…/$*_Child/SB` (cc.Sprite) | color (255,255,255) | tint to purple `#8053fd` (128,83,253) to match the badge, or leave white if code tints it |
| Action/card‑type pill bg | `…/$*_Child/CC/BG` (cc.Sprite) | color (0,0,0) | **set by code** — see §3 (don't hard‑set in prefab) |
| Peek / ViewPub buttons | `New Sprite(Splash)/$PeekNode/$PeekButton/Background`, `…/$ViewPubButton/Background` (sprite `f66624d2`) | white | tint to the Figma button fill (dark pill, e.g. `#000` @ ~0.2 or `#8053fd` per design) |
| Favourite button bg | `bg/New Sprite(Splash)/$favoBtn/Background` (`071d3f9b`) | white | match Figma button fill |
| Details toggle bg | `view/$content/$DetailsBtn/Background` (`33923830`) | white | match Figma |
| Header title bar | `$content/$Showdown2/Title/BG` (`a23235d1`) | (24,28,51) op 200 | already close to Figma dark; nudge to taste |
| All label text | each row's `cc.Label` nodes (name/position/result/win text) | mixed | off‑white `#f9f9f9` (249,249,249) where the design shows white text |

> The main panel background (`bg` → shared `new_dialog_bg.png`, 9 dialogs) is **shared** — don't overwrite
> it. If this screen needs a different panel, give it a dedicated texture and repoint the `bg` sprite.

## 3. Code color changes (`UITexasHistory.ts`)

The result/hand‑strength pill (`CC/BG`) and win text are tinted at runtime (≈ lines 205–208, 1929–1943).
Update the constants to the Figma palette:

```ts
// current → Figma
color_green  = cc.color(86, 181, 87);   // → cc.color(120, 228, 144)  #78e490
color_red    = cc.color(230, 68, 85);   // → cc.color(250, 43, 75)    #fa2b4b
color_yellow = cc.color(255, 184, 83);  // keep (no direct Figma token) or tune
color_gray   = cc.color(198, 198, 198); // keep
```

`setChildColor(go, 'CC/BG', …)` (lines ~1929–1939) applies these to the result pill; `setChildColor(go,
'win', …)` (line ~1943) the win/loss text. Changing the constants updates every row.

## 4. Layout / spacing (editor only, by eye)

The Figma rows are tighter and the position badge sits left of the name with the colored pill. These are
positional tweaks (anchor/offset/Layout spacing) best done by dragging in the editor against the Figma
frame — not scriptable reliably. Reference: Figma sections `93:49930` (Dashboard), `93:50161`/`93:50349`/
`93:50431` (发发看 / 偷偷看 / flop blocks).

## Reference

Figma render of the target: open node `93:49904` in the linked file. See memory
`pokerqueen-replay-screen` and `figma-asset-import-workflow` for export details.
