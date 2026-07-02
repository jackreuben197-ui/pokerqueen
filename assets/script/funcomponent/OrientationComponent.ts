/**
 * 横屏时候的提示
 *
 * 注意: 软键盘弹出时会压缩 viewport 高度,在 Telegram WebView 中可能让 window.orientation
 * 短暂误报横屏。Update 中先用 isKeyboardLikelyOpen 过滤,再做方向判断。
 */
import Main from '../Main';
import { IUpComponent } from './UpdateComponent';
const { ccclass, property } = cc._decorator;

@ccclass
export default class OrientationComponent implements IUpComponent {
    active: boolean = true;

    Update(dt: number) {
        if (Main.Orientation == null) {
            return;
        }

        const keyboardOpen = this.isKeyboardLikelyOpen();

        // 优先级最高: 软键盘弹出时强制隐藏遮罩,跳过方向判断
        if (keyboardOpen) {
            if (Main.Orientation.active) {
                console.log('[Orient-Diag] 键盘被检测到 → 隐藏横屏');
                Main.Orientation.active = false;
            }
            return;
        }

        // 真实设备方向判断
        const landscape = this.isDeviceLandscape();

        // [Orient-Diag] 只在"即将显示横屏"瞬间打印完整诊断，定位键盘弹出时误判横屏的根因
        if (landscape && !Main.Orientation.active) {
            const tg = (window as any).Telegram?.WebApp;
            console.log('[Orient-Diag] ⚠️ 即将显示横屏！诊断值：', {
                tgFlag: (window as any).__TG_KEYBOARD_OPEN__,
                innerW: window.innerWidth,
                innerH: window.innerHeight,
                screenW: window.screen.width,
                screenH: window.screen.height,
                ratio: Number((window.innerHeight / window.screen.height).toFixed(3)),
                vvH: (window as any).visualViewport?.height,
                vvScale: (window as any).visualViewport?.scale,
                windowOrientation: (window as any).orientation,
                screenAngle: (screen as any).orientation?.angle,
                screenType: typeof (screen as any).orientation,
                matchMedia: typeof window.matchMedia === 'function' ? window.matchMedia('(orientation: landscape)').matches : 'no-matchMedia',
                hasTg: !!tg,
                tgViewportH: tg?.viewportHeight,
                tgStableH: tg?.viewportStableHeight,
            });
        }

        if (Main.Orientation.active !== landscape) {
            Main.Orientation.active = landscape;
        }
    }

    /**
     * 检测软键盘是否大概率处于弹出状态
     *
     * 主信号：H5 层 focusin/focusout 驱动的 window.__TG_KEYBOARD_OPEN__ 标志（最可靠）
     * 阈值判断作为 fallback（非 TG 环境，或 TG 但 H5 还没设标志的边界情况）
     */
    private isKeyboardLikelyOpen(): boolean {
        // 主信号：TG 环境 focusin/focusout 驱动的全局标志（最可靠，不受机型/全屏状态/键盘高度影响）
        // 解决 iPad Air 等 TG 非全屏设备上 innerHeight/screen.height 阈值失效导致横屏遮罩误显示
        if ((window as any).__TG_KEYBOARD_OPEN__ === true) return true;
        // (a) visualViewport: 可视高度被压缩 25%+ (W3C 标准, 最准)
        const vv = (window as any).visualViewport;
        if (vv && window.innerHeight > 0 && vv.height / window.innerHeight < 0.75) {
            return true;
        }
        // (b) Telegram SDK: viewportHeight 比 stableHeight 小 50px+ (Telegram 专属最稳)
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.viewportHeight != null && tg.viewportStableHeight != null
            && tg.viewportStableHeight - tg.viewportHeight > 50) {
            return true;
        }
        // (c) screen 兜底: 窗口高度被压缩到屏幕高度的 75% 以下
        if (window.screen && window.screen.height > 0
            && window.innerHeight / window.screen.height < 0.75) {
            return true;
        }
        return false;
    }

    /**
     * 判断设备是否处于真实横屏状态 (不受软键盘影响)
     * 多策略 fallback
     */
    private isDeviceLandscape(): boolean {
        // (a) screen.orientation.angle (W3C 推荐, 不受键盘影响)
        const so = (screen as any).orientation;
        if (so && typeof so.angle === 'number') {
            return so.angle === 90 || so.angle === 270;
        }
        // (b) window.orientation（基于物理传感器，不受键盘弹出影响）⚠️ 必须在 matchMedia 之前
        //     matchMedia 基于 innerWidth/innerHeight，键盘弹出 innerHeight 变小时会误判 landscape
        //     window.orientation 基于设备陀螺仪/加速计，键盘弹出时保持不变（竖屏=0）
        const wo = (window as any).orientation;
        if (typeof wo === 'number') {
            return wo === 90 || wo === -90;
        }
        // (c) matchMedia 兜底（键盘弹出时可能误判，仅在前两者都不可用时使用）
        if (typeof window.matchMedia === 'function') {
            return window.matchMedia('(orientation: landscape)').matches;
        }
        return false;
    }
}
