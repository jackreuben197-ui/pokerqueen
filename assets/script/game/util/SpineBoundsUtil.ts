/**
 * Spine 包围盒测量工具。
 *
 * 表情/动画显示前要按图形实际大小做归一化缩放与居中。可靠的量法是用【已激活的】
 * sp.Skeleton 组件：动态新增的组件要等下一帧才初始化，之后 `sk.update(dt)` 才会真正
 * 推进动画。因此调用方需先 `setAnimation`，再用 `scheduleOnce(cb, 0)` 延迟一帧，
 * 然后调用 sampleLiveBounds —— 在一个动画循环内多次推进并取最大包围盒。
 * （早期用脱离组件的独立骨骼 + anim.apply 量，多区域动画量不到，故弃用。）
 */
export interface SpineBounds {
    szX: number;
    szY: number;
    offX: number;
    offY: number;
    /** 较大边长度，0 表示量不到 */
    max: number;
}

/** 取动画循环时长（秒）；取不到返回 1 */
export function getAnimDuration(sk: sp.Skeleton, animName: string): number {
    try {
        const rd: any = (sk as any).skeletonData && (sk as any).skeletonData.getRuntimeData
            ? (sk as any).skeletonData.getRuntimeData() : null;
        const anim = rd && rd.findAnimation ? rd.findAnimation(animName) : null;
        if (anim && anim.duration > 0) return anim.duration;
    } catch (e) {}
    return 1;
}

/**
 * 在【已激活】的组件上，沿一个动画循环多次推进并采样包围盒，取最大。
 * 必须在组件激活后调用（setAnimation + 延迟一帧之后）。
 */
export function sampleLiveBounds(sk: sp.Skeleton, dur: number): SpineBounds {
    let szX = 0, szY = 0, offX = 0, offY = 0;
    try {
        const core: any = (sk as any)._skeleton;
        if (core && core.getBounds) {
            const mk = () => ({ x: 0, y: 0, set(a: number, b: number) { this.x = a; this.y = b; } });
            const steps = 16;
            const d = dur > 0 ? dur : 1;
            for (let s = 0; s <= steps; s++) {
                try {
                    if (s > 0) (sk as any).update(d / steps);
                    core.updateWorldTransform();
                    const off = mk(), sz = mk();
                    core.getBounds(off, sz, []);
                    if (sz.x > 0 && sz.y > 0 && sz.x * sz.y > szX * szY) {
                        szX = sz.x; szY = sz.y; offX = off.x; offY = off.y;
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
    return { szX, szY, offX, offY, max: Math.max(szX, szY) };
}
