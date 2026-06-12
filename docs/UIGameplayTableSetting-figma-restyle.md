# UIGameplayTableSetting (牌局配置 / Table Config) — Figma restyle spec

Maps Figma **`93:59902`** ("Frame 1171280919", 317x480) onto prefab
`assets/resources/main/prefab/dialog/UIGameplayTableSetting.prefab` (controller
`assets/script/ui/dialog/UIGameplayTableSetting.ts`). This dialog lists table config rows via
`FillData(key,label,value,color)` — it has MORE rows than the Figma mock (squid/mushroom/jackpot
etc.), which is expected; the restyle is about look, not row set.

The design is **vector + gradient** (no bitmaps to import). Restyle = node colors/opacity in the editor.

## Figma palette
| Element | Figma | RGBA |
|---|---|---|
| Panel bg (Frame 1171280919) | linear gradient | `#8E8E8E`@0.6 → `#676767`@0.8 → `#494949`@1.0 (top→bottom) |
| Title "牌局配置" | white, ~19px | (255,255,255) |
| Note box (Frame 1171281578) | `#3C3C3C` @0.40, rounded | (60,60,60,102) |
| Note icon + text | white, ~13px | (255,255,255) |
| Row list bg (Frame 1171281579) | `#000000` @0.20, rounded | (0,0,0,51) |
| Row label + value | white, ~15px | (255,255,255) |
| Divider lines | white @0.09, ~1px | (255,255,255,23) |
| 确定 button bg | gradient white→`#E6E6E6`, radius ~30 | (255,255,255)→(230,230,230) |
| 确定 text | green | `#78E490` (120,228,144) |

## Already matching (no change needed)
- **Dividers** `…/Sprite_Line` are already white @ opacity 23 (≈9%) — exact match.
- **Row labels** `…/titleContent/title` are `#F3F3F3` (≈white) — close; set to pure white if you want exact.
- **Title / values** already white. **确定** text already green `#78E490`. Structure (title, note row, list rows, button) already matches.

## Applied in repo (2026-06-12)
- **Panel darkened to Figma gray** (was light `dialog_bg1`+white `new_dialog_bg`):
  node `main copy` (#8) tinted `#6E6E6E`, node `main` (#11) tinted `#545454`. Flat approximation of the
  gradient. (The shared `new_dialog_bg.png` / `dialog_bg1.png` were NOT overwritten — only this dialog's
  node tints, so other dialogs are unaffected.)
- **确定 button restyled to Figma `93:59949`** (light pill + green text): `Button_Commit/Commit_Bg` (#248)
  sprite repointed from green `dialog_btn_bg1` to light `dialog_btn_bg2.png` (`c81614df`); `Text_Commit`
  (#250) color → green `#78E490`. `dialog_btn_bg2` is medium-light gray; for the exact near-white
  `#FFF→#E6E6E6` gradient, generate a dedicated pill texture.

## Remaining (editor — needs gradient / structural)
1. **True panel gradient** — node tint is flat. For the exact `#8E8E8E→#494949` vertical gradient, either
   set a gradient in the editor, or assign a dedicated rounded gradient texture to `main` (#11) (don't
   reuse the shared white 9-slice). I can generate that PNG on request.
2. **Note box bg** — Figma wraps the "请注意…防作弊" note in a `#3C3C3C`@40% rounded box. The prefab `Tip`
   (#23) currently has only a `cc.Layout`, no bg. Add a rounded sprite behind it tinted (60,60,60,102).
3. **Row list bg** — Figma shows `#000`@20% behind the rows (`content` #35 / `dialog_bg2`). Tint that node
   toward black @ ~20% if you want the rows to sit on a darker strip.
4. **确定 button** — Figma is a light pill (white→#E6E6E6, radius 30) with green text. Confirm the prefab's
   bottom button matches; tint/round to taste.

## Reference
Figma render: open `93:59902` in file `ZQWVCS9Ro8EH8kNyaiRu2y`. See `figma-asset-import-workflow` memory.
