import Main from '../../../../../Main';
import SceneManager from '../../../../../manager/SceneManager';
import { ResManager } from '../../../../../manager/ResManager';

const MAX_TRACKS = 8; // 最多同时显示 8 条弹幕
const TRACK_OFFSET_Y = 150; // 每条轨道向下偏移 150 像素
const TOP_OFFSET_RATIO = 0.2; // 第一条弹幕距屏幕顶部 20% 高度
const SPEED_MIN = 140; // 弹幕飞行速度下限（像素/秒）
const SPEED_MAX = 200; // 弹幕飞行速度上限（像素/秒）
const DANMU_ZINDEX = 9999; // 弹幕节点 zIndex，确保显示在 UIChatDlg 等同级 UI 之上
const PREFAB_BUNDLE = 'texas';
const PREFAB_PATH = 'prefab/ui/DanmuPanel';

/**
 * 弹幕管理器（多轨道并发版，对齐 Unity BaseGameplayChat 行为）：
 * - 最多 8 条弹幕同时飞行（8 条轨道，按 trackIdx 顺序分配）
 * - 每条弹幕都是 DanmuPanel.prefab 的独立实例
 * - 从屏幕右外侧飞入，匀速横穿屏幕，从屏幕左外侧消失
 * - 第 1 条位于屏幕顶部 20% 处，后续每条向下偏移 150px
 * - 速度在 140-200 px/s 之间随机
 * - 挂载到 Main.Board 层（与 UIChatDlg 同层）+ zIndex=9999，确保显示在 UIChatDlg 之上
 *
 * 调用方保持原 API：DanmuManager.Instance.playDanmu(`${name}: ${message}`)
 */
export default class DanmuManager {
    private static _instance: DanmuManager = null;
    private _prefab: cc.Prefab = null;
    private _prefabLoading: Promise<cc.Prefab> = null;
    private _tracks: cc.Node[] = new Array<cc.Node>(MAX_TRACKS).fill(null);
    private _queue: string[] = [];
    private _layerNode: cc.Node = null;
    private _legacyCleaned: boolean = false;

    static get Instance(): DanmuManager {
        if (!DanmuManager._instance) {
            DanmuManager._instance = new DanmuManager();
        }
        return DanmuManager._instance;
    }

    /** 播放弹幕：入队，立即尝试分配空闲轨道 */
    playDanmu(text: string): void {
        if (!text) return;
        this._queue.push(text);
        this._trySchedule();
    }

    /** 场景切换/退出时调用，清理所有正在飞行的弹幕 */
    clearAll(): void {
        for (let i = 0; i < MAX_TRACKS; i++) {
            const node = this._tracks[i];
            if (node && node.isValid) {
                cc.Tween.stopAllByTarget(node);
                node.destroy();
            }
            this._tracks[i] = null;
        }
        this._queue.length = 0;
        this._layerNode = null;
        this._legacyCleaned = false;
    }

    /** 尝试把队列中的弹幕调度到空闲轨道 */
    private _trySchedule(): void {
        while (this._queue.length > 0) {
            const trackIdx = this._findFreeTrack();
            if (trackIdx < 0) return; // 8 条轨道都占满，等动画完成时再触发
            const text = this._queue.shift();
            if (!this._prefab || !this._prefab.isValid) {
                // prefab 未就绪：文本放回队首，触发加载后再调度
                this._queue.unshift(text);
                this._ensurePrefab()
                    .then(() => this._trySchedule())
                    .catch(() => {
                        // 加载失败：丢弃队首，避免死循环
                        if (this._queue.length > 0) this._queue.shift();
                        this._trySchedule();
                    });
                return;
            }
            this._spawn(text, trackIdx);
        }
    }

    /** 找到第一个空闲轨道下标；全部占用时返回 -1 */
    private _findFreeTrack(): number {
        for (let i = 0; i < MAX_TRACKS; i++) {
            const n = this._tracks[i];
            if (!n || !n.isValid) {
                this._tracks[i] = null;
                return i;
            }
        }
        return -1;
    }

    private _ensurePrefab(): Promise<cc.Prefab> {
        if (this._prefab && this._prefab.isValid) return Promise.resolve(this._prefab);
        if (!this._prefabLoading) {
            this._prefabLoading = ResManager.GetOrLoad<cc.Prefab>(PREFAB_BUNDLE, PREFAB_PATH);
        }
        return this._prefabLoading.then(p => {
            this._prefab = p;
            return p;
        });
    }

    /**
     * 获取/缓存弹幕挂载层。
     * 优先使用 Main.Board（与 UIChatDlg 同层），让弹幕能显示在 UIChatDlg 之上；
     * Board 不可用时回退到场景 main 节点。
     */
    private _ensureLayer(): cc.Node {
        if (this._layerNode && this._layerNode.isValid) {
            return this._layerNode;
        }
        let layer: cc.Node = null;
        if (Main && Main.Board) {
            layer = Main.Board;
        } else {
            const sceneNode = SceneManager.Instance.currUI;
            if (!sceneNode) return null;
            layer = sceneNode.getChildByName('main') || sceneNode;
        }
        this._layerNode = layer;
        // 一次性销毁场景里遗留的旧 main/DanmuPanel 单节点
        // （它默认显示"Danmu Label"，且会被场景逻辑重新激活，仅 active=false 不够彻底）
        if (!this._legacyCleaned) {
            this._legacyCleaned = true;
            const sceneNode = SceneManager.Instance.currUI;
            const main = sceneNode && sceneNode.getChildByName('main');
            const legacy = main && main.getChildByName('DanmuPanel');
            if (legacy) legacy.destroy();
        }
        return layer;
    }

    /** 实例化 prefab，设置文本/位置，启动飞行动画 */
    private _spawn(text: string, trackIdx: number): void {
        const layer = this._ensureLayer();
        if (!layer || !this._prefab) return;

        const node = cc.instantiate(this._prefab);
        node.name = 'DanmuItem_' + trackIdx;
        node.parent = layer;
        node.zIndex = DANMU_ZINDEX;

        // 文本（外部已按 `${name}: ${message}` 拼好）
        const label = node.getChildByName('DanmuLabel')?.getComponent(cc.Label);
        if (label) label.string = text;

        // 飞行轨迹（世界坐标系，原点在屏幕左下角）
        const screenSize = cc.view.getVisibleSize();
        const nodeWidth = node.width || 0;
        const worldStartX = screenSize.width + nodeWidth / 2;                                              // 屏幕右外
        const worldEndX = -nodeWidth / 2;                                                                  // 屏幕左外
        const worldY = screenSize.height - screenSize.height * TOP_OFFSET_RATIO - trackIdx * TRACK_OFFSET_Y;  // 距屏幕顶部 20%

        // 转换为 layer 本地坐标
        const localStart = layer.convertToNodeSpaceAR(cc.v2(worldStartX, worldY));
        const localEnd = layer.convertToNodeSpaceAR(cc.v2(worldEndX, worldY));
        node.x = localStart.x;
        node.y = localStart.y;

        // 占用轨道
        this._tracks[trackIdx] = node;

        // 随机速度 140-200 px/s，让多条弹幕飞行速度有差异更自然
        const distance = Math.abs(localStart.x - localEnd.x);
        const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
        const duration = distance / speed;

        // 匀速直线飞行，完成后销毁节点 + 释放轨道 + 尝试调度下一条
        cc.tween(node)
            .to(duration, { x: localEnd.x })
            .call(() => {
                if (cc.isValid(node)) node.destroy();
                if (this._tracks[trackIdx] === node) this._tracks[trackIdx] = null;
                this._trySchedule();
            })
            .start();
    }
}
