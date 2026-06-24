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

        // 优先级最高: 软键盘弹出时强制隐藏遮罩,跳过方向判断
        // 解决 Telegram(iOS/Android) 中点击聊天输入框弹键盘导致误触发的问题
        if (this.isKeyboardLikelyOpen()) {
            if (Main.Orientation.active) Main.Orientation.active = false;
            return;
        }

        // 真实设备方向判断
        const landscape = this.isDeviceLandscape();
        if (Main.Orientation.active !== landscape) {
            Main.Orientation.active = landscape;
        }
    }

    /**
     * 检测软键盘是否大概率处于弹出状态
     * 多策略 fallback,任一命中即认为键盘弹出
     */
    private isKeyboardLikelyOpen(): boolean {
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
        // (c) screen 兜底: 窗口高度被压缩到屏幕高度的 60% 以下
        if (window.screen && window.screen.height > 0
            && window.innerHeight / window.screen.height < 0.6) {
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
        // (b) matchMedia (基于 CSS 媒体查询, 辅助信号)
        if (typeof window.matchMedia === 'function') {
            return window.matchMedia('(orientation: landscape)').matches;
        }
        // (c) window.orientation 兜底 (已废弃, 但比无强)
        const wo = (window as any).orientation;
        if (typeof wo === 'number') {
            return wo === 90 || wo === -90;
        }
        return false;
    }
}
